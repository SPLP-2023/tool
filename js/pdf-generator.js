// Company logo URL (hosted on GitHub)
const COMPANY_LOGO_URL = "https://raw.githubusercontent.com/SPLP-2023/tool/refs/heads/main/assets/Color%20logo%20-%20no%20background.png";

// PDF Generation Functions with Two-Column Layout
function addImageToPDF(pdf, imageData, x, y, maxWidth, maxHeight, centerAlign = false) {
    if (imageData) {
        try {
            const format = imageData.includes('data:image/jpeg') ? 'JPEG' : 'PNG';
            
            // Get image properties using jsPDF's built-in method
            const imgProps = pdf.getImageProperties(imageData);
            const imgWidth = imgProps.width;
            const imgHeight = imgProps.height;
            const aspectRatio = imgWidth / imgHeight;
            
            // Calculate final dimensions to fit within maxWidth x maxHeight
            let finalWidth, finalHeight;
            
            if (aspectRatio > (maxWidth / maxHeight)) {
                // Image is wider - constrain by width
                finalWidth = maxWidth;
                finalHeight = maxWidth / aspectRatio;
            } else {
                // Image is taller - constrain by height
                finalHeight = maxHeight;
                finalWidth = maxHeight * aspectRatio;
            }
            
            // Center align if requested
            let finalX = x;
            if (centerAlign) {
                finalX = x + (maxWidth - finalWidth) / 2;
            }
            
            pdf.addImage(imageData, format, finalX, y, finalWidth, finalHeight);
            return finalHeight + 5; // Return actual height used plus margin
            
        } catch (error) {
            console.error('Error adding image to PDF:', error);
            // Fallback to original method if aspect ratio calculation fails
            const format = imageData.includes('data:image/jpeg') ? 'JPEG' : 'PNG';
            pdf.addImage(imageData, format, x, y, maxWidth, maxHeight);
            return maxHeight + 5;
        }
    }
    return 0;
}

function addPageHeader(pdf, title) {
    // Company logo in header
    addImageToPDF(pdf, COMPANY_LOGO_URL, 160, 8, 40, 20, true);
    
    // Add section title spanning full width
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text(title, 105, 30, { align: 'center' });
    
    return 40; // Return Y position after header
}

function addFooterToPage(pdf, footer) {
    pdf.setFontSize(8);
    const footerLines = pdf.splitTextToSize(footer, 190);
    pdf.text(footerLines, 105, 280, { align: 'center' });
}

