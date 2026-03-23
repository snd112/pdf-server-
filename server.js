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

// ✅ Queue بديل بسيط
let running = false;
const queue = [];

function runNext() {
  if (running || queue.length === 0) return;

  running = true;
  const job = queue.shift();

  job().finally(() => {
    running = false;
    runNext();
  });
}

// إنشاء فولدرات
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("outputs")) fs.mkdirSync("outputs");

// رفع الملفات
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 }
});

// تشغيل أوامر
function run(cmd, args) {
  return new Promise((resolve, reject) => {
    console.log("🚀", cmd, args.join(" "));

    const p = spawn(cmd, args);
    let err = "";

    p.stderr.on("data", d => err += d.toString());

    p.on("close", code => {
      if (code !== 0) return reject(err);
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

// ================= AUTH APIs =================
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

app.get("/my-files", auth, (req, res) => {
  res.json(users[req.user].files || []);
});

// ================= PREVIEW =================
app.post("/preview", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.json({ error: true, message: "no file" });

    await run("pdftoppm", ["-jpeg", req.file.path, "outputs/preview"]);

    res.json({ url: "/outputs/preview-1.jpg" });

  } catch (e) {
    console.log("❌ preview error:", e);
    res.json({ error: true });
  }
});

// ================= MERGE =================
app.post("/merge", auth, upload.array("files"), (req, res) => {

  if (!req.files || req.files.length === 0)
    return res.json({ error: true, message: "no files" });

  const id = Date.now();
  jobs[id] = { status: "processing" };

  queue.push(async () => {
    try {
      const files = req.files.map(f => f.path);

      await run("pdfunite", [...files, `outputs/${id}.pdf`]);

      users[req.user].files.push(`/outputs/${id}.pdf`);

      jobs[id] = {
        status: "done",
        url: `/outputs/${id}.pdf`
      };

    } catch (e) {
      console.log("❌ merge error:", e);
      jobs[id] = { status: "error" };
    }
  });

  runNext();

  res.json({ jobId: id });
});

// ================= STATUS =================
app.get("/status/:id", (req, res) => {
  res.json(jobs[req.params.id] || { status: "notfound" });
});

// ================= TEST =================
app.get("/test", (req, res) => {
  res.send("✅ Server OK");
});

// ================= HOME =================
app.get("/", (req, res) => {
  res.send("🔥 PDFORGE ULTRA RUNNING");
});

// ================= START =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on", PORT);
});
