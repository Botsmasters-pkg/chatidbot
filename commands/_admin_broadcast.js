/*CMD
  command: /admin_broadcast
  help: Broadcast system hub
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: admin_broadcast, 📢 Broadcast
  group: 
CMD*/

var ADMIN_ID = "8710308658";
if (String(user.telegramid) !== ADMIN_ID) return;

var text = "📢 <b>BROADCAST MANAGEMENT SYSTEM</b>\n" +
           "━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
           "Send announcements, news, or promotional messages to all active bot users.\n\n" +
           "<i>Click below to enter your broadcast message:</i>";

var buttons = [
  [{ text: "📝 Send Text Broadcast", callback_data: "/admin_bc_text" }],
  [{ text: "🔙 Back to Admin", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: (chat && chat.chatid) ? chat.chatid : user.telegramid,
  text: text,
  parse_mode: "html",
  reply_markup: { inline_keyboard: buttons }
});
