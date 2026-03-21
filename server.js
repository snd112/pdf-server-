const express = require("express");
const fetch = require("node-fetch");
const multer = require("multer");
const fs = require("fs");
const FormData = require("form-data");

const app = express();
app.use(express.json());

const upload = multer({ dest: "uploads/" });
const API_KEY = process.env.API_KEY;

app.get("/", (req, res) => {
  res.send("🔥 PDF PRO MAX FULL 25 TOOLS");
});

// رفع ملفات
app.post("/api/upload", upload.array("files"), async (req, res) => {
  let urls = [];

  for (let file of req.files) {
    let form = new FormData();
    form.append("file", fs.createReadStream(file.path));

    let r = await fetch("https://api.pdf.co/v1/file/upload", {
      method: "POST",
      headers: { "x-api-key": API_KEY },
      body: form
    });

    let d = await r.json();
    urls.push(d.url);
  }

  res.json({ urls });
});

// 🔥 دالة عامة لكل الأدوات
async function runTool(res, endpoint, body) {
  let r = await fetch(`https://api.pdf.co/v1/${endpoint}`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  res.json(await r.json());
}

// 🔥 كل الأدوات

app.post("/api/pdf-to-jpg",(req,res)=>runTool(res,"pdf/convert/to/jpg",{url:req.body.url}));
app.post("/api/jpg-to-pdf",(req,res)=>runTool(res,"pdf/convert/from/image",{url:req.body.url}));
app.post("/api/pdf-to-word",(req,res)=>runTool(res,"pdf/convert/to/doc",{url:req.body.url}));
app.post("/api/word-to-pdf",(req,res)=>runTool(res,"pdf/convert/from/doc",{url:req.body.url}));
app.post("/api/pdf-to-excel",(req,res)=>runTool(res,"pdf/convert/to/xls",{url:req.body.url}));
app.post("/api/excel-to-pdf",(req,res)=>runTool(res,"pdf/convert/from/xls",{url:req.body.url}));
app.post("/api/pdf-to-ppt",(req,res)=>runTool(res,"pdf/convert/to/ppt",{url:req.body.url}));
app.post("/api/ppt-to-pdf",(req,res)=>runTool(res,"pdf/convert/from/ppt",{url:req.body.url}));
app.post("/api/html-to-pdf",(req,res)=>runTool(res,"pdf/convert/from/html",{url:req.body.url}));
app.post("/api/pdf-to-text",(req,res)=>runTool(res,"pdf/convert/to/text",{url:req.body.url}));

app.post("/api/merge-pdf",(req,res)=>runTool(res,"pdf/merge",{urls:req.body.urls}));
app.post("/api/split-pdf",(req,res)=>runTool(res,"pdf/split",{url:req.body.url}));
app.post("/api/compress-pdf",(req,res)=>runTool(res,"pdf/optimize",{url:req.body.url}));
app.post("/api/delete-pages",(req,res)=>runTool(res,"pdf/edit/delete-pages",{url:req.body.url}));
app.post("/api/reorder-pages",(req,res)=>runTool(res,"pdf/edit/reorder-pages",{url:req.body.url}));
app.post("/api/crop-pdf",(req,res)=>runTool(res,"pdf/edit/crop",{url:req.body.url}));

app.post("/api/protect-pdf",(req,res)=>runTool(res,"pdf/security/add",{url:req.body.url}));
app.post("/api/unlock-pdf",(req,res)=>runTool(res,"pdf/security/remove",{url:req.body.url}));
app.post("/api/sign-pdf",(req,res)=>runTool(res,"pdf/sign/add",{url:req.body.url}));
app.post("/api/watermark",(req,res)=>runTool(res,"pdf/edit/add-text",{url:req.body.url}));

app.post("/api/rotate-pdf",(req,res)=>runTool(res,"pdf/edit/rotate",{url:req.body.url}));
app.post("/api/add-page-numbers",(req,res)=>runTool(res,"pdf/edit/add-text",{url:req.body.url}));
app.post("/api/edit-pdf",(req,res)=>runTool(res,"pdf/edit/add-text",{url:req.body.url}));
app.post("/api/repair-pdf",(req,res)=>runTool(res,"pdf/repair",{url:req.body.url}));
app.post("/api/pdf-to-pdfa",(req,res)=>runTool(res,"pdf/convert/to/pdfa",{url:req.body.url}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🔥 25 TOOLS READY"));
