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
// 🟦 CloudConvert (FIXED)
// ==============================
async function convertCloud(filePath, output) {
  try {
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

  } catch (e) {
    console.log("CloudConvert Failed → fallback");
    return null;
  }
}

// ==============================
// 🟩 ConvertAPI (SAFE)
// ==============================
async function convertConvertAPI(filePath, output) {
  try {
    const form = new FormData();
    form.append("File", fs.createReadStream(filePath));

    const res = await axios.post(
      `https://v2.convertapi.com/convert/pdf/to/${output}?Secret=${CONVERT_API}`,
      form,
      { headers: form.getHeaders() }
    );

    return {
      url: res.data?.Files?.[0]?.Url || null
    };

  } catch (e) {
    console.log("ConvertAPI Failed");
    return null;
  }
}

// ==============================
// 🧠 Smart Convert
// ==============================
async function smartConvert(filePath, output) {

  let result = await convertCloud(filePath, output);

  if (!result || !result.url) {
    result = await convertConvertAPI(filePath, output);
  }

  return result;
}

// ==============================
// 🚀 Convert Endpoint
// ==============================
app.post("/convert", upload.single("file"), async (req, res) => {

  try {
    if (!req.file) {
      return res.status(400).json({ error: true, message: "No file uploaded" });
    }

    const output = req.body.output || "pdf";

    const data = await addToQueue(req.file.path, output);

    fs.unlink(req.file.path, () => {});

    if (!data || !data.url) {
      return res.status(500).json({
        error: true,
        message: "Conversion failed"
      });
    }

    res.json({
      success: true,
      url: data.url
    });

  } catch (e) {
    res.status(500).json({
      error: true,
      message: e.message
    });
  }
});

// ==============================
// ❤️ Health
// ==============================
app.get("/", (req, res) => {
  res.send("🔥 PDF SERVER WORKING");
});

app.get("/health", (req, res) => {
  res.json({ status: "OK 🚀" });
});

// ==============================
// ⚡ Start
// ==============================
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🔥 SERVER RUNNING ON " + PORT);
});
