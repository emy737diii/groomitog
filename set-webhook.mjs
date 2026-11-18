// Подключает бота к сайту. Запускать после деплоя: npm run telegram:webhook
const { TELEGRAM_BOT_TOKEN: token, SITE_URL: site, TELEGRAM_WEBHOOK_SECRET: secret } = process.env;
if (!token || !site || !secret) { console.error('Заполните TELEGRAM_BOT_TOKEN, SITE_URL и TELEGRAM_WEBHOOK_SECRET в .env'); process.exit(1); }
const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: `${site}/api/telegram/webhook`, secret_token: secret, allowed_updates: ['message'], drop_pending_updates: true }),
});
console.log(await res.json());
