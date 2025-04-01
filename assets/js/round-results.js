// assets/js/round-results.js
// Handle the display of results after each round

// Game variables
let gameData = null;
let currentUser = null;
let currentPlayerId = null;
let roundData = null;
let currentRound = 1;
let currentLetter = '';
let totalRounds = 5;
let allPlayersData = {};
let countdownInterval = null;
let isCreator = false;

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    // Get game ID and round from URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('gameId') || localStorage.getItem('zgGameId');
    currentRound = parseInt(urlParams.get('round')) || 1;
    
    if (!gameId) {
        // No game ID, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    // Get current user from localStorage
    const userJSON = localStorage.getItem('zgUser');
    
    if (!userJSON) {
        // No user, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = JSON.parse(userJSON);
    currentPlayerId = generatePlayerId(currentUser.username);
    
    // Update round number display
    document.getElementById('roundNumber').textContent = currentRound;
    
    // Setup event listeners
    setupEventListeners();
    
    // Load game data
    loadGameData(gameId);
});

// Generate player ID
function generatePlayerId(username) {
    return username.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36);
}

// Setup event listeners
function setupEventListeners() {
    // Next round button
    const nextRoundBtn = document.getElementById('nextRoundBtn');
    if (nextRoundBtn) {
        nextRoundBtn.addEventListener('click', goToNextRound);
    }
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
        gameData.id = gameId;
        
        // Check if current player is creator
        if (gameData.players && gameData.players[currentPlayerId] && gameData.players[currentPlayerId].isCreator) {
            isCreator = true;
        }
        
        // Get game settings
        const settings = gameData.settings;
        if (settings) {
            totalRounds = settings.totalRounds;
            
            // Update UI
            document.getElementById('totalRounds').textContent = totalRounds;
        }
        
        // Get round data
        if (gameData.rounds && gameData.rounds[currentRound]) {
            roundData = gameData.rounds[currentRound];
            currentLetter = roundData.letter;
            
            // Update UI
            document.getElementById('currentLetter').textContent = currentLetter;
            
            // Get all players
            allPlayersData = gameData.players || {};
            
            // Load round results
            loadRoundResults();
            
            // Start countdown for next round
            startNextRoundCountdown();
        } else {
            // Round doesn't exist
            alert('Runda ne postoji.');
            window.location.href = 'index.html';
        }
    }).catch(error => {
        console.error('Error loading game:', error);
        alert('Došlo je do greške pri učitavanju igre.');
    });
}

// Load round results
function loadRoundResults() {
    if (!roundData || !roundData.scores) {
        alert('Nema rezultata za ovu rundu.');
        return;
    }
    
    const scores = roundData.scores;
    
    // Prepare player results
    const playerResults = [];
    
    for (const playerId in scores) {
        const playerData = allPlayersData[playerId];
        
        if (playerData) {
            playerResults.push({
                id: playerId,
                name: playerData.username,
                roundScore: scores[playerId],
                totalScore: playerData.totalScore || 0
            });
        }
    }
    
    // Sort players by total score
    playerResults.sort((a, b) => b.totalScore - a.totalScore);
    
    // Display results
    displayResults(playerResults);
}

