// Enhanced Survey Report JavaScript
// File: js/survey-report.js

// Global signature instance
let clientSignature;

// Initialize the survey report
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const surveyDateElement = document.getElementById('surveyDate');
    if (surveyDateElement) {
        surveyDateElement.valueAsDate = new Date();
    }
    
    // Initialize touch signature
    clientSignature = createTouchSignature(
        'signatureCanvas',
        'clearSignature', 
        'saveSignature',
        'signatureStatus'
    );
});

// Get selected checkboxes for any category
function getSelectedCheckboxes(className) {
    const selected = [];
    const checkboxes = document.querySelectorAll('.' + className + ':checked');
    
    checkboxes.forEach(checkbox => {
        const label = document.querySelector(`label[for="${checkbox.id}"]`);
        if (label) {
            selected.push(label.textContent);
        }
    });
    
    return selected;
}

// Get selected ground types
function getSelectedGroundTypes() {
    return getSelectedCheckboxes('ground-checkbox');
}

// Get selected wall types
function getSelectedWallTypes() {
    return getSelectedCheckboxes('wall-checkbox');
}

// Get selected system components
function getSelectedSystemComponents() {
    return getSelectedCheckboxes('system-checkbox');
}

// Get selected risk factors
function getSelectedRiskFactors() {
    return getSelectedCheckboxes('risk-checkbox');
}

// Get selected electrical systems
function getSelectedElectricalSystems() {
    return getSelectedCheckboxes('electrical-checkbox');
}

// Generate auto-description based on form data (NOT calling getSurveyData to avoid circular reference)
function generateAutoDescription() {
    let description = '';
    
    // Get form data directly without calling getSurveyData()
    const structureType = document.getElementById('structureType')?.value || '';
    const structureHeight = document.getElementById('structureHeight')?.value || '';
    const buildingAge = document.getElementById('buildingAge')?.value || '';
    const numberOfFloors = document.getElementById('numberOfFloors')?.value || '';
    const numberOfOccupants = document.getElementById('numberOfOccupants')?.value || '';
    const roofAccess = document.getElementById('roofAccess')?.value || '';
    const existingSystem = document.getElementById('existingSystem')?.value || '';
    const systemCondition = document.getElementById('systemCondition')?.value || '';
    const lastTested = document.getElementById('lastTested')?.value || '';
    const standardInstalled = document.getElementById('standardInstalled')?.value || '';
    
    // Get checkbox selections directly
    const wallTypes = getSelectedWallTypes();
    const groundTypes = getSelectedGroundTypes();
    const systemComponents = getSelectedSystemComponents();
    const riskFactors = getSelectedRiskFactors();
    const electricalSystems = getSelectedElectricalSystems();
    
    // Structure information
    if (structureType) {
        description += `The surveyed structure is a ${structureType} building`;
        
        if (structureHeight) {
            description += ` of approximately ${structureHeight}m height`;
        }
        
        if (wallTypes.length > 0) {
            description += ` with ${wallTypes.join(' and ')} construction`;
        }
        
        if (buildingAge) {
            description += `, built approximately ${buildingAge} years ago`;
        }
        
        description += '.';
        
        // Additional structure details
        const structureDetails = [];
        if (numberOfFloors) structureDetails.push(`${numberOfFloors} floors`);
        if (numberOfOccupants) structureDetails.push(`${numberOfOccupants} occupants`);
        if (roofAccess) structureDetails.push(`${roofAccess.toLowerCase()} roof access`);
        
        if (structureDetails.length > 0) {
            description += ` The building has ${structureDetails.join(', ')}.`;
        }
    }
    
    // Ground conditions
    if (groundTypes.length > 0) {
        description += ` The surrounding ground consists of ${groundTypes.join(', ').toLowerCase()}.`;
    }
    
    // Risk factors
    if (riskFactors.length > 0) {
        description += ` Risk factors identified include ${riskFactors.join(', ')}.`;
    }
    
    // Existing system
    if (existingSystem && existingSystem !== 'None Visible') {
        description += ` The existing lightning protection system is assessed as ${existingSystem}`;
        
        if (systemCondition && systemCondition !== '') {
            description += ` with ${systemCondition.toLowerCase()} overall condition`;
        }
        
        if (lastTested && lastTested !== '') {
            description += `, last tested ${lastTested.toLowerCase()}`;
        }
        
        if (standardInstalled && standardInstalled !== '') {
            description += ` and installed to ${standardInstalled}`;
        }
        
        description += '.';
        
        // System components
        if (systemComponents.length > 0) {
            description += ` Visible system components include ${systemComponents.join(', ').toLowerCase()}.`;
        }
    } else {
        description += ' No existing lightning protection system is visible.';
    }
    
    // Electrical systems
    if (electricalSystems.length > 0) {
        description += ` Connected electrical systems include ${electricalSystems.join(', ')}, indicating comprehensive surge protection requirements.`;
    }
    
    return description.trim();
}

