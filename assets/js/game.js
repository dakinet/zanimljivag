// assets/js/game.js
// Main game logic for the Zanimljiva Geografija game

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
        FlagHandler.setSelectedFlag(playerAnswers.flag);
    }
}

// Update players progress
function updatePlayersProgress() {
    const progressContainer = document.getElementById('playersProgress');
    if (!progressContainer) return;
    
    // Clear container
    progressContainer.innerHTML = '';
    
    // Get all players
    const players = Object.values(allPlayersData);
    
    // Sort players by name
    players.sort((a, b) => a.username.localeCompare(b.username));
    
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
        playerName.textContent = player.username;
        
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
    if (isRoundFinished) return; // Prevent multiple submissions
    
    // Collect all answers
    const answers = {
        flag: FlagHandler.getSelectedFlagCode(),
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
        finishedAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    // Save answers to Firebase
    firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/answers/${currentPlayerId}`).update(answers)
        .then(() => {
            // Disable inputs
            disableAllInputs();
            
            // Play submission sound
            playSound('correct');
            
            // Show submitted message
            showToast('Odgovori su uspešno poslati!');
            
            // Check if all players finished
            checkAllPlayersFinished();
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
    });
    
    // Disable submit button
    document.getElementById('submitAnswersBtn').disabled = true;
}

// Check if all players have finished
function checkAllPlayersFinished() {
    if (!gameData || !gameData.rounds || !gameData.rounds[currentRound]) return;
    
    const answers = gameData.rounds[currentRound].answers || {};
    const players = Object.values(allPlayersData);
    
    // Count finished players
    let finishedPlayers = 0;
    for (const playerId in answers) {
        if (answers[playerId].isFinished) {
            finishedPlayers++;
        }
    }
    
    // If all players finished, end round
    if (finishedPlayers === players.length) {
        // Update round finish time
        firebase.database().ref(`games/${gameData.id}/rounds/${currentRound}/finishedAt`).set(firebase.database.ServerValue.TIMESTAMP);
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
}// Game variables
let gameData = null;
let currentUser = null;
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
    // Get game ID from URL or localStorage
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
    return username.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36);
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
    const gameRef = firebase.database().ref('games/' + gameId);
    
    // Listen for round changes
    gameRef.child('rounds/' + currentRound).on('value', (snapshot) => {
        const roundData = snapshot.val();
        if (roundData) {
            currentLetter = roundData.letter;
            
            // Update UI
            document.getElementById('currentLetter').textContent = currentLetter;
            
            // Update flag grid to show only flags starting with current letter
            FlagHandler.updateFlagGrid(currentLetter);
            
            // Update placeholders for inputs
            updateInputPlaceholders();
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
    
    // Listen for round finished status
    gameRef.child('rounds/' + currentRound + '/finishedAt').on('value', (snapshot) => {
        const finishedAt = snapshot.val();
        
        if (finishedAt) {
            // Round has finished
            clearInterval(timerInterval);
            
            // Redirect to verification page if first to finish
            const answers = gameData.rounds[currentRound].answers || {};
            const finishedPlayers = Object.values(answers).filter(a => a.isFinished);
            
            if (finishedPlayers.length > 0 && finishedPlayers[0].finishedAt === playerAnswers.finishedAt) {
                // This player finished first, go to verification
                setTimeout(() => {
                    window.location.href = 'verify.html?gameId=' + gameData.id + '&round=' + currentRound;
                }, 1000);
            } else {
                // Wait for verification
                setTimeout(() => {
                    window.location.href = 'round-results.html?gameId=' + gameData.id + '&round=' + currentRound;
                }, 1000);
            }
        }
    });
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

 name: 'Island', code: 'IS' },
        'IN': { name: 'Indija', code: 'IN' },
        'ID': { name: 'Indonezija', code: 'ID' },
        'IR': { name: 'Iran', code: 'IR' },
        'IQ': { name: 'Irak', code: 'IQ' },
        'IE': { name: 'Irska', code: 'IE' },
        'IL': { name: 'Izrael', code: 'IL' },
        'IT': { name: 'Italija', code: 'IT' },
        'JM': { name: 'Jamajka', code: 'JM' },
        'JP': { name: 'Japan', code: 'JP' },
        'JO': { name: 'Jordan', code: 'JO' },
        'KZ': { name: 'Kazahstan', code: 'KZ' },
        'KE': { name: 'Kenija', code: 'KE' },
        'KI': { name: 'Kiribati', code: 'KI' },
        'KR': { name: 'Južna Koreja', code: 'KR' },
        'KW': { name: 'Kuvajt', code: 'KW' },
        'KG': { name: 'Kirgistan', code: 'KG' },
        'LA': { name: 'Laos', code: 'LA' },
        'LV': { name: 'Letonija', code: 'LV' },
        'LB': { name: 'Liban', code: 'LB' },
        'LS': { name: 'Lesoto', code: 'LS' },
        'LR': { name: 'Liberija', code: 'LR' },
        'LY': { name: 'Libija', code: 'LY' },
        'LI': { name: 'Lihtenštajn', code: 'LI' },
        'LT': { name: 'Litvanija', code: 'LT' },
        'LU': { name: 'Luksemburg', code: 'LU' },
        'MK': { name: 'Severna Makedonija', code: 'MK' },
        'MG': { name: 'Madagaskar', code: 'MG' },
        'MW': { name: 'Malavi', code: 'MW' },
        'MY': { name: 'Malezija', code: 'MY' },
        'MV': { name: 'Maldivi', code: 'MV' },
        'ML': { name: 'Mali', code: 'ML' },
        'MT': { name: 'Malta', code: 'MT' },
        'MH': { name: 'Maršalska Ostrva', code: 'MH' },
        'MR': { name: 'Mauritanija', code: 'MR' },
        'MU': { name: 'Mauricijus', code: 'MU' },
        'MX': { name: 'Meksiko', code: 'MX' },
        'FM': { name: 'Mikronezija', code: 'FM' },
        'MD': { name: 'Moldavija', code: 'MD' },
        'MC': { name: 'Monako', code: 'MC' },
        'MN': { name: 'Mongolija', code: 'MN' },
        'ME': { name: 'Crna Gora', code: 'ME' },
        'MA': { name: 'Maroko', code: 'MA' },
        'MZ': { name: 'Mozambik', code: 'MZ' },
        'MM': { name: 'Mjanmar (Burma)', code: 'MM' },
        'NA': { name: 'Namibija', code: 'NA' },
        'NR': { name: 'Nauru', code: 'NR' },
        'NP': { name: 'Nepal', code: 'NP' },
        'NL': { name: 'Holandija', code: 'NL' },
        'NZ': { name: 'Novi Zeland', code: 'NZ' },
        'NI': { name: 'Nikaragva', code: 'NI' },
        'NE': { name: 'Niger', code: 'NE' },
        'NG': { name: 'Nigerija', code: 'NG' },
        'NO': { name: 'Norveška', code: 'NO' },
        'OM': { name: 'Oman', code: 'OM' },
        'PK': { name: 'Pakistan', code: 'PK' },
        'PW': { name: 'Palau', code: 'PW' },
        'PA': { name: 'Panama', code: 'PA' },
        'PG': { name: 'Papua Nova Gvineja', code: 'PG' },
        'PY': { name: 'Paragvaj', code: 'PY' },
        'PE': { name: 'Peru', code: 'PE' },
        'PH': { name: 'Filipini', code: 'PH' },
        'PL': { name: 'Poljska', code: 'PL' },
        'PT': { name: 'Portugal', code: 'PT' },
        'QA': { name: 'Katar', code: 'QA' },
        'RO': { name: 'Rumunija', code: 'RO' },
        'RU': { name: 'Rusija', code: 'RU' },
        'RW': { name: 'Ruanda', code: 'RW' },
        'KN': { name: 'Sveti Kits i Nevis', code: 'KN' },
        'LC': { name: 'Sveta Lucija', code: 'LC' },
        'VC': { name: 'Sveti Vinsent i Grenadini', code: 'VC' },
        'WS': { name: 'Samoa', code: 'WS' },
        'SM': { name: 'San Marino', code: 'SM' },
        'ST': { name: 'Sao Tome i Principe', code: 'ST' },
        'SA': { name: 'Saudijska Arabija', code: 'SA' },
        'SN': { name: 'Senegal', code: 'SN' },
        'RS': { name: 'Srbija', code: 'RS' },
        'SC': { name: 'Sejšeli', code: 'SC' },
        'SL': { name: 'Sijera Leone', code: 'SL' },
        'SG': { name: 'Singapur', code: 'SG' },
        'SK': { name: 'Slovačka', code: 'SK' },
        'SI': { name: 'Slovenija', code: 'SI' },
        'SB': { name: 'Solomonska Ostrva', code: 'SB' },
        'SO': { name: 'Somalija', code: 'SO' },
        'ZA': { name: 'Južnoafrička Republika', code: 'ZA' },
        'ES': { name: 'Španija', code: 'ES' },
        'LK': { name: 'Šri Lanka', code: 'LK' },
        'SD': { name: 'Sudan', code: 'SD' },
        'SR': { name: 'Surinam', code: 'SR' },
        'SZ': { name: 'Svazilend', code: 'SZ' },
        'SE': { name: 'Švedska', code: 'SE' },
        'CH': { name: 'Švajcarska', code: 'CH' },
        'SY': { name: 'Sirija', code: 'SY' },
        'TW': { name: 'Tajvan', code: 'TW' },
        'TJ': { name: 'Tadžikistan', code: 'TJ' },
        'TZ': { name: 'Tanzanija', code: 'TZ' },
        'TH': { name: 'Tajland', code: 'TH' },
        'TL': { name: 'Istočni Timor', code: 'TL' },
        'TG': { name: 'Togo', code: 'TG' },
        'TO': { name: 'Tonga', code: 'TO' },
        'TT': { name: 'Trinidad i Tobago', code: 'TT' },
        'TN': { name: 'Tunis', code: 'TN' },
        'TR': { name: 'Turska', code: 'TR' },
        'TM': { name: 'Turkmenistan', code: 'TM' },
        'TV': { name: 'Tuvalu', code: 'TV' },
        'UG': { name: 'Uganda', code: 'UG' },
        'UA': { name: 'Ukrajina', code: 'UA' },
        'AE': { name: 'Ujedinjeni Arapski Emirati', code: 'AE' },
        'GB': { name: 'Ujedinjeno Kraljevstvo', code: 'GB' },
        'US': { name: 'Sjedinjene Američke Države', code: 'US' },
        'UY': { name: 'Urugvaj', code: 'UY' },
        'UZ': { name: 'Uzbekistan', code: 'UZ' },
        'VU': { name: 'Vanuatu', code: 'VU' },
        'VA': { name: 'Vatikan', code: 'VA' },
        'VE': { name: 'Venecuela', code: 'VE' },
        'VN': { name: 'Vijetnam', code: 'VN' },
        'YE': { name: 'Jemen', code: 'YE' },
        'ZM': { name: 'Zambija', code: 'ZM' },
        'ZW': { name: 'Zimbabve', code: 'ZW' }
    };
    
    // After loading flags, update the flag grid
    updateFlagGrid();
}
