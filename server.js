const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const ILovePDFApi = require("ilovepdf-nodejs");

const app = express();
app.use(cors());
app.use(express.static("public"));
app.use("/outputs", express.static("outputs"));

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("outputs")) fs.mkdirSync("outputs");

const upload = multer({ dest: "uploads/" });

const instance = new ILovePDFApi(
  process.env.PDF_PUBLIC,
  process.env.PDF_SECRET
);

// 🔥 تشغيل أي أداة
async function runTask(taskName, files, res, ext = "pdf") {
  try {
    const task = instance.newTask(taskName);

    await task.start();

    if (Array.isArray(files)) {
      for (let f of files) await task.addFile(f.path);
    } else {
      await task.addFile(files.path);
    }

    await task.process();

    const data = await task.download();

    const fileName = `outputs/${Date.now()}_${Math.floor(Math.random()*9999)}.${ext}`;
    fs.writeFileSync(fileName, data);

    res.json({ url: "/" + fileName });

  } catch (e) {
    console.log("❌ ERROR:", e);
    res.json({ error: true });
  }
}

// ================= الأدوات =================

// دمج
app.post("/merge", upload.array("files"), (req, res) =>
  runTask("merge", req.files, res)
);

// تقسيم
app.post("/split", upload.single("file"), (req, res) =>
  runTask("split", req.file, res)
);

// ضغط
app.post("/compress", upload.single("file"), (req, res) =>
  runTask("compress", req.file, res)
);

// PDF → Word
app.post("/pdf-to-word", upload.single("file"), (req, res) =>
  runTask("pdfoffice", req.file, res, "docx")
);

// PDF → Excel
app.post("/pdf-to-excel", upload.single("file"), (req, res) =>
  runTask("pdfoffice", req.file, res, "xlsx")
);

// PDF → PPT
app.post("/pdf-to-ppt", upload.single("file"), (req, res) =>
  runTask("pdfoffice", req.file, res, "pptx")
);

// Word → PDF
app.post("/word-to-pdf", upload.single("file"), (req, res) =>
  runTask("officepdf", req.file, res)
);

// JPG → PDF
app.post("/jpg-to-pdf", upload.array("files"), (req, res) =>
  runTask("imagepdf", req.files, res)
);

// PDF → JPG
app.post("/pdf-to-jpg", upload.single("file"), (req, res) =>
  runTask("pdfjpg", req.file, res, "jpg")
);

// OCR
app.post("/ocr", upload.single("file"), (req, res) =>
  runTask("ocr", req.file, res)
);

// حماية
app.post("/protect", upload.single("file"), (req, res) =>
  runTask("protect", req.file, res)
);

// فك حماية
app.post("/unlock", upload.single("file"), (req, res) =>
  runTask("unlock", req.file, res)
);

// تدوير
app.post("/rotate", upload.single("file"), (req, res) =>
  runTask("rotate", req.file, res)
);

// علامة مائية
app.post("/watermark", upload.single("file"), (req, res) =>
  runTask("watermark", req.file, res)
);

// HTML → PDF
app.post("/html-to-pdf", upload.single("file"), (req, res) =>
  runTask("htmlpdf", req.file, res)
);

app.get("/", (req, res) => {
  res.send("🔥 PDFORGE PRO RUNNING");
});

app.listen(process.env.PORT || 8080, "0.0.0.0");
