# Projektkurs inhemsk turism

## Om
Webbplatsen är skapad av Alfred Oskar och Saman och syftet med webbplatsen är att vara ett arkiv med olika destinationer för turister inom Småland och Öland. Sidan har även en rekomendationsfunktion som ger förslag på destinationer baserat på användarens preferenser.

## Användning
Sidan använder 2 APIer som vardera kräver en API-nyckel. Dessa läggs in som en fil med namn "config.js" som har strukturen:
```
export let API_KEY = "API nyckel";

export const PIXAYBAY_API_KEY = "API nyckel";
```

Lägg filen i mappen "JS" som finns i projektet.

Utan dessa nycklar kommer sidan ej fungera som den ska.

## Länkar

### [Projekt](https://github.com/LordStickyNote/Projektkurs-inhemsk-turism)

### [Sprint/Projektplannering](https://github.com/users/LordStickyNote/projects/4)

## Resurser/verktyg

### Språk

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)

![CSS](https://img.shields.io/badge/css-%23663399.svg?style=for-the-badge&logo=css&logoColor=white)

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

### APIer
#### [SMAPI](https://smapi.lnu.se/)
>SMAPI har använts för att hämta olika platser för resedestinationer, matställen samt matställen.

#### [Pixabay](https://pixabay.com/service/about/api/)
>Pixabay har använts för att generera bilder till varje destination på webbplatsen.

