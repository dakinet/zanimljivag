// assets/js/voting.js
// Shared voting system for all players after each round

// Game variables
let gameData = null;
let votingUser = null;
let currentPlayerId = null;
let roundData = null;
let currentRound = 1;
let currentLetter = '';
let totalRounds = 5;
let allPlayersData = {};
let votingData = {};
let allVotesSubmitted = false;

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("Voting.js učitan");
    
    // Get game ID and round from URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('gameId') || localStorage.getItem('zgGameId');
    currentRound = parseInt(urlParams.get('round')) || 1;
    
    console.log("Voting stranica za igru:", gameId, "runda:", currentRound);
    
    if (!gameId) {
        // No game ID, redirect to home
        alert('Nedostaje ID igre.');
        window.location.href = 'index.html';
        return;
    }
    
    // Get current user from localStorage
    const userJSON = localStorage.getItem('zgUser');
    
    if (!userJSON) {
        // No user, redirect to home
        alert('Niste prijavljeni.');
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = JSON.parse(userJSON);
    console.log("Korisnik za glasanje:", currentUser.username);
    
    // Show loading indicator
    showLoadingIndicator("Učitavanje podataka...");
    
    // Setup event listeners
    setupEventListeners();
    
    // Load game data
    loadGameData(gameId);
});

function showLoadingIndicator(message) {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.className = 'loading-overlay';
    
    loadingOverlay.innerHTML = `
        <div class="loading-content bg-dark-secondary p-4 rounded shadow-neon text-center">
            <h3 class="text-light mb-3">Molimo sačekajte</h3>
            <p class="text-light mb-4">${message}</p>
            <div class="spinner-border text-neon" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(loadingOverlay);
}

// Hide loading indicator
function hideLoadingIndicator() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

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
    // Confirm voting button
    const confirmVotingBtn = document.getElementById('confirmVotingBtn');
    if (confirmVotingBtn) {
        confirmVotingBtn.addEventListener('click', confirmVoting);
    }
}

// Load game data
function loadGameData(gameId) {
    console.log("Učitavanje podataka igre za glasanje...");
    const gameRef = firebase.database().ref('games/' + gameId);
    
    // Check if game exists
    gameRef.once('value', (snapshot) => {
        if (!snapshot.exists()) {
            // Game doesn't exist, redirect to home
            hideLoadingIndicator();
            alert('Igra sa tim kodom ne postoji.');
            window.location.href = 'index.html';
            return;
        }
        
        gameData = snapshot.val();
        gameData.id = gameId;
        
        console.log("Podaci igre učitani:", gameData);
        
        // Set currentPlayerId based on username
        if (gameData.players) {
            for (const pid in gameData.players) {
                if (gameData.players[pid].username === currentUser.username) {
                    currentPlayerId = pid;
                    console.log("Set currentPlayerId:", currentPlayerId);
                    break;
                }
            }
        }
        
        // If player ID still not found, create one
        if (!currentPlayerId) {
            currentPlayerId = generatePlayerId(currentUser.username);
            console.log("Generated currentPlayerId:", currentPlayerId);
        }
        
        // Get game settings
        const settings = gameData.settings || {};
        if (settings) {
            totalRounds = settings.totalRounds || 5;
            
            // Update UI
            document.getElementById('totalRounds').textContent = totalRounds;
            
            // Update game info in UI
            updateGameInfo(settings);
        }
        
        // Get round data
        if (gameData.rounds && gameData.rounds[currentRound]) {
            roundData = gameData.rounds[currentRound];
            currentLetter = roundData.letter || 'A';
            
            // Update UI
            document.getElementById('currentLetter').textContent = currentLetter;
            
            // Get all players
            allPlayersData = gameData.players || {};
            
            // Hide loading indicator
            hideLoadingIndicator();
            
            // Check if player has already voted
            checkIfAlreadyVoted();
            
            // Set up real-time listeners for new votes
            setupVotesListener(gameId);
        } else {
            // Round doesn't exist
            console.error("Runda ne postoji u podacima igre!");
            hideLoadingIndicator();
            alert('Runda ne postoji.');
            window.location.href = 'index.html';
        }
    }).catch(error => {
        console.error('Error loading game:', error);
        hideLoadingIndicator();
        alert('Došlo je do greške pri učitavanju igre.');
    });
}

// Update game info in UI
function updateGameInfo(settings) {
    // Update round info
    const roundInfoElement = document.getElementById('roundInfo');
    if (roundInfoElement) {
        roundInfoElement.textContent = `Runda ${currentRound}/${totalRounds}`;
    }
    
    // Update letter
    const letterElement = document.getElementById('currentLetter');
    if (letterElement && currentLetter) {
        letterElement.textContent = currentLetter;
    }
    
    // Update creator if available
    const creatorElement = document.getElementById('creatorInfo');
    if (creatorElement && settings.createdBy) {
        creatorElement.textContent = `Kreator: ${settings.createdBy}`;
    }
    
    // Update player count
    const playerCountElement = document.getElementById('playerCountInfo');
    if (playerCountElement && allPlayersData) {
        const playerCount = Object.keys(allPlayersData).length;
        playerCountElement.textContent = `Igrači: ${playerCount}`;
    }
}

// Check if the current player has already voted
function checkIfAlreadyVoted() {
    // First make sure the votes node exists
    if (!roundData.votes) {
        // No votes yet, initialize the votes for this round
        firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/votes`).set({});
    }
    
    // Check if player has already voted
    firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/votes/${currentPlayerId}`).once('value', (snapshot) => {
        if (snapshot.exists() && snapshot.val()) {
            console.log("Player has already voted, waiting for others");
            // Show waiting message and disable voting
            document.getElementById('votingContainer').innerHTML = `
                <div class="text-center">
                    <h3 class="text-light mb-4">Već ste glasali!</h3>
                    <p class="text-light">Čekanje na ostale igrače da završe glasanje...</p>
                    <div class="spinner-border text-neon mt-3" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;
            
            // Check if all votes are in
            checkAllVotesSubmitted();
        } else {
            // Player hasn't voted yet, load answers for voting
            loadAnswersForVoting();
        }
    });
}

