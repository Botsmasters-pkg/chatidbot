/*CMD
  command: /admin
  help: Open the Master Admin Control Dashboard
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: admin_panel, /menu_admin_panel, menu_admin_panel, 👑 Admin Panel, Admin Panel
  group: 
CMD*/

var ADMIN_ID = "8710308658";
if (String(user.telegramid) !== ADMIN_ID) {
  Bot.sendMessage("⛔ <b>Access Denied:</b> You are not authorized to view the Admin Panel.");
  return;
}

User.setProperty("admin_step", null);

var totalUsers = Bot.getProperty("total_users_count") || 0;
var usersList = Bot.getProperty("users_list") || [];
if (usersList.length > totalUsers) {
  totalUsers = usersList.length;
}
var channels = Bot.getProperty("force_channels") || [];

var text = "⚡ <b>TOXIC CHAT ID BOT — MASTER ADMIN PANEL</b>\n" +
           "━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
           "👑 <b>Admin:</b> <code>" + user.telegramid + "</code>\n" +
           "👥 <b>Total Registered Users:</b> <code>" + totalUsers + "</code>\n" +
           "📢 <b>Force Channels:</b> <code>" + channels.length + "</code>\n" +
           "🛡️ <b>System:</b> Operational\n\n" +
           "<i>Select a control module below:</i>";

var buttons = [
  [
    { text: "📊 Bot Status", callback_data: "/admin_status" },
    { text: "📢 Broadcast Message", callback_data: "/admin_broadcast" }
  ],
  [
    { text: "🔐 Force Subscribe", callback_data: "/admin_forcesub" },
    { text: "📁 Export Users", callback_data: "/admin_export_users" }
  ],
  [
    { text: "🧹 Clean Database", callback_data: "/admin_clean_db" },
    { text: "❌ Close Panel", callback_data: "/admin_close" }
  ]
];

Api.sendMessage({
  chat_id: (chat && chat.chatid) ? chat.chatid : user.telegramid,
  text: text,
  parse_mode: "html",
  reply_markup: { inline_keyboard: buttons }
});
