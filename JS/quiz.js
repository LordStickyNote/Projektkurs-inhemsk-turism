let currentQuestionIndex = 0;

const quizState = {
    interest: [],
    effort: "",
    childFriendly: false,
    preferences: [],
    foodTypes: []
}

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
            { label: "Mat", value: "food" }
        ]
    },
    {
        id: "effort",
        title: "Vilken aktivitetsnivå passar dig?",
        multiple: false,
        options: [
            { label: "Lugnt", value: "LOW" },
            { label: "Medel", value: "MEDIUM" },
            { label: "Aktivt", value: "HIGH" }
        ]
    },
    {
        id: "childFriendly",
        title: "Reser du med barn?",
        multiple: false,
        options: [
            { label: "Ja", value: true },
            { label: "Nej", value: false }
        ]
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
            { label: "Familjevänligt", value: "familyFriendly" }
        ]
    },
    {
        id: "foodTypes",
        title: "Vilken typ av mat gillar du?",
        multiple: true,
        options: [
            { label: "Asiatiskt", value: "asian" },
            { label: "Pizza", value: "pizza" },
            { label: "Hamburgare", value: "hamburgare" },
            { label: "Husman", value: "husman" },
            { label: "Vegetariskt", value: "vegetarian" },
            { label: "Café & fika", value: "cafe" }
        ]
    }
]

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
}

function saveAnswer(question, value) {
    if (question.multiple) {
       if (quizState[question.id].includes(value)) {
        quizState[question.id] = quizState[question.id].filter(item => item !== value);
       } else {
        quizState[question.id].push(value);
       }
    } else {
        quizState[question.id] = value;
    }

    console.log(quizState)
}

document.getElementById("nextBtn").addEventListener("click", () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        
    }
})

document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
})

function mapQuizToFilters() {
    return {}
}

renderQuestion();

