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
let emojiSlots = [];

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

showEmojiPickerScreen();