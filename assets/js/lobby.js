// assets/js/lobby.js
// Logika za lobby igre

// Game and player data
let gameData = null;
let currentUser = null;
let currentPlayerId = null;
let countdownInterval = null;
let playersData = {};

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    // Get game ID from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('gameId') || localStorage.getItem('zgGameId');
    
    if (!gameId) {
        // No game ID, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    // Display game ID
    document.getElementById('gameId').textContent = gameId;
    
    // Get current user from localStorage
    const userJSON = localStorage.getItem('zgUser');
    
    if (!userJSON) {
        // No user, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = JSON.parse(userJSON);
    currentPlayerId = generatePlayerId(currentUser.username);
    
    // Set up event listeners
    setupEventListeners();
    
    // Load game data
    loadGameData(gameId);
});

// Setup event listeners
function setupEventListeners() {
    // Ready button
    const readyBtn = document.getElementById('readyBtn');
    if (readyBtn) {
        readyBtn.addEventListener('click', toggleReady);
    }
    
    // Copy game ID button
    const copyGameIdBtn = document.getElementById('copyGameIdBtn');
    if (copyGameIdBtn) {
        copyGameIdBtn.addEventListener('click', copyGameIdToClipboard);
    }
}

// Generate player ID
function generatePlayerId(username) {
    console.log("Generiranje ID za igrača:", username);
    
    // Create a consistent ID based on username
    // This ensures the same player gets the same ID across sessions
    const baseId = username.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const id = baseId + '_' + Date.now().toString(36);
    
    console.log("Generirani ID:", id);
    return id;
}

// Load game data
function loadGameData(gameId) {
    const gameRef = firebase.database().ref('games/' + gameId);
    
    // Check if game exists
    gameRef.once('value', (snapshot) => {
        if (!snapshot.exists()) {
            // Game doesn't exist, redirect to home
            alert('Igra sa tim kodom ne postoji.');
            window.location.href = 'index.html';
            return;
        }
        
        gameData = snapshot.val();
        
        // Check if player is already in the game
        let playerExists = false;
        if (gameData.players) {
            for (const playerId in gameData.players) {
                if (gameData.players[playerId].username === currentUser.username) {
                    currentPlayerId = playerId;
                    playerExists = true;
                    break;
                }
            }
        }
        
        if (!playerExists) {
            // Add player to game
            addPlayerToGame(gameId, currentUser);
        }
        
        // Display game settings
        displayGameSettings();
        
        // Set up real-time listeners
        setupRealtimeListeners(gameId);
    }).catch(error => {
        console.error('Error loading game:', error);
        alert('Došlo je do greške pri učitavanju igre.');
    });
}

// Toggle player ready status
function toggleReady() {
    const readyBtn = document.getElementById('readyBtn');
    if (!readyBtn) return;
    
    const isReady = readyBtn.classList.contains('btn-success');
    const playerRef = firebase.database().ref(`games/${gameData.id}/players/${currentPlayerId}/isReady`);
    
    playerRef.set(!isReady)
        .then(() => {
            // Update button appearance
            if (!isReady) {
                readyBtn.classList.remove('btn-outline-success');
                readyBtn.classList.add('btn-success');
                readyBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Spreman!';
            } else {
                readyBtn.classList.add('btn-outline-success');
                readyBtn.classList.remove('btn-success');
                readyBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Spremi se';
            }
        })
        .catch(error => {
            console.error('Error toggling ready status:', error);
        });
}

// Copy game ID to clipboard
function copyGameIdToClipboard() {
    const gameId = document.getElementById('gameId').textContent;
    
    navigator.clipboard.writeText(gameId)
        .then(() => {
            // Show success message
            showToast('Kod igre je kopiran!');
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
        });
}

// Check if all players are ready to start the game
function checkGameStart() {
    const players = Object.values(playersData);
    
    // Need at least 2 players
    if (players.length < 2) return;
    
    // Check if all players are ready
    const allReady = players.every(player => player.isReady);
    
    if (allReady) {
        // Start countdown if not already started
        if (!countdownInterval) {
            startGameCountdown();
        }
    } else {
        // Stop countdown if started
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            document.getElementById('countdownContainer').classList.add('d-none');
        }
    }
}

// Start game countdown
function startGameCountdown() {
    const countdownContainer = document.getElementById('countdownContainer');
    const countdownEl = document.getElementById('countdown');
    
    if (!countdownContainer || !countdownEl) return;
    
    // Display countdown
    countdownContainer.classList.remove('d-none');
    
    let count = 5;
    countdownEl.textContent = count;
    
    countdownInterval = setInterval(() => {
        count--;
        countdownEl.textContent = count;
        
        // Play countdown sound if available
        playSound('countdown');
        
        if (count <= 0) {
            clearInterval(countdownInterval);
            
            // Start the game (only the creator will do this)
            if (isCreator()) {
                startGame();
            }
        }
    }, 1000);
}

