// Game variables
let gameData = null;
let lobbyCurrentUser = null;
let currentPlayerId = null;
let currentRound = 1;
let currentLetter = '';
let totalRounds = 5;
let roundTimeInSeconds = 120;
let timerInterval = null;
let categoryInputs = {};
let visibleCategoryIndex = 0;
let isRoundFinished = false;
let playerAnswers = {};
let allPlayersData = {};

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("Game.js učitan!");
    
    // Get game ID from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('gameId') || localStorage.getItem('zgGameId');
    
    console.log("Game ID:", gameId);
    
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
    
    lobbyCurrentUser = JSON.parse(userJSON);
  // Temporarily set a basic ID until we load game data
    currentPlayerId = lobbyCurrentUser.username.toLowerCase().replace(/[^a-z0-9]/g, '_');

    console.log("Current User:", lobbyCurrentUser.username, "Initial ID:", currentPlayerId);

    // Initialize category inputs
    initializeCategoryInputs();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load game data
    loadGameData(gameId);
});

// Initialize category inputs
function initializeCategoryInputs() {
    categoryInputs = {
        flag: null, // This will be handled separately
        country: document.getElementById('countryInput'),
        city: document.getElementById('cityInput'),
        mountain: document.getElementById('mountainInput'),
        river: document.getElementById('riverInput'),
        lake: document.getElementById('lakeInput'),
        sea: document.getElementById('seaInput'),
        plant: document.getElementById('plantInput'),
        animal: document.getElementById('animalInput'),
        object: document.getElementById('objectInput')
    };
}

// Generate player ID
function generatePlayerId(username) {
    // We should use the existing player ID from Firebase
    // First try to find the player in allPlayersData
    if (gameData && gameData.players) {
        for (const pid in gameData.players) {
            if (gameData.players[pid].username === username) {
                return pid;
            }
        }
    }
    // If not found (which shouldn't normally happen)
    return username.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

// Setup event listeners
function setupEventListeners() {
    // Submit answers button
    const submitAnswersBtn = document.getElementById('submitAnswersBtn');
    if (submitAnswersBtn) {
        submitAnswersBtn.addEventListener('click', submitAnswers);
    }
    
    // Mobile category navigation
    const prevCategoryBtn = document.getElementById('prevCategory');
    const nextCategoryBtn = document.getElementById('nextCategory');
    
    if (prevCategoryBtn) {
        prevCategoryBtn.addEventListener('click', () => navigateCategory(-1));
    }
    
    if (nextCategoryBtn) {
        nextCategoryBtn.addEventListener('click', () => navigateCategory(1));
    }
    
    // Flag handling will be initialized separately in loadFlags()
}

// Load game data
function loadGameData(gameId) {
    console.log("Učitavam podatke o igri...");
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
        
        console.log("Podaci o igri učitani:", gameData);
        
        // Get player ID from existing data
        if (gameData.players) {
            for (const pid in gameData.players) {
                if (gameData.players[pid].username === lobbyCurrentUser.username) {
                    currentPlayerId = pid;
                    console.log("Found existing player ID:", currentPlayerId);
                    break;
                }
            }
        }
        
        // Get game settings
        const settings = gameData.settings;
        if (settings) {
            roundTimeInSeconds = settings.roundTime * 60;
            totalRounds = settings.totalRounds;
            
            // Update UI
            document.getElementById('totalRounds').textContent = totalRounds;
        }
        
        // Check current round
        getCurrentRound();
        
        // Load flags
        loadFlags();
        
        // Setup real-time listeners
        setupRealtimeListeners(gameId);
    }).catch(error => {
        console.error('Error loading game:', error);
        alert('Došlo je do greške pri učitavanju igre.');
    });
}

