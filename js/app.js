// Global variables
let selectedFailuresList = [];
let earthResistances = [];
let earthTableData = [];
let uploadedImages = {};
let systemDetails = {};
window.systemDetails = systemDetails;

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
        calculateOverallResistance();
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
        const preview = document.getElementById(previewId);
        if (preview) preview.textContent = 'Processing image...';

        fixImageOrientation(file).then(correctedImageData => {
            // Compress the image before saving
            compressImage(correctedImageData, 1200, 1200, 0.7).then(compressedData => {
                uploadedImages[previewId] = file;
                uploadedImages[previewId + '_data'] = compressedData;
                if (preview) preview.textContent = 'Image uploaded successfully';
            });
        }).catch(error => {
            if (preview) preview.textContent = 'Image upload failed';
            console.error('Image processing error:', error);
        });
    }
}

// Handle multiple image upload with EXIF rotation fix
function handleMultipleImageUpload(input, previewId) {
    if (input.files.length > 0) {
        const files = Array.from(input.files);
        uploadedImages[previewId] = files;
        uploadedImages[previewId + '_data'] = [];
        const preview = document.getElementById(previewId);
        if (preview) preview.textContent = 'Processing images...';
        let processedCount = 0;

        files.forEach((file, index) => {
            fixImageOrientation(file).then(correctedImageData => {
                compressImage(correctedImageData, 1200, 1200, 0.7).then(compressedData => {
                    uploadedImages[previewId + '_data'][index] = compressedData;
                    processedCount++;
                    if (processedCount === files.length && preview) {
                        preview.textContent = `${files.length} image(s) uploaded`;
                    }
                });
            }).catch(error => {
                if (preview) preview.textContent = 'Image upload failed';
                console.error('Image processing error:', error);
            });
        });
    }
}

// Compress an image (base64) to a max size and quality
function compressImage(base64Str, maxWidth = 1200, maxHeight = 1200, quality = 0.7) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            let { width, height } = img;
            const aspectRatio = width / height;

            // Scale down if too big
            if (width > maxWidth) {
                width = maxWidth;
                height = maxWidth / aspectRatio;
            }
            if (height > maxHeight) {
                height = maxHeight;
                width = maxHeight * aspectRatio;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Always save as JPEG for efficiency
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = base64Str;
    });
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

function rebuildSystemDetailsFromDOM() {
  const categories = [
    'groundType', 'boundaryType', 'roofType', 'roofLayout',
    'airTermination', 'airConductors', 'downConductorNetwork',
    'downConductors', 'earthTermination'
  ];

  const rebuilt = {};

  categories.forEach(cat => {
    const selected = document.querySelectorAll(`#${cat}List .selected`);
    rebuilt[cat] = Array.from(selected).map(el => el.textContent.trim());

    const otherInput = document.getElementById(cat + 'Other');
    if (otherInput && !otherInput.classList.contains('hidden') && otherInput.value.trim()) {
      rebuilt[cat].push('Other: ' + otherInput.value.trim());
    }
  });

  window.systemDetails = rebuilt;
}
// T&I Report Data Export Function
// Add this function to js/app.js

