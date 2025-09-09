// Enhanced Survey Report PDF Generator
// File: js/pdf-generator-survey.js

function generateSurveyPDF() {
    // Validate data before generating PDF
    if (!validateSurveyData()) {
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    // Get survey data
    const surveyData = getSurveyData();
    
    let yPosition = 20;
    
    // ==================== ENHANCED COVER PAGE ====================
    
    // Company logo centered at top - using correct company logo
    const logoHeight = addImageToPDF(pdf, COMPANY_LOGO_URL, 30, 20, 150, 60, true);
    yPosition = 20 + logoHeight + 10;
    
    // Report title
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('Lightning Protection Survey Report', 105, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Building image if provided (centered)
    if (uploadedImages['buildingImagePreview_data']) {
        const maxImageHeight = 80; // Reduced to ensure signature fits
        const imageHeight = addImageToPDF(pdf, uploadedImages['buildingImagePreview_data'], 30, yPosition, 150, maxImageHeight, true);
        yPosition += imageHeight + 15;
    }
    
    // Site address under building image
    if (surveyData.siteAddress) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Site Address:', 105, yPosition, { align: 'center' });
        yPosition += 8;
        
        pdf.setFont(undefined, 'normal');
        const addressLines = pdf.splitTextToSize(surveyData.siteAddress, 150);
        addressLines.forEach((line, index) => {
            pdf.text(line, 105, yPosition + (index * 5), { align: 'center' });
        });
        yPosition += addressLines.length * 5 + 15;
    }
    
    // Two-column layout for surveyor info and signature
    const leftColumnX = 30;
    const rightColumnX = 120;
    
    // Left side - Surveyor and Date
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Surveyor:', leftColumnX, yPosition);
    pdf.setFont(undefined, 'normal');
    pdf.text(surveyData.surveyorName, leftColumnX, yPosition + 8);
    
    pdf.setFont(undefined, 'bold');
    pdf.text('Date:', leftColumnX, yPosition + 20);
    pdf.setFont(undefined, 'normal');
    pdf.text(formatDate(surveyData.surveyDate), leftColumnX, yPosition + 28);
    
    // Right side - Site Representative and Compact Signature
    pdf.setFont(undefined, 'bold');
    pdf.text('Site Representative:', rightColumnX, yPosition);
    pdf.setFont(undefined, 'normal');
    pdf.text(surveyData.clientRepName, rightColumnX, yPosition + 8);
    
    // Compact signature display
    if (surveyData.signatureData) {
        pdf.setFont(undefined, 'bold');
        pdf.text('Signature:', rightColumnX, yPosition + 20);
        
        // Compact signature - 60x30 size
        const signatureHeight = addImageToPDF(pdf, surveyData.signatureData, rightColumnX, yPosition + 25, 60, 30, false);
    }
    
    // ==================== SURVEY SUMMARY SECTION ====================
    yPosition = startNewSection(pdf, 'SURVEY SUMMARY', COMPANY_FOOTER);

    // Auto-generated description
    if (surveyData.autoDescription) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('STRUCTURE & SYSTEM ASSESSMENT', LEFT_COLUMN_X, yPosition);
        yPosition += 15;
        
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        const descriptionLines = pdf.splitTextToSize(surveyData.autoDescription, 170);
        
        descriptionLines.forEach((line, index) => {
            if (yPosition > PAGE_BOTTOM - 10) {
                pdf.addPage();
                yPosition = addPageHeader(pdf, 'SURVEY SUMMARY (CONTINUED)');
                addFooterToPage(pdf, COMPANY_FOOTER);
            }
            
            pdf.text(line, LEFT_COLUMN_X, yPosition);
            yPosition += 5;
        });
        
        yPosition += 20;
    }

    // Two-column layout starts here
    const columnStartY = yPosition;

    // ==================== LEFT COLUMN ====================
    // System Overview
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('SYSTEM OVERVIEW', LEFT_COLUMN_X, yPosition);
    let leftColumnY = yPosition + 10;

    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);

    const systemOverview = [];
    if (surveyData.existingSystem) systemOverview.push('System Status: ' + surveyData.existingSystem);
    if (surveyData.systemCondition) systemOverview.push('Overall Condition: ' + surveyData.systemCondition);
    if (surveyData.lastTested) systemOverview.push('Last Tested: ' + surveyData.lastTested);
    if (surveyData.standardInstalled) systemOverview.push('Installed Standard: ' + surveyData.standardInstalled);

    systemOverview.forEach((item, index) => {
        pdf.text(item, LEFT_COLUMN_X, leftColumnY + (index * 6));
    });

    leftColumnY += systemOverview.length * 6 + 15;

    // Structure Overview (renamed from Physical Characteristics)
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(12);
    pdf.text('STRUCTURE OVERVIEW', LEFT_COLUMN_X, leftColumnY);
    leftColumnY += 10;

    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);

    const structureDetails = [];
    if (surveyData.structureType) structureDetails.push('Type: ' + surveyData.structureType);
    if (surveyData.structureHeight) structureDetails.push('Height: ' + surveyData.structureHeight + ' m');
    if (surveyData.numberOfFloors) structureDetails.push('Floors: ' + surveyData.numberOfFloors);
    if (surveyData.numberOfOccupants) structureDetails.push('Occupants: ' + surveyData.numberOfOccupants);
    if (surveyData.buildingAge) structureDetails.push('Age: ' + surveyData.buildingAge + ' years');
    if (surveyData.hasBasement) structureDetails.push('Basement: ' + surveyData.hasBasement);

    structureDetails.forEach((detail, index) => {
        pdf.text(detail, LEFT_COLUMN_X, leftColumnY + (index * 6));
    });

    leftColumnY += structureDetails.length * 6 + 15;

    // ==================== RIGHT COLUMN ====================
    let rightColumnY = columnStartY;

    // Visible System Components
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(12);
    pdf.text('VISIBLE SYSTEM COMPONENTS', RIGHT_COLUMN_X, rightColumnY);
    rightColumnY += 10;

    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);

    if (surveyData.systemComponents.length > 0) {
        surveyData.systemComponents.forEach((component, index) => {
            pdf.text('• ' + component, RIGHT_COLUMN_X, rightColumnY + (index * 6));
        });
        rightColumnY += surveyData.systemComponents.length * 6 + 15;
    } else {
        pdf.text('No visible components identified', RIGHT_COLUMN_X, rightColumnY);
        rightColumnY += 20;
    }

    // Structure Fabrics (renamed from Materials & Conditions)
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(12);
    pdf.text('STRUCTURE FABRICS', RIGHT_COLUMN_X, rightColumnY);
    rightColumnY += 10;
    
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    
    const structureFabrics = [];
    if (surveyData.wallTypes.length > 0) structureFabrics.push('Wall Types: ' + surveyData.wallTypes.join(', '));
    if (surveyData.groundTypes.length > 0) structureFabrics.push('Ground Types: ' + surveyData.groundTypes.join(', '));
    if (surveyData.roofType) structureFabrics.push('Roof Type: ' + surveyData.roofType);
    if (surveyData.roofAccess) structureFabrics.push('Roof Access: ' + surveyData.roofAccess);
    
    structureFabrics.forEach((item, index) => {
        pdf.text(item, RIGHT_COLUMN_X, rightColumnY + (index * 6));
    });
    
    rightColumnY += structureFabrics.length * 6 + 15;

    // Set yPosition to continue after both columns
    yPosition = Math.max(leftColumnY, rightColumnY) + 10;

    // ==================== CONNECTED ELECTRICAL SYSTEMS SECTION ====================
    if (surveyData.electricalSystems.length > 0) {
        if (yPosition > PAGE_BOTTOM - 60) {
            yPosition = startNewSection(pdf, 'CONNECTED ELECTRICAL SYSTEMS', COMPANY_FOOTER);
        } else {
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('CONNECTED ELECTRICAL SYSTEMS', LEFT_COLUMN_X, yPosition);
            yPosition += 15;
        }
        
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        pdf.text('The following electrical systems were identified for surge protection assessment:', LEFT_COLUMN_X, yPosition);
        yPosition += 10;
        
        // Electrical systems in two columns
        let currentColumn = 'left';
        let leftElecY = yPosition;
        let rightElecY = yPosition;
        
        surveyData.electricalSystems.forEach((system, index) => {
            const currentX = currentColumn === 'left' ? LEFT_COLUMN_X : RIGHT_COLUMN_X;
            let currentY = currentColumn === 'left' ? leftElecY : rightElecY;
            
            // Check if we need a new page
            if (currentY > PAGE_BOTTOM - 15) {
                pdf.addPage();
                yPosition = addPageHeader(pdf, 'CONNECTED ELECTRICAL SYSTEMS (CONTINUED)');
                addFooterToPage(pdf, COMPANY_FOOTER);
                leftElecY = yPosition;
                rightElecY = yPosition;
                currentY = yPosition;
            }
            
            pdf.text('• ' + system, currentX, currentY);
            
            // Update column positions
            if (currentColumn === 'left') {
                leftElecY = currentY + 6;
                currentColumn = 'right';
            } else {
                rightElecY = currentY + 6;
                currentColumn = 'left';
            }
        });
        
        yPosition = Math.max(leftElecY, rightElecY) + 15;
    }

    // ==================== DETAILED FINDINGS SECTION ====================
    if (surveyData.surveyFindings) {
        yPosition = startNewSection(pdf, 'ENGINEERS ADDITIONAL OBSERVATIONS', COMPANY_FOOTER);
        
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        const findingsLines = pdf.splitTextToSize(surveyData.surveyFindings, 170);
        
        findingsLines.forEach((line, index) => {
            if (yPosition > PAGE_BOTTOM - 10) {
                pdf.addPage();
                yPosition = addPageHeader(pdf, 'ENGINEERS ADDITIONAL OBSERVATIONS (CONTINUED)');
                addFooterToPage(pdf, COMPANY_FOOTER);
            }
            
            pdf.text(line, LEFT_COLUMN_X, yPosition);
            yPosition += 5;
        });
    }
    
    // ==================== SURVEY PHOTOS SECTION ====================
    let hasPhotos = false;
    
    // Additional photos
    if (uploadedImages['additionalPhotosPreview_data']) {
        yPosition = startNewSection(pdf, 'SURVEY PHOTOGRAPHS', COMPANY_FOOTER);
        hasPhotos = true;
        
        const images = Array.isArray(uploadedImages['additionalPhotosPreview_data']) ? 
            uploadedImages['additionalPhotosPreview_data'] : [uploadedImages['additionalPhotosPreview_data']];
        
        let imagesOnCurrentPage = 0;
        const imageWidth = 80;
        const imageHeight = 60;
        const imagesPerRow = 2;
        const maxImagesFirstPage = 6;
        const maxImagesSubsequentPage = 6;
        let isFirstPhotoPage = true;
        
        images.forEach((imageData, index) => {
            if (imageData) {
                const maxImagesThisPage = isFirstPhotoPage ? maxImagesFirstPage : maxImagesSubsequentPage;
                
                // Check if we need a new page
                if (imagesOnCurrentPage >= maxImagesThisPage) {
                    pdf.addPage();
                    yPosition = addPageHeader(pdf, 'SURVEY PHOTOGRAPHS (CONTINUED)');
                    addFooterToPage(pdf, COMPANY_FOOTER);
                    imagesOnCurrentPage = 0;
                    isFirstPhotoPage = false;
                }
                
                // Calculate position
                const row = Math.floor(imagesOnCurrentPage / imagesPerRow);
                const col = imagesOnCurrentPage % imagesPerRow;
                const xPos = col === 0 ? LEFT_COLUMN_X : RIGHT_COLUMN_X;
                const yPos = yPosition + (row * (imageHeight + 10));
                
                addImageToPDF(pdf, imageData, xPos, yPos, imageWidth, imageHeight);
                imagesOnCurrentPage++;
            }
        });
    }
    
    // ==================== NEXT STEPS SECTION ====================
    yPosition = startNewSection(pdf, 'RECOMMENDED NEXT STEPS', COMPANY_FOOTER);
    
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'normal');
    
    const nextSteps = [
        'Following this survey, the following actions are always recommended:',
        '',
        '1. Lightning Protection Risk Assessment',
        '   • Conduct detailed BS EN 62305-2 risk assessment',
        '   • Determine if lightning protection is required',
        '   • Calculate Lightning Protection Level (LPL) if needed',
        '',
        '2. Surge Protection Assessment',
        '   • Evaluate connected electrical systems',
        '   • Specify appropriate SPD requirements',
        '   • Design coordinated surge protection strategy',
        '',
        '3. System Design & Installation (if required)',
        '   • Develop detailed system design to BS EN 62305-3',
        '   • Specify installation requirements and materials',
        '   • Prepare installation drawings and method statements',
        '',
        '4. Testing & Commissioning',
        '   • Commission system with full electrical testing',
        '   • Provide test certificates and documentation',
        '   • Establish ongoing maintenance program'
    ];
    
    nextSteps.forEach((step, index) => {
        if (yPosition > PAGE_BOTTOM - 10) {
            pdf.addPage();
            yPosition = addPageHeader(pdf, 'RECOMMENDED NEXT STEPS (CONTINUED)');
            addFooterToPage(pdf, COMPANY_FOOTER);
        }
        
        if (step.startsWith('   •')) {
            pdf.text(step, LEFT_COLUMN_X + 10, yPosition);
        } else if (step.match(/^\d+\./)) {
            pdf.setFont(undefined, 'bold');
            pdf.text(step, LEFT_COLUMN_X, yPosition);
            pdf.setFont(undefined, 'normal');
        } else {
            pdf.text(step, LEFT_COLUMN_X, yPosition);
        }
        yPosition += 5;
    });
    
    // Generate filename and save
    const filename = generateFilename('Survey_Report');
    pdf.save(filename);
}