// Get current round data
function getCurrentRound() {
    if (!gameData || !gameData.rounds) return;
    
    // Find the latest round
    let highestRoundNumber = 0;
    for (const roundId in gameData.rounds) {
        const roundNumber = parseInt(roundId);
        if (roundNumber > highestRoundNumber) {
            highestRoundNumber = roundNumber;
        }
    }
    
    currentRound = highestRoundNumber || 1;
    console.log("Trenutna runda:", currentRound);
    
    // Update UI
    document.getElementById('roundNumber').textContent = currentRound;
    
    // Get round data
    const roundData = gameData.rounds[currentRound];
    if (roundData) {
        currentLetter = roundData.letter;
        
        // Update UI
        document.getElementById('currentLetter').textContent = currentLetter;
        
        // Start timer
        startTimer();
    }
}

// Setup real-time listeners
function setupRealtimeListeners(gameId) {
    console.log("Postavljam real-time listenere...");
    const gameRef = firebase.database().ref('games/' + gameId);
    
    // Listen for round changes
    gameRef.child('rounds/' + currentRound).on('value', (snapshot) => {
        const roundData = snapshot.val();
        if (roundData) {
            currentLetter = roundData.letter;
            
            // Update UI
            document.getElementById('currentLetter').textContent = currentLetter;
            
            // Update placeholders for inputs
            updateInputPlaceholders();
            
            // Proveravamo da li je runda već završena
            if (roundData.finishedAt && !isRoundFinished) {
                console.log("Detektovano da je runda završena!");
                handleRoundFinished(roundData);
            }
        }
    });
    
    // Listen for all players
    gameRef.child('players').on('value', (snapshot) => {
        allPlayersData = snapshot.val() || {};
        
        // Update players progress
        updatePlayersProgress();
    });
    
    // Listen for current player's answers
    gameRef.child('rounds/' + currentRound + '/answers/' + currentPlayerId).on('value', (snapshot) => {
        playerAnswers = snapshot.val() || {};
        
        // Update UI to reflect saved answers
        updateUIWithSavedAnswers();
        
        // Check if player has finished
        isRoundFinished = playerAnswers.isFinished === true;
        
        if (isRoundFinished) {
            // Disable inputs
            disableAllInputs();
            
            // Check if all players finished
            checkAllPlayersFinished();
        }
    });
    
    // Listen specifically for round finished status
    gameRef.child('rounds/' + currentRound + '/finishedAt').on('value', (snapshot) => {
        if (snapshot.exists() && snapshot.val()) {
            console.log("Runda je završena, finishedAt:", snapshot.val());
            handleRoundFinished(null);
        }
    });
}

