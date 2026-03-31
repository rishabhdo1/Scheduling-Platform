require('dotenv').config();

const app                  = require('./src/app');
const { testConnection }   = require('./src/config/db');
const { verifyMailer }     = require('./src/utils/mailer');
const { port }             = require('./src/config/env');

async function start() {
  await testConnection();
  await verifyMailer();          // logs ✅ or ⚠️ — doesn't block startup
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
