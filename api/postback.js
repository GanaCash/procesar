import admin from 'firebase-admin';

const serviceAccount = {
  // tu JSON de service account aquí (⚠️ no lo subas público)


"type": "service_account",
  "project_id": "invitaciones-7d704",
  "private_key_id": "61afaf872abf7ff31516c1b18e296dc0076e35ac",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCZGaNx0FVJXfwb\nx7kRdCnH1u14pXDyDEJfyQnU3joGfGfQmc7Wf0tuv4ACFpvC35NSNN6rmQ5NUc6D\nlnBUy+9j0GS458in7BFiRUOEvpUdZOfWj83S/0RRDhK3dlwrVwmcJbEujO6KfuX3\n0TilKN3sOVbNILVO0tioF6cupQ4Cr69elAWOFrJ0t/Y7oTD3ywr9UDVaLc2onnWT\nflTLtfC6D5XoFwT2uSaqTB3p9eiK4iSSacLaeOtQsN6//zPfY9JrSyfNhWw2h+rl\n3xAD6Jgsvu0z2aZUITu2XSgTtmDvmfqdQ3x2pNvk6TVeOk+A7qM/N2SKT5Ayf+nB\nX4nU0oXvAgMBAAECggEACIXxX/YxsU5uqRtC1dJqOwpfmQ5YzdjZ3xxBlFy0zUSi\nwO23IqDekbFOjo80p7IrsPFpjhMMxUgvH4tCAK6DysJAwTyCIrsVMqvZeOvlQEgs\nUfkag8sbQgnvB9Cqi+0iB1Pf29ATvZkX82Zt6V/vjuWYS/4sqdE6J419jK66q3KH\nWuq9Fd9p6eUh0lhW9CL0SPUmi0Ju10Fk2a0svcWrBhnQG3oZhL1h3Trmg5hmBbSM\n7lr8GJeeHHxUun4uXPTOSfwaHrMFqzqiQPTzPezoeLcRNlIh6R6AFFitVA+soIPP\nBApV7aTVnsE5ClSeYfodJtVh6QS3q55Wie7r36kKqQKBgQDL0AXWd6Fw5x1JYiRx\ngAyHBdcHB1Tokeb0ZhxjbSikIKiS/PYdgr7uGSa5gRFg/JAKD5aKRZvGv60Kbvas\n7HCisALCgZ04BF969NydkjQIMPU60R9a3kGPOinB6MtOEjtEanwHCQRl0AdqxIpP\nvxDsYysK7+DOEToNCCD84+6X5wKBgQDATWZdWrHBBdSC/0ucYvJNqh68skY9w96d\nWAqpjvAJboHnx29Hl2sKUd99bJUg7l9j8jgfdOxjvlicF0sN8DyZB7N2HXt9v0Z4\nLfgnYB5GRAVXxjvW96/Ohr4jxijyXVtgbmU6j3+a6ZDMoaPhZ2MyHAl9vt/1Juuw\nJjbze4tAuQKBgQCqYzWOL6Ma5UwZnl/DN37BnsM+UAXPDLLdHUScZpS0ac0kXTBQ\nSY7fNM2oBdwGjf7JOnDrFfh+Np4ue8fjlyMvDyCvhXZvb1B3VZ/eZ2zycCOD0XJ6\nIBcE62Yfg0P798fukWsw4nv3teuNedP7iUtXpCxGz3XMMKCsZmBVqyQ7fwKBgQCq\nnADVkkFiHuoLzrQmayLOBMCAaSooYj5/Gj1bcZVEyOY33Ji9y3kMDtdZT5x/Ov0m\njx97ySBw3c9/rKrKEvmwS0TM5htJ1QmQVjhztrMlY/PZi+ZLMjSn5qOK2aQ6YtlP\nFKJ68hUkO1RcOIxMzo0TSAyjo1TPC1jPTxgxrMo/AQKBgHsjB3bvsNhlkdYRhVs1\nfXYO/vhc13T/zFf0zVqHT+d+ToHbioOdcPfCT7g79rfk/MaKW2NVJznERd53RQyw\nXwqpwzETcUwb2oLUZMmANQEFODaVf/r7v864vK3Q/4LDtvPakofcRruo70YCQxUR\njlhBZghFaPAyORctgUH4NuRK\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@invitaciones-7d704.iam.gserviceaccount.com",
  "client_id": "113246253994987920135",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40invitaciones-7d704.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
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
  const SECRET = "461e007d2c"; // tu SECRET de Wannads

  if (!user_id || !transaction_id || !reward || !signature) {
    return res.status(400).send("ERROR: Parámetros faltantes.");
  }

  const expectedSig = require('crypto')
    .createHash('md5')
    .update(user_id + transaction_id + reward + SECRET)
    .digest('hex');

  if (signature !== expectedSig) {
    return res.status(403).send("ERROR: Signature doesn't match.");
  }

  const transRef = db.ref(`transactions/${transaction_id}`);
  const snapshot = await transRef.once('value');
  if (snapshot.exists()) {
    return res.status(200).send("OK - Duplicado");
  }

  await transRef.set(true);
  const userRef = db.ref(`users/${user_id}/points`);
  const userSnapshot = await userRef.once('value');
  const current = userSnapshot.val() || 0;
  await userRef.set(current + parseInt(reward));

  return res.status(200).send("OK");
}