// Handle round finished event
function handleRoundFinished(roundData) {
    // Stop timer if it's still running
    clearInterval(timerInterval);
    
    // Prevent executing this function multiple times
    if (isRoundFinished) {
        // But still check if we need to redirect
        if (document.location.pathname.includes('game-play.html')) {
            console.log("Already finished but still on game page, forcing redirect");
            redirectToNextPage();
        }
        return;
    }
    
    isRoundFinished = true;
    console.log("Runda je završena, proveravam ko ide na verifikaciju");
    
    // Function to determine and execute the appropriate redirect
    function redirectToNextPage() {
        // Get game reference
        const gameRef = firebase.database().ref('games/' + gameData.id);
        
        // Get verification status
        gameRef.child('rounds/' + currentRound + '/verification/verifiedBy').once('value', (verifierSnapshot) => {
            const verifier = verifierSnapshot.val();
            
            if (verifier) {
                console.log("Verifikator već postoji:", verifier);
                
                // If current user is verifier
                if (verifier === currentPlayerId) {
                    console.log("Ja sam verifikator, idem na verify.html");
                    redirectWithDelay('verify.html?gameId=' + gameData.id + '&round=' + currentRound, 500);
                } else {
                    console.log("Nisam verifikator, idem na round-results.html");
                    redirectWithDelay('round-results.html?gameId=' + gameData.id + '&round=' + currentRound, 500);
                }
            } else {
                // Get all answers
                gameRef.child('rounds/' + currentRound + '/answers').once('value', (answersSnapshot) => {
                    const answers = answersSnapshot.val() || {};
                    
                    // Get finished players sorted by finish time
                    const finishedPlayers = [];
                    for (const pid in answers) {
                        if (answers[pid] && answers[pid].isFinished) {
                            finishedPlayers.push({
                                id: pid,
                                username: answers[pid].username || (allPlayersData[pid] ? allPlayersData[pid].username : "Unknown"),
                                finishedAt: answers[pid].finishedAt || 0
                            });
                        }
                    }
                    
                    // Sort by finish time (earliest first)
                    finishedPlayers.sort((a, b) => (a.finishedAt || 0) - (b.finishedAt || 0));
                    
                    if (finishedPlayers.length > 0) {
                        // Set first player as verifier
                        const firstPlayer = finishedPlayers[0];
                        console.log("Prvi završio:", firstPlayer.username);
                        
                        gameRef.child('rounds/' + currentRound + '/verification').update({
                            verifiedBy: firstPlayer.id,
                            verificationStartedAt: firebase.database.ServerValue.TIMESTAMP
                        })
                        .then(() => {
                            if (firstPlayer.id === currentPlayerId) {
                                console.log("Ja sam prvi, idem na verifikaciju");
                                redirectWithDelay('verify.html?gameId=' + gameData.id + '&round=' + currentRound, 500);
                            } else {
                                console.log("Nisam prvi, idem na rezultate");
                                redirectWithDelay('round-results.html?gameId=' + gameData.id + '&round=' + currentRound, 500);
                            }
                        })
                        .catch(error => {
                            console.error("Greška pri postavljanju verifikatora:", error);
                            redirectWithDelay('round-results.html?gameId=' + gameData.id + '&round=' + currentRound, 500);
                        });
                    } else {
                        console.log("Nema završenih igrača, automatski na rezultate");
                        redirectWithDelay('round-results.html?gameId=' + gameData.id + '&round=' + currentRound, 500);
                    }
                });
            }
        });
    }
    
    // Execute the redirect logic
    redirectToNextPage();
}

// Helper function for delayed redirect
function redirectWithDelay(url, delay) {
    console.log(`Redirecting to ${url} in ${delay}ms`);
    setTimeout(() => {
        window.location.href = url;
    }, delay);
}

// Start the round timer
function startTimer() {
    // Initialize timer display
    const timerElement = document.getElementById('timer');
    let timeLeft = roundTimeInSeconds;
    
    updateTimerDisplay(timeLeft);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        
        updateTimerDisplay(timeLeft);
        
        if (timeLeft <= 0) {
            // Time's up
            clearInterval(timerInterval);
            
            // Auto-submit answers
            submitAnswers();
        }
    }, 1000);
    
    // Add a safety timeout to force completion if timer ends
    setTimeout(() => {
        if (!isRoundFinished) {
            console.log("Safety timeout triggered: force round completion");
            submitAnswers(); // Force submission if not already submitted
            
            // Force check status of round after a short delay
            setTimeout(() => {
                firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/finishedAt`).once('value', (snapshot) => {
                    if (!snapshot.exists() || !snapshot.val()) {
                        firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/finishedAt`).set(firebase.database.ServerValue.TIMESTAMP)
                            .then(() => {
                                handleRoundFinished(null);
                            });
                    } else {
                        handleRoundFinished(null);
                    }
                });
            }, 2000);
        }
    }, (roundTimeInSeconds + 10) * 1000); // 10 seconds after round should end
}

// Update timer display
function updateTimerDisplay(seconds) {
    const timerElement = document.getElementById('timer');
    
    if (!timerElement) return;
    
    // Format time as MM:SS
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    const formattedTime = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    
    timerElement.textContent = formattedTime;
    
    // Change color based on time left
    if (seconds <= 10) {
        timerElement.style.color = 'red';
        timerElement.classList.add('pulse-animation');
    } else if (seconds <= 30) {
        timerElement.style.color = 'orange';
    } else {
        timerElement.style.color = 'white';
    }
}

