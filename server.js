const express = require('express');
const md5 = require('md5');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
const port = 3000;

// Configuración
const secret = '461e007d2c'; // Reemplaza con tu SECRET de Wannads

// Inicializar Firebase
const serviceAccount = require('./firebase-adminsdk.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://your-project-id-default-rtdb.firebaseio.com' // Reemplaza con tu URL de Firebase Realtime Database
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

// Iniciar el servidor (para pruebas locales)
if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

// Exportar el servidor para Vercel
module.exports = app;
