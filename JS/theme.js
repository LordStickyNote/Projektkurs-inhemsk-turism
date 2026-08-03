// Skapar en knapp för att byta tema.
const themeButton = document.createElement("button");

themeButton.classList.add("theme-button");
themeButton.textContent = "Mörkt läge";

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
});