const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const ILovePDFApi = require("ilovepdf-nodejs");

const app = express();
app.use(fileUpload());
app.use(express.static("public"));

const PORT = process.env.PORT || 8080;

const publicKey = process.env.ILOVEPDF_PUBLIC_KEY;
const secretKey = process.env.ILOVEPDF_SECRET_KEY;

app.post("/api/process", async (req, res) => {
  try {
    const tool = req.body.tool;
    console.log("🔥 TOOL:", tool);

    if (!req.files || !req.files.file) {
      return res.status(400).send("No file uploaded");
    }

    const files = Array.isArray(req.files.file)
      ? req.files.file
      : [req.files.file];

    const instance = new ILovePDFApi(publicKey, secretKey);
    const task = instance.newTask(tool);

    await task.start();

    const tempFiles = [];

    for (let f of files) {
      const filePath = "./temp_" + Date.now() + "_" + f.name;
      await f.mv(filePath);
      await task.addFile(filePath);
      tempFiles.push(filePath);
    }

    // ✅ options لكل الأدوات
    let options = {};

    switch (tool) {
      case "watermark":
        options = { text: "PDFORGE ULTRA" };
        break;

      case "rotate":
        options = { rotation: 90 };
        break;

      case "protect":
        options = { password: "1234" };
        break;

      case "split":
        options = { split_mode: "range", ranges: "1-2" };
        break;

      case "ocr":
        options = { lang: "eng" };
        break;

      default:
        options = {};
    }

    await task.process(options);

    // ✅ تنظيف output قبل الاستخدام
    const outputDir = "./output";
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    fs.readdirSync(outputDir).forEach(f => {
      fs.unlinkSync(outputDir + "/" + f);
    });

    await task.download(outputDir);

    const filesOut = fs.readdirSync(outputDir);
    const outputFile = filesOut[filesOut.length - 1];

    res.download(outputDir + "/" + outputFile, () => {
      // تنظيف
      tempFiles.forEach(f => fs.unlinkSync(f));
      fs.unlinkSync(outputDir + "/" + outputFile);
    });

  } catch (err) {
    console.log("🔥 FULL ERROR:", err.response?.data || err.message);
    res.status(500).send(
  err.response?.data
    ? JSON.stringify(err.response.data)
    : err.message
);
  }
});

app.listen(PORT, () => {
  console.log("🔥 SERVER RUNNING ON " + PORT);
});
