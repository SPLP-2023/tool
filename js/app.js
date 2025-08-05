// Global variables
let selectedFailuresList = [];
let earthResistances = [];
let uploadedImages = {};
let systemDetails = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    document.getElementById('testDate').valueAsDate = new Date();
});

// Function to fix EXIF orientation (smart detection for portrait vs landscape)
function fixImageOrientation(file) {
    return new Promise((resolve) => {
        EXIF.getData(file, function() {
            const orientation = EXIF.getTag(this, "Orientation") || 1;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Determine if image is naturally landscape or portrait shaped
                    const isLandscapeShape = img.width > img.height;
                    const isPortraitShape = img.height > img.width;
                    
                    // Smart logic: only apply rotation to landscape-shaped images that need it
                    if (isLandscapeShape && (orientation === 6 || orientation === 8)) {
                        // Apply rotation for landscape images
                        if (orientation === 6) {
                            // Rotate 90° clockwise
                            canvas.width = img.height;
                            canvas.height = img.width;
                            ctx.rotate(90 * Math.PI / 180);
                            ctx.translate(0, -canvas.width);
                        } else if (orientation === 8) {
                            // Rotate 90° counter-clockwise  
                            canvas.width = img.height;
                            canvas.height = img.width;
                            ctx.rotate(-90 * Math.PI / 180);
                            ctx.translate(-canvas.height, 0);
                        }
                    } else {
                        // For portrait-shaped images or normal orientation, don't rotate
                        canvas.width = img.width;
                        canvas.height = img.height;
                    }
                    
                    ctx.drawImage(img, 0, 0);
                    
                    // Convert back with compression
                    const correctedImageData = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(correctedImageData);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    });
}

// Collapsible functionality
function toggleCollapsible(id) {
    const content = document.getElementById(id);
    content.classList.toggle('active');
}

// System detail selection functionality
function selectSystemDetail(category, value, element, isOther = false) {
    if (!systemDetails[category]) {
        systemDetails[category] = [];
    }
    
    if (element.classList.contains('selected')) {
        element.classList.remove('selected');
        systemDetails[category] = systemDetails[category].filter(item => item !== value);
        
        if (isOther) {
            document.getElementById(category + 'Other').classList.add('hidden');
            document.getElementById(category + 'Other').value = '';
        }
    } else {
        element.classList.add('selected');
        if (!systemDetails[category].includes(value)) {
            systemDetails[category].push(value);
        }
        
        if (isOther) {
            document.getElementById(category + 'Other').classList.remove('hidden');
        }
    }
}

function updateOtherValue(category, value) {
    if (!systemDetails[category]) {
        systemDetails[category] = [];
    }
    
    systemDetails[category] = systemDetails[category].filter(item => !item.startsWith('Other:'));
    
    if (value.trim()) {
        systemDetails[category].push('Other: ' + value.trim());
    }
}

// Standards and failures functionality
function updateFailuresList() {
    const standard = document.getElementById('standard').value;
    const container = document.getElementById('failuresContainer');
    const failuresList = document.getElementById('failuresList');
    
    if (standard && standardFailures[standard]) {
        container.classList.remove('hidden');
        failuresList.innerHTML = '';
        
        // Clear previous selections when changing standards
        selectedFailuresList = [];
        updateSelectedFailures();
        
        standardFailures[standard].forEach((failureObj, index) => {
            const failureDiv = document.createElement('div');
            failureDiv.className = 'failure-option';
            failureDiv.textContent = failureObj.failure;
            failureDiv.onclick = () => selectFailure(failureObj, failureDiv);
            failuresList.appendChild(failureDiv);
        });
    } else {
        container.classList.add('hidden');
        selectedFailuresList = [];
        updateSelectedFailures();
    }
}

function selectFailure(failureObj, element) {
    if (element.classList.contains('selected')) {
        element.classList.remove('selected');
        selectedFailuresList = selectedFailuresList.filter(f => f.failure !== failureObj.failure);
    } else {
        element.classList.add('selected');
        selectedFailuresList.push({
            failure: failureObj.failure,
            reference: failureObj.ref,
            requirement: failureObj.req,
            comment: '',
            image: null
        });
    }
    updateSelectedFailures();
}

function updateSelectedFailures() {
    const container = document.getElementById('selectedFailures');
    container.innerHTML = '';
    
    selectedFailuresList.forEach((item, index) => {
        const failureDiv = document.createElement('div');
        failureDiv.className = 'failure-item';
        failureDiv.innerHTML = `
            <h4>${item.failure}</h4>
            <div class="failure-reference">${item.reference}</div>
            <div class="minimum-requirement">
                <strong>Minimum Requirement:</strong> ${item.requirement}
            </div>
            <div class="form-group">
                <label>Comment:</label>
                <textarea onchange="updateFailureComment(${index}, this.value)" placeholder="Add detailed comments about this failure...">${item.comment}</textarea>
            </div>
            <div class="form-group">
                <label>Image:</label>
                <div class="image-upload" onclick="document.getElementById('failureImage${index}').click()">
                    <input type="file" id="failureImage${index}" accept="image/*" class="hidden-file-input" aria-label="Upload image for failure documentation" onchange="handleFailureImage(${index}, this)">
                    <div id="failureImagePreview${index}">${item.image ? 'Image uploaded' : 'Click to upload image'}</div>
                </div>
            </div>
        `;
        container.appendChild(failureDiv);
    });
}

function updateFailureComment(index, comment) {
    selectedFailuresList[index].comment = comment;
}

// UPDATED: handleFailureImage with EXIF rotation fix
function handleFailureImage(index, input) {
    if (input.files[0]) {
        const file = input.files[0];
        
        // Show processing message
        document.getElementById(`failureImagePreview${index}`).textContent = 'Processing image...';
        
        fixImageOrientation(file).then(correctedImageData => {
            selectedFailuresList[index].image = file;
            selectedFailuresList[index].imageData = correctedImageData;
            document.getElementById(`failureImagePreview${index}`).textContent = 'Image uploaded';
        }).catch(error => {
            console.error('Error processing failure image:', error);
            // Fallback
            const reader = new FileReader();
            reader.onload = function(e) {
                selectedFailuresList[index].imageData = e.target.result;
            };
            reader.readAsDataURL(file);
            selectedFailuresList[index].image = file;
            document.getElementById(`failureImagePreview${index}`).textContent = 'Image uploaded (may need rotation)';
        });
    }
}

// Earth resistance testing functionality
function generateEarthInputs() {
    const numEarths = parseInt(document.getElementById('numEarths').value) || 0;
    const container = document.getElementById('earthInputs');
    
    if (numEarths > 0) {
        container.style.display = 'block';
        container.innerHTML = '<h4>Enter Earth Resistance Values (Ohm):</h4>';
        
        for (let i = 1; i <= numEarths; i++) {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'earth-input-group';
            inputGroup.innerHTML = `
                <label>E ${i}:</label>
                <input type="number" step="0.01" min="0" onchange="updateEarthResistance(${i-1}, this.value)" placeholder="0.00">
                <span>Ohm</span>
            `;
            container.appendChild(inputGroup);
        }
        earthResistances = new Array(numEarths).fill(0);
    } else {
        container.style.display = 'none';
        document.getElementById('earthResult').classList.add('hidden');
    }
}

function updateEarthResistance(index, value) {
    earthResistances[index] = parseFloat(value) || 0;
    calculateOverallResistance();
}

function calculateOverallResistance() {
    if (earthResistances.length > 0 && earthResistances.some(r => r > 0)) {
        const validResistances = earthResistances.filter(r => r > 0);
        const reciprocalSum = validResistances.reduce((sum, r) => sum + (1/r), 0);
        const overallResistance = 1 / reciprocalSum;
        
        document.getElementById('earthResult').classList.remove('hidden');
        document.getElementById('overallResistance').innerHTML = `
            <strong>${overallResistance.toFixed(3)} Ohm</strong>
            <br><small>Calculated from ${validResistances.length} earth electrode(s)</small>
        `;
    } else {
        document.getElementById('earthResult').classList.add('hidden');
    }
}

// UPDATED: handleImageUpload with EXIF rotation fix
function handleImageUpload(input, previewId) {
    if (input.files[0]) {
        const file = input.files[0];
        
        // Show loading message
        document.getElementById(previewId).textContent = 'Processing image...';
        
        // Fix orientation and compress
        fixImageOrientation(file).then(correctedImageData => {
            uploadedImages[previewId] = file;
            uploadedImages[previewId + '_data'] = correctedImageData;
            document.getElementById(previewId).textContent = 'Image uploaded successfully';
        }).catch(error => {
            console.error('Error processing image:', error);
            // Fallback to original method
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedImages[previewId + '_data'] = e.target.result;
            };
            reader.readAsDataURL(file);
            uploadedImages[previewId] = file;
            document.getElementById(previewId).textContent = 'Image uploaded (orientation may need manual correction)';
        });
    }
}

// UPDATED: handleMultipleImageUpload with EXIF rotation fix
function handleMultipleImageUpload(input, previewId) {
    if (input.files.length > 0) {
        const files = Array.from(input.files);
        uploadedImages[previewId] = files;
        uploadedImages[previewId + '_data'] = [];
        
        // Show processing message
        document.getElementById(previewId).textContent = 'Processing images...';
        
        let processedCount = 0;
        
        files.forEach((file, index) => {
            fixImageOrientation(file).then(correctedImageData => {
                uploadedImages[previewId + '_data'][index] = correctedImageData;
                processedCount++;
                
                // Update preview when all images are processed
                if (processedCount === files.length) {
                    document.getElementById(previewId).textContent = `${files.length} image(s) uploaded`;
                }
            }).catch(error => {
                console.error('Error processing image:', error);
                // Fallback for this image
                const reader = new FileReader();
                reader.onload = function(e) {
                    uploadedImages[previewId + '_data'][index] = e.target.result;
                };
                reader.readAsDataURL(file);
                processedCount++;
                
                if (processedCount === files.length) {
                    document.getElementById(previewId).textContent = `${files.length} image(s) uploaded (some may need manual rotation)`;
                }
            });    
            // Register service worker
               if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                 navigator.serviceWorker
                 .register('/service-worker.js')
                 .then(registration => {
                  console.log('✅ Service Worker registered:', registration.scope);
          })
        .catch(error => {
         console.error('❌ Service Worker registration failed:', error);
      });
  });
}
