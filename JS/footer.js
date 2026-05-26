function createFooter() {
  const footer = document.createElement("footer");
  footer.className = "site-footer";

  footer.innerHTML = `
    <div class="site-footer-content">
      <div class="site-footer-brand">
        <img class="site-footer-logo" src="/img/logotyp.svg" alt="SydostGuiden" />
<p>Ditt favoritställe för äventyr i Småland och Öland. Upptäck lokala pärlor, god mat, vackra boenden och nya platser att längta tillbaka till.</p>      </div>

      <nav class="site-footer-section">
        <h3>Navigation</h3>
        <a href="/index.html">Home</a>
        <a href="/explore.html">Mat</a>
        <a href="/explore.html">Boenden</a>
        <a href="/explore.html">Interaktiv karta</a>
      </nav>

      <div class="site-footer-section">
        <h3>Kontakta oss</h3>
        <a href="mailto:kontakt@sydostguiden.se">kontakt@sydostguiden.se</a>
        <a href="tel:+46701234567">070-123 45 67</a>
      </div>
    </div>

    <div class="site-footer-bottom">
      <p>2026 SydostGuiden. All rights reserved.</p>
    </div>
  `;

  document.body.appendChild(footer);
}

document.addEventListener("DOMContentLoaded", createFooter);