// Load flags data
function loadFlags() {
    console.log("Učitavanje zastava...");
    
    // Inicijalizacija handlera za zastave sa podacima
    if (typeof flagsData !== 'undefined' && typeof FlagHandler !== 'undefined') {
        // Inicijalizacija FlagHandler-a sa podacima zastava
        FlagHandler.init(flagsData);
        
        // Prikaz svih zastava u grid-u (bez filtriranja po slovu)
        const flagGrid = document.getElementById('flagGrid');
        if (flagGrid) {
            // Očisti grid
            flagGrid.innerHTML = '';
            
            // Dodaj sve zastave u grid
            Object.values(flagsData).forEach(flag => {
                const flagImg = document.createElement('img');
                // Koristimo ispravan format fajla - WEBP, bez dodatnog 'f' na kraju
                flagImg.src = `assets/flags/${flag.code.toLowerCase()}-flag.webp`;
                flagImg.alt = flag.name;
                flagImg.className = 'flag-item';
                flagImg.dataset.code = flag.code;
                
                // Na greški, prikaži placeholder
                flagImg.onerror = function() {
                    console.log("Nije moguće učitati zastavu:", flag.code);
                    this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="40" viewBox="0 0 60 40"><rect width="60" height="40" fill="%23ccc"/><text x="50%" y="50%" font-family="Arial" font-size="12" text-anchor="middle" dominant-baseline="middle" fill="%23666">' + flag.code + '</text></svg>';
                };
                
                // Dodaj event listener za klik
                flagImg.addEventListener('click', function() {
                    if (isRoundFinished) return; // Ne dozvoli izbor ako je runda završena
                    
                    // Očisti prethodnu selekciju
                    document.querySelectorAll('.flag-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    
                    // Selektuj ovu zastavu
                    this.classList.add('selected');
                    
                    // Prikaži ime selektovane zastave
                    const selectedFlagContainer = document.querySelector('.selected-flag-container');
                    if (selectedFlagContainer) {
                        selectedFlagContainer.classList.remove('d-none');
                        const selectedFlagImg = document.getElementById('selectedFlag');
                        const selectedFlagName = document.getElementById('selectedFlagName');
                        
                        if (selectedFlagImg && selectedFlagName) {
                            selectedFlagImg.src = this.src;
                            selectedFlagName.textContent = flagsData[this.dataset.code].name;
                        }
                    }
                    
                    // Jednom kad je zastava izabrana, ne dozvoli više promene
                    document.querySelectorAll('.flag-item').forEach(item => {
                        if (item !== this) {
                            item.style.pointerEvents = 'none';
                            item.style.opacity = '0.5';
                        }
                    });
                });
                
                flagGrid.appendChild(flagImg);
            });
        }
    } else {
        console.error('Flag data or FlagHandler not available!');
    }
}

// Update input placeholders with current letter
function updateInputPlaceholders() {
    for (const category in categoryInputs) {
        const input = categoryInputs[category];
        if (input) {
            input.placeholder = `${getInputPlaceholder(category)} na slovo ${currentLetter}...`;
        }
    }
}

// Get input placeholder text based on category
function getInputPlaceholder(category) {
    const placeholders = {
        country: 'Država',
        city: 'Grad',
        mountain: 'Planina',
        river: 'Reka',
        lake: 'Jezero',
        sea: 'More',
        plant: 'Biljka',
        animal: 'Životinja',
        object: 'Predmet'
    };
    
    return placeholders[category] || category;
}

// Update UI with saved answers
function updateUIWithSavedAnswers() {
    // Update text inputs
    for (const category in categoryInputs) {
        const input = categoryInputs[category];
        if (input && playerAnswers[category]) {
            input.value = playerAnswers[category];
        }
    }
    
    // Update selected flag
    if (playerAnswers.flag) {
        const flagElement = document.querySelector(`.flag-item[data-code="${playerAnswers.flag}"]`);
        if (flagElement) {
            // Simulate click on the flag
            flagElement.click();
        }
    }
}

// Update players progress
function updatePlayersProgress() {
    const progressContainer = document.getElementById('playersProgress');
    if (!progressContainer) return;
    
    // Clear container
    progressContainer.innerHTML = '';
    
    // Get all players
    const players = [];
    for (const playerId in allPlayersData) {
        if (allPlayersData[playerId] && allPlayersData[playerId].username) {
            players.push({
                id: playerId,
                username: allPlayersData[playerId].username || "Nepoznat",
                ...allPlayersData[playerId]
            });
        }
    }
    
    // Sort players by name (safe version)
    try {
        players.sort((a, b) => String(a.username || "").localeCompare(String(b.username || "")));
    } catch (e) {
        console.error("Greška pri sortiranju igrača:", e);
    }
    
    // Add progress for each player
    players.forEach(player => {
        // Create player progress element
        const playerEl = document.createElement('div');
        playerEl.className = 'player-progress p-2 bg-dark rounded';
        
        // Check if player has finished current round
        let isFinished = false;
        
        if (gameData && gameData.rounds && gameData.rounds[currentRound] && 
            gameData.rounds[currentRound].answers && gameData.rounds[currentRound].answers[player.id]) {
            isFinished = gameData.rounds[currentRound].answers[player.id].isFinished;
        }
        
        // Set status color
        playerEl.style.borderLeft = isFinished ? '3px solid #2ecc71' : '3px solid #e74c3c';
        
        // Player name
        const playerName = document.createElement('div');
        playerName.className = 'player-name';
        playerName.textContent = player.username || "Igrač";
        
        // Add to container
        playerEl.appendChild(playerName);
        progressContainer.appendChild(playerEl);
    });
}

// Navigate between categories on mobile
function navigateCategory(direction) {
    const categories = document.querySelectorAll('.category-container');
    
    // Update visible category index
    visibleCategoryIndex = (visibleCategoryIndex + direction + categories.length) % categories.length;
    
    // Hide all categories
    categories.forEach(category => {
        category.style.display = 'none';
    });
    
    // Show only current category
    categories[visibleCategoryIndex].style.display = 'block';
    
    // Update category name indicator
    const currentCategory = categories[visibleCategoryIndex];
    const categoryTitle = currentCategory.querySelector('.category-title').textContent;
    document.getElementById('currentCategoryName').textContent = categoryTitle;
}

// Submit player answers
function submitAnswers() {
    if (isRoundFinished) {
        console.log("Već ste završili rundu!");
        return; // Prevent multiple submissions
    }
    
    // Get the selected flag code
    let selectedFlagCode = null;
    const selectedFlag = document.querySelector('.flag-item.selected');
    if (selectedFlag) {
        selectedFlagCode = selectedFlag.dataset.code;
    }
    
    // Collect all answers
    const answers = {
        flag: selectedFlagCode,
        country: categoryInputs.country.value.trim(),
        city: categoryInputs.city.value.trim(),
        mountain: categoryInputs.mountain.value.trim(),
        river: categoryInputs.river.value.trim(),
        lake: categoryInputs.lake.value.trim(),
        sea: categoryInputs.sea.value.trim(),
        plant: categoryInputs.plant.value.trim(),
        animal: categoryInputs.animal.value.trim(),
        object: categoryInputs.object.value.trim(),
        isFinished: true,
        finishedAt: firebase.database.ServerValue.TIMESTAMP,
        username: lobbyCurrentUser.username // Dodajemo username u odgovore za lakšu identifikaciju
    };
    
    console.log("Šaljem odgovore:", answers);
    
    // Force an additional check for finishedAt timestamp after submission
    const roundRef = firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}`);
    
    // Save answers to Firebase
    firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/answers/${currentPlayerId}`).update(answers)
        .then(() => {
            console.log("Odgovori uspešno poslati!");
            // Disable inputs
            disableAllInputs();
            
            // Play submission sound
            playSound('correct');
            
            // Show submitted message
            showToast('Odgovori su uspešno poslati!');
            
            // Mark player as finished in player data
            firebase.database().ref(`games/${gameData.id}/players/${currentPlayerId}`).update({
                isFinished: true,
                lastActive: firebase.database.ServerValue.TIMESTAMP
            })
            .then(() => {
                console.log("Igrač označen kao završen.");
                
                // Check if all players finished
                checkAllPlayersFinished();
                
                // Add safety timeout to check round status again
                setTimeout(() => {
                    roundRef.once('value', (snapshot) => {
                        const roundData = snapshot.val();
                        if (roundData && !roundData.finishedAt && isRoundFinished) {
                            console.log("Safety check: Force setting finishedAt for round");
                            roundRef.update({
                                finishedAt: firebase.database.ServerValue.TIMESTAMP
                            }).then(() => {
                                console.log("Force finished round");
                                handleRoundFinished(roundData);
                            });
                        }
                    });
                }, 3000); // Check after 3 seconds
            })
            .catch(error => {
                console.error("Greška pri označavanju igrača kao završenog:", error);
            });
        })
        .catch(error => {
            console.error('Error submitting answers:', error);
            showToast('Došlo je do greške pri slanju odgovora. Pokušajte ponovo.');
        });
}

