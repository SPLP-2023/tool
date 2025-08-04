// Risk Assessment Calculation Functions
// BS EN 62305-2 Lightning Protection Risk Assessment

// Initialize with today's date
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('assessmentDate').valueAsDate = new Date();
});

// Main risk calculation function
function calculateRiskAssessment() {
    try {
        // Get structure dimensions
        const height = parseFloat(document.getElementById('structureHeight').value) || 0;
        const length = parseFloat(document.getElementById('structureLength').value) || 0;
        const width = parseFloat(document.getElementById('structureWidth').value) || 0;
        const groundFlashDensity = parseFloat(document.getElementById('groundFlashDensity').value) || 2.0;
        const isolationFactor = parseFloat(document.getElementById('isolationFactor').value) || 1.0;
        
        // Validate inputs
        if (height <= 0 || length <= 0 || width <= 0) {
            alert('Please enter valid structure dimensions (height, length, width)');
            return;
        }
        
        // Calculate collection area (Ad) according to BS EN 62305-2
        // Ad = L × W + 2 × H × (L + W) + π × H²
        const collectionArea = (length * width) + (2 * height * (length + width)) + (Math.PI * height * height);
        
        // Calculate annual number of lightning strikes (N)
        // N = Ng × Ad × Cd × 10⁻⁶
        const annualStrikes = groundFlashDensity * collectionArea * isolationFactor * Math.pow(10, -6);
        
        // Get risk factors
        const occupancyType = document.getElementById('occupancyType').value;
        const specialHazard = document.getElementById('specialHazard').value;
        const existingProtection = document.getElementById('existingProtection').value;
        const surgeProtection = document.getElementById('surgeProtection').value;
        
        // Calculate probability factors
        const probabilityFactors = calculateProbabilityFactors(existingProtection, surgeProtection);
        const lossFactors = calculateLossFactors(occupancyType, specialHazard);
        
        // Calculate Risk R1 (Risk of loss of human life)
        // R1 = N × P × L
        const riskR1 = annualStrikes * probabilityFactors.total * lossFactors.total;
        
        // Acceptable risk limit
        const acceptableLimit = 1e-5; // 10⁻⁵
        
        // Update display
        updateRiskDisplay(annualStrikes, riskR1, acceptableLimit);
        
    } catch (error) {
        console.error('Error calculating risk assessment:', error);
        alert('Error in risk calculation. Please check your inputs.');
    }
}

// Calculate probability factors based on protection measures
function calculateProbabilityFactors(existingProtection, surgeProtection) {
    let structuralDamage = 1.0; // PA (probability of structural damage)
    let equipmentDamage = 1.0; // PB (probability of equipment damage)
    
    // Adjust for existing lightning protection
    switch (existingProtection) {
        case 'lpl-1':
            structuralDamage = 0.02;
            break;
        case 'lpl-2':
            structuralDamage = 0.05;
            break;
        case 'lpl-3':
            structuralDamage = 0.1;
            break;
        case 'lpl-4':
            structuralDamage = 0.2;
            break;
        case 'partial':
            structuralDamage = 0.5;
            break;
        default:
            structuralDamage = 1.0;
    }
    
    // Adjust for surge protection
    switch (surgeProtection) {
        case 'complete':
            equipmentDamage = 0.01;
            break;
        case 'coordinated':
            equipmentDamage = 0.05;
            break;
        case 'partial':
            equipmentDamage = 0.1;
            break;
        default:
            equipmentDamage = 1.0;
    }
    
    // Combined probability (simplified approach)
    const totalProbability = Math.sqrt(structuralDamage * equipmentDamage);
    
    return {
        structural: structuralDamage,
        equipment: equipmentDamage,
        total: totalProbability
    };
}

