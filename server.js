const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const FormData = require("form-data");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();

// 🔥 حط API هنا
const API_KEY = "a568hm8@gmail.com_odyW3q4nA6wA1XgMy6m5lMVDxZp39jaDDknjPVLQpN4dDDmN69yMk8HF7pIi5Rze";

// 🧠 رفع الملف + تشغيل الأداة
async function process(apiUrl, fileBuffer, fileName) {

  const formData = new FormData();
  formData.append("file", fileBuffer, fileName);

  // 1 رفع
  const uploadRes = await fetch("https://api.pdf.co/v1/file/upload", {
    method: "POST",
    headers: { "x-api-key": API_KEY },
    body: formData
  });

  const uploadData = await uploadRes.json();
  if(uploadData.error) return uploadData;

  // 2 تشغيل
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url: uploadData.url })
  });

  return await res.json();
}

// ================== TOOLS ==================

// تحويلات
app.post("/api/pdf-to-jpg", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/convert/to/jpg", req.file.buffer, req.file.originalname));
});

app.post("/api/jpg-to-pdf", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/convert/from/image", req.file.buffer, req.file.originalname));
});

app.post("/api/pdf-to-word", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/convert/to/doc", req.file.buffer, req.file.originalname));
});

app.post("/api/word-to-pdf", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/convert/from/doc", req.file.buffer, req.file.originalname));
});

app.post("/api/pdf-to-excel", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/convert/to/xls", req.file.buffer, req.file.originalname));
});

app.post("/api/excel-to-pdf", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/convert/from/xls", req.file.buffer, req.file.originalname));
});

app.post("/api/pdf-to-ppt", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/convert/to/ppt", req.file.buffer, req.file.originalname));
});

app.post("/api/ppt-to-pdf", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/convert/from/ppt", req.file.buffer, req.file.originalname));
});

// أدوات
app.post("/api/merge-pdf", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/merge", req.file.buffer, req.file.originalname));
});

app.post("/api/split-pdf", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/split", req.file.buffer, req.file.originalname));
});

app.post("/api/compress-pdf", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/optimize", req.file.buffer, req.file.originalname));
});

app.post("/api/repair-pdf", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/repair", req.file.buffer, req.file.originalname));
});

app.post("/api/protect-pdf", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/security/add", req.file.buffer, req.file.originalname));
});

app.post("/api/unlock-pdf", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/security/remove", req.file.buffer, req.file.originalname));
});

app.post("/api/rotate-pdf", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/rotate", req.file.buffer, req.file.originalname));
});

app.post("/api/watermark", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/edit/add", req.file.buffer, req.file.originalname));
});

app.post("/api/page-numbers", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/edit/add", req.file.buffer, req.file.originalname));
});

app.post("/api/pdf-to-pdfa", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/convert/to/pdfa", req.file.buffer, req.file.originalname));
});

app.post("/api/ocr-pdf", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/convert/to/searchable", req.file.buffer, req.file.originalname));
});

app.post("/api/extract-images", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/extract/images", req.file.buffer, req.file.originalname));
});

app.post("/api/extract-pages", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/split", req.file.buffer, req.file.originalname));
});

app.post("/api/delete-pages", upload.single("file"), async (req,res)=>{
  res.json(await process("https://api.pdf.co/v1/pdf/remove-pages", req.file.buffer, req.file.originalname));
});

// test
app.get("/", (req,res)=>{
  res.send("SERVER WORKING 🔥");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log("🔥 SERVER RUNNING"));
