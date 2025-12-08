// --- SKILL TREE DATA ---
const skills = {
    //
    // CONDITIONING (LEFT TREE)
    //
    usedToTheWeight: {
        id: "usedToTheWeight",
        name: "Used To The Weight",
        description: "Wearing a shield doesn't slow you down as much.",
        color: "green",
        x: 200, y: 120, radius: 28,
        max: 5, points: 0,
        children: ["blastBorn", "gentlePressure"]
    },

    blastBorn: {
        id: "blastBorn",
        name: "Blast-Born",
        description: "Your hearing is less affected by nearby explosions.",
        color: "green",
        x: 100, y: 260, radius: 22,
        max: 5, points: 0,
        children: ["fightOrFlight"]
    },

    gentlePressure: {
        id: "gentlePressure",
        name: "Gentle Pressure",
        description: "You make less noise when breaching.",
        color: "green",
        x: 300, y: 260, radius: 22,
        max: 5, points: 0,
        children: ["proficientPryer"]
    },

    fightOrFlight: {
        id: "fightOrFlight",
        name: "Fight Or Flight",
        description: "When you're hurt in combat, regain stamina. Cooldown applies.",
        color: "green",
        x: 100, y: 400, radius: 22,
        max: 5, points: 0,
        children: ["survivorsStamina"]
    },

    proficientPryer: {
        id: "proficientPryer",
        name: "Proficient Pryer",
        description: "Breaching doors and containers takes less time.",
        color: "green",
        x: 300, y: 400, radius: 22,
        max: 5, points: 0,
        children: ["unburdenedRoll"]
    },

    survivorsStamina: {
        id: "survivorsStamina",
        name: "Survivor’s Stamina",
        description: "When critically hurt, stamina regenerates faster.",
        color: "green",
        x: 100+50, y: 540, radius: 22,
        max: 1, points: 0,
        requiredTreePoints: 15,
        children: ["downedButDetermined","aLittleExtra"]
    },

    unburdenedRoll: {
        id: "unburdenedRoll",
        name: "Unburdened Roll",
        description: "If your shield breaks, first Dodge Roll within a few seconds costs no stamina.",
        color: "green",
        x: 300-50, y: 540-20, radius: 22,
        max: 1, points: 0,
        requiredTreePoints: 15,
        children: ["effortlessSwing","aLittleExtra"]
    },

    downedButDetermined: {
        id: "downedButDetermined",
        name: "Downed But Determined",
        description: "When downed, it takes longer before collapsing.",
        color: "green",
        x: 100, y: 650, radius: 22,
        max: 5, points: 0,
        children: ["turtleCrawl"]
    },

    backOnYourFeet: {
        id: "backOnYourFeet",
        name: "Back On Your Feet",
        description: "When you're critically hurt, your health regenerates until a certain limit.",
        color: "green",
        x: 100, y: 650+110+110, radius: 22,
        max: 1, points: 0,
        requiredTreePoints: 36,
        children: []
    },

    turtleCrawl: {
        id: "turtleCrawl",
        name: "Turtle Crawl",
        description: "While downed, you take less damage.",
        color: "green",
        x: 100, y: 650+110, radius: 22,
        max: 5, points: 0,
        children: ["backOnYourFeet"]
    },

    loadedArms: {
        id: "loadedArms",
        name: "Loaded Arms",
        description: "Your equipped weapon has less impact on your encumbrance.",
        color: "green",
        x: 200, y: 650+110-20, radius: 22,
        max: 1, points: 0,
        children: ["backOnYourFeet","flyswatter"]
    },

    aLittleExtra: {
        id: "aLittleExtra",
        name: "A Little Extra",
        description: "Breaching an object generates resources.",
        color: "green",
        x: 200, y: 650-20, radius: 22,
        max: 1, points: 0,
        children: ["loadedArms"]
    },

    effortlessSwing: {
        id: "effortlessSwing",
        name: "Effortless Swing",
        description: "Melee abilities cost less stamina.",
        color: "green",
        x: 300, y: 650, radius: 22,
        max: 5, points: 0,
        children: ["skyClearingSwing"]
    },

    skyClearingSwing: {
        id: "skyClearingSwing",
        name: "Sky-Clearing Swing",
        description: "You deal more melee damage to drones.",
        color: "green",
        x: 300, y: 650+110, radius: 22,
        max: 5, points: 0,
        children: ["flyswatter"]
    },

    flyswatter: {
        id: "flyswatter",
        name: "Flyswatter",
        description: "Wasps and Turrets can now be destroyed with a single melee attack",
        color: "green",
        x: 300, y: 650+110+110, radius: 22,
        max: 5, points: 0,
        requiredTreePoints: 36,
        children: []
    },


    //
    // MOBILITY (CENTER TREE)
    //
    nimbleClimber: {
        id: "nimbleClimber",
        name: "Nimble Climber",
        description: "You can climb and vault more quickly.",
        color: "yellow",
        x: 500, y: 120, radius: 28,
        max: 5, points: 0,
        children: ["marathonRunner", "slipAndSlide"]
    },

    marathonRunner: {
        id: "marathonRunner",
        name: "Marathon Runner",
        description: "Movement consumes less stamina.",
        color: "yellow",
        x: 400, y: 260-40, radius: 22,
        max: 5, points: 0,
        children: ["youthfulLungs"]
    },

    slipAndSlide: {
        id: "slipAndSlide",
        name: "Slip And Slide",
        description: "You can slide further and faster.",
        color: "yellow",
        x: 600, y: 260-40, radius: 22,
        max: 5, points: 0,
        children: ["sturdyAnkles"]
    },

    youthfulLungs: {
        id: "youthfulLungs",
        name: "Youthful Lungs",
        description: "Increase max stamina.",
        color: "yellow",
        x: 400, y: 400-40, radius: 22,
        max: 5, points: 0,
        children: ["carryTheMomentum"]
    },

    sturdyAnkles: {
        id: "sturdyAnkles",
        name: "Sturdy Ankles",
        description: "You take less damage from non-lethal falls.",
        color: "yellow",
        x: 600, y: 400-40, radius: 22,
        max: 5, points: 0,
        children: ["calmingStroll"]
    },

    off: {
        id: "off",
        name: "Off The Wall",
        description: "You can Wall Leap further.",
        color: "yellow",
        x: 600, y: 400+110*2, radius: 22,
        max: 5, points: 0,
        children: ["ready"]
    },

    ready: {
        id: "ready",
        name: "Ready To Roll",
        description: "When falling, your timing window to perform a Recovery Roll is increased.",
        color: "yellow",
        x: 600, y: 400+110*3, radius: 22,
        max: 5, points: 0,
        children: ["vaultSpring"]
    },

    carryTheMomentum: {
        id: "carryTheMomentum",
        name: "Carry The Momentum",
        description: "After Sprint Dodge Roll, sprinting costs no stamina for a short time.",
        color: "yellow",
        x: 400+50, y: 540-20, radius: 22,
        max: 1, points: 0,
        requiredTreePoints: 15,
        children: ["effortlessRoll","crawl"]
    },

    effortlessRoll: {
        id: "effortlessRoll",
        name: "Effortless Roll",
        description: "Dodge Rolls cost less stamina.",
        color: "yellow",
        x: 400, y: 400+110*2, radius: 22,
        max: 5, points: 0,
        children: ["heroicLeap"]
    },

    crawl: {
        id: "crawl",
        name: "Crawl Before You Walk",
        description: "When you're downed, you crawl faster.",
        color: "yellow",
        x: 500, y: 400+110*2-20, radius: 22,
        max: 5, points: 0,
        children: ["vigorous"]
    },

    vigorous: {
        id: "vigorous",
        name: "Vigorous Vaulter",
        description: "Vaulting is no longer slowed down while exhausted.",
        color: "yellow",
        x: 500, y: 400+110*3-20, radius: 22,
        max: 1, points: 0,
        children: ["vaultsOnVaultsOnVaults","vaultSpring"]
    },

    heroicLeap: {
        id: "heroicLeap",
        name: "Heroic Leap",
        description: "You can Sprint Dodge Roll Further.",
        color: "yellow",
        x: 400, y: 400+110*3, radius: 22,
        max: 5, points: 0,
        children: ["vaultsOnVaultsOnVaults"]
    },

    vaultsOnVaultsOnVaults: {
        id: "vaultsOnVaultsOnVaults",
        name: "Vaults on Vaults on Vaults",
        description: "Vaulting no longer costs stamina.",
        color: "yellow",
        x: 400, y: 400+110*4, radius: 22,
        max: 1, points: 0,
        requiredTreePoints: 36,
        children: []
    },

    vaultSpring: {
        id: "vaultSpring",
        name: "Vault Spring",
        description: "Lets you jump at the end of a vault.",
        color: "yellow",
        x: 600, y: 400+110*4, radius: 22,
        max: 1, points: 0,
        requiredTreePoints: 36,
        children: []
    },

    calmingStroll: {
        id: "calmingStroll",
        name: "Calming Stroll",
        description: "While walking, stamina regenerates as if standing still.",
        color: "yellow",
        x: 600-50, y: 540-40, radius: 22,
        max: 1, points: 0,
        requiredTreePoints: 15,
        children: ["crawl","off"]
    },


    //
    // SURVIVAL (RIGHT TREE)
    //
//
// SURVIVAL (RIGHT TREE) – COMPLETE & CORRECT
//

    agileCroucher: {
        id: "agileCroucher",
        name: "Agile Croucher",
        description: "Your movement speed while crouching is increased.",
        color: "red",
        x: 800, y: 120, radius: 28,
        max: 5, points: 0,
        children: ["lootersInstincts", "revitalizingSquat"]
    },

    lootersInstincts: {
        id: "lootersInstincts",
        name: "Looter's Instincts",
        description: "Loot is revealed faster while searching a container.",
        color: "red",
        x: 700, y: 260, radius: 22,
        max: 5, points: 0,
        children: ["silentScavenger"]
    },

    revitalizingSquat: {
        id: "revitalizingSquat",
        name: "Revitalizing Squat",
        description: "Stamina regeneration while crouched is increased.",
        color: "red",
        x: 900, y: 260, radius: 22,
        max: 5, points: 0,
        children: ["inRoundCrafting"]
    },

    silentScavenger: {
        id: "silentScavenger",
        name: "Silent Scavenger",
        description: "You make less noise when looting.",
        color: "red",
        x: 700, y: 400, radius: 22,
        max: 5, points: 0,
        children: ["sufferInSilence"]
    },

    inRoundCrafting: {
        id: "inRoundCrafting",
        name: "In-Round Crafting",
        description: "Unlocks the ability to field-craft items while topside.",
        color: "red",
        x: 900, y: 400, radius: 22,
        max: 1, points: 0,
        children: ["goodAsNew"]
    },

    sufferInSilence: {
        id: "sufferInSilence",
        name: "Suffer In Silence",
        description: "While critically hurt, your movement makes less noise.",
        color: "red",
        x: 700+50, y: 540, radius: 22,
        max: 1, points: 0,
        requiredTreePoints: 15,
        children: ["broadShoulders", "travelingTinkerer"]
    },

    goodAsNew: {
        id: "goodAsNew",
        name: "Good As New",
        description: "While under a healing effect, stamina regeneration is increased.",
        color: "red",
        x: 900-50, y: 540-20, radius: 22,
        max: 1, points: 0,
        requiredTreePoints: 15,
        children: ["stubbornMule", "travelingTinkerer"]
    },

    broadShoulders: {
        id: "broadShoulders",
        name: "Broad Shoulders",
        description: "Increases the maximum weight you can carry.",
        color: "red",
        x: 700, y: 650, radius: 22,
        max: 5, points: 0,
        children: ["lootersLuck"]
    },

    stubbornMule: {
        id: "stubbornMule",
        name: "Stubborn Mule",
        description: "Stamina regen is less affected by being over-encumbered.",
        color: "red",
        x: 900, y: 650, radius: 22,
        max: 5, points: 0,
        children: ["threeDeepBreaths"]
    },

    lootersLuck: {
        id: "lootersLuck",
        name: "Looter's Luck",
        description: "Chance to reveal twice as many items when looting.",
        color: "red",
        x: 700, y: 760, radius: 22,
        max: 5, points: 0,
        children: ["securityBreach"]
    },

    travelingTinkerer: {
        id: "travelingTinkerer",
        name: "Traveling Tinkerer",
        description: "Unlocks additional items to field-craft.",
        color: "red",
        x: 800, y: 650-20, radius: 22,
        max: 1, points: 0,
        children: ["oneRaidersScraps"]
    },

    threeDeepBreaths: {
        id: "threeDeepBreaths",
        name: "Three Deep Breaths",
        description: "After an ability drains your stamina, you recover more quickly.",
        color: "red",
        x: 900, y: 760, radius: 22,
        max: 5, points: 0,
        children: ["minesweeper"]
    },

    oneRaidersScraps: {
        id: "oneRaidersScraps",
        name: "One Raider's Scraps",
        description: "Chance of finding extra field-crafted items in Raider containers.",
        color: "red",
        x: 800, y: 760-20, radius: 22,
        max: 5, points: 0,
        children: ["securityBreach", "minesweeper"]
    },

    securityBreach: {
        id: "securityBreach",
        name: "Security Breach",
        description: "Lets you breach Security Lockers.",
        color: "red",
        x: 750, y: 870, radius: 22,
        max: 1, points: 0,
        requiredTreePoints: 36,
        children: []
    },

    minesweeper: {
        id: "minesweeper",
        name: "Minesweeper",
        description: "Mines and explosive deployables can be defused in close proximity.",
        color: "red",
        x: 850, y: 870, radius: 22,
        max: 1, points: 0,
        requiredTreePoints: 36,
        children: []
    }

};

