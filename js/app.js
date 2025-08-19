// Global variables
let selectedFailuresList = [];
let earthResistances = [];
let earthTableData = [];
let uploadedImages = {};
let systemDetails = {};


// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const testDateElement = document.getElementById('testDate');
    if (testDateElement) {
        testDateElement.valueAsDate = new Date();
    }
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
    if (content) {
        content.classList.toggle('active');
    }
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
            const otherInput = document.getElementById(category + 'Other');
            if (otherInput) {
                otherInput.classList.add('hidden');
                otherInput.value = '';
            }
        }
    } else {
        element.classList.add('selected');
        if (!systemDetails[category].includes(value)) {
            systemDetails[category].push(value);
        }
        
        if (isOther) {
            const otherInput = document.getElementById(category + 'Other');
            if (otherInput) {
                otherInput.classList.remove('hidden');
            }
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
    const standardElement = document.getElementById('standard');
    const container = document.getElementById('failuresContainer');
    const failuresList = document.getElementById('failuresList');
    
    if (!standardElement || !container || !failuresList) {
        return;
    }
    
    const standard = standardElement.value;
    
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
    if (!container) return;
    
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
    if (selectedFailuresList[index]) {
        selectedFailuresList[index].comment = comment;
    }
}

// Handle failure image with EXIF rotation fix
function handleFailureImage(index, input) {
    if (input.files[0]) {
        const file = input.files[0];
        
        // Show processing message
        const preview = document.getElementById(`failureImagePreview${index}`);
        if (preview) {
            preview.textContent = 'Processing image...';
        }
        
        fixImageOrientation(file).then(correctedImageData => {
            if (selectedFailuresList[index]) {
                selectedFailuresList[index].image = file;
                selectedFailuresList[index].imageData = correctedImageData;
            }
            if (preview) {
                preview.textContent = 'Image uploaded';
            }
        }).catch(error => {
            console.error('Error processing failure image:', error);
            // Fallback
            const reader = new FileReader();
            reader.onload = function(e) {
                if (selectedFailuresList[index]) {
                    selectedFailuresList[index].imageData = e.target.result;
                }
            };
            reader.readAsDataURL(file);
            if (selectedFailuresList[index]) {
                selectedFailuresList[index].image = file;
            }
            if (preview) {
                preview.textContent = 'Image uploaded (may need rotation)';
            }
        });
    }
}

// Dropdown options for earth table
const earthDropdownOptions = {
    testClamp: ['', 'Stainless', 'Bi-Metallic', 'G-Clamp', 'A-Clamp', 'Sq. Clamp', 'Oblong', 'B-Bond', 'Coffin Clamp', 'Other'],
    pitType: ['', 'Concrete', 'Polymer', 'None', 'Other'],
    testType: ['', 'Dead', 'FOP', 'Continuity', 'Reference', 'No Test'],
    groundType: ['', 'Gravel', 'Tarmac', 'Soft', 'Slabs', 'Concrete', 'Astro', 'Other'],
    earthType: ['', 'Earth Rod', 'Earth Matt', 'B-Ring', 'REF', 'Foundations', 'Other', 'Unknown']
};

// Generate earth table based on number input
function generateEarthTable() {
    const numEarthsElement = document.getElementById('numEarths');
    const container = document.getElementById('earthTableContainer');
    const tableBody = document.getElementById('earthTableBody');
    
    if (!numEarthsElement || !container || !tableBody) return;
    
    const numEarths = parseInt(numEarthsElement.value) || 0;
    
    if (numEarths > 0) {
        container.classList.remove('hidden');
        tableBody.innerHTML = '';
        
        // Initialize earth data array
        earthTableData = [];
        
        // Generate table rows
        for (let i = 1; i <= numEarths; i++) {
            const row = createEarthTableRow(i);
            tableBody.appendChild(row);
            
            // Initialize data object
            earthTableData.push({
                earthNumber: i,
                resistance: 0,
                testClamp: '',
                pitType: '',
                testType: '',
                groundType: '',
                earthType: '',
                comment: ''
            });
        }
        
        // Clear overall resistance
        updateOverallResistance();
    } else {
        container.classList.add('hidden');
        earthTableData = [];
        const earthResult = document.getElementById('earthResult');
        if (earthResult) {
            earthResult.classList.add('hidden');
        }
    }
}

// Create a single earth table row
function createEarthTableRow(earthNumber) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="earth-number">E${earthNumber}</td>
        <td>
            <input type="number" 
                   step="0.01" 
                   min="0" 
                   placeholder="0.00"
                   onchange="updateEarthResistance(${earthNumber - 1}, this.value)">
        </td>
        <td>
            <select onchange="updateEarthDropdown(${earthNumber - 1}, 'testClamp', this.value)">
                ${createDropdownOptions('testClamp')}
            </select>
        </td>
        <td>
            <select onchange="updateEarthDropdown(${earthNumber - 1}, 'pitType', this.value)">
                ${createDropdownOptions('pitType')}
            </select>
        </td>
        <td>
            <select onchange="updateEarthDropdown(${earthNumber - 1}, 'testType', this.value)">
                ${createDropdownOptions('testType')}
            </select>
        </td>
        <td>
            <select onchange="updateEarthDropdown(${earthNumber - 1}, 'groundType', this.value)">
                ${createDropdownOptions('groundType')}
            </select>
        </td>
        <td>
            <select onchange="updateEarthDropdown(${earthNumber - 1}, 'earthType', this.value)">
                ${createDropdownOptions('earthType')}
            </select>
        </td>
        <td>
            <input type="text" 
                   placeholder="Comment..."
                   onchange="updateEarthComment(${earthNumber - 1}, this.value)">
        </td>
    `;
    return row;
}

// Create dropdown options HTML
function createDropdownOptions(optionType) {
    const options = earthDropdownOptions[optionType];
    return options.map(option => `<option value="${option}">${option}</option>`).join('');
}

// Update earth resistance value
function updateEarthResistance(index, value) {
    if (earthTableData[index]) {
        earthTableData[index].resistance = parseFloat(value) || 0;
        calculateOverallResistance();
    }
}

// Update dropdown values with auto-populate functionality
function updateEarthDropdown(index, field, value) {
    if (earthTableData[index]) {
        earthTableData[index][field] = value;
        
        // Auto-populate: If this is the first row (index 0), copy to all rows below
        if (index === 0 && value !== '') {
            for (let i = 1; i < earthTableData.length; i++) {
                earthTableData[i][field] = value;
                
                // Update the visual dropdown
                const tableBody = document.getElementById('earthTableBody');
                if (tableBody) {
                    const targetRow = tableBody.children[i];
                    if (targetRow) {
                        const fieldMap = {
                            'testClamp': 2,
                            'pitType': 3,
                            'testType': 4,
                            'groundType': 5,
                            'earthType': 6
                        };
                        const columnIndex = fieldMap[field];
                        if (columnIndex) {
                            const select = targetRow.children[columnIndex].querySelector('select');
                            if (select) {
                                select.value = value;
                            }
                        }
                    }
                }
            }
        }
    }
}

// Update earth comment
function updateEarthComment(index, value) {
    if (earthTableData[index]) {
        earthTableData[index].comment = value;
    }
}

// Calculate overall resistance (enhanced version)
function calculateOverallResistance() {
    if (earthTableData.length > 0) {
        const validResistances = earthTableData
            .map(earth => earth.resistance)
            .filter(r => r > 0);
        
        if (validResistances.length > 0) {
            const reciprocalSum = validResistances.reduce((sum, r) => sum + (1/r), 0);
            const overallResistance = 1 / reciprocalSum;
            
            const earthResult = document.getElementById('earthResult');
            const overallResistanceElement = document.getElementById('overallResistance');
            
            if (earthResult && overallResistanceElement) {
                earthResult.classList.remove('hidden');
                overallResistanceElement.textContent = overallResistance.toFixed(2) + ' Ω';
                overallResistanceElement.className = 'overall-resistance-value';
            }
        } else {
            const earthResult = document.getElementById('earthResult');
            if (earthResult) {
                earthResult.classList.add('hidden');
            }
        }
    }
}

// Get earth table data for PDF generation and auto-save
function getEarthTableData() {
    return {
        numEarths: earthTableData.length,
        earthData: earthTableData,
        overallResistance: calculateOverallResistanceValue()
    };
}

// Calculate overall resistance value (for data export)
function calculateOverallResistanceValue() {
    if (earthTableData.length > 0) {
        const validResistances = earthTableData
            .map(earth => earth.resistance)
            .filter(r => r > 0);
        
        if (validResistances.length > 0) {
            const reciprocalSum = validResistances.reduce((sum, r) => sum + (1/r), 0);
            return (1 / reciprocalSum);
        }
    }
    return 0;
}

// Validate earth table (optional - for future use)
function validateEarthTable() {
    let isValid = true;
    const errors = [];
    
    earthTableData.forEach((earth, index) => {
        if (earth.resistance < 0) {
            errors.push(`E${index + 1}: Resistance cannot be negative`);
            isValid = false;
        }
    });
    
    return { isValid, errors };
}

// Handle single image upload with EXIF rotation fix
function handleImageUpload(input, previewId) {
    if (input.files[0]) {
        const file = input.files[0];
        
        // Show loading message
        const preview = document.getElementById(previewId);
        if (preview) {
            preview.textContent = 'Processing image...';
        }
        
        // Fix orientation and compress
        fixImageOrientation(file).then(correctedImageData => {
            uploadedImages[previewId] = file;
            uploadedImages[previewId + '_data'] = correctedImageData;
            if (preview) {
                preview.textContent = 'Image uploaded successfully';
            }
        }).catch(error => {
            console.error('Error processing image:', error);
            // Fallback to original method
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedImages[previewId + '_data'] = e.target.result;
            };
            reader.readAsDataURL(file);
            uploadedImages[previewId] = file;
            if (preview) {
                preview.textContent = 'Image uploaded (orientation may need manual correction)';
            }
        });
    }
}

// Handle multiple image upload with EXIF rotation fix
function handleMultipleImageUpload(input, previewId) {
    if (input.files.length > 0) {
        const files = Array.from(input.files);
        uploadedImages[previewId] = files;
        uploadedImages[previewId + '_data'] = [];
        
        // Show processing message
        const preview = document.getElementById(previewId);
        if (preview) {
            preview.textContent = 'Processing images...';
        }
        
        let processedCount = 0;
        
        files.forEach((file, index) => {
            fixImageOrientation(file).then(correctedImageData => {
                uploadedImages[previewId + '_data'][index] = correctedImageData;
                processedCount++;
                
                // Update preview when all images are processed
                if (processedCount === files.length && preview) {
                    preview.textContent = `${files.length} image(s) uploaded`;
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
                
                if (processedCount === files.length && preview) {
                    preview.textContent = `${files.length} image(s) uploaded (some may need manual rotation)`;
                }
            });
        });
    }
}

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/tool/service-worker.js', {
                scope: '/tool/'
            })
            .then(registration => {
                console.log('✅ Service Worker registered:', registration.scope);
            })
            .catch(error => {
                console.error('❌ Service Worker registration failed:', error);
            });
    });
}


