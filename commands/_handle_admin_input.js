/*CMD
  command: /handle_admin_input
  help: Router for admin conversational input steps
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: handle_admin_input
  group: 
CMD*/

var ADMIN_ID = "8710308658";
if (String(user.telegramid) !== ADMIN_ID) return;

var step = User.getProperty("admin_step");
if (!step) return;

// Extract input text safely from options.text first, NEVER use command name
var text = "";
if (typeof options === "object" && options !== null) {
  if (options.text) text = String(options.text).trim();
  else if (options.message) text = String(options.message).trim();
}
if (!text && typeof message === "string" && message) {
  var m = message.trim();
  if (m !== "/handle_admin_input" && m !== "handle_admin_input") {
    text = m;
  }
}

if (!text) return;

if (text.toLowerCase() === "/cancel" || text.toLowerCase() === "cancel") {
  User.setProperty("admin_step", null);
  User.setProperty("admin_temp_ch_id", null);
  Bot.sendMessage("❌ <i>Operation cancelled.</i>", { parse_mode: "HTML" });
  Bot.runCommand("/admin");
  return;
}

// ------------------ 1. BROADCAST CONTENT ------------------ //
if (step === "broadcast_content") {
  User.setProperty("admin_step", null);
  var usersList = Bot.getProperty("users_list") || [];
  if (usersList.length === 0) {
    Bot.sendMessage("❌ <i>No users registered in database to broadcast to.</i>", { parse_mode: "HTML" });
    Bot.runCommand("/admin");
    return;
  }

  Bot.sendMessage("🚀 <b>Broadcasting to " + usersList.length + " users...</b>\nPlease wait a moment.", { parse_mode: "HTML" });

  var sent = 0;
  var failed = 0;
  for (var i = 0; i < usersList.length; i++) {
    try {
      Api.sendMessage({
        chat_id: usersList[i],
        text: text,
        parse_mode: "html"
      });
      sent++;
    } catch (e) {
      failed++;
    }
  }

  var report = "✅ <b>Broadcast Finished!</b>\n\n" +
               "📤 <b>Delivered:</b> <code>" + sent + "</code>\n" +
               "❌ <b>Failed / Blocked:</b> <code>" + failed + "</code>\n" +
               "👥 <b>Total Target:</b> <code>" + usersList.length + "</code>";
  Bot.sendMessage(report, { parse_mode: "HTML" });
  Bot.runCommand("/admin");
  return;
}

// ------------------ 2. ADD PUBLIC CHANNEL ------------------ //
if (step === "add_ch_public") {
  User.setProperty("admin_step", null);
  var username = text.replace("@", "").trim();
  var channels = Bot.getProperty("force_channels") || [];
  
  channels.push({
    title: "@" + username,
    type: "public",
    channel_id: "@" + username,
    invite_link: "https://t.me/" + username,
    enabled: true
  });
  Bot.setProperty("force_channels", channels, "json");
  Bot.sendMessage("✅ <b>Public Channel Added:</b> @" + username, { parse_mode: "HTML" });
  Bot.runCommand("/admin_forcesub");
  return;
}

// ------------------ 3. ADD PRIVATE CHANNEL (Step 1: ID) ------------------ //
if (step === "add_ch_private_id") {
  var chId = text.trim();
  User.setProperty("admin_temp_ch_id", chId);
  User.setProperty("admin_step", "add_ch_private_link");
  Bot.sendMessage("🔗 <b>Private Channel (Step 2/2)</b>\n\nNow send the <b>Private Invite Link</b>:\n<i>Example:</i> <code>https://t.me/+AbCdEfGh...</code>\n\n<i>Send /cancel to abort.</i>", { parse_mode: "HTML" });
  return;
}

// ------------------ 4. ADD PRIVATE CHANNEL (Step 2: Link) ------------------ //
if (step === "add_ch_private_link") {
  var privChId = User.getProperty("admin_temp_ch_id");
  User.setProperty("admin_step", null);
  User.setProperty("admin_temp_ch_id", null);

  var channels = Bot.getProperty("force_channels") || [];
  channels.push({
    title: "Private Channel (" + privChId + ")",
    type: "private",
    channel_id: privChId,
    invite_link: text.trim(),
    enabled: true
  });
  Bot.setProperty("force_channels", channels, "json");
  Bot.sendMessage("✅ <b>Private Channel Added Successfully!</b>\n🆔 ID: <code>" + privChId + "</code>\n🔗 Link: " + text.trim(), { parse_mode: "HTML" });
  Bot.runCommand("/admin_forcesub");
  return;
}

// ------------------ 5. ADD JOIN-REQUEST CHANNEL (Step 1: ID) ------------------ //
if (step === "add_ch_req_id") {
  var reqId = text.trim();
  User.setProperty("admin_temp_ch_id", reqId);
  User.setProperty("admin_step", "add_ch_req_link");
  Bot.sendMessage("🔗 <b>Join-Request Channel (Step 2/2)</b>\n\nNow send the <b>Join-Request Link</b>:\n<i>Example:</i> <code>https://t.me/+AbCdEfGh...</code>\n\n<i>Send /cancel to abort.</i>", { parse_mode: "HTML" });
  return;
}

// ------------------ 6. ADD JOIN-REQUEST CHANNEL (Step 2: Link) ------------------ //
if (step === "add_ch_req_link") {
  var reqChId = User.getProperty("admin_temp_ch_id");
  User.setProperty("admin_step", null);
  User.setProperty("admin_temp_ch_id", null);

  var channels = Bot.getProperty("force_channels") || [];
  channels.push({
    title: "Request Channel (" + reqChId + ")",
    type: "request",
    channel_id: reqChId,
    invite_link: text.trim(),
    enabled: true
  });
  Bot.setProperty("force_channels", channels, "json");
  Bot.sendMessage("✅ <b>Join-Request Channel Added!</b>\n🆔 ID: <code>" + reqChId + "</code>\n🔗 Link: " + text.trim(), { parse_mode: "HTML" });
  Bot.runCommand("/admin_forcesub");
  return;
}

// ------------------ 7. REMOVE CHANNEL BY NUMBER ------------------ //
if (step === "remove_channel_idx") {
  User.setProperty("admin_step", null);
  var idx = parseInt(text) - 1;
  var channels = Bot.getProperty("force_channels") || [];
  if (isNaN(idx) || idx < 0 || idx >= channels.length) {
    Bot.sendMessage("❌ <i>Invalid channel number.</i>", { parse_mode: "HTML" });
  } else {
    var removed = channels.splice(idx, 1);
    Bot.setProperty("force_channels", channels, "json");
    Bot.sendMessage("🗑️ <b>Removed:</b> " + (removed[0] ? removed[0].title : "Channel"), { parse_mode: "HTML" });
  }
  Bot.runCommand("/admin_forcesub");
  return;
}
