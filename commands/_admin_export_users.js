/*CMD
  command: /admin_export_users
  help: Export registered user IDs list
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: admin_export_users
  group: 
CMD*/

var ADMIN_ID = "8710308658";
if (String(user.telegramid) !== ADMIN_ID) return;

var usersList = Bot.getProperty("users_list") || [];
var text = "📁 <b>USER DATABASE EXPORT</b>\n" +
           "━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
           "Total Count: <code>" + usersList.length + "</code>\n\n" +
           "<i>User IDs List:</i>\n<code>" + usersList.slice(0, 100).join(", ") + "</code>";

if (usersList.length > 100) {
  text += "\n<i>... and " + (usersList.length - 100) + " more users.</i>";
}

Bot.sendMessage(text, { parse_mode: "HTML" });
