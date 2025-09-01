// Remedial Report JavaScript Functions
// File: js/remedial-report.js

// Global variables for remedial report (only declare what's not in app.js)
let selectedRecommendationsList = [];
let tiReportData = null;
let remedialSelectedFailuresList = []; // Separate list for remedial failures

// Ensure global arrays are initialized
if (typeof selectedFailuresList === 'undefined') {
    window.selectedFailuresList = [];
}

// Initialize the remedial report
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const remedialDateElement = document.getElementById('remedialDate');
    if (remedialDateElement) {
        remedialDateElement.valueAsDate = new Date();
    }
});

// Handle T&I data file upload
function handleTIDataUpload(input) {
    if (input.files[0]) {
        const file = input.files[0];
        const preview = document.getElementById('tiDataFilePreview');
        
        if (file.type !== 'text/plain') {
            alert('Please upload a .txt file');
            return;
        }
        
        preview.textContent = 'Processing T&I data...';
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                tiReportData = parseTIData(content);
                
                if (tiReportData) {
                    populateFromTIData(tiReportData);
                    preview.textContent = 'T&I data loaded successfully';
                } else {
                    preview.textContent = 'Error parsing T&I data - please check file format';
                }
            } catch (error) {
                console.error('Error parsing T&I data:', error);
                preview.textContent = 'Error loading T&I data';
            }
        };
        reader.readAsText(file);
    }
}

// Parse T&I data from text file
function parseTIData(content) {
    const data = {
        jobReference: '',
        siteAddress: '',
        testDate: '',
        engineer: '',
        testKitRef: '',
        siteStaff: '',
        standard: '',
        failures: [],
        recommendations: '',
        finalComments: '',
        structureDetails: {},
        earthData: []
    };
    
    const lines = content.split('\n');
    let currentSection = '';
    let currentFailure = null;
    
    for (let line of lines) {
        line = line.trim();
        
        if (line.startsWith('=== ') && line.endsWith(' ===')) {
            currentSection = line.replace(/=/g, '').trim();
            continue;
        }
        
        if (line.includes(':') && !line.startsWith('FAILURE:') && !line.startsWith('REF:') && !line.startsWith('REQ:') && !line.startsWith('COMMENT:')) {
            const [key, value] = line.split(':').map(s => s.trim());
            
            switch (key) {
                case 'JOB_REF':
                    data.jobReference = value;
                    break;
                case 'SITE_ADDRESS':
                    data.siteAddress = value;
                    break;
                case 'TEST_DATE':
                    data.testDate = value;
                    break;
                case 'ENGINEER':
                    data.engineer = value;
                    break;
                case 'TEST_KIT_REF':
                    data.testKitRef = value;
                    break;
                case 'SITE_STAFF':
                    data.siteStaff = value;
                    break;
                case 'STANDARD':
                    data.standard = value;
                    break;
            }
        }
        
        if (line.startsWith('FAILURE:')) {
            if (currentFailure) {
                data.failures.push(currentFailure);
            }
            currentFailure = {
                failure: line.replace('FAILURE:', '').trim(),
                reference: '',
                requirement: '',
                comment: ''
            };
        } else if (line.startsWith('REF:') && currentFailure) {
            currentFailure.reference = line.replace('REF:', '').trim();
        } else if (line.startsWith('REQ:') && currentFailure) {
            currentFailure.requirement = line.replace('REQ:', '').trim();
        } else if (line.startsWith('COMMENT:') && currentFailure) {
            currentFailure.comment = line.replace('COMMENT:', '').trim();
        } else if (line === '---' && currentFailure) {
            data.failures.push(currentFailure);
            currentFailure = null;
        }
        
        if (currentSection === 'RECOMMENDATIONS' && line && !line.startsWith('===')) {
            data.recommendations += line + ' ';
        }
        
        if (currentSection === 'FINAL COMMENTS' && line && !line.startsWith('===')) {
            data.finalComments += line + ' ';
        }
    }
    
    // Add final failure if exists
    if (currentFailure) {
        data.failures.push(currentFailure);
    }
    
    return data;
}

