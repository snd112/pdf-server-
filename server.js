const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const cors = require("cors");
const FormData = require("form-data");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// إعداد multer للرفع
const upload = multer({ 
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB حد أقصى
    storage: multer.memoryStorage()
});

const API_KEY = "a568hm8@gmail.com_odyW3q4nA6wA1XgMy6m5lMVDxZp39jaDDknjPVLQpN4dDDmN69yMk8HF7pIi5Rze";

// صفحة رئيسية
app.get("/", (req, res) => {
    res.json({ 
        status: "running", 
        message: "🔥 PDF PRO MAX SERVER",
        endpoints: [
            "/api/pdf-to-word",
            "/api/pdf-to-excel", 
            "/api/pdf-to-ppt",
            "/api/pdf-to-jpg",
            "/api/word-to-pdf",
            "/api/excel-to-pdf",
            "/api/ppt-to-pdf",
            "/api/jpg-to-pdf",
            "/api/merge-pdf",
            "/api/compress-pdf",
            "/api/protect-pdf",
            "/api/unlock-pdf",
            "/api/ocr-pdf"
        ]
    });
});

// دالة رفع الملف
async function uploadFile(file) {
    const form = new FormData();
    form.append("file", file.buffer, file.originalname);

    const r = await fetch("https://api.pdf.co/v1/file/upload", {
        method: "POST",
        headers: { "x-api-key": API_KEY },
        body: form
    });

    const data = await r.json();
    if (!data.url) {
        throw new Error(data.error || "فشل رفع الملف");
    }
    return data.url;
}

// دالة انتظار النتيجة
async function waitForResult(jobUrl, maxWait = 90000, interval = 3000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
        await new Promise(resolve => setTimeout(resolve, interval));
        
        const response = await fetch(jobUrl, {
            headers: { "x-api-key": API_KEY }
        });
        
        const data = await response.json();
        
        if (data.status === "success") {
            return data;
        }
        
        if (data.status === "error" || data.error) {
            throw new Error(data.error || data.message || "فشلت المعالجة");
        }
    }
    
    throw new Error("انتهت المهلة (90 ثانية)");
}

// دالة التحويل الأساسية
async function convertAndWait(url, endpoint, extra = {}) {
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "x-api-key": API_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            url: url,
            async: true,
            ...extra
        })
    });
    
    const data = await response.json();
    
    if (data.error) {
        throw new Error(data.error);
    }
    
    if (data.url) {
        return await waitForResult(data.url);
    }
    
    throw new Error("لم يتم استلام job url");
}

// PDF to Word
app.post("/api/pdf-to-word", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const fileUrl = await uploadFile(req.file);
        const result = await convertAndWait(fileUrl, "https://api.pdf.co/v1/pdf/convert", {
            outputFormat: "docx"
        });
        
        if (result.files && result.files[0]) {
            res.json({ url: result.files[0].url });
        } else {
            res.json({ error: "لم يتم العثور على رابط" });
        }
    } catch (e) {
        res.json({ error: e.message });
    }
});

// PDF to Excel
app.post("/api/pdf-to-excel", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const fileUrl = await uploadFile(req.file);
        const result = await convertAndWait(fileUrl, "https://api.pdf.co/v1/pdf/convert", {
            outputFormat: "xlsx"
        });
        
        if (result.files && result.files[0]) {
            res.json({ url: result.files[0].url });
        } else {
            res.json({ error: "لم يتم العثور على رابط" });
        }
    } catch (e) {
        res.json({ error: e.message });
    }
});

// PDF to PPT
app.post("/api/pdf-to-ppt", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const fileUrl = await uploadFile(req.file);
        const result = await convertAndWait(fileUrl, "https://api.pdf.co/v1/pdf/convert", {
            outputFormat: "pptx"
        });
        
        if (result.files && result.files[0]) {
            res.json({ url: result.files[0].url });
        } else {
            res.json({ error: "لم يتم العثور على رابط" });
        }
    } catch (e) {
        res.json({ error: e.message });
    }
});

// PDF to JPG
app.post("/api/pdf-to-jpg", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const fileUrl = await uploadFile(req.file);
        const result = await convertAndWait(fileUrl, "https://api.pdf.co/v1/pdf/convert/to/jpg", {
            pages: "1-9999"
        });
        
        if (result.files && result.files.length > 0) {
            const urls = result.files.map(f => f.url);
            res.json({ urls: urls });
        } else {
            res.json({ error: "لم يتم العثور على رابط" });
        }
    } catch (e) {
        res.json({ error: e.message });
    }
});

