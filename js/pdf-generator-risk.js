// COMPLETE pdf-generator-risk.js
// Risk Assessment PDF Generator - COMPLETED VERSION

function generateRiskAssessmentPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    // Get form data
    const siteAddress = document.getElementById('siteAddress')?.value || '';
    const assessmentDate = document.getElementById('assessmentDate')?.value || '';
    const surveyorName = document.getElementById('surveyorName')?.value || '';
    const clientRepName = document.getElementById('clientRepName')?.value || '';
    const structureType = document.getElementById('structureType')?.value || '';
    const structureHeight = document.getElementById('structureHeight')?.value || '';
    const structureLength = document.getElementById('structureLength')?.value || '';
    const structureWidth = document.getElementById('structureWidth')?.value || '';
    const groundFlashDensity = document.getElementById('groundFlashDensity')?.value || '';
    const isolationFactor = document.getElementById('isolationFactor')?.value || '';
    const occupancyType = document.getElementById('occupancyType')?.value || '';
    const specialHazard = document.getElementById('specialHazard')?.value || '';
    const existingProtection = document.getElementById('existingProtection')?.value || '';
    const surgeProtection = document.getElementById('surgeProtection')?.value || '';
    const assessmentComments = document.getElementById('assessmentComments')?.value || '';
    
    // Get calculated risk values
    const lightningStrikes = document.getElementById('lightningStrikes')?.textContent || '-';
    const riskR1 = document.getElementById('riskR1')?.textContent || '-';
    const riskResult = document.getElementById('riskResult')?.textContent || 'Not calculated';
    
    let yPosition = 20;
    
    // ==================== COVER PAGE ====================
    const coverOptions = {
        reportTitle: 'Lightning Protection Risk Assessment Report',
        siteAddress: siteAddress,
        date: formatDate(assessmentDate),
        engineerName: surveyorName,
        additionalFields: [
            { label: 'Client Representative', value: clientRepName }
        ]
    };
    
    yPosition = createCoverPage(pdf, coverOptions);
    
    // ==================== ASSESSMENT SUMMARY SECTION ====================
    yPosition = startNewSection(pdf, 'RISK ASSESSMENT SUMMARY', COMPANY_FOOTER);
    
    // Risk assessment result status
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    
    // Determine result color based on content
    if (riskResult.toLowerCase().includes('protection required') || riskResult.toLowerCase().includes('fail')) {
        pdf.setTextColor(220, 20, 60); // Red
        pdf.text('RESULT: PROTECTION REQUIRED', 105, yPosition, { align: 'center' });
    } else if (riskResult.toLowerCase().includes('acceptable') || riskResult.toLowerCase().includes('pass')) {
        pdf.setTextColor(34, 139, 34); // Green
        pdf.text('RESULT: RISK ACCEPTABLE', 105, yPosition, { align: 'center' });
    } else {
        pdf.setTextColor(0, 0, 0); // Black
        pdf.text('RESULT: ' + riskResult.toUpperCase(), 105, yPosition, { align: 'center' });
    }
    pdf.setTextColor(0, 0, 0); // Reset to black
    yPosition += 20;
    
    // Risk calculation results in two columns
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    
    // Left column - Lightning strike data
    pdf.text('LIGHTNING STRIKE ANALYSIS', LEFT_COLUMN_X, yPosition);
    let leftColumnY = yPosition + 8;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    
    const leftColumnData = [
        'Annual Number of Strikes (N): ' + lightningStrikes,
        'Ground Flash Density: ' + groundFlashDensity + ' fl/km²/year',
        'Isolation Factor: ' + isolationFactor,
        'Structure Height: ' + structureHeight + ' m',
        'Structure Dimensions: ' + structureLength + ' × ' + structureWidth + ' m'
    ];
    
    leftColumnData.forEach((item, index) => {
        if (item.split(': ')[1] !== '') { // Only show if value exists
            pdf.text(item, LEFT_COLUMN_X, leftColumnY + (index * 6));
        }
    });
    
    // Right column - Risk analysis
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('RISK ANALYSIS', RIGHT_COLUMN_X, yPosition);
    let rightColumnY = yPosition + 8;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    
    const rightColumnData = [
        'Risk R1 (Loss of Life): ' + riskR1,
        'Acceptable Limit: 1 × 10⁻⁵',
        'Structure Type: ' + structureType,
        'Occupancy Type: ' + occupancyType.replace('-', ' '),
        'Existing Protection: ' + existingProtection.replace('-', ' ')
    ];
    
    rightColumnData.forEach((item, index) => {
        if (item.split(': ')[1] !== '') { // Only show if value exists
            pdf.text(item, RIGHT_COLUMN_X, rightColumnY + (index * 6));
        }
    });
    
    yPosition = Math.max(leftColumnY, rightColumnY) + 40;
    
    // ==================== DETAILED ASSESSMENT SECTION ====================
    yPosition = startNewSection(pdf, 'DETAILED RISK ASSESSMENT', COMPANY_FOOTER);
    
    // Structure Information
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('STRUCTURE INFORMATION', LEFT_COLUMN_X, yPosition);
    yPosition += 10;
    
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    
    const structureInfo = [
        'Type: ' + structureType,
        'Height: ' + structureHeight + ' m',
        'Length: ' + structureLength + ' m', 
        'Width: ' + structureWidth + ' m'
    ];
    
    // Add calculated area if dimensions exist
    if (structureLength && structureWidth) {
        const area = (parseFloat(structureLength) * parseFloat(structureWidth)).toFixed(1);
        structureInfo.push('Footprint Area: ' + area + ' m²');
    }
    
    structureInfo.forEach((info, index) => {
        if (info.split(': ')[1] !== '') {
            pdf.text(info, LEFT_COLUMN_X, yPosition + (index * 6));
        }
    });
    
    yPosition += 40;
    
    // Environmental Factors
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('ENVIRONMENTAL FACTORS', LEFT_COLUMN_X, yPosition);
    yPosition += 10;
    
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    
    const envFactors = [
        'Ground Flash Density (Ng): ' + groundFlashDensity + ' flashes/km²/year',
        'Isolation Factor (Cd): ' + isolationFactor,
        'Special Hazard Level: ' + specialHazard.replace('-', ' ')
    ];
    
    envFactors.forEach((factor, index) => {
        if (factor.split(': ')[1] !== '') {
            pdf.text(factor, LEFT_COLUMN_X, yPosition + (index * 6));
        }
    });
    
    yPosition += 30;
    
    // Protection Systems
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('EXISTING PROTECTION SYSTEMS', LEFT_COLUMN_X, yPosition);
    yPosition += 10;
    
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    
    const protectionInfo = [
        'Lightning Protection: ' + existingProtection.replace('-', ' '),
        'Surge Protection: ' + surgeProtection.replace('-', ' ')
    ];
    
    protectionInfo.forEach((info, index) => {
        if (info.split(': ')[1] !== '') {
            pdf.text(info, LEFT_COLUMN_X, yPosition + (index * 6));
        }
    });
    
    yPosition += 30;
    
    // ==================== RECOMMENDATIONS SECTION ====================
    if (assessmentComments) {
        if (yPosition > PAGE_BOTTOM - 50) {
            yPosition = startNewSection(pdf, 'ASSESSMENT COMMENTS & RECOMMENDATIONS', COMPANY_FOOTER);
        } else {
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('ASSESSMENT COMMENTS & RECOMMENDATIONS', LEFT_COLUMN_X, yPosition);
            yPosition += 15;
        }
        
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        const commentLines = pdf.splitTextToSize(assessmentComments, 170);
        pdf.text(commentLines, LEFT_COLUMN_X, yPosition);
        yPosition += commentLines.length * 4 + 20;
    }
    
    // ==================== METHODOLOGY SECTION ====================
    yPosition = startNewSection(pdf, 'RISK ASSESSMENT METHODOLOGY', COMPANY_FOOTER);
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    
    const methodology = [
        'This risk assessment has been conducted in accordance with BS EN 62305-2:2012',
        '"Protection against lightning - Part 2: Risk management".',
        '',
        'The assessment considers the following risk components:',
        '• R1: Risk of loss of human life',
        '• Annual number of lightning strikes to structure (N)',
        '• Probability of damage due to lightning strike',
        '• Consequential loss factors',
        '',
        'Key Formulas Used:',
        '• Collection Area (Ad) = L × W + 2 × H × (L + W) + π × H²',
        '• Annual Lightning Strikes (N) = Ng × Ad × Cd × 10⁻⁶',
        '• Risk (R1) = N × P × L',
        '',
        'Where:',
        '• Ng = Ground flash density (flashes/km²/year)',
        '• Ad = Collection area (m²)',
        '• Cd = Location factor',
        '• P = Probability of damage',
        '• L = Loss factor'
    ];
    
    methodology.forEach((line, index) => {
        if (yPosition > PAGE_BOTTOM - 10) {
            pdf.addPage();
            yPosition = addPageHeader(pdf, 'RISK ASSESSMENT METHODOLOGY (CONTINUED)');
            addFooterToPage(pdf, COMPANY_FOOTER);
        }
        
        if (line.startsWith('•')) {
            pdf.text(line, LEFT_COLUMN_X + 5, yPosition);
        } else {
            pdf.text(line, LEFT_COLUMN_X, yPosition);
        }
        yPosition += 5;
    });
    
    // Generate filename and save
    const filename = generateFilename('Risk_Assessment_Report');
    pdf.save(filename);
}

