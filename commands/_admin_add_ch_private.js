/*CMD
  command: /admin_add_ch_private
  help: Add a private force channel via Chat ID and invite link
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: admin_add_ch_private
  group: 
CMD*/

var ADMIN_ID = "8710308658";
if (String(user.telegramid) !== ADMIN_ID) return;

User.setProperty("admin_step", "add_ch_private_id");
Bot.sendMessage("🔐 <b>Add Private Channel (Step 1/2)</b>\n\nSend the <b>Chat ID</b> of your private channel:\n<i>Example:</i> <code>-1001234567890</code>\n\n<i>Make sure the bot is Administrator in the channel! Send /cancel to abort.</i>");