// Populate form fields from T&I data
function populateFromTIData(data) {
    // Auto-populate basic fields
    if (data.jobReference) document.getElementById('jobReference').value = data.jobReference;
    if (data.siteAddress) document.getElementById('siteAddress').value = data.siteAddress;
    
    // Auto-populate failures if standard matches
    if (data.standard && data.failures.length > 0) {
        document.getElementById('standard').value = data.standard;
        updateFailuresList();
        
        // Add imported failures to selected list
        setTimeout(() => {
            data.failures.forEach(failure => {
                selectedFailuresList.push({
                    failure: failure.failure,
                    reference: failure.reference,
                    requirement: failure.requirement,
                    comment: failure.comment || '',
                    image: null,
                    imported: true
                });
            });
            updateSelectedFailures();
        }, 100);
    }
    
    // Auto-populate recommendations if any
    if (data.recommendations.trim()) {
        const recommendations = data.recommendations.trim().split(/[.!]/).filter(r => r.trim().length > 10);
        recommendations.forEach(rec => {
            if (rec.trim()) {
                selectedRecommendationsList.push({
                    recommendation: recommendation,
                    completed: false,
                    comment: ''
                });
            }
        });
        updateSelectedRecommendations();
    }
}

// Standards and failures functionality (reused from T&I)
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
        
        standardFailures[standard].forEach((failureObj, index) => {
            const failureDiv = document.createElement('div');
            failureDiv.className = 'failure-option';
            failureDiv.textContent = failureObj.failure;
            failureDiv.onclick = () => selectFailure(failureObj, failureDiv);
            failuresList.appendChild(failureDiv);
        });
    } else {
        container.classList.add('hidden');
    }
}

// Select failure for repair
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
            image: null,
            completed: false,
            imported: false
        });
    }
    updateSelectedFailures();
}

// Update selected failures display
function updateSelectedFailures() {
    const container = document.getElementById('selectedFailures');
    if (!container) return;
    
    container.innerHTML = '';
    
    selectedFailuresList.forEach((item, index) => {
        const failureDiv = document.createElement('div');
        failureDiv.className = 'failure-item';
        
        const completedClass = item.completed ? 'checked' : '';
        const importedLabel = item.imported ? ' (Imported from T&I)' : '';
        
        failureDiv.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <input type="checkbox" id="failureCompleted${index}" onchange="updateFailureCompletion(${index}, this.checked)" ${completedClass}>
                <h4 style="margin: 0 0 0 10px;">${item.failure}${importedLabel}</h4>
            </div>
            <div class="failure-reference">${item.reference}</div>
            <div class="minimum-requirement">
                <strong>Requirement:</strong> ${item.requirement}
            </div>
            <div class="form-group">
                <label>Repair Comments:</label>
                <textarea onchange="updateFailureComment(${index}, this.value)" placeholder="Add details about repair work completed...">${item.comment}</textarea>
            </div>
            <div class="form-group">
                <label>Image:</label>
                <div class="image-upload" onclick="document.getElementById('failureImage${index}').click()">
                    <input type="file" id="failureImage${index}" accept="image/*" class="hidden-file-input" aria-label="Upload repair image" onchange="handleFailureImage(${index}, this)">
                    <div id="failureImagePreview${index}">${item.image ? 'Image uploaded' : 'Click to upload repair image'}</div>
                </div>
            </div>
        `;
        container.appendChild(failureDiv);
    });
}

// Update failure completion status
function updateFailureCompletion(index, completed) {
    if (selectedFailuresList[index]) {
        selectedFailuresList[index].completed = completed;
    }
}

// Update failure comment
function updateFailureComment(index, comment) {
    if (selectedFailuresList[index]) {
        selectedFailuresList[index].comment = comment;
    }
}

// Handle failure image upload
function handleFailureImage(index, input) {
    if (input.files[0]) {
        const file = input.files[0];
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
                preview.textContent = 'Image uploaded';
            }
        });
    }
}

// Update selected failures display
function updateSelectedFailures() {
    const container = document.getElementById('selectedFailures');
    if (!container) return;
    
    container.innerHTML = '';
    
    selectedFailuresList.forEach((item, index) => {
        const failureDiv = document.createElement('div');
        failureDiv.className = 'failure-item';
        
        const completedClass = item.completed ? 'checked' : '';
        const importedLabel = item.imported ? ' (Imported from T&I)' : '';
        
        failureDiv.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <input type="checkbox" id="failureCompleted${index}" onchange="updateFailureCompletion(${index}, this.checked)" ${completedClass}>
                <h4 style="margin: 0 0 0 10px;">${item.failure}${importedLabel}</h4>
            </div>
            <div class="failure-reference">${item.reference}</div>
            <div class="minimum-requirement">
                <strong>Requirement:</strong> ${item.requirement}
            </div>
            <div class="form-group">
                <label>Repair Comments:</label>
                <textarea onchange="updateFailureComment(${index}, this.value)" placeholder="Add details about repair work completed...">${item.comment}</textarea>
            </div>
            <div class="form-group">
                <label>Image:</label>
                <div class="image-upload" onclick="document.getElementById('failureImage${index}').click()">
                    <input type="file" id="failureImage${index}" accept="image/*" class="hidden-file-input" aria-label="Upload repair image" onchange="handleFailureImage(${index}, this)">
                    <div id="failureImagePreview${index}">${item.image ? 'Image uploaded' : 'Click to upload repair image'}</div>
                </div>
            </div>
        `;
        container.appendChild(failureDiv);
    });
}

