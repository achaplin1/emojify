import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase config
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

// Écran d'accueil
function showHome() {
  screen.innerHTML = `
    <div class="fade">
      <h1 class="title">🎮 Emojify</h1>
      <input type="text" id="pseudo" placeholder="Votre pseudo" />
      <br/>
      <button id="createRoomBtn">Créer une salle</button>
      <button id="joinRoomBtn">Rejoindre une salle</button>
      <input type="text" id="roomCode" placeholder="Code de la salle" />
    </div>
  `;
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
  screen.innerHTML = `
    <div class="fade">
      <h2>Salle : ${roomId}</h2>
      <p>En attente des joueurs...</p>
      <ul id="playerList"></ul>
    </div>
  `;
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
        showEmojiPickerScreen(); // lancement temporaire
      }
    }
  });
}

function showEmojiPickerScreen() {
  screen.innerHTML = `
    <div class="fade">
      <h2 class="title">Choisis jusqu’à 4 emojis</h2>
      <div id="emojiSlots">
        <div class="emoji-slot empty"></div>
        <div class="emoji-slot empty"></div>
        <div class="emoji-slot empty"></div>
        <div class="emoji-slot empty"></div>
      </div>
      <div id="emojiPicker"></div>
    </div>
  `;
  loadEmojis();
  setupEmojiSlotListeners();
}

function setupEmojiSlotListeners() {
  const slots = document.querySelectorAll('.emoji-slot');
  slots.forEach(slot => {
    slot.addEventListener('click', () => {
      if (slot.textContent !== "") {
        slot.textContent = "";
        slot.classList.add("empty");
      }
    });
  });
}

async function loadEmojis() {
  const res = await fetch("emojis_structured.json");
  const data = await res.json();
  const picker = document.getElementById("emojiPicker");
  for (const group in data) {
    const title = document.createElement("h4");
    title.textContent = group;
    title.style.width = "100%";
    title.style.marginTop = "1rem";
    picker.appendChild(title);
    data[group].forEach(char => {
      const span = document.createElement("span");
      span.textContent = char;
      span.className = "emoji";
      span.addEventListener("click", () => addEmojiToSlot(char));
      picker.appendChild(span);
    });
  }
}

function addEmojiToSlot(char) {
  const slots = document.querySelectorAll('.emoji-slot');
  for (const slot of slots) {
    if (slot.textContent === "") {
      slot.textContent = char;
      slot.classList.remove("empty");
      break;
    }
  }
}

// Lancement du site
showHome();