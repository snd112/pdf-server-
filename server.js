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

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("outputs")) fs.mkdirSync("outputs");

const upload = multer({ dest: "uploads/" });

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve(stdout);
    });
  });
}

// ================= PDF =================
app.post("/merge", upload.array("files"), async (req, res) => {
  try {
    const files = req.files.map(f => f.path).join(" ");
    await run(`pdfunite ${files} outputs/merged.pdf`);
    res.json({ url: "/outputs/merged.pdf" });
  } catch { res.json({ error: true }); }
});

app.post("/split", upload.single("file"), async (req, res) => {
  try {
    await run(`pdfseparate ${req.file.path} outputs/page-%d.pdf`);
    res.json({ url: "/outputs/page-1.pdf" });
  } catch { res.json({ error: true }); }
});

app.post("/compress", upload.single("file"), async (req, res) => {
  try {
    await run(`gs -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook -o outputs/compressed.pdf ${req.file.path}`);
    res.json({ url: "/outputs/compressed.pdf" });
  } catch { res.json({ error: true }); }
});

// ================= تحويل =================
app.post("/pdf-to-word", upload.single("file"), async (req, res) => {
  try {
    await run(`libreoffice --headless --convert-to docx ${req.file.path} --outdir outputs`);
    res.json({ url: "/outputs/" + path.basename(req.file.path) + ".docx" });
  } catch { res.json({ error: true }); }
});

app.post("/pdf-to-excel", upload.single("file"), async (req, res) => {
  try {
    await run(`libreoffice --headless --convert-to xlsx ${req.file.path} --outdir outputs`);
    res.json({ url: "/outputs/" + path.basename(req.file.path) + ".xlsx" });
  } catch { res.json({ error: true }); }
});

app.post("/pdf-to-ppt", upload.single("file"), async (req, res) => {
  try {
    await run(`libreoffice --headless --convert-to pptx ${req.file.path} --outdir outputs`);
    res.json({ url: "/outputs/" + path.basename(req.file.path) + ".pptx" });
  } catch { res.json({ error: true }); }
});

app.post("/pdf-to-jpg", upload.single("file"), async (req, res) => {
  try {
    await run(`pdftoppm -jpeg ${req.file.path} outputs/img`);
    res.json({ url: "/outputs/img-1.jpg" });
  } catch { res.json({ error: true }); }
});

// ================= العكس =================
app.post("/word-to-pdf", upload.single("file"), async (req, res) => {
  try {
    await run(`libreoffice --headless --convert-to pdf ${req.file.path} --outdir outputs`);
    res.json({ url: "/outputs/" + path.basename(req.file.path) + ".pdf" });
  } catch { res.json({ error: true }); }
});

app.post("/excel-to-pdf", upload.single("file"), async (req, res) => {
  try {
    await run(`libreoffice --headless --convert-to pdf ${req.file.path} --outdir outputs`);
    res.json({ url: "/outputs/" + path.basename(req.file.path) + ".pdf" });
  } catch { res.json({ error: true }); }
});

app.post("/ppt-to-pdf", upload.single("file"), async (req, res) => {
  try {
    await run(`libreoffice --headless --convert-to pdf ${req.file.path} --outdir outputs`);
    res.json({ url: "/outputs/" + path.basename(req.file.path) + ".pdf" });
  } catch { res.json({ error: true }); }
});

app.post("/jpg-to-pdf", upload.single("file"), async (req, res) => {
  try {
    await run(`convert ${req.file.path} outputs/out.pdf`);
    res.json({ url: "/outputs/out.pdf" });
  } catch { res.json({ error: true }); }
});

// ================= حماية =================
app.post("/protect", upload.single("file"), async (req, res) => {
  try {
    await run(`qpdf --encrypt 1234 1234 256 -- ${req.file.path} outputs/protected.pdf`);
    res.json({ url: "/outputs/protected.pdf" });
  } catch { res.json({ error: true }); }
});

app.post("/unlock", upload.single("file"), async (req, res) => {
  try {
    await run(`qpdf --decrypt ${req.file.path} outputs/unlocked.pdf`);
    res.json({ url: "/outputs/unlocked.pdf" });
  } catch { res.json({ error: true }); }
});

// ================= تعديل =================
app.post("/rotate", upload.single("file"), async (req, res) => {
  try {
    await run(`pdftk ${req.file.path} cat 1-endright output outputs/rotated.pdf`);
    res.json({ url: "/outputs/rotated.pdf" });
  } catch { res.json({ error: true }); }
});

app.post("/extract", upload.single("file"), async (req, res) => {
  try {
    await run(`pdftk ${req.file.path} cat 1-2 output outputs/extracted.pdf`);
    res.json({ url: "/outputs/extracted.pdf" });
  } catch { res.json({ error: true }); }
});

app.post("/delete-pages", upload.single("file"), async (req, res) => {
  try {
    await run(`pdftk ${req.file.path} cat 1-2 5-end output outputs/deleted.pdf`);
    res.json({ url: "/outputs/deleted.pdf" });
  } catch { res.json({ error: true }); }
});

// ================= إضافات =================
app.post("/watermark", upload.single("file"), async (req, res) => {
  try {
    await run(`convert ${req.file.path} -gravity southeast -draw "text 10,10 'PDF'" outputs/watermarked.pdf`);
    res.json({ url: "/outputs/watermarked.pdf" });
  } catch { res.json({ error: true }); }
});

app.post("/repair", upload.single("file"), async (req, res) => {
  try {
    await run(`gs -o outputs/repaired.pdf -sDEVICE=pdfwrite ${req.file.path}`);
    res.json({ url: "/outputs/repaired.pdf" });
  } catch { res.json({ error: true }); }
});

app.post("/ocr", upload.single("file"), async (req, res) => {
  try {
    await run(`tesseract ${req.file.path} outputs/text -l ara+eng`);
    res.json({ url: "/outputs/text.txt" });
  } catch { res.json({ error: true }); }
});

// =================
app.get("/", (req, res) => {
  res.send("🔥 PDFORGE ULTRA RUNNING");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running:", PORT);
});
