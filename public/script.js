function el(id){ return document.getElementById(id); }

async function checkApk() {
  const fileInput = el("apkFile");
  const resultDiv = el("result");
  resultDiv.innerHTML = "";

  if (!fileInput.files.length) {
    resultDiv.innerHTML = "<p style='color:orange;'>⚠️ Please upload an APK file!</p>";
    return;
  }

  const fd = new FormData();
  fd.append("apk", fileInput.files[0]);

  resultDiv.innerHTML = "⏳ Analyzing APK…";

  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      body: fd
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${res.status}`);
    }
    const data = await res.json();

    // Color by risk
    let color = "limegreen";
    if (data.riskScore >= 60) color = "red";
    else if (data.riskScore >= 40) color = "gold";

    const perms = (data.permissions || []).join(", ") || "—";

    resultDiv.innerHTML = `
      <div style="line-height:1.6">
        <p><strong>App:</strong> ${data.appName} (${data.package})</p>
        <p><strong>Version:</strong> ${data.version} • <strong>Size:</strong> ${data.sizeKB} KB</p>
        <p><strong>Debuggable:</strong> ${data.debuggable ? "Yes" : "No"}</p>
        <p><strong>Permissions:</strong> ${perms}</p>
        <p><strong>Risk Score:</strong> <span style="color:${color}; font-weight:700;">${data.riskScore}/100</span> — ${data.verdict}</p>
        <p><strong>Why:</strong> ${data.reasons.join("; ")}</p>
      </div>
    `;
  } catch (e) {
    resultDiv.innerHTML = `<p style="color:#ff6b6b;">❌ ${e.message}</p>`;
  }
}
