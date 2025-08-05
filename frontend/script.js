const qualitySelect = document.getElementById("quality");
const formatSelect = document.getElementById("format");
const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;

// Update quality based on format
function updateQualityOptions() {
  qualitySelect.innerHTML = "";
  if (formatSelect.value === "mp3") {
    ["96", "128", "256", "320"].forEach(q => {
      const option = document.createElement("option");
      option.value = q;
      option.textContent = `${q} kbps`;
      qualitySelect.appendChild(option);
    });
  } else {
    ["480p", "720p", "1080p"].forEach(q => {
      const option = document.createElement("option");
      option.value = q;
      option.textContent = q;
      qualitySelect.appendChild(option);
    });
  }
}
formatSelect.addEventListener("change", updateQualityOptions);
updateQualityOptions();

async function download() {
  const url = document.getElementById("url").value;
  const format = formatSelect.value;
  const quality = qualitySelect.value;

  if (!url) return alert("Please enter a URL");

  try {
    const res = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, format, quality })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error || "Download failed");
    }

    const blob = await res.blob();
    const cd = res.headers.get("Content-Disposition");
    const match = cd?.match(/filename="?(.+?)"?$/);
    const filename = match?.[1] || `download.${format}`;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  } catch (err) {
    alert("Error: " + err.message);
    console.error(err);
  }
}

// Dark mode
function setTheme(mode) {
  if (mode === "dark") {
    root.classList.add("dark");
    localStorage.setItem("theme", "dark");
    themeToggle.textContent = "Light Mode";
  } else {
    root.classList.remove("dark");
    localStorage.setItem("theme", "light");
    themeToggle.textContent = "Dark Mode";
  }
}
themeToggle.addEventListener("click", () => {
  const current = localStorage.getItem("theme") || "dark";
  setTheme(current === "dark" ? "light" : "dark");
});
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("theme") || "dark";
  setTheme(saved);
});
