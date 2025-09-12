// Remedial Report PDF Generator
// File: js/remedial-pdf.js

// Generate remedial report PDF
function generateRemedialPDF() {
    // Validate data before generating PDF
    if (!validateRemedialData()) {
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    // Get remedial data
    const remedialData = getRemedialData();
    
    // Company footer text
    const footer = "Strike Point Lightning Protection Ltd Registered office: Atkinson Evans, 10 Arnot Hill Road, Nottingham NG5 6LJ. Company No. 15114852, Registered in England and Wales. @: info@strikepoint.uk Tel: 01159903220";
    
    // Page settings
    const leftColumnX = 20;
    const rightColumnX = 110;
    const columnWidth = 85;
    const pageBottom = 270;
    
    let yPosition = 20;
    
    // ==================== COVER PAGE ====================
    // Company logo centered at top
    const logoHeight = addImageToPDF(pdf, COMPANY_LOGO_URL, 30, 20, 150, 60, true);
    yPosition = 20 + logoHeight + 10;
    
    // Report title
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('Lightning Protection Remedial Report', 105, yPosition, { align: 'center' });
    yPosition += 25;
    
    // Building image if provided (centered)
    if (remedialData.buildingImage) {
        const imageHeight = addImageToPDF(pdf, remedialData.buildingImage, 30, yPosition, 150, 80, true);
        yPosition += imageHeight + 10;
    }
    
    // Job Reference (if exists)
    if (remedialData.jobReference) {
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text(remedialData.jobReference, 105, yPosition, { align: 'center' });
        yPosition += 10;
    }
    
    // Site Address
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    if (remedialData.siteAddress) {
        const addressLines = pdf.splitTextToSize('Site Address: ' + remedialData.siteAddress, 150);
        addressLines.forEach((line, index) => {
            pdf.text(line, 105, yPosition + (index * 6), { align: 'center' });
        });
        yPosition += (addressLines.length * 6) + 15;
    }
    
    // Two-column layout for details
    const detailsY = yPosition;
    const leftX = 40;
    const rightX = 110;
    
    // Adjusted spacing values
    const sectionGap = 14;
    const valueGap = 7;
    
    // LEFT COLUMN
    let leftY = detailsY;
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.text('Remedial Engineer:', leftX, leftY);
    pdf.setFont(undefined, 'normal');
    pdf.text(remedialData.remedialEngineer || 'N/A', leftX, leftY + valueGap);
    
    leftY += sectionGap;
    pdf.setFont(undefined, 'bold');
    pdf.text('Remedial Date:', leftX, leftY);
    pdf.setFont(undefined, 'normal');
    pdf.text(formatDate(remedialData.remedialDate) || 'N/A', leftX, leftY + valueGap);
    
    // RIGHT COLUMN
    let rightY = detailsY;

    // Only add Site Staff details if they exist
    if (remedialData.siteStaffName) {
        pdf.setFont(undefined, 'bold');
        pdf.text('Site Staff Name:', rightX, rightY);
        pdf.setFont(undefined, 'normal');
        pdf.text(remedialData.siteStaffName, rightX, rightY + valueGap);
        rightY += sectionGap;
    }
    
    if (remedialData.signatureData) {
        pdf.setFont(undefined, 'bold');
        pdf.text('Site Staff Signature:', rightX, rightY);
        pdf.addImage(remedialData.signatureData, 'PNG', rightX, rightY + valueGap, 60, 20);
    }
    
    // ==================== REMEDIAL REPAIRS SECTION ====================
    yPosition = startNewSection(pdf, 'REMEDIAL REPAIRS', footer);
    
    // Original Failures Section
    if (remedialData.selectedFailures.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(8, 119, 225); // Strike Point Blue
        pdf.text('REMEDIAL WORKS', leftColumnX, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 15;
        
        remedialData.selectedFailures.forEach((failure, index) => {
            // Check if we need a new page
            const estimatedHeight = 60 + (failure.comment ? 20 : 0);
            if (yPosition + estimatedHeight > pageBottom) {
                pdf.addPage();
                yPosition = addPageHeader(pdf, 'REMEDIAL REPAIRS (CONTINUED)');
                addFooterToPage(pdf, footer);
            }
            
            // Completion checkbox - show as checked or unchecked
            const checkboxSymbol = failure.completed ? '[X]' : '[ ]';
            
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            const failureTitle = `${checkboxSymbol} ${index + 1}. ${failure.failure}`;
            const titleLines = pdf.splitTextToSize(failureTitle, 170);
            pdf.text(titleLines, leftColumnX, yPosition);
            yPosition += titleLines.length * 5 + 3;
            
            pdf.setFont(undefined, 'italic');
            pdf.setFontSize(10);
            const refLines = pdf.splitTextToSize('Ref: ' + failure.reference, 170);
            pdf.text(refLines, leftColumnX, yPosition);
            yPosition += refLines.length * 3 + 3;
            
            // Requirement
            pdf.setFont(undefined, 'bold');
            pdf.setFontSize(12);
            pdf.setTextColor(0, 0, 0);
            const reqLines = pdf.splitTextToSize('Requirement: ' + failure.requirement, 170);
            pdf.text(reqLines, leftColumnX, yPosition);
            yPosition += reqLines.length * 3 + 5;
            pdf.setTextColor(0, 0, 0);
            
            // Repair comment
            if (failure.comment) {
                pdf.setFont(undefined, 'normal');
                pdf.setFontSize(10);
                pdf.setTextColor(0, 0, 0);
                const commentLines = pdf.splitTextToSize('Repair Details: ' + failure.comment, 170);
                pdf.text(commentLines, leftColumnX, yPosition);
                yPosition += commentLines.length * 4 + 5;
                pdf.setTextColor(0, 0, 0);
            }
            
            // Imported label if applicable
            if (failure.imported) {
                pdf.setFont(undefined, 'italic');
                pdf.setFontSize(7);
                pdf.setTextColor(100, 100, 100);
                pdf.text('(Original failure from T&I Report)', leftColumnX, yPosition);
                yPosition += 8;
                pdf.setTextColor(0, 0, 0);
            }
            
            yPosition += 10;
        });
        
        yPosition += 10;
    }

        // Add recommendations within the same section
    if (remedialData.selectedRecommendations.length > 0) {
        remedialData.selectedRecommendations.forEach((recommendation, index) => {
            // Check if we need a new page
            const estimatedHeight = 40 + (recommendation.comment ? 20 : 0);
            if (yPosition + estimatedHeight > pageBottom) {
                pdf.addPage();
                yPosition = addPageHeader(pdf, 'REMEDIAL REPAIRS (CONTINUED)');
                addFooterToPage(pdf, footer);
            }
            
            // Completion checkbox
            const checkboxSymbol = recommendation.completed ? '[X]' : '[ ]';
            
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            const recTitle = `${checkboxSymbol} R${index + 1}. ${recommendation.recommendation}`;
            const titleLines = pdf.splitTextToSize(recTitle, 170);
            pdf.text(titleLines, leftColumnX, yPosition);
            yPosition += titleLines.length * 5 + 3;
            
            // Repair comment if provided
            if (recommendation.comment) {
                pdf.setFont(undefined, 'normal');
                pdf.setFontSize(9);
                pdf.setTextColor(0, 100, 200);
                const commentLines = pdf.splitTextToSize('Repair Details: ' + recommendation.comment, 170);
                pdf.text(commentLines, leftColumnX, yPosition);
                yPosition += commentLines.length * 4 + 5;
                pdf.setTextColor(0, 0, 0);
            }
            
            // Custom label if applicable
            if (recommendation.custom) {
                pdf.setFont(undefined, 'italic');
                pdf.setFontSize(7);
                pdf.setTextColor(100, 100, 100);
                pdf.text('(Custom recommendation)', leftColumnX, yPosition);
                yPosition += 8;
                pdf.setTextColor(0, 0, 0);
            }
            
            yPosition += 10;
        });
    }
    
    yPosition += 10;

    
    // Additional Repairs Section
    if (remedialData.additionalRepairs) {
        // Check if we need a new page
        if (yPosition + 50 > pageBottom) {
            pdf.addPage();
            yPosition = addPageHeader(pdf, 'REMEDIAL REPAIRS (CONTINUED)');
            addFooterToPage(pdf, footer);
        }
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(230, 126, 34); // Orange for additional work
        pdf.text('ADDITIONAL WORKS REQUIRED', leftColumnX, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 15;
        
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        const additionalLines = pdf.splitTextToSize(remedialData.additionalRepairs, 170);
        
        additionalLines.forEach((line, index) => {
            if (yPosition > pageBottom - 10) {
                pdf.addPage();
                yPosition = addPageHeader(pdf, 'REMEDIAL REPAIRS (CONTINUED)');
                addFooterToPage(pdf, footer);
            }
            
            pdf.text(line, leftColumnX, yPosition);
            yPosition += 5;
        });
        
        yPosition += 15;
    }
    
    // Completion Notes Section
    if (remedialData.completionNotes) {
        // Check if we need a new page
        if (yPosition + 50 > pageBottom) {
            pdf.addPage();
            yPosition = addPageHeader(pdf, 'REMEDIAL REPAIRS (CONTINUED)');
            addFooterToPage(pdf, footer);
        }
        
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(0, 0, 0); 
        pdf.text('COMPLETION NOTES', leftColumnX, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 15;
        
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        const completionLines = pdf.splitTextToSize(remedialData.completionNotes, 170);
        
        completionLines.forEach((line, index) => {
            if (yPosition > pageBottom - 10) {
                pdf.addPage();
                yPosition = addPageHeader(pdf, 'COMPLETION NOTES (CONTINUED)');
                addFooterToPage(pdf, footer);
            }
            
            pdf.text(line, leftColumnX, yPosition);
            yPosition += 5;
        });
    }
    
    // ==================== REMEDIAL IMAGES SECTION ====================
    if (remedialData.remedialImages && remedialData.remedialImages.length > 0) {
        yPosition = startNewSection(pdf, 'REMEDIAL WORK IMAGES', footer);
        
        const images = Array.isArray(remedialData.remedialImages) ? 
            remedialData.remedialImages : [remedialData.remedialImages];
        
        let imagesOnCurrentPage = 0;
        let isFirstImagePage = true;
        const imageWidth = 80;
        const imageHeight = 60;
        const imagesPerRow = 2;
        const maxImagesFirstPage = 6;
        const maxImagesSubsequentPage = 6;
        
        images.forEach((imageData, index) => {
            if (imageData) {
                const maxImagesThisPage = isFirstImagePage ? maxImagesFirstPage : maxImagesSubsequentPage;
                
                // Check if we need a new page
                if (imagesOnCurrentPage >= maxImagesThisPage) {
                    pdf.addPage();
                    yPosition = addPageHeader(pdf, 'REMEDIAL WORK IMAGES (CONTINUED)');
                    addFooterToPage(pdf, footer);
                    imagesOnCurrentPage = 0;
                    isFirstImagePage = false;
                }
                
                // Calculate position
                const row = Math.floor(imagesOnCurrentPage / imagesPerRow);
                const col = imagesOnCurrentPage % imagesPerRow;
                const xPos = col === 0 ? leftColumnX : rightColumnX;
                const yPos = yPosition + (row * (imageHeight + 10));
                
                addImageToPDF(pdf, imageData, xPos, yPos, imageWidth, imageHeight);
                imagesOnCurrentPage++;
            }
        });
    }
    
    // Generate filename and save
    const filename = generateFilename(`Lightning_Protection_Remedial_Report_${remedialData.jobReference}`);
    pdf.save(filename);

    


// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
    });
}

// Helper function to generate filename with date
function generateFilename(baseFilename) {
    const date = new Date().toISOString().split('T')[0];
    return `${baseFilename}_${date}.pdf`;
}
}
