const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const cors = require("cors");
const FormData = require("form-data");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();

const API_KEY = "a568hm8@gmail.com_odyW3q4nA6wA1XgMy6m5lMVDxZp39jaDDknjPVLQpN4dDDmN69yMk8HF7pIi5Rze";

app.get("/", (req,res)=>res.send("🔥 PDFORGE MAX PRO RUNNING"));

// ================= رفع =================
async function uploadFile(file){
  const form = new FormData();
  form.append("file", file.buffer, file.originalname);

  const r = await fetch("https://api.pdf.co/v1/file/upload",{
    method:"POST",
    headers:{ "x-api-key": API_KEY },
    body: form
  });

  const data = await r.json();

  if(!data.url){
    throw new Error(JSON.stringify(data));
  }

  return data.url;
}

// ================= process =================
async function process(url, endpoint, extra = {}){
  const r = await fetch(endpoint,{
    method:"POST",
    headers:{
      "x-api-key": API_KEY,
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      url,
      async:true,
      ...extra
    })
  });

  return await r.json();
}

// ================= الأدوات =================
const tools = {

  // ✅ تحويلات شغالة
  "pdf-to-word": (u)=>process(u,"https://api.pdf.co/v1/pdf/convert/to/docx"),
  "pdf-to-excel": (u)=>process(u,"https://api.pdf.co/v1/pdf/convert/to/xlsx"),
  "pdf-to-ppt": (u)=>process(u,"https://api.pdf.co/v1/pdf/convert/to/pptx"),

  "pdf-to-jpg": (u)=>process(u,"https://api.pdf.co/v1/pdf/convert/to/jpg"),
  "jpg-to-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/convert/from/image"),

  // تنظيم
  "merge-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/merge2"),
  "split-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/split"),

  // تحسين
  "compress-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/optimize"),
  "repair-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/repair"),

  // حماية
  "protect-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/security/add",{password:"123456"}),
  "unlock-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/security/remove"),

  // تعديل
  "rotate-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/rotate"),
  "delete-pages": (u)=>process(u,"https://api.pdf.co/v1/pdf/remove-pages"),
  "watermark": (u)=>process(u,"https://api.pdf.co/v1/pdf/edit/add",{text:"PDFORGE"}),
  "page-numbers": (u)=>process(u,"https://api.pdf.co/v1/pdf/edit/add"),

  // متقدم
  "ocr-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/convert/to/searchable"),
  "extract-images": (u)=>process(u,"https://api.pdf.co/v1/pdf/extract/images"),
  "pdf-to-pdfa": (u)=>process(u,"https://api.pdf.co/v1/pdf/convert/to/pdfa")
};

// ================= API =================
app.post("/api/:tool", upload.single("file"), async (req,res)=>{
  try{

    if(!req.file){
      return res.json({error:"No file uploaded"});
    }

    const fn = tools[req.params.tool];
    if(!fn){
      return res.json({error:"Tool not found"});
    }

    const fileUrl = await uploadFile(req.file);
    const result = await fn(fileUrl);

    res.json(result);

  }catch(e){
    res.json({error:true,message:e.message});
  }
});

// ================= check =================
app.get("/api/check", async (req,res)=>{
  try{
    const r = await fetch(req.query.url);
    const data = await r.json();
    res.json(data);
  }catch(e){
    res.json({error:e.message});
  }
});

// ================= تشغيل =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
  console.log("🔥 SERVER WORKING 100%");
});
