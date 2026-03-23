const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.static("public"));
app.use("/outputs", express.static("outputs"));

// إنشاء فولدرات
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("outputs")) fs.mkdirSync("outputs");

const upload = multer({ dest: "uploads/" });

// Helper
function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.log("❌ ERROR:", stderr);
        return reject(stderr);
      }
      resolve(stdout);
    });
  });
}

// Word → PDF
app.post("/word-to-pdf", upload.single("file"), async (req, res) => {
  try {
    const name = path.basename(req.file.path);
    await run(`libreoffice --headless --convert-to pdf ${req.file.path} --outdir outputs`);
    res.json({ url: `/outputs/${name}.pdf` });
  } catch (e) {
    res.json({ error: true, details: e });
  }
});

// PDF → JPG
app.post("/pdf-to-jpg", upload.single("file"), async (req, res) => {
  try {
    await run(`pdftoppm -jpeg ${req.file.path} outputs/output`);
    res.json({ url: "/outputs/output-1.jpg" });
  } catch (e) {
    res.json({ error: true });
  }
});

// JPG → PDF
app.post("/jpg-to-pdf", upload.single("file"), async (req, res) => {
  try {
    await run(`convert ${req.file.path} outputs/output.pdf`);
    res.json({ url: "/outputs/output.pdf" });
  } catch (e) {
    res.json({ error: true });
  }
});

// Merge
app.post("/merge", upload.array("files"), async (req, res) => {
  try {
    const files = req.files.map(f => f.path).join(" ");
    await run(`pdfunite ${files} outputs/merged.pdf`);
    res.json({ url: "/outputs/merged.pdf" });
  } catch {
    res.json({ error: true });
  }
});

// Split
app.post("/split", upload.single("file"), async (req, res) => {
  try {
    await run(`pdfseparate ${req.file.path} outputs/page-%d.pdf`);
    res.json({ url: "/outputs/page-1.pdf" });
  } catch {
    res.json({ error: true });
  }
});

// الصفحة الرئيسية
app.get("/", (req, res) => {
  res.send("🔥 PDF SERVER RUNNING");
});

// تشغيل
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port:", PORT);
});
