/*CMD
  command: /admin_status
  help: View detailed bot analytics and statistics
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: admin_status, 📊 Bot Status
  group: 
CMD*/

var ADMIN_ID = "8710308658";
if (String(user.telegramid) !== ADMIN_ID) return;

var totalUsers = Bot.getProperty("total_users_count") || 0;
var usersList = Bot.getProperty("users_list") || [];
if (usersList.length > totalUsers) {
  totalUsers = usersList.length;
}
var channels = Bot.getProperty("force_channels") || [];
var vipList = Bot.getProperty("vip_users_list") || [];

var msg = "📊 <b>LIVE BOT STATISTICS & ANALYTICS</b>\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "👥 <b>Total Users Count:</b> <code>" + totalUsers + "</code>\n" +
          "👑 <b>VIP Members Count:</b> <code>" + vipList.length + "</code>\n" +
          "📢 <b>Active Force Channels:</b> <code>" + channels.length + "</code>\n" +
          "👑 <b>Master Admin ID:</b> <code>" + ADMIN_ID + "</code>\n" +
          "🤖 <b>Bot Platform:</b> Bots.Business (BJS Engine)\n" +
          "💎 <b>Premium Features:</b> Active (Inspector + 1-Tap Copy + VIP)\n" +
          "⏰ <b>Status Check Time:</b> <code>" + new Date().toISOString() + "</code>\n";

var buttons = [
  [{ text: "🔙 Back to Admin", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: (chat && chat.chatid) ? chat.chatid : user.telegramid,
  text: msg,
  parse_mode: "html",
  reply_markup: { inline_keyboard: buttons }
});
