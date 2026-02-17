const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");

const app = express();
app.use(cors());

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.post("/optimize", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    const optimizedImage = await sharp(req.file.buffer)
      .resize({ width: 800 })
      .webp({ quality: 75 })
      .toBuffer();

    res.set("Content-Type", "image/webp");
    res.send(optimizedImage);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Optimization failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Image optimizer running on port ${PORT}`);
});
