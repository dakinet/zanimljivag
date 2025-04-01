// assets/js/verify.js
// Handle the verification of all players' answers

// Game variables
let gameData = null;
let currentUser = null;
let currentPlayerId = null;
let roundData = null;
let currentRound = 1;
let currentLetter = '';
let totalRounds = 5;
let allPlayersData = {};
let verificationData = {};

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
    // Confirm verification button
    const confirmVerificationBtn = document.getElementById('confirmVerificationBtn');
    if (confirmVerificationBtn) {
        confirmVerificationBtn.addEventListener('click', confirmVerification);
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
            
            // Load answers for verification
            loadAnswersForVerification();
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

// Load answers for verification
function loadAnswersForVerification() {
    if (!roundData || !roundData.answers) {
        alert('Nema odgovora za verifikaciju.');
        return;
    }
    
    const answers = roundData.answers;
    
    // Build verification table
    buildVerificationTable(answers);
}

// Build verification table
function buildVerificationTable(answers) {
    const verificationTable = document.getElementById('verificationTable');
    const tableHeader = document.querySelector('.verification-table thead tr');
    
    if (!verificationTable || !tableHeader) return;
    
    // Clear existing content
    while (tableHeader.children.length > 1) {
        tableHeader.removeChild(tableHeader.lastChild);
    }
    verificationTable.innerHTML = '';
    
    // Get players who submitted answers
    const playersWithAnswers = [];
    for (const playerId in answers) {
        if (answers[playerId].isFinished) {
            const playerData = allPlayersData[playerId];
            if (playerData) {
                playersWithAnswers.push({
                    id: playerId,
                    name: playerData.username,
                    answers: answers[playerId]
                });
            }
        }
    }
    
    // Sort players by name
    playersWithAnswers.sort((a, b) => a.name.localeCompare(b.name));
    
    // Add player headers
    playersWithAnswers.forEach(player => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = player.name;
        tableHeader.appendChild(th);
    });
    
    // Categories to verify
    const categories = [
        { id: 'flag', name: 'Zastava države' },
        { id: 'country', name: 'Država' },
        { id: 'city', name: 'Grad' },
        { id: 'mountain', name: 'Planina' },
        { id: 'river', name: 'Reka' },
        { id: 'lake', name: 'Jezero' },
        { id: 'sea', name: 'More' },
        { id: 'plant', name: 'Biljka' },
        { id: 'animal', name: 'Životinja' },
        { id: 'object', name: 'Predmet' }
    ];
    
    // Create a row for each category
    categories.forEach(category => {
        const row = document.createElement('tr');
        
        // Category name
        const categoryCell = document.createElement('td');
        categoryCell.textContent = category.name;
        row.appendChild(categoryCell);
        
        // Player answers
        playersWithAnswers.forEach(player => {
            const answerCell = document.createElement('td');
            let answerValue = player.answers[category.id] || '';
            
            // Special handling for flags
            if (category.id === 'flag' && answerValue) {
                const flagData = flagsData[answerValue];
                if (flagData) {
                    // Create a flag image and name
                    const flagContainer = document.createElement('div');
                    flagContainer.className = 'd-flex align-items-center';
                    
                    const flagImg = document.createElement('img');
                    flagImg.src = `assets/flags/${answerValue.toLowerCase()}.gif`;
                    flagImg.alt = flagData.name;
                    flagImg.style.width = '30px';
                    flagImg.style.marginRight = '8px';
                    
                    const flagName = document.createElement('span');
                    flagName.textContent = flagData.name;
                    
                    flagContainer.appendChild(flagImg);
                    flagContainer.appendChild(flagName);
                    
                    answerCell.appendChild(flagContainer);
                    answerValue = flagData.name; // Set the text value for verification
                } else {
                    answerValue = ''; // Invalid flag code
                }
            } else {
                answerCell.textContent = answerValue;
            }
            
            // Add checkbox for verification
            if (answerValue.trim() !== '') {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'form-check-input verification-checkbox ms-2';
                checkbox.dataset.playerId = player.id;
                checkbox.dataset.category = category.id;
                checkbox.checked = true; // Default to checked (correct)
                
                // Store in verificationData
                if (!verificationData[player.id]) {
                    verificationData[player.id] = {};
                }
                verificationData[player.id][category.id] = true;
                
                // Add event listener
                checkbox.addEventListener('change', (e) => {
                    verificationData[player.id][category.id] = e.target.checked;
                });
                
                answerCell.appendChild(checkbox);
            }
            
            row.appendChild(answerCell);
        });
        
        verificationTable.appendChild(row);
    });
}

// Confirm verification and calculate scores
function confirmVerification() {
    if (Object.keys(verificationData).length === 0) {
        alert('Nema podataka za verifikaciju.');
        return;
    }
    
    // Reference to verification data in Firebase
    const verificationRef = firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/verification`);
    
    // Set verification data
    verificationRef.set({
        verifiedBy: currentPlayerId,
        verifiedAt: firebase.database.ServerValue.TIMESTAMP,
        ...verificationData
    }).then(() => {
        // Calculate and save scores
        calculateScores();
    }).catch(error => {
        console.error('Error saving verification:', error);
        alert('Došlo je do greške pri čuvanju verifikacije.');
    });
}

// Calculate scores based on verification
function calculateScores() {
    const scoresRef = firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/scores`);
    const playerScores = {};
    
    // Calculate score for each player
    for (const playerId in verificationData) {
        let playerScore = 0;
        
        // 10 points for each correct answer
        for (const category in verificationData[playerId]) {
            if (verificationData[playerId][category]) {
                playerScore += 10;
            }
        }
        
        playerScores[playerId] = playerScore;
        
        // Update player's total score
        updatePlayerTotalScore(playerId, playerScore);
    }
    
    // Save round scores
    scoresRef.set(playerScores).then(() => {
        // Redirect to results page
        window.location.href = `round-results.html?gameId=${gameData.id}&round=${currentRound}`;
    }).catch(error => {
        console.error('Error saving scores:', error);
        alert('Došlo je do greške pri čuvanju rezultata.');
    });
}

// Update player's total score
function updatePlayerTotalScore(playerId, roundScore) {
    const playerRef = firebase.database().ref(`games/${gameData.id}/players/${playerId}`);
    
    playerRef.once('value', (snapshot) => {
        const playerData = snapshot.val();
        if (playerData) {
            const currentTotalScore = playerData.totalScore || 0;
            const newTotalScore = currentTotalScore + roundScore;
            
            playerRef.update({
                totalScore: newTotalScore
            });
        }
    });
}
