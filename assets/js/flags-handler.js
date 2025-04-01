// Flag handling utilities
const FlagHandler = {
    flags: {}, // Will be populated with flag data
    selectedFlagCode: null,
    
    // Initialize the flag handler with the flags data
    init: function(flagsData) {
        this.flags = flagsData || {};
        this.setupEventHandlers();
    },
    
    // Setup event handlers for flag selection
    setupEventHandlers: function() {
        const flagGrid = document.getElementById('flagGrid');
        if (flagGrid) {
            flagGrid.addEventListener('click', (e) => {
                if (e.target && e.target.classList.contains('flag-item')) {
                    this.selectFlag(e.target);
                }
            });
        }
    },
    
    // Update flag grid to show flags starting with specific letter
    function updateFlagGrid() {
    const flagGrid = document.getElementById('flagGrid');
    if (!flagGrid) return;
    
    // Clear grid
    flagGrid.innerHTML = '';
    
    // Add all flags to grid (no filtering by letter)
    Object.values(this.flags).forEach(flag => {
        const flagImg = document.createElement('img');
        flagImg.src = `assets/flags/${flag.code.toLowerCase()}.gif`; 
        flagImg.alt = flag.name;
        flagImg.title = flag.name;
        flagImg.className = 'flag-item';
        flagImg.dataset.code = flag.code;
        
        flagGrid.appendChild(flagImg);
    });
}
    
    // Select a flag
    selectFlag: function(flagElement) {
        // Remove selection from all flags
        document.querySelectorAll('.flag-item').forEach(flag => {
            flag.classList.remove('selected');
        });
        
        // Add selection to clicked flag
        flagElement.classList.add('selected');
        
        // Store selected flag code
        this.selectedFlagCode = flagElement.dataset.code;
        
        // Show selected flag info
        const selectedFlagContainer = document.querySelector('.selected-flag-container');
        if (selectedFlagContainer) {
            selectedFlagContainer.classList.remove('d-none');
            
            const selectedFlagImg = document.getElementById('selectedFlag');
            const selectedFlagName = document.getElementById('selectedFlagName');
            
            if (selectedFlagImg && selectedFlagName) {
                selectedFlagImg.src = flagElement.src;
                selectedFlagName.textContent = this.flags[this.selectedFlagCode].name;
            }
        }
    },
    
    // Get selected flag code
    getSelectedFlagCode: function() {
        return this.selectedFlagCode;
    },
    
    // Set selected flag from code (used when loading saved answers)
    setSelectedFlag: function(flagCode) {
        if (!flagCode) return;
        
        const flagImg = document.querySelector(`.flag-item[data-code="${flagCode}"]`);
        if (flagImg) {
            this.selectFlag(flagImg);
        }
    },
    
    // Get flags starting with a specific letter
    getFlagsStartingWith: function(letter) {
        return Object.values(this.flags).filter(flag => 
            flag.name.charAt(0).toUpperCase() === letter
        );
    },
    
    // Get flag by code
    getFlagByCode: function(code) {
        return this.flags[code] || null;
    }
};

// Export the FlagHandler to make it available to other files
// Using both CommonJS and ES6 module syntax for compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FlagHandler;
}
