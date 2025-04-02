// assets/js/verify.js
// Handle the verification of all players' answers

// Game variables
let gameData = null;
let verifyUser = null;  
let currentPlayerId = null;
let roundData = null;
let currentRound = 1;
let currentLetter = '';
let totalRounds = 5;
let allPlayersData = {};
let verificationData = {};
let isVerifier = false;

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("Verify.js učitan");
    
    // Get game ID and round from URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('gameId') || localStorage.getItem('zgGameId');
    currentRound = parseInt(urlParams.get('round')) || 1;
    
    console.log("Verify stranica za igru:", gameId, "runda:", currentRound);
    
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
    
    verifyUser = JSON.parse(userJSON);
    console.log("Korisnik za verifikaciju:", verifyUser.username);
    
    // Update round number display
    document.getElementById('roundNumber').textContent = currentRound;
    
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
    // Confirm verification button
    const confirmVerificationBtn = document.getElementById('confirmVerificationBtn');
    if (confirmVerificationBtn) {
        confirmVerificationBtn.addEventListener('click', confirmVerification);
    }
}

// Load game data
function loadGameData(gameId) {
    console.log("Učitavanje podataka igre za verifikaciju...");
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
        
        console.log("Podaci igre učitani:", gameData);
        
        // Set currentPlayerId based on username
        if (gameData.players) {
            for (const pid in gameData.players) {
                if (gameData.players[pid].username === verifyUser.username) {
                    currentPlayerId = pid;
                    console.log("Set currentPlayerId:", currentPlayerId);
                    break;
                }
            }
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
            
            // Check if I should be the verifier
            checkVerifierStatus();
            
            // Set up real-time listeners for new answers
            setupAnswersListener(gameId);
            
            // End the round when timer expires (if I'm the verifier)
            setupTimerExpirationCheck(gameId);
        } else {
            // Round doesn't exist
            console.error("Runda ne postoji u podacima igre!");
            alert('Runda ne postoji.');
            window.location.href = 'index.html';
        }
    }).catch(error => {
        console.error('Error loading game:', error);
        alert('Došlo je do greške pri učitavanju igre.');
    });
}

// Check if the current user should be the verifier
function checkVerifierStatus() {
    // If verification node exists, check if I am the verifier
    if (roundData.verification && roundData.verification.verifiedBy) {
        const verifierPlayerId = roundData.verification.verifiedBy;
        
        if (verifierPlayerId !== currentPlayerId) {
            console.log("This user is not the designated verifier");
            // Instead of redirecting, show a message that they're waiting for verification
            document.getElementById('verificationContainer').innerHTML = `
                <div class="text-center">
                    <h3 class="text-light mb-4">Čekanje na verifikaciju odgovora</h3>
                    <p class="text-light">Igrač ${getVerifierUsername(verifierPlayerId)} verifikuje odgovore...</p>
                    <div class="spinner-border text-neon mt-3" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;
            
            // Listen for when verification is complete
            listenForVerificationComplete();
            return;
        }
    } else {
        // If verification node doesn't exist yet, check if I was first to finish
        if (!roundData.answers) {
            console.log("No answers yet, can't determine verifier");
            window.location.href = `game-play.html?gameId=${gameData.id}`;
            return;
        }
        
        // Get all finished players and their finish times
        const finishedPlayers = [];
        for (const pid in roundData.answers) {
            const playerAnswer = roundData.answers[pid];
            if (playerAnswer && playerAnswer.isFinished && playerAnswer.finishedAt) {
                finishedPlayers.push({
                    id: pid,
                    username: playerAnswer.username || "Unknown",
                    finishedAt: playerAnswer.finishedAt
                });
            }
        }
        
        // Sort by finish time (earliest first)
        finishedPlayers.sort((a, b) => a.finishedAt - b.finishedAt);
        
        if (finishedPlayers.length > 0) {
            const firstPlayer = finishedPlayers[0];
            console.log("First player to finish:", firstPlayer.username);
            
            if (firstPlayer.id !== currentPlayerId) {
                console.log("Not the first player, should not be verifying");
                // Instead of redirecting, show waiting message
                document.getElementById('verificationContainer').innerHTML = `
                    <div class="text-center">
                        <h3 class="text-light mb-4">Čekanje na verifikaciju odgovora</h3>
                        <p class="text-light">Igrač ${firstPlayer.username} verifikuje odgovore...</p>
                        <div class="spinner-border text-neon mt-3" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                `;
                
                // Listen for when verification is complete
                listenForVerificationComplete();
                return;
            } else {
                // I am the first player, set myself as verifier if not already set
                firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/verification`).update({
                    verifiedBy: currentPlayerId,
                    verificationStartedAt: firebase.database.ServerValue.TIMESTAMP
                });
            }
        } else {
            console.log("No finished players found");
            window.location.href = `game-play.html?gameId=${gameData.id}`;
            return;
        }
    }
    
    // If we get here, I am the verifier
    isVerifier = true;
    console.log("User is the designated verifier");
    
    // Load initial answers
    loadAnswersForVerification();
}

