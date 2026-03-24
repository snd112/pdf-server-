const express = require("express");
const multer = require("multer");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.static("public"));
app.use("/outputs", express.static("outputs"));

["uploads","outputs"].forEach(f=>{
  if(!fs.existsSync(f)) fs.mkdirSync(f);
});

const upload = multer({ dest: "uploads/" });

// تشغيل أوامر
function run(cmd,args){
  return new Promise(resolve=>{
    const p = spawn(cmd,args);
    let err="";
    p.stderr.on("data",d=>err+=d.toString());
    p.on("close",code=>{
      if(code!==0){
        console.log("❌",cmd,err);
        return resolve(false);
      }
      resolve(true);
    });
  });
}

// naming system
function name(file){
  return path.parse(file.originalname).name.replace(/\s+/g,"_");
}
function unique(ext){
  return Date.now()+"_"+Math.floor(Math.random()*9999)+"."+ext;
}

// ===== MERGE =====
app.post("/merge", upload.array("files"), async (req,res)=>{
  const out=unique("pdf");
  const files=req.files.map(f=>f.path);
  const ok=await run("pdfunite",[...files,`outputs/${out}`]);
  res.json(ok?{url:`/outputs/${out}`}:{error:true});
});

// ===== SPLIT =====
app.post("/split", upload.single("file"), async (req,res)=>{
  const id=Date.now();
  const ok=await run("pdfseparate",[req.file.path,`outputs/${id}-%d.pdf`]);
  res.json(ok?{url:`/outputs/${id}-1.pdf`}:{error:true});
});

// ===== COMPRESS =====
app.post("/compress", upload.single("file"), async (req,res)=>{
  const out=unique("pdf");
  const ok=await run("gs",[
    "-sDEVICE=pdfwrite",
    "-dPDFSETTINGS=/ebook",
    "-dNOPAUSE","-dQUIET","-dBATCH",
    `-sOutputFile=outputs/${out}`,
    req.file.path
  ]);
  res.json(ok?{url:`/outputs/${out}`}:{error:true});
});

// ===== WORD → PDF =====
app.post("/word-to-pdf", upload.single("file"), async (req,res)=>{
  const base=name(req.file);
  const out=unique("pdf");

  await run("libreoffice",["--headless","--convert-to","pdf",req.file.path,"--outdir","outputs"]);

  const old=`outputs/${base}.pdf`;
  if(fs.existsSync(old)) fs.renameSync(old,`outputs/${out}`);

  res.json({url:`/outputs/${out}`});
});

// ===== PDF → WORD =====
app.post("/pdf-to-word", upload.single("file"), async (req,res)=>{
  const base=name(req.file);
  const out=unique("docx");

  await run("libreoffice",["--headless","--convert-to","docx",req.file.path,"--outdir","outputs"]);

  const old=`outputs/${base}.docx`;
  if(fs.existsSync(old)) fs.renameSync(old,`outputs/${out}`);

  res.json({url:`/outputs/${out}`});
});

// ===== PPT → PDF =====
app.post("/ppt-to-pdf", upload.single("file"), async (req,res)=>{
  const base=name(req.file);
  const out=unique("pdf");

  await run("libreoffice",["--headless","--convert-to","pdf",req.file.path,"--outdir","outputs"]);

  const old=`outputs/${base}.pdf`;
  if(fs.existsSync(old)) fs.renameSync(old,`outputs/${out}`);

  res.json({url:`/outputs/${out}`});
});

// ===== PDF → PPT =====
app.post("/pdf-to-ppt", upload.single("file"), async (req,res)=>{
  const base=name(req.file);
  const out=unique("pptx");

  await run("libreoffice",["--headless","--convert-to","pptx",req.file.path,"--outdir","outputs"]);

  const old=`outputs/${base}.pptx`;
  if(fs.existsSync(old)) fs.renameSync(old,`outputs/${out}`);

  res.json({url:`/outputs/${out}`});
});

// ===== EXCEL → PDF =====
app.post("/excel-to-pdf", upload.single("file"), async (req,res)=>{
  const base=name(req.file);
  const out=unique("pdf");

  await run("libreoffice",["--headless","--convert-to","pdf",req.file.path,"--outdir","outputs"]);

  const old=`outputs/${base}.pdf`;
  if(fs.existsSync(old)) fs.renameSync(old,`outputs/${out}`);

  res.json({url:`/outputs/${out}`});
});

// ===== PDF → EXCEL =====
app.post("/pdf-to-excel", upload.single("file"), async (req,res)=>{
  const base=name(req.file);
  const out=unique("xlsx");

  await run("libreoffice",["--headless","--convert-to","xlsx",req.file.path,"--outdir","outputs"]);

  const old=`outputs/${base}.xlsx`;
  if(fs.existsSync(old)) fs.renameSync(old,`outputs/${out}`);

  res.json({url:`/outputs/${out}`});
});

// ===== PDF → JPG =====
app.post("/pdf-to-jpg", upload.single("file"), async (req,res)=>{
  const id=Date.now();
  await run("pdftoppm",["-jpeg",req.file.path,`outputs/${id}`]);
  res.json({url:`/outputs/${id}-1.jpg`});
});

// ===== JPG → PDF =====
app.post("/jpg-to-pdf", upload.array("files"), async (req,res)=>{
  const out=unique("pdf");
  const imgs=req.files.map(f=>f.path);
  await run("img2pdf",[...imgs,"-o",`outputs/${out}`]);
  res.json({url:`/outputs/${out}`});
});

// ===== PROTECT =====
app.post("/protect", upload.single("file"), async (req,res)=>{
  const out=unique("pdf");
  await run("qpdf",["--encrypt","1234","1234","256","--",req.file.path,`outputs/${out}`]);
  res.json({url:`/outputs/${out}`});
});

// ===== UNLOCK =====
app.post("/unlock", upload.single("file"), async (req,res)=>{
  const out=unique("pdf");
  await run("qpdf",["--decrypt",req.file.path,`outputs/${out}`]);
  res.json({url:`/outputs/${out}`});
});

// ===== OCR =====
app.post("/ocr", upload.single("file"), async (req,res)=>{
  const out=unique("pdf");
  await run("tesseract",[req.file.path,`outputs/${out.replace(".pdf","")}`,"pdf"]);
  res.json({url:`/outputs/${out}`});
});

// ===== START =====
const PORT=process.env.PORT||8080;
app.listen(PORT,"0.0.0.0",()=>console.log("🚀",PORT));
