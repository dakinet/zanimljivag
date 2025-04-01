// assets/js/final-results.js
// Handle the display of final game results

// Game variables
let gameData = null;
let currentUser = null;
let currentPlayerId = null;
let allPlayersData = {};
let playerScores = [];
let totalRounds = 0;

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    // Get game ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('gameId') || localStorage.getItem('zgGameId');
    
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
    
    // Setup event listeners
    setupEventListeners();
    
    // Load game data
    loadGameData(gameId);
});

// Generate player ID
function generatePlayerId(username) {
    // Find the existing player ID in the game data
    if (gameData && gameData.players) {
        for (const pid in gameData.players) {
            if (gameData.players[pid].username === username) {
                return pid;
            }
        }
    }
    
    // Fallback to basic ID
    return username.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

// Setup event listeners
function setupEventListeners() {
    // Play again button
    const playAgainBtn = document.getElementById('playAgainBtn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', startNewGame);
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
        
        // Get game settings
        const settings = gameData.settings;
        if (settings) {
            totalRounds = settings.totalRounds;
        }
        
        // Get all players
        allPlayersData = gameData.players || {};
        
        // Collect all player scores
        collectPlayerScores();
        
        // Display final results
        displayFinalResults();
        
        // Play victory sound and show confetti for winner
        playVictoryEffects();
    }).catch(error => {
        console.error('Error loading game:', error);
        alert('Došlo je do greške pri učitavanju igre.');
    });
}

// Collect all player scores
function collectPlayerScores() {
    playerScores = [];
    
    // Get player data
    for (const playerId in allPlayersData) {
        const player = allPlayersData[playerId];
        
        // Add player to scores array
        playerScores.push({
            id: playerId,
            name: player.username,
            totalScore: player.totalScore || 0,
            roundScores: {}
        });
    }
    
    // Collect round scores
    if (gameData.rounds) {
        for (let round = 1; round <= totalRounds; round++) {
            if (gameData.rounds[round] && gameData.rounds[round].scores) {
                const roundScores = gameData.rounds[round].scores;
                
                // Add round scores to each player
                for (const playerId in roundScores) {
                    const playerIndex = playerScores.findIndex(p => p.id === playerId);
                    
                    if (playerIndex !== -1) {
                        playerScores[playerIndex].roundScores[round] = roundScores[playerId];
                    }
                }
            }
        }
    }
    
    // Sort players by total score
    playerScores.sort((a, b) => b.totalScore - a.totalScore);
}

// Display final results
function displayFinalResults() {
    // Set podium winners
    if (playerScores.length >= 1) {
        document.getElementById('firstPlaceName').textContent = playerScores[0].name;
        document.getElementById('firstPlaceAvatar').textContent = getPlayerInitial(playerScores[0].name);
    }
    
    if (playerScores.length >= 2) {
        document.getElementById('secondPlaceName').textContent = playerScores[1].name;
        document.getElementById('secondPlaceAvatar').textContent = getPlayerInitial(playerScores[1].name);
    }
    
    if (playerScores.length >= 3) {
        document.getElementById('thirdPlaceName').textContent = playerScores[2].name;
        document.getElementById('thirdPlaceAvatar').textContent = getPlayerInitial(playerScores[2].name);
    }
    
    // Build results table
    buildResultsTable();
}

// Build results table
function buildResultsTable() {
    const tableHeader = document.querySelector('.table thead tr');
    const tableBody = document.getElementById('resultsTable');
    
    if (!tableHeader || !tableBody) return;
    
    // Add round headers
    for (let round = 1; round <= totalRounds; round++) {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = `Runda ${round}`;
        tableHeader.appendChild(th);
    }
    
    // Add players to table
    playerScores.forEach((player, index) => {
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
        
        // Total score
        const totalScoreCell = document.createElement('td');
        totalScoreCell.className = 'fw-bold text-neon';
        totalScoreCell.textContent = player.totalScore;
        
        // Add cells to row
        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(totalScoreCell);
        
        // Add round scores
        for (let round = 1; round <= totalRounds; round++) {
            const scoreCell = document.createElement('td');
            const roundScore = player.roundScores[round] || 0;
            
            // Style based on score
            if (roundScore > 70) {
                scoreCell.className = 'text-success';
            } else if (roundScore > 40) {
                scoreCell.className = 'text-warning';
            } else {
                scoreCell.className = 'text-danger';
            }
            
            scoreCell.textContent = roundScore;
            row.appendChild(scoreCell);
        }
        
        // Add row to table
        tableBody.appendChild(row);
    });
}

// Get player initial for avatar
function getPlayerInitial(name) {
    return name.charAt(0).toUpperCase();
}

// Play victory effects for winner
function playVictoryEffects() {
    // Only show effects if there's at least one player
    if (playerScores.length === 0) return;
    
    // Check if current player is the winner
    const isWinner = playerScores[0].id === currentPlayerId;
    
    // Play sound (everyone hears it)
    const victorySound = new Audio('assets/sounds/victory.mp3');
    victorySound.play().catch(error => {
        // Ignore errors - sound might not be available
        console.log('Sound not available:', error);
    });
    
    // Show confetti for winner only
    if (isWinner) {
        showConfetti();
    }
}

// Show confetti animation
function showConfetti() {
    // Create confetti container
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);
    
    // Generate confetti pieces
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Random confetti style
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.backgroundColor = getRandomColor();
        
        confettiContainer.appendChild(confetti);
    }
    
    // Remove confetti after animation
    setTimeout(() => {
        confettiContainer.remove();
    }, 6000);
}

// Get random confetti color
function getRandomColor() {
    const colors = [
        '#00FFCC', // Teal
        '#9B59B6', // Purple
        '#FFC107', // Gold
        '#E74C3C', // Red
        '#2ECC71', // Green
        '#3498DB'  // Blue
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
}

// Start a new game with the same players
function startNewGame() {
    // Reset all player scores and ready status
    for (const playerId in allPlayersData) {
        const playerRef = firebase.database().ref(`games/${gameData.id}/players/${playerId}`);
        
        playerRef.update({
            totalScore: 0,
            isReady: false
        });
    }
    
    // Clear all rounds
    firebase.database().ref(`games/${gameData.id}/rounds`).remove();
    
    // Set game status back to lobby
    firebase.database().ref(`games/${gameData.id}/settings/status`).set('lobby');
    
    // Redirect to lobby
    window.location.href = `lobby.html?gameId=${gameData.id}`;
}
