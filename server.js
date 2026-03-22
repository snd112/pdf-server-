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
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static('public'));

// API Configuration
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

// Main API endpoint
app.post('/api/:endpoint', upload.single('file'), async (req, res) => {
    let filePath = null;
    try {
        const { endpoint } = req.params;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        filePath = req.file.path;
        
        let extraParams = {};
        
        // Special parameters for specific endpoints
        if (endpoint.includes('jpg') || endpoint.includes('png') || endpoint.includes('tiff') || endpoint.includes('webp')) {
            extraParams.pages = '1-50';
        }
        if (endpoint === 'pdf/compress') {
            extraParams.profile = 'web';
        }
        if (endpoint === 'pdf/split') {
            extraParams.pages = '1';
        }
        
        const result = await callPdfCo(endpoint, filePath, extraParams);
        
        // Clean up
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Error:', error.message);
        
        // Clean up
        if (filePath && fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch(e) {}
        }
        
        res.status(500).json({ error: error.message || 'Conversion failed' });
    }
});

// Merge multiple files
app.post('/api/pdf/merge', upload.array('files', 20), async (req, res) => {
    const filePaths = [];
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        
        const formData = new FormData();
        files.forEach(file => {
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
        
        // Clean up
        filePaths.forEach(filePath => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
        
        res.json(response.data);
        
    } catch (error) {
        // Clean up
        filePaths.forEach(filePath => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'PDF Professional Suite is running',
        timestamp: new Date().toISOString(),
        tools: '50+'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ PDF Professional Suite Server Running`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
});
