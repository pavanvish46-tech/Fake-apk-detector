document.getElementById("apkForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const fileInput = document.getElementById("apkFile");
  const resultDiv = document.getElementById("result");

  if (!fileInput.files[0]) {
    resultDiv.innerHTML = "⚠️ Please upload an APK file!";
    resultDiv.style.color = "yellow";
    return;
  }

  // Dummy logic (baad me backend se connect karenge)
  const fileName = fileInput.files[0].name;
  if (fileName.toLowerCase().includes("mod") || fileName.toLowerCase().includes("hack")) {
    resultDiv.innerHTML = "❌ Fake/Unsafe APK Detected!";
    resultDiv.style.color = "red";
  } else {
    resultDiv.innerHTML = "✅ Safe APK Detected!";
    resultDiv.style.color = "lightgreen";
  }
});
