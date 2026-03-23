const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();

// ✅ مهم
app.use(cors());
app.use(express.static("public"));
app.use("/outputs", express.static("outputs"));

// رفع الملفات
const upload = multer({ dest: "uploads/" });

// =============================
// 🧠 Helper
// =============================
function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.log("❌ CMD ERROR:", stderr);
        return reject(stderr);
      }
      resolve(stdout);
    });
  });
}

// =============================
// 📄 Office → PDF
// =============================
app.post("/word-to-pdf", upload.single("file"), async (req, res) => {
  try {
    await run(`libreoffice --headless --convert-to pdf ${req.file.path} --outdir outputs`);
    res.json({ url: "/outputs/" + path.basename(req.file.path) + ".pdf" });
  } catch {
    res.json({ error: true });
  }
});

app.post("/excel-to-pdf", upload.single("file"), async (req, res) => {
  try {
    await run(`libreoffice --headless --convert-to pdf ${req.file.path} --outdir outputs`);
    res.json({ url: "/outputs/" + path.basename(req.file.path) + ".pdf" });
  } catch {
    res.json({ error: true });
  }
});

app.post("/ppt-to-pdf", upload.single("file"), async (req, res) => {
  try {
    await run(`libreoffice --headless --convert-to pdf ${req.file.path} --outdir outputs`);
    res.json({ url: "/outputs/" + path.basename(req.file.path) + ".pdf" });
  } catch {
    res.json({ error: true });
  }
});

// =============================
// 🔄 PDF → Word
// =============================
app.post("/pdf-to-word", upload.single("file"), async (req, res) => {
  try {
    await run(`libreoffice --headless --convert-to docx ${req.file.path} --outdir outputs`);
    res.json({ url: "/outputs/" + path.basename(req.file.path) + ".docx" });
  } catch {
    res.json({ error: true });
  }
});

// =============================
// 🖼 PDF → JPG
// =============================
app.post("/pdf-to-jpg", upload.single("file"), async (req, res) => {
  try {
    await run(`pdftoppm -jpeg ${req.file.path} outputs/output`);
    res.json({ url: "/outputs/output-1.jpg" });
  } catch {
    res.json({ error: true });
  }
});

// =============================
// 🖼 JPG → PDF
// =============================
app.post("/jpg-to-pdf", upload.single("file"), async (req, res) => {
  try {
    await run(`convert ${req.file.path} outputs/output.pdf`);
    res.json({ url: "/outputs/output.pdf" });
  } catch {
    res.json({ error: true });
  }
});

// =============================
// 📦 Merge PDF
// =============================
app.post("/merge", upload.array("files"), async (req, res) => {
  try {
    const files = req.files.map(f => f.path).join(" ");
    await run(`pdfunite ${files} outputs/merged.pdf`);
    res.json({ url: "/outputs/merged.pdf" });
  } catch {
    res.json({ error: true });
  }
});

// =============================
// ✂ Split PDF
// =============================
app.post("/split", upload.single("file"), async (req, res) => {
  try {
    await run(`pdfseparate ${req.file.path} outputs/page-%d.pdf`);
    res.json({ url: "/outputs/page-1.pdf" });
  } catch {
    res.json({ error: true });
  }
});

// =============================
// 🗜 Compress PDF
// =============================
app.post("/compress", upload.single("file"), async (req, res) => {
  try {
    await run(`gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=outputs/compressed.pdf ${req.file.path}`);
    res.json({ url: "/outputs/compressed.pdf" });
  } catch {
    res.json({ error: true });
  }
});

// =============================
// 🔐 Protect
// =============================
app.post("/protect", upload.single("file"), async (req, res) => {
  try {
    await run(`qpdf --encrypt 1234 1234 256 -- ${req.file.path} outputs/protected.pdf`);
    res.json({ url: "/outputs/protected.pdf" });
  } catch {
    res.json({ error: true });
  }
});

// =============================
// 🔓 Unlock
// =============================
app.post("/unlock", upload.single("file"), async (req, res) => {
  try {
    await run(`qpdf --decrypt ${req.file.path} outputs/unlocked.pdf`);
    res.json({ url: "/outputs/unlocked.pdf" });
  } catch {
    res.json({ error: true });
  }
});

// =============================
// 🏠 Home
// =============================
app.get("/", (req, res) => {
  res.send("🔥 PDF SERVER RUNNING");
});

// =============================
// 🚀 Start Server (مهم جدًا)
// =============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port:", PORT);
});
