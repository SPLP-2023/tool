// Survey Report PDF Generator
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
    
    // ==================== COVER PAGE ====================
    const coverOptions = {
        reportTitle: 'Lightning Protection Survey Report',
        siteAddress: surveyData.siteAddress,
        date: formatDate(surveyData.surveyDate),
        engineerName: surveyData.surveyorName,
        additionalFields: [
            { label: 'Client Representative', value: surveyData.clientRepName }
        ]
    };
    
    yPosition = createCoverPage(pdf, coverOptions);
    
    // Add client signature to cover page if available
    if (surveyData.signatureData) {
        if (yPosition > PAGE_BOTTOM - 60) {
            pdf.addPage();
            yPosition = addPageHeader(pdf, 'SURVEY REPORT');
            addFooterToPage(pdf, COMPANY_FOOTER);
        }
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Client Representative Signature:', 105, yPosition, { align: 'center' });
        yPosition += 15;
        
        const signatureHeight = addImageToPDF(pdf, surveyData.signatureData, 55, yPosition, 100, 40, true);
        yPosition += signatureHeight + 10;
    }
    
    // ==================== SURVEY SUMMARY SECTION ====================
    yPosition = startNewSection(pdf, 'SURVEY SUMMARY', COMPANY_FOOTER);
    
    // Survey overview in two columns
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    
    // Left column - Structure Information
    pdf.text('STRUCTURE INFORMATION', LEFT_COLUMN_X, yPosition);
    let leftColumnY = yPosition + 10;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    
    const structureInfo = [
        'Type: ' + surveyData.structureType,
        'Height: ' + (surveyData.structureHeight ? surveyData.structureHeight + ' m' : 'Not specified'),
        'Roof Type: ' + surveyData.roofType,
        'Roof Access: ' + surveyData.roofAccess
    ];
    
    structureInfo.forEach((info, index) => {
        if (info.split(': ')[1] !== '') {
            pdf.text(info, LEFT_COLUMN_X, leftColumnY + (index * 6));
        }
    });
    
    // Right column - Existing System
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('EXISTING SYSTEM ASSESSMENT', RIGHT_COLUMN_X, yPosition);
    let rightColumnY = yPosition + 10;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    
    const systemInfo = [
        'Current System: ' + surveyData.existingSystem,
        'Overall Condition: ' + (surveyData.systemCondition || 'Not assessed'),
        'Assessment Required: ' + (surveyData.existingSystem === 'None' ? 'Yes - New Installation' : 'Yes - Inspection Needed')
    ];
    
    systemInfo.forEach((info, index) => {
        if (info.split(': ')[1] !== '') {
            pdf.text(info, RIGHT_COLUMN_X, rightColumnY + (index * 6));
        }
    });
    
    yPosition = Math.max(leftColumnY, rightColumnY) + 40;
    
    // ==================== RISK FACTORS ASSESSMENT ====================
    if (surveyData.riskFactors.length > 0) {
        if (yPosition > PAGE_BOTTOM - 60) {
            yPosition = startNewSection(pdf, 'RISK FACTORS ASSESSMENT', COMPANY_FOOTER);
        } else {
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('IDENTIFIED RISK FACTORS', LEFT_COLUMN_X, yPosition);
            yPosition += 15;
        }
        
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        
        // Risk factors in two columns
        let currentColumn = 'left';
        let leftRiskY = yPosition;
        let rightRiskY = yPosition;
        
        surveyData.riskFactors.forEach((factor, index) => {
            const currentX = currentColumn === 'left' ? LEFT_COLUMN_X : RIGHT_COLUMN_X;
            let currentY = currentColumn === 'left' ? leftRiskY : rightRiskY;
            
            // Check if we need a new page
            if (currentY > PAGE_BOTTOM - 15) {
                pdf.addPage();
                yPosition = addPageHeader(pdf, 'RISK FACTORS ASSESSMENT (CONTINUED)');
                addFooterToPage(pdf, COMPANY_FOOTER);
                leftRiskY = yPosition;
                rightRiskY = yPosition;
                currentY = yPosition;
            }
            
            pdf.text('• ' + factor, currentX, currentY);
            
            // Update column positions
            if (currentColumn === 'left') {
                leftRiskY = currentY + 6;
                currentColumn = 'right';
            } else {
                rightRiskY = currentY + 6;
                currentColumn = 'left';
            }
        });
        
        yPosition = Math.max(leftRiskY, rightRiskY) + 15;
    }
    
    // ==================== DETAILED FINDINGS SECTION ====================
    yPosition = startNewSection(pdf, 'DETAILED SURVEY FINDINGS', COMPANY_FOOTER);
    
    if (surveyData.surveyFindings) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('SURVEY OBSERVATIONS', LEFT_COLUMN_X, yPosition);
        yPosition += 15;
        
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
        
        yPosition += 15;
    }
    
    // ==================== RECOMMENDATIONS SECTION ====================
    if (surveyData.recommendations) {
        if (yPosition > PAGE_BOTTOM - 60) {
            yPosition = startNewSection(pdf, 'RECOMMENDATIONS', COMPANY_FOOTER);
        } else {
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('INITIAL RECOMMENDATIONS', LEFT_COLUMN_X, yPosition);
            yPosition += 15;
        }
        
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
        
        yPosition += 15;
    }
    
    // ==================== SURVEY PHOTOS SECTION ====================
    let hasPhotos = false;
    
    // Building image
    if (uploadedImages['buildingImagePreview_data']) {
        yPosition = startNewSection(pdf, 'SURVEY PHOTOGRAPHS', COMPANY_FOOTER);
        hasPhotos = true;
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Building Overview:', LEFT_COLUMN_X, yPosition);
        yPosition += 15;
        
        const imageHeight = addImageToPDF(pdf, uploadedImages['buildingImagePreview_data'], LEFT_COLUMN_X, yPosition, 170, 100, false);
        yPosition += imageHeight + 20;
    }
    
    // Additional photos
    if (uploadedImages['additionalPhotosPreview_data']) {
        if (!hasPhotos) {
            yPosition = startNewSection(pdf, 'SURVEY PHOTOGRAPHS', COMPANY_FOOTER);
        }
        
        const images = Array.isArray(uploadedImages['additionalPhotosPreview_data']) ? 
            uploadedImages['additionalPhotosPreview_data'] : [uploadedImages['additionalPhotosPreview_data']];
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Additional Survey Photos:', LEFT_COLUMN_X, yPosition);
        yPosition += 15;
        
        let imagesOnCurrentPage = 0;
        const imageWidth = 80;
        const imageHeight = 60;
        const imagesPerRow = 2;
        const maxImagesFirstPage = 4;
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
        'Based on this initial survey, the following steps are recommended:',
        '',
        '1. Detailed Risk Assessment',
        '   • Conduct comprehensive BS EN 62305-2 risk assessment',
        '   • Determine Lightning Protection Level (LPL) requirements',
        '   • Calculate specific protection measures needed',
        '',
        '2. System Design (if protection required)',
        '   • Develop detailed lightning protection system design',
        '   • Specify materials and installation requirements',
        '   • Prepare installation drawings and specifications',
        '',
        '3. Installation and Commissioning',
        '   • Install lightning protection system to BS EN 62305-3',
        '   • Commission system with full testing and documentation',
        '   • Provide as-built drawings and test certificates',
        '',
        '4. Ongoing Maintenance',
        '   • Establish annual inspection program',
        '   • Maintain system in accordance with BS EN 62305-3',
        '   • Update documentation as required'
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