const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");

const app = express();
app.use(cors());

// Configuración profesional de multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB máximo
  }
});

// Endpoint principal
app.post("/optimize", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Optimización agresiva pero manteniendo buena calidad
    const optimizedImage = await sharp(req.file.buffer)
      .resize({
        width: 800,
        withoutEnlargement: true
      })
      .webp({
        quality: 70,        // Baja un poco para reducir peso
        effort: 6           // Máxima compresión
      })
      .toBuffer();

    res.set("Content-Type", "image/webp");
    res.send(optimizedImage);

  } catch (error) {
    console.error("Optimization error:", error);
    res.status(500).json({ error: "Optimization failed" });
  }
});

// Manejo específico de error de tamaño
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "File too large. Max size is 20MB"
    });
  }
  next(err);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Image optimizer running on port ${PORT}`);
});