// COPY LINK BUTTON
document.getElementById("copyLinkBtn").addEventListener("click", () => {
    const input = document.getElementById("buildLink");
    const feedback = document.getElementById("copyFeedback");

    input.select();
    input.setSelectionRange(0, 99999); // dla mobile

    navigator.clipboard.writeText(input.value)
        .then(() => {
            feedback.style.opacity = 1;
            setTimeout(() => feedback.style.opacity = 0, 1200);
        })
        .catch(() => {
            alert("Could not copy to clipboard.");
        });
});


// --- SVG ROOT ---
const svg = document.getElementById("skillTree");

function encodeBuild() {
    const data = {};
    for (let id in skills) {
        data[id] = skills[id].points;
    }
    const json = JSON.stringify(data);
    return btoa(json); // base64
}

function updateBuildLink() {
    const encoded = encodeBuild();
    const url = `${location.origin}${location.pathname}?build=${encoded}`;
    document.getElementById("buildLink").value = url;
}

function loadBuildFromURL() {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("build");

    if (!encoded) return;

    try {
        const json = atob(encoded);
        const data = JSON.parse(json);

        for (let id in skills) {
            if (data[id] !== undefined) {
                skills[id].points = data[id];
            }
        }
    } catch (err) {
        console.error("Invalid build in URL");
    }
}


