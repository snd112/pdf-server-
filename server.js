const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

const API_KEY = "snd555890@gmail.com_uLGPYgZzIHAGQvqr7Po2n0TZTrZz4QAifx8oWL1EqFZkcEwDIG93C8pI7cIrdbTH"; // حط مفتاح PDF.co هنا

app.use(express.json());

// 🟢 الصفحة الرئيسية
app.get("/", (req, res) => {
  res.send("🔥 PDF Server شغال");
});

// 🟢 PDF → Text
app.post("/pdf-to-text", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const response = await fetch("https://api.pdf.co/v1/pdf/convert/to/text", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "",
        file: fs.readFileSync(filePath).toString("base64"),
      }),
    });

    const data = await response.json();
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 PDF → JPG
app.post("/pdf-to-jpg", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const response = await fetch("https://api.pdf.co/v1/pdf/convert/to/jpg", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: fs.readFileSync(filePath).toString("base64"),
      }),
    });

    const data = await response.json();
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 PDF → Word
app.post("/pdf-to-doc", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const response = await fetch("https://api.pdf.co/v1/pdf/convert/to/doc", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: fs.readFileSync(filePath).toString("base64"),
      }),
    });

    const data = await response.json();
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 PDF → PNG
app.post("/pdf-to-png", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const response = await fetch("https://api.pdf.co/v1/pdf/convert/to/png", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: fs.readFileSync(filePath).toString("base64"),
      }),
    });

    const data = await response.json();
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚀 تشغيل السيرفر
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
