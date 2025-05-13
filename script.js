import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

let currentRoom = "";
let currentPseudo = "";

function createRoom() {
    currentPseudo = document.getElementById("pseudo").value.trim();
    if (!currentPseudo) return alert("Entrez un pseudo.");
    const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    currentRoom = roomId;
    const roomRef = ref(db, 'rooms/' + roomId + '/players');
    const newPlayerRef = push(roomRef);
    set(newPlayerRef, currentPseudo);
    showRoom(roomId);
    listenToRoom(roomId);
}

function joinRoom() {
    currentPseudo = document.getElementById("pseudo").value.trim();
    const roomId = document.getElementById("roomCode").value.trim().toUpperCase();
    if (!currentPseudo || !roomId) return alert("Entrez un pseudo et un code.");
    currentRoom = roomId;
    const roomRef = ref(db, 'rooms/' + roomId + '/players');
    const newPlayerRef = push(roomRef);
    set(newPlayerRef, currentPseudo);
    showRoom(roomId);
    listenToRoom(roomId);
}

function showRoom(roomId) {
    document.getElementById("login").style.display = "none";
    document.getElementById("room").style.display = "block";
    document.getElementById("roomIdDisplay").textContent = roomId;
}

function listenToRoom(roomId) {
    const roomRef = ref(db, 'rooms/' + roomId + '/players');
    onValue(roomRef, (snapshot) => {
        const players = snapshot.val();
        const list = document.getElementById("playerList");
        list.innerHTML = "";
        if (players) {
            Object.values(players).forEach(pseudo => {
                const li = document.createElement("li");
                li.textContent = pseudo;
                list.appendChild(li);
            });
        }
    });
}

// Lier les boutons
document.getElementById("createRoomBtn").addEventListener("click", createRoom);
document.getElementById("joinRoomBtn").addEventListener("click", joinRoom);