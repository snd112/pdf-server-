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

// ================= رفع الملف =================
async function uploadFile(filePath){
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const res = await axios.post(`${BASE}/file/upload`, formData, {
        headers:{
            ...formData.getHeaders(),
            "x-api-key": API_KEY
        }
    });

    if(!res.data.url) throw new Error("Upload failed");

    return res.data.url;
}

// ================= تنفيذ =================
async function run(endpoint, body){
    const res = await axios.post(`${BASE}/${endpoint}`, body, {
        headers:{
            "x-api-key": API_KEY
        },
        timeout:120000
    });

    return res.data;
}

// ================= الأدوات =================
const tools = {

    // 🔥 تحويلات قوية
    "pdf-to-word": u => run("pdf/convert/to/docx", { url:u }),
    "pdf-to-excel": u => run("pdf/convert/to/xlsx", { url:u }),
    "pdf-to-ppt": u => run("pdf/convert/to/pptx", { url:u }),

    "word-to-pdf": u => run("pdf/convert/from/doc", { url:u }),
    "excel-to-pdf": u => run("pdf/convert/from/xls", { url:u }),
    "ppt-to-pdf": u => run("pdf/convert/from/ppt", { url:u }),

    "pdf-to-jpg": u => run("pdf/convert/to/jpg", { url:u, pages:"0-" }),
    "pdf-to-png": u => run("pdf/convert/to/png", { url:u }),
    "jpg-to-pdf": u => run("pdf/convert/from/image", { url:u }),

    "pdf-to-text": u => run("pdf/convert/to/text", { url:u }),

    // 📂 إدارة
    "merge-pdf": u => run("pdf/merge2", { url:u }),
    "split-pdf": u => run("pdf/split", { url:u }),

    // ⚡ تحسين
    "compress-pdf": u => run("pdf/optimize", { url:u, profile:"web" }),

    // ✏️ تعديل
    "watermark": u => run("pdf/edit/add", { url:u, text:"PDFORGE" }),
    "rotate-pdf": u => run("pdf/rotate", { url:u }),

    // 🔒 حماية
    "protect-pdf": u => run("pdf/security/add", { url:u, password:"123456" }),
    "unlock-pdf": u => run("pdf/security/remove", { url:u }),

    // 🧠 OCR
    "ocr": u => run("pdf/convert/to/searchable", { url:u }),

    // 📊 استخراج
    "extract-images": u => run("pdf/extract/images", { url:u }),
    "pdf-info": u => run("pdf/info", { url:u }),
};

// ================= API =================
app.post('/api/:tool', upload.single('file'), async (req, res) => {
    let filePath;

    try {
        const tool = req.params.tool;

        if (!req.file){
            return res.status(400).json({ error: "❌ No file" });
        }

        filePath = req.file.path;

        let fn = tools[tool];

        // 💀 fallback
        if(!fn){
            console.log("Unknown tool:", tool);
            fn = tools["pdf-to-jpg"];
        }

        // 🔥 رفع
        const fileUrl = await uploadFile(filePath);

        // 🔥 تنفيذ
        const result = await fn(fileUrl);

        fs.unlinkSync(filePath);

        res.json(result);

    } catch (err) {

        if (filePath && fs.existsSync(filePath)){
            fs.unlinkSync(filePath);
        }

        res.status(500).json({
            error: true,
            message: err.response?.data || err.message
        });
    }
});

// ================= health =================
app.get('/health', (req, res) => {
    res.json({ status: 'OK 🚀 PDF PRO MAX' });
});

// ================= root =================
app.get('/', (req, res) => {
    res.send("🔥 PDF SERVER LIVE");
});

// ================= تشغيل =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🔥 SERVER RUNNING ON " + PORT);
});
