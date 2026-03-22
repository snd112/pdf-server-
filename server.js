const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();

// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json());
app.use(express.static('public'));

// PDF.co API Configuration
const API_KEY = "a568hm8@gmail.com_odyW3q4nA6wA1XgMy6m5lMVDxZp39jaDDknjPVLQpN4dDDmN69yMk8HF7pIi5Rze";
const PDF_CO_API = "https://api.pdf.co/v1";

// Helper function to call PDF.co API
async function callPdfCo(endpoint, filePath, extraParams = {}) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('apikey', API_KEY);
    formData.append('async', 'false');
    
    for (const [key, value] of Object.entries(extraParams)) {
        formData.append(key, value);
    }
    
    const response = await axios.post(`${PDF_CO_API}/${endpoint}`, formData, {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120000
    });
    
    return response.data;
}

// Universal endpoint for all conversions
app.post('/api/:endpoint', upload.single('file'), async (req, res) => {
    try {
        const { endpoint } = req.params;
        const file = req.file;
        
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        let extraParams = {};
        
        // Special parameters for specific conversions
        if (endpoint.includes('jpg') || endpoint.includes('png') || endpoint.includes('tiff') || endpoint.includes('webp')) {
            extraParams.pages = '1-50';
        }
        if (endpoint === 'pdf/compress') {
            extraParams.profile = 'web';
        }
        if (endpoint === 'pdf/split') {
            extraParams.pages = '1';
        }
        if (endpoint.includes('ocr')) {
            extraParams.ocr = 'true';
            extraParams.language = 'eng+ara';
        }
        
        const result = await callPdfCo(endpoint, file.path, extraParams);
        
        try { fs.unlinkSync(file.path); } catch(e) {}
        
        res.json(result);
    } catch (error) {
        console.error('Error:', error.message);
        try { if(req.file) fs.unlinkSync(req.file.path); } catch(e) {}
        res.status(500).json({ error: error.message });
    }
});

// Merge multiple files
app.post('/api/pdf/merge', upload.array('files', 20), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', fs.createReadStream(file.path));
        });
        formData.append('apikey', API_KEY);
        formData.append('async', 'false');
        
        const response = await axios.post(`${PDF_CO_API}/pdf/merge`, formData, {
            headers: formData.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        
        files.forEach(file => { try { fs.unlinkSync(file.path); } catch(e) {} });
        
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'PDF Professional Suite Running',
        timestamp: new Date().toISOString(),
        tools: '50+',
        api_connected: true
    });
});

// Root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ PDF Professional Suite Running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
});
