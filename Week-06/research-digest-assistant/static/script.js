const digestBtn = document.getElementById("digestBtn");
const askBtn = document.getElementById("askBtn");

digestBtn.addEventListener("click", async () => {
  const text = document.getElementById("paperText").value.trim();
  const fileInput = document.getElementById("paperFile");
  const loading = document.getElementById("digestLoading");
  const resultBox = document.getElementById("digestResult");

  if (!text && !fileInput.files.length) {
    alert("Paste some text or choose a file first.");
    return;
  }

  loading.classList.remove("hidden");
  resultBox.classList.add("hidden");
  digestBtn.disabled = true;

  try {
    let response;
    if (fileInput.files.length) {
      const formData = new FormData();
      formData.append("file", fileInput.files[0]);
      response = await fetch("/api/digest", { method: "POST", body: formData });
    } else {
      response = await fetch("/api/digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paper_text: text }),
      });
    }

    const data = await response.json();
    if (data.error) {
      resultBox.innerHTML = `<p style="color:#ff8080">${data.error}</p>`;
    } else {
      resultBox.innerHTML = `
        <h3>${data.title}</h3>
        <p><strong>Problem:</strong> ${data.problem_statement}</p>
        <p><strong>Method:</strong> ${data.method}</p>
        <p><strong>Key results:</strong></p>
        <ul>${data.key_results.map(r => `<li>${r}</li>`).join("")}</ul>
        <p><strong>Limitations:</strong></p>
        <ul>${data.limitations.map(l => `<li>${l}</li>`).join("")}</ul>
        <p><strong>Possible viva questions:</strong></p>
        <ul>${data.viva_questions.map(q => `<li>${q}</li>`).join("")}</ul>
      `;
    }
  } catch (err) {
    resultBox.innerHTML = `<p style="color:#ff8080">Request failed: ${err}</p>`;
  } finally {
    loading.classList.add("hidden");
    resultBox.classList.remove("hidden");
    digestBtn.disabled = false;
  }
});

askBtn.addEventListener("click", async () => {
  const question = document.getElementById("question").value.trim();
  const loading = document.getElementById("askLoading");
  const resultBox = document.getElementById("askResult");

  if (!question) {
    alert("Type a question first.");
    return;
  }

  loading.classList.remove("hidden");
  resultBox.classList.add("hidden");
  askBtn.disabled = true;

  try {
    const response = await fetch("/api/ask-library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await response.json();
    resultBox.innerHTML = `
      <p>${data.answer}</p>
      ${data.sources && data.sources.length ? `<p class="sources">Sources: ${data.sources.join(", ")}</p>` : ""}
    `;
  } catch (err) {
    resultBox.innerHTML = `<p style="color:#ff8080">Request failed: ${err}</p>`;
  } finally {
    loading.classList.add("hidden");
    resultBox.classList.remove("hidden");
    askBtn.disabled = false;
  }
});
