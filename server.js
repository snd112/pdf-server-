const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();

// 📁 uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// 📤 multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ⚙️ middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 🔑 API
const API_KEY = "a568hm8@gmail.com_odyW3q4nA6wA1XgMy6m5lMVDxZp39jaDDknjPVLQpN4dDDmN69yMk8HF7pIi5Rze";
const BASE = "https://api.pdf.co/v1";

// 🔥 mapping الأدوات
const tools = {
    "pdf-to-jpg": "pdf/convert/to/jpg",
    "pdf-to-png": "pdf/convert/to/png",
    "pdf-to-text": "pdf/convert/to/text",
    "pdf-to-json": "pdf/convert/to/json",
    "pdf-to-html": "pdf/convert/to/html",
    "pdf-to-csv": "pdf/convert/to/csv",
    "pdf-to-xml": "pdf/convert/to/xml",
    "pdf-to-pdfa": "pdf/convert/to/pdfa",
    "pdf-to-searchable": "pdf/convert/to/searchable",

    "jpg-to-pdf": "pdf/convert/from/image",
    "html-to-pdf": "pdf/convert/from/html",

    "merge-pdf": "pdf/merge2",
    "split-pdf": "pdf/split",
    "delete-pages": "pdf/remove-pages",

    "compress-pdf": "pdf/optimize",

    "rotate-pdf": "pdf/rotate",
    "watermark": "pdf/edit/add",

    "protect-pdf": "pdf/security/add",
    "unlock-pdf": "pdf/security/remove",

    "extract-images": "pdf/extract/images",
    "pdf-info": "pdf/info"
};

// 🚀 تنفيذ
async function callPdfCo(endpoint, filePath, extra = {}) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    for (const [k, v] of Object.entries(extra)) {
        formData.append(k, v);
    }

    const res = await axios.post(`${BASE}/${endpoint}`, formData, {
        headers: {
            ...formData.getHeaders(),
            "x-api-key": API_KEY
        },
        timeout: 120000
    });

    return res.data;
}

// 🔥 API
app.post('/api/:tool', upload.single('file'), async (req, res) => {
    let filePath;

    try {
        const tool = req.params.tool;

        if (!req.file) {
            return res.status(400).json({ error: "❌ No file uploaded" });
        }

        filePath = req.file.path;

        let endpoint = tools[tool];

        // 🔥 fallback
        if (!endpoint) {
            console.log("⚠️ Unknown tool:", tool);
            endpoint = "pdf/convert/to/jpg";
        }

        let extra = {};

        // ⚡ تحسين حسب الأداة
        if (tool.includes("jpg") || tool.includes("png")) {
            extra.pages = "0-";
        }

        if (tool === "compress-pdf") {
            extra.profile = "web";
        }

        if (tool === "watermark") {
            extra.text = "PDFORGE";
        }

        if (tool === "protect-pdf") {
            extra.password = "123456";
        }

        const result = await callPdfCo(endpoint, filePath, extra);

        fs.unlinkSync(filePath);

        res.json(result);

    } catch (err) {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);

        res.status(500).json({
            error: true,
            message: err.message
        });
    }
});

// ❤️ health
app.get('/health', (req, res) => {
    res.json({ status: 'OK 🚀' });
});

app.get('/', (req, res) => {
    res.send("🔥 PDF SERVER RUNNING");
});

// 🚀 تشغيل
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🔥 SERVER STARTED ON " + PORT);
});