function startNewSection(pdf, title, footer) {
    pdf.addPage();
    const yStart = addPageHeader(pdf, title);
    addFooterToPage(pdf, footer);
    return yStart;
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    const footer = "Strike Point Lightning Protection Ltd Registered office: Atkinson Evans, 10 Arnot Hill Road, Nottingham NG5 6LJ. Company No. 15114852, Registered in England and Wales. @: info@strikepoint.uk Tel: 01159903220";
    
    // Column settings
    const leftColumnX = 20;
    const rightColumnX = 110;
    const columnWidth = 85;
    const pageBottom = 270;
    
    // Get form data
    const siteAddress = document.getElementById('siteAddress').value;
    const testDate = document.getElementById('testDate').value;
    const engineerName = document.getElementById('engineerName').value;
    const testKitRef = document.getElementById('testKitRef').value;
    const standard = document.getElementById('standard').value;
    const generalComments = document.getElementById('generalComments').value;
    const finalComments = document.getElementById('finalComments').value;
    
    // Get structure details
    const structureHeight = document.getElementById('structureHeight').value;
    const structurePerimeter = document.getElementById('structurePerimeter').value;
    
    // Get system details dropdowns
    const earthPits = document.getElementById('earthPits').value;
    const mainEquipotentialBond = document.getElementById('mainEquipotentialBond').value;
    const surgeInstalled = document.getElementById('surgeInstalled').value;
    const surgeType = document.getElementById('surgeType').value;
    const surgeSafe = document.getElementById('surgeSafe').value;
    
    let yPosition = 20;
    

    // ==================== COVER PAGE ====================
    // Company logo centered at top
    const logoHeight = addImageToPDF(pdf, COMPANY_LOGO_URL, 30, 20, 150, 60, true);
    yPosition = 20 + logoHeight + 10;
    
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('Lightning Protection System Report', 105, yPosition, { align: 'center' });
    yPosition += 30;
    
    if (uploadedImages['buildingImagePreview_data']) {
        const imageHeight = addImageToPDF(pdf, uploadedImages['buildingImagePreview_data'], 30, yPosition, 150, 100);
        yPosition += imageHeight + 20;
    }
    
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('Site Details:', 105, yPosition, { align: 'center' });
    yPosition += 20;
    
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    const details = [
        'Site Address: ' + siteAddress,
        'Date: ' + testDate,
        'Engineer: ' + engineerName,
        'Test Kit Reference: ' + testKitRef
    ];
    
    details.forEach((detail, index) => {
        pdf.text(detail, 105, yPosition + (index * 10), { align: 'center' });
    });
    
    // ==================== INSPECTION SUMMARY SECTION ====================
    yPosition = startNewSection(pdf, 'INSPECTION SUMMARY', footer);
    
    // Result status spanning both columns
    const hasFaults = selectedFailuresList.length > 0;
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    if (hasFaults) {
        pdf.setTextColor(220, 20, 60);
        pdf.text('RESULT: FAIL', 105, yPosition, { align: 'center' });
    } else {
        pdf.setTextColor(34, 139, 34);
        pdf.text('RESULT: PASS', 105, yPosition, { align: 'center' });
    }
    pdf.setTextColor(0, 0, 0);
    yPosition += 15;
    
    pdf.setFontSize(12);
    pdf.text('Standard Applied: ' + standard, 105, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Two-column layout for failures
    let leftColumnY = yPosition;
    let rightColumnY = yPosition;
    let failureColumn = 'left';
    let imagesOnPage = 0;
    let isFirstInspectionPage = true;
    const maxImagesFirstPage = 4;
    const maxImagesSubsequentPage = 6;
    
    if (selectedFailuresList.length > 0) {
        selectedFailuresList.forEach((failure, index) => {
            const currentX = failureColumn === 'left' ? leftColumnX : rightColumnX;
            let currentY = failureColumn === 'left' ? leftColumnY : rightColumnY;
            
            // Estimate space needed for this failure
            const commentLines = failure.comment ? pdf.splitTextToSize('Comment: ' + failure.comment, columnWidth) : [];
            const estimatedHeight = 50 + (commentLines.length * 4) + (failure.imageData ? 65 : 0);
            
            // Check if we need a new page
            if (currentY + estimatedHeight > pageBottom) {
                pdf.addPage();
                yPosition = addPageHeader(pdf, 'INSPECTION SUMMARY (CONTINUED)');
                addFooterToPage(pdf, footer);
                leftColumnY = yPosition;
                rightColumnY = yPosition;
                failureColumn = 'left';
                imagesOnPage = 0;
                isFirstInspectionPage = false;
                currentY = yPosition;
            }
            
            // Add failure content
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'bold');
            const failureTitle = (index + 1) + '. ' + failure.failure;
            const titleLines = pdf.splitTextToSize(failureTitle, columnWidth);
            pdf.text(titleLines, currentX, currentY);
            currentY += titleLines.length * 4 + 3;
            
            pdf.setFont(undefined, 'italic');
            pdf.setFontSize(8);
            const refLines = pdf.splitTextToSize('Ref: ' + failure.reference, columnWidth);
            pdf.text(refLines, currentX, currentY);
            currentY += refLines.length * 3 + 3;
            
            // Add minimum requirement
            pdf.setFont(undefined, 'bold');
            pdf.setFontSize(8);
            pdf.setTextColor(40, 167, 69);
            const reqLines = pdf.splitTextToSize('Requirement: ' + failure.requirement, columnWidth);
            pdf.text(reqLines, currentX, currentY);
            currentY += reqLines.length * 3 + 5;
            pdf.setTextColor(0, 0, 0);
            
            if (failure.comment) {
                pdf.setFont(undefined, 'normal');
                pdf.setFontSize(9);
                pdf.text(commentLines, currentX, currentY);
                currentY += commentLines.length * 4 + 5;
            }
            
            // Add image if available and within limits
            if (failure.imageData) {
                const maxImages = isFirstInspectionPage ? maxImagesFirstPage : maxImagesSubsequentPage;
                if (imagesOnPage < maxImages) {
                    pdf.setFont(undefined, 'italic');
                    pdf.setFontSize(8);
                    pdf.text('Image:', currentX, currentY);
                    currentY += 5;
                    const imageHeight = addImageToPDF(pdf, failure.imageData, currentX, currentY, 60, 45);
                    currentY += imageHeight;
                    imagesOnPage++;
                }
            }
            
            currentY += 10;
            
            // Update column positions
            if (failureColumn === 'left') {
                leftColumnY = currentY;
                failureColumn = 'right';
            } else {
                rightColumnY = currentY;
                failureColumn = 'left';
            }
        });
    } else {
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(12);
        pdf.text('No faults identified during inspection.', 105, yPosition, { align: 'center' });
    }
    
    // Add general comments if present
    if (generalComments) {
        const maxY = Math.max(leftColumnY, rightColumnY);
        if (maxY + 50 > pageBottom) {
            pdf.addPage();
            yPosition = addPageHeader(pdf, 'INSPECTION SUMMARY (CONTINUED)');
            addFooterToPage(pdf, footer);
        } else {
            yPosition = maxY + 15;
        }
        
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        const commentLines = pdf.splitTextToSize(generalComments, 170);
        pdf.text(commentLines, leftColumnX, yPosition);
    }
    
    // ==================== STRUCTURE AND SYSTEM DETAILS SECTION ====================
    yPosition = startNewSection(pdf, 'STRUCTURE AND SYSTEM DETAILS', footer);
    
    leftColumnY = yPosition;
    rightColumnY = yPosition;
    
    // Left Column - Structure Details
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('STRUCTURE DETAILS', leftColumnX, leftColumnY);
    leftColumnY += 12;
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    
    // Structure measurements
    if (structureHeight) {
        pdf.setFont(undefined, 'bold');
        pdf.text('Structure Height:', leftColumnX, leftColumnY);
        pdf.setFont(undefined, 'normal');
        pdf.text(structureHeight + ' m', leftColumnX, leftColumnY + 5);
        leftColumnY += 12;
    }
    
    if (structurePerimeter) {
        pdf.setFont(undefined, 'bold');
        pdf.text('Structure Perimeter:', leftColumnX, leftColumnY);
        pdf.setFont(undefined, 'normal');
        pdf.text(structurePerimeter + ' m', leftColumnX, leftColumnY + 5);
        leftColumnY += 12;
    }
    
    // Structure questions
    const structureQuestions = [
        { key: 'groundType', label: 'Ground Type' },
        { key: 'wallType', label: 'Structure Wall Type' },
        { key: 'roofType', label: 'Roof Type' },
        { key: 'roofStructure', label: 'Roof Structure' }
    ];
    
    structureQuestions.forEach(question => {
        if (systemDetails[question.key] && systemDetails[question.key].length > 0) {
            pdf.setFont(undefined, 'bold');
            pdf.text(question.label + ':', leftColumnX, leftColumnY);
            leftColumnY += 5;
            pdf.setFont(undefined, 'normal');
            
            const answers = systemDetails[question.key].join(', ');
            const answerLines = pdf.splitTextToSize(answers, columnWidth);
            pdf.text(answerLines, leftColumnX, leftColumnY);
            leftColumnY += answerLines.length * 4 + 8;
        }
    });
    
    // Right Column - System Details
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('SYSTEM DETAILS', rightColumnX, rightColumnY);
    rightColumnY += 12;
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    
    // System questions
    const systemQuestions = [
        { key: 'airTermination', label: 'Air-Termination Type' },
        { key: 'atConductors', label: 'AT Conductors' },
        { key: 'downConductorType', label: 'Down Conductor Type' },
        { key: 'dcConductors', label: 'DC Conductors' }
    ];
    
    systemQuestions.forEach(question => {
        if (systemDetails[question.key] && systemDetails[question.key].length > 0) {
            pdf.setFont(undefined, 'bold');
            pdf.text(question.label + ':', rightColumnX, rightColumnY);
            rightColumnY += 5;
            pdf.setFont(undefined, 'normal');
            
            const answers = systemDetails[question.key].join(', ');
            const answerLines = pdf.splitTextToSize(answers, columnWidth);
            pdf.text(answerLines, rightColumnX, rightColumnY);
            rightColumnY += answerLines.length * 4 + 8;
        }
    });
    
    // Add dropdown questions to right column
    const dropdownQuestions = [
        { id: 'earthPits', label: 'Earth Pits', value: earthPits },
        { id: 'mainEquipotentialBond', label: 'Main Equipotential Bond', value: mainEquipotentialBond },
        { id: 'surgeInstalled', label: 'Surge Protection Installed', value: surgeInstalled }
    ];
    
    dropdownQuestions.forEach(question => {
        if (question.value) {
            pdf.setFont(undefined, 'bold');
            pdf.text(question.label + ':', rightColumnX, rightColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(question.value, rightColumnX, rightColumnY + 5);
            rightColumnY += 12;
        }
    });
    
    // Surge Protection details
    if (surgeInstalled === 'Yes') {
        if (surgeType) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Surge Protection Type:', rightColumnX, rightColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(surgeType, rightColumnX, rightColumnY + 5);
            rightColumnY += 12;
        }
        
        if (surgeSafe) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Surge Protection Status:', rightColumnX, rightColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(surgeSafe, rightColumnX, rightColumnY + 5);
            rightColumnY += 12;
        }
    }
    
    // ==================== EARTH RESISTANCE TESTING SECTION ====================
    yPosition = startNewSection(pdf, 'EARTH RESISTANCE TESTING', footer);
    
    const numEarths = parseInt(document.getElementById('numEarths').value) || 0;
    leftColumnY = yPosition;
    rightColumnY = yPosition;
    let earthTestColumn = 'left';
    
    if (numEarths > 0) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Individual Earth Readings:', 105, yPosition, { align: 'center' });
        yPosition += 15;
        leftColumnY = yPosition;
        rightColumnY = yPosition;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        
        earthResistances.forEach((resistance, index) => {
            const currentX = earthTestColumn === 'left' ? leftColumnX : rightColumnX;
            let currentY = earthTestColumn === 'left' ? leftColumnY : rightColumnY;
            
            // Check if we need a new page
            if (currentY > pageBottom - 20) {
                pdf.addPage();
                yPosition = addPageHeader(pdf, 'EARTH RESISTANCE TESTING (CONTINUED)');
                addFooterToPage(pdf, footer);
                leftColumnY = yPosition;
                rightColumnY = yPosition;
                earthTestColumn = 'left';
                currentY = yPosition;
            }
            
            pdf.text('Earth ' + (index + 1) + ': ' + resistance.toFixed(2) + ' Ohm', currentX, currentY);
            currentY += 8;
            
            // Update column positions
            if (earthTestColumn === 'left') {
                leftColumnY = currentY;
                earthTestColumn = 'right';
            } else {
                rightColumnY = currentY;
                earthTestColumn = 'left';
            }
        });
        
        // Overall resistance calculation
        if (earthResistances.some(r => r > 0)) {
            const validResistances = earthResistances.filter(r => r > 0);
            const reciprocalSum = validResistances.reduce((sum, r) => sum + (1/r), 0);
            const overallResistance = 1 / reciprocalSum;
            
            const maxY = Math.max(leftColumnY, rightColumnY);
            yPosition = maxY + 15;
            
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('Overall System Resistance: ' + overallResistance.toFixed(3) + ' Ohm', 105, yPosition, { align: 'center' });
            yPosition += 10;
            
            pdf.setFont(undefined, 'normal');
            if (overallResistance <= 10) {
                pdf.setTextColor(34, 139, 34);
                pdf.text('Overall Below 10Ohms', 105, yPosition, { align: 'center' });
            } else {
                pdf.setTextColor(220, 20, 60);
                pdf.text('Overall Exceeds 10Ohms - Reduction Required', 105, yPosition, { align: 'center' });
            }
            pdf.setTextColor(0, 0, 0);
        }
        
        // Add final comments if present
        if (finalComments) {
            yPosition += 20;
            if (yPosition > pageBottom - 50) {
                pdf.addPage();
                yPosition = addPageHeader(pdf, 'EARTH RESISTANCE TESTING (CONTINUED)');
                addFooterToPage(pdf, footer);
            }
            
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('FINAL SUMMARY & RECOMMENDATIONS:', 105, yPosition, { align: 'center' });
            yPosition += 10;
            
            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(10);
            const finalLines = pdf.splitTextToSize(finalComments, 170);
            pdf.text(finalLines, leftColumnX, yPosition);
        }
    } else {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.text('No earth resistance testing performed.', 105, yPosition, { align: 'center' });
    }
    
    // ==================== EARTH TEST IMAGES SECTION ====================
    if (uploadedImages['earthImagesPreview_data']) {
        yPosition = startNewSection(pdf, 'EARTH TEST IMAGES', footer);
        
        const images = Array.isArray(uploadedImages['earthImagesPreview_data']) ? 
            uploadedImages['earthImagesPreview_data'] : [uploadedImages['earthImagesPreview_data']];
        
        let imagesOnCurrentPage = 0;
        let isFirstImagePage = true;
        const imageWidth = 80;
        const imageHeight = 60;
        const imagesPerRow = 2;
        const maxImagesFirstImagePage = 4;
        const maxImagesSubsequentImagePage = 6;
        
        images.forEach((imageData, index) => {
            if (imageData) {
                const maxImagesThisPage = isFirstImagePage ? maxImagesFirstImagePage : maxImagesSubsequentImagePage;
                
                // Check if we need a new page
                if (imagesOnCurrentPage >= maxImagesThisPage) {
                    pdf.addPage();
                    yPosition = addPageHeader(pdf, 'EARTH TEST IMAGES (CONTINUED)');
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
    
    // Generate filename
    const date = new Date().toISOString().split('T')[0];
    const filename = 'Lightning_Protection_Report_' + date + '.pdf';
    
    // Save the PDF
    pdf.save(filename);
}

