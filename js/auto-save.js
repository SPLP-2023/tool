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

    // Enhanced auto-save for dynamically created earth table fields
    document.addEventListener('change', function(e) {
        if (e.target.closest('#earthTableContainer')) {
            console.log('Earth table field changed:', e.target);
            debouncedSave();
        }
    });
    
    document.addEventListener('input', function(e) {
        if (e.target.closest('#earthTableContainer')) {
            console.log('Earth table field input:', e.target);
            debouncedSave();
        }
    });

    // Enhanced auto-save for multi-select system details
    document.addEventListener('click', function(e) {
        // Detect system detail selections by onclick function
        if (e.target.onclick && e.target.onclick.toString().includes('selectSystemDetail')) {
            console.log('System detail selected:', e.target.textContent);
            setTimeout(saveSystemDetailsChanges, 200);
        }
        
        // Regular failure option selections (for actual failures, not system details)
        if (e.target.classList.contains('failure-option') && 
            !e.target.onclick?.toString().includes('selectSystemDetail')) {
            console.log('Failure option selected:', e.target);
            setTimeout(saveFormData, 200);
        }
    });

    // Auto-save when failure comments are updated
    document.addEventListener('change', function(e) {
        if (e.target.closest('#selectedFailures')) {
            console.log('Failure comment changed:', e.target);
            debouncedSave();
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
            jobReference: document.getElementById('jobReference')?.value || '',
            siteStaffName: document.getElementById('siteStaffName')?.value || '',
            siteStaffSignature: window.siteStaffSignature?.signatureData || null,
            generalComments: document.getElementById('generalComments')?.value || '',
            finalComments: document.getElementById('finalComments')?.value || '',
            recommendations: document.getElementById('recommendations')?.value || '',
            
            // Structure details
            structureHeight: document.getElementById('structureHeight')?.value || '',
            structurePerimeter: document.getElementById('structurePerimeter')?.value || '',
            structureUse: document.getElementById('structureUse')?.value || '',
            structureOccupancy: document.getElementById('structureOccupancy')?.value || '',
            structureAge: document.getElementById('structureAge')?.value || '',
            previousInspections: document.getElementById('previousInspections')?.value || '',
            
            // System dropdowns
            earthArrangement: document.getElementById('earthArrangement')?.value || '',
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

            // Include partOfLargerSystem checkbox state
            partOfLargerSystem: document.getElementById('partOfLargerSystem')?.checked || false,
            
            // System details selections
            systemDetails: safeSystemDetails,
            
            // Images (base64 data)
            uploadedImages: safeUploadedImages,
            
            // Timestamp
            savedAt: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        console.log('Form data auto-saved at', new Date().toLocaleTimeString());
        console.log('Saved selectedFailures:', safeSelectedFailuresList.length);
        console.log('Saved systemDetails keys:', Object.keys(safeSystemDetails));
        console.log('SystemDetails content:', safeSystemDetails);
        console.log('Saved siteStaffSignature:', formData.siteStaffSignature ? 'Yes' : 'No');
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
        setFieldValue('jobReference', formData.jobReference);
        setFieldValue('siteStaffName', formData.siteStaffName);
        // Restore comments and recommendations
        setFieldValue('generalComments', formData.generalComments);
        setFieldValue('finalComments', formData.finalComments);
        setFieldValue('recommendations', formData.recommendations);

        // Restore site staff signature
        if (formData.siteStaffSignature && window.siteStaffSignature) {
            window.siteStaffSignature.signatureData = formData.siteStaffSignature;
            window.siteStaffSignature.updateStatus('Signature restored');
            if (typeof window.siteStaffSignature.redraw === 'function') {
                window.siteStaffSignature.redraw();
            }
        }

        // Restore structure details
        setFieldValue('structureHeight', formData.structureHeight);
        setFieldValue('structurePerimeter', formData.structurePerimeter);
        setFieldValue('structureUse', formData.structureUse);
        setFieldValue('structureOccupancy', formData.structureOccupancy);
        setFieldValue('structureAge', formData.structureAge);
        setFieldValue('previousInspections', formData.previousInspections);
        
        // Restore system dropdowns
        setFieldValue('earthArrangement', formData.earthArrangement);
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
                
                // Restore selected failures with complete restoration
                setTimeout(() => {
                    if (formData.selectedFailures && Array.isArray(formData.selectedFailures)) {
                        if (window.selectedFailuresList !== undefined) {
                            window.selectedFailuresList = formData.selectedFailures;
                    
                            // Step 1: Restore visual selections in "Available Failures" list
                            console.log('Restoring visual selections for', formData.selectedFailures.length, 'failures');
                            formData.selectedFailures.forEach(failureObj => {
                                // Look for failure options in the Available Failures list
                                const failureElements = document.querySelectorAll('#failuresList .failure-option');
                                failureElements.forEach(element => {
                                    if (element.textContent.trim() === failureObj.failure) {
                                        element.classList.add('selected');
                                        console.log('Restored visual selection:', failureObj.failure);
                                    }
                                });
                            });
            
                            // Step 2: Rebuild the "Selected Failures" detailed view with comments
                            if (typeof updateSelectedFailures === 'function') {
                                updateSelectedFailures();
                                console.log('Selected failures detailed view updated');
                                
                                // Step 3: Restore comments after the detailed view is created
                                setTimeout(() => {
                                    formData.selectedFailures.forEach((failureObj, index) => {
                                        if (failureObj.comment) {
                                            const commentTextarea = document.querySelector(`textarea[onchange*="updateFailureComment(${index})"]`);
                                            if (commentTextarea) {
                                                commentTextarea.value = failureObj.comment;
                                                console.log(`Restored comment for failure ${index}:`, failureObj.comment);
                                            }
                                        }
                                    });
                                }, 100); // Small delay to let the detailed view render
                            }
            
                            console.log('Selected failures restoration complete:', formData.selectedFailures.length);
                        }
                    }
                }, 600); // Increased delay for failures restoration
            }, 100);
        }

        if (formData.partOfLargerSystem !== undefined) {
            const checkbox = document.getElementById('partOfLargerSystem');
            if (checkbox) {
                checkbox.checked = formData.partOfLargerSystem;
            }
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
                            // Populate the actual HTML form fields in the table
                            restoreEarthTableFields();
                            if (typeof calculateOverallResistance === 'function') {
                                calculateOverallResistance();
                            }
                        }, 500);
                    }
                }
            }, 100);
        }
        
        // Restore system details selections
        if (formData.systemDetails) {
            Object.keys(formData.systemDetails).forEach(category => {
                if (Array.isArray(formData.systemDetails[category])) {
                    formData.systemDetails[category].forEach(value => {
                        let matchValue = value.startsWith('Other: ') ? value.slice(7) : value;
                        const options = document.querySelectorAll(`#${category}List .failure-option`);
                        options.forEach(option => {
                            if (
                                option.textContent.trim() === value ||
                                (option.textContent.trim() === 'Other' && value.startsWith('Other: '))
                            ) {
                                option.classList.add('selected');
                                if (option.textContent.trim() === 'Other') {
                                    const otherInput = document.getElementById(category + 'Other');
                                    if (otherInput) {
                                        otherInput.classList.remove('hidden');
                                        otherInput.value = matchValue;
                                    }
                                }
                            }
                        });
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

        // Force a save after ALL restoration completes to ensure data persists
        setTimeout(() => {
            isRestoring = false;
            saveFormData();
            console.log('Forced save after complete restoration');
        }, 2000); // 2 second delay to ensure all restoration is complete
        
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
        if (window.earthTableData !== undefined) {
            window.earthTableData = [];
        }
        if (window.uploadedImages !== undefined) {
            window.uploadedImages = {};
        }
        if (window.systemDetails !== undefined) {
            window.systemDetails = {};
        }
        if (window.siteStaffSignature !== undefined) {
            window.siteStaffSignature.clear();
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

// Restore earth table field values to HTML form elements
function restoreEarthTableFields() {
    if (!earthTableData || earthTableData.length === 0) return;
    
    const tableBody = document.getElementById('earthTableBody');
    if (!tableBody) return;
    
    console.log('Restoring earth table fields for', earthTableData.length, 'rows');
    
    earthTableData.forEach((earthData, index) => {
        const row = tableBody.children[index];
        if (!row) return;
        
        console.log(`Restoring row ${index + 1}:`, earthData);
        
        // Restore resistance value (column 1)
        const resistanceInput = row.children[1]?.querySelector('input[type="number"]');
        if (resistanceInput && earthData.resistance) {
            resistanceInput.value = earthData.resistance;
            console.log(`Set resistance: ${earthData.resistance}`);
        }
        
        // Restore Test Clamp (column 2)
        const testClampSelect = row.children[2]?.querySelector('select');
        if (testClampSelect && earthData.testClamp) {
            testClampSelect.value = earthData.testClamp;
            console.log(`Set testClamp: ${earthData.testClamp}`);
        }
        
        // Restore Pit Type (column 3)
        const pitTypeSelect = row.children[3]?.querySelector('select');
        if (pitTypeSelect && earthData.pitType) {
            pitTypeSelect.value = earthData.pitType;
            console.log(`Set pitType: ${earthData.pitType}`);
        }
        
        // Restore Test Type (column 4)
        const testTypeSelect = row.children[4]?.querySelector('select');
        if (testTypeSelect && earthData.testType) {
            testTypeSelect.value = earthData.testType;
            console.log(`Set testType: ${earthData.testType}`);
        }
        
        // Restore Ground Type (column 5)
        const groundTypeSelect = row.children[5]?.querySelector('select');
        if (groundTypeSelect && earthData.groundType) {
            groundTypeSelect.value = earthData.groundType;
            console.log(`Set groundType: ${earthData.groundType}`);
        }
        
        // Restore Earth Type (column 6)
        const earthTypeSelect = row.children[6]?.querySelector('select');
        if (earthTypeSelect && earthData.earthType) {
            earthTypeSelect.value = earthData.earthType;
            console.log(`Set earthType: ${earthData.earthType}`);
        }
        
        // Restore Comment (column 7)
        const commentInput = row.children[7]?.querySelector('input[type="text"]');
        if (commentInput && earthData.comment) {
            commentInput.value = earthData.comment;
            console.log(`Set comment: ${earthData.comment}`);
        }
    });
    
    console.log('Earth table fields restoration complete');
}

function saveSystemDetailsChanges() {
    if (isRestoring) return;
    
    // Force update of systemDetails before saving
    if (typeof rebuildSystemDetails === 'function') {
        rebuildSystemDetails();
        console.log('SystemDetails rebuilt:', window.systemDetails);
    }
    
    // Trigger a save with debugging
    setTimeout(() => {
        console.log('Saving after system detail change...');
        saveFormData();
    }, 300);
}