// Update failure completion status
function updateFailureCompletion(index, completed) {
    if (selectedFailuresList[index]) {
        selectedFailuresList[index].completed = completed;
    }
}

// Update failure comment
function updateFailureComment(index, comment) {
    if (selectedFailuresList[index]) {
        selectedFailuresList[index].comment = comment;
    }
}

// Handle failure image upload
function handleFailureImage(index, input) {
    if (input.files[0]) {
        const file = input.files[0];
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
                preview.textContent = 'Image uploaded';
            }
        });
    }
}
// Select recommendation
function selectRecommendation(recommendation, element) {
    if (element.classList.contains('selected')) {
        element.classList.remove('selected');
        selectedRecommendationsList = selectedRecommendationsList.filter(r => r.recommendation !== recommendation);
    } else {
        element.classList.add('selected');
        selectedRecommendationsList.push({
            recommendation: recommendation,
            completed: false
        });
    }
    updateSelectedRecommendations();
}

// Add custom recommendation
function addCustomRecommendation() {
    const input = document.getElementById('customRecommendation');
    const recommendation = input.value.trim();
    
    if (recommendation) {
        selectedRecommendationsList.push({
        recommendation: recommendation,
            completed: false,
            custom: true,
            comment: ''
        });
        updateSelectedRecommendations();
        input.value = '';
    }
}

