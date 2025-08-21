document.getElementById("checkBtn").addEventListener("click", async () => {
  const res = await fetch("/api/check");
  const data = await res.json();
  document.getElementById("result").innerText = data.message;
});
