const blueprints = [
                     {"id":"Anvil","name":"Anvil","img":"img/anvil.webp"},
                     {"id":"Anvil Splitter","name":"Anvil Splitter","img":"img/anvilsplitter.jpg"},
                     {"id":"Angled Grip II","name":"Angled Grip II","img":"img/angledgrip2.webp"},
                     {"id":"Angled Grip III","name":"Angled Grip III","img":"img/angledgrip3.jpg"},
                     {"id":"Aphelion","name":"Aphelion","img":"img/aphelion.webp"},
                     {"id":"Barricade Kit","name":"Barricade Kit","img":"img/barricade.webp"},
                     {"id":"Bettina","name":"Bettina","img":"img/bettina.webp"},
                     {"id":"Blaze Grenade","name":"Blaze Grenade","img":"img/blaze.webp"},
                     {"id":"Blue Light Stick","name":"Blue Light Stick","img":"img/bluelightstick.jpg"},
                     {"id":"Bobcat","name":"Bobcat","img":"img/bobcat.jpg"},
                     {"id":"Burletta","name":"Burletta","img":"img/burletta.webp"},
                     {"id":"Combat MK.3 (Aggressive)","name":"Combat MK.3 (Aggressive)","img":"img/combatmk3aggresive.webp"},
                     {"id":"Combat MK.3 (Flanking)","name":"Combat MK.3 (Flanking)","img":"img/combatmk3flanking.webp"},
                     {"id":"Looting MK.3 (Cautious)","name":"Looting MK.3 (Cautious)","img":"img/lootingmk3cautious.webp"},
                     {"id":"Looting MK.3 (Survivor)","name":"Looting MK.3 (Survivor)","img":"img/lootingmk3survivor.webp"},
                     {"id":"Tactical MK.3 (Defensive)","name":"Tactical MK.3 (Defensive)","img":"img/tacticalmk3defensive.webp"},
                     {"id":"Tactical MK.3 (Healing)","name":"Tactical MK.3 (Healing)","img":"img/tacticalmk3healing.webp"},
                     {"id":"Compensator II","name":"Compensator II","img":"img/compensator2.webp"},
                     {"id":"Compensator III","name":"Compensator III","img":"img/compensator3.webp"},
                     {"id":"Complex Gun Parts","name":"Complex Gun Parts","img":"img/complexgunparts.webp"},
                     {"id":"Defibrillator","name":"Defibrillator","img":"img/defibrillator.webp"},
                     {"id":"Explosive Mine","name":"Explosive Mine","img":"img/explosivemine.webp"},
                     {"id":"Extended Barrel","name":"Extended Barrel","img":"img/extendedbarre.webp"},
                     {"id":"Extended Light Magazine II","name":"Extended Light Magazine II","img":"img/extendedlightmag2.webp"},
                     {"id":"Extended Light Magazine III","name":"Extended Light Magazine III","img":"img/extendedlightmag3.webp"},
                     {"id":"Extended Medium Magazine II","name":"Extended Medium Magazine II","img":"img/Extendedmediummag3.webp"},
                     {"id":"Extended Medium Magazine III","name":"Extended Medium Magazine III","img":"img/Extendedmediummag3.webp"},
                     {"id":"Extended Shotgun Magazine II","name":"Extended Shotgun Magazine II","img":"img/extendedmediumshotgunmag2.webp"},
                     {"id":"Extended Shotgun Magazine III","name":"Extended Shotgun Magazine III","img":"img/extendedmediumshotgunmag3.jpg"},
                     {"id":"Equalizer","name":"Equalizer","img":"img/equalizer.webp"},
                     {"id":"Green Light Stick","name":"Green Light Stick","img":"img/greenlightstick.webp"},
                     {"id":"Heavy Gun Parts","name":"Heavy Gun Parts","img":"img/heavygunparts.webp"},
                     {"id":"Hullbreaker","name":"Hullbreaker","img":"img/hullcracker.webp"},
                     {"id":"Il Toro","name":"Il Toro","img":"img/iltoro.webp"},
                     {"id":"Jolt Mine","name":"Jolt Mine","img":"img/joltmine.webp"},
                     {"id":"Jupiter","name":"Jupiter","img":"img/jupiter.webp"},
                     {"id":"Light Gun Parts","name":"Light Gun Parts","img":"img/lightgunparts.webp"},
                     {"id":"Lightweight Stock","name":"Lightweight Stock","img":"img/lightweightstock.webp"},
                     {"id":"Lure Grenade","name":"Lure Grenade","img":"img/luregrenade.webp"},
                     {"id":"Medium Gun Parts","name":"Medium Gun Parts","img":"img/mediumgunparts.webp"},
                     {"id":"Mod Components","name":"Mod Components","img":"https://dummyimage.com/400x300/26303b/fff&text=Mod+Components"},
                     {"id":"Muzzle Brake II","name":"Muzzle Brake II","img":"img/muzzlebrake2.webp"},
                     {"id":"Muzzle Brake III","name":"Muzzle Brake III","img":"img/muzzlebrake3.jpg"},
                     {"id":"Osprey","name":"Osprey","img":"img/osprey.webp"},
                     {"id":"Padded Stock","name":"Padded Stock","img":"img/paddedstock.webp"},
                     {"id":"Remote Raider Flare","name":"Remote Raider Flare","img":"img/remoteraiderflare.webp"},
                     {"id":"Shotgun Choke II","name":"Shotgun Choke II","img":"img/shotgunchoke2.webp"},
                     {"id":"Shotgun Choke III","name":"Shotgun Choke III","img":"img/shotgunchoke3.jpg"},
                     {"id":"Shotgun Silencer","name":"Shotgun Silencer","img":"img/shotgunsilencer.jpg"},
                     {"id":"Silencer I","name":"Silencer I","img":"img/silencer1.webp"},
                     {"id":"Silencer II","name":"Silencer II","img":"img/silencer2.webp"},
                     {"id":"Snap Hook","name":"Snap Hook","img":"img/snaphook.jpg"},
                     {"id":"Showstopper","name":"Showstopper","img":"img/showstopper.webp"},
                     {"id":"Stable Stock II","name":"Stable Stock II","img":"img/stablestock2.webp"},
                     {"id":"Stable Stock III","name":"Stable Stock III","img":"img/stablestock3.webp"},
                     {"id":"Tagging Grenade","name":"Tagging Grenade","img":"img/tagging.jpg"},
                     {"id":"Tempest","name":"Tempest","img":"img/tempest.png"},
                     {"id":"Torrente","name":"Torrente","img":"img/torrente.webp"},
                     {"id":"Trigger Nade","name":"Trigger Nade","img":"img/triggernade.webp"},
                     {"id":"Vita Shot","name":"Vita Shot","img":"img/vitashot.jpg"},
                     {"id":"Vita Spray","name":"Vita Spray","img":"img/vitaspray.webp"},
                     {"id":"Vulcano","name":"Vulcano","img":"img/vulcano.webp"},
                     {"id":"Venator","name":"Venator","img":"img/venator.webp"},
                     {"id":"Vertical Grip II","name":"Vertical Grip II","img":"img/verticalgrip2.webp"},
                     {"id":"Vertical Grip III","name":"Vertical Grip III","img":"img/vertricalgrip3.webp"},
                     {"id":"Wolfpack","name":"Wolfpack","img":"img/wolfpack.webp"},
                     {"id":"Yellow Light Stick","name":"Yellow Light Stick","img":"img/yellowlightstick.webp"},
                     {"id":"Red Light Stick","name":"Red Light Stick","img":"img/redlightstick.webp"},
                     {"id":"Smoke Grenade","name":"Smoke Grenade","img":"img/smokegrenade.webp"}
                   ]
