const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.use("/outputs", express.static("outputs"));

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve(stdout);
    });
  });
}

// ===== أدوات =====

// Merge
app.post("/merge", upload.array("files"), async (req, res) => {
  const files = req.files.map(f => f.path).join(" ");
  const out = "outputs/merged.pdf";
  await run(`qpdf --empty --pages ${files} -- ${out}`);
  res.json({ url: "/" + out });
});

// Compress
app.post("/compress", upload.single("file"), async (req, res) => {
  const out = "outputs/compressed.pdf";
  await run(`gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${out} ${req.file.path}`);
  res.json({ url: "/" + out });
});

// Convert
app.post("/convert", upload.single("file"), async (req, res) => {
  await run(`libreoffice --headless --convert-to pdf --outdir outputs ${req.file.path}`);
  const file = fs.readdirSync("outputs").pop();
  res.json({ url: "/outputs/" + file });
});

// PDF → JPG
app.post("/pdf-to-jpg", upload.single("file"), async (req, res) => {
  await run(`pdftoppm -jpeg ${req.file.path} outputs/output`);
  res.json({ success: true });
});

// JPG → PDF
app.post("/jpg-to-pdf", upload.array("files"), async (req, res) => {
  const files = req.files.map(f => f.path).join(" ");
  const out = "outputs/images.pdf";
  await run(`convert ${files} ${out}`);
  res.json({ url: "/" + out });
});

// Protect
app.post("/protect", upload.single("file"), async (req, res) => {
  const out = "outputs/protected.pdf";
  const pass = req.body.password || "1234";
  await run(`qpdf --encrypt ${pass} ${pass} 256 -- ${req.file.path} ${out}`);
  res.json({ url: "/" + out });
});

// Unlock
app.post("/unlock", upload.single("file"), async (req, res) => {
  const out = "outputs/unlocked.pdf";
  await run(`qpdf --decrypt ${req.file.path} ${out}`);
  res.json({ url: "/" + out });
});

// Rotate
app.post("/rotate", upload.single("file"), async (req, res) => {
  const out = "outputs/rotated.pdf";
  await run(`qpdf ${req.file.path} --rotate=+90:1-z ${out}`);
  res.json({ url: "/" + out });
});

// Text
app.post("/pdf-to-text", upload.single("file"), async (req, res) => {
  const out = "outputs/text.txt";
  await run(`pdftotext ${req.file.path} ${out}`);
  res.json({ url: "/" + out });
});

app.listen(8080, () => console.log("🔥 SERVER READY"));
