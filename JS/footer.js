const footer = document.createElement("footer");

footer.className = "site-footer";
footer.innerHTML = `
  <div class="site-footer-brand">
    <img src="img/logotyp.svg" alt="SydostGuiden logotyp" />
    <p>Vi hjälper dig planera!</p>
  </div>

  <nav class="site-footer-links" aria-label="Sidfot navigation">
    <a href="index.html">Hemma</a>
    <a href="explore.html">Interaktiv karta</a>
    <a href="#top">Återvänd till toppen</a>
  </nav>

  <address class="site-footer-contact">
    <h3>Kontaktinformation</h3>
    <a class="site-footer-contact-link" href="mailto:sg223vf@student.lnu.se">
      <img src="img/mail.svg" alt="" aria-hidden="true" />
      sg223vf@student.lnu.se
    </a>
    <a class="site-footer-phone" href="tel:0765677780">
      <img src="img/telefon.svg" alt="" aria-hidden="true" />
      0765677780
    </a>
  </address>
`;

document.body.appendChild(footer);
