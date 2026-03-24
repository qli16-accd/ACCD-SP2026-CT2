/**
 * Text Collage Interactive Webpage JavaScript
 * Implements word image dragging, dropping, resizing and selection functionality
 */

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
                "shines", "camps", "sit on", "posted", "saw", "male", "take place", 
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
    let currentState = {
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
        }
    };
    
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
        
        // Update size slider values to match selected word box
        const width = parseInt(wordBox.style.width);
        const height = parseInt(wordBox.style.height);
        widthSlider.value = width;
        heightSlider.value = height;
        widthValue.textContent = width;
        heightValue.textContent = height;
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

        // Check if placing on Mulan text - if so, reduce size by 50%
        const isMulanText = parentZone.parentElement.classList.contains('mulan');
        if (isMulanText) {
            placedWord.style.transform = 'scale(0.5)';
            placedWord.style.transformOrigin = 'center';
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
        
        function stopDraggingPlacedWord() {
            isDragging = false;
            element.style.zIndex = '20';
            
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
        
        // Update size slider values to match selected word box
        const width = parseInt(wordElement.style.width);
        const height = parseInt(wordElement.style.height);
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
    }
    
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
});