// Word to PDF
app.post("/api/word-to-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const fileUrl = await uploadFile(req.file);
        const result = await convertAndWait(fileUrl, "https://api.pdf.co/v1/pdf/convert/from/doc");
        
        if (result.files && result.files[0]) {
            res.json({ url: result.files[0].url });
        } else {
            res.json({ error: "لم يتم العثور على رابط" });
        }
    } catch (e) {
        res.json({ error: e.message });
    }
});

// Excel to PDF
app.post("/api/excel-to-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const fileUrl = await uploadFile(req.file);
        const result = await convertAndWait(fileUrl, "https://api.pdf.co/v1/pdf/convert/from/xls");
        
        if (result.files && result.files[0]) {
            res.json({ url: result.files[0].url });
        } else {
            res.json({ error: "لم يتم العثور على رابط" });
        }
    } catch (e) {
        res.json({ error: e.message });
    }
});

// PPT to PDF
app.post("/api/ppt-to-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const fileUrl = await uploadFile(req.file);
        const result = await convertAndWait(fileUrl, "https://api.pdf.co/v1/pdf/convert/from/ppt");
        
        if (result.files && result.files[0]) {
            res.json({ url: result.files[0].url });
        } else {
            res.json({ error: "لم يتم العثور على رابط" });
        }
    } catch (e) {
        res.json({ error: e.message });
    }
});

// JPG to PDF
app.post("/api/jpg-to-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const fileUrl = await uploadFile(req.file);
        const result = await convertAndWait(fileUrl, "https://api.pdf.co/v1/pdf/convert/from/image");
        
        if (result.files && result.files[0]) {
            res.json({ url: result.files[0].url });
        } else {
            res.json({ error: "لم يتم العثور على رابط" });
        }
    } catch (e) {
        res.json({ error: e.message });
    }
});

// دمج PDF
app.post("/api/merge-pdf", upload.array("file", 10), async (req, res) => {
    try {
        if (!req.files || req.files.length < 2) {
            return res.json({ error: "يجب رفع ملفين على الأقل للدمج" });
        }
        
        const urls = [];
        for (const file of req.files) {
            const url = await uploadFile(file);
            urls.push(url);
        }
        
        const result = await convertAndWait(null, "https://api.pdf.co/v1/pdf/merge", {
            urls: urls
        });
        
        if (result.files && result.files[0]) {
            res.json({ url: result.files[0].url });
        } else {
            res.json({ error: "لم يتم العثور على رابط" });
        }
    } catch (e) {
        res.json({ error: e.message });
    }
});

// ضغط PDF
app.post("/api/compress-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const fileUrl = await uploadFile(req.file);
        const result = await convertAndWait(fileUrl, "https://api.pdf.co/v1/pdf/optimize", {
            profile: "compress"
        });
        
        if (result.files && result.files[0]) {
            res.json({ url: result.files[0].url });
        } else {
            res.json({ error: "لم يتم العثور على رابط" });
        }
    } catch (e) {
        res.json({ error: e.message });
    }
});

// حماية PDF
app.post("/api/protect-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const fileUrl = await uploadFile(req.file);
        const result = await convertAndWait(fileUrl, "https://api.pdf.co/v1/pdf/security/add", {
            password: "123456",
            permissions: "all"
        });
        
        if (result.files && result.files[0]) {
            res.json({ url: result.files[0].url });
        } else {
            res.json({ error: "لم يتم العثور على رابط" });
        }
    } catch (e) {
        res.json({ error: e.message });
    }
});

// OCR PDF
app.post("/api/ocr-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const fileUrl = await uploadFile(req.file);
        const result = await convertAndWait(fileUrl, "https://api.pdf.co/v1/pdf/convert/to/searchable", {
            language: "ara+eng"
        });
        
        if (result.files && result.files[0]) {
            res.json({ url: result.files[0].url });
        } else {
            res.json({ error: "لم يتم العثور على رابط" });
        }
    } catch (e) {
        res.json({ error: e.message });
    }
});

// حالة السيرفر
app.get("/api/status", (req, res) => {
    res.json({ 
        status: "running", 
        timestamp: new Date().toISOString(),
        apiKey: API_KEY.substring(0, 20) + "..."
    });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 PDF PRO MAX SERVER running on port ${PORT}`);
});
