/*CMD
  command: /admin_vip
  help: Admin module to grant or revoke VIP membership for users
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: admin_vip
  group: 
CMD*/

var ADMIN_ID = "8710308658";
if (String(user.telegramid) !== ADMIN_ID) return;

User.setProperty("admin_step", "toggle_vip", "string");

var vipList = Bot.getProperty("vip_users_list") || [];
var text = "⭐ <b>VIP MEMBER MANAGEMENT</b>\n" +
           "━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
           "👑 Current VIP Members Count: <code>" + vipList.length + "</code>\n\n" +
           "VIP Members Benefits:\n" +
           "• 🚀 <b>Bypass Force Subscribe:</b> No need to join channels\n" +
           "• 💎 <b>VIP Member Badge:</b> Appears on all ID cards\n\n" +
           "👉 Send the <b>Telegram User ID</b> of the person you want to Add or Remove as VIP:\n" +
           "<i>(Type /cancel to abort)</i>";

var buttons = [
  [{ text: "🔙 Cancel & Back", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: (chat && chat.chatid) ? chat.chatid : user.telegramid,
  text: text,
  parse_mode: "html",
  reply_markup: { inline_keyboard: buttons }
});
