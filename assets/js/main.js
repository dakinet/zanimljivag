// Global variables
let currentUser = null;
let currentGameId = null;

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    // Check for stored user
    const storedUser = localStorage.getItem('zgUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
    
    // Initialize UI elements based on page
    initUIElements();
    
    // Check if we're on a game page and have a game ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('gameId')) {
        currentGameId = urlParams.get('gameId');
        localStorage.setItem('zgGameId', currentGameId);
    } else if (localStorage.getItem('zgGameId')) {
        currentGameId = localStorage.getItem('zgGameId');
    }
});

// Initialize UI Elements
function initUIElements() {
    // Homepage elements
    const createGameBtn = document.getElementById('createGameBtn');
    const joinGameBtn = document.getElementById('joinGameBtn');
    const submitJoinBtn = document.getElementById('submitJoinBtn');
    const joinGameSection = document.getElementById('joinGameSection');
    const usernameInput = document.getElementById('username');
    const playerForm = document.getElementById('playerForm');
    
    if (createGameBtn) {
        createGameBtn.addEventListener('click', () => {
            if (validateUsername()) {
                createGame();
            }
        });
    }
    
    if (joinGameBtn) {
        joinGameBtn.addEventListener('click', () => {
            if (validateUsername()) {
                joinGameSection.classList.remove('d-none');
            }
        });
    }
    
    if (submitJoinBtn) {
        submitJoinBtn.addEventListener('click', () => {
            joinGame();
        });
    }
    
    // Game lobby elements initialization
    initLobbyElements();
    
    // Game page elements initialization
    initGameElements();
    
    // Results page elements initialization
    initResultsElements();
}

// Validate username
function validateUsername() {
    const usernameInput = document.getElementById('username');
    
    if (!usernameInput) return true; // Not on a page with username input
    
    const username = usernameInput.value.trim();
    
    if (username.length < 3 || username.length > 15) {
        usernameInput.classList.add('is-invalid');
        return false;
    }
    
    // Store user
    currentUser = {
        username: username,
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('zgUser', JSON.stringify(currentUser));
    usernameInput.classList.remove('is-invalid');
    return true;
}

// Initialize Firebase (to be implemented in firebase-config.js)
function initFirebase() {
    // This will be implemented in firebase-config.js
}

// Create a new game
function createGame() {
    // Redirect to create game page
    window.location.href = 'create-game.html';
}

// Join an existing game
function joinGame() {
    const gameCodeInput = document.getElementById('gameCode');
    
    if (!gameCodeInput) return;
    
    const gameCode = gameCodeInput.value.trim();
    
    if (gameCode.length === 0) {
        gameCodeInput.classList.add('is-invalid');
        return;
    }
    
    // Check if game exists
    firebase.database().ref('games/' + gameCode).once('value', (snapshot) => {
        if (snapshot.exists()) {
            // Game exists, join it
            currentGameId = gameCode;
            localStorage.setItem('zgGameId', currentGameId);
            
            // Add player to game
            addPlayerToGame(currentGameId, currentUser);
            
            // Redirect to lobby
            window.location.href = 'lobby.html?gameId=' + currentGameId;
        } else {
            // Game doesn't exist
            gameCodeInput.classList.add('is-invalid');
            showToast('Igra sa unetim kodom ne postoji.');
        }
    });
}

// Add player to game
function addPlayerToGame(gameId, user) {
    const playerRef = firebase.database().ref('games/' + gameId + '/players/' + generatePlayerId(user.username));
    
    playerRef.set({
        username: user.username,
        isReady: false,
        isFinished: false,
        joinedAt: firebase.database.ServerValue.TIMESTAMP,
        totalScore: 0
    });
}

// Generate a player ID
function generatePlayerId(username) {
    return username.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36);
}

// Initialize lobby elements
function initLobbyElements() {
    const readyBtn = document.getElementById('readyBtn');
    const playersList = document.getElementById('playersList');
    const copyGameIdBtn = document.getElementById('copyGameIdBtn');
    
    if (readyBtn) {
        readyBtn.addEventListener('click', toggleReady);
    }
    
    if (copyGameIdBtn) {
        copyGameIdBtn.addEventListener('click', copyGameIdToClipboard);
    }
    
    if (playersList && currentGameId) {
        // Set up realtime listener for players
        firebase.database().ref('games/' + currentGameId + '/players').on('value', (snapshot) => {
            updatePlayersList(snapshot.val());
        });
    }
}

