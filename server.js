const express = require("express");
const sharp = require("sharp");
const cors = require("cors");

const app = express();
app.use(cors());

// Recibir imagen como raw binary
app.use(express.raw({ type: "*/*", limit: "15mb" }));

app.post("/optimize", async (req, res) => {
  try {

    if (!req.body || req.body.length === 0) {
      return res.status(400).json({ error: "No image received" });
    }

    let quality = 80;
    let optimizedImage;

    const resized = sharp(req.body)
      .resize({ width: 1080, withoutEnlargement: true });

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