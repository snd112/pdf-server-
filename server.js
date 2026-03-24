const express = require("express");
const multer = require("multer");
const cors = require("cors");
const compression = require("compression");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(compression());

// 🔥 مهم: يخلي index يفتح
app.use(express.static("public"));

// تحميل الملفات الناتجة
app.use("/outputs", express.static("outputs"));

// ===== ENV =====
const PUBLIC_KEY = process.env.ILOVEPDF_PUBLIC;
const SECRET_KEY = process.env.ILOVEPDF_SECRET;

// ===== FOLDERS =====
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("outputs")) fs.mkdirSync("outputs");

// ===== UPLOAD =====
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }
});

// ===== HELPER =====
async function runILovePDF(tool, files = [], extra = {}) {
  try {
    const start = await axios.post(
      "https://api.ilovepdf.com/v1/start",
      { public_key: PUBLIC_KEY },
      { params: { tool } }
    );

    const { server, task } = start.data;

    // upload files
    for (let file of files) {
      const form = new FormData();
      form.append("file", fs.createReadStream(file));

      await axios.post(`${server}/v1/upload`, form, {
        headers: form.getHeaders(),
        params: { task }
      });
    }

    // process
    await axios.post(`${server}/v1/process`, extra, {
      params: { task, tool }
    });

    // download
    const res = await axios.get(`${server}/v1/download`, {
      params: { task },
      responseType: "stream"
    });

    const filename = `${Date.now()}_${Math.floor(Math.random()*10000)}.zip`;
    const filepath = path.join("outputs", filename);

    const writer = fs.createWriteStream(filepath);
    res.data.pipe(writer);

    return new Promise((resolve) => {
      writer.on("finish", () => resolve(`/outputs/${filename}`));
    });

  } catch (e) {
    console.log("🔥 ERROR:", e.response?.data || e.message);
    return null;
  }
}

// ================= ROUTES =================

// دمج
app.post("/merge", upload.array("files"), async (req, res) => {
  const r = await runILovePDF("merge", req.files.map(f => f.path));
  res.json(r ? { url: r } : { error: true });
});

// تقسيم
app.post("/split", upload.array("files"), async (req, res) => {
  const r = await runILovePDF("split", req.files.map(f => f.path));
  res.json(r ? { url: r } : { error: true });
});

// ضغط
app.post("/compress", upload.array("files"), async (req, res) => {
  const r = await runILovePDF("compress", req.files.map(f => f.path));
  res.json(r ? { url: r } : { error: true });
});

// PDF → Word
app.post("/pdf-to-word", upload.array("files"), async (req, res) => {
  const r = await runILovePDF("pdfword", req.files.map(f => f.path));
  res.json(r ? { url: r } : { error: true });
});

// Word → PDF
app.post("/word-to-pdf", upload.array("files"), async (req, res) => {
  const r = await runILovePDF("officepdf", req.files.map(f => f.path));
  res.json(r ? { url: r } : { error: true });
});

// PDF → PPT
app.post("/pdf-to-ppt", upload.array("files"), async (req, res) => {
  const r = await runILovePDF("pdfpowerpoint", req.files.map(f => f.path));
  res.json(r ? { url: r } : { error: true });
});

// PPT → PDF
app.post("/ppt-to-pdf", upload.array("files"), async (req, res) => {
  const r = await runILovePDF("officepdf", req.files.map(f => f.path));
  res.json(r ? { url: r } : { error: true });
});

// PDF → Excel
app.post("/pdf-to-excel", upload.array("files"), async (req, res) => {
  const r = await runILovePDF("pdfexcel", req.files.map(f => f.path));
  res.json(r ? { url: r } : { error: true });
});

// Excel → PDF
app.post("/excel-to-pdf", upload.array("files"), async (req, res) => {
  const r = await runILovePDF("officepdf", req.files.map(f => f.path));
  res.json(r ? { url: r } : { error: true });
});

// PDF → JPG
app.post("/pdf-to-jpg", upload.array("files"), async (req, res) => {
  const r = await runILovePDF("pdfjpg", req.files.map(f => f.path));
  res.json(r ? { url: r } : { error: true });
});

// JPG → PDF
app.post("/jpg-to-pdf", upload.array("files"), async (req, res) => {
  const r = await runILovePDF("imagepdf", req.files.map(f => f.path));
  res.json(r ? { url: r } : { error: true });
});

// حماية
app.post("/protect", upload.array("files"), async (req, res) => {
  const r = await runILovePDF("protect", req.files.map(f => f.path), {
    password: "123456"
  });
  res.json(r ? { url: r } : { error: true });
});

// فك حماية
app.post("/unlock", upload.array("files"), async (req, res) => {
  const r = await runILovePDF("unlock", req.files.map(f => f.path));
  res.json(r ? { url: r } : { error: true });
});

// تدوير
app.post("/rotate", upload.array("files"), async (req, res) => {
  const r = await runILovePDF("rotate", req.files.map(f => f.path));
  res.json(r ? { url: r } : { error: true });
});

// علامة مائية
app.post("/watermark", upload.array("files"), async (req, res) => {
  const r = await runILovePDF("watermark", req.files.map(f => f.path), {
    text: "PDFORGE"
  });
  res.json(r ? { url: r } : { error: true });
});

// HTML → PDF
app.post("/html-to-pdf", async (req, res) => {
  const { url } = req.body;
  const r = await runILovePDF("htmlpdf", [], { url });
  res.json(r ? { url: r } : { error: true });
});

// OCR
app.post("/ocr", upload.array("files"), async (req, res) => {
  const r = await runILovePDF("ocr", req.files.map(f => f.path));
  res.json(r ? { url: r } : { error: true });
});

// ===== ROOT (لو مفيش index) =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// ===== START =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Running on", PORT);
});
