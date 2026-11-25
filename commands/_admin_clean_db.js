/*CMD
  command: /admin_clean_db
  help: Clean temporary data and optimize DB properties
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: admin_clean_db
  group: 
CMD*/

var ADMIN_ID = "8710308658";
if (String(user.telegramid) !== ADMIN_ID) return;

User.setProperty("admin_step", null);
User.setProperty("waiting_clone_email_" + user.telegramid, null);

Bot.sendMessage("🧹 <b>Database Cleaned!</b>\n\nTemporary cache & admin step properties have been optimized.", { parse_mode: "HTML" });
Bot.runCommand("/admin");