// Clear all survey data
function clearSurveyData() {
    if (confirm('Are you sure you want to clear all survey data and start a new report?')) {
        // Clear basic fields
        document.getElementById('siteAddress').value = '';
        document.getElementById('surveyDate').valueAsDate = new Date();
        document.getElementById('surveyorName').value = '';
        document.getElementById('clientRepName').value = '';
        
        // Clear structure fields
        document.getElementById('structureType').value = '';
        document.getElementById('structureHeight').value = '';
        document.getElementById('buildingAge').value = '';
        document.getElementById('numberOfFloors').value = '';
        document.getElementById('numberOfOccupants').value = '';
        document.getElementById('hasBasement').value = '';
        document.getElementById('roofType').value = '';
        document.getElementById('roofAccess').value = '';
        
        // Clear system fields
        document.getElementById('existingSystem').value = 'None Visible';
        document.getElementById('systemCondition').value = '';
        document.getElementById('lastTested').value = '';
        document.getElementById('standardInstalled').value = '';
        
        // Clear text areas
        document.getElementById('surveyFindings').value = '';
        document.getElementById('recommendations').value = '';
        
        // Clear all checkboxes
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        allCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Clear signature
        if (clientSignature) {
            clientSignature.reset();
        }
        
        // Clear uploaded images
        if (typeof uploadedImages !== 'undefined') {
            uploadedImages = {};
        }
        document.getElementById('buildingImagePreview').textContent = 'Click to upload building photo';
        document.getElementById('additionalPhotosPreview').textContent = 'Click to upload additional photos';
        
        console.log('Survey form cleared');
    }
}

// Export comprehensive survey data for PDF generation (WITHOUT calling generateAutoDescription)
function getSurveyData() {
    return {
        // Basic information
        siteAddress: document.getElementById('siteAddress')?.value || '',
        surveyDate: document.getElementById('surveyDate')?.value || '',
        surveyorName: document.getElementById('surveyorName')?.value || '',
        clientRepName: document.getElementById('clientRepName')?.value || '',
        
        // Structure details
        structureType: document.getElementById('structureType')?.value || '',
        structureHeight: document.getElementById('structureHeight')?.value || '',
        buildingAge: document.getElementById('buildingAge')?.value || '',
        numberOfFloors: document.getElementById('numberOfFloors')?.value || '',
        numberOfOccupants: document.getElementById('numberOfOccupants')?.value || '',
        hasBasement: document.getElementById('hasBasement')?.value || '',
        roofType: document.getElementById('roofType')?.value || '',
        roofAccess: document.getElementById('roofAccess')?.value || '',
        
        // Checkbox selections
        groundTypes: getSelectedGroundTypes(),
        wallTypes: getSelectedWallTypes(),
        systemComponents: getSelectedSystemComponents(),
        riskFactors: getSelectedRiskFactors(),
        electricalSystems: getSelectedElectricalSystems(),
        
        // Existing system
        existingSystem: document.getElementById('existingSystem')?.value || '',
        systemCondition: document.getElementById('systemCondition')?.value || '',
        lastTested: document.getElementById('lastTested')?.value || '',
        standardInstalled: document.getElementById('standardInstalled')?.value || '',
        
        // Comments
        surveyFindings: document.getElementById('surveyFindings')?.value || '',
        recommendations: document.getElementById('recommendations')?.value || '',
        
        // Signature
        signatureData: clientSignature ? clientSignature.getSignatureData() : null,
        
        // Auto-generated description - call the function separately to avoid circular reference
        autoDescription: generateAutoDescription()
    };
}

// Validate survey data before PDF generation
function validateSurveyData() {
    const data = getSurveyData();
    const errors = [];
    
    if (!data.siteAddress.trim()) {
        errors.push('Site Address is required');
    }
    
    if (!data.surveyorName.trim()) {
        errors.push('Surveyor Name is required');
    }
    
    if (errors.length > 0) {
        alert('Please complete the following required fields:\n\n' + errors.join('\n'));
        return false;
    }
    
    return true;
}
