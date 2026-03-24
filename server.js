const express = require("express");
const multer = require("multer");
const cors = require("cors");
const compression = require("compression");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(compression());
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
async function runILovePDF(task, files, extra = {}) {
  try {
    // 1. start task
    const start = await axios.post(
      "https://api.ilovepdf.com/v1/start",
      { public_key: PUBLIC_KEY },
      { params: { tool: task } }
    );

    const { server, task: taskId } = start.data;

    // 2. upload files
    for (let file of files) {
      const form = new FormData();
      form.append("file", fs.createReadStream(file));

      await axios.post(
        `${server}/v1/upload`,
        form,
        {
          headers: form.getHeaders(),
          params: { task: taskId }
        }
      );
    }

    // 3. process
    await axios.post(
      `${server}/v1/process`,
      extra,
      {
        params: {
          task: taskId,
          tool: task
        }
      }
    );

    // 4. download
    const res = await axios.get(
      `${server}/v1/download`,
      {
        params: { task: taskId },
        responseType: "stream"
      }
    );

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

// ================= TOOLS =================

// دمج
app.post("/merge", upload.array("files"), async (req, res) => {
  const result = await runILovePDF("merge", req.files.map(f => f.path));
  if (!result) return res.json({ error: true });
  res.json({ url: result });
});

// تقسيم
app.post("/split", upload.array("files"), async (req, res) => {
  const result = await runILovePDF("split", req.files.map(f => f.path));
  if (!result) return res.json({ error: true });
  res.json({ url: result });
});

// ضغط
app.post("/compress", upload.array("files"), async (req, res) => {
  const result = await runILovePDF("compress", req.files.map(f => f.path));
  if (!result) return res.json({ error: true });
  res.json({ url: result });
});

// PDF → Word
app.post("/pdf-to-word", upload.array("files"), async (req, res) => {
  const result = await runILovePDF("pdfjpg", req.files.map(f => f.path));
  if (!result) return res.json({ error: true });
  res.json({ url: result });
});

// Word → PDF
app.post("/word-to-pdf", upload.array("files"), async (req, res) => {
  const result = await runILovePDF("officepdf", req.files.map(f => f.path));
  if (!result) return res.json({ error: true });
  res.json({ url: result });
});

// PDF → PPT
app.post("/pdf-to-ppt", upload.array("files"), async (req, res) => {
  const result = await runILovePDF("pdfjpg", req.files.map(f => f.path));
  if (!result) return res.json({ error: true });
  res.json({ url: result });
});

// PPT → PDF
app.post("/ppt-to-pdf", upload.array("files"), async (req, res) => {
  const result = await runILovePDF("officepdf", req.files.map(f => f.path));
  if (!result) return res.json({ error: true });
  res.json({ url: result });
});

// PDF → Excel
app.post("/pdf-to-excel", upload.array("files"), async (req, res) => {
  const result = await runILovePDF("pdfexcel", req.files.map(f => f.path));
  if (!result) return res.json({ error: true });
  res.json({ url: result });
});

// Excel → PDF
app.post("/excel-to-pdf", upload.array("files"), async (req, res) => {
  const result = await runILovePDF("officepdf", req.files.map(f => f.path));
  if (!result) return res.json({ error: true });
  res.json({ url: result });
});

// PDF → JPG
app.post("/pdf-to-jpg", upload.array("files"), async (req, res) => {
  const result = await runILovePDF("pdfjpg", req.files.map(f => f.path));
  if (!result) return res.json({ error: true });
  res.json({ url: result });
});

// JPG → PDF
app.post("/jpg-to-pdf", upload.array("files"), async (req, res) => {
  const result = await runILovePDF("imagepdf", req.files.map(f => f.path));
  if (!result) return res.json({ error: true });
  res.json({ url: result });
});

// حماية
app.post("/protect", upload.array("files"), async (req, res) => {
  const result = await runILovePDF("protect", req.files.map(f => f.path), {
    password: "123456"
  });
  if (!result) return res.json({ error: true });
  res.json({ url: result });
});

// فتح
app.post("/unlock", upload.array("files"), async (req, res) => {
  const result = await runILovePDF("unlock", req.files.map(f => f.path));
  if (!result) return res.json({ error: true });
  res.json({ url: result });
});

// تدوير
app.post("/rotate", upload.array("files"), async (req, res) => {
  const result = await runILovePDF("rotate", req.files.map(f => f.path));
  if (!result) return res.json({ error: true });
  res.json({ url: result });
});

// watermark
app.post("/watermark", upload.array("files"), async (req, res) => {
  const result = await runILovePDF("watermark", req.files.map(f => f.path), {
    text: "PDFORGE"
  });
  if (!result) return res.json({ error: true });
  res.json({ url: result });
});

// HTML → PDF
app.post("/html-to-pdf", async (req, res) => {
  const { url } = req.body;

  const result = await runILovePDF("htmlpdf", [], { url });
  if (!result) return res.json({ error: true });

  res.json({ url: result });
});

// OCR
app.post("/ocr", upload.array("files"), async (req, res) => {
  const result = await runILovePDF("ocr", req.files.map(f => f.path));
  if (!result) return res.json({ error: true });
  res.json({ url: result });
});

// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("🔥 PDFORGE ULTRA API WORKING");
});

// ================= START =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on", PORT);
});
