const quizState = {
    interest: "",
    effort: "",
    childFriendly: false,
    preferences: "",
    foodTypes: ""
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