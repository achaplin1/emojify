import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, get, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Configuration Firebase
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

// Page d'accueil
function showHome() {
    screen.innerHTML = `
        <div class="fade">
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
</div>`;
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

// Attribution des mots à chaque joueur
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
    showEmojifyScreen(playerWords[currentPseudo]);
}

function showEmojifyScreen(data) {
    myWord = data;
    screen.innerHTML = `
        <div class="fade">
            <h2>Emojifie ceci :</h2>
            <p><strong>Catégorie :</strong> ${data.cat}</p>
            <p><strong>Mot :</strong> ${data.mot}</p>
            <input type="text" id="emojiInput" maxlength="10" placeholder="Entrez jusqu’à 4 emojis" />
            <br/>
            <button id="submitEmojis">Valider</button>
        </div>
    `;
    document.getElementById("submitEmojis").addEventListener("click", () => {
        const val = document.getElementById("emojiInput").value.trim();
        if (!val || [...val].length > 4) {
            alert("Utilisez entre 1 et 4 emojis max.");
            return;
        }
        const emojiRef = ref(db, 'rooms/' + currentRoom + '/emojis/' + currentPseudo);
        set(emojiRef, { word: myWord, emojis: val }).then(() => {
            screen.innerHTML = "<div class='fade'><p>En attente des autres joueurs...</p></div>";
        });
    });
}

showHome();