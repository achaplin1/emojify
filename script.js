import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "ATzASyCmEfKweqbEXzn8q20lh7Q9MsfgrnK3p49Y",
  authDomain: "emojify-4d1eb.firebaseapp.com",
  databaseURL: "https://emojify-4d1eb-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "emojify-4d1eb",
  storageBucket: "emojify-4d1eb.appspot.com",
  messagingSenderId: "1080820748006",
  appId: "1:1080820748006:web:70cbcea1420126732b9247",
  measurementId: "G-ZGVLSWG1D6"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const screen = document.getElementById("screen");

let currentPseudo = "";
let currentRoom = "";
let myWord = null;
let selectedEmojis = [];
let emojiGroups = [];
let selectedCategory = null;

function showHome() {
  screen.innerHTML = \`
    <div class="fade">
      <h1 class="title">🎮 Emojify</h1>
      <input type="text" id="pseudo" placeholder="Votre pseudo" />
      <br/>
      <button id="createRoomBtn">Créer une salle</button>
      <button id="joinRoomBtn">Rejoindre une salle</button>
      <input type="text" id="roomCode" placeholder="Code de la salle" />
    </div>
  \`;
  document.getElementById("createRoomBtn").addEventListener("click", createRoom);
  document.getElementById("joinRoomBtn").addEventListener("click", joinRoom);
}

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function createRoom() {
  currentPseudo = document.getElementById("pseudo").value.trim();
  if (!currentPseudo) return alert("Entrez un pseudo.");
  const roomId = generateRoomCode();
  currentRoom = roomId;
  const playersRef = ref(db, 'rooms/' + roomId + '/players');
  const newPlayerRef = push(playersRef);
  set(newPlayerRef, currentPseudo).then(() => {
    waitRoom(roomId);
  });
}

function joinRoom() {
  currentPseudo = document.getElementById("pseudo").value.trim();
  const roomId = document.getElementById("roomCode").value.trim().toUpperCase();
  if (!currentPseudo || !roomId) return alert("Entrez un pseudo et un code.");
  currentRoom = roomId;
  const playersRef = ref(db, 'rooms/' + roomId + '/players');
  const newPlayerRef = push(playersRef);
  set(newPlayerRef, currentPseudo).then(() => {
    waitRoom(roomId);
  });
}

function waitRoom(roomId) {
  screen.innerHTML = \`
    <div class="fade">
      <h2>Salle : \${roomId}</h2>
      <p>En attente des joueurs...</p>
      <ul id="playerList"></ul>
    </div>
  \`;
  const playersRef = ref(db, 'rooms/' + roomId + '/players');
  onValue(playersRef, (snapshot) => {
    const list = document.getElementById("playerList");
    list.innerHTML = "";
    const players = snapshot.val();
    if (players) {
      const all = Object.values(players);
      all.forEach(p => {
        const li = document.createElement("li");
        li.textContent = p;
        list.appendChild(li);
      });
      if (all.length === 3) {
        assignWords(all);
      }
    }
  });
}

async function assignWords(playerList) {
  const res = await fetch("mots.json");
  const mots = await res.json();
  const categories = Object.keys(mots);
  const playerWords = {};
  playerList.forEach(p => {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const wordList = mots[cat];
    const mot = wordList[Math.floor(Math.random() * wordList.length)];
    playerWords[p] = { mot, cat };
  });
  await set(ref(db, 'rooms/' + currentRoom + '/mots'), playerWords);
  showEmojiPickerScreen();
}

async function showEmojiPickerScreen() {
  const wordSnap = await get(ref(db, 'rooms/' + currentRoom + '/mots/' + currentPseudo));
  if (!wordSnap.exists()) {
    screen.innerHTML = "<p>Erreur : aucun mot trouvé.</p>";
    return;
  }
  myWord = wordSnap.val();
  selectedEmojis = [];

  screen.innerHTML = \`
    <div class="fade">
      <h1 class="title">🎮 Emojify</h1>
      <h2>Catégorie : \${myWord.cat}</h2>
      <p><strong>Mot à emojifier :</strong> \${myWord.mot}</p>
      <h3>Choisis jusqu’à 4 emojis</h3>
      <div id="emojiSlots">
        <span id="slot1" class="emoji-slot"></span>
        <span id="slot2" class="emoji-slot"></span>
        <span id="slot3" class="emoji-slot"></span>
        <span id="slot4" class="emoji-slot"></span>
      </div>
      <div id="emojiSelector">
        <div id="categoryList"></div>
        <div id="emojiContent"></div>
      </div>
    </div>
  \`;

  loadEmojiFromGroupedJson();
}

async function loadEmojiFromGroupedJson() {
  try {
    const res = await fetch("data-by-group.json");
    emojiGroups = await res.json();
    const listDiv = document.getElementById("categoryList");
    emojiGroups.forEach((groupe, index) => {
      const btn = document.createElement("button");
      btn.textContent = groupe.name;
      btn.className = "category-btn";
      btn.addEventListener("click", () => {
        selectedCategory = index;
        updateCategoryDisplay();
      });
      listDiv.appendChild(btn);
    });
    selectedCategory = 0;
    updateCategoryDisplay();
  } catch (e) {
    console.error("Erreur JSON emojis :", e);
  }
}

function updateCategoryDisplay() {
  document.querySelectorAll(".category-btn").forEach((btn, idx) => {
    btn.classList.toggle("active", idx === selectedCategory);
  });

  const group = emojiGroups[selectedCategory];
  const content = document.getElementById("emojiContent");
  content.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = group.name;
  content.appendChild(title);

  const list = document.createElement("div");
  list.className = "emoji-list";

  group.emojis.forEach(e => {
    const b = document.createElement("button");
    b.textContent = e.emoji;
    b.className = "emoji-btn";
    b.addEventListener("click", () => selectEmoji(e.emoji));
    list.appendChild(b);
  });

  content.appendChild(list);
}

function selectEmoji(char) {
  if (selectedEmojis.includes(char)) {
    selectedEmojis = selectedEmojis.filter(e => e !== char);
  } else if (selectedEmojis.length < 4) {
    selectedEmojis.push(char);
  }
  updateSlots();
}

function updateSlots() {
  for (let i = 1; i <= 4; i++) {
    const slot = document.getElementById("slot" + i);
    slot.textContent = selectedEmojis[i - 1] || "";
    slot.onclick = () => {
      if (selectedEmojis[i - 1]) {
        selectedEmojis.splice(i - 1, 1);
        updateSlots();
      }
    };
  }
}

showHome();