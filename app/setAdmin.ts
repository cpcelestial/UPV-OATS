// setAdmin.ts using CommonJS
const admin = require('firebase-admin');
const readline = require('readline');
const serviceAccount = require('./secrets/serviceKey.json'); // adjust path as needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the email of the user to make admin: ', async (email: any) => {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    console.log(`✅ ${email} is now an admin (UID: ${userRecord.uid})`);
  } catch (error) {
    console.error('❌ Failed to set admin claim:', error);
  } finally {
    rl.close();
  }
});
