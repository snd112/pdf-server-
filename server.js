const express = require("express");
const multer = require("multer");
const cors = require("cors");
const compression = require("compression");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());
app.use(compression());
app.use(express.static("public"));
app.use("/outputs", express.static("outputs"));

const SECRET = "pdf-secret";
const users = {};
const jobs = {};

// إنشاء الفولدرات
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("outputs")) fs.mkdirSync("outputs");

// رفع الملفات
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 }
});

// ================= RUN CMD =================
function run(cmd, args) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args);

    let error = "";

    p.stderr.on("data", (data) => {
      error += data.toString();
    });

    p.on("close", (code) => {
      if (code !== 0) {
        console.log("❌ ERROR:", error);
        return resolve(false); // 👈 مهم
      }
      resolve(true);
    });
  });
}

// ================= AUTH =================
function auth(req, res, next) {
  try {
    const token = req.headers.authorization;
    const data = jwt.verify(token, SECRET);
    req.user = data.email;
    next();
  } catch {
    res.status(401).json({ error: "unauthorized" });
  }
}

// ================= AUTH ROUTES =================
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.json({ error: "missing data" });

  if (users[email]) return res.json({ error: "exists" });

  users[email] = { password, files: [] };

  res.json({ success: true });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!users[email] || users[email].password !== password)
    return res.json({ error: "invalid" });

  const token = jwt.sign({ email }, SECRET);
  res.json({ token });
});

// ================= PREVIEW =================
app.post("/preview", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ error: true, message: "❌ no file" });
    }

    const ok = await run("pdftoppm", [
      "-jpeg",
      req.file.path,
      "outputs/preview"
    ]);

    if (!ok) {
      return res.json({ error: true, message: "preview failed" });
    }

    res.json({ url: "/outputs/preview-1.jpg" });

  } catch (e) {
    res.json({ error: true, message: "server error" });
  }
});

// ================= MERGE =================
app.post("/merge", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.json({ error: true, message: "no files" });
    }

    const id = Date.now();
    const files = req.files.map(f => f.path);

    const ok = await run("pdfunite", [
      ...files,
      `outputs/${id}.pdf`
    ]);

    if (!ok) {
      return res.json({ error: true, message: "merge failed" });
    }

    res.json({
      success: true,
      url: `/outputs/${id}.pdf`
    });

  } catch {
    res.json({ error: true });
  }
});

// ================= CHECK =================
app.get("/check-tools", async (req, res) => {
  const a = await run("pdftoppm", ["-h"]);
  const b = await run("pdfunite", ["-h"]);

  if (a && b) {
    res.send("✅ tools OK");
  } else {
    res.send("❌ tools missing");
  }
});

// ================= TEST =================
app.get("/", (req, res) => {
  res.send("🔥 PDF SERVER WORKING");
});

// ================= START =================
const PORT = process.env.PORT 

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Running on port", PORT);
});
