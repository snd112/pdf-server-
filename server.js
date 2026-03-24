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
app.use(express.static("public"));
app.use("/outputs", express.static("outputs"));

// ===== ENV =====
const PUBLIC_KEY = process.env.ILOVEPDF_PUBLIC;

// ===== FOLDERS =====
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("outputs")) fs.mkdirSync("outputs");

// ===== UPLOAD =====
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }
});

// ===== HELPER =====
function getFiles(req) {
  if (req.files) return req.files.map(f => f.path);
  if (req.file) return [req.file.path];
  return [];
}

// ===== CORE API =====
async function runILovePDF(tool, files = [], extra = {}) {
  try {
    console.log("🚀 TOOL:", tool);

    // 1. start
    const start = await axios.post(
      "https://api.ilovepdf.com/v1/start",
      { public_key: PUBLIC_KEY },
      { params: { tool: tool } }
    );

    const { server, task } = start.data;

    // 2. upload
    for (let file of files) {
      const form = new FormData();
      form.append("file", fs.createReadStream(file));

      await axios.post(`${server}/v1/upload`, form, {
        headers: form.getHeaders(),
        params: { task }
      });
    }

    // 3. process
    await axios.post(`${server}/v1/process`, extra, {
      params: { task, tool }
    });

    // 4. download
    const response = await axios.get(`${server}/v1/download`, {
      params: { task },
      responseType: "stream"
    });

    const filename = `${Date.now()}_${Math.floor(Math.random()*9999)}.zip`;
    const filepath = path.join("outputs", filename);

    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    return new Promise(resolve => {
      writer.on("finish", () => resolve(`/outputs/${filename}`));
    });

  } catch (e) {
    console.log("🔥 FULL ERROR:", JSON.stringify(e.response?.data || e.message));
    return null;
  }
}

// ================= ROUTES =================

// دمج (multi)
app.post("/merge", upload.array("files"), async (req, res) => {
  const r = await runILovePDF("merge", getFiles(req));
  res.json(r ? { url: r } : { error: true });
});

// تقسيم
app.post("/split", upload.single("files"), async (req, res) => {
  const r = await runILovePDF("split", getFiles(req));
  res.json(r ? { url: r } : { error: true });
});

// ضغط
app.post("/compress", upload.single("files"), async (req, res) => {
  const r = await runILovePDF("compress", getFiles(req));
  res.json(r ? { url: r } : { error: true });
});

// PDF → Word
app.post("/pdf-to-word", upload.single("files"), async (req, res) => {
  const r = await runILovePDF("pdfword", getFiles(req));
  res.json(r ? { url: r } : { error: true });
});

// Word → PDF
app.post("/word-to-pdf", upload.single("files"), async (req, res) => {
  const r = await runILovePDF("officepdf", getFiles(req));
  res.json(r ? { url: r } : { error: true });
});

// PDF → PPT
app.post("/pdf-to-ppt", upload.single("files"), async (req, res) => {
  const r = await runILovePDF("pdfpowerpoint", getFiles(req));
  res.json(r ? { url: r } : { error: true });
});

// PPT → PDF
app.post("/ppt-to-pdf", upload.single("files"), async (req, res) => {
  const r = await runILovePDF("officepdf", getFiles(req));
  res.json(r ? { url: r } : { error: true });
});

// PDF → Excel
app.post("/pdf-to-excel", upload.single("files"), async (req, res) => {
  const r = await runILovePDF("pdfexcel", getFiles(req));
  res.json(r ? { url: r } : { error: true });
});

// Excel → PDF
app.post("/excel-to-pdf", upload.single("files"), async (req, res) => {
  const r = await runILovePDF("officepdf", getFiles(req));
  res.json(r ? { url: r } : { error: true });
});

// PDF → JPG
app.post("/pdf-to-jpg", upload.single("files"), async (req, res) => {
  const r = await runILovePDF("pdfjpg", getFiles(req));
  res.json(r ? { url: r } : { error: true });
});

// JPG → PDF
app.post("/jpg-to-pdf", upload.array("files"), async (req, res) => {
  const r = await runILovePDF("imagepdf", getFiles(req));
  res.json(r ? { url: r } : { error: true });
});

// حماية
app.post("/protect", upload.single("files"), async (req, res) => {
  const r = await runILovePDF("protect", getFiles(req), {
    password: "123456"
  });
  res.json(r ? { url: r } : { error: true });
});

// فك حماية
app.post("/unlock", upload.single("files"), async (req, res) => {
  const r = await runILovePDF("unlock", getFiles(req));
  res.json(r ? { url: r } : { error: true });
});

// تدوير
app.post("/rotate", upload.single("files"), async (req, res) => {
  const r = await runILovePDF("rotate", getFiles(req));
  res.json(r ? { url: r } : { error: true });
});

// watermark
app.post("/watermark", upload.single("files"), async (req, res) => {
  const r = await runILovePDF("watermark", getFiles(req), {
    text: "PDFORGE"
  });
  res.json(r ? { url: r } : { error: true });
});

// OCR
app.post("/ocr", upload.single("files"), async (req, res) => {
  const r = await runILovePDF("ocr", getFiles(req));
  res.json(r ? { url: r } : { error: true });
});

// ===== ROOT =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// ===== START =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server Running on", PORT));
