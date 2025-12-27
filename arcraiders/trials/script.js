// lista trials
const trials = [
    {
        name: "Damage Leapers",
        image: "img/damageLeapers.png",
        link: "trials/damageLeapers.html"
    },
    {
        name: "Destroy Ticks",
        image: "img/destroyTicks.png",
        link: "trials/destroyTicks.html"
    },
    {
        name: "Harvest Plants",
        image: "img/harvestPlants.png",
        link: "trials/harvestPlants.html"
    },
    {
        name: "Search First Wave Husks",
        image: "img/searchFirstWaveHusks.png",
        link: "trials/searchFirstWaveHusks.html"
    },
    {
        name: "Search Frozen Raider Containers",
        image: "img/searchFrozenRaiderContainers.png",
        link: "trials/searchFrozenRaiderContainers.html"
    }
];

// kontener
const grid = document.getElementById("trialsGrid");

// ustawienie gridu: 5 w linii
grid.style.display = "grid";
grid.style.gridTemplateColumns = "repeat(5, 1fr)";
grid.style.gap = "14px";

// render trials
trials.forEach(trial => {
    const a = document.createElement("a");
    a.href = trial.link;
    a.className = "trials";
    a.title = trial.name;

    a.innerHTML = `
        <img src="${trial.image}" alt="${trial.name}">
        <div class="meta">${trial.name}</div>
    `;

    grid.appendChild(a);
});