// Toggle player ready status
function toggleReady() {
    const readyBtn = document.getElementById('readyBtn');
    
    if (!readyBtn || !currentGameId || !currentUser) return;
    
    const isReady = readyBtn.classList.contains('ready');
    const playerId = generatePlayerId(currentUser.username);
    
    firebase.database().ref('games/' + currentGameId + '/players/' + playerId + '/isReady').set(!isReady);
    
    // Update button state
    if (isReady) {
        readyBtn.classList.remove('ready', 'btn-success');
        readyBtn.classList.add('btn-outline-success');
        readyBtn.textContent = 'Spremi se';
    } else {
        readyBtn.classList.add('ready', 'btn-success');
        readyBtn.classList.remove('btn-outline-success');
        readyBtn.textContent = 'Spreman!';
        
        // Add pulsing animation
        readyBtn.classList.add('pulse-animation');
    }
}

// Update players list in lobby
function updatePlayersList(players) {
    const playersList = document.getElementById('playersList');
    
    if (!playersList) return;
    
    playersList.innerHTML = '';
    
    let allReady = true;
    let playerCount = 0;
    
    for (const playerId in players) {
        const player = players[playerId];
        playerCount++;
        
        const playerItem = document.createElement('div');
        playerItem.classList.add('player-item', 'd-flex', 'align-items-center', 'mb-2');
        
        // Status indicator
        const statusIndicator = document.createElement('span');
        statusIndicator.classList.add('player-status');
        statusIndicator.classList.add(player.isReady ? 'status-ready' : 'status-not-ready');
        
        // Player name
        const playerName = document.createElement('span');
        playerName.textContent = player.username;
        
        playerItem.appendChild(statusIndicator);
        playerItem.appendChild(playerName);
        
        playersList.appendChild(playerItem);
        
        if (!player.isReady) {
            allReady = false;
        }
    }
    
    // Check if game can start
    const minPlayers = 2;
    if (allReady && playerCount >= minPlayers) {
        startGameCountdown();
    }
}

// Start game countdown
function startGameCountdown() {
    const countdownEl = document.getElementById('countdown');
    const countdownContainer = document.getElementById('countdownContainer');
    
    if (!countdownEl || !countdownContainer) return;
    
    countdownContainer.classList.remove('d-none');
    
    let count = 5;
    countdownEl.textContent = count;
    
    const countInterval = setInterval(() => {
        count--;
        countdownEl.textContent = count;
        
        if (count <= 0) {
            clearInterval(countInterval);
            
            // Start game
            startGame();
        }
    }, 1000);
}

// Start the game
function startGame() {
    if (!currentGameId) return;
    
    // Update game status
    firebase.database().ref('games/' + currentGameId + '/settings/status').set('active');
    
    // Create first round
    createNewRound(currentGameId, 1);
    
    // Redirect to game page
    window.location.href = 'game.html?gameId=' + currentGameId;
}

// Create a new round
function createNewRound(gameId, roundNumber) {
    const roundRef = firebase.database().ref('games/' + gameId + '/rounds/' + roundNumber);
    
    // Get settings to get disabled letters
    firebase.database().ref('games/' + gameId + '/settings').once('value', (snapshot) => {
        const settings = snapshot.val();
        const disabledLetters = settings.disabledLetters || [];
        
        // Generate random letter (excluding disabled)
        const letter = generateRandomLetter(disabledLetters);
        
        roundRef.set({
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

// Copy game ID to clipboard
function copyGameIdToClipboard() {
    const gameIdEl = document.getElementById('gameId');
    
    if (!gameIdEl) return;
    
    const gameId = gameIdEl.textContent;
    
    navigator.clipboard.writeText(gameId)
        .then(() => {
            showToast('Kod igre je kopiran u clipboard.');
        })
        .catch(err => {
            console.error('Nije moguće kopirati kod: ', err);
        });
}

// Show toast message
function showToast(message) {
    const toastContainer = document.getElementById('toastContainer');
    
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
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 3000
    });
    
    bsToast.show();
}

// Initialize game elements
function initGameElements() {
    // Will be implemented in game.js
}

// Initialize results elements
function initResultsElements() {
    // Will be implemented in results.js
}