;

const grid = document.getElementById("blueprintGrid");
const contactInput = document.getElementById("contact");
const modeSelect = document.getElementById("mode");
const outputEl = document.getElementById("output");
const copyBtn = document.getElementById("copyBtn");

function renderBlueprints(selected = []) {
  grid.innerHTML = "";
  blueprints.forEach(bp => {
    const item = document.createElement("div");
    item.className = "blueprint" + (selected.includes(bp.id) ? " selected" : "");
    item.dataset.id = bp.id;

    item.innerHTML = `
      <img src="${bp.img}" alt="${bp.name}">
      <div class="meta">${bp.name}</div>
      <div class="tick">✓</div>
    `;

    item.addEventListener("click", () => {
      item.classList.toggle("selected");
      updateLink();
    });

    grid.appendChild(item);
  });
}

function updateLink() {
  const selected = [...document.querySelectorAll(".blueprint.selected")].map(e => e.dataset.id);
  const contact = contactInput.value || "";
  const mode = modeSelect.value || "sell";

  const data = { selected, contact, mode };
  const encoded = encodeURIComponent(btoa(JSON.stringify(data)));

  const url = `${location.origin}${location.pathname}?d=${encoded}`;
  outputEl.textContent = url;
}

async function copyLink() {
  const link = outputEl.textContent.trim();
  if (!link) return;

  try {
    await navigator.clipboard.writeText(link);
    copyBtn.textContent = "Skopiowano!";
    setTimeout(() => copyBtn.textContent = "Kopiuj link", 1200);
  } catch (err) {
    console.warn("Clipboard error", err);
  }
}

function loadFromLink() {
  const params = new URLSearchParams(location.search);
  const encoded = params.get("d");

  if (!encoded) {
    renderBlueprints([]);
    return updateLink();
  }

  try {
    const data = JSON.parse(atob(decodeURIComponent(encoded)));
    contactInput.value = data.contact || "";
    modeSelect.value = data.mode || "sell";
    renderBlueprints(data.selected || []);
    updateLink();
  } catch (e) {
    console.warn("Decode error:", e);
    renderBlueprints([]);
    updateLink();
  }
}

contactInput.addEventListener("input", updateLink);
modeSelect.addEventListener("change", updateLink);
copyBtn.addEventListener("click", copyLink);

loadFromLink();
