const express = require('express');
const md5 = require('md5');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
const port = 3000;

// Configuración
const secret = '461e007d2c'; // Reemplaza con tu SECRET de Wannads

// Credenciales de Firebase directamente en el código (NO recomendado para producción)
const serviceAccount = {
   type": "service_account",
  "project_id": "invitaciones-7d704",
  "private_key_id": "d87c14db718226fb1021314a8eaa9b6ed9af2a41",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDIhEZ/5sJJDUP2\n8bg7nnjhbb+lADNgJYe21Ke9UPBnglhuDT96piDxkEE9seiZ4vPFXTh1T+YCdCYs\nw8x87XonEu6lNPRosVKig8LHb7bZ97gTISl4QDHjT6LrUTmHpUIfdyytjSF+D5WF\nkqUDPWelIldhNwEjB27I9AQuSa4v1CxRyqAl1DDAImlucohcOphU6H/odNodrXJ5\nQ+RQUsjLG+a38xUI44gkSi1QBG58sSbpIaTulVSPz2GBm4/lDeldH+DtAqeFmc7u\nox3Ih/x1FDYtpBUvkXZ7mmpBbXMtNR/03gkx5J/GoaG+OuzgBuDNW6PCovW+LXTU\nFhZu0XELAgMBAAECggEACz5WNlbJ/yRQyCM5XufIbxo4fE08vuqWfRCDOrDerMHY\n0+Gcn8klS2ujf4z0diiNMxHCmDAQ6C37dALN+mqrMPoKoACOUePbi9mn4tynRqVG\n0Opznla51WgCQoACofyzbqXqlJgM0DpEepcZ90q1VJj5MwN4EK7v2IciSDbWdGpa\nWQ9XZCoyage6Dfi5ZyFu0YDsn64VWYEa4WFRlHCYuUeDmjdXNrfWh56Obn2jsNdN\nKhDmCBKOnPERNc70BOUOV3S/3cPnk5jTSXH2iA1HUXE35Nv7eHQhRsGLPEN7tQvh\n152t5Aj7AhfwhoRQ9XdnAYmJlsbMHbY4FtNI7taaGQKBgQDurJG7pH/eRMTn3R3g\nB02rgAF4TTyYl5AlgWjjifUoPM7XQIHBHcbBgATZv6GVgdiJ7e0KGmI1p1/OKms3\nszAxJC5WsgqrCimOP7cchTwrAVIME7avHooJ8JKi1/rNeF/65IcdXnMvCdOg4wrQ\nntD3Uv7a9yWTOI79YR/72XqI8wKBgQDXEppsmmPr1EfA9XamdgDu/uF4lLQUdRi7\n8UIqRqk/IRB/JMGzWkeFKVI43kC5KCafshzsl5M4NRNpkxxi7vkFzZAvyJMjB2jy\nNldMmjbJ+5xEf4ciNSRsMOwTruACN4Cps81k8YL+ESidczoV4lPeebWPo0F1ezRK\ncZOs2wL9iQKBgFHogT7vLj6+RQD5flYyy3HuxRJfF0uawApPBgsIfkznyWhPp/f5\nWwtu/rsnq7FeVUzIjU+pTEjzfsqG/jKoWQKUUx7HjSeznh1GOnYcN1De7CRe45Pn\nnCHbIMen7Vd0VyQIJ2Jp1oevDKSrJjwANOCb6ACHTqrefxvvqAVLVmUHAoGACrOd\nRXwlLq3gaCSOo9fJUhsSowpbL41oDqoBjdL4RvDhPkJY9RCv8FtPAQ9mDxCFY3rc\nX5VnOOvDLISqa+3SLEy/OPF1CNAsk6jKjUA7K6++ZdYmpjgYuN1yUcRo1xNl7ovI\n05YE25mE+Nir8jzRyYcq1pvb/PmFb5LZM0eujWkCgYBhiOym4rX53T+882sDuEkz\nl2J6gqSO5rLSufB0ya+lZC6KAz9mHLK6Xp6ptPYf3FheQ/fQcVl+v48mO3fp1Ucc\n5C2Tp1RBcsBGxh75Y0m2hXB/4RgeF4lv4/xQKgfLAhhWB4gEVk/+EmQNooBaMKXC\nAHUoYjHHEOmxdY8sQ0cQcg==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@invitaciones-7d704.iam.gserviceaccount.com",
  "client_id": "113246253994987920135",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40invitaciones-7d704.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Inicializar Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://invitaciones-7d704-default-rtdb.europe-west1.firebasedatabase.app' // Reemplaza con tu URL de Firebase
});

const db = admin.database();
const pointsRef = db.ref('points');

// Middleware para servir archivos estáticos (HTML, JS, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para manejar el postback de Wannads
app.get('/postback', async (req, res) => {
    res.set('Content-Type', 'text/plain');

    // Obtener parámetros del postback
    const user_id = req.query.user_id || null;
    const transaction_id = req.query.transaction_id || null;
    const reward = req.query.reward || null;
    const signature = req.query.signature || null;

    console.log('Postback received:', { user_id, transaction_id, reward, signature });

    // Validar que todos los parámetros estén presentes
    if (!user_id || !transaction_id || !reward || !signature) {
        console.log('Missing parameters:', { user_id, transaction_id, reward, signature });
        return res.status(400).send('ERROR: Missing parameters');
    }

    // Validar el signature (según la documentación de Wannads)
    const expected_signature = md5(user_id + transaction_id + reward + secret);
    if (expected_signature !== signature) {
        console.log('Invalid signature:', { received: signature, expected: expected_signature });
        return res.status(400).send('ERROR: Signature doesn\'t match');
    }

    try {
        // Leer los puntos actuales de Firebase
        const snapshot = await pointsRef.once('value');
        let points_data = snapshot.val() || {};

        // Inicializar los puntos del usuario si no existen
        if (!points_data[user_id]) {
            points_data[user_id] = { amount: 0, timestamp: Date.now() };
        }

        // Sumar los nuevos puntos
        points_data[user_id].amount += parseInt(reward);
        points_data[user_id].timestamp = Date.now();

        // Guardar los puntos en Firebase
        await pointsRef.set(points_data);
        console.log('Points saved to Firebase:', points_data[user_id]);

        console.log('Postback processed:', { user_id, reward });
        res.status(200).send('OK');
    } catch (error) {
        console.error('Error saving to Firebase:', error);
        res.status(500).send('ERROR: Failed to save points');
    }
});

// Ruta para consultar los puntos (equivalente a get-points.php)
app.get('/get-points', async (req, res) => {
    const user_id = req.query.userId || null;
    console.log('Get-points invoked with userId:', user_id);

    if (!user_id) {
        console.log('Missing userId');
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        // Leer los puntos de Firebase
        const snapshot = await pointsRef.once('value');
        const points_data = snapshot.val() || {};

        if (!points_data[user_id]) {
            console.log('No points found for userId:', user_id);
            return res.status(200).json({ amount: 0, timestamp: 0 });
        }

        const user_points = points_data[user_id];
        console.log('Points found for userId:', user_id, 'Amount:', user_points.amount);
        res.status(200).json({ amount: user_points.amount, timestamp: user_points.timestamp });
    } catch (error) {
        console.error('Error reading from Firebase:', error);
        res.status(500).json({ error: 'Failed to read points' });
    }
});

// Exportar el servidor para Vercel
module.exports = app;
