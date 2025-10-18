require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    console.log('DATABASE_URL from process.env =>', process.env.DATABASE_URL && process.env.DATABASE_URL.slice(0,80) + (process.env.DATABASE_URL.length>80? '...':''));
    const u = await prisma.user.findFirst();
    console.log('OK, user:', u);
    process.exit(0);
  } catch (err) {
    console.error('PRISMA ERROR:');
    console.error(err && err.stack ? err.stack : err);
    if (err && err.meta) console.error('meta:', JSON.stringify(err.meta, null, 2));
    process.exit(2);
  } finally {
    try { await prisma.$disconnect(); } catch(e){}
  }
})();
