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

// Enhanced click outside handler
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.custom-dropdown');
    const dropdownList = document.getElementById('failuresDropdownList');
    const dropdownHeader = document.querySelector('.dropdown-header');
    
    // If clicking outside the dropdown, close it
    if (dropdown && !dropdown.contains(event.target)) {
        if (dropdownList && !dropdownList.classList.contains('hidden')) {
            dropdownList.classList.add('hidden');
            dropdownHeader.classList.remove('open');
        }
    }
    
    // If clicking on the arrow specifically, toggle
    if (event.target.classList.contains('dropdown-arrow')) {
        event.stopPropagation();
        toggleFailuresDropdown();
    }
});

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
    const dropdownList = document.getElementById('failuresDropdownList');
    
    if (standard && standardFailures[standard]) {
        container.classList.remove('hidden');
        dropdownList.innerHTML = '';
        
        // Clear previous selections when changing standards
        selectedFailuresList = [];
        updateDropdownText();
        
        standardFailures[standard].forEach((failureObj, index) => {
            const dropdownItem = document.createElement('div');
            dropdownItem.className = 'dropdown-item';
            dropdownItem.innerHTML = `
                <input type="checkbox" class="dropdown-checkbox" id="failure-${index}" onchange="toggleFailureSelection(${index}, this.checked)">
                <label for="failure-${index}" class="dropdown-item-text">${failureObj.failure}</label>
            `;
            dropdownList.appendChild(dropdownItem);
        });
    } else {
        container.classList.add('hidden');
        selectedFailuresList = [];
    }
}

function toggleFailuresDropdown() {
    const dropdownList = document.getElementById('failuresDropdownList');
    const dropdownHeader = document.querySelector('.dropdown-header');
    
    if (dropdownList.classList.contains('hidden')) {
        dropdownList.classList.remove('hidden');
        dropdownHeader.classList.add('open');
    } else {
        dropdownList.classList.add('hidden');
        dropdownHeader.classList.remove('open');
    }
}

function closeFailuresDropdown() {
    const dropdownList = document.getElementById('failuresDropdownList');
    const dropdownHeader = document.querySelector('.dropdown-header');
    
    dropdownList.classList.add('hidden');
    dropdownHeader.classList.remove('open');
}

function toggleFailureSelection(index, isChecked) {
    const standard = document.getElementById('standard').value;
    const failureObj = standardFailures[standard][index];
    
    if (isChecked) {
        // Add failure to selected list
        selectedFailuresList.push({
            failure: failureObj.failure,
            reference: failureObj.ref,
            requirement: failureObj.req,
            comment: '',
            image: null
        });
    } else {
        // Remove failure from selected list
        selectedFailuresList = selectedFailuresList.filter(f => f.failure !== failureObj.failure);
    }
    
    updateSelectedFailures();
    updateDropdownText();
}

function updateDropdownText() {
    const dropdownText = document.getElementById('dropdownText');
    const count = selectedFailuresList.length;
    
    if (count === 0) {
        dropdownText.innerHTML = 'Select failures...';
    } else if (count === 1) {
        dropdownText.innerHTML = `<span class="failures-selected-count">1 failure selected</span>`;
    } else {
        dropdownText.innerHTML = `<span class="failures-selected-count">${count} failures selected</span>`;
    }
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

function handleFailureImage(index, input) {
    if (input.files[0]) {
        const file = input.files[0];
        selectedFailuresList[index].image = file;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedFailuresList[index].imageData = e.target.result;
        };
        reader.readAsDataURL(file);
        
        document.getElementById(`failureImagePreview${index}`).textContent = 'Image uploaded';
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
                <label>Earth ${i}:</label>
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

// Image upload functionality
function handleImageUpload(input, previewId) {
    if (input.files[0]) {
        const file = input.files[0];
        uploadedImages[previewId] = file;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImages[previewId + '_data'] = e.target.result;
        };
        reader.readAsDataURL(file);
        
        document.getElementById(previewId).textContent = 'Image uploaded successfully';
    }
}

function handleMultipleImageUpload(input, previewId) {
    if (input.files.length > 0) {
        const files = Array.from(input.files);
        uploadedImages[previewId] = files;
        uploadedImages[previewId + '_data'] = [];
        
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedImages[previewId + '_data'][index] = e.target.result;
            };
            reader.readAsDataURL(file);
        });
        
        document.getElementById(previewId).textContent = `${input.files.length} image(s) uploaded`;
    }
}
