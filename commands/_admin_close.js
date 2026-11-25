/*CMD
  command: /admin_close
  help: Close admin panel message
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: admin_close
  group: 
CMD*/

if (request && request.message) {
  Api.deleteMessage({
    chat_id: request.message.chat.id,
    message_id: request.message.message_id
  });
} else {
  Bot.sendMessage("🔒 <b>Admin Panel Closed.</b>");
}