// Helper function to get verifier's username
function getVerifierUsername(verifierId) {
    // Try to find username in allPlayersData
    if (allPlayersData[verifierId]) {
        return allPlayersData[verifierId].username || "Nepoznat igrač";
    }
    
    // If not found, try to find in roundData.answers
    if (roundData && roundData.answers && roundData.answers[verifierId]) {
        return roundData.answers[verifierId].username || "Nepoznat igrač";
    }
    
    return "Nepoznat igrač";
}

// Listen for when verification is complete
function listenForVerificationComplete() {
    firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/verification/verifiedAt`).on('value', (snapshot) => {
        if (snapshot.exists() && snapshot.val()) {
            console.log("Verification completed, redirecting to results");
            window.location.href = `round-results.html?gameId=${gameData.id}&round=${currentRound}`;
        }
    });
}


// Setup a listener for new answers
function setupAnswersListener(gameId) {
    if (!isVerifier) return;
    
    const answersRef = firebase.database().ref(`games/${gameId}/rounds/${currentRound}/answers`);
    
    // Listen for any changes to answers
    answersRef.on('value', (snapshot) => {
        console.log("Answers updated, refreshing verification table");
        loadAnswersForVerification();
    });
}

// Setup a check for timer expiration
function setupTimerExpirationCheck(gameId) {
    if (!isVerifier) return;
    
    // Get round start time and time limit
    const startedAt = roundData.startedAt;
    const roundTimeInSeconds = gameData.settings.roundTime * 60;
    
    if (!startedAt) return;
    
    // Calculate when the round should end
    const endTime = startedAt + (roundTimeInSeconds * 1000);
    const now = Date.now();
    
    // If the round should have ended already, mark it as finished
    if (now >= endTime && !roundData.finishedAt) {
        console.log("Round time expired, marking as finished");
        firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/finishedAt`).set(firebase.database.ServerValue.TIMESTAMP);
    } else if (!roundData.finishedAt) {
        // Set a timeout to end the round when the timer expires
        const timeLeft = endTime - now;
        console.log(`Round will auto-end in ${Math.floor(timeLeft/1000)} seconds`);
        
        setTimeout(() => {
            console.log("Timer expired, checking if round is finished");
            firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/finishedAt`).once('value', (snapshot) => {
                if (!snapshot.exists() || !snapshot.val()) {
                    console.log("Round not marked as finished yet, marking now");
                    firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/finishedAt`).set(firebase.database.ServerValue.TIMESTAMP);
                }
            });
        }, timeLeft);
    }
}

// Load answers for verification
function loadAnswersForVerification() {
    console.log("Učitavanje odgovora za verifikaciju...");
    if (!roundData || !gameData.rounds || !gameData.rounds[currentRound] || !gameData.rounds[currentRound].answers) {
        console.error("Nema odgovora za verifikaciju!");
        return;
    }
    
    // Get fresh data
    firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/answers`).once('value', (snapshot) => {
        const answers = snapshot.val() || {};
        console.log("Odgovori za verifikaciju:", answers);
        
        // Build verification table
        buildVerificationTable(answers);
    });
}

// Build verification table
function buildVerificationTable(answers) {
    console.log("Izgradnja tabele za verifikaciju...");
    const verificationTable = document.getElementById('verificationTable');
    const tableHeader = document.querySelector('.verification-table thead tr');
    
    if (!verificationTable || !tableHeader) {
        console.error("Elementi tabele za verifikaciju nisu pronađeni!");
        return;
    }
    
    // Clear existing content
    while (tableHeader.children.length > 1) {
        tableHeader.removeChild(tableHeader.lastChild);
    }
    verificationTable.innerHTML = '';
    
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
                console.log("Nema podataka o igraču:", playerId);
                // Koristi username iz odgovora ako postoji
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
    
    console.log("Igrači sa odgovorima:", playersWithAnswers);
    
    // Sort players by name
    try {
        playersWithAnswers.sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) {
        console.error("Greška pri sortiranju igrača:", e);
    }
    
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
                    answerValue = flagData.name; // Set the text value for verification
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
            
            // Add checkbox for verification
            if (answerValue.trim() !== '') {
                // Create a container for the checkbox to control layout
                const checkboxContainer = document.createElement('div');
                checkboxContainer.className = 'd-inline-block';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'form-check-input verification-checkbox';
                checkbox.dataset.playerId = player.id;
                checkbox.dataset.category = category.id;
                checkbox.checked = true; // Default to checked (correct)
                
                checkboxContainer.appendChild(checkbox);
                answerCell.appendChild(checkboxContainer);
                
                // Store in verificationData
                if (!verificationData[player.id]) {
                    verificationData[player.id] = {};
                }
                verificationData[player.id][category.id] = true;
                
                // Add event listener
                checkbox.addEventListener('change', (e) => {
                    verificationData[player.id][category.id] = e.target.checked;
                });
            }
            
            row.appendChild(answerCell);
        });
        
        verificationTable.appendChild(row);
    });
    
    console.log("Tabela za verifikaciju izgrađena.");
    
    // Update confirm button text based on round status
    updateConfirmButtonStatus();
}

// Update the confirm button status based on round status
function updateConfirmButtonStatus() {
    const confirmButton = document.getElementById('confirmVerificationBtn');
    if (!confirmButton) return;
    
    // Check if round is finished
    firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/finishedAt`).once('value', (snapshot) => {
        const isFinished = snapshot.exists() && snapshot.val();
        
        if (isFinished) {
            confirmButton.textContent = "Potvrdi i prikaži rezultate";
            confirmButton.classList.add("pulse-animation");
        } else {
            confirmButton.textContent = "Potvrdi odgovore i sačekaj ostale igrače";
        }
    });
}

