const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const cors = require("cors");
const FormData = require("form-data");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();

// ✅ API جاهز
const API_KEY = "a568hm8@gmail.com_odyW3q4nA6wA1XgMy6m5lMVDxZp39jaDDknjPVLQpN4dDDmN69yMk8HF7pIi5Rze";

app.get("/", (req,res)=>res.send("🔥 PDFORGE MAX PRO RUNNING"));

// رفع
async function uploadFile(file){
  const form = new FormData();
  form.append("file", file.buffer, file.originalname);

  const r = await fetch("https://api.pdf.co/v1/file/upload",{
    method:"POST",
    headers:{ "x-api-key": API_KEY },
    body: form
  });

  const data = await r.json();
  if(!data.url) throw new Error(JSON.stringify(data));
  return data.url;
}

// async process
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

// convert
async function convert(url, format){
  const r = await fetch("https://api.pdf.co/v1/pdf/convert",{
    method:"POST",
    headers:{
      "x-api-key": API_KEY,
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      url,
      async:true,
      outputFormat: format
    })
  });

  return await r.json();
}

// 🔥 الأدوات كلها
const tools = {
  "pdf-to-word": (u)=>convert(u,"docx"),
  "pdf-to-excel": (u)=>convert(u,"xlsx"),
  "pdf-to-ppt": (u)=>convert(u,"pptx"),
  "word-to-pdf": (u)=>convert(u,"pdf"),
  "excel-to-pdf": (u)=>convert(u,"pdf"),
  "ppt-to-pdf": (u)=>convert(u,"pdf"),

  "pdf-to-jpg": (u)=>process(u,"https://api.pdf.co/v1/pdf/convert/to/jpg"),
  "jpg-to-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/convert/from/image"),

  "merge-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/merge2"),
  "split-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/split"),

  "compress-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/optimize"),
  "repair-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/repair"),

  "protect-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/security/add",{password:"123456"}),
  "unlock-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/security/remove"),

  "rotate-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/rotate"),
  "delete-pages": (u)=>process(u,"https://api.pdf.co/v1/pdf/remove-pages"),

  "watermark": (u)=>process(u,"https://api.pdf.co/v1/pdf/edit/add",{text:"PDFORGE"}),
  "page-numbers": (u)=>process(u,"https://api.pdf.co/v1/pdf/edit/add"),

  "ocr-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/convert/to/searchable"),
  "extract-images": (u)=>process(u,"https://api.pdf.co/v1/pdf/extract/images"),

  "pdf-to-pdfa": (u)=>process(u,"https://api.pdf.co/v1/pdf/convert/to/pdfa")
};

// API واحد لكل الأدوات
app.post("/api/:tool", upload.single("file"), async (req,res)=>{
  try{
    const fn = tools[req.params.tool];
    if(!fn) return res.json({error:"Tool not found"});

    const url = await uploadFile(req.file);
    const result = await fn(url);

    res.json(result);
  }catch(e){
    res.json({error:e.message});
  }
});

// متابعة
app.get("/api/check", async (req,res)=>{
  try{
    const r = await fetch(req.query.url);
    res.json(await r.json());
  }catch(e){
    res.json({error:e.message});
  }
});

app.listen(3000,()=>console.log("🔥 PDFORGE MAX PRO LIVE"));