// Check if current player is the creator
function isCreator() {
    if (!playersData || !currentPlayerId) return false;
    
    const player = playersData[currentPlayerId];
    return player && player.isCreator;
}

// Start the game
function startGame() {
    if (!gameData) return;
    
    const gameId = document.getElementById('gameId').textContent;
    
    // Update game status to active
    firebase.database().ref(`games/${gameId}/settings/status`).set('active')
        .then(() => {
            // Create first round
            return createNewRound(gameId, 1);
        })
        .catch(error => {
            console.error('Error starting game:', error);
        });
}

// Create a new round
function createNewRound(gameId, roundNumber) {
    const roundRef = firebase.database().ref(`games/${gameId}/rounds/${roundNumber}`);
    
    // Get settings to get disabled letters
    return firebase.database().ref(`games/${gameId}/settings`).once('value')
        .then((snapshot) => {
            const settings = snapshot.val();
            const disabledLetters = settings.disabledLetters || [];
            
            // Generate random letter (excluding disabled)
            const letter = generateRandomLetter(disabledLetters);
            
            return roundRef.set({
                letter: letter,
                startedAt: firebase.database.ServerValue.TIMESTAMP,
                finishedAt: null
            });
        });
}

// Generate random letter
function generateRandomLetter(disabledLetters) {
    const allLetters = 'ABCČĆDĐEFGHIJKLMNOPRSŠTUVZŽ';
    let availableLetters = '';
    
    for (let i = 0; i < allLetters.length; i++) {
        const letter = allLetters[i];
        if (!disabledLetters.includes(letter)) {
            availableLetters += letter;
        }
    }
    
    const randomIndex = Math.floor(Math.random() * availableLetters.length);
    return availableLetters[randomIndex];
}

// Play sound effect
function playSound(soundName) {
    const sound = new Audio(`assets/sounds/${soundName}.mp3`);
    sound.play().catch(error => {
        // Ignore errors - sound might not be available
        console.log('Sound not available:', error);
    });
}

// Show toast message
function showToast(message) {
    const toastContainer = document.querySelector('#toastContainer');
    
    if (!toastContainer) {
        // Create toast container if it doesn't exist
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.zIndex = '1050';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.classList.add('toast', 'bg-dark-secondary', 'text-light', 'border-neon');
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="toast-header bg-dark-secondary text-light">
            <strong class="me-auto">Zanimljiva Geografija</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Zatvori"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    document.getElementById('toastContainer').appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 3000
    });
    
    bsToast.show();
}

// Add player to game
function addPlayerToGame(gameId, user) {
    console.log("Dodavanje igrača", user.username, "u igru", gameId);
    
    // Generate a unique player ID if not already set
    if (!currentPlayerId) {
        currentPlayerId = generatePlayerId(user.username);
    }
    
    console.log("Korišćenje playerID:", currentPlayerId);
    
    const playerRef = firebase.database().ref('games/' + gameId + '/players/' + currentPlayerId);
    
    const playerData = {
        username: user.username,
        isReady: false,
        isFinished: false,
        joinedAt: firebase.database.ServerValue.TIMESTAMP,
        totalScore: 0
    };
    
    console.log("Podaci igrača za upis:", playerData);
    
    playerRef.set(playerData)
        .then(() => {
            console.log("Igrač uspešno dodat u igru!");
        })
        .catch(error => {
            console.error("Greška pri dodavanju igrača:", error);
            alert("Greška pri pridruživanju igri: " + error.message);
        });
}

// Display game settings
function displayGameSettings() {
    if (!gameData || !gameData.settings) return;
    
    const settings = gameData.settings;
    
    // Round time
    document.getElementById('roundTimeDisplay').textContent = settings.roundTime + ' min';
    
    // Total rounds
    document.getElementById('totalRoundsDisplay').textContent = settings.totalRounds;
    
    // Disabled letters
    const disabledLetters = settings.disabledLetters || [];
    document.getElementById('disabledLettersDisplay').textContent = 
        disabledLetters.length > 0 ? disabledLetters.join(', ') : '-';
    
    // Creator
    document.getElementById('creatorDisplay').textContent = settings.createdBy || '-';
}