// Setup a listener for new votes
function setupVotesListener(gameId) {
    const votesRef = firebase.database().ref(`games/${gameId}/rounds/${currentRound}/votes`);
    
    // Listen for any changes to votes
    votesRef.on('value', (snapshot) => {
        console.log("Votes updated, checking if all are in");
        checkAllVotesSubmitted();
    });
}

// Check if all players have submitted their votes
function checkAllVotesSubmitted() {
    // If already determined that all votes are in, skip
    if (allVotesSubmitted) return;
    
    // Get votes data
    const votesRef = firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/votes`);
    votesRef.once('value', (snapshot) => {
        const votes = snapshot.val() || {};
        
        // Get list of active players who have submitted answers
        const activePlayers = [];
        if (roundData.answers) {
            for (const pid in roundData.answers) {
                if (roundData.answers[pid].isFinished) {
                    activePlayers.push(pid);
                }
            }
        }
        
        // Compare voters to active players
        const playersWhoVoted = Object.keys(votes);
        
        console.log("Active players:", activePlayers.length);
        console.log("Players who voted:", playersWhoVoted.length);
        
        // If everyone has voted, calculate final results
        if (playersWhoVoted.length >= activePlayers.length && activePlayers.length > 0) {
            console.log("All votes are in, calculating final results");
            allVotesSubmitted = true;
            calculateFinalResults(votes);
        } else {
            console.log("Still waiting for votes");
            // Update the waiting message if needed
            if (document.getElementById('waitingMessage')) {
                document.getElementById('waitingMessage').textContent = 
                    `Čekanje na glasove... (${playersWhoVoted.length}/${activePlayers.length})`;
            }
        }
    });
}

// Calculate final results based on all votes
function calculateFinalResults(votes) {
    console.log("Calculating final results from all votes");
    
    // Final results object
    const finalResults = {};
    
    // Get all players who submitted answers
    const playersWithAnswers = [];
    if (roundData.answers) {
        for (const pid in roundData.answers) {
            if (roundData.answers[pid].isFinished) {
                playersWithAnswers.push({
                    id: pid,
                    answers: roundData.answers[pid]
                });
            }
        }
    }
    
    // Categories to check
    const categories = [
        'flag', 'country', 'city', 'mountain', 'river', 
        'lake', 'sea', 'plant', 'animal', 'object'
    ];
    
    // For each player's answers
    playersWithAnswers.forEach(player => {
        finalResults[player.id] = {};
        
        // For each category
        categories.forEach(category => {
            // Skip if no answer
            if (!player.answers[category]) {
                finalResults[player.id][category] = false;
                return;
            }
            
            // Count votes for this answer
            let correctVotes = 0;
            let totalVotes = 0;
            
            // Go through each vote
            for (const voterId in votes) {
                if (votes[voterId][player.id] && votes[voterId][player.id][category] !== undefined) {
                    totalVotes++;
                    if (votes[voterId][player.id][category]) {
                        correctVotes++;
                    }
                }
            }
            
            // Majority rules (>50%)
            if (totalVotes > 0) {
                const votePercentage = correctVotes / totalVotes;
                
                if (votePercentage > 0.5) {
                    // Clear majority says correct
                    finalResults[player.id][category] = true;
                } else if (votePercentage === 0.5) {
                    // Exactly 50-50 split, use coin toss
                    finalResults[player.id][category] = Math.random() >= 0.5;
                } else {
                    // Majority says incorrect
                    finalResults[player.id][category] = false;
                }
            } else {
                // No votes, default to false
                finalResults[player.id][category] = false;
            }
        });
    });
    
    console.log("Final results calculated:", finalResults);
    
    // Save final results to Firebase
    saveFinalResults(finalResults);
}

// Save final results to Firebase
function saveFinalResults(finalResults) {
    console.log("Saving final results to Firebase");
    
    // Reference to final results in Firebase
    const finalResultsRef = firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/finalResults`);
    
    // Set final results
    finalResultsRef.set(finalResults)
        .then(() => {
            console.log("Final results saved successfully");
            // Calculate and save scores
            calculateScores(finalResults);
        })
        .catch(error => {
            console.error("Error saving final results:", error);
        });
}

