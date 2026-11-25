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

// 0. Auto-Capture Telegram chat_join_request:
// Request pending rahegi - bot na toh approve karega na wait karega.
// Request chali gayi matlab user verified hai!
if (typeof tgUpdate !== "undefined" && tgUpdate && tgUpdate.chat_join_request) {
  var joinReq = tgUpdate.chat_join_request;
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
    options: { message: message }
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

var req = (typeof request !== "undefined" && request) ? request : ((typeof tgUpdate !== "undefined" && tgUpdate && tgUpdate.message) ? tgUpdate.message : null);

// 3. CHAT SHARED (Channels & Groups)
if (req && req.chat_shared) {
  var cs = req.chat_shared;
  var targetCid = cs.chat_id;
  var title = cs.title || ("Chat " + targetCid);
  var username = cs.username;
  var reqId = cs.request_id;

  var typeLabels = {
    1: "📢 My Channel (Owner)",
    2: "📢 Admin Channel",
    3: "📢 Channel",
    4: "👥 Group",
    7: "👥 My Group (Owner)",
    8: "👥 Admin Group"
  };
  var typeLabel = typeLabels[reqId] || "💬 Chat";

  var lines = [
    "<b>" + escapeHtml(title) + "</b>",
    "🆔 Chat ID: <code>" + targetCid + "</code>"
  ];
  if (username) {
    lines.push("🔗 Username: @" + escapeHtml(username));
  }
  lines.push("📌 Type: " + typeLabel);

  Api.sendMessage({
    chat_id: chatId,
    text: lines.join("\n"),
    parse_mode: "html"
  });
  return;
}

// 4. USERS SHARED (User & Bot)
if (req && req.users_shared) {
  var us = req.users_shared;
  var isBot = (us.request_id === 6);
  var usersList = us.users || [];

  for (var i = 0; i < usersList.length; i++) {
    var sharedU = usersList[i];
    var uid = sharedU.user_id;
    var uname = sharedU.first_name || "";
    if (sharedU.last_name) {
      uname = (uname + " " + sharedU.last_name).trim();
    }
    if (!uname) {
      uname = "User " + uid;
    }
    var uUsername = sharedU.username;
    var typeStr = isBot ? "🤖 Bot" : "👤 User";

    var linesU = [
      "<b>" + escapeHtml(uname) + "</b>",
      "🆔 ID: <code>" + uid + "</code>"
    ];
    if (uUsername) {
      linesU.push("🔗 Username: @" + escapeHtml(uUsername));
    }
    linesU.push("📌 Type: " + typeStr);

    Api.sendMessage({
      chat_id: chatId,
      text: linesU.join("\n"),
      parse_mode: "html"
    });
  }
  return;
}

// Fallback: older single user_shared
if (req && req.user_shared) {
  var oldUs = req.user_shared;
  var oldUid = oldUs.user_id;
  var oldIsBot = (oldUs.request_id === 6);
  var oldTypeStr = oldIsBot ? "🤖 Bot" : "👤 User";

  var oldLines = [
    "<b>Shared User</b>",
    "🆔 ID: <code>" + oldUid + "</code>",
    "📌 Type: " + oldTypeStr
  ];
  Api.sendMessage({
    chat_id: chatId,
    text: oldLines.join("\n"),
    parse_mode: "html"
  });
  return;
}

// 5. FORWARDED MESSAGES
if (req && (req.forward_from_chat || req.forward_from || req.forward_sender_name)) {
  if (req.forward_from_chat) {
    var fc = req.forward_from_chat;
    var fTitle = fc.title || "Channel / Group";
    var fType = fc.type ? (fc.type.charAt(0).toUpperCase() + fc.type.slice(1)) : "Chat";
    var fLines = [
      "📢 <b>" + escapeHtml(fTitle) + "</b>",
      "🆔 Chat ID: <code>" + fc.id + "</code>"
    ];
    if (fc.username) {
      fLines.push("🔗 Username: @" + escapeHtml(fc.username));
    }
    fLines.push("📌 Type: " + fType);

    Api.sendMessage({
      chat_id: chatId,
      text: fLines.join("\n"),
      parse_mode: "html"
    });
    return;
  }

  if (req.forward_from) {
    var fu = req.forward_from;
    var fuName = fu.first_name || "User";
    if (fu.last_name) {
      fuName = (fuName + " " + fu.last_name).trim();
    }
    var fuType = fu.is_bot ? "🤖 Bot" : "👤 User";
    var fuLines = [
      "👤 <b>" + escapeHtml(fuName) + "</b>",
      "🆔 User ID: <code>" + fu.id + "</code>"
    ];
    if (fu.username) {
      fuLines.push("🔗 Username: @" + escapeHtml(fu.username));
    }
    fuLines.push("📌 Type: " + fuType);

    Api.sendMessage({
      chat_id: chatId,
      text: fuLines.join("\n"),
      parse_mode: "html"
    });
    return;
  }

  if (req.forward_sender_name) {
    Api.sendMessage({
      chat_id: chatId,
      text: "👤 <b>" + escapeHtml(req.forward_sender_name) + "</b>\n⚠️ <i>User privacy settings hide their Telegram ID in forwards.</i>",
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
var normText = "<b>" + escapeHtml(senderName) + "</b>\n" +
               "🆔 Chat ID: <code>" + chatId + "</code>\n" +
               "👤 User ID: <code>" + senderU.telegramid + "</code>";
if (senderU.username) {
  normText += "\n🔗 Username: @" + escapeHtml(senderU.username);
}

Api.sendMessage({
  chat_id: chatId,
  text: normText,
  parse_mode: "html",
  reply_markup: getMainKeyboard()
});
