/*CMD
  command: /on_check_result
  help: Process Telegram getChatMember result callback
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: on_check_result
  group: 
CMD*/

var userId = user.telegramid;
var idx = User.getProperty("check_sub_index") || 0;
var forceChannels = Bot.getProperty("force_channels") || [];
var activeChannels = [];
for (var i = 0; i < forceChannels.length; i++) {
  if (forceChannels[i].enabled !== false) {
    activeChannels.push(forceChannels[i]);
  }
}

var currentCh = (idx < activeChannels.length) ? activeChannels[idx] : null;

// Extract status from options
var status = null;
if (typeof options === "object" && options !== null) {
  if (options.result && options.result.status) status = options.result.status;
  else if (options.status) status = options.status;
}

var isMember = (status === "creator" || status === "administrator" || status === "member");

// Agar Join-Request channel hai aur request pending me gayi hai, toh bhi VERIFIED mana jayega!
if (!isMember && currentCh && currentCh.type === "request") {
  if (User.getProperty("fsub_requested_" + currentCh.channel_id)) {
    isMember = true;
  }
}

if (isMember) {
  idx++;
  if (idx < activeChannels.length) {
    User.setProperty("check_sub_index", idx, "integer");
    var nextCh = activeChannels[idx];

    // Next channel bhi join-request hai aur pending request exist karti hai
    if (nextCh.type === "request" && User.getProperty("fsub_requested_" + nextCh.channel_id)) {
      Bot.runCommand("/on_check_result");
      return;
    }

    Api.getChatMember({
      chat_id: String(nextCh.channel_id).trim(),
      user_id: parseInt(userId),
      on_result: "/on_check_result",
      on_error: "/on_check_result"
    });
    return;
  } else {
    // All channels verified!
    User.setProperty("force_sub_verified", true, "boolean");
    Bot.sendMessage("✅ <b>Verification successful! Welcome. 🎉</b>", { parse_mode: "HTML" });
    Bot.runCommand("/start");
    return;
  }
} else {
  var chTitle = currentCh ? (currentCh.title || "the channel") : "all channels";
  Bot.sendMessage("❌ <b>Aapne abhi tak " + chTitle + " join ya request nahi kiya hai!</b>\n\nKripya pehle link par click karke channel me request bhejein aur phir <b>Verify Membership</b> par click karein.", { parse_mode: "HTML" });
  Bot.runCommand("/start");
}
