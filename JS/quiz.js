import { getData } from "./api.js";
import { 
    buildActivityApiFilters,
    buildAttractionApiFilters,
    activityTypeMap,
    attractionTypeMap,
 } from "./filters.js"

const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

let currentQuestionIndex = 0;

const quizState = {
  interest: [],
  effort: "",
  childFriendly: false,
  preferences: [],
};

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
    ],
  },
  {
    id: "childFriendly",
    title: "Reser du med barn?",
    multiple: false,
    options: [
      { label: "Ja", value: true },
      { label: "Nej", value: false },
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
  }
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

  console.log(quizState);
}

nextBtn.addEventListener("click", () => {
  if (currentQuestionIndex < quizQuestions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  } else {
    showResults();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
});

function mapQuizToFilters() {
    const activityThemes = [];

    if (quizState.interest.includes("animals")) {
        activityThemes.push("animals");
    }

    if (quizState.interest.includes("adventure")) {
        activityThemes.push("adventure");
    }

    if (quizState.interest.includes("water")) {
        activityThemes.push("swim")
    }

  return {
    activity: {
        effort: quizState.effort,
        childFriendly: quizState.childFriendly || quizState.preferences.includes("familyFriendly"),
        involvesAnimals: quizState.interest.includes("animals"),
        involvesWater: quizState.interest.includes("water") || quizState.preferences.includes("nearWater"),
        activityThemes
    },

    attraction: {
        childFriendly: quizState.childFriendly || quizState.preferences.includes("familyFriendly"),
        localSignificance: quizState.preferences.includes("localGem"),
        types: quizState.interest.filter(value => ["nature", "history", "art"].includes(value))
    },

    preferences: {
        highRating: quizState.preferences.includes("highRating"),
        budget: quizState.preferences.includes("budget"),
        localGem: quizState.preferences.includes("localGem"),
        nearWater: quizState.preferences.includes("nearWater")
    }
  };
}

 async function getQuizActivities(filters) {
    const apiFilters = buildActivityApiFilters(filters.activity);

    if (filters.activity.activityThemes.length === 0) {
        return await getData("activity", apiFilters);
    }

    const requests = [];

    for (const theme of filters.activity.acitvityThemes) {
        const descriptions = activityTypeMap[theme];

        for (const description of descriptions) {
            requests.push(
                getData("activity", {
                    ...apiFilters,
                    descriptions: description
                })
            );
        }
    }

    const results = await Promise.all(requests);
    return results.flat();
 }

 async function getQuizAttractions(filters) {
    const apiFilters = buildAttractionApiFilters(filters.attraction);

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
                    categories: category
                })
            );
        }
    }

    const results = await Promise.all(requests);
    return results.flat();
 }

async function showResults() {
    const filters = mapQuizToFilters();

    console.log("Quiz klart:", quizState)
    console.log("Filter:", filters)

    document.querySelector("h1").textContent = "Dina rekommendationer";
    document.getElementById("quiz-container").innerHTML = `<p>Laddar...</p>`;

    const activities = await getQuizActivities(filters);
    const attractions = await getQuizAttractions(filters);

    console.log("Aktiviteter:", activities)
    console.log("Sevärdheter:", attractions)

    document.getElementById("quiz-container").innerHTML = `
    <p>Hittade ${activities.length} aktiviteter</p>
    <p>Hittade ${attractions.length} sevärdheter</p>
    `
}

renderQuestion();