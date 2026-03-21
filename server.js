const express = require("express");
const app = express();

app.use(express.json());

// route تجريبي
app.get("/", (req, res) => {
  res.send("🔥 PDF Server شغال");
});

// مثال API
app.post("/api/pdf", (req, res) => {
  try {
    const data = req.body;
    res.json({
      success: true,
      message: "تم استلام البيانات",
      data: data
    });
  } catch (e) {
    res.json({
      success: false,
      message: e.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
