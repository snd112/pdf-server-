const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });

// =============================
// 🧠 Helper
// =============================
function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve(stdout);
    });
  });
}

// =============================
// 📄 Convert Office → PDF
// =============================
app.post("/word-to-pdf", upload.single("file"), async (req, res) => {
  const file = req.file.path;

  await run(`libreoffice --headless --convert-to pdf ${file} --outdir outputs`);

  const out = file.replace(path.extname(file), ".pdf");
  res.json({ url: "/outputs/" + path.basename(out) });
});

app.post("/excel-to-pdf", upload.single("file"), async (req, res) => {
  const file = req.file.path;

  await run(`libreoffice --headless --convert-to pdf ${file} --outdir outputs`);

  const out = file.replace(path.extname(file), ".pdf");
  res.json({ url: "/outputs/" + path.basename(out) });
});

app.post("/ppt-to-pdf", upload.single("file"), async (req, res) => {
  const file = req.file.path;

  await run(`libreoffice --headless --convert-to pdf ${file} --outdir outputs`);

  const out = file.replace(path.extname(file), ".pdf");
  res.json({ url: "/outputs/" + path.basename(out) });
});

// =============================
// 🔄 PDF → Office
// =============================
app.post("/pdf-to-word", upload.single("file"), async (req, res) => {
  const file = req.file.path;

  await run(`libreoffice --headless --convert-to docx ${file} --outdir outputs`);

  const out = file.replace(".pdf", ".docx");
  res.json({ url: "/outputs/" + path.basename(out) });
});

// =============================
// 🖼 PDF → JPG
// =============================
app.post("/pdf-to-jpg", upload.single("file"), async (req, res) => {
  const file = req.file.path;
  const out = "outputs/output.jpg";

  await run(`pdftoppm -jpeg ${file} outputs/output`);

  res.json({ url: "/" + out });
});

// =============================
// 🖼 JPG → PDF
// =============================
app.post("/jpg-to-pdf", upload.single("file"), async (req, res) => {
  const file = req.file.path;
  const out = "outputs/output.pdf";

  await run(`convert ${file} ${out}`);

  res.json({ url: "/" + out });
});

// =============================
// 📦 Merge PDF
// =============================
app.post("/merge", upload.array("files"), async (req, res) => {
  const files = req.files.map(f => f.path).join(" ");
  const out = "outputs/merged.pdf";

  await run(`pdfunite ${files} ${out}`);

  res.json({ url: "/" + out });
});

// =============================
// ✂ Split PDF
// =============================
app.post("/split", upload.single("file"), async (req, res) => {
  const file = req.file.path;

  await run(`pdfseparate ${file} outputs/page-%d.pdf`);

  res.json({ url: "/outputs/page-1.pdf" });
});

// =============================
// 🗜 Compress PDF
// =============================
app.post("/compress", upload.single("file"), async (req, res) => {
  const file = req.file.path;
  const out = "outputs/compressed.pdf";

  await run(`gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${out} ${file}`);

  res.json({ url: "/" + out });
});

// =============================
// 🔐 Protect PDF
// =============================
app.post("/protect", upload.single("file"), async (req, res) => {
  const file = req.file.path;
  const out = "outputs/protected.pdf";

  await run(`qpdf --encrypt 1234 1234 256 -- ${file} ${out}`);

  res.json({ url: "/" + out });
});

// =============================
// 🔓 Unlock PDF
// =============================
app.post("/unlock", upload.single("file"), async (req, res) => {
  const file = req.file.path;
  const out = "outputs/unlocked.pdf";

  await run(`qpdf --decrypt ${file} ${out}`);

  res.json({ url: "/" + out });
});

// =============================
app.get("/", (req, res) => {
  res.send("🔥 PDF SERVER RUNNING");
});

// =============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server Started:", PORT);
});
