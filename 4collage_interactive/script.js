/**
 * Text Collage Interactive Webpage JavaScript
 * Implements word image dragging, dropping, resizing and selection functionality
 */

// Keep shared state outside DOMContentLoaded so Step 2/3 helper functions can read it.
let currentState;

document.addEventListener('DOMContentLoaded', function() {
    // Word data
    const wordData = {
        mulan: {
            pronouns: [
                "girl's", "femal", "sister", "she", "she", "The Son of Heaven", 
                "his", "She", "she", "Father's", "Mother", "She", "Father's", 
                "She", "she", "Her", "Her", "girl", "brother", "She", "She", 
                "her", "She", "she", "herself", "she", "her", "Her", "Father", 
                "her", "Son of Heaven", "Her", "her", "son", "her", "she", 
                "female", "she", "She", "she", "male", "brother", "She", "her", 
                "her", "Father"
            ],
            verbs: [
                "returning", "Crossing", "reaches", "put on", "runs", "knew", 
                "tie", "hear", "slaughter", "goes out", "buy", "return", "hears", 
                "hears", "run", "takes leave of", "buys", "calling", "tell", "see", 
                "shines", "camps", "sit on", "posted", "saw", "take place", 
                "comes home", "hears", "hears", "hears", "go out", "flying", "coming", 
                "carries", "hears", "take off", "sharpens", "coming", "awards", 
                "calling", "weaving", "leaves", "travels", "sees", "open", "hear", 
                "sighs", "carry", "ask", "desires", "flowing", "dresses", "marched", 
                "arrange", "thinking", "asks", "calling", "meet", "thinking?", 
                "fasten", "sits"
            ]
        },
        medea: {
            pronouns: [
                "his", "woman,", "man,", "women", "her husband.", "women", 
                "him", "man", "she", "husband", "he"
            ],
            verbs: [
                "relieves", "keep our eyes on", "fight", "are forced to", 
                "is tired of", "accept", "hangs on", "divorce", "live a life", 
                "goes out", "buy", "give birth once.", "stand three times in battle", 
                "say"
            ]
        }
    };
    
    // Current state
    currentState = {
        activeText: 'medea',
        selectedWordBox: null,
        draggedWord: null,
        offsetX: 0,
        offsetY: 0,
        placedWords: {
            medea: {
                pronouns: [],
                verbs: []
            },
            mulan: {
                pronouns: [],
                verbs: []
            }
        },
        selectedImage: null,
        selectedImagePlatform: null,
        // Store saved reconstructions for each text separately
        savedReconstructions: {
            medea: null,
            mulan: null
        }
    };
    window.currentState = currentState;
    
    // DOM elements
    const selectorBtns = document.querySelectorAll('.selector-btn');
    const wordSourceBtns = document.querySelectorAll('.word-source-btn');
    const mainImageContainers = document.querySelectorAll('.main-image-container');
    const resetBtn = document.querySelector('.reset-btn');
    const dropZones = document.querySelectorAll('.drop-zone');
    
    // Font settings
    const fontSettings = {
        family: 'Georgia, serif',
        size: '14px',
        color: '#333',
        backgroundColor: '#f8f5f0',
        padding: '8px 12px',
        border: '1px solid #d4a76a',
        borderRadius: '4px',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
        fontStyle: 'italic'
    };
    
    // Initialize the application
    function init() {
        // Generate word boxes
        generateWordBoxes('medea', 'pronouns');
        generateWordBoxes('medea', 'verbs');
        generateWordBoxes('mulan', 'pronouns');
        generateWordBoxes('mulan', 'verbs');
        
        // Bind event listeners
        bindEventListeners();
        
        // Initialize reconstruction selector
        initReconstructionSelector();
        
        // Update remaining counts display
        updateRemainingCounts();
    }
    
    // Generate word boxes
    function generateWordBoxes(textType, wordType) {
        const container = document.querySelector(`.${textType}-${wordType}`);
        if (!container) return;
        
        container.innerHTML = '';
        
        const words = wordData[textType][wordType];
        if (!words) return;
        
        words.forEach((word, index) => {
            const wordBox = document.createElement('div');
            wordBox.classList.add('word-box');
            wordBox.setAttribute('data-text', textType);
            wordBox.setAttribute('data-type', wordType);
            wordBox.setAttribute('data-index', index);
            
            // Set font and styling
            wordBox.style.fontFamily = fontSettings.family;
            wordBox.style.fontSize = fontSettings.size;
            wordBox.style.color = fontSettings.color;
            wordBox.style.backgroundColor = fontSettings.backgroundColor;
            wordBox.style.padding = fontSettings.padding;
            wordBox.style.border = fontSettings.border;
            wordBox.style.borderRadius = fontSettings.borderRadius;
            wordBox.style.boxShadow = fontSettings.boxShadow;
            
            // Add word text
            const wordText = document.createElement('span');
            wordText.classList.add('word-text');
            wordText.textContent = word;
            wordBox.appendChild(wordText);
            
            // Add event listeners
            addWordBoxEventListeners(wordBox);
            
            container.appendChild(wordBox);
        });
    }
    
    // Add event listeners to word boxes
    function addWordBoxEventListeners(wordBox) {
        // Click event for selection
        wordBox.addEventListener('click', function(e) {
            e.stopPropagation();
            selectWordBox(this);
        });
        
        // Mouse events for dragging
        wordBox.addEventListener('mousedown', function(e) {
            if (e.button === 0) { // Left mouse button
                startDragging(e, this);
            }
        });
    }
    
    // Select word box
    function selectWordBox(wordBox) {
        // Deselect previously selected word box
        if (currentState.selectedWordBox) {
            currentState.selectedWordBox.classList.remove('selected');
        }
        
        // Select the clicked word box
        wordBox.classList.add('selected');
        currentState.selectedWordBox = wordBox;
        
        // Keep optional size controls in sync if they exist in the page.
        syncSizeControls(wordBox);
    }
    
    // Start dragging
    function startDragging(e, wordBox) {
        e.preventDefault();
        
        currentState.draggedWord = wordBox;
        wordBox.classList.add('dragging');
        
        // Calculate offset
        const rect = wordBox.getBoundingClientRect();
        currentState.offsetX = e.clientX - rect.left;
        currentState.offsetY = e.clientY - rect.top;
        
        // Add global mouse event listeners
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDragging);
    }
    
    // Drag function
    function drag(e) {
        if (!currentState.draggedWord) return;
        
        e.preventDefault();
        
        // Calculate new position
        const newX = e.clientX - currentState.offsetX;
        const newY = e.clientY - currentState.offsetY;
        
        // Move the element
        currentState.draggedWord.style.position = 'fixed';
        currentState.draggedWord.style.left = `${newX}px`;
        currentState.draggedWord.style.top = `${newY}px`;
        currentState.draggedWord.style.zIndex = '1000';
        currentState.draggedWord.style.pointerEvents = 'none';
    }
    
    // Stop dragging
    function stopDragging(e) {
        if (!currentState.draggedWord) return;
        
        // Check if dropped on a drop zone
        const dropZone = getDropZoneAtPosition(e.clientX, e.clientY);
        if (dropZone) {
            placeWordInDropZone(currentState.draggedWord, dropZone, e.clientX, e.clientY);
        } else {
            // Return to original position
            resetDraggedWordPosition(currentState.draggedWord);
        }
        
        // Clean up
        currentState.draggedWord.classList.remove('dragging');
        currentState.draggedWord.style.pointerEvents = 'auto';
        currentState.draggedWord = null;
        
        // Remove global event listeners
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDragging);
    }
    
    // Get drop zone at position
    function getDropZoneAtPosition(x, y) {
        let dropZone = null;
        dropZones.forEach(zone => {
            const rect = zone.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                dropZone = zone;
            }
        });
        return dropZone;
    }
    
    // Place word in drop zone
    function placeWordInDropZone(wordBox, dropZone, clientX, clientY) {
        const textType = wordBox.getAttribute('data-text');
        const wordType = wordBox.getAttribute('data-type');
        const index = parseInt(wordBox.getAttribute('data-index'));
        
        // Create a new placed word element
        const placedWord = createPlacedWord(wordBox, clientX, clientY, dropZone);
        
        // Hide the original word box
        wordBox.style.display = 'none';
        
        // Add to placed words tracking
        currentState.placedWords[textType][wordType].push(index);
    }
    
    // Create placed word element
    function createPlacedWord(originalBox, clientX, clientY, parentZone) {
        const placedWord = document.createElement('div');
        placedWord.classList.add('placed-word');
        placedWord.setAttribute('data-text', originalBox.getAttribute('data-text'));
        placedWord.setAttribute('data-type', originalBox.getAttribute('data-type'));
        placedWord.setAttribute('data-index', originalBox.getAttribute('data-index'));
        
        // Copy content and styling from original box
        const wordText = originalBox.querySelector('.word-text').cloneNode(true);
        placedWord.appendChild(wordText);
        
        // Copy styling
        placedWord.style.fontFamily = fontSettings.family;
        placedWord.style.fontSize = fontSettings.size;

        if (parentZone.parentElement.classList.contains('mulan')) {
            placedWord.classList.add('mulan-placed-word');
        }

        placedWord.style.color = fontSettings.color;
        placedWord.style.backgroundColor = fontSettings.backgroundColor;
        placedWord.style.padding = fontSettings.padding;
        placedWord.style.border = fontSettings.border;
        placedWord.style.borderRadius = fontSettings.borderRadius;
        placedWord.style.boxShadow = fontSettings.boxShadow;
        placedWord.style.fontStyle = fontSettings.fontStyle;
        
        // Calculate position relative to drop zone
        const zoneRect = parentZone.getBoundingClientRect();
        const x = clientX - zoneRect.left - currentState.offsetX;
        const y = clientY - zoneRect.top - currentState.offsetY;
        
        placedWord.style.left = `${Math.max(0, x)}px`;
        placedWord.style.top = `${Math.max(0, y)}px`;
        
        // Add event listeners for repositioning
        makePlacedWordInteractive(placedWord, originalBox);
        
        // Add to drop zone
        parentZone.appendChild(placedWord);
        
        return placedWord;
    }
    
    // Make placed word interactive (draggable and selectable)
    function makePlacedWordInteractive(element, originalBox) {
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        let startX, startY, initialX, initialY;
        
        // Click event for selection
        element.addEventListener('click', function(e) {
            if (!isDragging) {
                e.stopPropagation();
                selectPlacedWord(this);
            }
        });
        
        // Mouse events for dragging
        element.addEventListener('mousedown', function(e) {
            if (e.button === 0) { // Left mouse button
                e.preventDefault();
                startDraggingPlacedWord(e, this, originalBox);
            }
        });
        
        function startDraggingPlacedWord(e, element, originalBox) {
            isDragging = false;
            
            // Get initial position and offset
            const rect = element.getBoundingClientRect();
            
            dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            
            // Add global mouse event listeners
            document.addEventListener('mousemove', dragPlacedWord);
            document.addEventListener('mouseup', stopDraggingPlacedWord);
        }
        
        function dragPlacedWord(e) {
            e.preventDefault();
            
            isDragging = true;
            element.style.zIndex = '1000';
            
            // Calculate new position
            const parentRect = element.parentNode.getBoundingClientRect();
            let newX = e.clientX - parentRect.left - dragOffset.x;
            let newY = e.clientY - parentRect.top - dragOffset.y;
            
            // Constrain to parent bounds
            newX = Math.max(0, Math.min(newX, parentRect.width - element.offsetWidth));
            newY = Math.max(0, Math.min(newY, parentRect.height - element.offsetHeight));
            
            element.style.left = `${newX}px`;
            element.style.top = `${newY}px`;
        }
        
        function stopDraggingPlacedWord(e) {
            isDragging = false;
            element.style.zIndex = '20';
            
            // Check if dropped on a word container (to return the word)
            const wordContainers = document.querySelectorAll('.word-container');
            let isDroppedOnWordContainer = false;
            
            wordContainers.forEach(container => {
                const rect = container.getBoundingClientRect();
                if (e && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                    isDroppedOnWordContainer = true;
                }
            });
            
            if (isDroppedOnWordContainer) {
                // Return the word to its original box
                returnWordToOriginalBox(element, originalBox);
            }
            
            // Remove global event listeners
            document.removeEventListener('mousemove', dragPlacedWord);
            document.removeEventListener('mouseup', stopDraggingPlacedWord);
        }
    }
    
    // Select placed word
    function selectPlacedWord(wordElement) {
        // Deselect previously selected word box
        if (currentState.selectedWordBox) {
            currentState.selectedWordBox.classList.remove('selected');
        }
        
        // Select the clicked word box
        wordElement.classList.add('selected');
        currentState.selectedWordBox = wordElement;
        
        // Keep optional size controls in sync if they exist in the page.
        syncSizeControls(wordElement);
    }

    function syncSizeControls(element) {
        if (
            typeof widthSlider === 'undefined' ||
            typeof heightSlider === 'undefined' ||
            typeof widthValue === 'undefined' ||
            typeof heightValue === 'undefined'
        ) {
            return;
        }
        
        const width = parseInt(element.style.width, 10) || element.offsetWidth || 0;
        const height = parseInt(element.style.height, 10) || element.offsetHeight || 0;
        widthSlider.value = width;
        heightSlider.value = height;
        widthValue.textContent = width;
        heightValue.textContent = height;
    }
    
    // Reset dragged word position
    function resetDraggedWordPosition(wordBox) {
        wordBox.style.position = '';
        wordBox.style.left = '';
        wordBox.style.top = '';
        wordBox.style.zIndex = '';
    }

    // Return word to its original box
    function returnWordToOriginalBox(wordElement, originalBox) {
        if (!originalBox) return;

        // Remove the word element from its current parent
        if (wordElement.parentNode) {
            wordElement.parentNode.removeChild(wordElement);
        }

        // Reset the word element's styles
        wordElement.style.position = '';
        wordElement.style.left = '';
        wordElement.style.top = '';
        wordElement.style.zIndex = '';
        wordElement.style.width = '';
        wordElement.style.height = '';
        wordElement.classList.remove('selected');

        // Add the word element back to its original box
        originalBox.appendChild(wordElement);

        // Update the current state
        if (currentState.selectedWordBox === wordElement) {
            currentState.selectedWordBox = null;
        }

        // Update the word list
        updateWordList();
    }
    
    // Switch text display
    function switchTextDisplay(textType) {
        // Update button state
        selectorBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-text') === textType) {
                btn.classList.add('active');
            }
        });
        
        // Update main image display
        mainImageContainers.forEach(container => {
            container.style.display = 'none';
        });
        
        const targetContainer = document.querySelector(`.main-image-container.${textType}`);
        if (targetContainer) {
            targetContainer.style.display = 'block';
        }
        
        // Update current state
        currentState.activeText = textType;
        
        // Also update Step 3 original text to match
        switchOriginalText(textType);
    }
    
    // Switch original text in Step 3
    function switchOriginalText(textType) {
        // Update button state in Step 3
        const originalSelectorBtns = document.querySelectorAll('.selector-btn[data-target="original"]');
        originalSelectorBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-text') === textType) {
                btn.classList.add('active');
            }
        });
        
        // Update original text display
        const originalTexts = document.querySelectorAll('.original-text');
        originalTexts.forEach(text => {
            text.style.display = 'none';
        });
        
        const targetOriginalText = document.querySelector(`.original-text.${textType}-text`);
        if (targetOriginalText) {
            targetOriginalText.style.display = 'block';
        }
    }
    window.switchOriginalText = switchOriginalText;
    
    // Switch word source for specific category
    function switchWordSource(sourceType, category) {
        // Update button state for the specific category
        const categoryButtons = document.querySelectorAll(`.word-source-btn[data-category="${category}"]`);
        categoryButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-source') === sourceType) {
                btn.classList.add('active');
            }
        });
        
        // Hide all word boxes for this category
        const containers = document.querySelectorAll(`.word-boxes.${category}-container .word-boxes`);
        containers.forEach(container => {
            container.style.display = 'none';
        });
        
        // Also hide by class name pattern
        document.querySelectorAll(`.word-boxes`).forEach(container => {
            if (container.classList.contains(`${category}`) || container.classList.contains(`medea-${category}`) || container.classList.contains(`mulan-${category}`)) {
                container.style.display = 'none';
            }
        });
        
        // Show the target container
        const targetContainer = document.querySelector(`.${sourceType}-${category}`);
        if (targetContainer) {
            targetContainer.style.display = 'flex';
        }
    }
    

    
    // Reset all
    function resetAll() {
        // Remove all placed words
        document.querySelectorAll('.placed-word').forEach(word => {
            word.remove();
        });
        
        // Show all word boxes
        document.querySelectorAll('.word-box').forEach(box => {
            box.style.display = 'block';
            box.style.position = '';
            box.style.left = '';
            box.style.top = '';
            box.style.zIndex = '';
            box.classList.remove('selected', 'dragging');
        });
        
        // Clear selection
        currentState.selectedWordBox = null;
        
        // Reset placed words tracking
        currentState.placedWords = {
            medea: {
                pronouns: [],
                verbs: []
            },
            mulan: {
                pronouns: [],
                verbs: []
            }
        };
    }

    // Update remaining word counts (placeholder to prevent initialization errors)
    function updateRemainingCounts() {
        // If you add count display elements later, update them here.
    }

    // Update word list after returning a word to its original spot
    function updateWordList() {
        // Placeholder: no action needed for current layout.
    }
    
    // Bind event listeners
    function bindEventListeners() {
        // Text selector buttons
        selectorBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const textType = this.getAttribute('data-text');
                switchTextDisplay(textType);
            });
        });
        
        // Word source buttons
        wordSourceBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const sourceType = this.getAttribute('data-source');
                const category = this.getAttribute('data-category');
                if (category) {
                    switchWordSource(sourceType, category);
                }
            });
        });
        
        // Step navigation buttons
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const step = this.getAttribute('data-step');
                const stepElement = document.getElementById(`step-${step}`);
                if (stepElement) {
                    stepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Complete button - captures current collage state for Step 3
        const completeBtn = document.querySelector('.complete-btn');
        if (completeBtn) {
            completeBtn.addEventListener('click', function() {
                captureCollageForStep3();
            });
        }

        // Reset button
        resetBtn.addEventListener('click', resetAll);
        
        // Click on body to deselect all
        document.body.addEventListener('click', function(e) {
            if (!e.target.closest('.word-box') && !e.target.closest('.placed-word')) {
                if (currentState.selectedWordBox) {
                    currentState.selectedWordBox.classList.remove('selected');
                    currentState.selectedWordBox = null;
                }
            }
        });
        
        // Drop zones
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('drag-over');
            });
            
            zone.addEventListener('dragleave', function() {
                this.classList.remove('drag-over');
            });
        });
    }
    
    // Initialize the application
    init();
    
    // Initialize AI Gallery functionality
    initAIGallery();
    
    // Initialize original text switching
    initOriginalTextSwitching();
});

