// Auto-Save System - Saves form progress automatically
// Prevents data loss from page refresh, browser crash, accidental navigation

const STORAGE_KEY = 'splp_report_autosave';
const SAVE_DELAY = 500; // 500ms delay after typing stops

let saveTimeout;
let isRestoring = false; // Prevent saving during restore

// Initialize auto-save system when page loads
document.addEventListener('DOMContentLoaded', function() {
    restoreFormData();
    setupAutoSave();
    addNewReportButton();
});

// Setup auto-save listeners for all form elements
function setupAutoSave() {
    // Text inputs and textareas
    const textInputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], textarea, select');
    textInputs.forEach(input => {
        input.addEventListener('input', debouncedSave);
        input.addEventListener('change', debouncedSave);
    });

    // File inputs (save immediately when files are selected)
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', saveFormData);
    });

    // System detail selections (failure options, system details)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('failure-option')) {
            setTimeout(saveFormData, 100); // Small delay to allow selection to complete
        }
    });

    // Save before page unload (backup)
    window.addEventListener('beforeunload', function() {
        if (!isRestoring) {
            saveFormData();
        }
    });
}

// Debounced save function - waits for user to stop typing
function debouncedSave() {
    if (isRestoring) return;
    
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveFormData, SAVE_DELAY);
}

// Save all form data to localStorage
function saveFormData() {
    if (isRestoring) return;

    try {
        // Safely access global variables with fallbacks - check if they exist first
        const safeSelectedFailuresList = (typeof selectedFailuresList !== 'undefined') ? selectedFailuresList : 
                                        (window.selectedFailuresList || []);
        const safeEarthTableData = (typeof earthTableData !== 'undefined') ? earthTableData : [];
        const safeSystemDetails = (typeof systemDetails !== 'undefined') ? systemDetails : 
                                 (window.systemDetails || {});
        const safeUploadedImages = (typeof uploadedImages !== 'undefined') ? uploadedImages : 
                                  (window.uploadedImages || {});

        const formData = {
            // Basic form fields
            siteAddress: document.getElementById('siteAddress')?.value || '',
            testDate: document.getElementById('testDate')?.value || '',
            engineerName: document.getElementById('engineerName')?.value || '',
            testKitRef: document.getElementById('testKitRef')?.value || '',
            generalComments: document.getElementById('generalComments')?.value || '',
            finalComments: document.getElementById('finalComments')?.value || '',
            
            // Structure details
            structureHeight: document.getElementById('structureHeight')?.value || '',
            structurePerimeter: document.getElementById('structurePerimeter')?.value || '',
            
            // System dropdowns
            earthPits: document.getElementById('earthPits')?.value || '',
            mainEquipotentialBond: document.getElementById('mainEquipotentialBond')?.value || '',
            surgeInstalled: document.getElementById('surgeInstalled')?.value || '',
            surgeType: document.getElementById('surgeType')?.value || '',
            surgeSafe: document.getElementById('surgeSafe')?.value || '',
            
            // Standards and failures
            standard: document.getElementById('standard')?.value || '',
            selectedFailures: safeSelectedFailuresList,
            
            // Enhanced earth resistance testing
            numEarths: document.getElementById('numEarths')?.value || '',
            earthTableData: (typeof earthTableData !== 'undefined') ? earthTableData : [],
            
            // System details selections
            systemDetails: safeSystemDetails,
            
            // Images (base64 data)
            uploadedImages: safeUploadedImages,
            
            // Timestamp
            savedAt: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        console.log('Form data auto-saved at', new Date().toLocaleTimeString());
    } catch (error) {
        console.error('Failed to save form data:', error);
    }
}

// Restore form data from localStorage
function restoreFormData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) return;

        isRestoring = true;
        const formData = JSON.parse(savedData);

        // Restore basic form fields
        setFieldValue('siteAddress', formData.siteAddress);
        setFieldValue('testDate', formData.testDate);
        setFieldValue('engineerName', formData.engineerName);
        setFieldValue('testKitRef', formData.testKitRef);
        setFieldValue('generalComments', formData.generalComments);
        setFieldValue('finalComments', formData.finalComments);
        
        // Restore structure details
        setFieldValue('structureHeight', formData.structureHeight);
        setFieldValue('structurePerimeter', formData.structurePerimeter);
        
        // Restore system dropdowns
        setFieldValue('earthPits', formData.earthPits);
        setFieldValue('mainEquipotentialBond', formData.mainEquipotentialBond);
        setFieldValue('surgeInstalled', formData.surgeInstalled);
        setFieldValue('surgeType', formData.surgeType);
        setFieldValue('surgeSafe', formData.surgeSafe);
        
        // Restore standard selection and trigger failures list update
        if (formData.standard) {
            setFieldValue('standard', formData.standard);
            setTimeout(() => {
                if (typeof updateFailuresList === 'function') {
                    updateFailuresList();
                }
                
                // Restore selected failures
                if (formData.selectedFailures && Array.isArray(formData.selectedFailures)) {
                    if (window.selectedFailuresList !== undefined) {
                        window.selectedFailuresList = formData.selectedFailures;
                        if (typeof updateSelectedFailures === 'function') {
                            updateSelectedFailures();
                        }
                    }
                }
            }, 100);
        }
        
                // Restore earth resistance testing
                if (formData.numEarths) {
                setFieldValue('numEarths', formData.numEarths);
                setTimeout(() => {
                    if (formData.earthTableData && Array.isArray(formData.earthTableData)) {
                        window.earthTableData = formData.earthTableData;
                        if (typeof generateEarthTable === 'function') {
                            generateEarthTable();
                            // Restore table data after generation
                            setTimeout(() => {
                                earthTableData = formData.earthTableData;
                                if (typeof calculateOverallResistance === 'function') {
                                    calculateOverallResistance();
                                }
                            }, 200);
                        }
                    }
                }, 100);
            }
                
                // Restore enhanced earth table data
                if (formData.earthTableData && Array.isArray(formData.earthTableData)) {
                window.earthTableData = formData.earthTableData;
                setTimeout(() => {
                if (typeof generateEarthTable === 'function') {
                generateEarthTable();
                // Restore table data after generation
                earthTableData = formData.earthTableData;
                calculateOverallResistance();
            }
        }, 100);
    }
                    formData.earthResistances.forEach((value, index) => {
                        const input = document.querySelector(`input[onchange*="updateEarthResistance(${index}"]`);
                        if (input) {
                            input.value = value;
                        }
                    });
                    if (typeof calculateOverallResistance === 'function') {
                        calculateOverallResistance();
                    }
                }
            }, 100);
        }
        
        // Restore system details selections
        if (formData.systemDetails) {
            if (window.systemDetails !== undefined) {
                window.systemDetails = formData.systemDetails;
            }
            // Re-apply visual selections
            Object.keys(formData.systemDetails).forEach(category => {
                if (Array.isArray(formData.systemDetails[category])) {
                    formData.systemDetails[category].forEach(value => {
                        const option = document.querySelector(`[onclick*="selectSystemDetail('${category}', '${value}'"]`);
                        if (option) {
                            option.classList.add('selected');
                        }
                    });
                }
            });
        }
        
        // Restore uploaded images
        if (formData.uploadedImages) {
            if (window.uploadedImages !== undefined) {
                window.uploadedImages = formData.uploadedImages;
            }
            
            // Update image preview displays
            Object.keys(formData.uploadedImages).forEach(key => {
                if (key.endsWith('_data')) {
                    const previewKey = key.replace('_data', '');
                    const previewElement = document.getElementById(previewKey);
                    if (previewElement) {
                        if (key.includes('earthImages') && Array.isArray(formData.uploadedImages[key])) {
                            previewElement.textContent = `${formData.uploadedImages[key].length} image(s) restored`;
                        } else {
                            previewElement.textContent = 'Image restored';
                        }
                    }
                }
            });
        }

        console.log('Form data restored from', formData.savedAt);
    } catch (error) {
        console.error('Failed to restore form data:', error);
    } finally {
        isRestoring = false;
    }
}

