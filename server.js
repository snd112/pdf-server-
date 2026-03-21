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
    res.json({ status: "ok", message: "PDF PRO MAX" });
});

app.get("/api/status", (req, res) => {
    res.json({ status: "ok" });
});

// أسهل endpoint: PDF to Word
app.post("/api/pdf-to-word", upload.single("file"), async (req, res) => {
    try {
        console.log("📥 استلام طلب");
        
        if (!req.file) {
            console.log("❌ لا يوجد ملف");
            return res.status(400).json({ error: "لا يوجد ملف" });
        }
        
        console.log(`📄 اسم الملف: ${req.file.originalname}`);
        console.log(`📦 حجم الملف: ${req.file.size} بايت`);
        
        // 1. رفع الملف
        console.log("📤 جاري رفع الملف إلى PDF.co...");
        const formData = new FormData();
        formData.append("file", req.file.buffer, req.file.originalname);
        
        const uploadRes = await fetch("https://api.pdf.co/v1/file/upload", {
            method: "POST",
            headers: { "x-api-key": API_KEY },
            body: formData
        });
        
        const uploadData = await uploadRes.json();
        console.log("📤 رد رفع الملف:", JSON.stringify(uploadData));
        
        if (!uploadData.url) {
            return res.json({ error: "فشل رفع الملف: " + JSON.stringify(uploadData) });
        }
        
        console.log("✅ تم رفع الملف:", uploadData.url);
        
        // 2. التحويل
        console.log("🔄 جاري التحويل إلى Word...");
        const convertRes = await fetch("https://api.pdf.co/v1/pdf/convert", {
            method: "POST",
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: uploadData.url,
                outputFormat: "docx",
                async: false
            })
        });
        
        const convertData = await convertRes.json();
        console.log("🔄 رد التحويل:", JSON.stringify(convertData));
        
        // 3. إرجاع النتيجة
        if (convertData.url) {
            return res.json({ url: convertData.url });
        }
        
        if (convertData.files && convertData.files[0] && convertData.files[0].url) {
            return res.json({ url: convertData.files[0].url });
        }
        
        return res.json({ 
            error: convertData.error || convertData.message || "فشل التحويل",
            details: convertData
        });
        
    } catch (err) {
        console.error("❌ خطأ:", err.message);
        res.json({ error: err.message });
    }
});

// PDF to JPG
app.post("/api/pdf-to-jpg", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ error: "لا يوجد ملف" });
        }
        
        console.log("📥 PDF to JPG:", req.file.originalname);
        
        const formData = new FormData();
        formData.append("file", req.file.buffer, req.file.originalname);
        
        const uploadRes = await fetch("https://api.pdf.co/v1/file/upload", {
            method: "POST",
            headers: { "x-api-key": API_KEY },
            body: formData
        });
        
        const uploadData = await uploadRes.json();
        
        if (!uploadData.url) {
            return res.json({ error: "فشل رفع الملف" });
        }
        
        const convertRes = await fetch("https://api.pdf.co/v1/pdf/convert/to/jpg", {
            method: "POST",
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: uploadData.url,
                pages: "1",
                async: false
            })
        });
        
        const convertData = await convertRes.json();
        
        if (convertData.files && convertData.files[0]) {
            return res.json({ url: convertData.files[0].url });
        }
        
        return res.json({ error: convertData.error || "فشل التحويل" });
        
    } catch (err) {
        res.json({ error: err.message });
    }
});

// JPG to PDF
app.post("/api/jpg-to-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ error: "لا يوجد ملف" });
        }
        
        console.log("📥 JPG to PDF:", req.file.originalname);
        
        const formData = new FormData();
        formData.append("file", req.file.buffer, req.file.originalname);
        
        const uploadRes = await fetch("https://api.pdf.co/v1/file/upload", {
            method: "POST",
            headers: { "x-api-key": API_KEY },
            body: formData
        });
        
        const uploadData = await uploadRes.json();
        
        if (!uploadData.url) {
            return res.json({ error: "فشل رفع الملف" });
        }
        
        const convertRes = await fetch("https://api.pdf.co/v1/pdf/convert/from/image", {
            method: "POST",
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: uploadData.url,
                async: false
            })
        });
        
        const convertData = await convertRes.json();
        
        if (convertData.url) {
            return res.json({ url: convertData.url });
        }
        
        return res.json({ error: convertData.error || "فشل التحويل" });
        
    } catch (err) {
        res.json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 Server running on port ${PORT}`);
});
