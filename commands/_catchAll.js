/*CMD
  command: *
  help: Catch-all handler for chat_shared, users_shared, media inspector, forwards, text and admin inputs
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

function estimateAccountAge(id) {
  var num = parseInt(id, 10);
  if (!num || isNaN(num) || num < 0) return "N/A";
  if (num < 50000000) return "~2013-2014 (OG)";
  if (num < 150000000) return "~2015";
  if (num < 300000000) return "~2016";
  if (num < 500000000) return "~2017";
  if (num < 750000000) return "~2018";
  if (num < 1000000000) return "~2019";
  if (num < 1500000000) return "~2020";
  if (num < 2200000000) return "~2021";
  if (num < 5500000000) return "~2022";
  if (num < 6800000000) return "~2023";
  if (num < 7800000000) return "~2024";
  if (num < 8500000000) return "~2025";
  return "~2026+";
}

function getDcFromFileId(fid) {
  if (!fid || typeof fid !== "string" || fid.length < 8) return null;
  function getVal(ch) {
    var c = ch.charCodeAt(0);
    if (c >= 65 && c <= 90) return c - 65;
    if (c >= 97 && c <= 122) return c - 97 + 26;
    if (c >= 48 && c <= 57) return c - 48 + 52;
    if (ch === "+" || ch === "-") return 62;
    if (ch === "/" || ch === "_") return 63;
    return -1;
  }
  var c5 = getVal(fid.charAt(5));
  var c6 = getVal(fid.charAt(6));
  if (c5 === -1 || c6 === -1) return null;
  var dc = ((c5 & 15) << 4) | (c6 >> 2);
  return (dc >= 1 && dc <= 5) ? dc : null;
}

function getDcInfo(dc) {
  var dcs = {
    1: "DC 1 (Miami, USA 🇺🇸)",
    2: "DC 2 (Amsterdam, NL 🇳🇱)",
    3: "DC 3 (Miami, USA 🇺🇸)",
    4: "DC 4 (Amsterdam, NL 🇳🇱)",
    5: "DC 5 (Singapore 🇸🇬 / Asia)"
  };
  return dcs[dc] || ("DC " + dc);
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
    m === "/check_sub" || m === "check_sub" || m === "/admin_vip"
  ) {
    return;
  }
}

var req = (typeof request !== "undefined" && request) ? request : {};

// 3. CHAT SHARED (Channels & Groups from 8-button menu)
if (req && req.chat_shared) {
  var cs = req.chat_shared;
  var targetCid = cs.chat_id;
  var title = cs.title || "Selected Chat";
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
    "📢 <b>" + escapeHtml(title) + "</b>",
    "🆔 <b>Chat ID:</b> <code>" + targetCid + "</code>"
  ];
  if (username) {
    lines.push("🔗 <b>Username:</b> @" + escapeHtml(username));
  }
  lines.push("📌 <b>Type:</b> " + typeLabel);

  Api.sendMessage({
    chat_id: chatId,
    text: lines.join("\n"),
    parse_mode: "html",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "📋 Copy Chat ID", copy_text: { text: String(targetCid) } },
          { text: "🔗 Share Chat", url: "https://t.me/share/url?url=" + encodeURIComponent("Chat ID: " + targetCid) }
        ]
      ]
    }
  });
  return;
}

// 4. USERS SHARED (User & Bot from 8-button menu)
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
      uname = isBot ? "Bot " + uid : "User " + uid;
    }
    var uUsername = sharedU.username ? ("@" + escapeHtml(sharedU.username)) : "N/A";

    var linesU = [
      "Your ID: <code>" + uid + "</code>",
      "Your Name: " + escapeHtml(uname),
      "Your Username: " + uUsername,
      "",
      "✨ <b>Premium Details:</b>",
      "📅 <b>Estimated Age:</b> " + estimateAccountAge(uid),
      "📌 <b>Type:</b> " + (isBot ? "🤖 Bot" : "👤 User"),
      "🔗 <b>Permalink:</b> <a href=\"tg://user?id=" + uid + "\">Open Profile</a>"
    ];

    Api.sendMessage({
      chat_id: chatId,
      text: linesU.join("\n"),
      parse_mode: "html",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📋 Copy ID", copy_text: { text: String(uid) } },
            { text: "🔗 Share Profile", url: "https://t.me/share/url?url=" + encodeURIComponent("User ID: " + uid) }
          ]
        ]
      }
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
    "Your ID: <code>" + oldUid + "</code>",
    "📌 <b>Type:</b> " + oldTypeStr,
    "📅 <b>Estimated Age:</b> " + estimateAccountAge(oldUid),
    "🔗 <b>Permalink:</b> <a href=\"tg://user?id=" + oldUid + "\">Open Profile</a>"
  ];
  Api.sendMessage({
    chat_id: chatId,
    text: oldLines.join("\n"),
    parse_mode: "html",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "📋 Copy ID", copy_text: { text: String(oldUid) } }
        ]
      ]
    }
  });
  return;
}

// 5. DEVELOPER & MEDIA INSPECTOR (Stickers, Photos, Videos, Documents, Audio, Voice, GIF)
if (req && (req.sticker || req.photo || req.video || req.video_note || req.animation || req.audio || req.voice || req.document)) {
  
  // A. STICKER
  if (req.sticker) {
    var st = req.sticker;
    var stFid = st.file_id;
    var stDc = getDcFromFileId(stFid);
    if (stDc) User.setProperty("dc_id", stDc, "integer");

    var stText = "🎭 <b>Sticker Inspector</b>\n\n" +
                 "🆔 <b>File ID:</b>\n<code>" + stFid + "</code>\n\n" +
                 "🔑 <b>Unique ID:</b> <code>" + st.file_unique_id + "</code>\n" +
                 "🏷️ <b>Emoji:</b> " + (st.emoji || "🎭") + "\n" +
                 "📦 <b>Sticker Set:</b> " + (st.set_name ? ("@" + escapeHtml(st.set_name)) : "None") + "\n" +
                 "⚡ <b>Animated:</b> " + (st.is_animated ? "Yes (Lottie)" : (st.is_video ? "Yes (Video)" : "No (Static)")) + "\n" +
                 "🌐 <b>Data Center:</b> " + (stDc ? getDcInfo(stDc) : "DC 5 (Singapore)");

    Api.sendMessage({
      chat_id: chatId,
      text: stText,
      parse_mode: "html",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📋 Copy File ID", copy_text: { text: stFid } },
            { text: "🔗 Share File ID", url: "https://t.me/share/url?url=" + encodeURIComponent("Sticker File ID: " + stFid) }
          ]
        ]
      }
    });
    return;
  }

  // B. PHOTO
  if (req.photo && req.photo.length > 0) {
    var photos = req.photo;
    var ph = photos[photos.length - 1]; // Max resolution
    var phFid = ph.file_id;
    var phDc = getDcFromFileId(phFid);
    if (phDc) User.setProperty("dc_id", phDc, "integer");
    var phSizeKb = ph.file_size ? (ph.file_size / 1024).toFixed(1) : "N/A";

    var phText = "📸 <b>Photo Inspector</b>\n\n" +
                 "🆔 <b>File ID:</b>\n<code>" + phFid + "</code>\n\n" +
                 "🔑 <b>Unique ID:</b> <code>" + ph.file_unique_id + "</code>\n" +
                 "📐 <b>Resolution:</b> " + ph.width + "x" + ph.height + " px\n" +
                 "📦 <b>File Size:</b> " + phSizeKb + " KB\n" +
                 "🌐 <b>Data Center:</b> " + (phDc ? getDcInfo(phDc) : "DC 5 (Singapore)");

    Api.sendMessage({
      chat_id: chatId,
      text: phText,
      parse_mode: "html",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📋 Copy File ID", copy_text: { text: phFid } },
            { text: "🔗 Share File ID", url: "https://t.me/share/url?url=" + encodeURIComponent("Photo File ID: " + phFid) }
          ]
        ]
      }
    });
    return;
  }

  // C. VIDEO & VIDEO NOTE
  if (req.video || req.video_note) {
    var vid = req.video || req.video_note;
    var vidFid = vid.file_id;
    var vidDc = getDcFromFileId(vidFid);
    if (vidDc) User.setProperty("dc_id", vidDc, "integer");
    var vidSizeMb = vid.file_size ? (vid.file_size / (1024 * 1024)).toFixed(2) : "N/A";

    var vidText = "🎥 <b>Video Inspector</b>\n\n" +
                  "🆔 <b>File ID:</b>\n<code>" + vidFid + "</code>\n\n" +
                  "🔑 <b>Unique ID:</b> <code>" + vid.file_unique_id + "</code>\n" +
                  "⏱️ <b>Duration:</b> " + (vid.duration || 0) + "s\n" +
                  "📐 <b>Resolution:</b> " + (vid.width || "N/A") + "x" + (vid.height || "N/A") + " px\n" +
                  "📦 <b>File Size:</b> " + vidSizeMb + " MB\n" +
                  "🌐 <b>Data Center:</b> " + (vidDc ? getDcInfo(vidDc) : "DC 5 (Singapore)");

    Api.sendMessage({
      chat_id: chatId,
      text: vidText,
      parse_mode: "html",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📋 Copy File ID", copy_text: { text: vidFid } },
            { text: "🔗 Share File ID", url: "https://t.me/share/url?url=" + encodeURIComponent("Video File ID: " + vidFid) }
          ]
        ]
      }
    });
    return;
  }

  // D. AUDIO & VOICE
  if (req.audio || req.voice) {
    var aud = req.audio || req.voice;
    var audFid = aud.file_id;
    var audDc = getDcFromFileId(audFid);
    if (audDc) User.setProperty("dc_id", audDc, "integer");
    var audSizeKb = aud.file_size ? (aud.file_size / 1024).toFixed(1) : "N/A";

    var audText = "🎵 <b>Audio / Voice Inspector</b>\n\n" +
                  "🆔 <b>File ID:</b>\n<code>" + audFid + "</code>\n\n" +
                  "🔑 <b>Unique ID:</b> <code>" + aud.file_unique_id + "</code>\n" +
                  "⏱️ <b>Duration:</b> " + (aud.duration || 0) + "s\n" +
                  (aud.title ? ("🏷️ <b>Title:</b> " + escapeHtml(aud.title) + "\n") : "") +
                  (aud.performer ? ("🎤 <b>Performer:</b> " + escapeHtml(aud.performer) + "\n") : "") +
                  "📦 <b>File Size:</b> " + audSizeKb + " KB\n" +
                  "🌐 <b>Data Center:</b> " + (audDc ? getDcInfo(audDc) : "DC 5 (Singapore)");

    Api.sendMessage({
      chat_id: chatId,
      text: audText,
      parse_mode: "html",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📋 Copy File ID", copy_text: { text: audFid } },
            { text: "🔗 Share File ID", url: "https://t.me/share/url?url=" + encodeURIComponent("Audio File ID: " + audFid) }
          ]
        ]
      }
    });
    return;
  }

  // E. DOCUMENT / FILE
  if (req.document) {
    var doc = req.document;
    var docFid = doc.file_id;
    var docDc = getDcFromFileId(docFid);
    if (docDc) User.setProperty("dc_id", docDc, "integer");
    var docSizeKb = doc.file_size ? (doc.file_size / 1024).toFixed(1) : "N/A";

    var docText = "📄 <b>Document Inspector</b>\n\n" +
                  "🆔 <b>File ID:</b>\n<code>" + docFid + "</code>\n\n" +
                  "🔑 <b>Unique ID:</b> <code>" + doc.file_unique_id + "</code>\n" +
                  "📁 <b>File Name:</b> " + (doc.file_name ? escapeHtml(doc.file_name) : "Unnamed") + "\n" +
                  "📑 <b>Mime Type:</b> " + (doc.mime_type || "N/A") + "\n" +
                  "📦 <b>File Size:</b> " + docSizeKb + " KB\n" +
                  "🌐 <b>Data Center:</b> " + (docDc ? getDcInfo(docDc) : "DC 5 (Singapore)");

    Api.sendMessage({
      chat_id: chatId,
      text: docText,
      parse_mode: "html",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📋 Copy File ID", copy_text: { text: docFid } },
            { text: "🔗 Share File ID", url: "https://t.me/share/url?url=" + encodeURIComponent("File ID: " + docFid) }
          ]
        ]
      }
    });
    return;
  }
}

// 6. FORWARDED MESSAGES
if (req && (req.forward_from_chat || req.forward_from || req.forward_sender_name)) {
  if (req.forward_from_chat) {
    var fc = req.forward_from_chat;
    var fTitle = fc.title || "Channel / Group";
    var fType = fc.type ? (fc.type.charAt(0).toUpperCase() + fc.type.slice(1)) : "Chat";
    var fLines = [
      "📢 <b>" + escapeHtml(fTitle) + "</b>",
      "🆔 <b>Chat ID:</b> <code>" + fc.id + "</code>"
    ];
    if (fc.username) {
      fLines.push("🔗 <b>Username:</b> @" + escapeHtml(fc.username));
    }
    fLines.push("📌 <b>Type:</b> " + fType);

    Api.sendMessage({
      chat_id: chatId,
      text: fLines.join("\n"),
      parse_mode: "html",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📋 Copy Chat ID", copy_text: { text: String(fc.id) } },
            { text: "🔗 Share Chat", url: "https://t.me/share/url?url=" + encodeURIComponent("Chat ID: " + fc.id) }
          ]
        ]
      }
    });
    return;
  }

  if (req.forward_from) {
    var fu = req.forward_from;
    var fuName = fu.first_name || "User";
    if (fu.last_name) {
      fuName = (fuName + " " + fu.last_name).trim();
    }
    var fuUsernameStr = fu.username ? ("@" + escapeHtml(fu.username)) : "N/A";
    var fuPrem = fu.is_premium ? "Yes (Active ⭐)" : "No";

    var fuLines = [
      "Your ID: <code>" + fu.id + "</code>",
      "Your Name: " + escapeHtml(fuName),
      "Your Username: " + fuUsernameStr,
      "",
      "✨ <b>Premium Details:</b>",
      "⭐ <b>Telegram Premium:</b> " + fuPrem,
      "📅 <b>Estimated Age:</b> " + estimateAccountAge(fu.id),
      "📌 <b>Type:</b> " + (fu.is_bot ? "🤖 Bot" : "👤 User"),
      "🔗 <b>Permalink:</b> <a href=\"tg://user?id=" + fu.id + "\">Open Profile</a>"
    ];

    Api.sendMessage({
      chat_id: chatId,
      text: fuLines.join("\n"),
      parse_mode: "html",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📋 Copy ID", copy_text: { text: String(fu.id) } },
            { text: "🔗 Share Profile", url: "https://t.me/share/url?url=" + encodeURIComponent("User ID: " + fu.id) }
          ]
        ]
      }
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

// 7. REGULAR TEXT / OTHER MESSAGES (Show User ID & Premium Card + 1-Tap Copy)
var senderU = user || {};
var senderName = senderU.first_name || "User";
if (senderU.last_name) {
  senderName = (senderName + " " + senderU.last_name).trim();
}
var isPrem = (senderU.is_premium || (req.from && req.from.is_premium)) ? true : false;
var userDc = User.getProperty("dc_id");
var dcText = userDc ? getDcInfo(userDc) : "DC 5 (Singapore / Asia)";
var isVip = Bot.getProperty("vip_" + chatId);
var isOwner = (String(chatId) === ADMIN_ID);
var statusStr = isOwner ? "Master Admin ⚡" : (isVip ? "VIP Member 💎" : "Free User");

var normText = "Your ID: <code>" + chatId + "</code>\n" +
               "Your Name: " + escapeHtml(senderName) + "\n" +
               "Your Username: @" + (senderU.username ? escapeHtml(senderU.username) : "N/A") + "\n\n" +
               "✨ <b>Premium Details:</b>\n" +
               "⭐ <b>Telegram Premium:</b> " + (isPrem ? "Yes (Active ⭐)" : "No") + "\n" +
               "📅 <b>Estimated Age:</b> " + estimateAccountAge(chatId) + "\n" +
               "🌐 <b>Data Center:</b> " + dcText + "\n" +
               "👑 <b>Bot Status:</b> " + statusStr + "\n" +
               "🔗 <b>Permalink:</b> <a href=\"tg://user?id=" + chatId + "\">Open Profile</a>";

Api.sendMessage({
  chat_id: chatId,
  text: normText,
  parse_mode: "html",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "📋 Copy ID", copy_text: { text: String(chatId) } },
        { text: "🔗 Share Profile", url: "https://t.me/share/url?url=" + encodeURIComponent("My Telegram ID: " + chatId) }
      ]
    ]
  }
});
