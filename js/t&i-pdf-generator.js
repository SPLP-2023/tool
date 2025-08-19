// =============================================================================
// T&I PDF GENERATOR - COMPLETE STANDALONE FILE
// Create as: js/t&i-pdf-generator.js
// Replaces: pdf-generator.js + pdf-generator-shared.js for T&I reports only
// =============================================================================

// Company logo URLs
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
    addImageToPDF(pdf, uploadedImages[HEADER_IMAGE_URL.replace('./', '') + '_data'] || '', 160, 8, 40, 20, true);
    
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text(title, 105, 30, { align: 'center' });
    
    return 40; // Return Y position after header
}

function addFooterToPage(pdf, footer) {
    addImageToPDF(pdf, uploadedImages[FOOTER_IMAGE_URL.replace('./', '') + '_data'] || '', 50, 265, 90, 30, true);
    
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

// Main PDF generation function for T&I reports
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    // Get form data
    const siteAddress = document.getElementById('siteAddress')?.value || '';
    const testDate = document.getElementById('testDate')?.value || '';
    const engineerName = document.getElementById('engineerName')?.value || '';
    const testKitRef = document.getElementById('testKitRef')?.value || '';
    const generalComments = document.getElementById('generalComments')?.value || '';
    const finalComments = document.getElementById('finalComments')?.value || '';
    const structureHeight = document.getElementById('structureHeight')?.value || '';
    const structurePerimeter = document.getElementById('structurePerimeter')?.value || '';
    const earthPits = document.getElementById('earthPits')?.value || '';
    const mainEquipotentialBond = document.getElementById('mainEquipotentialBond')?.value || '';
    const surgeInstalled = document.getElementById('surgeInstalled')?.value || '';
    const surgeType = document.getElementById('surgeType')?.value || '';
    const surgeSafe = document.getElementById('surgeSafe')?.value || '';
    const standard = document.getElementById('standard')?.value || '';
    
    const footer = "Strike Point Lightning Protection Ltd Registered office: Atkinson Evans, 10 Arnot Hill Road, Nottingham NG5 6LJ. Company No. 15114852, Registered in England and Wales. @: info@strikepoint.uk Tel: 01159903220";
    
    let yPosition = 20;
    const leftColumnX = 20;
    const rightColumnX = 110;
    const columnWidth = 80;
    const pageBottom = 250;
    
    // ==================== COVER PAGE ====================
    // Company logo at top
    if (uploadedImages[COMPANY_LOGO_URL.replace('./', '') + '_data']) {
        const logoHeight = addImageToPDF(pdf, uploadedImages[COMPANY_LOGO_URL.replace('./', '') + '_data'], 30, 20, 150, 60, true);
        yPosition = 20 + logoHeight + 10;
    }
    
    // Report title
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('Lightning Protection Test & Inspection Report', 105, yPosition, { align: 'center' });
    yPosition += 30;
    
    // Building image if provided
    if (uploadedImages['buildingImagePreview_data']) {
        const imageHeight = addImageToPDF(pdf, uploadedImages['buildingImagePreview_data'], 30, yPosition, 150, 100, true);
        yPosition += imageHeight + 20;
    }
    
    // Site details
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('Site Address:', 105, yPosition, { align: 'center' });
    yPosition += 10;
    
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    if (siteAddress) {
        const addressLines = pdf.splitTextToSize(siteAddress, 140);
        pdf.text(addressLines, 105, yPosition, { align: 'center' });
        yPosition += addressLines.length * 6 + 10;
    }
    
    // Footer details
    yPosition = 220;
    pdf.setFont(undefined, 'bold');
    pdf.text('Report Date: ', 20, yPosition);
    pdf.setFont(undefined, 'normal');
    pdf.text(formatDate(testDate), 60, yPosition);
    
    pdf.setFont(undefined, 'bold');
    pdf.text('Engineer: ', 20, yPosition + 10);
    pdf.setFont(undefined, 'normal');
    pdf.text(engineerName, 60, yPosition + 10);
    
    pdf.setFont(undefined, 'bold');
    pdf.text('Test Kit Ref: ', 20, yPosition + 20);
    pdf.setFont(undefined, 'normal');
    pdf.text(testKitRef, 60, yPosition + 20);
    
    pdf.setFont(undefined, 'bold');
    pdf.text('Standard: ', 20, yPosition + 30);
    pdf.setFont(undefined, 'normal');
    pdf.text(standard, 60, yPosition + 30);
    
    // ==================== PAGE 2: GENERAL INFORMATION ====================
    yPosition = startNewSection(pdf, 'GENERAL INFORMATION', footer);
    
    let leftColumnY = yPosition;
    let rightColumnY = yPosition;
    
    // Left column - Site and test information
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('SITE DETAILS', leftColumnX, leftColumnY);
    leftColumnY += 12;
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    
    if (siteAddress) {
        const addressLines = pdf.splitTextToSize(siteAddress, columnWidth);
        pdf.text(addressLines, leftColumnX, leftColumnY);
        leftColumnY += addressLines.length * 5 + 10;
    }
    
    const testInfo = [
        ['Test Date:', formatDate(testDate)],
        ['Engineer:', engineerName],
        ['Test Kit Ref:', testKitRef],
        ['Standard:', standard]
    ];
    
    testInfo.forEach(([label, value]) => {
        if (value) {
            pdf.setFont(undefined, 'bold');
            pdf.text(label, leftColumnX, leftColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(value, leftColumnX, leftColumnY + 5);
            leftColumnY += 12;
        }
    });
    
    // Right column - Structure and system details
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('STRUCTURE DETAILS', rightColumnX, rightColumnY);
    rightColumnY += 12;
    
    pdf.setFontSize(10);
    
    if (structureHeight) {
        pdf.setFont(undefined, 'bold');
        pdf.text('Structure Height:', rightColumnX, rightColumnY);
        pdf.setFont(undefined, 'normal');
        pdf.text(structureHeight + ' m', rightColumnX, rightColumnY + 5);
        rightColumnY += 12;
    }
    
    if (structurePerimeter) {
        pdf.setFont(undefined, 'bold');
        pdf.text('Structure Perimeter:', rightColumnX, rightColumnY);
        pdf.setFont(undefined, 'normal');
        pdf.text(structurePerimeter + ' m', rightColumnX, rightColumnY + 5);
        rightColumnY += 12;
    }
    
    rightColumnY += 10;
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('SYSTEM DETAILS', rightColumnX, rightColumnY);
    rightColumnY += 12;
    
    pdf.setFontSize(10);
    
    const systemInfo = [
        ['Earth Pits:', earthPits],
        ['Main Bond:', mainEquipotentialBond],
        ['Surge Protection:', surgeInstalled]
    ];
    
    systemInfo.forEach(([label, value]) => {
        if (value) {
            pdf.setFont(undefined, 'bold');
            pdf.text(label, rightColumnX, rightColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(value, rightColumnX, rightColumnY + 5);
            rightColumnY += 12;
        }
    });
    
    // Surge Protection details
    if (surgeInstalled === 'Yes') {
        if (surgeType) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Surge Type:', rightColumnX, rightColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(surgeType, rightColumnX, rightColumnY + 5);
            rightColumnY += 12;
        }
        
        if (surgeSafe) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Surge Status:', rightColumnX, rightColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(surgeSafe, rightColumnX, rightColumnY + 5);
            rightColumnY += 12;
        }
    }
    
    // General comments
    const maxY = Math.max(leftColumnY, rightColumnY);
    yPosition = maxY + 20;
    
    if (generalComments) {
        if (yPosition > pageBottom - 40) {
            pdf.addPage();
            yPosition = addPageHeader(pdf, 'GENERAL INFORMATION (CONTINUED)');
            addFooterToPage(pdf, footer);
        }
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('General Comments:', leftColumnX, yPosition);
        yPosition += 10;
        
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        const commentLines = pdf.splitTextToSize(generalComments, 170);
        pdf.text(commentLines, leftColumnX, yPosition);
        yPosition += commentLines.length * 5;
    }
    
    // ==================== STRUCTURE AND SYSTEM DETAILS SECTION ====================
    if (window.systemDetails && Object.keys(window.systemDetails).length > 0) {
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
        
        // Structure questions
        const structureQuestions = [
            { key: 'groundType', label: 'Ground Type' },
            { key: 'wallType', label: 'Structure Wall Type' },
            { key: 'roofType', label: 'Roof Type' },
            { key: 'roofStructure', label: 'Roof Structure' }
        ];
        
        structureQuestions.forEach(question => {
            if (window.systemDetails[question.key] && window.systemDetails[question.key].length > 0) {
                pdf.setFont(undefined, 'bold');
                pdf.text(question.label + ':', leftColumnX, leftColumnY);
                leftColumnY += 5;
                pdf.setFont(undefined, 'normal');
                
                const answers = window.systemDetails[question.key].join(', ');
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
            { key: 'downConductor', label: 'Down-Conductor Type' },
            { key: 'earthTermination', label: 'Earth-Termination Type' },
            { key: 'equipotentialBonding', label: 'Equipotential Bonding' }
        ];
        
        systemQuestions.forEach(question => {
            if (window.systemDetails[question.key] && window.systemDetails[question.key].length > 0) {
                pdf.setFont(undefined, 'bold');
                pdf.text(question.label + ':', rightColumnX, rightColumnY);
                rightColumnY += 5;
                pdf.setFont(undefined, 'normal');
                
                const answers = window.systemDetails[question.key].join(', ');
                const answerLines = pdf.splitTextToSize(answers, columnWidth);
                pdf.text(answerLines, rightColumnX, rightColumnY);
                rightColumnY += answerLines.length * 4 + 8;
            }
        });
    }
    
    // ==================== INSPECTION SUMMARY SECTION ====================
    yPosition = startNewSection(pdf, 'INSPECTION SUMMARY', footer);
    
    leftColumnY = yPosition;
    rightColumnY = yPosition;
    let failureColumn = 'left';
    
    if (window.selectedFailuresList && window.selectedFailuresList.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('IDENTIFIED ISSUES & FAILURES:', 105, yPosition, { align: 'center' });
        leftColumnY += 15;
        rightColumnY += 15;
        
        window.selectedFailuresList.forEach((failure, index) => {
            const currentX = failureColumn === 'left' ? leftColumnX : rightColumnX;
            let currentY = failureColumn === 'left' ? leftColumnY : rightColumnY;
            
            // Check if we need a new page
            if (currentY > pageBottom - 50) {
                pdf.addPage();
                yPosition = addPageHeader(pdf, 'INSPECTION SUMMARY (CONTINUED)');
                addFooterToPage(pdf, footer);
                leftColumnY = yPosition;
                rightColumnY = yPosition;
                failureColumn = 'left';
                currentY = yPosition;
            }
            
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(220, 20, 60);
            pdf.text(`${index + 1}. ${failure.name}`, currentX, currentY);
            pdf.setTextColor(0, 0, 0);
            currentY += 8;
            
            if (failure.comment) {
                pdf.setFont(undefined, 'normal');
                pdf.setFontSize(9);
                const commentLines = pdf.splitTextToSize('Comment: ' + failure.comment, columnWidth);
                pdf.text(commentLines, currentX, currentY);
                currentY += commentLines.length * 4 + 5;
            }
            
            if (failure.imageData) {
                pdf.setFont(undefined, 'italic');
                pdf.setFontSize(8);
                pdf.text('Image:', currentX, currentY);
                currentY += 5;
                const imageHeight = addImageToPDF(pdf, failure.imageData, currentX, currentY, 60, 45);
                currentY += imageHeight;
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
    
    // ==================== ENHANCED EARTH RESISTANCE TESTING SECTION ====================
    yPosition = startNewSection(pdf, 'EARTH RESISTANCE TESTING', footer);
    
    const earthData = getEarthTableData();
    leftColumnY = yPosition;
    rightColumnY = yPosition;
    let earthTestColumn = 'left';
    
    if (earthData.numEarths > 0 && earthData.earthData.length > 0) {
        // Display overall resistance prominently at the top
        if (earthData.overallResistance > 0) {
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('Overall System Resistance: ' + earthData.overallResistance.toFixed(3) + ' Ω', 105, yPosition, { align: 'center' });
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
        yPosition = renderEarthResistanceTable(pdf, earthData, yPosition, footer);
        
    } else {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.text('No earth resistance testing performed.', 105, yPosition, { align: 'center' });
        yPosition += 20;
    }
    
    // ==================== EARTH TEST IMAGES SECTION ====================
    if (window.uploadedImages && window.uploadedImages['earthImagesPreview_data']) {
        yPosition = startNewSection(pdf, 'EARTH TEST IMAGES', footer);
        
        const images = Array.isArray(window.uploadedImages['earthImagesPreview_data']) ? 
            window.uploadedImages['earthImagesPreview_data'] : [window.uploadedImages['earthImagesPreview_data']];
        
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
                
                if (imagesOnCurrentPage >= maxImagesThisPage) {
                    pdf.addPage();
                    yPosition = addPageHeader(pdf, 'EARTH TEST IMAGES (CONTINUED)');
                    addFooterToPage(pdf, footer);
                    imagesOnCurrentPage = 0;
                    isFirstImagePage = false;
                }
                
                const col = imagesOnCurrentPage % imagesPerRow;
                const row = Math.floor(imagesOnCurrentPage / imagesPerRow);
                const x = leftColumnX + (col * (imageWidth + 10));
                const y = yPosition + (row * (imageHeight + 15));
                
                addImageToPDF(pdf, imageData, x, y, imageWidth, imageHeight, false);
                
                imagesOnCurrentPage++;
                
                if (col === imagesPerRow - 1) {
                    yPosition += imageHeight + 15;
                }
            }
        });
    }
    
    // ==================== FINAL COMMENTS SECTION ====================
    if (finalComments) {
        if (yPosition > pageBottom - 50) {
            yPosition = startNewSection(pdf, 'FINAL SUMMARY & RECOMMENDATIONS', footer);
        } else {
            yPosition += 20;
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.text('FINAL SUMMARY & RECOMMENDATIONS', 105, yPosition, { align: 'center' });
            yPosition += 15;
        }
        
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        const finalLines = pdf.splitTextToSize(finalComments, 170);
        pdf.text(finalLines, leftColumnX, yPosition);
    }
    
    // Generate and save PDF
    const filename = generateFilename('Lightning_Protection_TI_Report');
    pdf.save(filename);
}

// ==================== ENHANCED EARTH RESISTANCE TABLE FUNCTION ====================
function renderEarthResistanceTable(pdf, earthData, yPosition, footer) {
    const leftMargin = 20;
    const pageWidth = 170; // Adjusted for existing margins
    const rowHeight = 10;
    const headerHeight = 12;
    const pageBottom = 250;
    
    // Column widths optimized for page layout
    const columnWidths = [15, 18, 22, 18, 22, 22, 22, 31]; // Total: 170
    
    // Column headers
    const headers = ['E', 'Ω', 'Test Clamp', 'Pit', 'Test Type', 'Ground Type', 'Earth Type', 'Comment'];
    
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
        pdf.text(`Summary: ${validEarths.length} earth electrodes tested from ${earthData.numEarths} total readings`, 20, yPosition);
        yPosition += 15;
    }
    
    return yPosition;
}

// ==================== UTILITY FUNCTIONS ====================

// Enhanced function to get earth table data
function getEarthTableData() {
    // Check if the enhanced earth table data exists
    if (typeof window.earthTableData !== 'undefined' && window.earthTableData) {
        return {
            numEarths: window.earthTableData.length,
            earthData: window.earthTableData,
            overallResistance: typeof calculateOverallResistanceValue === 'function' ? 
                calculateOverallResistanceValue() : 0
        };
    }
    
    // Fallback to old system if enhanced table not available
    const numEarths = parseInt(document.getElementById('numEarths')?.value) || 0;
    if (numEarths > 0 && typeof window.earthResistances !== 'undefined') {
        const validResistances = window.earthResistances.filter(r => r > 0);
        let overallResistance = 0;
        if (validResistances.length > 0) {
            const reciprocalSum = validResistances.reduce((sum, r) => sum + (1/r), 0);
            overallResistance = 1 / reciprocalSum;
        }
        
        // Convert old format to new format
        const earthData = window.earthResistances.map((resistance, index) => ({
            earthNumber: index + 1,
            resistance: resistance,
            testClamp: '',
            pitType: '',
            testType: '',
            groundType: '',
            earthType: '',
            comment: ''
        }));
        
        return {
            numEarths: numEarths,
            earthData: earthData,
            overallResistance: overallResistance
        };
    }
    
    // No earth data available
    return {
        numEarths: 0,
        earthData: [],
        overallResistance: 0
    };
}

// Format date function
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Generate filename with date
function generateFilename(reportType) {
    const date = new Date().toISOString().split('T')[0];
    return `${reportType}_${date}.pdf`;
}