// Update selected recommendations display
function updateSelectedRecommendations() {
    const container = document.getElementById('selectedRecommendations');
    if (!container) return;
    
    if (selectedRecommendationsList.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<h3>📋 Selected Recommendations to Complete</h3>';
    
    selectedRecommendationsList.forEach((item, index) => {
        const completedClass = item.completed ? 'checked' : '';
        const customLabel = item.custom ? ' (Custom)' : '';
        
        html += `
            <div class="recommendation-item">
                <div style="display: flex; align-items: center;">
                    <input type="checkbox" id="recommendationCompleted${index}" onchange="updateRecommendationCompletion(${index}, this.checked)" ${completedClass}>
                    <h4 style="margin: 0 0 0 10px;">${item.recommendation}${customLabel}</h4>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

    function updateRecommendationComment(index, comment) {
        if (selectedRecommendationsList[index]) {
            selectedRecommendationsList[index].comment = comment;
        }
}

// Update recommendation completion status
function updateRecommendationCompletion(index, completed) {
    if (selectedRecommendationsList[index]) {
        selectedRecommendationsList[index].completed = completed;
    }
}

// Handle single image upload with EXIF rotation fix
function handleImageUpload(input, previewId) {
    if (input.files[0]) {
        const file = input.files[0];
        const preview = document.getElementById(previewId);
        
        if (preview) {
            preview.textContent = 'Processing image...';
        }
        
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

// Export T&I report data to text file
function exportTIData() {
    // This function would be added to the T&I report page
    // For now, it's a placeholder showing the expected format
    
    const data = {
        jobReference: document.getElementById('jobReference')?.value || '',
        siteAddress: document.getElementById('siteAddress')?.value || '',
        // ... other T&I data
    };
    
    let exportContent = '=== LIGHTNING PROTECTION T&I REPORT DATA ===\n';
    exportContent += `JOB_REF: ${data.jobReference}\n`;
    exportContent += `SITE_ADDRESS: ${data.siteAddress}\n`;
    // ... add all other data
    
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TI_Report_Data_${data.jobReference || 'Export'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Get remedial report data for PDF generation
function getRemedialData() {
    return {
        // Basic information
        siteAddress: document.getElementById('siteAddress')?.value || '',
        jobReference: document.getElementById('jobReference')?.value || '',
        remedialDate: document.getElementById('remedialDate')?.value || '',
        remedialEngineer: document.getElementById('remedialEngineer')?.value || '',
        siteStaffName: document.getElementById('siteStaffName')?.value || '',
        
        // Failures and recommendations
        selectedFailures: selectedFailuresList,
        selectedRecommendations: selectedRecommendationsList,
        
        // Additional work
        additionalRepairs: document.getElementById('additionalRepairs')?.value || '',
        completionNotes: document.getElementById('completionNotes')?.value || '',
        
        // Images
        buildingImage: uploadedImages['buildingImagePreview_data'] || null,
        remedialImages: uploadedImages['remedialImagesPreview_data'] || [],
        
        // Signature
        signatureData: window.siteStaffSignature ? window.siteStaffSignature.getSignatureData() : null,
        
        // Original T&I data (if imported)
        originalTIData: tiReportData
    };
}

// Validate remedial data before PDF generation
function validateRemedialData() {
    const data = getRemedialData();
    const errors = [];
    
    if (!data.siteAddress.trim()) {
        errors.push('Site Address is required');
    }
    
    if (!data.jobReference.trim()) {
        errors.push('Job Reference is required');
    }
    
    if (!data.remedialEngineer.trim()) {
        errors.push('Remedial Engineer Name is required');
    }
    
    if (!data.siteStaffName.trim()) {
        errors.push('Site Staff Name is required');
    }
    
    if (!window.siteStaffSignature || !window.siteStaffSignature.isSaved()) {
        errors.push('Site Staff signature is required');
    }
    
    if (data.selectedFailures.length === 0 && data.selectedRecommendations.length === 0) {
        errors.push('At least one failure or recommendation must be selected');
    }
    
    if (errors.length > 0) {
        alert('Please complete the following required fields:\n\n' + errors.join('\n'));
        return false;
    }
    
    return true;
}

// Clear all remedial data
function clearRemedialData() {
    if (confirm('Are you sure you want to clear all data and start a new remedial report?')) {
        // Clear basic fields
        document.getElementById('siteAddress').value = '';
        document.getElementById('jobReference').value = '';
        document.getElementById('remedialDate').valueAsDate = new Date();
        document.getElementById('remedialEngineer').value = '';
        document.getElementById('siteStaffName').value = '';
        document.getElementById('additionalRepairs').value = '';
        document.getElementById('completionNotes').value = '';
        document.getElementById('customRecommendation').value = '';
        
        // Clear standard and hide failures
        document.getElementById('standard').value = '';
        document.getElementById('failuresContainer').classList.add('hidden');
        
        // Clear selected items
        selectedFailuresList = [];
        selectedRecommendationsList = [];
        tiReportData = null;
        
        // Clear displays
        updateSelectedFailures();
        updateSelectedRecommendations();
        
        // Clear signature
        if (window.siteStaffSignature) {
            window.siteStaffSignature.reset();
        }
        
        // Clear uploaded images
        uploadedImages = {};
        document.getElementById('tiDataFilePreview').textContent = 'Click to upload T&I report data file (.txt)';
        document.getElementById('buildingImagePreview').textContent = 'Click to upload building image';
        document.getElementById('remedialImagesPreview').textContent = 'Click to upload remedial work photos';
        
        // Clear selected options
        document.querySelectorAll('.failure-option.selected').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelectorAll('.recommendation-option.selected').forEach(option => {
            option.classList.remove('selected');
        });
        
        console.log('Remedial report form cleared');
    }
}
