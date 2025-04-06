import admin from 'firebase-admin';
import crypto from 'crypto';

// Configuración de Firebase Admin
const serviceAccount = {
  "type": "service_account",
  "project_id": "invitaciones-7d704",
  "private_key_id": "61afaf872abf7ff31516c1b18e296dc0076e35ac",
  "private_key": "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCZGaNx0FVJXfwb...\\n-----END PRIVATE KEY-----\\n",
  "client_email": "firebase-adminsdk-fbsvc@invitaciones-7d704.iam.gserviceaccount.com",
  "client_id": "113246253994987920135",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc@invitaciones-7d704.iam.gserviceaccount.com"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://invitaciones-7d704-default-rtdb.europe-west1.firebasedatabase.app',
  });
}

const db = admin.database();

export default async function handler(req, res) {
  const { user_id, transaction_id, reward, signature } = req.query;
  const SECRET = "461e007d2c";

  if (!user_id || !transaction_id || !reward || !signature) {
    return res.status(400).send("ERROR: Parámetros faltantes.");
  }

  const expectedSig = crypto
    .createHash('md5')
    .update(user_id + transaction_id + reward + SECRET)
    .digest('hex');

  if (signature !== expectedSig) {
    return res.status(403).send("ERROR: Firma no coincide.");
  }

  const transRef = db.ref(`transactions/${transaction_id}`);
  const snapshot = await transRef.once('value');
  if (snapshot.exists()) {
    return res.status(200).send("OK - Duplicado");
  }

  await transRef.set(true);
  const userRef = db.ref(`users/${user_id}/points`);
  const userSnapshot = await userRef.once('value');
  const currentPoints = userSnapshot.val() || 0;
  await userRef.set(currentPoints + parseInt(reward));

  return res.status(200).send("OK");
}
