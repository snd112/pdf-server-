const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const cors = require("cors");
const FormData = require("form-data");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();

// 🔐 API KEY
const API_KEY = "a568hm8@gmail.com_odyW3q4nA6wA1XgMy6m5lMVDxZp39jaDDknjPVLQpN4dDDmN69yMk8HF7pIi5Rze";

// 🔥 Test
app.get("/", (req, res) => {
  res.send("🔥 PDF API RUNNING 25 TOOLS");
});

// 🔥 Upload function
async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file.buffer, file.originalname);

  const res = await fetch("https://api.pdf.co/v1/file/upload", {
    method: "POST",
    headers: { "x-api-key": API_KEY },
    body: form
  });

  const data = await res.json();
  return data.url;
}

// 🔥 helper
async function process(url, endpoint) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url })
  });

  return await res.json();
}

// ================= TOOLS =================

// 1 PDF → JPG
app.post("/api/pdf-to-jpg", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/convert/to/jpg"));
});

// 2 JPG → PDF
app.post("/api/jpg-to-pdf", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/convert/from/image"));
});

// 3 PDF → Word
app.post("/api/pdf-to-word", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/convert/to/doc"));
});

// 4 Word → PDF
app.post("/api/word-to-pdf", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/convert/from/doc"));
});

// 5 PDF → Excel
app.post("/api/pdf-to-excel", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/convert/to/xls"));
});

// 6 Excel → PDF
app.post("/api/excel-to-pdf", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/convert/from/xls"));
});

// 7 PDF → PPT
app.post("/api/pdf-to-ppt", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/convert/to/ppt"));
});

// 8 PPT → PDF
app.post("/api/ppt-to-pdf", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/convert/from/ppt"));
});

// 9 Merge
app.post("/api/merge-pdf", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/merge2"));
});

// 10 Split
app.post("/api/split-pdf", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/split"));
});

// 11 Compress
app.post("/api/compress-pdf", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/optimize"));
});

// 12 Repair
app.post("/api/repair-pdf", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/repair"));
});

// 13 Protect
app.post("/api/protect-pdf", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);

  const r = await fetch("https://api.pdf.co/v1/pdf/security/add", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url, password: "123456" })
  });

  res.json(await r.json());
});

// 14 Unlock
app.post("/api/unlock-pdf", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/security/remove"));
});

// 15 Rotate
app.post("/api/rotate-pdf", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/rotate"));
});

// 16 Watermark
app.post("/api/watermark", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);

  const r = await fetch("https://api.pdf.co/v1/pdf/edit/add", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url, text: "PDF PRO MAX" })
  });

  res.json(await r.json());
});

// 17 Page Numbers
app.post("/api/page-numbers", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/edit/add"));
});

// 18 PDF/A
app.post("/api/pdf-to-pdfa", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/convert/to/pdfa"));
});

// 19 OCR
app.post("/api/ocr-pdf", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/convert/to/searchable"));
});

// 20 Extract Images
app.post("/api/extract-images", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/extract/images"));
});

// 21 Extract Pages
app.post("/api/extract-pages", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/split"));
});

// 22 HTML → PDF
app.post("/api/html-to-pdf", async (req, res) => {
  const r = await fetch("https://api.pdf.co/v1/pdf/convert/from/url", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url: req.body.url })
  });

  res.json(await r.json());
});

// 23 Delete Pages
app.post("/api/delete-pages", upload.single("file"), async (req, res) => {
  const url = await uploadFile(req.file);
  res.json(await process(url, "https://api.pdf.co/v1/pdf/remove-pages"));
});

// ================= RUN =================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 SERVER RUNNING 25 TOOLS");
});
