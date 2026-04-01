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

    if (!req.files || !req.files.file) {
      return res.status(400).send("No file uploaded");
    }

    const files = Array.isArray(req.files.file)
      ? req.files.file
      : [req.files.file];

    const instance = new ILovePDFApi(publicKey, secretKey);
    const task = instance.newTask(tool);

    await task.start();

    const uploaded = [];

    for (let f of files) {
      const pathFile = "./temp_" + Date.now() + "_" + f.name;
      await f.mv(pathFile);
      await task.addFile(pathFile);
      uploaded.push(pathFile);
    }

    // إعدادات خاصة
    let options = {};

    if (tool === "watermark") options = { text: "PDFORGE ULTRA" };
    if (tool === "rotate") options = { rotation: 90 };
    if (tool === "protect") options = { password: "1234" };

    await task.process(options);

    const outDir = "./out_" + Date.now();
    fs.mkdirSync(outDir);

    await task.download(outDir);

    const fileOut = fs.readdirSync(outDir)[0];

    res.download(outDir + "/" + fileOut, () => {
      uploaded.forEach(f => fs.unlinkSync(f));
      fs.unlinkSync(outDir + "/" + fileOut);
      fs.rmdirSync(outDir);
    });

  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).send("❌ حصل خطأ");
  }
});

app.listen(PORT, () => console.log("🔥 Running on " + PORT));
