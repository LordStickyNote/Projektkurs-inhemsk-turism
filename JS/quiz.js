import { renderMap } from "./map.js";
import { getData } from "./api.js";
import {
  buildActivityApiFilters,
  buildAttractionApiFilters,
  activityTypeMap,
  attractionTypeMap,
} from "./filters.js";

const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

let currentQuestionIndex = 0;

const quizState = {
  interest: [],
  effort: "",
  childFriendly: false,
  preferences: [],
};

let quizResults = [];
let quizView = "list";

let allEstablishments = [];

const quizQuestions = [
  {
    id: "interest",
    title: "Vad vill du främst uppleva?",
    multiple: true,
    options: [
      { label: "Natur", value: "nature" },
      { label: "Historia", value: "history" },
      { label: "Konst & kultur", value: "art" },
      { label: "Bad & vatten", value: "water" },
      { label: "Djur & familjeaktiviteter", value: "animals" },
      { label: "Äventyr", value: "adventure" },
    ],
  },
  {
    id: "effort",
    title: "Vilken aktivitetsnivå passar dig?",
    multiple: false,
    options: [
      { label: "Lugnt", value: "LOW" },
      { label: "Medel", value: "MEDIUM" },
      { label: "Aktivt", value: "HIGH" },
      { label: "Ingen preferens", value: null },
    ],
  },
  {
    id: "childFriendly",
    title: "Är barnvänliga aktiviteter viktiga för dig?",
    multiple: false,
    options: [
      { label: "Ja", value: true },
      { label: "Spelar ingen roll", value: null },
    ],
  },
  {
    id: "preferences",
    title: "Vad är viktigast för dig?",
    multiple: true,
    options: [
      { label: "Lokala pärlor", value: "localGem" },
      { label: "Högt betyg", value: "highRating" },
      { label: "Budgetvänligt", value: "budget" },
      { label: "Nära vatten", value: "nearWater" },
      { label: "Familjevänligt", value: "familyFriendly" },
    ],
  },
];

function renderQuestion() {
  const question = quizQuestions[currentQuestionIndex];
  const container = document.getElementById("quiz-container");

  document.querySelector("h1").textContent = question.title;

  container.innerHTML = "";

  for (const option of question.options) {
    const label = document.createElement("label");
    label.className = "card-answer card row-between row";

    const input = document.createElement("input");
    input.type = question.multiple ? "checkbox" : "radio";
    input.name = question.id;
    input.value = option.value;

    if (question.multiple) {
      input.checked = quizState[question.id].includes(option.value);
    } else {
      input.checked = quizState[question.id] === option.value;
    }

    input.addEventListener("change", () => {
      saveAnswer(question, option.value);
    });

    label.innerHTML = `<h3>${option.label}</h3>`;
    label.appendChild(input);

    container.appendChild(label);
  }

  document.querySelector("h5").textContent =
    `${currentQuestionIndex + 1}/${quizQuestions.length}`;

  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
  document.querySelector(".progress-bar").style.width = `${progress}%`;

  if (currentQuestionIndex === 0) {
    prevBtn.disabled = true;
  } else if (currentQuestionIndex > 0) {
    prevBtn.disabled = false;
  }
}

function saveAnswer(question, value) {
  if (question.multiple) {
    if (quizState[question.id].includes(value)) {
      quizState[question.id] = quizState[question.id].filter(
        (item) => item !== value,
      );
    } else {
      quizState[question.id].push(value);
    }
  } else {
    quizState[question.id] = value;
  }
}

function nextBtnTextChange() {
  if (currentQuestionIndex === 3) {
    nextBtn.innerHTML = "Visa resultat";
  } else {
    nextBtn.innerHTML = "Nästa";
  }
}

nextBtn.addEventListener("click", () => {
  const currentQuestion = quizQuestions[currentQuestionIndex];

  if (currentQuestion.id === "interest" && quizState.interest.length === 0) {
    alert("Välj minst ett intresse");
    return;
  }

  if (currentQuestionIndex < quizQuestions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  } else {
    showResults();
  }

  if (quizQuestions.length == 0) {
    nextBtn.disabled = true;
  }
});

prevBtn.addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
});

