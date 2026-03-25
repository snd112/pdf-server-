const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const ILovePDFApi = require("ilovepdf-nodejs");

const app = express();

app.use(fileUpload());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// API KEYS (حطهم في Railway Variables)
const publicKey = process.env.ILOVEPDF_PUBLIC_KEY;
const secretKey = process.env.ILOVEPDF_SECRET_KEY;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.post("/api/process", async (req, res) => {
  try {
    const tool = req.body.tool;

    if (!req.files) return res.status(400).send("No file");

    const file = req.files.files;
    const filePath = "./temp_" + Date.now() + "_" + file.name;

    await file.mv(filePath);

    const instance = new ILovePDFApi(ILOVEPDF_PUBLIC_KEY, ILOVEPDF_SECRET_KEY);
    const task = instance.newTask(tool);

    await task.start();
    await task.addFile(filePath);
    await task.process();
    await task.download("./output");

    const outputFile = fs.readdirSync("./output")[0];

    res.download("./output/" + outputFile);

    // تنظيف
    fs.unlinkSync(filePath);
    fs.unlinkSync("./output/" + outputFile);

  } catch (err) {
    console.log(err);
    res.status(500).send("❌ حصل خطأ");
  }
});

app.listen(PORT, () => {
  console.log("🔥 Server running on port " + PORT);
});
