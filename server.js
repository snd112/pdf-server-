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

// 🧠 usage
let usage = {
  cloud: 0,
  convert: 0
};

// 🧠 cache
const cache = new Map();

// ==============================
// ⚡ Queue System
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
// 🟦 CloudConvert
// ==============================
async function convertCloud(filePath, output) {
  const res = await axios.post(
    "https://api.cloudconvert.com/v2/jobs",
    {
      tasks: {
        import: { operation: "import/upload" },
        convert: {
          operation: "convert",
          input: "import",
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

  usage.cloud++;
  return res.data;
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

  usage.convert++;
  return res.data;
}

// ==============================
// 🧠 Smart Router
// ==============================
async function smartConvert(filePath, output) {

  // 🎯 اختيار حسب النوع
  if (["docx", "xlsx", "pptx"].includes(output)) {
    try {
      console.log("⚡ CloudConvert (Office)");
      return await convertCloud(filePath, output);
    } catch {
      return await convertConvertAPI(filePath, output);
    }
  }

  // 🖼 الصور
  if (["jpg", "png"].includes(output)) {
    try {
      console.log("⚡ ConvertAPI (Images)");
      return await convertConvertAPI(filePath, output);
    } catch {
      return await convertCloud(filePath, output);
    }
  }

  // 🔄 fallback عام
  try {
    console.log("⚡ Default CloudConvert");
    return await convertCloud(filePath, output);
  } catch {
    console.log("🔁 fallback ConvertAPI");
    return await convertConvertAPI(filePath, output);
  }
}

// ==============================
// 🚀 Convert Endpoint
// ==============================
app.post("/convert", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });

    const output = req.body.output || "pdf";
    const key = req.file.originalname + "_" + output;

    // 💾 Cache
    if (cache.has(key)) {
      return res.json({ cached: true, data: cache.get(key) });
    }

    // ⚡ Queue
    const data = await addToQueue(req.file.path, output);

    cache.set(key, data);

    fs.unlink(req.file.path, () => {});

    res.json({
      success: true,
      output,
      usage
    });

  } catch (e) {
    res.status(500).json({
      error: true,
      message: e.message
    });
  }
});

// ==============================
// 🎯 Tools
// ==============================
function tool(route, format) {
  app.post(route, upload.single("file"), (req, res, next) => {
    req.body.output = format;
    app._router.handle(req, res, next, "post", "/convert");
  });
}

tool("/pdf-to-word", "docx");
tool("/pdf-to-excel", "xlsx");
tool("/pdf-to-ppt", "pptx");
tool("/pdf-to-jpg", "jpg");
tool("/word-to-pdf", "pdf");
tool("/excel-to-pdf", "pdf");

// ==============================
// ❤️ Health
// ==============================
app.get("/health", (req, res) => {
  res.json({ status: "OK 🚀", usage });
});

// ==============================
// ⚡ Start
// ==============================
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🔥 NUCLEAR SERVER RUNNING " + PORT);
});
