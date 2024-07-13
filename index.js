const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const { body, validationResult } = require('express-validator');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Parse the service account key from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// Initialize Firestore
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
const corsOptions = {
    origin: ['https://firestore-form2.vercel.app/submitForm', 'http://localhost:3000'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.post('/submitForm', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    try {
        const docRef = await db.collection('forms').add({
            name,
            email,
            message,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(201).send(`Form submitted with ID: ${docRef.id}`);
    } catch (error) {
        res.status(500).send('Error adding form: ' + error.message);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
