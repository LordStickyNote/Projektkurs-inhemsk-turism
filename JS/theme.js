const THEME_KEY = "selectedTheme";

// Använd samma valda tema på alla sidor.
let savedTheme = "light";

try {
  savedTheme = localStorage.getItem(THEME_KEY) || "light";
} catch {
  // Sidan fungerar fortfarande om lagring inte är tillgänglig.
}

document.body.classList.toggle("dark-mode", savedTheme === "dark");

// Skapar en knapp för att byta tema.
const themeButton = document.createElement("button");

themeButton.classList.add("theme-button");
themeButton.textContent = savedTheme === "dark" ? "Ljust läge" : "Mörkt läge";

document.body.appendChild(themeButton);

// Byter tema när användaren klickar på knappen.
themeButton.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");

  const darkModeIsActive =
    document.body.classList.contains("dark-mode");

  if (darkModeIsActive) {
    themeButton.textContent = "Ljust läge";
  } else {
    themeButton.textContent = "Mörkt läge";
  }

  try {
    localStorage.setItem(THEME_KEY, darkModeIsActive ? "dark" : "light");
  } catch {
    // Ignorera lagringsfel; temabytet fungerar för den aktuella sidan.
  }
});
