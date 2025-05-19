const vocabList = [
    { th: "แมว", en: "cat", rarity: "Common" },
    { th: "บ้าน", en: "house", rarity: "Common" },
    { th: "น้ำ", en: "water", rarity: "Common" },
    { th: "ต้นไม้", en: "tree", rarity: "Common" },
    { th: "ปลา", en: "fish", rarity: "Common" },
    { th: "ดิน", en: "soil", rarity: "Common" },
    { th: "ดอกไม้", en: "flower", rarity: "Common" },
    { th: "ไฟ", en: "fire", rarity: "Common" },
    { th: "มือ", en: "hand", rarity: "Common" },
    { th: "เท้า", en: "foot", rarity: "Common" },

    { th: "จักรยาน", en: "bicycle", rarity: "Rare" },
    { th: "โรงเรียน", en: "school", rarity: "Rare" },
    { th: "แม่น้ำ", en: "river", rarity: "Rare" },
    { th: "ภูเขา", en: "mountain", rarity: "Rare" },
    { th: "เครื่องบิน", en: "airplane", rarity: "Rare" },
    { th: "นาฬิกา", en: "clock", rarity: "Rare" },
    { th: "กระจก", en: "glass", rarity: "Rare" },
    { th: "กระจกเงา", en: "mirror", rarity: "Rare" },
    { th: "หนังสือ", en: "book", rarity: "Rare" },
    { th: "เก้าอี้", en: "chair", rarity: "Rare" },
    { th: "โต๊ะ", en: "table", rarity: "Rare" },
    { th: "ควย", en: "kuy", rarity: "Rare" }
];

const fishes = [
    { name: "ปลาทอง", rarity: "Common" },
    { name: "ปลากัด", rarity: "Common" },
    { name: "ปลาสีฟ้า", rarity: "Rare" },
    { name: "ปลาแสงดาว", rarity: "Rare" }
];

const rarityDecaySpeed = {
    "Common": 0.15,
    "Rare": 0.3
};

let currentVocab = null;
let progress = 100;
let isFishing = false;
let waitingForFail = false;
let failTimeoutId = null;

const wordDiv = document.getElementById("word");
const inputBox = document.getElementById("input-box");
const progressBar = document.getElementById("progress-bar").firstElementChild;
const resultText = document.getElementById("result");
const inventoryList = document.getElementById("inventory-list");
const gameContainer = document.getElementById("game-container");

let inventory = {};

function getRandomVocab() {
    return vocabList[Math.floor(Math.random() * vocabList.length)];
}

function getFishByRarity(rarity) {
    const filtered = fishes.filter(f => f.rarity === rarity);
    return filtered[Math.floor(Math.random() * filtered.length)];
}

function startFishing() {
    if (isFishing) return;
    isFishing = true;
    waitingForFail = false;
    resultText.textContent = "";
    inputBox.disabled = false;
    inputBox.value = "";
    inputBox.focus();

    currentVocab = getRandomVocab();
    progress = 100;

    wordDiv.textContent = currentVocab.th;
    progressBar.style.width = "100%";

    // ตั้งเวลาแพ้ (ถ้าไม่พิมพ์ทัน) 15 วินาที
    if (failTimeoutId) clearTimeout(failTimeoutId);
    failTimeoutId = setTimeout(() => {
        if (isFishing) {
            waitingForFail = true;
            resultText.textContent = `แพ้! เฉลยคำศัพท์: "${currentVocab.en}"`;
            stopFishing();
        }
    }, 15000); // 15 วินาที
}

function stopFishing() {
    isFishing = false;
    inputBox.disabled = true;
    currentVocab = null;
    progress = 0;
    progressBar.style.width = "0%";
    wordDiv.textContent = "คลิกที่นี่เพื่อเริ่มตกปลา";
    inputBox.value = "";
    if (failTimeoutId) {
        clearTimeout(failTimeoutId);
        failTimeoutId = null;
    }
}

function decayProgress() {
    if (!isFishing || waitingForFail) return;

    progress -= rarityDecaySpeed[currentVocab.rarity];
    if (progress < 0) progress = 0;
    progressBar.style.width = progress + "%";

    if (progress <= 0) {
        waitingForFail = true;
        resultText.textContent = "หลอดหมด! รอ 5 วินาทีก่อนตกปลาไม่สำเร็จ...";
        if (failTimeoutId) {
            clearTimeout(failTimeoutId);
            failTimeoutId = null;
        }
        setTimeout(() => {
            if (progress <= 0) {
                resultText.textContent = `ตกปลาไม่สำเร็จ! เฉลยคำศัพท์: "${currentVocab.en}"`;
                stopFishing();
                waitingForFail = false;
            }
        }, 5000);
    }
}

function addFishToInventory(fishName, rarity) {
    if (!inventory[fishName]) {
        inventory[fishName] = { count: 0, rarity };
    }
    inventory[fishName].count++;
    updateInventoryUI();
}

function updateInventoryUI() {
    inventoryList.innerHTML = "";
    for (const [fishName, data] of Object.entries(inventory)) {
        const li = document.createElement("li");
        li.textContent = `${fishName} x${data.count}`;
        li.className = `rarity-${data.rarity}`;
        inventoryList.appendChild(li);
    }
}

inputBox.addEventListener("input", () => {
    if (!isFishing || waitingForFail) return;

    const inputValue = inputBox.value.trim().toLowerCase();
    if (inputValue === currentVocab.en) {
        const fish = getFishByRarity(currentVocab.rarity);
        addFishToInventory(fish.name, fish.rarity);
        resultText.textContent = `ตกได้! ${fish.name} (${fish.rarity})`;
        stopFishing();
    }
});

gameContainer.addEventListener("click", () => {
    if (isFishing) {
        stopFishing();
    } else {
        startFishing();
    }
});

setInterval(decayProgress, 200);
