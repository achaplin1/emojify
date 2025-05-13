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

// Écran d'accueil
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

let currentPseudo = "";
let currentRoom = "";

// Génère un code de salle aléatoire
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Crée une salle
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

// Rejoindre une salle
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

// Attente des joueurs
function waitRoom(roomId) {
    screen.innerHTML = `<div class="fade"><h2>Salle : ${roomId}</h2><ul id="playerList"></ul><p>En attente de 3 joueurs...</p></div>`;
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
                startGame(all);
            }
        }
    });
}

// Démarrage du jeu (démo)
function startGame(playerList) {
    screen.innerHTML = `
        <div class="fade">
            <h2>🎉 La partie commence !</h2>
            <p>Joueurs : ${playerList.join(', ')}</p>
            <p>(Développement du gameplay complet en cours...)</p>
        </div>
    `;
}

// Initialisation
showHome();