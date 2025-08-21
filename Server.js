const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const APK = require("apk-parser3");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve frontend from /public
app.use(express.static(path.join(__dirname, "public")));

// Multer: save uploads to /tmp on the server
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "/tmp"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB cap
  fileFilter: (req, file, cb) => {
    if (file.originalname.toLowerCase().endsWith(".apk")) cb(null, true);
    else cb(new Error("Only .apk files are allowed"));
  }
});

// Risk feature weights (simple “ML-style” logistic scoring)
const RISKY_PERMS = new Set([
  "SEND_SMS","READ_SMS","RECEIVE_SMS",
  "READ_CONTACTS","WRITE_CONTACTS",
  "READ_CALL_LOG","WRITE_CALL_LOG",
  "RECORD_AUDIO","CAMERA",
  "READ_PHONE_STATE","CALL_PHONE",
  "WRITE_SETTINGS","SYSTEM_ALERT_WINDOW",
  "REQUEST_INSTALL_PACKAGES","BIND_ACCESSIBILITY_SERVICE",
  "QUERY_ALL_PACKAGES",
  "ACCESS_FINE_LOCATION","ACCESS_COARSE_LOCATION"
]);

function sigmoid(x){ return 1/(1+Math.exp(-x)); }

function scoreRisk(features) {
  // weights (tuned heuristically)
  const w = {
    bias: -1.2,
    riskyPerms: 0.55,
    smallSize: 0.9,          // very small apks are suspicious
    filenameFlag: 1.0,       // "mod"/"hack"/"bank" etc.
    debuggable: 0.6
  };

  const z =
    w.bias +
    w.riskyPerms * features.riskyPermCount +
    w.smallSize * (features.isVerySmall ? 1 : 0) +
    w.filenameFlag * (features.filenameFlag ? 1 : 0) +
    w.debuggable * (features.debuggable ? 1 : 0);

  return Math.round(sigmoid(z) * 100); // 0–100
}

function pickContributors(features) {
  const reasons = [];
  if (features.riskyPermCount > 0)
    reasons.push(`Uses ${features.riskyPermCount} risky permission(s)`);
  if (features.debuggable) reasons.push("App is debuggable");
  if (features.isVerySmall) reasons.push("Unusually small APK size");
  if (features.filenameFlag) reasons.push("Suspicious filename keywords");
  if (reasons.length === 0) reasons.push("No obvious red flags detected");
  return reasons;
}

// POST /api/analyze → upload field name "apk"
app.post("/api/analyze", upload.single("apk"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No APK uploaded" });

  let manifest = null;
  let parsed = {};
  try {
    const reader = await APK.readFile(file.path);
    manifest = await reader.getManifestInfo();

    // Pull useful data defensively (apk-parser3 structures can vary by apk)
    const pkg = manifest?.package ?? "unknown.package";
    const versionName = manifest?.versionName ?? "unknown";
    const appLabel = manifest?.application?.label ?? "Unknown App";
    const debuggable = Boolean(manifest?.application?.debuggable);
    const usesPermissions = (manifest?.usesPermissions || []).map(p =>
      (p?.name || p)?.split(".").pop() // get last segment AND keep raw if simple
    );

    parsed = { pkg, versionName, appLabel, debuggable, usesPermissions };
  } catch (e) {
    // Fallback if manifest parse fails
    parsed = {
      pkg: "unknown.package",
      versionName: "unknown",
      appLabel: file.originalname.replace(/\.apk$/i, ""),
      debuggable: false,
      usesPermissions: []
    };
  }

  // Build features for scoring
  const filename = file.originalname.toLowerCase();
  const filenameFlag = /(mod|hack|crack|premium|pro|bank|lite)/.test(filename);
  const sizeBytes = file.size || 0;
  const isVerySmall = sizeBytes > 0 && sizeBytes < 300 * 1024; // <300KB

  // Count risky permissions (map to last segment to match set)
  const riskyPermCount = (parsed.usesPermissions || []).reduce((acc, p) => {
    const key = String(p).toUpperCase();
    return acc + (RISKY_PERMS.has(key) ? 1 : 0);
  }, 0);

  const features = { filenameFlag, isVerySmall, riskyPermCount, debuggable: parsed.debuggable };
  const riskScore = scoreRisk(features);
  const reasons = pickContributors(features);

  // Clean up tmp file
  try { fs.unlink(file.path, () => {}); } catch {}

  return res.json({
    appName: parsed.appLabel,
    package: parsed.pkg,
    version: parsed.versionName,
    sizeKB: Math.round(sizeBytes / 1024),
    permissions: parsed.usesPermissions,
    debuggable: parsed.debuggable,
    riskScore,
    verdict: riskScore >= 60 ? "Potentially Fake" : (riskScore >= 40 ? "Review Carefully" : "Likely Safe"),
    reasons
  });
});

// Fallback home route (serves your UI)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
