require("dotenv").config();

const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const FormData = require("form-data");

const app = express();
const upload = multer();

app.use(express.json());
app.use(express.static("public"));

const API_KEY = process.env.API_KEY;

// ✅ الصفحة الرئيسية
app.get("/", (req, res) => {
  res.send("🔥 PDF PRO MAX SERVER WORKING 🔥");
});

// ✅ رفع الملف لـ PDF.co
async function uploadFile(buffer, name) {
  const form = new FormData();
  form.append("file", buffer, name);

  const res = await fetch("https://api.pdf.co/v1/file/upload", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY
    },
    body: form
  });

  const data = await res.json();
  return data.url;
}

// ✅ PDF → JPG
app.post("/api/pdf-to-jpg", upload.single("file"), async (req, res) => {
  try {
    const fileUrl = await uploadFile(req.file.buffer, req.file.originalname);

    const r = await fetch("https://api.pdf.co/v1/pdf/convert/to/jpg", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: fileUrl })
    });

    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ JPG → PDF
app.post("/api/jpg-to-pdf", upload.single("file"), async (req, res) => {
  try {
    const fileUrl = await uploadFile(req.file.buffer, req.file.originalname);

    const r = await fetch("https://api.pdf.co/v1/pdf/convert/from/image", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: fileUrl })
    });

    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ ضغط PDF
app.post("/api/compress-pdf", upload.single("file"), async (req, res) => {
  try {
    const fileUrl = await uploadFile(req.file.buffer, req.file.originalname);

    const r = await fetch("https://api.pdf.co/v1/pdf/optimize", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: fileUrl })
    });

    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ Merge PDF
app.post("/api/merge-pdf", upload.array("file"), async (req, res) => {
  try {
    let urls = [];

    for (let file of req.files) {
      let url = await uploadFile(file.buffer, file.originalname);
      urls.push(url);
    }

    const r = await fetch("https://api.pdf.co/v1/pdf/merge", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ urls: urls.join(",") })
    });

    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ Split PDF
app.post("/api/split-pdf", upload.single("file"), async (req, res) => {
  try {
    const fileUrl = await uploadFile(req.file.buffer, req.file.originalname);

    const r = await fetch("https://api.pdf.co/v1/pdf/split", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: fileUrl })
    });

    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ تشغيل السيرفر
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 SERVER RUNNING ON PORT " + PORT);
});
