// dropdown toggle handled via CSS hover; add fallbacks for touch
document.addEventListener("click", (e) => {
  const profile = document.querySelector(".nav-profile");
  if (!profile) return;
  if (profile.contains(e.target)) {
    profile.querySelector(".dropdown").style.display = "block";
  } else {
    profile.querySelector(".dropdown").style.display = "none";
  }
});

// counters
document.querySelectorAll(".counter").forEach((el) => {
  const target = parseInt(el.dataset.target || "0", 10);
  let current = 0;
  const step = Math.max(1, Math.floor(target / 40));
  const tick = () => {
    current += step;
    if (current >= target) {
      el.textContent = target;
    } else {
      el.textContent = current;
      requestAnimationFrame(tick);
    }
  };
  requestAnimationFrame(tick);
});

// favorite toggle (mock)
document.querySelectorAll(".favorite-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("text-rose-600");
    btn.classList.toggle("text-rose-500");
  });
});

// countdown placeholders
document.querySelectorAll("[data-countdown]").forEach((el) => {
  const end = new Date(el.dataset.countdown);
  const tick = () => {
    const diff = end - new Date();
    if (diff <= 0) {
      el.textContent = "Mulai sekarang";
      return;
    }
    const hrs = Math.floor(diff / 1000 / 3600);
    const mins = Math.floor((diff / 1000 / 60) % 60);
    el.textContent = `${hrs}j ${mins}m`;
    requestAnimationFrame(tick);
  };
  tick();
});

// mobile drawer toggle (simple)
const burger = document.querySelector("#burger");
const drawer = document.querySelector("#drawer");
if (burger && drawer) {
  burger.addEventListener("click", () => {
    drawer.classList.toggle("hidden");
  });
}

// simple toast
export function showToast(message, type = "success") {
  let toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
