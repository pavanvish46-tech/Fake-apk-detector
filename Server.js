const express = require("express");
const multer = require("multer");
const cors = require("cors");
const ApkReader = require("adbkit-apkreader"); // parses APK
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve frontend

// File upload storage
const upload = multer({ dest: "uploads/" });

// Risky permissions list
const riskyPermissions = [
  "android.permission.SEND_SMS",
  "android.permission.READ_SMS",
  "android.permission.CALL_PHONE",
  "android.permission.RECEIVE_BOOT_COMPLETED",
  "android.permission.WRITE_SETTINGS",
  "android.permission.READ_CONTACTS",
  "android.permission.RECORD_AUDIO",
  "android.permission.CAMERA",
  "android.permission.ACCESS_FINE_LOCATION"
];

// API endpoint
app.post("/api/analyze", upload.single("apk"), async (req, res) => {
  try {
    if (!req.file) return res.json({ error: "No APK uploaded" });

    const reader = await ApkReader.open(req.file.path);
    const manifest = await reader.readManifest();

    let dangerous = 0;
    let total = manifest.usesPermissions?.length || 0;

    if (total > 0) {
      manifest.usesPermissions.forEach(p => {
        if (riskyPermissions.includes(p.name)) dangerous++;
      });
    }

    let probability = total > 0 ? Math.min(100, (dangerous / total) * 100) : 0;

    // Cleanup temp file
    fs.unlinkSync(req.file.path);

    res.json({
      package: manifest.package,
      versionName: manifest.versionName,
      versionCode: manifest.versionCode,
      permissions: manifest.usesPermissions,
      fakeProbability: `${probability.toFixed(1)}%`
    });
  } catch (err) {
    console.error(err);
    res.json({ error: "Failed to analyze APK" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
