/*CMD
  command: /admin_remove_channel
  help: Remove a channel from force subscribe list
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: admin_remove_channel
  group: 
CMD*/

var ADMIN_ID = "8710308658";
if (String(user.telegramid) !== ADMIN_ID) return;

var channels = Bot.getProperty("force_channels") || [];
if (channels.length === 0) {
  Bot.sendMessage("ℹ️ <i>No channels to remove.</i>");
  Bot.runCommand("/admin_forcesub");
  return;
}

var text = "🗑️ <b>REMOVE FORCE CHANNEL</b>\n\nSend the <b>Number (Index)</b> of the channel to remove:\n\n";
for (var i = 0; i < channels.length; i++) {
  text += (i + 1) + ". <b>" + channels[i].title + "</b> (" + (channels[i].channel_id || "N/A") + ")\n";
}
text += "\n<i>Send /cancel to abort.</i>";

User.setProperty("admin_step", "remove_channel_idx");
Bot.sendMessage(text);
