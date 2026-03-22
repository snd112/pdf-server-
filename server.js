const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const cors = require("cors");
const FormData = require("form-data");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const upload = multer();

// 🔑 حط API KEY بتاعك هنا
const API_KEY = "a568hm8@gmail.com_odyW3q4nA6wA1XgMy6m5lMVDxZp39jaDDknjPVLQpN4dDDmN69yMk8HF7pIi5Rze";

// ===== الصفحة الرئيسية =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== رفع =====
async function uploadFile(file){
  const form = new FormData();
  form.append("file", file.buffer, file.originalname);

  const r = await fetch("https://api.pdf.co/v1/file/upload", {
    method: "POST",
    headers: { "x-api-key": API_KEY },
    body: form
  });

  const data = await r.json();
  if(!data.url) throw new Error(JSON.stringify(data));

  return data.url;
}

// ===== تنفيذ =====
async function process(url, endpoint){
  const r = await fetch(endpoint, {
    method:"POST",
    headers:{
      "x-api-key": API_KEY,
      "Content-Type":"application/json"
    },
    body: JSON.stringify({ url })
  });

  const data = await r.json();
  return data;
}

// ===== API =====
app.post("/api/:tool", upload.single("file"), async (req,res)=>{
  try{

    if(!req.file){
      return res.json({error:"❌ مفيش ملف"});
    }

    const fileUrl = await uploadFile(req.file);

    let endpoint;

    switch(req.params.tool){
      case "pdf-to-jpg":
        endpoint = "https://api.pdf.co/v1/pdf/convert/to/jpg";
        break;
      case "jpg-to-pdf":
        endpoint = "https://api.pdf.co/v1/pdf/convert/from/image";
        break;
      default:
        return res.json({error:"❌ الأداة مش موجودة"});
    }

    const result = await process(fileUrl, endpoint);

    res.json(result);

  }catch(e){
    res.json({error:true,message:e.message});
  }
});

// ===== تشغيل (🔥 مهم جداً) =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🔥 SERVER RUNNING ON " + PORT);
});