// Confirm verification and calculate scores
function confirmVerification() {
    console.log("Potvrda verifikacije...");
    if (Object.keys(verificationData).length === 0) {
        alert('Nema podataka za verifikaciju.');
        return;
    }
    
    // Disable button to prevent multiple clicks
    const confirmButton = document.getElementById('confirmVerificationBtn');
    if (confirmButton) {
        confirmButton.disabled = true;
        confirmButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Obrađivanje...';
    }
    
    // Reference to verification data in Firebase
    const verificationRef = firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/verification`);
    
    // Set verification data
    verificationRef.update({
        verifiedBy: currentPlayerId,
        verifiedAt: firebase.database.ServerValue.TIMESTAMP,
        ...verificationData
    }).then(() => {
        console.log("Verifikacija uspešno sačuvana!");
        
        // Show success message
        showToast("Verifikacija uspešno sačuvana!");
        
        // Check if round is finished (timer expired)
        return firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/finishedAt`).once('value');
    })
    .then((snapshot) => {
        const isFinished = snapshot.exists() && snapshot.val();
        
        if (isFinished) {
            // Round is finished, redirect to voting page
            redirectToVotingPage();
        } else {
            // Round not finished yet, show waiting message
            showWaitingForEndOfRound();
            
            // Set up listener for round end
            listenForRoundEnd();
        }
    })
    .catch(error => {
        console.error('Error saving verification:', error);
        alert('Došlo je do greške pri čuvanju verifikacije.');
        
        // Re-enable button
        if (confirmButton) {
            confirmButton.disabled = false;
            confirmButton.innerHTML = '<i class="fas fa-check-circle me-2"></i>Potvrdi i boduj';
        }
    });
}

function redirectToVotingPage() {
    console.log("Redirecting to voting page");
    window.location.href = `voting.html?gameId=${gameData.id}&round=${currentRound}`;
}

function listenForRoundEnd() {
    firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/finishedAt`).on('value', (snapshot) => {
        if (snapshot.exists() && snapshot.val()) {
            console.log("Round has ended, redirecting to voting page");
            redirectToVotingPage();
        }
    });
}

function showWaitingForEndOfRound() {
    // Create or update waiting overlay
    let waitingOverlay = document.getElementById('waitingOverlay');
    if (!waitingOverlay) {
        waitingOverlay = document.createElement('div');
        waitingOverlay.id = 'waitingOverlay';
        waitingOverlay.className = 'waiting-overlay';
        
        waitingOverlay.innerHTML = `
            <div class="waiting-content bg-dark-secondary p-4 rounded shadow-neon text-center">
                <h3 class="text-light mb-3">Verifikacija završena</h3>
                <p class="text-light mb-4">Čekanje na završetak runde za ostale igrače...</p>
                <div class="d-flex justify-content-center align-items-center gap-3">
                    <div class="spinner-border text-neon" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div id="waitingCounter" class="text-neon fs-4">
                        Čekanje...
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(waitingOverlay);
    } else {
        // Update existing overlay
        waitingOverlay.style.display = 'flex';
    }
}

// Listen for round finished status
function listenForRoundFinished() {
    firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/finishedAt`).on('value', (snapshot) => {
        if (snapshot.exists() && snapshot.val()) {
            console.log("Round is now finished, calculating scores");
            calculateScores();
        }
    });
}

// Calculate scores based on verification
function calculateScores() {
    console.log("Računanje bodova...");
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
    
    console.log("Izračunati bodovi:", playerScores);
    
    // Save round scores
    scoresRef.set(playerScores).then(() => {
        console.log("Bodovi uspešno sačuvani, redirekcija na rezultate...");
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