nextBtn.addEventListener("click", nextBtnTextChange);
prevBtn.addEventListener("click", nextBtnTextChange);

function mapQuizToFilters() {
  const activityThemes = [];

  if (quizState.interest.includes("animals")) {
    activityThemes.push("animals");
  }

  if (quizState.interest.includes("adventure")) {
    activityThemes.push("adventure");
  }

  if (quizState.interest.includes("water")) {
    activityThemes.push("swim");
  }

  return {
    activity: {
      effort: quizState.effort,
      childFriendly:
        quizState.childFriendly ||
        quizState.preferences.includes("familyFriendly"),
      involvesAnimals: quizState.interest.includes("animals"),
      involvesWater:
        quizState.interest.includes("water") ||
        quizState.preferences.includes("nearWater"),
      activityThemes,
    },

    attraction: {
      childFriendly:
        quizState.childFriendly ||
        quizState.preferences.includes("familyFriendly"),
      localSignificance: quizState.preferences.includes("localGem"),
      types: quizState.interest.filter((value) =>
        ["nature", "history", "art"].includes(value),
      ),
    },

    preferences: {
      highRating: quizState.preferences.includes("highRating"),
      budget: quizState.preferences.includes("budget"),
      localGem: quizState.preferences.includes("localGem"),
      nearWater: quizState.preferences.includes("nearWater"),
      familyFriendly: quizState.preferences.includes("familyFriendly"),
    },
  };
}

async function getQuizActivities(filters) {
  const apiFilters = buildActivityApiFilters({
    ...filters.activity,
    effort: "",
    childFriendly: null,
  });

  if (filters.activity.activityThemes.length === 0) {
    return await getData("activity", apiFilters);
  }

  const requests = [];

  for (const theme of filters.activity.activityThemes) {
    const descriptions = activityTypeMap[theme];

    for (const description of descriptions) {
      requests.push(
        getData("activity", {
          ...apiFilters,
          descriptions: description,
        }),
      );
    }
  }

  const results = await Promise.all(requests);
  return results.flat();
}

async function getQuizAttractions(filters) {
  const apiFilters = buildAttractionApiFilters({
    ...filters.attraction,
    childFriendly: null,
  });

  if (filters.attraction.types.length === 0) {
    return await getData("attraction", apiFilters);
  }

  const requests = [];

  for (const type of filters.attraction.types) {
    const categories = attractionTypeMap[type];

    for (const category of categories) {
      requests.push(
        getData("attraction", {
          ...apiFilters,
          categories: category,
        }),
      );
    }
  }

  const results = await Promise.all(requests);
  return results.flat();
}

async function showResults() {
  document.getElementById("quiz-wrapper").style.display = "none";
  document.getElementById("results").hidden = false;

  const filters = mapQuizToFilters();

  if (quizView === "list") {
    document.getElementById("results").innerHTML = `
  <section class="grid gap-6">
  <div class="card card-listing">
        <div class="sl-img"></div>
        <span class="card-listing-content width-full">
          <div class="sl-text sl-text-lg"></div>
          <div class="sl-text sl-text-md"></div>
          
          <span class="gap-2">
            <span class="badge sl-badge"></span>
          </span>
        </span>
      </div><div class="card card-listing">
        <div class="sl-img"></div>
        <span class="card-listing-content width-full">
          <div class="sl-text sl-text-lg"></div>
          <div class="sl-text sl-text-md"></div>
          
          <span class="gap-2">
            <span class="badge sl-badge"></span>
          </span>
        </span>
      </div><div class="card card-listing">
        <div class="sl-img"></div>
        <span class="card-listing-content width-full">
          <div class="sl-text sl-text-lg"></div>
          <div class="sl-text sl-text-md"></div>
          
          <span class="gap-2">
            <span class="badge sl-badge"></span>
          </span>
        </span>
      </div><div class="card card-listing">
        <div class="sl-img"></div>
        <span class="card-listing-content width-full">
          <div class="sl-text sl-text-lg"></div>
          <div class="sl-text sl-text-md"></div>
          
          <span class="gap-2">
            <span class="badge sl-badge"></span>
          </span>
        </span>
      </div>
      <div class="card card-listing">
        <div class="sl-img"></div>
        <span class="card-listing-content width-full">
          <div class="sl-text sl-text-lg"></div>
          <div class="sl-text sl-text-md"></div>
          
          <span class="gap-2">
            <span class="badge sl-badge"></span>
          </span>
        </span>
      </div>
      <div class="card card-listing">
        <div class="sl-img"></div>
        <span class="card-listing-content width-full">
          <div class="sl-text sl-text-lg"></div>
          <div class="sl-text sl-text-md"></div>
          
          <span class="gap-2">
            <span class="badge sl-badge"></span>
          </span>
        </span>
      </div>
      </section>`;
  } else {
    document.getElementById("results").innerHTML = `
        <div class="card card-listing map-skeleton-loader">
        <div class="sl-img"></div>
      </div>`;
  }

  document.getElementById("quizBtnDiv").hidden = false;

  const activities = await getQuizActivities(filters);
  const attractions = await getQuizAttractions(filters);

  let allResults = [...activities, ...attractions];

  allResults = await useEstablishmentForQuizCards(allResults);

  const topResults = getTopResults(allResults, filters, 12);

  quizResults = topResults;
  renderQuizResults();
}