// Calculate scores based on final results
function calculateScores(finalResults) {
    console.log("Calculating scores based on final results");
    
    const scoresRef = firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/scores`);
    const playerScores = {};
    
    // Calculate score for each player
    for (const playerId in finalResults) {
        let playerScore = 0;
        
        // 10 points for each correct answer
        for (const category in finalResults[playerId]) {
            if (finalResults[playerId][category]) {
                playerScore += 10;
            }
        }
        
        playerScores[playerId] = playerScore;
        
        // Update player's total score
        updatePlayerTotalScore(playerId, playerScore);
    }
    
    console.log("Calculated scores:", playerScores);
    
    // Save round scores
    scoresRef.set(playerScores)
        .then(() => {
            console.log("Scores saved successfully");
            // Redirect to results page
            window.location.href = `round-results.html?gameId=${gameData.id}&round=${currentRound}`;
        })
        .catch(error => {
            console.error("Error saving scores:", error);
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

// Load answers for voting
function loadAnswersForVoting() {
    console.log("Loading answers for voting");
    if (!roundData || !roundData.answers) {
        console.error("No answers available for voting");
        return;
    }
    
    const answers = roundData.answers;
    console.log("Answers for voting:", answers);
    
    // Build voting table
    buildVotingTable(answers);
}

// Build voting table
function buildVotingTable(answers) {
    console.log("Building voting table");
    const votingTable = document.getElementById('votingTable');
    const tableHeader = document.querySelector('.voting-table thead tr');
    
    if (!votingTable || !tableHeader) {
        console.error("Voting table elements not found");
        return;
    }
    
    // Clear existing content
    while (tableHeader.children.length > 1) {
        tableHeader.removeChild(tableHeader.lastChild);
    }
    votingTable.innerHTML = '';
    
    // Get players who submitted answers
    const playersWithAnswers = [];
    for (const playerId in answers) {
        if (answers[playerId] && answers[playerId].isFinished) {
            const playerData = allPlayersData[playerId];
            if (playerData) {
                playersWithAnswers.push({
                    id: playerId,
                    name: playerData.username,
                    answers: answers[playerId]
                });
            } else {
                console.log("No data for player:", playerId);
                // Use username from answers if available
                if (answers[playerId].username) {
                    playersWithAnswers.push({
                        id: playerId,
                        name: answers[playerId].username,
                        answers: answers[playerId]
                    });
                }
            }
        }
    }
    
    console.log("Players with answers:", playersWithAnswers);
    
    // Sort players by name
    try {
        playersWithAnswers.sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) {
        console.error("Error sorting players:", e);
    }
    
    // Add player headers
    playersWithAnswers.forEach(player => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = player.name;
        tableHeader.appendChild(th);
    });
    
    // Categories to vote on
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
    
    // Initialize voting data
    votingData = {};
    
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
            
            // Initialize voting data for this player
            if (!votingData[player.id]) {
                votingData[player.id] = {};
            }
            
            // Special handling for flags
            if (category.id === 'flag' && answerValue) {
                const flagData = flagsData ? flagsData[answerValue] : null;
                if (flagData) {
                    // Create a flag image and name
                    const flagContainer = document.createElement('div');
                    flagContainer.className = 'flag-answer-container';
                    
                    const flagImg = document.createElement('img');
                    flagImg.src = `assets/flags/${answerValue.toLowerCase()}-flag.webp`;
                    flagImg.alt = flagData.name;
                    flagImg.style.width = '30px';
                    flagImg.style.marginRight = '8px';
                    
                    const flagName = document.createElement('span');
                    flagName.textContent = flagData.name;
                    flagName.className = 'answer-content';
                    
                    flagContainer.appendChild(flagImg);
                    flagContainer.appendChild(flagName);
                    
                    answerCell.appendChild(flagContainer);
                    answerValue = flagData.name; // Set the text value for voting
                } else {
                    answerValue = ''; // Invalid flag code
                }
            } else {
                // Create a div for the answer content
                const answerText = document.createElement('div');
                answerText.textContent = answerValue;
                answerText.className = 'answer-content';
                answerCell.appendChild(answerText);
            }
            
            // Add voting checkbox
            if (answerValue.trim() !== '') {
                // Create a container for the checkbox to control layout
                const checkboxContainer = document.createElement('div');
                checkboxContainer.className = 'd-inline-block';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'form-check-input voting-checkbox';
                checkbox.dataset.playerId = player.id;
                checkbox.dataset.category = category.id;
                checkbox.checked = true; // Default to checked (correct)
                
                checkboxContainer.appendChild(checkbox);
                answerCell.appendChild(checkboxContainer);
                
                // Store in votingData with default value
                votingData[player.id][category.id] = true;
                
                // Add event listener
                checkbox.addEventListener('change', (e) => {
                    votingData[player.id][category.id] = e.target.checked;
                });
            } else {
                // Empty answer, automatically incorrect
                votingData[player.id][category.id] = false;
            }
            
            row.appendChild(answerCell);
        });
        
        votingTable.appendChild(row);
    });
    
    console.log("Voting table built, initial voting data:", votingData);
}

// Confirm voting
function confirmVoting() {
    console.log("Confirming votes");
    
    // Check if there's voting data
    if (Object.keys(votingData).length === 0) {
        alert('Nema podataka za glasanje.');
        return;
    }
    
    // Disable vote button to prevent double submissions
    const votingButton = document.getElementById('confirmVotingBtn');
    if (votingButton) {
        votingButton.disabled = true;
        votingButton.textContent = "Glasanje se obrađuje...";
    }
    
    // Reference to votes in Firebase
    const votesRef = firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/votes/${currentPlayerId}`);
    
    // Save votes
    votesRef.set(votingData)
        .then(() => {
            console.log("Votes saved successfully");
            // Show waiting screen
            document.getElementById('votingContainer').innerHTML = `
                <div class="text-center">
                    <h3 class="text-light mb-4">Glasanje uspešno!</h3>
                    <p class="text-light" id="waitingMessage">Čekanje na ostale igrače da završe glasanje...</p>
                    <div class="spinner-border text-neon mt-3" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;
            
            // Check if all votes are in
            checkAllVotesSubmitted();
        })
        .catch(error => {
            console.error("Error saving votes:", error);
            alert('Došlo je do greške pri čuvanju glasova.');
            
            // Re-enable voting button
            if (votingButton) {
                votingButton.disabled = false;
                votingButton.textContent = "Potvrdi glasanje";
            }
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