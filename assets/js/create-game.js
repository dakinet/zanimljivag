// assets/js/create-game.js
// Logika za kreiranje nove igre

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("Create Game stranica učitana");
    
    // Provjera da li je Firebase dostupan
    if (typeof firebase === 'undefined') {
        console.error("Firebase nije dostupan! Provjerite skripte.");
        alert("Greška: Firebase biblioteka nije učitana. Moguće je da imate problem s internetskom vezom ili blokiranjem skripti.");
        return;
    }
    
    if (typeof firebase.database !== 'function') {
        console.error("Firebase Database nije dostupan! Provjerite skripte.");
        alert("Greška: Firebase Database nije dostupan. Provjerite učitavanje skripti.");
        return;
    }
    
    console.log("Firebase i Firebase Database uspješno učitani.");
    
    // Initialize sliders
    initSliders();
    
    // Generate letter checkboxes
    generateLetterCheckboxes();
    
    // Setup create game button
    const createGameSubmitBtn = document.getElementById('createGameSubmitBtn');
    if (createGameSubmitBtn) {
        console.log("Postavljanje event listenera za dugme kreiranja igre");
        createGameSubmitBtn.addEventListener('click', handleCreateGame);
    } else {
        console.error("Dugme za kreiranje igre nije pronađeno!");
    }
    
    // Setup copy buttons
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const copyUrlBtn = document.getElementById('copyUrlBtn');
    
    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', () => {
            copyToClipboard(document.getElementById('gameCodeDisplay').textContent);
        });
    }
    
    if (copyUrlBtn) {
        copyUrlBtn.addEventListener('click', () => {
            copyToClipboard(document.getElementById('gameUrlInput').value);
        });
    }
    
    // Setup go to lobby button
    const goToLobbyBtn = document.getElementById('goToLobbyBtn');
    if (goToLobbyBtn) {
        goToLobbyBtn.addEventListener('click', () => {
            const gameId = document.getElementById('gameCodeDisplay').textContent;
            window.location.href = `lobby.html?gameId=${gameId}`;
        });
    }
});

// Initialize sliders
function initSliders() {
    const roundTimeSlider = document.getElementById('roundTime');
    const roundTimeValue = document.getElementById('roundTimeValue');
    
    const totalRoundsSlider = document.getElementById('totalRounds');
    const totalRoundsValue = document.getElementById('totalRoundsValue');
    
    if (roundTimeSlider && roundTimeValue) {
        roundTimeSlider.addEventListener('input', () => {
            roundTimeValue.textContent = roundTimeSlider.value;
        });
    }
    
    if (totalRoundsSlider && totalRoundsValue) {
        totalRoundsSlider.addEventListener('input', () => {
            totalRoundsValue.textContent = totalRoundsSlider.value;
        });
    }
}

// Generate letter checkboxes
function generateLetterCheckboxes() {
    const lettersContainer = document.querySelector('.letters-grid .row');
    
    if (!lettersContainer) return;
    
    // Clear any existing content
    lettersContainer.innerHTML = '';
    
    // All possible letters
    const allLetters = 'ABCČĆDĐEFGHIJKLMNOPRSŠTUVZŽ';
    
    // Create checkbox for each letter
    for (let i = 0; i < allLetters.length; i++) {
        const letter = allLetters[i];
        
        const colDiv = document.createElement('div');
        colDiv.className = 'col-auto';
        
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'form-check';
        
        const checkbox = document.createElement('input');
        checkbox.className = 'form-check-input letter-checkbox';
        checkbox.type = 'checkbox';
        checkbox.value = letter;
        checkbox.id = 'letter' + letter;
        
        const label = document.createElement('label');
        label.className = 'form-check-label text-light';
        label.htmlFor = 'letter' + letter;
        label.textContent = letter;
        
        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(label);
        colDiv.appendChild(checkboxContainer);
        
        lettersContainer.appendChild(colDiv);
    }
}