// Setup real-time listeners
function setupRealtimeListeners(gameId) {
    console.log("Postavljanje real-time listenera za igru:", gameId);
    const gameRef = firebase.database().ref('games/' + gameId);
    
    // Listen for players changes
    console.log("Postavljanje listenera za promene igrača...");
    gameRef.child('players').on('value', (snapshot) => {
        console.log("Primljena promena igrača:", snapshot.val());
        playersData = snapshot.val() || {};
        updatePlayersList();
        checkGameStart();
    }, (error) => {
        console.error("Greška pri slušanju promena igrača:", error);
    });
    
    // Listen for game status changes
    console.log("Postavljanje listenera za promene statusa igre...");
    gameRef.child('settings/status').on('value', (snapshot) => {
        const status = snapshot.val();
        console.log("Primljena promena statusa igre:", status);
        
        if (status === 'active') {
            // Game has started, redirect to game page
            window.location.href = 'game.html?gameId=' + gameId;
        }
    }, (error) => {
        console.error("Greška pri slušanju promena statusa igre:", error);
    });
}

// Update players list
function updatePlayersList() {
    const playersList = document.getElementById('playersList');
    const playerCount = document.getElementById('playerCount');
    
    if (!playersList || !playerCount) {
        console.error("Elementi za prikaz igrača nisu pronađeni!");
        return;
    }
    
    // Clear players list
    playersList.innerHTML = '';
    
    // Count players
    const players = Object.values(playersData);
    console.log("Ažuriranje liste igrača, pronađeno:", players.length, "igrača");
    console.log("Podaci o igračima:", playersData);
    playerCount.textContent = players.length + '/10';
    
    // Sort players: first creator, then ready players, then others
    players.sort((a, b) => {
        if (a.isCreator && !b.isCreator) return -1;
        if (!a.isCreator && b.isCreator) return 1;
        if (a.isReady && !b.isReady) return -1;
        if (!a.isReady && b.isReady) return 1;
        return 0;
    });
    
    // Add each player to the list
    players.forEach(player => {
        console.log("Dodajem igrača u listu:", player.username, "spreman:", player.isReady);
        // Create player progress element
        const playerItem = document.createElement('div');
        playerItem.className = 'd-flex justify-content-between align-items-center mb-2';
        
        // Player name and status
        const nameContainer = document.createElement('div');
        nameContainer.className = 'd-flex align-items-center';
        
        const statusIndicator = document.createElement('span');
        statusIndicator.className = 'player-status ' + (player.isReady ? 'status-ready' : 'status-not-ready');
        
        const playerName = document.createElement('span');
        playerName.className = 'ms-2';
        playerName.textContent = player.username;
        
        if (player.isCreator) {
            const creatorBadge = document.createElement('span');
            creatorBadge.className = 'badge bg-neon ms-2';
            creatorBadge.textContent = 'Kreator';
            playerName.appendChild(creatorBadge);
        }
        
        nameContainer.appendChild(statusIndicator);
        nameContainer.appendChild(playerName);
        
        // Ready status text
        const readyStatus = document.createElement('span');
        readyStatus.className = player.isReady ? 'text-success' : 'text-danger';
        readyStatus.textContent = player.isReady ? 'Spreman' : 'Nije spreman';
        
        playerItem.appendChild(nameContainer);
        playerItem.appendChild(readyStatus);
        
        playersList.appendChild(playerItem);
        
        // Highlight current player
        if (player.username === currentUser.username) {
            playerItem.classList.add('current-player');
            playerItem.style.backgroundColor = 'rgba(0, 255, 204, 0.1)';
            playerItem.style.borderLeft = '3px solid var(--accent-teal)';
            playerItem.style.paddingLeft = '5px';
        }
    });
}
    
    // Add each player to the list
    players.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = 'd-flex justify-content-between align-items-center mb-2';
        
        // Player name and status
        const nameContainer = document.createElement('div');
        nameContainer.className = 'd-flex align-items-center';
        
        const statusIndicator = document.createElement('span');
        statusIndicator.className = 'player-status ' + (player.isReady ? 'status-ready' : 'status-not-ready');
        
        const playerName = document.createElement('span');
        playerName.className = 'ms-2';
        playerName.textContent = player.username;
        
        if (player.isCreator) {
            const creatorBadge = document.createElement('span');
            creatorBadge.className = 'badge bg-neon ms-2';
            creatorBadge.textContent = 'Kreator';
            playerName.appendChild(creatorBadge);
        }
        
        nameContainer.appendChild(statusIndicator);
        nameContainer.appendChild(playerName);
        
        // Ready status text
        const readyStatus = document.createElement('span');
        readyStatus.className = player.isReady ? 'text-success' : 'text-danger';
        readyStatus.textContent = player.isReady ? 'Spreman' : 'Nije spreman';
        
        playerItem.appendChild(nameContainer);
        playerItem.appendChild(readyStatus);
        
        playersList.appendChild(playerItem);
        
        // Highlight current player
        if (player.username === currentUser.username) {
            playerItem.classList.add('current-player');
            playerItem.style.backgroundColor = 'rgba(0, 255, 204, 0.1)';
            playerItem.style.borderLeft = '3px solid var(--accent-teal)';
            playerItem.style.paddingLeft = '5px';
        }