// Initialize AI Gallery functionality
function initAIGallery() {
    const thumbnailItems = document.querySelectorAll('.thumbnail-item');
    const previewImage = document.querySelector('.preview-image');
    const previewPlaceholder = document.querySelector('.preview-placeholder');
    const selectedPlatformName = document.querySelector('.selected-platform-name');
    const aiImageDisplay = document.getElementById('ai-image-display');
    
    thumbnailItems.forEach(thumbnail => {
        thumbnail.addEventListener('click', function(e) {
            e.stopPropagation();
            // Remove selected class from all thumbnails
            thumbnailItems.forEach(item => item.classList.remove('selected'));
            
            // Add selected class to clicked thumbnail
            this.classList.add('selected');
            
            // Get the image path and platform from the clicked thumbnail
            const platform = this.getAttribute('data-platform');
            const img = this.querySelector('img');
            const imagePath = img ? img.src : this.getAttribute('data-image');
            
            // Update the preview image
            previewImage.src = imagePath;
            previewImage.alt = `${platform} Interpretation`;
            
            // Show the image and hide the placeholder
            previewImage.style.display = 'block';
            previewPlaceholder.style.display = 'none';
            
            // Update the selected platform display
            selectedPlatformName.textContent = platform;
            
            // Update comparison section with selected image
            if (aiImageDisplay) {
                aiImageDisplay.innerHTML = '';
                const comparisonImg = document.createElement('img');
                comparisonImg.src = imagePath;
                comparisonImg.alt = `${platform} Interpretation`;
                aiImageDisplay.appendChild(comparisonImg);
            }
            
            // Store in global state
            currentState.selectedImage = imagePath;
            currentState.selectedImagePlatform = platform;
        });
    });
}

