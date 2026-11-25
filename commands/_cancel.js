/*CMD
  command: /cancel
  help: Cancel current active admin operation
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: cancel, /abort
  group: 
CMD*/

User.setProperty("admin_step", null);
Bot.sendMessage("❌ <b>Action Cancelled.</b> Returning to menu.");
var ADMIN_ID = "8710308658";
if (String(user.telegramid) === ADMIN_ID) {
  Bot.runCommand("/admin");
} else {
  Bot.runCommand("/start");
}
