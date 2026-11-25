/*CMD
  command: /start
  help: Start the bot and get Chat ID with 8-button menu
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: cmd_start, 🔙 Main Menu, Main Menu, /start, /id, id, /help
  group: 
CMD*/

var ADMIN_ID = "8710308658";
Bot.setProperty("admin_id", ADMIN_ID, "string");

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

// 1. User registration & analytics tracking
var userId = user.telegramid;
if (!User.getProperty("bot_user_registered")) {
  User.setProperty("bot_user_registered", true, "boolean");
  var curCount = Bot.getProperty("total_users_count") || 0;
  Bot.setProperty("total_users_count", curCount + 1, "integer");
  var usersList = Bot.getProperty("users_list") || [];
  if (usersList.indexOf(userId) === -1) {
    usersList.push(userId);
    Bot.setProperty("users_list", usersList, "json");
  }
}

// Clear user temp steps
User.setProperty("admin_step", null);

// 2. Real-Time Force Channel (FSub) Gate Check
var forceChannels = Bot.getProperty("force_channels") || [];
var activeChannels = [];
for (var i = 0; i < forceChannels.length; i++) {
  if (forceChannels[i].enabled !== false) {
    activeChannels.push(forceChannels[i]);
  }
}

var isOwner = (String(userId) === ADMIN_ID);
var isVerified = User.getProperty("force_sub_verified");

if (!isOwner && activeChannels.length > 0 && !isVerified) {
  var buttons = [];
  for (var j = 0; j < activeChannels.length; j++) {
    var ch = activeChannels[j];
    var link = ch.invite_link || "https://t.me/" + String(ch.channel_id).replace("@", "");
    buttons.push([{ text: "📢 Join " + (ch.title || "Channel"), url: link }]);
  }
  buttons.push([{ text: "🔄 Verify Membership", callback_data: "/check_sub" }]);

  var fsubText = "⛔ <b>Access Restricted!</b>\n\n" +
                 "Aapko bot use karne ke liye hamare official channels join karne honge.\n" +
                 "Neeche diye gaye channels join karein aur <b>Verify Membership</b> par click karein:";

  Api.sendMessage({
    chat_id: (chat && chat.chatid) ? chat.chatid : userId,
    text: fsubText,
    parse_mode: "html",
    reply_markup: { inline_keyboard: buttons }
  });
  return;
}

// 3. Send User ID & Attach 8 Request Buttons
var u = user || {};
var c = chat || {};
var name = u.first_name || "User";
if (u.last_name) {
  name = (name + " " + u.last_name).trim();
}

var text = "<b>" + escapeHtml(name) + "</b>\n" +
           "🆔 Chat ID: <code>" + (c.chatid || u.telegramid) + "</code>\n" +
           "👤 User ID: <code>" + u.telegramid + "</code>";

if (u.username) {
  text += "\n🔗 Username: @" + escapeHtml(u.username);
}

Api.sendMessage({
  chat_id: c.chatid || u.telegramid,
  text: text,
  parse_mode: "html",
  reply_markup: getMainKeyboard()
});
