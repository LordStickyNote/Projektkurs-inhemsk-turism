let SeeAndDoFiltersMenu = document.getElementById("filter-menu-containerSeeAndDo");
let SeeAndDoFiltersMenuFilterBtn = document.getElementById("filterBtn");

let btnFloatSeeAndDo = document.getElementById("btn-float-SeeAndDo");

btnFloatSeeAndDo.addEventListener("click", () => (showPopup(SeeAndDoFiltersMenu)))

SeeAndDoFiltersMenuFilterBtn.addEventListener("click", () => (closePopup(SeeAndDoFiltersMenu)))


function closePopup(popup){
    popup.style.display="none";
}
function showPopup(popup){
    popup.style.display="flex";
}