// Disable all inputs after submission
function disableAllInputs() {
    // Disable text inputs
    for (const category in categoryInputs) {
        const input = categoryInputs[category];
        if (input) {
            input.disabled = true;
        }
    }
    
    // Disable flag selection
    document.querySelectorAll('.flag-item').forEach(flag => {
        flag.style.pointerEvents = 'none';
        if (!flag.classList.contains('selected')) {
            flag.style.opacity = '0.5';
        }
    });
    
    // Disable submit button
    const submitBtn = document.getElementById('submitAnswersBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
    }
}

// Check if all players have finished
function checkAllPlayersFinished() {
    if (!gameData || !gameData.rounds || !gameData.rounds[currentRound]) {
        console.log("Nema podataka o rundi");
        return;
    }
    
    const answers = gameData.rounds[currentRound].answers || {};
    
    // Log answers directly to see what we're working with
    console.log("Answers data:", answers);
    
    // Identify players with answers by username comparison for reliability
    const finishedPlayerIds = [];
    
    for (const pid in answers) {
        if (answers[pid] && answers[pid].isFinished === true) {
            finishedPlayerIds.push(pid);
            console.log("Finished player found:", pid, answers[pid].username);
        }
    }
    
    // Get all ACTIVE player IDs 
    const activePlayerIds = [];
    for (const pid in allPlayersData) {
        if (allPlayersData[pid] && !allPlayersData[pid].isDisconnected) {
            activePlayerIds.push(pid);
        }
    }
    
    if (activePlayerIds.length === 0) {
        console.log("Nema aktivnih igrača");
        return;
    }
    
    console.log(`Active player IDs (${activePlayerIds.length}):`, activePlayerIds);
    console.log(`Finished players (${finishedPlayerIds.length}):`, finishedPlayerIds);
    
    // If current player finished but round not marked as finished, force round completion
    if (isRoundFinished || finishedPlayerIds.includes(currentPlayerId)) {
        console.log("Current player has finished, checking overall round status");
        
        // If all active players finished OR at least one player finished and it's been more than 30 seconds
        const shouldEndRound = 
            (finishedPlayerIds.length >= activePlayerIds.length) || 
            (finishedPlayerIds.length > 0 && gameData.rounds[currentRound].startedAt && 
             (Date.now() - gameData.rounds[currentRound].startedAt > (roundTimeInSeconds + 30) * 1000));
        
        if (shouldEndRound) {
            console.log("Dovoljno uslova za završetak runde");
            
            // Check if finishedAt already set
            firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/finishedAt`).once('value', (snapshot) => {
                if (!snapshot.exists() || !snapshot.val()) {
                    // Set finishedAt
                    firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/finishedAt`).set(firebase.database.ServerValue.TIMESTAMP)
                        .then(() => {
                            console.log("FinishedAt uspešno postavljen");
                            
                            // Force round finished handling
                            handleRoundFinished(gameData.rounds[currentRound]);
                        })
                        .catch(error => {
                            console.error("Greška pri postavljanju finishedAt:", error);
                        });
                } else {
                    console.log("finishedAt je već postavljen");
                    
                    // Still force round finished to ensure redirection happens
                    handleRoundFinished(gameData.rounds[currentRound]);
                }
            });
        }
    }
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
