import * as admin from 'firebase-admin';
import serviceAccount from './secrets/serviceKey.json'; // Adjusted the path to match the correct location

// Initialize the Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

// Export the initialized admin instance
export { admin };