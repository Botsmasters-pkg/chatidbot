/*CMD
  command: /admin_add_ch_public
  help: Add a public force channel via @username
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: admin_add_ch_public
  group: 
CMD*/

var ADMIN_ID = "8710308658";
if (String(user.telegramid) !== ADMIN_ID) return;

User.setProperty("admin_step", "add_ch_public");
Bot.sendMessage("📢 <b>Add Public Channel</b>\n\nSend the public channel <b>@username</b>:\n<i>Example:</i> <code>@MyChannel</code> or <code>MyChannel</code>\n\n<i>Send /cancel to abort.</i>");
