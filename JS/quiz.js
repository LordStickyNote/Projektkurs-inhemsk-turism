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

let allEstablishments = [];

const quizQuestions = [
  {
    id: "intro",
    title: "Hitta din perfekta destination!",
    multiple: true,
    options: [],
  },
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
      { label: "Nej", value: null },
    ],
  },
  {
    id: "preferences",
    title: "Vad är viktigt för dig?",
    multiple: true,
    options: [
      { label: "Gömda pärlor & lokala favoriter", value: "localGem" },
      { label: "Populära och välkända platser", value: "highRating" },
      { label: "Budgetvänliga upplevelser", value: "budget" },
      { label: "Vara nära vatten", value: "nearWater" },
      { label: "Familjevänliga alternativ", value: "familyFriendly" },
    ],
  },
];

function renderQuestion() {
  const question = quizQuestions[currentQuestionIndex];
  const container = document.getElementById("quiz-container");

  document.getElementById("questionTitle").textContent = question.title;

  container.innerHTML = "";

  for (const option of question.options) {
    const label = document.createElement("label");
    label.className = "card-answer card row-between row";

    const input = document.createElement("input");
    input.type = question.multiple ? "checkbox" : "radio";
    input.name = question.id;
    input.value = option.value;

    if (question.multiple) {
      document.querySelector("#questionAnswerSupport").textContent =
        "Flera val kan väljas på denna fråga";
      input.checked = quizState[question.id].includes(option.value);
    } else {
      document.querySelector("#questionAnswerSupport").textContent =
        "Endast ett val kan väljas på denna fråga";

      input.checked = quizState[question.id] === option.value;
    }

    input.addEventListener("change", () => {
      saveAnswer(question, option.value);
    });

    label.innerHTML = `<h3>${option.label}</h3>`;
    label.appendChild(input);

    container.appendChild(label);
  }

  if (question.id == "intro") {
    container.innerHTML = `<p>Svara på några korta frågor så hjälper vi dig att hitta resor och upplevelser som passar dina preferenser bäst!</p>`;
    document.querySelector("#questionAnswerSupport").textContent = "";
  }

  document.querySelector("#progress-counter").textContent =
    `${currentQuestionIndex + 1}/${quizQuestions.length}`;

  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
  document.querySelector(".progress-bar").style.width = `${progress}%`;

  if (currentQuestionIndex === 0) {
    prevBtn.disabled = true;
    prevBtn.innerHTML = `Tillbaka`;
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

nextBtn.addEventListener("click", () => {
  const currentQuestion = quizQuestions[currentQuestionIndex];

  if (currentQuestion.id === "interest" && quizState.interest.length === 0) {
    alert("Välj minst ett intresse");
    return;
  }

  if (currentQuestionIndex < quizQuestions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();

    if (currentQuestionIndex === 4) {
      nextBtn.innerHTML = "Visa resultat";
    } else {
      nextBtn.innerHTML = "Nästa";
    }
  } else {
    nextBtn.disabled = true;

    nextBtn.innerHTML = `
    <span class="row gap-2">
      <span class="spinner"></span>
    </span>
    `;

    showResults();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();

      nextBtn.innerHTML = "Nästa";
    }
  }
);

function mapQuizToFilters() {
  const activityThemes = [];

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
  const filters = mapQuizToFilters();

  const activities = await getQuizActivities(filters);
  const attractions = await getQuizAttractions(filters);

  let allResults = [...activities, ...attractions];

  allResults = await useEstablishmentForQuizCards(allResults);

  const topResults = getTopResults(allResults, filters, 12);

  sessionStorage.setItem("quizResults", JSON.stringify(topResults));

  sessionStorage.setItem("quizState", JSON.stringify(quizState));

  window.location.href = "/explore.html";
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
      score += 8;
    }
  }

  if (quizState.interest.includes("history")) {
    if (
      text.includes("historia") ||
      text.includes("slott") ||
      text.includes("kyrka") ||
      text.includes("museum")
    ) {
      score += 8;
    }
  }

  if (quizState.interest.includes("nature")) {
    if (
      text.includes("natur") ||
      text.includes("park") ||
      text.includes("vandring") ||
      text.includes("skog")
    ) {
      score += 8;
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
      score += 8;
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
      score += 8;
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
      score += 8;
    }
  }

  if (quizState.effort && item.physical_efforts === quizState.effort) {
    score += 4;
  }

  if (filters.preferences?.highRating && Number(item.rating) >= 4) {
    score += 5;
  }

  if (filters.preferences?.localGem) {
    score += 3;
  }

  if (filters.preferences?.nearWater) {
    if (
      text.includes("vatten") ||
      text.includes("bad") ||
      text.includes("sjö") ||
      text.includes("strand") ||
      text.includes("hav")
    ) {
      score += 4;
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
      score += 4;
    }
  }

if (
  filters.preferences?.budget &&
  item.price_range
) {

  const minPrice =
    Number(item.price_range.split("-")[0]);

  if (minPrice <= 25) {
    score += 5;
  }

  else if (minPrice <= 100) {
    score += 4;
  }

  else if (minPrice <= 250) {
    score += 3;
  }

  else if (minPrice <= 500) {
    score += 1;
  }
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