function renderQuizResults() {
  const results = document.getElementById("results");

  results.innerHTML = `
    <h1 class="display">Dina rekommendationer</h1>
    <span class="row gap-2 btn-square-container">
        <button id="quizListBtn" class="btn btn-square"></button>
        <button id="quizMapBtn" class="btn btn-square">
          <?xml version="1.0" encoding="UTF-8"?>
          <svg
            id="Gps"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1114.67 962.67"
          >
            <path
              class="cls-1"
              d="m512.52,130.06c-134.59,0-243.69,102.17-243.69,228.21s234.73,474.34,234.73,474.34c0,0,252.66-348.31,252.66-474.34s-109.1-228.21-243.69-228.21Zm0,312.74c-48.14,0-87.17-39.03-87.17-87.17s39.03-87.17,87.17-87.17,87.17,39.03,87.17,87.17-39.03,87.17-87.17,87.17Z"
            />
          </svg>
        </button>
      </span>

      <section id="quiz-results-content"></section>
    `;

  document.getElementById("quizListBtn").addEventListener("click", () => {
    quizView = "list";
    renderQuizResults();
  });

  document.getElementById("quizMapBtn").addEventListener("click", () => {
    quizView = "map";
    renderQuizResults();
  });

  document.getElementById("restartQuizBtn").addEventListener("click", () => {
    restartQuiz();
  });

  const content = document.getElementById("quiz-results-content");

  if (quizView === "map") {
    renderMap([{ items: quizResults }], content);
  } else {
    renderQuizList(content);
  }
}

function renderQuizList(container) {
  container.innerHTML = `
        <section class="grid width-full gap-6">
    ${quizResults
      .map(
        (item) => `
            <div class="card card-listing">
        <img src="/img/High_Chaparral_Theme_Park.jpg" alt="" />
        <span class="card-listing-content width-full">
          <h3>${item.name}</h3>
          <h4 class="text-faded">${item.city}</h4>
          <span class="row row-between">
              <span class="gap-2">
                <span class="badge badge-red">${item.description}</span>
              </span>
              <span class="row">
              <h4>${Math.trunc(item.rating)}</h4><svg class="star" viewBox="0 0 16 16">
              <path
                d="M7.71954 0.445459C7.86922 -0.0151958 8.52092 -0.0151964 8.6706 0.445459L9.76667 3.81881C9.8336 4.02483 10.0256 4.16431 10.2422 4.16431H13.7892C14.2735 4.16431 14.4749 4.78411 14.083 5.06881L11.2135 7.15366C11.0383 7.28098 10.9649 7.50667 11.0319 7.71268L12.1279 11.086C12.2776 11.5467 11.7504 11.9298 11.3585 11.6451L8.48896 9.5602C8.31372 9.43288 8.07642 9.43288 7.90118 9.5602L5.03163 11.6451C4.63977 11.9298 4.11253 11.5467 4.26221 11.086L5.35828 7.71268C5.42521 7.50667 5.35188 7.28098 5.17664 7.15366L2.30709 5.06881C1.91524 4.78411 2.11662 4.16431 2.60099 4.16431H6.14794C6.36455 4.16431 6.55653 4.02483 6.62347 3.81881L7.71954 0.445459Z"
              ></path></svg
            >
              </span>
          </span>
        </span>
      </div>`,
      )
      .join("")}
        </section>
    `;
}

