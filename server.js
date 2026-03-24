const express = require("express");
const multer = require("multer");
const cors = require("cors");
const compression = require("compression");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(compression());
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });

// ================= ILOVE API =================
const PUBLIC_KEY = process.env.ILOVEPDF_PUBLIC;
const SECRET_KEY = process.env.ILOVEPDF_SECRET;

async function runILove(task, filePath) {
  try {
    const start = await axios.post("https://api.ilovepdf.com/v1/start", {
      public_key: PUBLIC_KEY,
      task
    });

    const { server, task: taskId } = start.data;

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    await axios.post(`${server}/v1/upload`, form, {
      headers: form.getHeaders(),
      params: { task: taskId }
    });

    await axios.post(`${server}/v1/process`, {}, {
      params: { task: taskId }
    });

    return `${server}/v1/download/${taskId}`;
  } catch (e) {
    console.log(e.response?.data || e.message);
    return null;
  }
}

// ================= ROUTES =================

// دمج
app.post("/merge", upload.array("files"), async (req, res) => {
  const url = await runILove("merge", req.files[0].path);
  res.json({ url });
});

// ضغط
app.post("/compress", upload.single("file"), async (req, res) => {
  const url = await runILove("compress", req.file.path);
  res.json({ url });
});

// PDF → JPG
app.post("/pdf-to-jpg", upload.single("file"), async (req, res) => {
  const url = await runILove("pdfjpg", req.file.path);
  res.json({ url });
});

// JPG → PDF
app.post("/jpg-to-pdf", upload.single("file"), async (req, res) => {
  const url = await runILove("imagepdf", req.file.path);
  res.json({ url });
});

// PDF → Word
app.post("/pdf-to-word", upload.single("file"), async (req, res) => {
  const url = await runILove("pdfword", req.file.path);
  res.json({ url });
});

// Word → PDF
app.post("/word-to-pdf", upload.single("file"), async (req, res) => {
  const url = await runILove("officepdf", req.file.path);
  res.json({ url });
});

// PDF → PPT
app.post("/pdf-to-ppt", upload.single("file"), async (req, res) => {
  const url = await runILove("pdfpowerpoint", req.file.path);
  res.json({ url });
});

// PPT → PDF
app.post("/ppt-to-pdf", upload.single("file"), async (req, res) => {
  const url = await runILove("officepdf", req.file.path);
  res.json({ url });
});

// PDF → Excel
app.post("/pdf-to-excel", upload.single("file"), async (req, res) => {
  const url = await runILove("pdfexcel", req.file.path);
  res.json({ url });
});

// Excel → PDF
app.post("/excel-to-pdf", upload.single("file"), async (req, res) => {
  const url = await runILove("officepdf", req.file.path);
  res.json({ url });
});

// حماية
app.post("/protect", upload.single("file"), async (req, res) => {
  const url = await runILove("protect", req.file.path);
  res.json({ url });
});

// فك حماية
app.post("/unlock", upload.single("file"), async (req, res) => {
  const url = await runILove("unlock", req.file.path);
  res.json({ url });
});

// OCR
app.post("/ocr", upload.single("file"), async (req, res) => {
  const url = await runILove("ocr", req.file.path);
  res.json({ url });
});

// ================= START =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🔥 Server running"));