function exportTIReportData() {
    // Get all form data
    const siteAddress = document.getElementById('siteAddress')?.value || '';
    const testDate = document.getElementById('testDate')?.value || '';
    const engineerName = document.getElementById('engineerName')?.value || '';
    const testKitRef = document.getElementById('testKitRef')?.value || '';
    const jobReference = document.getElementById('jobReference')?.value || '';
    const siteStaffName = document.getElementById('siteStaffName')?.value || '';
    const standard = document.getElementById('standard')?.value || '';
    const generalComments = document.getElementById('generalComments')?.value || '';
    const finalComments = document.getElementById('finalComments')?.value || '';
    
    // Get structure details
    const structureHeight = document.getElementById('structureHeight')?.value || '';
    const structurePerimeter = document.getElementById('structurePerimeter')?.value || '';
    const structureUse = document.getElementById('structureUse')?.value || '';
    const structureOccupancy = document.getElementById('structureOccupancy')?.value || '';
    const structureAge = document.getElementById('structureAge')?.value || '';
    const previousInspections = document.getElementById('previousInspections')?.value || '';
    
    // Get system details dropdowns
    const earthArrangement = document.getElementById('earthArrangement')?.value || '';
    const mainEquipotentialBond = document.getElementById('mainEquipotentialBond')?.value || '';
    const surgeInstalled = document.getElementById('surgeInstalled')?.value || '';
    const surgeType = document.getElementById('surgeType')?.value || '';
    const surgeSafe = document.getElementById('surgeSafe')?.value || '';
    
    // Build export content
    let exportContent = '=== LIGHTNING PROTECTION T&I REPORT DATA ===\n';
    exportContent += `JOB_REF: ${jobReference}\n`;
    exportContent += `SITE_ADDRESS: ${siteAddress}\n`;
    exportContent += `TEST_DATE: ${testDate}\n`;
    exportContent += `ENGINEER: ${engineerName}\n`;
    exportContent += `TEST_KIT_REF: ${testKitRef}\n`;
    exportContent += `SITE_STAFF: ${siteStaffName}\n`;
    exportContent += `STANDARD: ${standard}\n`;
    exportContent += '\n';
    
    // Structure details section
    exportContent += '=== STRUCTURE DETAILS ===\n';
    exportContent += `HEIGHT: ${structureHeight}\n`;
    exportContent += `PERIMETER: ${structurePerimeter}\n`;
    exportContent += `USE: ${structureUse}\n`;
    exportContent += `OCCUPANCY: ${structureOccupancy}\n`;
    exportContent += `AGE: ${structureAge}\n`;
    exportContent += `PREVIOUS_INSPECTIONS: ${previousInspections}\n`;
    exportContent += '\n';
    
    // System details section
    exportContent += '=== SYSTEM DETAILS ===\n';
    exportContent += `EARTH_ARRANGEMENT: ${earthArrangement}\n`;
    exportContent += `MAIN_EQUIPOTENTIAL_BOND: ${mainEquipotentialBond}\n`;
    exportContent += `SURGE_INSTALLED: ${surgeInstalled}\n`;
    exportContent += `SURGE_TYPE: ${surgeType}\n`;
    exportContent += `SURGE_SAFE: ${surgeSafe}\n`;
    exportContent += '\n';
    
    // Failures section
    exportContent += '=== FAILURES ===\n';
    if (selectedFailuresList && selectedFailuresList.length > 0) {
        selectedFailuresList.forEach((failure, index) => {
            exportContent += `FAILURE: ${failure.failure}\n`;
            exportContent += `REF: ${failure.reference}\n`;
            exportContent += `REQ: ${failure.requirement}\n`;
            if (failure.comment) {
                exportContent += `COMMENT: ${failure.comment}\n`;
            }
            exportContent += '---\n';
        });
    } else {
        exportContent += 'No failures recorded\n';
    }
    exportContent += '\n';
    
    // Recommendations section
    exportContent += '=== RECOMMENDATIONS ===\n';
    if (generalComments) {
        exportContent += `${generalComments}\n`;
    } else {
        exportContent += 'No recommendations recorded\n';
    }
    exportContent += '\n';
    
    // Final comments section
    exportContent += '=== FINAL COMMENTS ===\n';
    if (finalComments) {
        exportContent += `${finalComments}\n`;
    } else {
        exportContent += 'No final comments recorded\n';
    }
    exportContent += '\n';
    
    // Earth resistance data if available
    if (typeof earthTableData !== 'undefined' && earthTableData.length > 0) {
        exportContent += '=== EARTH RESISTANCE DATA ===\n';
        earthTableData.forEach((earth, index) => {
            exportContent += `EARTH_${index + 1}_RESISTANCE: ${earth.resistance}\n`;
            exportContent += `EARTH_${index + 1}_TEST_CLAMP: ${earth.testClamp}\n`;
            exportContent += `EARTH_${index + 1}_PIT_TYPE: ${earth.pitType}\n`;
            exportContent += `EARTH_${index + 1}_TEST_TYPE: ${earth.testType}\n`;
            exportContent += `EARTH_${index + 1}_GROUND_TYPE: ${earth.groundType}\n`;
            exportContent += `EARTH_${index + 1}_EARTH_TYPE: ${earth.earthType}\n`;
            if (earth.comment) {
                exportContent += `EARTH_${index + 1}_COMMENT: ${earth.comment}\n`;
            }
            exportContent += '---\n';
        });
        
        // Overall resistance if calculated
        const earthData = getEarthTableData();
        if (earthData && earthData.overallResistance > 0) {
            exportContent += `OVERALL_RESISTANCE: ${earthData.overallResistance.toFixed(3)}\n`;
        }
    }
    
    exportContent += '\n=== END OF REPORT DATA ===\n';
    
    // Create and download file
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TI_Report_Data_${jobReference || 'Export'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('T&I Report data exported successfully');
    alert('T&I Report data exported successfully!\n\nThis file can now be imported into a Remedial Report.');
}

// Function to add export button to T&I report page
function addExportButtonToTIReport() {
    const generateButton = document.getElementById('generateReport');
    if (generateButton) {
        const exportButton = document.createElement('button');
        exportButton.id = 'exportTIData';
        exportButton.textContent = 'Export T&I Data for Remedial Report';
        exportButton.className = 'export-button';
        exportButton.onclick = exportTIReportData;
        exportButton.style.cssText = `
            background-color: #17a2b8;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 10px;
            width: 100%;
        `;
        exportButton.onmouseover = function() {
            this.style.backgroundColor = '#138496';
        };
        exportButton.onmouseout = function() {
            this.style.backgroundColor = '#17a2b8';
        };
        
        // Insert before the new report button
        const newReportButton = document.getElementById('newReport');
        if (newReportButton) {
            generateButton.parentNode.insertBefore(exportButton, newReportButton);
        } else {
            generateButton.insertAdjacentElement('afterend', exportButton);
        }
    }
}

// Initialize export functionality when T&I page loads
document.addEventListener('DOMContentLoaded', function() {
    // Only add export button if we're on the T&I report page
    if (document.getElementById('generateReport') && document.getElementById('standard')) {
        setTimeout(addExportButtonToTIReport, 1000); // Small delay to ensure other scripts have loaded
    }
});