function scoreItem(item, filters) {
  let score = 0;

  const text =
    `${item.name} ${item.description} ${item.search_tags}`.toLowerCase();

  if (quizState.interest.includes("art")) {
    if (
      text.includes("museum") ||
      text.includes("konst") ||
      text.includes("galleri") ||
      text.includes("kultur")
    ) {
      score += 12;
    }
  }

  if (quizState.interest.includes("history")) {
    if (
      text.includes("historia") ||
      text.includes("slott") ||
      text.includes("kyrka") ||
      text.includes("museum")
    ) {
      score += 12;
    }
  }

  if (quizState.interest.includes("nature")) {
    if (
      text.includes("natur") ||
      text.includes("park") ||
      text.includes("vandring") ||
      text.includes("skog")
    ) {
      score += 12;
    }
  }

  if (quizState.interest.includes("adventure")) {
    if (
      text.includes("äventyr") ||
      text.includes("zipline") ||
      text.includes("klättring") ||
      text.includes("paintball") ||
      text.includes("gokart")
    ) {
      score += 12;
    }
  }

  if (quizState.interest.includes("water")) {
    if (
      text.includes("bad") ||
      text.includes("vatten") ||
      text.includes("sjö") ||
      text.includes("strand") ||
      text.includes("simhall") ||
      text.includes("hav")
    ) {
      score += 14;
    }
  }

  if (quizState.interest.includes("animals")) {
    if (
      text.includes("djur") ||
      text.includes("älg") ||
      text.includes("zoo") ||
      text.includes("djurpark") ||
      text.includes("gård")
    ) {
      score += 12;
    }
  }

  if (quizState.effort && item.physical_efforts === quizState.effort) {
    score += 4;
  }

  if (item.rating) {
    score += Number(item.rating);
  }

  if (filters.preferences?.highRating && Number(item.rating) >= 4) {
    score += 3;
  }

  if (filters.preferences?.localGem) {
    score += 2;
  }

  if (filters.preferences?.nearWater) {
    if (
      text.includes("vatten") ||
      text.includes("bad") ||
      text.includes("sjö") ||
      text.includes("strand") ||
      text.includes("hav")
    ) {
      score += 3;
    }
  }

  if (filters.preferences?.familyFriendly || quizState.childFriendly) {
    if (
      item.child_friendly === "Y" ||
      item.child_support === "Y" ||
      text.includes("barn") ||
      text.includes("familj") ||
      text.includes("lek")
    ) {
      score += 2;
    }
  }

  if (filters.preferences?.budget && item.price_range) {
    score += 1;
  }

  return score;
}

async function getAllEstablishments() {
  if (allEstablishments.length === 0) {
    allEstablishments = await getData("establishment");
  }

  return allEstablishments;
}

async function useEstablishmentForQuizCards(items) {
  const establishments = await getAllEstablishments();

  return items.map((item) => {
    const establishment = establishments.find(
      (place) => String(place.id) === String(item.id),
    );

    return {
      ...item,
      ...establishment,
    };
  });
}

function getTopResults(items, filters, limit = 12) {
  const scoredItems = [];

  for (const item of items) {
    const score = scoreItem(item, filters);

    scoredItems.push({
      ...item,
      quizScore: score,
    });
  }

  scoredItems.sort((a, b) => {
    return b.quizScore - a.quizScore;
  });

  return scoredItems.slice(0, limit);
}

function restartQuiz() {
  currentQuestionIndex = 0;

  quizView = "list";

  quizResults = [];

  quizState.interest = [];
  quizState.effort = "";
  quizState.childFriendly = null;
  quizState.preferences = [];

  document.getElementById("results").hidden = true;
  document.getElementById("quiz-wrapper").style.display = "flex";

  nextBtn.innerHTML = "Nästa";

  renderQuestion();
}

document
  .getElementById("backBtn")
  .addEventListener("click", () => history.back());

renderQuestion();