function countTotalPoints() {
    let total = 0;
    for (let id in skills) {
        total += skills[id].points;
    }
    document.getElementById("totalPoints").textContent = total;
}

function exportBuild() {
    const data = {};
    for (let id in skills) {
        data[id] = skills[id].points;
    }
    document.getElementById("buildOutput").value = JSON.stringify(data, null, 2);
}

function importBuild() {
    try {
        const input = document.getElementById("buildOutput").value;
        const data = JSON.parse(input);

        for (let id in skills) {
            if (data[id] !== undefined) {
                skills[id].points = data[id];
            }
        }

        render();
    } catch (e) {
        alert("Invalid JSON!");
    }
}

function isUnlockedStrict(skill) {
    // 1) znajdź rodziców
    const parents = [];
    for (let id in skills) {
        if (skills[id].children.includes(skill.id)) {
            parents.push(skills[id]);
        }
    }

    // 2) root jest zawsze aktywny
    if (parents.length === 0) return true;

    // 3) min. 1 punkt w dowolnym rodzicu
    const parentOK = parents.some(p => p.points > 0);
    if (!parentOK) return false;

    // 4) wymagane punkty w drzewku
    if (skill.requiredTreePoints) {
        const treeColor = skill.color;

        let treeSpent = 0;
        for (let id in skills) {
            if (skills[id].color === treeColor) {
                treeSpent += skills[id].points;
            }
        }

        if (treeSpent < skill.requiredTreePoints)
            return false;
    }

    return true;
}