// Helper function to safely set field values
function setFieldValue(id, value) {
    const element = document.getElementById(id);
    if (element && value) {
        element.value = value;
    }
}

// Clear all saved data and form
function clearAllData() {
    try {
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);
        
        // Clear global variables safely
        if (window.selectedFailuresList !== undefined) {
            window.selectedFailuresList = [];
        }
        if (window.earthResistances !== undefined) {
            window.earthResistances = [];
        }
        }
        if (window.uploadedImages !== undefined) {
            window.uploadedImages = {};
        }
        if (window.systemDetails !== undefined) {
            window.systemDetails = {};
        }
        
        // Clear all form fields
        const allInputs = document.querySelectorAll('input, textarea, select');
        allInputs.forEach(input => {
            if (input.type === 'file') {
                input.value = '';
            } else if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });
        
        // Clear failure selections
        document.querySelectorAll('.failure-option.selected').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Clear selected failures display
        const selectedFailuresContainer = document.getElementById('selectedFailures');
        if (selectedFailuresContainer) {
            selectedFailuresContainer.innerHTML = '';
        }
        
        // Clear earth inputs
        const earthInputs = document.getElementById('earthInputs');
        if (earthInputs) {
            earthInputs.style.display = 'none';
            earthInputs.innerHTML = '';
        }
        
        // Hide earth results
        const earthResult = document.getElementById('earthResult');
        if (earthResult) {
            earthResult.classList.add('hidden');
        }
        
        // Hide failures container
        const failuresContainer = document.getElementById('failuresContainer');
        if (failuresContainer) {
            failuresContainer.classList.add('hidden');
        }
        
        // Clear image previews
        document.querySelectorAll('[id$="Preview"]').forEach(preview => {
            if (preview.id.includes('buildingImage')) {
                preview.textContent = 'Click to upload building image';
            } else if (preview.id.includes('earthImages')) {
                preview.textContent = 'Click to upload earth test images';
            } else {
                preview.textContent = 'Click to upload image';
            }
        });
        
        console.log('All form data cleared - starting fresh report');
    } catch (error) {
        console.error('Error clearing form data:', error);
    }
}

// Add New Report button to the page
function addNewReportButton() {
    const generateButton = document.getElementById('generateReport');
    if (generateButton) {
        const newReportButton = document.createElement('button');
        newReportButton.id = 'newReport';
        newReportButton.textContent = 'New Report';
        newReportButton.className = 'new-report-button';
        newReportButton.onclick = function() {
            if (confirm('Start a new report? This will clear all current data.')) {
                clearAllData();
            }
        };
        
        // Insert after the generate button
        generateButton.insertAdjacentElement('afterend', newReportButton);
    }
}

// Clear auto-save data after successful PDF generation
function clearAutoSaveAfterPDF() {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Auto-save data cleared after PDF generation');
}

// Export function for use in other scripts
window.clearAutoSaveAfterPDF = clearAutoSaveAfterPDF;
