const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const upload = multer({ dest: "uploads/" });

// 🔑 APIs
const CLOUD_API = process.env.CLOUDCONVERT_API_KEY;
const CONVERT_API = process.env.CONVERT_API;

// ==============================
// 🧠 Free Limit System
// ==============================
const users = {};
const FREE_LIMIT = 999999;

function getIP(req) {
  return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
}

function checkLimit(req, res) {
  const ip = getIP(req);

  if (!users[ip]) users[ip] = { count: 0 };

  if (users[ip].count >= FREE_LIMIT) {
    res.status(403).json({ error: true, message: "LIMIT" });
    return false;
  }

  users[ip].count++;
  return true;
}

// ==============================
// ⚡ Queue
// ==============================
const queue = [];
let processing = false;

async function processQueue() {
  if (processing || queue.length === 0) return;

  processing = true;
  const job = queue.shift();

  try {
    const result = await smartConvert(job.file, job.output);
    job.resolve(result);
  } catch (e) {
    job.reject(e);
  }

  processing = false;
  processQueue();
}

function addToQueue(file, output) {
  return new Promise((resolve, reject) => {
    queue.push({ file, output, resolve, reject });
    processQueue();
  });
}

// ==============================
// 🟦 CloudConvert (FIXED)
// ==============================
async function convertCloud(filePath, output) {

  const job = await axios.post(
    "https://api.cloudconvert.com/v2/jobs",
    {
      tasks: {
        upload: { operation: "import/upload" },
        convert: {
          operation: "convert",
          input: "upload",
          output_format: output
        },
        export: { operation: "export/url", input: "convert" }
      }
    },
    {
      headers: {
        Authorization: `Bearer ${CLOUD_API}`
      }
    }
  );

  const uploadTask = job.data.data.tasks.find(t => t.name === "upload");

  const form = new FormData();
  Object.entries(uploadTask.result.form).forEach(([k, v]) => {
    form.append(k, v);
  });
  form.append("file", fs.createReadStream(filePath));

  await axios.post(uploadTask.result.url, form, {
    headers: form.getHeaders()
  });

  // wait result
  let fileUrl = null;

  while (!fileUrl) {
    const check = await axios.get(
      `https://api.cloudconvert.com/v2/jobs/${job.data.data.id}`,
      {
        headers: {
          Authorization: `Bearer ${CLOUD_API}`
        }
      }
    );

    const exportTask = check.data.data.tasks.find(t => t.name === "export");

    if (exportTask && exportTask.status === "finished") {
      fileUrl = exportTask.result.files[0].url;
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  return { url: fileUrl };
}

// ==============================
// 🟩 ConvertAPI
// ==============================
async function convertConvertAPI(filePath, output) {

  const form = new FormData();
  form.append("File", fs.createReadStream(filePath));

  const res = await axios.post(
    `https://v2.convertapi.com/convert/pdf/to/${output}?Secret=${CONVERT_API}`,
    form,
    { headers: form.getHeaders() }
  );

  return {
    url: res.data.Files[0].Url
  };
}

// ==============================
// 🧠 Smart Router
// ==============================
async function smartConvert(filePath, output) {

  try {
    return await convertCloud(filePath, output);
  } catch {
    return await convertConvertAPI(filePath, output);
  }
}

// ==============================
// 🚀 Convert Endpoint
// ==============================
app.post("/convert", upload.single("file"), async (req, res) => {

  if (!checkLimit(req, res)) return;

  try {
    const output = req.body.output || "pdf";

    const data = await addToQueue(req.file.path, output);

    fs.unlink(req.file.path, () => {});

    res.json({
      success: true,
      url: data.url
    });

  } catch (e) {
    res.status(500).json({ error: true });
  }
});

// ==============================
// ❤️ Health
// ==============================
app.get("/health", (req, res) => {
  res.json({ status: "OK 🚀" });
});

// ==============================
// ⚡ Start
// ==============================
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🔥 SERVER RUNNING " + PORT);
});