// Initialize original text switching
function initOriginalTextSwitching() {
    // Add event listeners to Step 3 original text selector buttons
    const originalSelectorBtns = document.querySelectorAll('.selector-btn[data-target="original"]');
    originalSelectorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const textType = btn.getAttribute('data-text');
            if (typeof window.switchOriginalText === 'function') {
                window.switchOriginalText(textType);
            }
        });
    });
}

/**
 * Capture the current collage state for a specific text
 * This function:
 * 1. Finds the active collage container
 * 2. Clones it (including image and placed words)
 * 3. Saves it to state.savedReconstructions[textType]
 * 4. Updates Step 3 display
 */
function captureCollageForStep3() {
    if (!currentState) return;
    
    // Get the currently active text
    const activeText = currentState.activeText;
    
    // Find the active collage container
    const activeContainer = document.querySelector(`.main-image-container.${activeText}`);
    if (!activeContainer) {
        console.error('No active collage container found');
        return;
    }
    
    const sourceRect = activeContainer.getBoundingClientRect();
    const sourceImage = activeContainer.querySelector('.main-image');
    const imageRect = sourceImage ? sourceImage.getBoundingClientRect() : sourceRect;
    const originalWidth = imageRect.width || sourceRect.width;
    const originalHeight = imageRect.height || sourceRect.height;
    const imageOffsetX = imageRect.left - sourceRect.left;
    const imageOffsetY = imageRect.top - sourceRect.top;
    
    // Clone the entire active container (image + drop-zone + all placed words).
    // Important fix: placed words live inside .drop-zone, so the clone must keep it.
    const collageClone = activeContainer.cloneNode(true);
    collageClone.classList.add('step3-collage-clone');
    collageClone.dataset.originalWidth = originalWidth;
    collageClone.dataset.originalHeight = originalHeight;
    collageClone.style.width = `${originalWidth}px`;
    collageClone.style.height = `${originalHeight}px`;
    collageClone.style.maxWidth = 'none';
    collageClone.style.maxHeight = 'none';
    collageClone.style.display = 'block';
    
    const clonedImage = collageClone.querySelector('.main-image');
    if (clonedImage) {
        clonedImage.style.width = `${originalWidth}px`;
        clonedImage.style.height = `${originalHeight}px`;
        clonedImage.style.maxWidth = 'none';
        clonedImage.style.maxHeight = 'none';
        clonedImage.style.margin = '0';
    }
    
    const clonedDropZone = collageClone.querySelector('.drop-zone');
    if (clonedDropZone) {
        clonedDropZone.classList.remove('drag-over');
        clonedDropZone.style.pointerEvents = 'none';
        clonedDropZone.style.width = `${originalWidth}px`;
        clonedDropZone.style.height = `${originalHeight}px`;
    }
    
    collageClone.querySelectorAll('.placed-word').forEach(word => {
        word.classList.remove('selected', 'dragging');
        word.style.pointerEvents = 'none';
        // The Step 1 drop-zone can be wider than the image; save word positions against the image itself.
        const wordLeft = parseFloat(word.style.left);
        const wordTop = parseFloat(word.style.top);
        const savedLeft = (Number.isFinite(wordLeft) ? wordLeft : 0) - imageOffsetX;
        const savedTop = (Number.isFinite(wordTop) ? wordTop : 0) - imageOffsetY;
        word.style.left = `${savedLeft}px`;
        word.style.top = `${savedTop}px`;
    });
    
    // Save the cloned element to state
    currentState.savedReconstructions[activeText] = collageClone;
    setReconstructionSelectorActive(activeText);
    
    // Update the Step 3 display to show this reconstruction
    updateReconstructionDisplay(activeText);
    
    // Show success feedback
    showCompleteFeedback(activeText);
}

