// Enhanced Survey Report JavaScript
// File: js/survey-report.js

// Global signature instance
let clientSignature;

// Initialize the survey report
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    document.getElementById('surveyDate').valueAsDate = new Date();
    
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

// Generate auto-description based on selected data
function generateAutoDescription() {
    const data = getSurveyData();
    let description = '';
    
    // Structure information
    if (data.structureType) {
        description += `The surveyed structure is a ${data.structureType} building`;
        
        if (data.structureHeight) {
            description += ` of approximately ${data.structureHeight}m height`;
        }
        
        if (data.wallTypes.length > 0) {
            description += ` with ${data.wallTypes.join(' and ')} construction`;
        }
        
        if (data.buildingAge) {
            description += `, built approximately ${data.buildingAge} years ago`;
        }
        
        description += '.';
        
        // Additional structure details
        const structureDetails = [];
        if (data.numberOfFloors) structureDetails.push(`${data.numberOfFloors} floors`);
        if (data.numberOfOccupants) structureDetails.push(`${data.numberOfOccupants} occupants`);
        if (data.roofAccess) structureDetails.push(`${data.roofAccess.toLowerCase()} roof access`);
        
        if (structureDetails.length > 0) {
            description += ` The building has ${structureDetails.join(', ')}.`;
        }
    }
    
    // Ground conditions
    if (data.groundTypes.length > 0) {
        description += ` The surrounding ground consists of ${data.groundTypes.join(', ').toLowerCase()}.`;
    }
    
    // Risk factors
    if (data.riskFactors.length > 0) {
        description += ` Risk factors identified include ${data.riskFactors.join(', ')}.`;
    }
    
    // Existing system
    if (data.existingSystem && data.existingSystem !== 'None Visible') {
        description += ` The existing lightning protection system is assessed as ${data.existingSystem}`;
        
        if (data.systemCondition && data.systemCondition !== '') {
            description += ` with ${data.systemCondition.toLowerCase()} overall condition`;
        }
        
        if (data.lastTested && data.lastTested !== '') {
            description += `, last tested ${data.lastTested.toLowerCase()}`;
        }
        
        if (data.standardInstalled && data.standardInstalled !== '') {
            description += ` and installed to ${data.standardInstalled}`;
        }
        
        description += '.';
        
        // System components
        if (data.systemComponents.length > 0) {
            description += ` Visible system components include ${data.systemComponents.join(', ').toLowerCase()}.`;
        }
    } else {
        description += ' No existing lightning protection system is visible.';
    }
    
    // Electrical systems
    if (data.electricalSystems.length > 0) {
        description += ` Connected electrical systems include ${data.electricalSystems.join(', ')}, indicating comprehensive surge protection requirements.`;
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
        clientSignature.reset();
        
        // Clear uploaded images
        uploadedImages = {};
        document.getElementById('buildingImagePreview').textContent = 'Click to upload building photo';
        document.getElementById('additionalPhotosPreview').textContent = 'Click to upload additional photos';
        
        console.log('Survey form cleared');
    }
}

// Export comprehensive survey data for PDF generation
function getSurveyData() {
    return {
        // Basic information
        siteAddress: document.getElementById('siteAddress').value,
        surveyDate: document.getElementById('surveyDate').value,
        surveyorName: document.getElementById('surveyorName').value,
        clientRepName: document.getElementById('clientRepName').value,
        
        // Structure details
        structureType: document.getElementById('structureType').value,
        structureHeight: document.getElementById('structureHeight').value,
        buildingAge: document.getElementById('buildingAge').value,
        numberOfFloors: document.getElementById('numberOfFloors').value,
        numberOfOccupants: document.getElementById('numberOfOccupants').value,
        hasBasement: document.getElementById('hasBasement').value,
        roofType: document.getElementById('roofType').value,
        roofAccess: document.getElementById('roofAccess').value,
        
        // Checkbox selections
        groundTypes: getSelectedGroundTypes(),
        wallTypes: getSelectedWallTypes(),
        systemComponents: getSelectedSystemComponents(),
        riskFactors: getSelectedRiskFactors(),
        electricalSystems: getSelectedElectricalSystems(),
        
        // Existing system
        existingSystem: document.getElementById('existingSystem').value,
        systemCondition: document.getElementById('systemCondition').value,
        lastTested: document.getElementById('lastTested').value,
        standardInstalled: document.getElementById('standardInstalled').value,
        
        // Comments
        surveyFindings: document.getElementById('surveyFindings').value,
        recommendations: document.getElementById('recommendations').value,
        
        // Signature
        signatureData: clientSignature.getSignatureData(),
        
        // Auto-generated description
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
    
    if (!data.clientRepName.trim()) {
        errors.push('Site Representative Name is required');
    }
    
    if (!clientSignature.isSaved()) {
        errors.push('Site Representative signature is required');
    }
    
    if (errors.length > 0) {
        alert('Please complete the following required fields:\n\n' + errors.join('\n'));
        return false;
    }
    
    return true;
}