// Draw connections between parent and children
function drawConnections() {
    for (let id in skills) {
        const s = skills[id];
        if (!s.children) continue;

        s.children.forEach(childId => {
            const c = skills[childId];

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", s.x);
            line.setAttribute("y1", s.y);
            line.setAttribute("x2", c.x);
            line.setAttribute("y2", c.y);
            const child = skills[childId];
            const active = isUnlockedStrict(child);

            line.setAttribute("stroke", active ? s.color : "#444");

            line.setAttribute("stroke-width", 4);

            svg.appendChild(line);
        });
    }
}

// Draw skill nodes
function drawNodes() {
    for (let id in skills) {
        const s = skills[id];

        // Determine if locked
        const unlocked = isUnlocked(s);

        // Circle
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.classList.add("skill-node");
        circle.classList.add(s.color);

        if (!unlocked) circle.classList.add("locked");

        circle.setAttribute("cx", s.x);
        circle.setAttribute("cy", s.y);
        circle.setAttribute("r", s.radius);
        circle.setAttribute("fill", "none");
        circle.setAttribute("fill", s.color);
        circle.setAttribute("stroke", "#ffffff22"); // delikatny obrys
        circle.setAttribute("stroke-width", 3);


        circle.addEventListener("mousedown", e => {
            e.preventDefault(); // blokuje zaznaczanie tekstu

            if (!isUnlocked(s)) return;

            if (e.button === 0) {
                // LEWY → dodaj
                if (s.points < s.max) s.points++;
            }

            if (e.button === 2) {
                // PRAWY → odejmij
                if (s.points > 0) s.points--;
            }

            render();
        });

        circle.addEventListener("contextmenu", e => e.preventDefault());

        circle.addEventListener("mouseenter", () => {
            const tooltip = document.getElementById("tooltip");

            let txt = s.description || "(no description)";
            if (s.requiredTreePoints) {
                txt += `<br><br><span style="color:#ff4444; font-weight:bold;">
                Requires: ${s.requiredTreePoints} points in this tree
                </span>`;
            }
            tooltip.innerHTML = txt;

            tooltip.style.opacity = 1;
        });

        circle.addEventListener("mousemove", (e) => {
            const tooltip = document.getElementById("tooltip");
            tooltip.style.left = (e.pageX + 20) + "px";
            tooltip.style.top = (e.pageY - 20) + "px";
        });

        circle.addEventListener("mouseleave", () => {
            document.getElementById("tooltip").style.opacity = 0;
        });


        svg.appendChild(circle);

        // Label
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", s.x);
        label.setAttribute("y", s.y - s.radius - 10);
        label.setAttribute("text-anchor", "middle");
        label.classList.add("node-text");
        label.textContent = s.name;
        svg.appendChild(label);

        // Points counter
        const points = document.createElementNS("http://www.w3.org/2000/svg", "text");
        points.setAttribute("x", s.x);
        points.setAttribute("y", s.y + 5);
        points.setAttribute("text-anchor", "middle");
        points.classList.add("node-points");
        points.textContent = `${s.points}/${s.max}`;
        svg.appendChild(points);

        // LOCK ICON if blocked by requiredTreePoints
        if (isBlockedByTreePoints(s)) {
            const lock = document.createElementNS("http://www.w3.org/2000/svg", "image");
            lock.href.baseVal = "lock.png";

            // pozycja pod node, lekko po lewej
            lock.setAttribute("x", s.x - (s.radius + 5));
            lock.setAttribute("y", s.y + (s.radius - 17));

            // wielkość ikony
            lock.setAttribute("width", 25);
            lock.setAttribute("height", 25);

            lock.classList.add("skill-lock");
            svg.appendChild(lock);
        }
    }
}

