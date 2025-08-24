document.getElementById("uploadBtn").addEventListener("click", async () => {
  const userId = document.getElementById("userId").value.trim();
  const fileInput = document.getElementById("apkFile");
  const resultDiv = document.getElementById("result");

  if (!userId) {
    alert("⚠️ Please enter a User ID");
    return;
  }

  if (fileInput.files.length === 0) {
    alert("⚠️ Please select an APK file");
    return;
  }

  const formData = new FormData();
  formData.append("apkFile", fileInput.files[0]);

  try {
    const response = await fetch(`http://localhost:5000/upload/${userId}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      // ❌ Already used check
      alert(data.message || "Something went wrong");
      return;
    }

    // ✅ Show result
    document.getElementById("package").textContent = data.package || "N/A";
    document.getElementById("version").textContent = data.version || "N/A";
    document.getElementById("label").textContent = data.label || "N/A";
    document.getElementById("confidence").textContent = data.confidence + "%";
    document.getElementById("reasons").textContent = data.reasons.join(", ") || "None";
    document.getElementById("status").textContent = data.message;

    resultDiv.classList.remove("hidden");
  } catch (error) {
    console.error("Error uploading APK:", error);
    alert("❌ Failed to upload APK");
  }
});
