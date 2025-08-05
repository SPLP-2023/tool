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
        
        yPosition += 15;
    }
    
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
    
    // ==================== DETAILED STRUCTURE INFORMATION ====================
    yPosition = startNewSection(pdf, 'DETAILED STRUCTURE INFORMATION', COMPANY_FOOTER);
    
    // Left column - Physical Details
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('PHYSICAL CHARACTERISTICS', LEFT_COLUMN_X, yPosition);
    let leftDetailY = yPosition + 10;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    
    const leftDetails = [];
    if (surveyData.structureType) leftDetails.push('Type: ' + surveyData.structureType);
    if (surveyData.structureHeight) leftDetails.push('Height: ' + surveyData.structureHeight + ' m');
    if (surveyData.numberOfFloors) leftDetails.push('Floors: ' + surveyData.numberOfFloors);
    if (surveyData.numberOfOccupants) leftDetails.push('Occupants: ' + surveyData.numberOfOccupants);
    if (surveyData.buildingAge) leftDetails.push('Age: ' + surveyData.buildingAge + ' years');
    if (surveyData.hasBasement) leftDetails.push('Basement: ' + surveyData.hasBasement);
    if (surveyData.roofType) leftDetails.push('Roof: ' + surveyData.roofType);
    if (surveyData.roofAccess) leftDetails.push('Access: ' + surveyData.roofAccess);
    
    leftDetails.forEach((detail, index) => {
        pdf.text(detail, LEFT_COLUMN_X, leftDetailY + (index * 6));
    });
    
    // Right column - Materials & Conditions
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('MATERIALS & CONDITIONS', RIGHT_COLUMN_X, yPosition);
    let rightDetailY = yPosition + 10;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    
    const rightDetails = [];
    if (surveyData.wallTypes.length > 0) {
        rightDetails.push('Wall Types:');
        surveyData.wallTypes.forEach(type => rightDetails.push('  • ' + type));
    }
    if (surveyData.groundTypes.length > 0) {
        rightDetails.push('Ground Types:');
        surveyData.groundTypes.forEach(type => rightDetails.push('  • ' + type));
    }
    
    rightDetails.forEach((detail, index) => {
        if (detail.startsWith('  •')) {
            pdf.text(detail, RIGHT_COLUMN_X + 5, rightDetailY + (index * 6));
        } else {
            pdf.setFont(undefined, 'bold');
            pdf.text(detail, RIGHT_COLUMN_X, rightDetailY + (index * 6));
            pdf.setFont(undefined, 'normal');
        }
    });
    
    yPosition = Math.max(leftDetailY + leftDetails.length * 6, rightDetailY + rightDetails.length * 6) + 20;
    
    // ==================== EXISTING SYSTEM DETAILED ASSESSMENT ====================
    yPosition = startNewSection(pdf, 'EXISTING SYSTEM DETAILED ASSESSMENT', COMPANY_FOOTER);
    
    // System overview
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('SYSTEM OVERVIEW', LEFT_COLUMN_X, yPosition);
    yPosition += 10;
    
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    
    const systemOverview = [];
    if (surveyData.existingSystem) systemOverview.push('System Status: ' + surveyData.existingSystem);
    if (surveyData.systemCondition) systemOverview.push('Overall Condition: ' + surveyData.systemCondition);
    if (surveyData.lastTested) systemOverview.push('Last Tested: ' + surveyData.lastTested);
    if (surveyData.standardInstalled) systemOverview.push('Installed Standard: ' + surveyData.standardInstalled);
    
    systemOverview.forEach((item, index) => {
        pdf.text(item, LEFT_COLUMN_X, yPosition + (index * 6));
    });
    
    yPosition += systemOverview.length * 6 + 15;
    
    // System components if any visible
    if (surveyData.systemComponents.length > 0) {
        pdf.setFont(undefined, 'bold');
        pdf.text('VISIBLE SYSTEM COMPONENTS', LEFT_COLUMN_X, yPosition);
        yPosition += 10;
        
        pdf.setFont(undefined, 'normal');
        surveyData.systemComponents.forEach((component, index) => {
            if (yPosition > PAGE_BOTTOM - 10) {
                pdf.addPage();
                yPosition = addPageHeader(pdf, 'EXISTING SYSTEM ASSESSMENT (CONTINUED)');
                addFooterToPage(pdf, COMPANY_FOOTER);
            }
            
            pdf.text('• ' + component, LEFT_COLUMN_X, yPosition);
            yPosition += 6;
        });
        
        yPosition += 10;
    }
    
    // ==================== DETAILED FINDINGS SECTION ====================
    if (surveyData.surveyFindings) {
        yPosition = startNewSection(pdf, 'DETAILED SURVEY FINDINGS', COMPANY_FOOTER);
        
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        const findingsLines = pdf.splitTextToSize(surveyData.surveyFindings, 170);
        
        findingsLines.forEach((line, index) => {
            if (yPosition > PAGE_BOTTOM - 10) {
                pdf.addPage();
                yPosition = addPageHeader(pdf, 'DETAILED SURVEY FINDINGS (CONTINUED)');
                addFooterToPage(pdf, COMPANY_FOOTER);
            }
            
            pdf.text(line, LEFT_COLUMN_X, yPosition);
            yPosition += 5;
        });
    }
    
    // ==================== RECOMMENDATIONS SECTION ====================
    if (surveyData.recommendations) {
        yPosition = startNewSection(pdf, 'RECOMMENDATIONS', COMPANY_FOOTER);
        
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        const recommendationLines = pdf.splitTextToSize(surveyData.recommendations, 170);
        
        recommendationLines.forEach((line, index) => {
            if (yPosition > PAGE_BOTTOM - 10) {
                pdf.addPage();
                yPosition = addPageHeader(pdf, 'RECOMMENDATIONS (CONTINUED)');
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
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    
    const nextSteps = [
        'Based on this survey, the following actions are recommended:',
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
