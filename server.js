const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");

const app = express();
app.use(cors());

const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 } // Permitimos imágenes grandes de entrada
});

app.post("/optimize", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    let quality = 80;
    let optimizedImage;

    // Redimensionamos primero
    const resized = sharp(req.file.buffer)
      .resize({ width: 1080, withoutEnlargement: true });

    // Intentamos bajar calidad hasta cumplir 150 KB
    do {
      optimizedImage = await resized
        .clone()
        .webp({ quality })
        .toBuffer();

      quality -= 5;

    } while (optimizedImage.length > 150 * 1024 && quality > 30);

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
