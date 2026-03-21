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

app.get("/", (req,res)=>res.send("🔥 PDF PRO MAX SPEED"));

// upload
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
      async: true,
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
      async: true,
      outputFormat: format
    })
  });

  return await r.json();
}

// ================= TOOLS =================

app.post("/api/pdf-to-word", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file); res.json(await convert(u,"docx"));}catch(e){res.json({error:e.message})}
});

app.post("/api/pdf-to-excel", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file); res.json(await convert(u,"xlsx"));}catch(e){res.json({error:e.message})}
});

app.post("/api/pdf-to-ppt", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file); res.json(await convert(u,"pptx"));}catch(e){res.json({error:e.message})}
});

app.post("/api/word-to-pdf", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file); res.json(await convert(u,"pdf"));}catch(e){res.json({error:e.message})}
});

app.post("/api/excel-to-pdf", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file); res.json(await convert(u,"pdf"));}catch(e){res.json({error:e.message})}
});

app.post("/api/ppt-to-pdf", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file); res.json(await convert(u,"pdf"));}catch(e){res.json({error:e.message})}
});

app.post("/api/pdf-to-jpg", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file);
  res.json(await process(u,"https://api.pdf.co/v1/pdf/convert/to/jpg"));}catch(e){res.json({error:e.message})}
});

app.post("/api/jpg-to-pdf", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file);
  res.json(await process(u,"https://api.pdf.co/v1/pdf/convert/from/image"));}catch(e){res.json({error:e.message})}
});

app.post("/api/merge-pdf", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file);
  res.json(await process(u,"https://api.pdf.co/v1/pdf/merge2"));}catch(e){res.json({error:e.message})}
});

app.post("/api/split-pdf", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file);
  res.json(await process(u,"https://api.pdf.co/v1/pdf/split"));}catch(e){res.json({error:e.message})}
});

app.post("/api/compress-pdf", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file);
  res.json(await process(u,"https://api.pdf.co/v1/pdf/optimize"));}catch(e){res.json({error:e.message})}
});

app.post("/api/repair-pdf", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file);
  res.json(await process(u,"https://api.pdf.co/v1/pdf/repair"));}catch(e){res.json({error:e.message})}
});

app.post("/api/protect-pdf", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file);
  res.json(await process(u,"https://api.pdf.co/v1/pdf/security/add",{password:"123456"}));}catch(e){res.json({error:e.message})}
});

app.post("/api/unlock-pdf", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file);
  res.json(await process(u,"https://api.pdf.co/v1/pdf/security/remove"));}catch(e){res.json({error:e.message})}
});

app.post("/api/rotate-pdf", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file);
  res.json(await process(u,"https://api.pdf.co/v1/pdf/rotate"));}catch(e){res.json({error:e.message})}
});

app.post("/api/delete-pages", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file);
  res.json(await process(u,"https://api.pdf.co/v1/pdf/remove-pages"));}catch(e){res.json({error:e.message})}
});

app.post("/api/watermark", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file);
  res.json(await process(u,"https://api.pdf.co/v1/pdf/edit/add",{text:"PDF PRO"}));}catch(e){res.json({error:e.message})}
});

app.post("/api/page-numbers", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file);
  res.json(await process(u,"https://api.pdf.co/v1/pdf/edit/add"));}catch(e){res.json({error:e.message})}
});

app.post("/api/ocr-pdf", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file);
  res.json(await process(u,"https://api.pdf.co/v1/pdf/convert/to/searchable"));}catch(e){res.json({error:e.message})}
});

app.post("/api/pdf-to-pdfa", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file);
  res.json(await process(u,"https://api.pdf.co/v1/pdf/convert/to/pdfa"));}catch(e){res.json({error:e.message})}
});

app.post("/api/extract-images", upload.single("file"), async (req,res)=>{
  try{const u=await uploadFile(req.file);
  res.json(await process(u,"https://api.pdf.co/v1/pdf/extract/images"));}catch(e){res.json({error:e.message})}
});

app.post("/api/html-to-pdf", async (req,res)=>{
  try{
    const r = await fetch("https://api.pdf.co/v1/pdf/convert/from/url",{
      method:"POST",
      headers:{
        "x-api-key":API_KEY,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({url:req.body.url})
    });
    res.json(await r.json());
  }catch(e){res.json({error:e.message})}
});

// check async
app.get("/api/check", async (req,res)=>{
  try{
    const r = await fetch(req.query.url);
    const data = await r.json();
    res.json(data);
  }catch(e){res.json({error:e.message})}
});

app.listen(3000,()=>console.log("🔥 SPEED SERVER RUNNING"));
