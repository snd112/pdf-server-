const express = require("express");
const multer = require("multer");
const { spawn } = require("child_process");
const fs = require("fs");

const app = express();

app.use(express.static("public"));
app.use("/outputs", express.static("outputs"));

// إنشاء فولدرات
["uploads", "outputs"].forEach(f => {
  if (!fs.existsSync(f)) fs.mkdirSync(f);
});

const upload = multer({ dest: "uploads/" });

// تشغيل الأوامر
function run(cmd, args) {
  return new Promise(resolve => {
    const p = spawn(cmd, args);
    p.on("close", code => resolve(code === 0));
  });
}

// ================= MERGE =================
app.post("/merge", upload.array("files"), async (req, res) => {
  const id = Date.now();
  const files = req.files.map(f => f.path);

  const ok = await run("pdfunite", [...files, `outputs/${id}.pdf`]);
  res.json(ok ? { url: `/outputs/${id}.pdf` } : { error: true });
});

// ================= SPLIT =================
app.post("/split", upload.single("file"), async (req, res) => {
  const id = Date.now();

  const ok = await run("pdfseparate", [
    req.file.path,
    `outputs/${id}-%d.pdf`
  ]);

  res.json(ok ? { url: `/outputs/${id}-1.pdf` } : { error: true });
});

// ================= COMPRESS =================
app.post("/compress", upload.single("file"), async (req, res) => {
  const id = Date.now();

  const ok = await run("gs", [
    "-sDEVICE=pdfwrite",
    "-dPDFSETTINGS=/ebook",
    "-dNOPAUSE", "-dQUIET", "-dBATCH",
    `-sOutputFile=outputs/${id}.pdf`,
    req.file.path
  ]);

  res.json(ok ? { url: `/outputs/${id}.pdf` } : { error: true });
});

// ================= PDF → WORD =================
app.post("/pdf-to-word", upload.single("file"), async (req, res) => {
  await run("libreoffice", [
    "--headless", "--convert-to", "docx",
    req.file.path, "--outdir", "outputs"
  ]);

  res.json({ url: `/outputs/${req.file.filename}.docx` });
});

// ================= WORD → PDF =================
app.post("/word-to-pdf", upload.single("file"), async (req, res) => {
  await run("libreoffice", [
    "--headless", "--convert-to", "pdf",
    req.file.path, "--outdir", "outputs"
  ]);

  res.json({ url: `/outputs/${req.file.filename}.pdf` });
});

// ================= PPT → PDF =================
app.post("/ppt-to-pdf", upload.single("file"), async (req, res) => {
  await run("libreoffice", [
    "--headless", "--convert-to", "pdf",
    req.file.path, "--outdir", "outputs"
  ]);

  res.json({ url: `/outputs/${req.file.filename}.pdf` });
});

// ================= PDF → PPT =================
app.post("/pdf-to-ppt", upload.single("file"), async (req, res) => {
  await run("libreoffice", [
    "--headless", "--convert-to", "pptx",
    req.file.path, "--outdir", "outputs"
  ]);

  res.json({ url: `/outputs/${req.file.filename}.pptx` });
});

// ================= EXCEL → PDF =================
app.post("/excel-to-pdf", upload.single("file"), async (req, res) => {
  await run("libreoffice", [
    "--headless", "--convert-to", "pdf",
    req.file.path, "--outdir", "outputs"
  ]);

  res.json({ url: `/outputs/${req.file.filename}.pdf` });
});

// ================= PDF → EXCEL =================
app.post("/pdf-to-excel", upload.single("file"), async (req, res) => {
  await run("libreoffice", [
    "--headless", "--convert-to", "xlsx",
    req.file.path, "--outdir", "outputs"
  ]);

  res.json({ url: `/outputs/${req.file.filename}.xlsx` });
});

// ================= PDF → JPG =================
app.post("/pdf-to-jpg", upload.single("file"), async (req, res) => {
  const id = Date.now();

  await run("pdftoppm", ["-jpeg", req.file.path, `outputs/${id}`]);

  res.json({ url: `/outputs/${id}-1.jpg` });
});

// ================= JPG → PDF =================
app.post("/jpg-to-pdf", upload.array("files"), async (req, res) => {
  const id = Date.now();
  const imgs = req.files.map(f => f.path);

  await run("img2pdf", [...imgs, "-o", `outputs/${id}.pdf`]);

  res.json({ url: `/outputs/${id}.pdf` });
});

// ================= PROTECT =================
app.post("/protect", upload.single("file"), async (req, res) => {
  const id = Date.now();

  await run("qpdf", [
    "--encrypt", "1234", "1234", "256",
    "--", req.file.path, `outputs/${id}.pdf`
  ]);

  res.json({ url: `/outputs/${id}.pdf` });
});

// ================= UNLOCK =================
app.post("/unlock", upload.single("file"), async (req, res) => {
  const id = Date.now();

  await run("qpdf", [
    "--decrypt", req.file.path, `outputs/${id}.pdf`
  ]);

  res.json({ url: `/outputs/${id}.pdf` });
});

// ================= OCR =================
app.post("/ocr", upload.single("file"), async (req, res) => {
  const id = Date.now();

  await run("tesseract", [
    req.file.path, `outputs/${id}`, "pdf"
  ]);

  res.json({ url: `/outputs/${id}.pdf` });
});

// ================= HTML → PDF =================
app.post("/html-to-pdf", upload.single("file"), async (req, res) => {
  const id = Date.now();

  await run("wkhtmltopdf", [
    req.file.path, `outputs/${id}.pdf`
  ]);

  res.json({ url: `/outputs/${id}.pdf` });
});

// ================= START =================
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on", PORT);
});
