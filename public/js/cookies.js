document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("cookie-banner");
  const acceptBtn = document.getElementById("accept-cookies");
  const rejectBtn = document.getElementById("reject-cookies");

  if (!localStorage.getItem("cookiesPreference")) {
    banner.style.display = "block";
  }

  acceptBtn.addEventListener("click", () => {
    localStorage.setItem("cookiesPreference", "accepted");
    closeBanner();
  });

  rejectBtn.addEventListener("click", () => {
    localStorage.setItem("cookiesPreference", "rejected");
    closeBanner();
  });

  function closeBanner() {
    banner.style.opacity = "0";
    setTimeout(() => {
      banner.style.display = "none";
    }, 500);
  }
});
