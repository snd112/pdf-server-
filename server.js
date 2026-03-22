const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const upload = multer({ dest: "uploads/" });

// 🔑 Aspose
const CLIENT_ID = process.env.ASPOSE_CLIENT_ID;
const CLIENT_SECRET = process.env.ASPOSE_CLIENT_SECRET;

// ==============================
// 🔐 Get Token
// ==============================
let cachedToken = null;
let tokenExpire = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpire) return cachedToken;

  const res = await axios.post(
    "https://api.aspose.cloud/connect/token",
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  cachedToken = res.data.access_token;
  tokenExpire = Date.now() + (res.data.expires_in - 60) * 1000;

  return cachedToken;
}

// ==============================
// 🧠 Convert via Aspose
// ==============================
async function convertAspose(filePath, output, ext) {
  try {
    const token = await getToken();

    // رفع الملف
    const fileName = path.basename(filePath);

    await axios.put(
      `https://api.aspose.cloud/v3.0/storage/file/${fileName}`,
      fs.createReadStream(filePath),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/octet-stream"
        }
      }
    );

    // تحويل
    const res = await axios.get(
      `https://api.aspose.cloud/v3.0/pdf/convert/${ext}/to/${output}?srcPath=${fileName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: "arraybuffer"
      }
    );

    const outPath = "downloads/" + Date.now() + "." + output;
    fs.writeFileSync(outPath, res.data);

    return { url: "/" + outPath };

  } catch (e) {
    console.log("❌ Aspose:", e.message);
    return null;
  }
}

// ==============================
// 🚀 Endpoint
// ==============================
app.post("/convert", upload.single("file"), async (req, res) => {

  try {
    if (!req.file) {
      return res.json({ error: true, message: "No file" });
    }

    const output = req.body.output || "pdf";

    const ext = path.extname(req.file.originalname)
      .replace(".", "")
      .toLowerCase();

    const result = await convertAspose(req.file.path, output, ext);

    fs.unlink(req.file.path, () => {});

    if (!result) {
      return res.json({
        error: true,
        message: "Conversion failed"
      });
    }

    res.json({
      success: true,
      url: result.url
    });

  } catch (e) {
    res.json({ error: true, message: e.message });
  }
});

// ==============================
// ❤️ Health
// ==============================
app.get("/health", (req, res) => {
  res.json({ status: "OK 🚀" });
});

// ==============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log("🔥 Aspose Server Running " + PORT);
});
