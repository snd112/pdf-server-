const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'] }));
app.use(express.json());
app.use(express.static('public'));

// PDF.co API Configuration
const API_KEY = "a568hm8@gmail.com_odyW3q4nA6wA1XgMy6m5lMVDxZp39jaDDknjPVLQpN4dDDmN69yMk8HF7pIi5Rze";
const PDF_CO_API = "https://api.pdf.co/v1";

async function callPdfCo(endpoint, filePath, extraParams = {}) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('apikey', API_KEY);
    formData.append('async', 'false');
    for (const [key, value] of Object.entries(extraParams)) formData.append(key, value);
    
    const response = await axios.post(`${PDF_CO_API}/${endpoint}`, formData, {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120000
    });
    return response.data;
}

// Main API endpoint
app.post('/api/:endpoint', upload.single('file'), async (req, res) => {
    let filePath = null;
    try {
        const { endpoint } = req.params;
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        
        filePath = req.file.path;
        let extraParams = {};
        
        if (endpoint.includes('jpg') || endpoint.includes('png') || endpoint.includes('tiff')) extraParams.pages = '1-50';
        if (endpoint === 'pdf/compress') extraParams.profile = 'web';
        if (endpoint === 'pdf/split') extraParams.pages = '1';
        
        const result = await callPdfCo(endpoint, filePath, extraParams);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.json(result);
    } catch (error) {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ error: error.message });
    }
});

// Merge multiple files
app.post('/api/pdf/merge', upload.array('files', 20), async (req, res) => {
    const filePaths = [];
    try {
        if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
        
        const formData = new FormData();
        req.files.forEach(file => {
            filePaths.push(file.path);
            formData.append('files', fs.createReadStream(file.path));
        });
        formData.append('apikey', API_KEY);
        formData.append('async', 'false');
        
        const response = await axios.post(`${PDF_CO_API}/pdf/merge`, formData, {
            headers: formData.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        
        filePaths.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });
        res.json(response.data);
    } catch (error) {
        filePaths.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'PDF Pro Suite Running', tools: '60+', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ PDF Pro Suite Running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
});
