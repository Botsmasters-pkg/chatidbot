/*CMD
  command: /check_sub
  help: Verify channel subscription status (Sequential Multi-Channel Check)
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: check_sub, 🟢 VERIFY JOIN, Verify Membership
  group: 
CMD*/

var userId = user.telegramid;
var forceChannels = Bot.getProperty("force_channels") || [];
var activeChannels = [];
for (var i = 0; i < forceChannels.length; i++) {
  if (forceChannels[i].enabled !== false) {
    activeChannels.push(forceChannels[i]);
  }
}

if (activeChannels.length === 0) {
  User.setProperty("force_sub_verified", true, "boolean");
  Bot.sendMessage("✅ <b>Verification successful! Welcome. 🎉</b>", { parse_mode: "HTML" });
  Bot.runCommand("/start");
  return;
}

User.setProperty("check_sub_index", 0, "integer");

function checkNextChannel(idx) {
  if (idx >= activeChannels.length) {
    User.setProperty("force_sub_verified", true, "boolean");
    Bot.sendMessage("✅ <b>Verification successful! Welcome. 🎉</b>", { parse_mode: "HTML" });
    Bot.runCommand("/start");
    return;
  }

  var ch = activeChannels[idx];

  // Join-Request Channel:
  // User ki request pending me hai (fsub_requested_... is true), toh bina admin approval ke VERIFIED maano!
  if (ch.type === "request") {
    var isRequested = User.getProperty("fsub_requested_" + ch.channel_id);
    if (isRequested) {
      User.setProperty("check_sub_index", idx + 1, "integer");
      checkNextChannel(idx + 1);
      return;
    }
  }

  var targetChatId = String(ch.channel_id || "").trim();
  Api.getChatMember({
    chat_id: targetChatId,
    user_id: parseInt(userId),
    on_result: "/on_check_result",
    on_error: "/on_check_result"
  });
}

checkNextChannel(0);
