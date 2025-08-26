// =============================================================================
// T&I PDF GENERATOR - COMPLETE STANDALONE FILE
// Create as: js/t&i-pdf-generator.js
// Replaces: pdf-generator.js + pdf-generator-shared.js for T&I reports only
// =============================================================================

// Company logo URL (hosted on GitHub)
const COMPANY_LOGO_URL = "./assets/Color logo - no background (px reduction).png";
const FOOTER_IMAGE_URL = "./assets/es12.png";
const HEADER_IMAGE_URL = "./assets/SP Bolt 400x400.png";

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
    addImageToPDF(pdf, HEADER_IMAGE_URL, 160, 8, 60, 25, true);
    
    // Add section title spanning full width
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text(title, 105, 30, { align: 'center' });
    
    return 40; // Return Y position after header
}

function addFooterToPage(pdf, footer) {
    // Add footer image - larger, centered, above text
    addImageToPDF(pdf, FOOTER_IMAGE_URL, 60, 260, 90, 30, true);
    
    // Add footer text below the image
    pdf.setFontSize(8);
    const footerLines = pdf.splitTextToSize(footer, 190);
    pdf.text(footerLines, 105, 285, { align: 'center' });
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
    // Get new fields
    const jobReference = document.getElementById('jobReference')?.value || '';
    const siteStaffName = document.getElementById('siteStaffName')?.value || '';
    const siteStaffSignature = window.siteStaffSignature?.signatureData || null;

    // Company logo centered at top
    const logoHeight = addImageToPDF(pdf, COMPANY_LOGO_URL, 30, 20, 150, 60, true);
    yPosition = 20 + logoHeight + 10;

    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('Lightning Protection System Report', 105, yPosition, { align: 'center' });
    yPosition += 25;

    // Building image - properly centered
    if (uploadedImages['buildingImagePreview_data']) {
        const imageHeight = addImageToPDF(pdf, uploadedImages['buildingImagePreview_data'], 30, yPosition, 150, 80, true);
        yPosition += imageHeight + 10;
    }

    // Job Reference (if building name/reference exists)
    if (jobReference) {
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text(jobReference, 105, yPosition, { align: 'center' });
        yPosition += 10;
    }

    // Site Address
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    if (siteAddress) {
        const addressLines = pdf.splitTextToSize('Site Address: ' + siteAddress, 150);
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
pdf.text('Engineer Name:', leftX, leftY);
pdf.setFont(undefined, 'normal');
pdf.text(engineerName || 'N/A', leftX, leftY + valueGap);

leftY += sectionGap;
pdf.setFont(undefined, 'bold');
pdf.text('Test Kit Ref:', leftX, leftY);
pdf.setFont(undefined, 'normal');
pdf.text(testKitRef || 'N/A', leftX, leftY + valueGap);

leftY += sectionGap;
pdf.setFont(undefined, 'bold');
pdf.text('Date:', leftX, leftY);
pdf.setFont(undefined, 'normal');
pdf.text(testDate || 'N/A', leftX, leftY + valueGap);

// RIGHT COLUMN
let rightY = detailsY;
pdf.setFont(undefined, 'bold');
pdf.text('Site Staff Name:', rightX, rightY);
pdf.setFont(undefined, 'normal');
pdf.text(siteStaffName || 'N/A', rightX, rightY + valueGap);

rightY += sectionGap;
pdf.setFont(undefined, 'bold');
pdf.text('Site Staff Signature:', rightX, rightY);
if (siteStaffSignature) {
    pdf.addImage(siteStaffSignature, 'PNG', rightX, rightY + valueGap, 60, 20);
} else {
    pdf.setFont(undefined, 'italic');
    pdf.text('Not signed', rightX, rightY + valueGap + 1);
}
    
    // ==================== INSPECTION SUMMARY SECTION ====================
    yPosition = startNewSection(pdf, 'INSPECTION SUMMARY', footer);

    // Get recommendations early (needed for PASS/FAIL header)
    const recommendations = typeof getRecommendationsForPDF === 'function'
  ? getRecommendationsForPDF()
  : [];
    const hasRecommendations = Array.isArray(recommendations) && recommendations.length > 0;
    
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
        
        // Add "with recommendations" if applicable
        if (hasRecommendations) {
            yPosition += 8;
            pdf.setFontSize(11);
            pdf.setFont(undefined, 'italic');
            pdf.text('with recommendations', 105, yPosition, { align: 'center' });
        }
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

    // If we have recommendations, add them after failures
    if (hasRecommendations) {
        // Ensure proper spacing after failures
        if (selectedFailuresList.length > 0) {
            // Move to next available column or page
            if (failureColumn === 'left') {
                failureColumn = 'right';
            } else {
                // Check if we need a new page for recommendations
                const spaceNeeded = 30 + (recommendations[0] ? 40 : 0);
                if (Math.max(leftColumnY, rightColumnY) + spaceNeeded > pageBottom) {
                    pdf.addPage();
                    yPosition = addPageHeader(pdf, 'INSPECTION SUMMARY (CONTINUED)');
                    addFooterToPage(pdf, footer);
                    leftColumnY = yPosition;
                    rightColumnY = yPosition;
                    failureColumn = 'left';
                }
            }
        }
    
        // Add recommendations header
        let recommendationY = failureColumn === 'left' ? leftColumnY : rightColumnY;
        const recommendationX = failureColumn === 'left' ? leftColumnX : rightColumnX;
    
        // Add spacing before recommendations
        recommendationY += 15;
    
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(0, 100, 200); // Blue color for recommendations
        pdf.text('RECOMMENDATIONS', recommendationX, recommendationY);
        pdf.setTextColor(0, 0, 0);
        recommendationY += 8;
    
        // Add each recommendation
        recommendations.forEach((rec, index) => {
            // Check space for this recommendation
            const recLines = pdf.splitTextToSize(rec.text, columnWidth);
            const estimatedHeight = 15 + (recLines.length * 4);
            
            // Check if we need to switch columns or pages
            if (recommendationY + estimatedHeight > pageBottom) {
                if (failureColumn === 'left') {
                    // Switch to right column
                    failureColumn = 'right';
                    recommendationY = rightColumnY + 15;
                } else {
                    // Need new page
                    pdf.addPage();
                    yPosition = addPageHeader(pdf, 'INSPECTION SUMMARY (CONTINUED)');
                    addFooterToPage(pdf, footer);
                    leftColumnY = yPosition;
                    rightColumnY = yPosition;
                    failureColumn = 'left';
                    recommendationY = yPosition;
                }
            }
            
            const currentX = failureColumn === 'left' ? leftColumnX : rightColumnX;
            
            // Add recommendation number and text
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'bold');
            pdf.text(`Recommendation ${rec.number}:`, currentX, recommendationY);
            recommendationY += 5;
            
            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(9);
            pdf.text(recLines, currentX, recommendationY);
            recommendationY += (recLines.length * 4) + 8;
            
            // Update column Y position
            if (failureColumn === 'left') {
                leftColumnY = recommendationY;
            } else {
                rightColumnY = recommendationY;
            }
            
            // Switch columns for next recommendation if space allows
            if (failureColumn === 'left' && rightColumnY + 30 < pageBottom) {
                failureColumn = 'right';
                recommendationY = rightColumnY;
            } else if (failureColumn === 'right' && index < recommendations.length - 1) {
                failureColumn = 'left';
                recommendationY = leftColumnY;
            }
        });
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

const earthData = getEarthTableData();
leftColumnY = yPosition;
rightColumnY = yPosition;
let earthTestColumn = 'left';

if (earthData && earthData.earthData && earthData.earthData.length > 0) {
    // Display overall resistance prominently at the top (like your original)
    if (earthData.overallResistance > 0) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Overall System Resistance: ' + earthData.overallResistance.toFixed(3) + ' Ohms', 105, yPosition, { align: 'center' });
        yPosition += 10;
        
        pdf.setFont(undefined, 'normal');
        if (earthData.overallResistance <= 10) {
            pdf.setTextColor(34, 139, 34);
            pdf.text('Overall Below 10Ohms', 105, yPosition, { align: 'center' });
        } else {
            pdf.setTextColor(220, 20, 60);
            pdf.text('Overall Exceeds 10Ohms - Reduction Required', 105, yPosition, { align: 'center' });
        }
        pdf.setTextColor(0, 0, 0);
        yPosition += 20;
    }
    
    // Enhanced Earth Resistance Table
    yPosition = renderEarthResistanceTable(pdf, earthData, yPosition, footer, pageBottom);
    
} else {
    // Fallback to old system if new table data not available
    const numEarths = parseInt(document.getElementById('numEarths').value) || 0;
    
    if (numEarths > 0 && typeof earthResistances !== 'undefined') {
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
            pdf.text('Overall System Resistance: ' + overallResistance.toFixed(3) + ' Ohms', 105, yPosition, { align: 'center' });
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
    } else {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.text('No earth resistance testing performed.', 105, yPosition, { align: 'center' });
    }
}

// ADD THIS NEW FUNCTION at the top of your pdf-generator.js file (after the existing functions)
function renderEarthResistanceTable(pdf, earthData, yPosition, footer, pageBottom) {
    const leftMargin = 20;
    const pageWidth = 170; // Matches your existing layout
    const rowHeight = 10;
    const headerHeight = 12;
    
    // Column widths optimized for your page layout
    const columnWidths = [15, 18, 22, 18, 22, 22, 22, 31]; // Total: 170
    
    // Column headers
    const headers = ['E', 'Ohms', 'Test Clamp', 'Pit', 'Test Type', 'Ground Type', 'Earth Type', 'Comment'];
    
    // Check if we need to start the table on a new page
    if (yPosition + headerHeight + (earthData.earthData.length * rowHeight) > pageBottom - 30) {
        pdf.addPage();
        yPosition = addPageHeader(pdf, 'EARTH RESISTANCE TESTING (CONTINUED)');
        addFooterToPage(pdf, footer);
    }
    
    // Draw table header
    let currentX = leftMargin;
    
    // Header background
    pdf.setFillColor(240, 240, 240); // Light gray header
    pdf.rect(leftMargin, yPosition - 2, pageWidth, headerHeight, 'F');
    
    // Header text
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'bold');
    
    headers.forEach((header, index) => {
        const colWidth = columnWidths[index];
        pdf.text(header, currentX + (colWidth / 2), yPosition + 7, { align: 'center' });
        currentX += colWidth;
    });
    
    yPosition += headerHeight;
    pdf.setFont(undefined, 'normal');
    
    // Draw table rows
    earthData.earthData.forEach((earth, index) => {
        // Check if we need a new page
        if (yPosition + rowHeight > pageBottom - 30) {
            pdf.addPage();
            yPosition = addPageHeader(pdf, 'EARTH RESISTANCE TESTING (CONTINUED)');
            addFooterToPage(pdf, footer);
            
            // Redraw headers on new page
            currentX = leftMargin;
            pdf.setFillColor(240, 240, 240);
            pdf.rect(leftMargin, yPosition - 2, pageWidth, headerHeight, 'F');
            pdf.setFont(undefined, 'bold');
            
            headers.forEach((header, headerIndex) => {
                const colWidth = columnWidths[headerIndex];
                pdf.text(header, currentX + (colWidth / 2), yPosition + 7, { align: 'center' });
                currentX += colWidth;
            });
            
            yPosition += headerHeight;
            pdf.setFont(undefined, 'normal');
        }
        
        // Alternate row colors
        if (index % 2 === 0) {
            pdf.setFillColor(250, 250, 250); // Very light gray
            pdf.rect(leftMargin, yPosition - 1, pageWidth, rowHeight, 'F');
        }
        
        // Draw row data
        currentX = leftMargin;
        const rowData = [
            `E${earth.earthNumber}`,
            earth.resistance > 0 ? earth.resistance.toFixed(2) : '-',
            earth.testClamp || '-',
            earth.pitType || '-',
            earth.testType || '-',
            earth.groundType || '-',
            earth.earthType || '-',
            earth.comment || '-'
        ];
        
        pdf.setFontSize(8);
        rowData.forEach((data, dataIndex) => {
            const colWidth = columnWidths[dataIndex];
            
            // Truncate text if too long for column
            let displayText = data.toString();
            if (displayText.length > 10 && dataIndex > 1) {
                displayText = displayText.substring(0, 10) + '...';
            }
            
            pdf.text(displayText, currentX + (colWidth / 2), yPosition + 6, { align: 'center' });
            currentX += colWidth;
        });
        
        yPosition += rowHeight;
    });
    
    // Table border
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.3);
    pdf.rect(leftMargin, yPosition - (earthData.earthData.length * rowHeight) - headerHeight + 2, pageWidth, (earthData.earthData.length * rowHeight) + headerHeight);
    
    yPosition += 10;
    
    // Summary information
    const validEarths = earthData.earthData.filter(earth => earth.resistance > 0);
    if (validEarths.length > 0) {
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'italic');
        pdf.text(`Summary: ${validEarths.length} earth electrodes tested from ${earthData.earthData.length} total readings`, 20, yPosition);
        yPosition += 15;
    }
    
    return yPosition;
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
        const maxImagesFirstImagePage = 6;
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
    const filename = 'Lightning Protection Inspection Report - ' + jobReference + ' ' + date + '.pdf';
    
    // Save the PDF
    pdf.save(filename);
}