// Clear form data for new assessment
function clearRiskAssessmentData() {
    if (confirm('Are you sure you want to clear all data and start a new risk assessment?')) {
        // Clear all form fields
        document.getElementById('siteAddress').value = '';
        document.getElementById('assessmentDate').valueAsDate = new Date();
        document.getElementById('surveyorName').value = '';
        document.getElementById('clientRepName').value = '';
        document.getElementById('structureType').value = '';
        document.getElementById('structureHeight').value = '';
        document.getElementById('structureLength').value = '';
        document.getElementById('structureWidth').value = '';
        document.getElementById('groundFlashDensity').value = '2.0';
        document.getElementById('isolationFactor').value = '1';
        document.getElementById('occupancyType').value = '';
        document.getElementById('specialHazard').value = 'none';
        document.getElementById('existingProtection').value = 'none';
        document.getElementById('surgeProtection').value = 'none';
        document.getElementById('assessmentComments').value = '';
        
        // Clear calculation results
        document.getElementById('lightningStrikes').textContent = '-';
        document.getElementById('riskR1').textContent = '-';
        document.getElementById('riskResult').textContent = 'Calculate to see result';
        document.getElementById('riskResult').className = 'result-status';
        
        // Clear uploaded images
        uploadedImages = {};
        document.getElementById('clientSignaturePreview').textContent = 'Click to upload client signature';
        
        console.log('Risk assessment form cleared');
    }
}