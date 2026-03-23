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

// 🔥 Queue بسيط بدل p-queue
let isProcessing = false;
const jobQueue = [];

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
  return new Promise((resolve, reject) => {
    console.log("🚀 Running:", cmd, args.join(" "));

    const p = spawn(cmd, args);

    let error = "";

    p.stderr.on("data", (data) => {
      error += data.toString();
    });

    p.on("close", (code) => {
      if (code !== 0) {
        console.log("❌ CMD ERROR:", error);
        return reject(error);
      }
      resolve(true);
    });
  });
}

// ================= QUEUE =================
async function processQueue() {
  if (isProcessing || jobQueue.length === 0) return;

  isProcessing = true;
  const job = jobQueue.shift();

  try {
    await job();
  } catch (e) {
    console.log("🔥 JOB ERROR:", e);
  }

  isProcessing = false;
  processQueue();
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

// ================= PREVIEW =================
app.post("/preview", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ error: true, message: "❌ no file" });
    }

    await run("pdftoppm", ["-jpeg", req.file.path, "outputs/preview"]);

    res.json({ url: "/outputs/preview-1.jpg" });

  } catch (e) {
    console.log("🔥 PREVIEW ERROR:", e);
    res.json({ error: true, message: e });
  }
});

// ================= MERGE =================
app.post("/merge", auth, upload.array("files"), async (req, res) => {

  if (!req.files || req.files.length === 0) {
    return res.json({ error: true, message: "❌ no files" });
  }

  const id = Date.now();
  jobs[id] = { status: "processing" };

  jobQueue.push(async () => {
    try {
      const files = req.files.map(f => f.path);

      await run("pdfunite", [...files, `outputs/${id}.pdf`]);

      users[req.user].files.push(`/outputs/${id}.pdf`);

      jobs[id] = {
        status: "done",
        url: `/outputs/${id}.pdf`
      };

    } catch (e) {
      jobs[id] = { status: "error", message: e };
    }
  });

  processQueue();

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
  console.log("🚀 Server running:", PORT);
});