// Handle create game button click
function handleCreateGame() {
    console.log("Kliknuto na dugme za kreiranje igre");
    
    // Get current user from localStorage
    const userJSON = localStorage.getItem('zgUser');
    
    if (!userJSON) {
        console.log("Korisnik nije postavljen, preusmeravanje na početnu stranicu");
        // Redirect to home page if user not set
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(userJSON);
    console.log("Korisnik učitan iz localStorage:", user);
    
    // Get game settings
    const roundTime = parseInt(document.getElementById('roundTime').value);
    const totalRounds = parseInt(document.getElementById('totalRounds').value);
    
    // Get disabled letters
    const disabledLetters = [];
    const letterCheckboxes = document.querySelectorAll('.letter-checkbox:checked');
    
    letterCheckboxes.forEach(checkbox => {
        disabledLetters.push(checkbox.value);
    });
    
    console.log("Postavke igre:", {
        roundTime,
        totalRounds,
        disabledLetters
    });
    
    // Generate game ID
    const gameId = generateGameId();
    console.log("Generisani gameId:", gameId);
    
    // Create game in Firebase
    createGameInFirebase(gameId, user, roundTime, totalRounds, disabledLetters);
}

// Generate a random game ID
function generateGameId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoiding similar looking characters
    let result = '';
    
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    console.log("Generisani ID igre:", result);
    return result;
}

// Create game in Firebase
function createGameInFirebase(gameId, user, roundTime, totalRounds, disabledLetters) {
    console.log("Kreiranje igre u Firebase-u:", gameId, user, roundTime, totalRounds, disabledLetters);
    
    try {
        const gameRef = firebase.database().ref('games/' + gameId);
        
        // Game settings object
        const gameSettings = {
            roundTime: roundTime,
            totalRounds: totalRounds,
            disabledLetters: disabledLetters,
            status: 'lobby',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            createdBy: user.username
        };
        
        console.log("Postavke igre:", gameSettings);
        
        // Create the game
        gameRef.set({
            settings: gameSettings
        })
        .then(() => {
            console.log("Igra kreirana, dodavanje kreatora kao igrača...");
            // Add the creator as a player
            const playerId = generatePlayerId(user.username);
            
            const playerData = {
                username: user.username,
                isReady: false,
                isFinished: false,
                joinedAt: firebase.database.ServerValue.TIMESTAMP,
                totalScore: 0,
                isCreator: true
            };
            
            return gameRef.child('players/' + playerId).set(playerData);
        })
        .then(() => {
            console.log("Kreator dodat kao igrač, spremanje gameId...");
            // Store game ID
            localStorage.setItem('zgGameId', gameId);
            
            // Show success modal
            showGameCreatedModal(gameId);
        })
        .catch(error => {
            console.error('Error creating game:', error);
            alert('Došlo je do greške pri kreiranju igre. Pokušajte ponovo. Detalji: ' + error.message);
        });
    } catch (error) {
        console.error('Exception in createGameInFirebase:', error);
        alert('Došlo je do iznimke pri kreiranju igre. Pokušajte ponovo. Detalji: ' + error.message);
    }
}

// Generate player ID based on username
function generatePlayerId(username) {
    console.log("Generiranje ID-a za igrača:", username);
    const id = username.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36);
    console.log("Generirani ID:", id);
    return id;
}

// Show game created modal
function showGameCreatedModal(gameId) {
    console.log("Prikazivanje modala s informacijama o igri:", gameId);
    
    try {
        // Set game code in modal
        const gameCodeDisplay = document.getElementById('gameCodeDisplay');
        if (gameCodeDisplay) {
            gameCodeDisplay.textContent = gameId;
        } else {
            console.error('Element gameCodeDisplay nije pronađen!');
        }
        
        // Set game URL in modal
        const gameUrlInput = document.getElementById('gameUrlInput');
        if (gameUrlInput) {
            const gameUrl = window.location.origin + '/lobby.html?gameId=' + gameId;
            gameUrlInput.value = gameUrl;
        } else {
            console.error('Element gameUrlInput nije pronađen!');
        }
        
        // Show modal
        const modalElement = document.getElementById('gameCreatedModal');
        if (!modalElement) {
            console.error('Modal element nije pronađen!');
            return;
        }
        
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        console.log("Modal prikazan uspješno");
    } catch (error) {
        console.error("Greška pri prikazivanju modala:", error);
        alert("Igra je kreirana, ali je došlo do greške pri prikazivanju detalja. Kôd igre je: " + gameId);
    }
}

// Copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            // Show success message
            showToast('Kopirano u clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
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
    
    document.getElementById('toastContainer').appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 3000
    });
    
    bsToast.show();
}
