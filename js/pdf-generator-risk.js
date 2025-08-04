// Risk Assessment PDF Generator
// Generates professional PDF reports for lightning protection risk assessments

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
    yPosition += 8;
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
            pdf.text(item, LEFT_COLUMN_X, yPosition + (index * 6));
        }
    });
    
    // Right column - Risk analysis
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('RISK ANALYSIS', RIGHT_COLUMN_X, yPosition - 8);
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    
    const rightColumnData = [
        'Risk R1 (Loss of Life): ' + riskR1,
        'Acceptable Limit: 1 × 10⁻⁵',
        'Structure Type: ' + structureType,
        'Existing Protection: ' + existingProtection.replace('-', ' '),
        '