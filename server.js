require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const MIDTRANS_URL = 'https://api.sandbox.midtrans.com/v2/charge';

app.post('/charge', async (req, res) => {
    try {
        const authString = Buffer.from(SERVER_KEY + ':').toString('base64');

        const response = await axios.post(MIDTRANS_URL, req.body, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authString}`
            }
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Midtrans API Error:', error.response ? error.response.data : error.message);

        const status = error.response ? error.response.status : 500;
        const data = error.response ? error.response.data : { message: 'Internal Server Error', error: error.message };

        res.status(status).json(data);
    }
});

app.get('/status/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const authString = Buffer.from(SERVER_KEY + ':').toString('base64');
        const statusUrl = `https://api.sandbox.midtrans.com/v2/${orderId}/status`;

        const response = await axios.get(statusUrl, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authString}`
            }
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Status Error:', error.response ? error.response.data : error.message);
        const status = error.response ? error.response.status : 500;
        const data = error.response ? error.response.data : { message: 'Error checking status' };
        res.status(status).json(data);
    }
});

app.listen(PORT, () => {
    console.log('\n\x1b[32m%s\x1b[0m', '──────────────────────────────────────────────────');
    console.log('\x1b[36m%s\x1b[4m%s\x1b[0m', '  Akses di: ', `http://localhost:${PORT}`);
    console.log('\x1b[32m%s\x1b[0m', '──────────────────────────────────────────────────\n');
});
