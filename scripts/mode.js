const toggleBtn = document.getElementById("theme-toggle");
const themeIcon = toggleBtn.querySelector("span");
const htmlElement = document.documentElement;

// Function to apply theme and update icon
const applyTheme = (theme) => {
  htmlElement.setAttribute("data-theme", theme);
  themeIcon.textContent = theme === "dark" ? "🌑" : "☀️";
  localStorage.setItem("theme", theme);
};

// 1. Determine initial theme
const savedTheme = localStorage.getItem("theme");
const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

// Default logic: Priority to Saved > System
const initialTheme = savedTheme || (systemIsDark ? "dark" : "light");
applyTheme(initialTheme);

// 2. Handle Click Toggle
toggleBtn.addEventListener("click", () => {
  const currentTheme = htmlElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(newTheme);
});

// 3. (Optional) Listen for System changes while the page is open
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });
