/*CMD
  command: /admin_bc_text
  help: Prompt admin to enter broadcast message
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: admin_bc_text
  group: 
CMD*/

var ADMIN_ID = "8710308658";
if (String(user.telegramid) !== ADMIN_ID) return;

User.setProperty("admin_step", "broadcast_content");
Bot.sendMessage("📝 <b>Enter the Broadcast Message to send to ALL users:</b>\n\n<i>Supports HTML formatting (<b>bold</b>, <i>italic</i>, <code>code</code>, links). Send /cancel to abort.</i>");
