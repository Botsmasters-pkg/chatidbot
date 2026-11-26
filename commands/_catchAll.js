/*CMD
  command: *
  help: Catch-all handler for chat_shared, users_shared, forwards, text and admin inputs
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getMainKeyboard() {
  return {
    keyboard: [
      [
        {
          text: "My channels",
          request_chat: {
            request_id: 1,
            chat_is_channel: true,
            chat_is_created: true,
            request_title: true,
            request_username: true
          }
        },
        {
          text: "Admin channels",
          request_chat: {
            request_id: 2,
            chat_is_channel: true,
            user_administrator_rights: {
              is_anonymous: false,
              can_manage_chat: false,
              can_delete_messages: false,
              can_manage_video_chats: false,
              can_restrict_members: false,
              can_promote_members: false,
              can_change_info: false,
              can_invite_users: false,
              can_post_messages: true
            },
            request_title: true,
            request_username: true
          }
        }
      ],
      [
        {
          text: "Channel",
          request_chat: {
            request_id: 3,
            chat_is_channel: true,
            request_title: true,
            request_username: true
          }
        },
        {
          text: "Group",
          request_chat: {
            request_id: 4,
            chat_is_channel: false,
            request_title: true,
            request_username: true
          }
        }
      ],
      [
        {
          text: "User",
          request_users: {
            request_id: 5,
            user_is_bot: false,
            request_name: true,
            request_username: true
          }
        },
        {
          text: "Bot",
          request_users: {
            request_id: 6,
            user_is_bot: true,
            request_name: true,
            request_username: true
          }
        }
      ],
      [
        {
          text: "My groups",
          request_chat: {
            request_id: 7,
            chat_is_channel: false,
            chat_is_created: true,
            request_title: true,
            request_username: true
          }
        },
        {
          text: "Admin groups",
          request_chat: {
            request_id: 8,
            chat_is_channel: false,
            user_administrator_rights: {
              is_anonymous: false,
              can_manage_chat: true,
              can_delete_messages: false,
              can_manage_video_chats: false,
              can_restrict_members: false,
              can_promote_members: false,
              can_change_info: false,
              can_invite_users: false
            },
            request_title: true,
            request_username: true
          }
        }
      ]
    ],
    resize_keyboard: true
  };
}

function parseSafe(val) {
  if (!val) return null;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch (e) {
      return null;
    }
  }
  return null;
}

var upd = parseSafe(typeof tgUpdate !== "undefined" ? tgUpdate : null);
var req = parseSafe(typeof request !== "undefined" ? request : null);
var opt = parseSafe(typeof options !== "undefined" ? options : null);
var cnt = parseSafe(typeof content !== "undefined" ? content : null);

// 0. Auto-Capture Telegram chat_join_request:
// Request pending rahegi - bot na toh approve karega na wait karega.
// Request chali gayi matlab user verified hai!
var joinReq = (upd && upd.chat_join_request) || (req && req.chat_join_request);
if (joinReq) {
  var fromUser = joinReq.from;
  var targetChat = joinReq.chat;
  if (fromUser && targetChat) {
    User.setProperty("fsub_requested_" + targetChat.id, true, "boolean");
    // NO Api.approveChatJoinRequest - request remains pending in channel!
  }
  return;
}

var ADMIN_ID = "8710308658";
var userId = user ? user.telegramid : null;
var chatId = (chat && chat.chatid) ? chat.chatid : userId;
if (!chatId) return;

// 1. Check if user is waiting to send clone email for /41
if (userId && Bot.getProperty("waiting_clone_email_" + userId)) {
  var isEmail = message && message.indexOf("@") !== -1 && message.indexOf(".") !== -1;
  if (isEmail) {
    Bot.run({
      command: "/41",
      options: { email: message.trim() }
    });
    return;
  }
}

// 2. Check if admin is currently in an interactive input step
var adminStep = User.getProperty("admin_step");
if (String(userId) === ADMIN_ID && adminStep) {
  Bot.run({
    command: "/handle_admin_input",
    options: { text: message }
  });
  return;
}

// Ignore known commands to prevent duplicate processing
if (message) {
  var m = message.trim();
  if (
    m === "/start" || m === "/id" || m === "/help" ||
    m === "/41" || m === "41" || m === "/clone" || m === "clone" ||
    m.indexOf("/41 ") === 0 || m.indexOf("41 ") === 0 ||
    m === "/admin" || m === "admin" || m === "/cancel" || m === "cancel" ||
    m === "/menu_admin_panel" || m === "menu_admin_panel"
  ) {
    return;
  }
}

// Find message object from all possible envelopes
var msgObj = (upd && upd.message) || (req && req.message) || req || upd || opt || cnt || null;

// 3. CHAT SHARED (Channels & Groups from 8-button menu)
var chatShared = null;
if (upd && upd.message && upd.message.chat_shared) {
  chatShared = upd.message.chat_shared;
} else if (req && req.message && req.message.chat_shared) {
  chatShared = req.message.chat_shared;
} else if (req && req.chat_shared) {
  chatShared = req.chat_shared;
} else if (upd && upd.chat_shared) {
  chatShared = upd.chat_shared;
} else if (opt && opt.chat_shared) {
  chatShared = opt.chat_shared;
} else if (msgObj && msgObj.chat_shared) {
  chatShared = msgObj.chat_shared;
}

if (chatShared && (chatShared.chat_id !== undefined && chatShared.chat_id !== null)) {
  var targetCid = chatShared.chat_id;
  var title = chatShared.title || "";
  var username = chatShared.username || "";
  var reqId = chatShared.request_id;

  var typeLabels = {
    1: "My Channel (Owner)",
    2: "Admin Channel",
    3: "Channel",
    4: "Group",
    7: "My Group (Owner)",
    8: "Admin Group"
  };
  var typeLabel = typeLabels[reqId] || (String(targetCid).indexOf("-100") === 0 ? "Channel" : "Group");

  var lines = [];
  if (title) {
    lines.push("📢 <b>Chat Name:</b> " + escapeHtml(title));
  } else {
    lines.push("📢 <b>Chat Name:</b> " + typeLabel);
  }
  lines.push("🆔 <b>Chat ID:</b> <code>" + targetCid + "</code>");
  if (username) {
    lines.push("🔗 <b>Username:</b> @" + escapeHtml(username));
  }
  lines.push("📌 <b>Type:</b> " + typeLabel);

  Api.sendMessage({
    chat_id: chatId,
    text: lines.join("\n"),
    parse_mode: "html"
  });
  return;
}

// 4. USERS SHARED (User & Bot from 8-button menu)
var usersShared = null;
if (upd && upd.message && upd.message.users_shared) {
  usersShared = upd.message.users_shared;
} else if (req && req.message && req.message.users_shared) {
  usersShared = req.message.users_shared;
} else if (req && req.users_shared) {
  usersShared = req.users_shared;
} else if (upd && upd.users_shared) {
  usersShared = upd.users_shared;
} else if (opt && opt.users_shared) {
  usersShared = opt.users_shared;
} else if (msgObj && msgObj.users_shared) {
  usersShared = msgObj.users_shared;
}

if (usersShared) {
  var reqIdU = usersShared.request_id;
  var isBot = (reqIdU === 6);
  var usersList = usersShared.users || [];

  for (var i = 0; i < usersList.length; i++) {
    var sharedU = usersList[i];
    var uid = sharedU.user_id;
    var uname = sharedU.first_name || "";
    if (sharedU.last_name) {
      uname = (uname + " " + sharedU.last_name).trim();
    }
    if (!uname) {
      uname = isBot ? ("Bot " + uid) : ("User " + uid);
    }
    var uUsername = sharedU.username;
    var linesU = [
      (isBot ? "🤖" : "👤") + " <b>Name:</b> " + escapeHtml(uname),
      "🆔 <b>" + (isBot ? "Bot ID:" : "User ID:") + "</b> <code>" + uid + "</code>"
    ];
    if (uUsername) {
      linesU.push("🔗 <b>Username:</b> @" + escapeHtml(uUsername));
    }
    linesU.push("📌 <b>Type:</b> " + (isBot ? "Bot" : "User"));

    Api.sendMessage({
      chat_id: chatId,
      text: linesU.join("\n"),
      parse_mode: "html"
    });
  }
  return;
}

// Fallback: older single user_shared
var userShared = null;
if (upd && upd.message && upd.message.user_shared) {
  userShared = upd.message.user_shared;
} else if (req && req.message && req.message.user_shared) {
  userShared = req.message.user_shared;
} else if (req && req.user_shared) {
  userShared = req.user_shared;
} else if (upd && upd.user_shared) {
  userShared = upd.user_shared;
} else if (opt && opt.user_shared) {
  userShared = opt.user_shared;
} else if (msgObj && msgObj.user_shared) {
  userShared = msgObj.user_shared;
}

if (userShared && (userShared.user_id !== undefined && userShared.user_id !== null)) {
  var oldUid = userShared.user_id;
  var oldIsBot = (userShared.request_id === 6);
  var oldTypeStr = oldIsBot ? "Bot" : "User";

  var oldLines = [
    (oldIsBot ? "🤖" : "👤") + " <b>Name:</b> " + oldTypeStr + " " + oldUid,
    "🆔 <b>" + (oldIsBot ? "Bot ID:" : "User ID:") + "</b> <code>" + oldUid + "</code>",
    "📌 <b>Type:</b> " + oldTypeStr
  ];
  Api.sendMessage({
    chat_id: chatId,
    text: oldLines.join("\n"),
    parse_mode: "html"
  });
  return;
}

// 5. FORWARDED MESSAGES
var forwardFromChat = (upd && upd.message && upd.message.forward_from_chat) ||
                      (req && req.message && req.message.forward_from_chat) ||
                      (req && req.forward_from_chat) ||
                      (upd && upd.forward_from_chat) ||
                      (msgObj && msgObj.forward_from_chat);

var forwardFrom = (upd && upd.message && upd.message.forward_from) ||
                  (req && req.message && req.message.forward_from) ||
                  (req && req.forward_from) ||
                  (upd && upd.forward_from) ||
                  (msgObj && msgObj.forward_from);

var forwardSenderName = (upd && upd.message && upd.message.forward_sender_name) ||
                        (req && req.message && req.message.forward_sender_name) ||
                        (req && req.forward_sender_name) ||
                        (upd && upd.forward_sender_name) ||
                        (msgObj && msgObj.forward_sender_name);

if (forwardFromChat || forwardFrom || forwardSenderName) {
  if (forwardFromChat) {
    var fTitle = forwardFromChat.title || "Channel / Group";
    var fType = forwardFromChat.type ? (forwardFromChat.type.charAt(0).toUpperCase() + forwardFromChat.type.slice(1)) : "Chat";
    var fLines = [
      "📢 <b>Chat Name:</b> " + escapeHtml(fTitle),
      "🆔 <b>Chat ID:</b> <code>" + forwardFromChat.id + "</code>"
    ];
    if (forwardFromChat.username) {
      fLines.push("🔗 <b>Username:</b> @" + escapeHtml(forwardFromChat.username));
    }
    fLines.push("📌 <b>Type:</b> " + fType);

    Api.sendMessage({
      chat_id: chatId,
      text: fLines.join("\n"),
      parse_mode: "html"
    });
    return;
  }

  if (forwardFrom) {
    var fuName = forwardFrom.first_name || "User";
    if (forwardFrom.last_name) {
      fuName = (fuName + " " + forwardFrom.last_name).trim();
    }
    var fuUsernameStr = forwardFrom.username ? ("@" + escapeHtml(forwardFrom.username)) : "N/A";
    var fuIsBot = forwardFrom.is_bot ? true : false;
    var fuLines = [
      (fuIsBot ? "🤖" : "👤") + " <b>Name:</b> " + escapeHtml(fuName),
      "🆔 <b>" + (fuIsBot ? "Bot ID:" : "User ID:") + "</b> <code>" + forwardFrom.id + "</code>",
      "🔗 <b>Username:</b> " + fuUsernameStr,
      "📌 <b>Type:</b> " + (fuIsBot ? "Bot" : "User")
    ];

    Api.sendMessage({
      chat_id: chatId,
      text: fuLines.join("\n"),
      parse_mode: "html"
    });
    return;
  }

  if (forwardSenderName) {
    Api.sendMessage({
      chat_id: chatId,
      text: "👤 <b>" + escapeHtml(forwardSenderName) + "</b>\n⚠️ <i>User privacy settings hide their Telegram ID in forwards.</i>",
      parse_mode: "html"
    });
    return;
  }
}

// 6. REGULAR TEXT / OTHER MESSAGES (Show user ID + Keyboard)
var senderU = user || {};
var senderName = senderU.first_name || "User";
if (senderU.last_name) {
  senderName = (senderName + " " + senderU.last_name).trim();
}
var normText = "Your ID: <code>" + chatId + "</code>\n" +
               "Your Name: " + escapeHtml(senderName) + "\n" +
               "Your Username: @" + (senderU.username ? escapeHtml(senderU.username) : "N/A");

Api.sendMessage({
  chat_id: chatId,
  text: normText,
  parse_mode: "html",
  reply_markup: getMainKeyboard()
});
