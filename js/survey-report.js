// Survey Report Main JavaScript
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

// Get selected risk factors
function getSelectedRiskFactors() {
    const riskFactors = [];
    const checkboxes = document.querySelectorAll('.risk-checkbox:checked');
    
    checkboxes.forEach(checkbox => {
        const label = document.querySelector(`label[for="${checkbox.id}"]`);
        if (label) {
            riskFactors.push(label.textContent);
        }
    });
    
    return riskFactors;
}

// Clear all survey data
function clearSurveyData() {
    if (confirm('Are you sure you want to clear all survey data and start a new report?')) {
        // Clear all form fields
        document.getElementById('siteAddress').value = '';
        document.getElementById('surveyDate').valueAsDate = new Date();
        document.getElementById('surveyorName').value = '';
        document.getElementById('clientRepName').value = '';
        document.getElementById('structureType').value = '';
        document.getElementById('structureHeight').value = '';
        document.getElementById('roofType').value = '';
        document.getElementById('roofAccess').value = '';
        document.getElementById('existingSystem').value = 'None';
        document.getElementById('systemCondition').value = '';
        document.getElementById('surveyFindings').value = '';
        document.getElementById('recommendations').value = '';
        
        // Clear risk factor checkboxes
        document.querySelectorAll('.risk-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Clear signature using the component
        clientSignature.reset();
        
        // Clear uploaded images
        uploadedImages = {};
        document.getElementById('buildingImagePreview').textContent = 'Click to upload building photo';
        document.getElementById('additionalPhotosPreview').textContent = 'Click to upload additional photos';
        
        console.log('Survey form cleared');
    }
}

// Export survey data for PDF generation
function getSurveyData() {
    return {
        siteAddress: document.getElementById('siteAddress').value,
        surveyDate: document.getElementById('surveyDate').value,
        surveyorName: document.getElementById('surveyorName').value,
        clientRepName: document.getElementById('clientRepName').value,
        structureType: document.getElementById('structureType').value,
        structureHeight: document.getElementById('structureHeight').value,
        roofType: document.getElementById('roofType').value,
        roofAccess: document.getElementById('roofAccess').value,
        existingSystem: document.getElementById('existingSystem').value,
        systemCondition: document.getElementById('systemCondition').value,
        surveyFindings: document.getElementById('surveyFindings').value,
        recommendations: document.getElementById('recommendations').value,
        riskFactors: getSelectedRiskFactors(),
        signatureData: clientSignature.getSignatureData()
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
        errors.push('Client Representative Name is required');
    }
    
    if (!clientSignature.isSaved()) {
        errors.push('Client signature is required');
    }
    
    if (errors.length > 0) {
        alert('Please complete the following required fields:\n\n' + errors.join('\n'));
        return false;
    }
    
    return true;
}