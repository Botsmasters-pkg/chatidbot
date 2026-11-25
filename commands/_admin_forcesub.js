/*CMD
  command: /admin_forcesub
  help: Manage Force Subscribe channels (Public, Private, Request)
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: admin_forcesub, 🔐 Force Subscribe
  group: 
CMD*/

var ADMIN_ID = "8710308658";
if (String(user.telegramid) !== ADMIN_ID) return;

var channels = Bot.getProperty("force_channels") || [];

var text = "🔐 <b>FORCE SUBSCRIBE MANAGEMENT</b>\n" +
           "━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
           "Total Active Channels: <b>" + channels.length + "</b>\n\n";

if (channels.length === 0) {
  text += "<i>No channels added yet. Force subscribe is currently inactive.</i>\n";
} else {
  for (var i = 0; i < channels.length; i++) {
    var ch = channels[i];
    var status = ch.enabled !== false ? "🟢 Enabled" : "🔴 Disabled";
    var typeBadge = ch.type === "request" ? "📩 Request" : (ch.type === "private" ? "🔒 Private" : "🌐 Public");
    text += (i + 1) + ". <b>" + ch.title + "</b> (" + status + ")\n" +
            "   Type: <code>" + typeBadge + "</code> | ID: <code>" + (ch.channel_id || "N/A") + "</code>\n" +
            "   Link: " + (ch.invite_link || "N/A") + "\n\n";
  }
}

var buttons = [
  [
    { text: "🌐 Public Channel", callback_data: "/admin_add_ch_public" },
    { text: "🔒 Private Channel", callback_data: "/admin_add_ch_private" }
  ],
  [
    { text: "📩 Request Channel", callback_data: "/admin_add_ch_request" },
    { text: "🗑️ Remove Channel", callback_data: "/admin_remove_channel" }
  ],
  [
    { text: "🔙 Back to Admin", callback_data: "/admin" }
  ]
];

Api.sendMessage({
  chat_id: (chat && chat.chatid) ? chat.chatid : user.telegramid,
  text: text,
  parse_mode: "html",
  reply_markup: { inline_keyboard: buttons }
});
