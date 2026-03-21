const express = require("express");
const cors = require("cors");
const multer = require("multer");
const FormData = require("form-data");

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.PDF_API_KEY;

// helper
async function send(url, formData) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "x-api-key": API_KEY },
    body: formData
  });
  return await res.json();
}

// ================= BASIC =================
app.post("/api/pdf-to-jpg", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/to/jpg",f));
});

app.post("/api/jpg-to-pdf", upload.array("files"), async (req,res)=>{
  let f=new FormData();
  req.files.forEach(x=>f.append("files",x.buffer,x.originalname));
  res.json(await send("https://api.pdf.co/v1/pdf/convert/from/image",f));
});

app.post("/api/pdf-to-word", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/to/doc",f));
});

app.post("/api/word-to-pdf", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/from/doc",f));
});

// ================= EXTRA CONVERT =================
app.post("/api/pdf-to-excel", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/to/xls",f));
});

app.post("/api/excel-to-pdf", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/from/xls",f));
});

app.post("/api/pdf-to-ppt", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/to/ppt",f));
});

app.post("/api/ppt-to-pdf", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/from/ppt",f));
});

app.post("/api/pdf-to-text", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/to/text",f));
});

// ================= ORGANIZE =================
app.post("/api/merge-pdf", upload.array("files"), async (req,res)=>{
  let f=new FormData();
  req.files.forEach(x=>f.append("files",x.buffer,x.originalname));
  res.json(await send("https://api.pdf.co/v1/pdf/merge",f));
});

app.post("/api/split-pdf", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/split",f));
});

app.post("/api/delete-pages", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/remove-pages",f));
});

// ================= OPTIMIZE =================
app.post("/api/compress-pdf", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/optimize",f));
});

app.post("/api/repair-pdf", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/repair",f));
});

// ================= SECURITY =================
app.post("/api/protect-pdf", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  f.append("password","123456");
  res.json(await send("https://api.pdf.co/v1/pdf/security/add",f));
});

app.post("/api/unlock-pdf", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/security/remove",f));
});

// ================= EDIT =================
app.post("/api/rotate-pdf", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/rotate",f));
});

app.post("/api/watermark", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  f.append("text","PDF PRO");
  res.json(await send("https://api.pdf.co/v1/pdf/edit/add",f));
});

app.post("/api/page-numbers", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/edit/add",f));
});

// ================= ADVANCED =================
app.post("/api/pdf-to-pdfa", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/to/pdfa",f));
});

app.post("/api/ocr-pdf", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/to/searchable",f));
});

app.post("/api/extract-images", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/extract/images",f));
});

app.post("/api/extract-pages", upload.single("file"), async (req,res)=>{
  let f=new FormData();
  f.append("file",req.file.buffer,req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/split",f));
});

// ================= HTML =================
app.post("/api/html-to-pdf", async (req,res)=>{
  const r = await fetch("https://api.pdf.co/v1/pdf/convert/from/url",{
    method:"POST",
    headers:{
      "x-api-key":API_KEY,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({url:req.body.url})
  });
  res.json(await r.json());
});

// ================= RUN =================
app.listen(process.env.PORT || 3000,()=>{
  console.log("🔥 25 TOOLS SERVER RUNNING");
});
