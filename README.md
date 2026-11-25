# 🚀 Toxic Chat ID Bot — Bots.Business & GitHub Sync Ready

Professional Telegram Chat ID Bot with 8 Request Buttons, Force Channel (FSub) Gate, Master Admin Panel (`8710308658`), Mass Broadcast, and `/41` Bot Cloning system.

## 📁 Repository Structure
```
├── bot.json                       <- Bots.Business Sync Config
├── chat_id_bot.bb                 <- All-in-one import bundle
├── commands/                      <- Exact BJS Command Files
│   ├── _start.js                  <- /start with 8-button menu & FSub check
│   ├── _catchAll.js               <- * (chat_shared, users_shared, forwards)
│   ├── _41.js                     <- /41 clone bot to user's BB email
│   ├── _admin.js                  <- /admin Master Dashboard
│   ├── _admin_status.js           <- /admin_status (Live stats)
│   ├── _admin_forcesub.js         <- /admin_forcesub (FSub manager)
│   ├── _admin_add_ch_public.js    <- Add public @username channel
│   ├── _admin_add_ch_private.js   <- Add private -100 ID channel
│   ├── _admin_remove_channel.js   <- Remove FSub channel
│   ├── _admin_broadcast.js        <- Broadcast menu
│   ├── _admin_bc_text.js          <- Enter broadcast text
│   ├── _admin_clean_db.js         <- Clean temporary cache & DB
│   ├── _admin_export_users.js     <- Export user IDs list
│   ├── _admin_close.js            <- Close panel
│   ├── _cancel.js                 <- /cancel active action
│   ├── _handle_admin_input.js     <- Process conversational input
│   ├── _check_sub.js              <- Membership verify trigger
│   └── _on_check_result.js        <- getChatMember Telegram callback
└── README.md
```

## 🔄 How to Push to GitHub & Import into Bots.Business:
1. Initialize git and push to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Toxic Chat ID Bot with Admin Suite"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
2. Open **Bots.Business**, go to your bot's **Git / GitHub Sync** settings.
3. Connect your GitHub repository and click **Sync / Import**.
4. All commands will be imported automatically into your bot!
