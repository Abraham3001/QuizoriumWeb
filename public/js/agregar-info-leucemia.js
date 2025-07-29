document.getElementById("form-leucemia").addEventListener("submit", async function (e) {
      e.preventDefault();
      const form = new FormData(this);

      const data = {
        tipo: form.get("tipo"),
        subtipo: form.get("subtipo"),
        descripcion: form.get("descripcion"),
        imagen: form.get("imagen")
      };

      const res = await fetch("/leucemia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.text();
      document.getElementById("mensaje").textContent = result;
      this.reset();
    });