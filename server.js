const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Key
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

// Main endpoint for all tools
app.post('/api/:endpoint', upload.single('file'), async (req, res) => {
    try {
        const { endpoint } = req.params;
        const file = req.file;
        
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        let extraParams = {};
        
        // Special parameters for specific endpoints
        if (endpoint === 'pdf/convert/to/jpg' || endpoint === 'pdf/convert/to/png') {
            extraParams.pages = req.body.pages || '1-10';
        }
        if (endpoint === 'pdf/compress') {
            extraParams.profile = 'web';
        }
        if (endpoint === 'pdf/split') {
            extraParams.pages = req.body.pages || '1';
        }
        
        const result = await callPdfCo(endpoint, file.path, extraParams);
        
        // Clean up temp file
        try { fs.unlinkSync(file.path); } catch(e) {}
        
        res.json(result);
    } catch (error) {
        console.error('API Error:', error.message);
        try { if(req.file) fs.unlinkSync(req.file.path); } catch(e) {}
        res.status(500).json({ error: error.message });
    }
});

// Merge multiple files
app.post('/api/pdf/merge', upload.array('files', 10), async (req, res) => {
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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'PDF Professional Suite is running',
        timestamp: new Date().toISOString(),
        tools: '100+',
        api_ready: true
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ PDF Professional Suite Server Running`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`📍 Health Check: http://localhost:${PORT}/health`);
    console.log(`📍 API Ready: ${PDF_CO_API}`);
});
