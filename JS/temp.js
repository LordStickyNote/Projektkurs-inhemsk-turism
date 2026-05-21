const filterMenu = document.getElementById("filter-menu-containerSeeAndDo");
const openFilterBtn = document.getElementById("btn-float-SeeAndDo");
const closeFilterBtn = document.getElementById("filterBtn");

openFilterBtn.addEventListener("click", () => {
  filterMenu.style.display = "flex";
  openFilterBtn.style.display = "none";
});

closeFilterBtn.addEventListener("click", () => {
  filterMenu.style.display = "none";
  openFilterBtn.style.display = "flex";
});