/**
 * Update the reconstruction display in Step 3
 * This shows the saved collage for the specified text
 */
function updateReconstructionDisplay(textType) {
    const reconstructionDisplay = document.getElementById('reconstruction-display');
    if (!reconstructionDisplay) return;
    if (!currentState) return;
    
    // Get the saved reconstruction for this text
    const savedCollage = currentState.savedReconstructions[textType];
    
    if (!savedCollage) {
        reconstructionDisplay.innerHTML = '<div class="comparison-placeholder">No reconstruction saved for this text. Click Complete to save.</div>';
        return;
    }
    
    // Clone the saved collage for display
    const displayClone = savedCollage.cloneNode(true);
    displayClone.classList.add('step3-collage-clone');
    displayClone.style.transform = '';
    
    const previewFrame = document.createElement('div');
    previewFrame.className = 'reconstruction-preview-frame';
    previewFrame.appendChild(displayClone);
    
    // Clear and update the display before measuring available space
    reconstructionDisplay.innerHTML = '';
    reconstructionDisplay.appendChild(previewFrame);
    
    fitReconstructionClone(previewFrame, displayClone);
}

/**
 * Scale the cloned collage as one unit so the base image and placed words stay aligned.
 */
function fitReconstructionClone(previewFrame, displayClone) {
    const reconstructionDisplay = document.getElementById('reconstruction-display');
    if (!reconstructionDisplay) return;
    
    const originalWidth = parseFloat(displayClone.dataset.originalWidth) || displayClone.offsetWidth;
    const originalHeight = parseFloat(displayClone.dataset.originalHeight) || displayClone.offsetHeight;
    if (!originalWidth || !originalHeight) return;
    
    const availableWidth = Math.max(1, reconstructionDisplay.clientWidth - 40);
    const availableHeight = Math.max(1, reconstructionDisplay.clientHeight - 40);
    const scale = Math.min(1, availableWidth / originalWidth, availableHeight / originalHeight);
    
    displayClone.style.transformOrigin = 'top left';
    displayClone.style.transform = `scale(${scale})`;
    previewFrame.style.width = `${originalWidth * scale}px`;
    previewFrame.style.height = `${originalHeight * scale}px`;
}

