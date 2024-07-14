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
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
const corsOptions = {
    origin: ['https://firestore-form2-4cyg.vercel.app', 'http://127.0.0.1:3000','http://127.0.0.1:3002','https://form-kohl-zeta.vercel.app'],
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
app.get('/', (req, res) => {
    res.send({"message":"API is working"})
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

/*
FIREBASE_SERVICE_ACCOUNT_KEY='{
  "type": "service_account",
  "project_id": "uplifted-smile-397111",
  "private_key_id": "3e7e0c6af788415cc0870bdb05b3f1165c4a9e14",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDNJcv49YpX+4WI\nfzr4Mfp8gP3dFkYEWKu1rbfpPqLdPbvAhF9E2wD9n3o43RF9yVfxhJYd91vrPffc\n9DiQhNm1kvKYxFPJnVS1iJ+zoes6crRu0vJcf4l/vWBs+UOVoG3D0i1555/IeRad\nWJ2SDUgGy54O6t/shTgcP/QPQ194cSP5OWa2hZCTuK22mzHCi1EJwJOCf7+c//zf\n6S6QfZkPWHQA5Ui9ePgMTIDCY4HoKoH1GkK+UWSbjx1jyqO74nO0feDSPA5z7C23\njj3SQcYQUqkxrP3W+BDyIixaaQYc43f1IvLVhOM0z8uqFbjZjNrrQMB0JzVhf5gB\nqAp1ANE5AgMBAAECggEACe7e07jl4DE2S7/nVc2rtHwVbq9NqBe4BrW43jMRdTdw\nQBfYug+FmoIui5LOrkHBv5i9IQnRWlBXkEwF8h9woC1TkEiPSweSarDJFMxOBLg5\nmtUddZOaT4RWpyghmNzZ+72RRKINt0n/qZI5HPGGL4gL6Op/+aaQqzOAiH2pYX44\ntuWjT0sSOXUxr4mmtuUOMhc8zQd6AtXXw102RaCZwwDr2Zkg/vZbLsx+lvisBuG8\nf1zFBvxK4Cxit8yeZmJiCW5twBfxf+LkaPJzmxSmv/tbJPZkeQJoCD5XSHhxMQU0\nw4PDMtUTCqUG+SjV0+U1FHtGANftU2zt3tdZtFStpQKBgQDyPU1AA8Q2Ki0M4QW1\nORFVnT4sYAqCGSnTMCK1EDEU00sv/fAJpno6DRBUMbWktpPGTW/NRwyHpNydy+Fr\nsMtSJs/UagDxV6PAoAduQy7uHvOlUXG++Xq5fFkrWAAVVJzZFYO9AKAfJ76ZcZuT\nhtCBQWRusnmuVhb1FrKxBfLRrQKBgQDYzRkMyYPbkdQkmOO9jo6wH2kE89ibk4oe\niW/RwHH/rZs+hi006uDM3nJgR7p4NIhIKV5kTVAMOLAglZrT4sVLE0yzPXAMfDF9\nn3lfzVVfi7Z/D2ceFDd+kzis4Zj9P+JHcew8s5LAFJB4fjxPVgAO50krpg1vijVS\n4x17LnGnPQKBgQCXp/VjLHh9CK6nr4FpUc8ecJFqKr6pcKOUykAQZ5Cy3w3lf+/1\nurou+drNO0njU0L1Fan3NJINohNU3z3DtC22wwG+lJb+gcXNZOMCDyGkhtA3IeQ6\nkepZkhYpYrC6qfyAlE2j2G5m0vUrD8s881w6b/w2qZowoUlCK/G3jmfVCQKBgQCN\npfte6m7XT8E+pBHwMKszkWIpVTTJ+Sy95OgFMGqLNZ9/y2TP9UIpOJGcLGE91nzQ\nQQ8mE4lgYs1YjMaa98gV1CdB2LtTvPUM8dv4Zw0Hnx3+iE7ETUswzPmzorY1iL7M\nFTfXNTCFhSobP8chwrvJAP5CoXyXysIqRK9nYyHotQKBgDs7Hu04QSH4gtZqcmlF\nz3T32zrFFWhfhsUhe1NR0GUzZmU91v22/JA4YjRMclJrAtApX0D7QjP37GLMSSCe\niPV+kdmiMrWq+a54geihpvbaXqMS2qXhvuRn/vG90XiSTIDJLK2dBk6ssxr4E99y\n9T+3ddfm0QagEkiU4YdCp5DR\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-wdhwv@uplifted-smile-397111.iam.gserviceaccount.com",
  "client_id": "101068993991702865969",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-wdhwv%40uplifted-smile-397111.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}'*/