// Display results in the table
function displayResults(playerResults) {
    const resultsTable = document.getElementById('resultsTable');
    
    if (!resultsTable) return;
    
    // Clear existing content
    resultsTable.innerHTML = '';
    
    // Add each player to the table
    playerResults.forEach((player, index) => {
        const row = document.createElement('tr');
        
        // Highlight current player
        if (player.id === currentPlayerId) {
            row.classList.add('table-primary');
        }
        
        // Rank
        const rankCell = document.createElement('td');
        rankCell.textContent = index + 1;
        
        // Add medal for top 3
        if (index < 3) {
            const medalClasses = ['text-warning', 'text-secondary', 'text-danger'];
            const medalIcons = ['fa-trophy', 'fa-medal', 'fa-medal'];
            
            const medalIcon = document.createElement('i');
            medalIcon.className = `fas ${medalIcons[index]} ${medalClasses[index]} me-1`;
            
            rankCell.prepend(medalIcon);
        }
        
        // Player name
        const nameCell = document.createElement('td');
        nameCell.textContent = player.name;
        
        // Round score with animation
        const roundScoreCell = document.createElement('td');
        roundScoreCell.className = 'round-score';
        roundScoreCell.textContent = '0';
        
        // Animate round score counting up
        setTimeout(() => {
            animateNumber(roundScoreCell, 0, player.roundScore, 1000);
        }, 500 + index * 200);
        
        // Total score with animation
        const totalScoreCell = document.createElement('td');
        totalScoreCell.className = 'total-score';
        totalScoreCell.textContent = '0';
        
        // Animate total score counting up
        setTimeout(() => {
            animateNumber(totalScoreCell, 0, player.totalScore, 1500);
        }, 1000 + index * 200);
        
        // Add cells to row
        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(roundScoreCell);
        row.appendChild(totalScoreCell);
        
        // Add row to table
        resultsTable.appendChild(row);
    });
}

// Animate number counting up
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const currentValue = Math.floor(start + progress * (end - start));
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Start countdown for next round
function startNextRoundCountdown() {
    const countdownElement = document.getElementById('countdown');
    const countdownContainer = document.getElementById('nextRoundCountdown');
    
    if (!countdownElement || !countdownContainer) return;
    
    countdownContainer.classList.remove('d-none');
    
    let secondsLeft = 10;
    countdownElement.textContent = secondsLeft;
    
    countdownInterval = setInterval(() => {
        secondsLeft--;
        countdownElement.textContent = secondsLeft;
        
        if (secondsLeft <= 0) {
            clearInterval(countdownInterval);
            
            // Go to next round
            goToNextRound();
        }
    }, 1000);
}

// Go to next round
function goToNextRound() {
    // Clear countdown if running
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Check if this was the last round
    if (currentRound >= totalRounds) {
        // Go to final results
        window.location.href = `final-results.html?gameId=${gameData.id}`;
        return;
    }
    
    // Only creator will create the next round
    if (isCreator) {
        // Create next round
        createNextRound();
    } else {
        // Non-creators will just go to the game page
        window.location.href = `game.html?gameId=${gameData.id}`;
    }
}

// Create next round
function createNextRound() {
    const nextRound = currentRound + 1;
    
    createNewRound(gameData.id, nextRound)
        .then(() => {
            // Go to game page
            window.location.href = `game.html?gameId=${gameData.id}`;
        })
        .catch(error => {
            console.error('Error creating next round:', error);
            alert('Došlo je do greške pri kreiranju sledeće runde.');
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
            
            // Get previously used letters
            const usedLetters = [];
            for (let i = 1; i < roundNumber; i++) {
                if (gameData.rounds && gameData.rounds[i] && gameData.rounds[i].letter) {
                    usedLetters.push(gameData.rounds[i].letter);
                }
            }
            
            // Generate random letter (excluding disabled and used)
            const letter = generateRandomLetter(disabledLetters, usedLetters);
            
            return roundRef.set({
                letter: letter,
                startedAt: firebase.database.ServerValue.TIMESTAMP,
                finishedAt: null
            });
        });
}

// Generate random letter
function generateRandomLetter(disabledLetters, usedLetters) {
    const allLetters = 'ABCČĆDĐEFGHIJKLMNOPRSŠTUVZŽ';
    let availableLetters = '';
    
    for (let i = 0; i < allLetters.length; i++) {
        const letter = allLetters[i];
        if (!disabledLetters.includes(letter) && !usedLetters.includes(letter)) {
            availableLetters += letter;
        }
    }
    
    // If no letters left, use any non-disabled letter
    if (availableLetters.length === 0) {
        for (let i = 0; i < allLetters.length; i++) {
            const letter = allLetters[i];
            if (!disabledLetters.includes(letter)) {
                availableLetters += letter;
            }
        }
    }
    
    const randomIndex = Math.floor(Math.random() * availableLetters.length);
    return availableLetters[randomIndex];
}
