const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const cors = require("cors");
const FormData = require("form-data");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();

// 🔑 API KEY
const API_KEY = "a568hm8@gmail.com_odyW3q4nA6wA1XgMy6m5lMVDxZp39jaDDknjPVLQpN4dDDmN69yMk8HF7pIi5Rze";

// ===== رفع =====
async function uploadFile(file){
  const form = new FormData();
  form.append("file", file.buffer, file.originalname);

  const r = await fetch("https://api.pdf.co/v1/file/upload",{
    method:"POST",
    headers:{ "x-api-key": API_KEY },
    body:form
  });

  const data = await r.json();
  if(!data.url) throw new Error(JSON.stringify(data));

  return data.url;
}

// ===== تنفيذ =====
async function run(endpoint, url, extra = {}){
  const r = await fetch(endpoint,{
    method:"POST",
    headers:{
      "x-api-key": API_KEY,
      "Content-Type":"application/json"
    },
    body: JSON.stringify({ url, ...extra })
  });

  return await r.json();
}

// ===== الأدوات =====
const tools = {

  // 🔥 تحويل
  "pdf-to-jpg": u => run("https://api.pdf.co/v1/pdf/convert/to/jpg", u, {pages:"0-"}),
  "jpg-to-pdf": u => run("https://api.pdf.co/v1/pdf/convert/from/image", u),
  "pdf-to-text": u => run("https://api.pdf.co/v1/pdf/convert/to/text", u),
  "pdf-to-json": u => run("https://api.pdf.co/v1/pdf/convert/to/json", u),

  // 📂 تنظيم
  "merge-pdf": u => run("https://api.pdf.co/v1/pdf/merge2", u),
  "split-pdf": u => run("https://api.pdf.co/v1/pdf/split", u),
  "delete-pages": u => run("https://api.pdf.co/v1/pdf/remove-pages", u),

  // ⚡ تحسين
  "compress-pdf": u => run("https://api.pdf.co/v1/pdf/optimize", u),

  // ✏️ تعديل
  "watermark": u => run("https://api.pdf.co/v1/pdf/edit/add", u, {text:"PDFORGE"}),
  "rotate-pdf": u => run("https://api.pdf.co/v1/pdf/rotate", u),

  // 🔒 حماية
  "protect-pdf": u => run("https://api.pdf.co/v1/pdf/security/add", u, {password:"123456"}),
  "unlock-pdf": u => run("https://api.pdf.co/v1/pdf/security/remove", u),

  // 🧠 OCR
  "ocr-pdf": u => run("https://api.pdf.co/v1/pdf/convert/to/searchable", u),
  "extract-images": u => run("https://api.pdf.co/v1/pdf/extract/images", u)

};

// ===== API =====
app.post("/api/:tool", upload.single("file"), async (req,res)=>{
  try{

    if(!req.file) return res.json({error:"❌ ارفع ملف"});

    const fn = tools[req.params.tool];
    if(!fn) return res.json({error:"❌ الأداة مش موجودة"});

    const fileUrl = await uploadFile(req.file);
    const result = await fn(fileUrl);

    res.json(result);

  }catch(e){
    res.json({error:true,message:e.message});
  }
});

// ===== تشغيل =====
app.listen(process.env.PORT || 3000, ()=>console.log("🔥 NUCLEAR SERVER"));
