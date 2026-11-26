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
var isVip = Bot.getProperty("vip_" + userId);
var isVerified = User.getProperty("force_sub_verified");

// VIP users and Master Admin bypass Force Subscribe completely
if (!isOwner && !isVip && activeChannels.length > 0 && !isVerified) {
  var buttons = [];
  for (var j = 0; j < activeChannels.length; j++) {
    var ch = activeChannels[j];
    var link = ch.invite_link || "https://t.me/" + String(ch.channel_id).replace("@", "");
    var btnText = ch.type === "request" ? "📩 Request to Join Channel" : "📢 Join Channel";
    buttons.push([{ text: btnText, url: link }]);
  }
  buttons.push([{ text: "🟢 VERIFY JOIN", callback_data: "/check_sub" }]);

  var fsubText = "⚠️ <b>To start click the button and join channel 👇</b>\n\n" +
                 "Aapko bot use karne ke liye channel join karna zaroori hai.\n" +
                 "Join / Request karne ke baad <b>[ 🟢 VERIFY JOIN ]</b> par click karein:";

  Api.sendMessage({
    chat_id: (chat && chat.chatid) ? chat.chatid : userId,
    text: fsubText,
    parse_mode: "html",
    reply_markup: { inline_keyboard: buttons }
  });
  return;
}

// 3. Send User ID & Premium Card with 8 Request Buttons
var u = user || {};
var c = chat || {};
var myId = c.chatid || u.telegramid;
var name = u.first_name || "User";
if (u.last_name) {
  name = (name + " " + u.last_name).trim();
}

var reqObj = (typeof request !== "undefined" && request) ? request : {};
var isPrem = (u.is_premium || (reqObj.from && reqObj.from.is_premium)) ? true : false;
var userDc = User.getProperty("dc_id");
var dcText = userDc ? getDcInfo(userDc) : "DC 5 (Singapore / Asia)";
var statusStr = isOwner ? "Master Admin ⚡" : (isVip ? "VIP Member 💎" : "Free User");

var text = "Your ID: <code>" + myId + "</code>\n" +
           "Your Name: " + escapeHtml(name) + "\n" +
           "Your Username: @" + (u.username ? escapeHtml(u.username) : "N/A") + "\n\n" +
           "✨ <b>Premium Details:</b>\n" +
           "⭐ <b>Telegram Premium:</b> " + (isPrem ? "Yes (Active ⭐)" : "No") + "\n" +
           "📅 <b>Estimated Age:</b> " + estimateAccountAge(myId) + "\n" +
           "🌐 <b>Data Center:</b> " + dcText + "\n" +
           "👑 <b>Bot Status:</b> " + statusStr + "\n" +
           "🔗 <b>Permalink:</b> <a href=\"tg://user?id=" + myId + "\">Open Profile</a>";

Api.sendMessage({
  chat_id: myId,
  text: text,
  parse_mode: "html",
  reply_markup: getMainKeyboard()
});
