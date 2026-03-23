const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });

// بيانات Aspose من Environment Variables
const CLIENT_ID = process.env.ASPOSE_CLIENT_ID;
const CLIENT_SECRET = process.env.ASPOSE_CLIENT_SECRET;

let accessToken = null;

// ==============================
// 🔑 Get Token
// ==============================
async function getToken() {
  try {
    const res = await axios.post(
      "https://api.aspose.cloud/connect/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    accessToken = res.data.access_token;
    console.log("✅ Token Received");
  } catch (e) {
    console.log("❌ Token Error:", e.response?.data || e.message);
  }
}

// ==============================
// 🚀 Convert with Aspose
// ==============================
async function convertAspose(filePath, output) {
  try {
    console.log("🚀 Aspose converting to:", output);

    const fileName = path.basename(filePath);

    // رفع الملف
    await axios.put(
      `https://api.aspose.cloud/v3.0/storage/file/${fileName}`,
      fs.createReadStream(filePath),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/octet-stream"
        }
      }
    );

    // طلب التحويل
    const res = await axios.get(
      `https://api.aspose.cloud/v3.0/pdf/convert/${output}?outPath=result.${output}&file=${fileName}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    console.log("📦 Aspose Response:", res.data);

    return {
      url: `https://api.aspose.cloud/v3.0/storage/file/result.${output}`
    };

  } catch (e) {
    console.log("❌ Aspose Error:", e.response?.data || e.message);
    return null;
  }
}

// ==============================
// Endpoint
// ==============================
app.post("/convert", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ error: true, message: "No file uploaded" });
    }

    const output = req.body.output || "pdf";

    const result = await convertAspose(req.file.path, output);

    fs.unlink(req.file.path, () => {});

    if (!result) {
      return res.json({
        error: true,
        message: "Conversion failed (Aspose error)"
      });
    }

    res.json({
      success: true,
      url: result.url
    });

  } catch (e) {
    console.log("🔥 Server Error:", e.message);

    res.json({
      error: true,
      message: e.message
    });
  }
});

// ==============================
app.get("/", (req, res) => {
  res.send("🔥 Aspose Server Running");
});

app.get("/health", (req, res) => {
  res.json({ status: "OK 🚀" });
});

// ==============================
const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {
  console.log("🚀 Server Started:", PORT);
  await getToken();
});