function isBlockedByTreePoints(skill) {
    if (!skill.requiredTreePoints) return false;

    const treeColor = skill.color;

    let spent = 0;
    for (let id in skills) {
        if (skills[id].color === treeColor) {
            spent += skills[id].points;
        }
    }

    return spent < skill.requiredTreePoints;
}


function isUnlocked(skill) {
    // 1) Znajdź rodziców
    const parents = [];
    for (let id in skills) {
        if (skills[id].children.includes(skill.id)) {
            parents.push(skills[id]);
        }
    }

    // 2) Brak rodziców → root zawsze odblokowany
    const parentCondition =
        parents.length === 0 ||
        parents.some(p => p.points > 0);

    if (!parentCondition) return false;

    // 3) Sprawdź wymagane punkty w drzewku (jeśli jest wymaganie)
    if (skill.requiredTreePoints) {

        // znajdź kolor drzewka
        const treeColor = skill.color;

        // policz wydane punkty w tym samym drzewku
        let spent = 0;
        for (let id in skills) {
            if (skills[id].color === treeColor) {
                spent += skills[id].points;
            }
        }

        if (spent < skill.requiredTreePoints) return false;
    }

    return true;
}




// On click, add point if possible
function clickSkill(skill) {
    if (!isUnlocked(skill)) return;

    if (skill.points < skill.max) {
        skill.points++;
    } else {
        skill.points = 0; // reset if clicked again
    }

    render();
}

function flipTreeVertical() {
    for (let id in skills) {
        skills[id].y = 1000 - skills[id].y;
    }
}


// Clear SVG and redraw
function render() {
    svg.innerHTML = "";
    drawConnections();
    drawNodes();
    countTotalPoints();
    exportBuild();
    updateBuildLink();
}

document.getElementById("loadBuild").addEventListener("click", importBuild);
loadBuildFromURL();
flipTreeVertical();
render();



