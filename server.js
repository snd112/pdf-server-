const express = require("express");
const multer = require("multer");
const cors = require("cors");
const compression = require("compression");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());
app.use(compression());
app.use(express.static("public"));
app.use("/outputs", express.static("outputs"));

// إنشاء فولدرات
["uploads", "outputs"].forEach(f => {
  if (!fs.existsSync(f)) fs.mkdirSync(f);
});

// رفع ملفات
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }
});

// تشغيل أوامر بسرعة
function run(cmd, args) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args);

    p.on("close", (code) => {
      resolve(code === 0);
    });
  });
}

// ================= MERGE =================
app.post("/merge", upload.array("files"), async (req, res) => {
  const id = Date.now();
  const files = req.files.map(f => f.path);

  const ok = await run("pdfunite", [...files, `outputs/${id}.pdf`]);

  if (!ok) return res.json({ error: "merge failed" });

  res.json({ url: `/outputs/${id}.pdf` });
});

// ================= SPLIT =================
app.post("/split", upload.single("file"), async (req, res) => {
  const id = Date.now();

  const ok = await run("pdfseparate", [
    req.file.path,
    `outputs/${id}-%d.pdf`
  ]);

  if (!ok) return res.json({ error: "split failed" });

  res.json({ success: true, prefix: `/outputs/${id}-` });
});

// ================= COMPRESS =================
app.post("/compress", upload.single("file"), async (req, res) => {
  const id = Date.now();

  const ok = await run("gs", [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.4",
    "-dPDFSETTINGS=/ebook",
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    `-sOutputFile=outputs/${id}.pdf`,
    req.file.path
  ]);

  if (!ok) return res.json({ error: "compress failed" });

  res.json({ url: `/outputs/${id}.pdf` });
});

// ================= PDF → JPG =================
app.post("/pdf-to-jpg", upload.single("file"), async (req, res) => {
  const id = Date.now();

  const ok = await run("pdftoppm", [
    "-jpeg",
    req.file.path,
    `outputs/${id}`
  ]);

  if (!ok) return res.json({ error: "convert failed" });

  res.json({ prefix: `/outputs/${id}` });
});

// ================= JPG → PDF =================
app.post("/jpg-to-pdf", upload.array("files"), async (req, res) => {
  const id = Date.now();
  const imgs = req.files.map(f => f.path);

  const ok = await run("img2pdf", [...imgs, "-o", `outputs/${id}.pdf`]);

  if (!ok) return res.json({ error: "convert failed" });

  res.json({ url: `/outputs/${id}.pdf` });
});

// ================= ROTATE =================
app.post("/rotate", upload.single("file"), async (req, res) => {
  const id = Date.now();

  const ok = await run("pdftk", [
    req.file.path,
    "cat",
    "1-endR",
    "output",
    `outputs/${id}.pdf`
  ]);

  if (!ok) return res.json({ error: "rotate failed" });

  res.json({ url: `/outputs/${id}.pdf` });
});

// ================= WATERMARK =================
app.post("/watermark", upload.single("file"), async (req, res) => {
  const id = Date.now();

  const ok = await run("pdftk", [
    req.file.path,
    "background",
    "watermark.pdf",
    "output",
    `outputs/${id}.pdf`
  ]);

  if (!ok) return res.json({ error: "watermark failed" });

  res.json({ url: `/outputs/${id}.pdf` });
});

// ================= TEST =================
app.get("/", (req, res) => {
  res.send("🔥 PDF SERVER ULTRA WORKING");
});

// ================= START =================
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Running on port", PORT);
});
