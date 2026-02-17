const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");
const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());

// 🔐 Inicializar Firebase (usa variable de entorno en Railway)
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  ),
  storageBucket: "barber-5ec94.appspot.com"
});

const bucket = admin.storage().bucket();

const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 }
});

app.post("/optimize", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    let quality = 80;
    let optimizedImage;

    const resized = sharp(req.file.buffer)
      .resize({ width: 1080, withoutEnlargement: true });

    do {
      optimizedImage = await resized
        .clone()
        .webp({ quality })
        .toBuffer();

      quality -= 5;

    } while (optimizedImage.length > 150 * 1024 && quality > 30);

    // 🔥 Subir a Firebase
    const fileName = `media/${uuidv4()}.webp`;
    const file = bucket.file(fileName);
    const token = uuidv4();

    await file.save(optimizedImage, {
      metadata: {
        contentType: "image/webp",
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media&token=${token}`;

    res.json({
      success: true,
      url: publicUrl,
      size: optimizedImage.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Optimization failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Image optimizer running on port ${PORT}`);
});