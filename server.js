const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const cors = require("cors");
const FormData = require("form-data");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const API_KEY = "a568hm8@gmail.com_odyW3q4nA6wA1XgMy6m5lMVDxZp39jaDDknjPVLQpN4dDDmN69yMk8HF7pIi5Rze";

app.get("/", (req, res) => {
    res.json({ 
        status: "running", 
        message: "🔥 PDF PRO MAX SERVER",
        endpoints: [
            "/api/pdf-to-word", "/api/pdf-to-excel", "/api/pdf-to-ppt", "/api/pdf-to-jpg",
            "/api/word-to-pdf", "/api/excel-to-pdf", "/api/ppt-to-pdf", "/api/jpg-to-pdf",
            "/api/merge-pdf", "/api/compress-pdf"
        ]
    });
});

app.get("/api/status", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
});

// دالة رفع الملف
async function uploadFile(file) {
    const form = new FormData();
    form.append("file", file.buffer, file.originalname);

    const response = await fetch("https://api.pdf.co/v1/file/upload", {
        method: "POST",
        headers: { "x-api-key": API_KEY },
        body: form
    });

    const data = await response.json();
    if (!data.url) {
        throw new Error(data.error || data.message || "فشل رفع الملف");
    }
    return data.url;
}

// دالة انتظار النتيجة للمعالجة غير المتزامنة
async function waitForResult(jobUrl, maxWait = 60000) {
    const startTime = Date.now();
    const interval = 2000;
    
    while (Date.now() - startTime < maxWait) {
        await new Promise(resolve => setTimeout(resolve, interval));
        
        const response = await fetch(jobUrl, {
            headers: { "x-api-key": API_KEY }
        });
        
        const data = await response.json();
        
        if (data.status === "success") {
            return data;
        }
        
        if (data.status === "error") {
            throw new Error(data.error || "فشلت المعالجة");
        }
        
        console.log("⏳ جاري الانتظار...", data.status);
    }
    
    throw new Error("انتهت المهلة");
}

// ==================== الأدوات الأساسية ====================

// PDF to Word
app.post("/api/pdf-to-word", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        
        console.log("📄 تحويل PDF إلى Word:", req.file.originalname);
        
        // 1. رفع الملف
        const fileUrl = await uploadFile(req.file);
        console.log("✅ تم رفع الملف:", fileUrl);
        
        // 2. بدء التحويل
        const convertRes = await fetch("https://api.pdf.co/v1/pdf/convert", {
            method: "POST",
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: fileUrl,
                outputFormat: "docx",
                async: false  // استخدام متزامن عشان أسرع وأبسط
            })
        });
        
        const data = await convertRes.json();
        console.log("📥 رد التحويل:", JSON.stringify(data).substring(0, 300));
        
        if (data.error) {
            return res.json({ error: data.error });
        }
        
        if (data.url) {
            return res.json({ url: data.url });
        }
        
        if (data.files && data.files[0] && data.files[0].url) {
            return res.json({ url: data.files[0].url });
        }
        
        res.json({ error: "لم يتم العثور على رابط", response: data });
        
    } catch (e) {
        console.error("❌ خطأ:", e.message);
        res.json({ error: e.message });
    }
});

// PDF to Excel
app.post("/api/pdf-to-excel", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        
        const fileUrl = await uploadFile(req.file);
        
        const convertRes = await fetch("https://api.pdf.co/v1/pdf/convert", {
            method: "POST",
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: fileUrl,
                outputFormat: "xlsx",
                async: false
            })
        });
        
        const data = await convertRes.json();
        
        if (data.url) return res.json({ url: data.url });
        if (data.files?.[0]?.url) return res.json({ url: data.files[0].url });
        
        res.json({ error: data.error || "فشل التحويل" });
        
    } catch (e) {
        res.json({ error: e.message });
    }
});

// PDF to PPT
app.post("/api/pdf-to-ppt", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        
        const fileUrl = await uploadFile(req.file);
        
        const convertRes = await fetch("https://api.pdf.co/v1/pdf/convert", {
            method: "POST",
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: fileUrl,
                outputFormat: "pptx",
                async: false
            })
        });
        
        const data = await convertRes.json();
        
        if (data.url) return res.json({ url: data.url });
        if (data.files?.[0]?.url) return res.json({ url: data.files[0].url });
        
        res.json({ error: data.error || "فشل التحويل" });
        
    } catch (e) {
        res.json({ error: e.message });
    }
});