// Calculate loss factors based on occupancy and hazards
function calculateLossFactors(occupancyType, specialHazard) {
    let occupancyFactor = 1.0;
    let hazardFactor = 1.0;
    
    // Occupancy type factors (LA)
    switch (occupancyType) {
        case 'no-panic':
            occupancyFactor = 1e-5;
            break;
        case 'low-panic':
            occupancyFactor = 1e-4;
            break;
        case 'panic-possible':
            occupancyFactor = 1e-3;
            break;
        case 'panic-with-consequences':
            occupancyFactor = 1e-2;
            break;
        case 'high-panic':
            occupancyFactor = 1e-1;
            break;
        default:
            occupancyFactor = 1e-3; // Default value
    }
    
    // Special hazard factors (LB)
    switch (specialHazard) {
        case 'none':
            hazardFactor = 1;
            break;
        case 'low':
            hazardFactor = 2;
            break;
        case 'ordinary':
            hazardFactor = 5;
            break;
        case 'high':
            hazardFactor = 10;
            break;
        case 'very-high':
            hazardFactor = 50;
            break;
        default:
            hazardFactor = 5;
    }
    
    // Combined loss factor
    const totalLoss = occupancyFactor * hazardFactor;
    
    return {
        occupancy: occupancyFactor,
        hazard: hazardFactor,
        total: totalLoss
    };
}

// Update the risk display with calculated values
function updateRiskDisplay(annualStrikes, riskR1, acceptableLimit) {
    // Format numbers for display
    const strikesDisplay = annualStrikes < 0.001 ? 
        annualStrikes.toExponential(2) : 
        annualStrikes.toFixed(4);
    
    const riskDisplay = riskR1.toExponential(2);
    const limitDisplay = acceptableLimit.toExponential(0);
    
    // Update display elements
    document.getElementById('lightningStrikes').textContent = strikesDisplay;
    document.getElementById('riskR1').textContent = riskDisplay;
    
    // Update result status
    const resultElement = document.getElementById('riskResult');
    
    if (riskR1 <= acceptableLimit) {
        resultElement.textContent = 'Risk Acceptable - No Protection Required';
        resultElement.className = 'result-status pass';
    } else {
        resultElement.textContent = 'Protection Required - Risk Exceeds Acceptable Limit';
        resultElement.className = 'result-status fail';
    }
    
    // Show comparison
    const ratio = riskR1 / acceptableLimit;
    if (ratio > 1) {
        const ratioText = ` (${ratio.toFixed(1)}× acceptable limit)`;
        resultElement.textContent += ratioText;
    }
}

// Auto-calculate when relevant fields change
document.addEventListener('DOMContentLoaded', function() {
    const autoCalcFields = [
        'structureHeight', 'structureLength', 'structureWidth',
        'groundFlashDensity', 'isolationFactor', 'occupancyType',
        'specialHazard', 'existingProtection', 'surgeProtection'
    ];
    
    autoCalcFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', function() {
                // Only auto-calculate if basic dimensions are filled
                const height = document.getElementById('structureHeight').value;
                const length = document.getElementById('structureLength').value;
                const width = document.getElementById('structureWidth').value;
                
                if (height && length && width) {
                    calculateRiskAssessment();
                }
            });
        }
    });
});

// Helper function to get structure area for display
function getStructureArea() {
    const length = parseFloat(document.getElementById('structureLength').value) || 0;
    const width = parseFloat(document.getElementById('structureWidth').value) || 0;
    return length * width;
}

// Helper function to get structure volume for display
function getStructureVolume() {
    const height = parseFloat(document.getElementById('structureHeight').value) || 0;
    const area = getStructureArea();
    return height * area;
}

// Export calculation data for PDF
function getCalculationSummary() {
    const height = parseFloat(document.getElementById('structureHeight').value) || 0;
    const length = parseFloat(document.getElementById('structureLength').value) || 0;
    const width = parseFloat(document.getElementById('structureWidth').value) || 0;
    const groundFlashDensity = parseFloat(document.getElementById('groundFlashDensity').value) || 2.0;
    const isolationFactor = parseFloat(document.getElementById('isolationFactor').value) || 1.0;
    
    // Calculate collection area
    const collectionArea = (length * width) + (2 * height * (length + width)) + (Math.PI * height * height);
    
    return {
        structureDimensions: `${length} × ${width} × ${height} m`,
        structureArea: getStructureArea().toFixed(1) + ' m²',
        structureVolume: getStructureVolume().toFixed(1) + ' m³',
        collectionArea: collectionArea.toFixed(1) + ' m²',
        groundFlashDensity: groundFlashDensity + ' fl/km²/year',
        isolationFactor: isolationFactor,
        annualStrikes: document.getElementById('lightningStrikes').textContent,
        riskR1: document.getElementById('riskR1').textContent,
        result: document.getElementById('riskResult').textContent
    };
}