function setReconstructionSelectorActive(textType) {
    document.querySelectorAll('.reconstruction-selector-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-text') === textType);
    });
}

/**
 * Initialize reconstruction selector in Step 3
 * Allows user to switch between medea and mulan reconstructions
 */
function initReconstructionSelector() {
    const reconstructionSelectorBtns = document.querySelectorAll('.reconstruction-selector-btn');
    reconstructionSelectorBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const textType = this.getAttribute('data-text');
            
            // Update active state of buttons
            reconstructionSelectorBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update the display
            updateReconstructionDisplay(textType);
        });
    });
}

/**
 * Show feedback when Complete button is clicked
 */
function showCompleteFeedback(textType) {
    const reconstructionDisplay = document.getElementById('reconstruction-display');
    if (!reconstructionDisplay) return;
    
    // Add temporary success message
    const feedbackMsg = document.createElement('div');
    feedbackMsg.className = 'collage-success-message';
    feedbackMsg.textContent = `✓ ${textType.charAt(0).toUpperCase() + textType.slice(1)} reconstruction saved!`;
    feedbackMsg.style.textAlign = 'center';
    feedbackMsg.style.fontSize = '0.9rem';
    feedbackMsg.style.color = '#d4a76a';
    feedbackMsg.style.fontStyle = 'italic';
    feedbackMsg.style.marginTop = '10px';
    
    reconstructionDisplay.appendChild(feedbackMsg);
    
    // Auto-remove after 2 seconds
    setTimeout(() => {
        if (feedbackMsg.parentNode) {
            feedbackMsg.remove();
        }
    }, 2000);
}