// PDF to JPG
app.post("/api/pdf-to-jpg", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        
        const fileUrl = await uploadFile(req.file);
        
        const convertRes = await fetch("https://api.pdf.co/v1/pdf/convert/to/jpg", {
            method: "POST",
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: fileUrl,
                pages: "1-10",
                async: false
            })
        });
        
        const data = await convertRes.json();
        
        if (data.files && data.files.length > 0) {
            const urls = data.files.map(f => f.url);
            return res.json({ urls: urls });
        }
        
        res.json({ error: data.error || "فشل التحويل" });
        
    } catch (e) {
        res.json({ error: e.message });
    }
});

// Word to PDF
app.post("/api/word-to-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        
        const fileUrl = await uploadFile(req.file);
        
        const convertRes = await fetch("https://api.pdf.co/v1/pdf/convert/from/doc", {
            method: "POST",
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: fileUrl,
                async: false
            })
        });
        
        const data = await convertRes.json();
        
        if (data.url) return res.json({ url: data.url });
        if (data.files?.[0]?.url) return res.json({ url: data.files[0].url });
        
        res.json({ error: data.error || "فشل التحويل" });
        
    } catch (e) {
        res.json({ error: e.message });
    }
});

// Excel to PDF
app.post("/api/excel-to-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        
        const fileUrl = await uploadFile(req.file);
        
        const convertRes = await fetch("https://api.pdf.co/v1/pdf/convert/from/xls", {
            method: "POST",
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: fileUrl,
                async: false
            })
        });
        
        const data = await convertRes.json();
        
        if (data.url) return res.json({ url: data.url });
        if (data.files?.[0]?.url) return res.json({ url: data.files[0].url });
        
        res.json({ error: data.error || "فشل التحويل" });
        
    } catch (e) {
        res.json({ error: e.message });
    }
});

// PPT to PDF
app.post("/api/ppt-to-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        
        const fileUrl = await uploadFile(req.file);
        
        const convertRes = await fetch("https://api.pdf.co/v1/pdf/convert/from/ppt", {
            method: "POST",
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: fileUrl,
                async: false
            })
        });
        
        const data = await convertRes.json();
        
        if (data.url) return res.json({ url: data.url });
        if (data.files?.[0]?.url) return res.json({ url: data.files[0].url });
        
        res.json({ error: data.error || "فشل التحويل" });
        
    } catch (e) {
        res.json({ error: e.message });
    }
});

// JPG to PDF
app.post("/api/jpg-to-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        
        const fileUrl = await uploadFile(req.file);
        
        const convertRes = await fetch("https://api.pdf.co/v1/pdf/convert/from/image", {
            method: "POST",
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: fileUrl,
                async: false,
                name: "output.pdf"
            })
        });
        
        const data = await convertRes.json();
        
        if (data.url) return res.json({ url: data.url });
        if (data.files?.[0]?.url) return res.json({ url: data.files[0].url });
        
        res.json({ error: data.error || "فشل التحويل" });
        
    } catch (e) {
        res.json({ error: e.message });
    }
});

// ضغط PDF
app.post("/api/compress-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        
        const fileUrl = await uploadFile(req.file);
        
        const convertRes = await fetch("https://api.pdf.co/v1/pdf/optimize", {
            method: "POST",
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: fileUrl,
                profile: "compress",
                async: false
            })
        });
        
        const data = await convertRes.json();
        
        if (data.url) return res.json({ url: data.url });
        if (data.files?.[0]?.url) return res.json({ url: data.files[0].url });
        
        res.json({ error: data.error || "فشل الضغط" });
        
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
        
        const mergeRes = await fetch("https://api.pdf.co/v1/pdf/merge", {
            method: "POST",
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                urls: urls,
                async: false
            })
        });
        
        const data = await mergeRes.json();
        
        if (data.url) return res.json({ url: data.url });
        if (data.files?.[0]?.url) return res.json({ url: data.files[0].url });
        
        res.json({ error: data.error || "فشل الدمج" });
        
    } catch (e) {
        res.json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 PDF PRO MAX SERVER running on port ${PORT}`);
    console.log(`📁 API Key: ${API_KEY.substring(0, 30)}...`);
});
