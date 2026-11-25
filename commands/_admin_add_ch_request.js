/*CMD
  command: /admin_add_ch_request
  help: Add join-request force subscribe channel
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: admin_add_ch_request
  group: 
CMD*/

var ADMIN_ID = "8710308658";
if (String(user.telegramid) !== ADMIN_ID) return;

User.setProperty("admin_step", "add_ch_req_id");
Bot.sendMessage("📩 <b>Add Join-Request Channel (Step 1/2)</b>\n\nSend the <b>Chat ID</b> of the join-request channel:\n<i>Example:</i> <code>-1001234567890</code>\n\n<i>Make sure this bot is added as an Administrator in your channel! Send /cancel to abort.</i>", { parse_mode: "HTML" });
