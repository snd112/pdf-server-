const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const cors = require("cors");
const FormData = require("form-data");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ 
    limits: { fileSize: 50 * 1024 * 1024 },
    storage: multer.memoryStorage()
});

const API_KEY = "a568hm8@gmail.com_odyW3q4nA6wA1XgMy6m5lMVDxZp39jaDDknjPVLQpN4dDDmN69yMk8HF7pIi5Rze";

app.get("/", (req, res) => {
    res.json({ status: "running", message: "🔥 PDF PRO MAX SERVER" });
});

app.get("/api/status", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// دالة رفع الملف - ترجع الرابط المؤقت
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
        throw new Error(data.error || data.message || "فشل رفع الملف");
    }
    return data.url;
}

// دالة انتظار النتيجة مع إعادة المحاولة
async function waitForResult(jobUrl, maxWait = 120000, interval = 3000) {
    const startTime = Date.now();
    let lastError = null;
    
    while (Date.now() - startTime < maxWait) {
        await new Promise(resolve => setTimeout(resolve, interval));
        
        try {
            const response = await fetch(jobUrl, {
                headers: { "x-api-key": API_KEY }
            });
            
            const data = await response.json();
            
            if (data.status === "success") {
                return data;
            }
            
            if (data.status === "error" || data.error) {
                lastError = data.error || data.message;
                // نكمل الانتظار يمكن يكون خطأ مؤقت
                continue;
            }
            
            // status = "working" أو "waiting"
            console.log("جاري الانتظار... الحالة:", data.status);
            
        } catch (e) {
            lastError = e.message;
            console.log("خطأ مؤقت في الجلب:", e.message);
        }
    }
    
    throw new Error(lastError || "انتهت المهلة");
}

// دالة تحويل عامة مع معالجة أفضل للروابط
async function convertFile(file, endpoint, extra = {}) {
    // الخطوة 1: رفع الملف
    console.log("رفع الملف...");
    const fileUrl = await uploadFile(file);
    console.log("تم رفع الملف:", fileUrl);
    
    // الخطوة 2: إرسال طلب التحويل
    console.log("إرسال طلب التحويل إلى:", endpoint);
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "x-api-key": API_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            url: fileUrl,
            async: true,
            ...extra
        })
    });
    
    const data = await response.json();
    console.log("رد التحويل:", JSON.stringify(data).substring(0, 300));
    
    if (data.error) {
        throw new Error(data.error);
    }
    
    if (data.url) {
        // الخطوة 3: انتظار النتيجة
        console.log("انتظار النتيجة من:", data.url);
        const result = await waitForResult(data.url);
        console.log("النتيجة:", JSON.stringify(result).substring(0, 500));
        
        // التحقق من وجود الملفات
        if (result.files && result.files.length > 0) {
            // إضافة timestamp للرابط عشان يضمن عدم انتهاء الصلاحية
            const finalUrl = result.files[0].url;
            return { url: finalUrl };
        }
        
        throw new Error("لم يتم العثور على ملفات في النتيجة");
    }
    
    throw new Error("لم يتم استلام job url");
}

// ==================== الأدوات ====================

app.post("/api/pdf-to-word", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const result = await convertFile(req.file, "https://api.pdf.co/v1/pdf/convert", {
            outputFormat: "docx"
        });
        res.json(result);
    } catch (e) {
        console.error("خطأ في pdf-to-word:", e.message);
        res.json({ error: e.message });
    }
});

app.post("/api/pdf-to-excel", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const result = await convertFile(req.file, "https://api.pdf.co/v1/pdf/convert", {
            outputFormat: "xlsx"
        });
        res.json(result);
    } catch (e) {
        res.json({ error: e.message });
    }
});

app.post("/api/pdf-to-ppt", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const result = await convertFile(req.file, "https://api.pdf.co/v1/pdf/convert", {
            outputFormat: "pptx"
        });
        res.json(result);
    } catch (e) {
        res.json({ error: e.message });
    }
});

app.post("/api/pdf-to-jpg", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const result = await convertFile(req.file, "https://api.pdf.co/v1/pdf/convert/to/jpg", {
            pages: "1-9999"
        });
        res.json(result);
    } catch (e) {
        res.json({ error: e.message });
    }
});

app.post("/api/word-to-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const result = await convertFile(req.file, "https://api.pdf.co/v1/pdf/convert/from/doc");
        res.json(result);
    } catch (e) {
        res.json({ error: e.message });
    }
});

app.post("/api/excel-to-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const result = await convertFile(req.file, "https://api.pdf.co/v1/pdf/convert/from/xls");
        res.json(result);
    } catch (e) {
        res.json({ error: e.message });
    }
});

app.post("/api/ppt-to-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const result = await convertFile(req.file, "https://api.pdf.co/v1/pdf/convert/from/ppt");
        res.json(result);
    } catch (e) {
        res.json({ error: e.message });
    }
});

app.post("/api/jpg-to-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const result = await convertFile(req.file, "https://api.pdf.co/v1/pdf/convert/from/image");
        res.json(result);
    } catch (e) {
        res.json({ error: e.message });
    }
});

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
        
        const response = await fetch("https://api.pdf.co/v1/pdf/merge", {
            method: "POST",
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                urls: urls,
                async: true
            })
        });
        
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);
        if (!data.url) throw new Error("لم يتم استلام job url");
        
        const result = await waitForResult(data.url);
        if (result.files && result.files[0]) {
            res.json({ url: result.files[0].url });
        } else {
            res.json({ error: "لم يتم العثور على رابط" });
        }
    } catch (e) {
        res.json({ error: e.message });
    }
});

app.post("/api/compress-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.json({ error: "لم يتم رفع ملف" });
        const result = await convertFile(req.file, "https://api.pdf.co/v1/pdf/optimize", {
            profile: "compress"
        });
        res.json(result);
    } catch (e) {
        res.json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 PDF PRO MAX SERVER running on port ${PORT}`);
});
