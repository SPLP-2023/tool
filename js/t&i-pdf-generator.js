// =============================================================================
// T&I PDF GENERATOR - COMPLETE NEW FILE
// Create this as: js/t&i-pdf-generator.js
// =============================================================================

// Constants for consistent styling
const PAGE_BOTTOM = 250;
const HEADER_IMAGE_URL = 'images/header-logo.png';
const FOOTER_IMAGE_URL = 'images/footer-logo.png';
const COMPANY_LOGO_URL = 'images/company-logo.png';

// Main PDF generation function
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    // Get all form data
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
    
    // ==================== COVER PAGE ====================
    const coverOptions = {
        reportTitle: 'Lightning Protection Test & Inspection Report',
        siteAddress: siteAddress,
        date: formatDate(testDate),
        engineerName: engineerName,
        additionalFields: [
            { label: 'Test Kit Reference', value: testKitRef },
            { label: 'Standard Applied', value: standard }
        ]
    };
    
    createCoverPage(pdf, coverOptions);
    
    // ==================== PAGE 2: GENERAL INFORMATION ====================
    yPosition = startNewSection(pdf, 'GENERAL INFORMATION', footer);
    
    const leftColumnX = 20;
    const rightColumnX = 110;
    let leftColumnY = yPosition;
    let rightColumnY = yPosition;
    
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    
    // Left column
    pdf.text('Site Details:', leftColumnX, leftColumnY);
    leftColumnY += 8;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    
    if (siteAddress) {
        const addressLines = pdf.splitTextToSize(siteAddress, 80);
        pdf.text(addressLines, leftColumnX, leftColumnY);
        leftColumnY += addressLines.length * 5;
    }
    
    leftColumnY += 10;
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(12);
    pdf.text('Test Information:', leftColumnX, leftColumnY);
    leftColumnY += 8;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    
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
            pdf.text(value, leftColumnX + 30, leftColumnY);
            leftColumnY += 6;
        }
    });
    
    // Right column - Structure details
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Structure Details:', rightColumnX, rightColumnY);
    rightColumnY += 8;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    
    const structureInfo = [
        ['Height:', structureHeight ? structureHeight + 'm' : ''],
        ['Perimeter:', structurePerimeter ? structurePerimeter + 'm' : '']
    ];
    
    structureInfo.forEach(([label, value]) => {
        if (value) {
            pdf.setFont(undefined, 'bold');
            pdf.text(label, rightColumnX, rightColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(value, rightColumnX + 30, rightColumnY);
            rightColumnY += 6;
        }
    });
    
    rightColumnY += 10;
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('System Details:', rightColumnX, rightColumnY);
    rightColumnY += 8;
    pdf.setFont(undefined, 'normal');
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
            pdf.text(value, rightColumnX + 30, rightColumnY);
            rightColumnY += 6;
        }
    });
    
    // Surge Protection details
    if (surgeInstalled === 'Yes') {
        if (surgeType) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Surge Type:', rightColumnX, rightColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(surgeType, rightColumnX + 30, rightColumnY);
            rightColumnY += 6;
        }
        
        if (surgeSafe) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Surge Status:', rightColumnX, rightColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(surgeSafe, rightColumnX + 30, rightColumnY);
            rightColumnY += 6;
        }
    }
    
    // General comments
    const maxY = Math.max(leftColumnY, rightColumnY);
    yPosition = maxY + 20;
    
    if (generalComments) {
        if (yPosition > PAGE_BOTTOM - 40) {
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
    
    // ==================== SYSTEM DETAILS SECTION ====================
    if (window.systemDetails && Object.keys(window.systemDetails).length > 0) {
        yPosition = startNewSection(pdf, 'SYSTEM DETAILS', footer);
        
        Object.keys(window.systemDetails).forEach(category => {
            if (window.systemDetails[category] && window.systemDetails[category].length > 0) {
                if (yPosition > PAGE_BOTTOM - 30) {
                    pdf.addPage();
                    yPosition = addPageHeader(pdf, 'SYSTEM DETAILS (CONTINUED)');
                    addFooterToPage(pdf, footer);
                }
                
                pdf.setFontSize(12);
                pdf.setFont(undefined, 'bold');
                pdf.text(category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) + ':', leftColumnX, yPosition);
                yPosition += 8;
                
                pdf.setFontSize(10);
                pdf.setFont(undefined, 'normal');
                window.systemDetails[category].forEach(item => {
                    pdf.text('• ' + item, leftColumnX + 5, yPosition);
                    yPosition += 6;
                });
                yPosition += 5;
            }
        });
    }
    
    // ==================== FAILURES SECTION ====================
    if (window.selectedFailuresList && window.selectedFailuresList.length > 0) {
        yPosition = startNewSection(pdf, 'IDENTIFIED ISSUES & FAILURES', footer);
        
        window.selectedFailuresList.forEach((failure, index) => {
            if (yPosition > PAGE_BOTTOM - 40) {
                pdf.addPage();
                yPosition = addPageHeader(pdf, 'IDENTIFIED ISSUES & FAILURES (CONTINUED)');
                addFooterToPage(pdf, footer);
            }
            
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(220, 20, 60);
            pdf.text(`${index + 1}. ${failure.name}`, leftColumnX, yPosition);
            pdf.setTextColor(0, 0, 0);
            yPosition += 8;
            
            if (failure.comment) {
                pdf.setFontSize(10);
                pdf.setFont(undefined, 'normal');
                const commentLines = pdf.splitTextToSize('Comment: ' + failure.comment, 170);
                pdf.text(commentLines, leftColumnX + 5, yPosition);
                yPosition += commentLines.length * 5;
            }
            
            if (failure.imageData) {
                yPosition += 5;
                const imageHeight = addImageToPDF(pdf, failure.imageData, leftColumnX, yPosition, 80, 60, false);
                yPosition += imageHeight;
            }
            
            yPosition += 10;
        });
    }
    
    // ==================== ENHANCED EARTH RESISTANCE TESTING SECTION ====================
    yPosition = generateEarthResistanceSection(pdf, yPosition, footer);
    
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
        if (yPosition > PAGE_BOTTOM - 50) {
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

// ==================== ENHANCED EARTH RESISTANCE TESTING SECTION ====================
function generateEarthResistanceSection(pdf, yPosition, footer) {
    yPosition = startNewSection(pdf, 'EARTH RESISTANCE TESTING', footer);
    
    const earthData = getEarthTableData();
    
    if (earthData.numEarths > 0 && earthData.earthData.length > 0) {
        // Display overall resistance prominently at the top
        if (earthData.overallResistance > 0) {
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.text('Overall System Resistance:', 105, yPosition, { align: 'center' });
            yPosition += 12;
            
            // Overall resistance value with color coding
            pdf.setFontSize(20);
            if (earthData.overallResistance <= 10) {
                pdf.setTextColor(34, 139, 34); // Green
            } else {
                pdf.setTextColor(220, 20, 60); // Red
            }
            pdf.text(`${earthData.overallResistance.toFixed(3)} Ω`, 105, yPosition, { align: 'center' });
            pdf.setTextColor(0, 0, 0); // Reset to black
            yPosition += 20;
        }
        
        // Earth resistance table
        yPosition = renderEarthResistanceTable(pdf, earthData, yPosition, footer);
        
    } else {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        pdf.text('No earth resistance testing performed.', 105, yPosition, { align: 'center' });
        yPosition += 20;
    }
    
    return yPosition;
}

// Render the professional earth resistance table
function renderEarthResistanceTable(pdf, earthData, yPosition, footer) {
    const leftMargin = 15;
    const pageWidth = 180; // Page width minus margins
    const rowHeight = 12;
    const headerHeight = 15;
    
    // Column widths (adjusted to fit page width)
    const columnWidths = [15, 20, 25, 20, 25, 25, 25, 25]; // Total: 180
    
    // Column headers
    const headers = ['E', 'Ω', 'Test Clamp', 'Pit', 'Test Type', 'Ground Type', 'Earth Type', 'Comment'];
    
    // Check if we need to start the table
    if (yPosition + headerHeight > PAGE_BOTTOM) {
        pdf.addPage();
        yPosition = addPageHeader(pdf, 'EARTH RESISTANCE TESTING (CONTINUED)');
        addFooterToPage(pdf, footer);
    }
    
    // Draw table header
    let currentX = leftMargin;
    
    // Header background
    pdf.setFillColor(102, 126, 234); // Blue gradient
    pdf.rect(leftMargin, yPosition - 3, pageWidth, headerHeight, 'F');
    
    // Header text
    pdf.setTextColor(255, 255, 255); // White text
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    
    headers.forEach((header, index) => {
        const colWidth = columnWidths[index];
        pdf.text(header, currentX + (colWidth / 2), yPosition + 8, { align: 'center' });
        currentX += colWidth;
    });
    
    yPosition += headerHeight;
    pdf.setTextColor(0, 0, 0); // Reset to black
    pdf.setFont(undefined, 'normal');
    
    // Draw table rows
    earthData.earthData.forEach((earth, index) => {
        // Check if we need a new page
        if (yPosition + rowHeight > PAGE_BOTTOM) {
            pdf.addPage();
            yPosition = addPageHeader(pdf, 'EARTH RESISTANCE TESTING (CONTINUED)');
            addFooterToPage(pdf, footer);
            
            // Redraw headers on new page
            currentX = leftMargin;
            pdf.setFillColor(102, 126, 234);
            pdf.rect(leftMargin, yPosition - 3, pageWidth, headerHeight, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFont(undefined, 'bold');
            
            headers.forEach((header, headerIndex) => {
                const colWidth = columnWidths[headerIndex];
                pdf.text(header, currentX + (colWidth / 2), yPosition + 8, { align: 'center' });
                currentX += colWidth;
            });
            
            yPosition += headerHeight;
            pdf.setTextColor(0, 0, 0);
            pdf.setFont(undefined, 'normal');
        }
        
        // Alternate row colors
        if (index % 2 === 0) {
            pdf.setFillColor(248, 249, 250); // Light gray
            pdf.rect(leftMargin, yPosition - 2, pageWidth, rowHeight, 'F');
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
        
        pdf.setFontSize(9);
        rowData.forEach((data, dataIndex) => {
            const colWidth = columnWidths[dataIndex];
            
            // Truncate text if too long
            let displayText = data.toString();
            if (displayText.length > 12 && dataIndex > 1) { // Limit text for dropdown columns
                displayText = displayText.substring(0, 12) + '...';
            }
            
            pdf.text(displayText, currentX + (colWidth / 2), yPosition + 7, { align: 'center' });
            currentX += colWidth;
        });
        
        // Draw row border
        pdf.setDrawColor(200, 200, 200);
        pdf.line(leftMargin, yPosition + rowHeight - 2, leftMargin + pageWidth, yPosition + rowHeight - 2);
        
        yPosition += rowHeight;
    });
    
    // Table border
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.rect(leftMargin, yPosition - (earthData.earthData.length * rowHeight) - headerHeight + 3, pageWidth, (earthData.earthData.length * rowHeight) + headerHeight);
    
    yPosition += 10;
    
    // Summary information
    const validEarths = earthData.earthData.filter(earth => earth.resistance > 0);
    if (validEarths.length > 0) {
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'italic');
        pdf.text(`Summary: ${validEarths.length} earth electrodes tested`, 15, yPosition);
        yPosition += 10;
        
        // Status message
        if (earthData.overallResistance > 10) {
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(220, 20, 60); // Red
            pdf.text('⚠ ATTENTION: Overall resistance exceeds 10Ω - Remedial action required', 105, yPosition, { align: 'center' });
            pdf.setTextColor(0, 0, 0); // Reset to black
            yPosition += 15;
        }
    }
    
    return yPosition;
}

// ==================== SHARED UTILITY FUNCTIONS ====================

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

// Add image to PDF with error handling
function addImageToPDF(pdf, imageData, x, y, maxWidth, maxHeight, centerAlign = false) {
    if (imageData) {
        try {
            const format = imageData.includes('data:image/jpeg') ? 'JPEG' : 'PNG';
            pdf.addImage(imageData, format, x, y, maxWidth, maxHeight);
            return maxHeight + 5;
        } catch (error) {
            console.error('Error adding image to PDF:', error);
            return 0;
        }
    }
    return 0;
}

// Add standardized page header
function addPageHeader(pdf, title) {
    // Company logo in header (if available)
    if (window.uploadedImages && window.uploadedImages[HEADER_IMAGE_URL + '_data']) {
        addImageToPDF(pdf, window.uploadedImages[HEADER_IMAGE_URL + '_data'], 160, 8, 40, 20, true);
    }
    
    // Add section title
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text(title, 105, 30, { align: 'center' });
    
    return 40; // Return Y position after header
}

// Add standardized footer
function addFooterToPage(pdf, footer) {
    // Add footer image (if available)
    if (window.uploadedImages && window.uploadedImages[FOOTER_IMAGE_URL + '_data']) {
        addImageToPDF(pdf, window.uploadedImages[FOOTER_IMAGE_URL + '_data'], 50, 265, 90, 30, true);
    }
    
    // Add footer text
    pdf.setFontSize(8);
    const footerLines = pdf.splitTextToSize(footer, 190);
    pdf.text(footerLines, 105, 285, { align: 'center' });
}

// Start new section with header and footer
function startNewSection(pdf, title, footer) {
    pdf.addPage();
    const yStart = addPageHeader(pdf, title);
    addFooterToPage(pdf, footer);
    return yStart;
}

// Create cover page
function createCoverPage(pdf, options) {
    const {
        reportTitle,
        siteAddress,
        date,
        engineerName,
        additionalFields = []
    } = options;

    let yPosition = 20;
    
    // Company logo at top (if available)
    if (window.uploadedImages && window.uploadedImages[COMPANY_LOGO_URL + '_data']) {
        const logoHeight = addImageToPDF(pdf, window.uploadedImages[COMPANY_LOGO_URL + '_data'], 30, 20, 150, 60, true);
        yPosition = 20 + logoHeight + 10;
    }
    
    // Report title
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text(reportTitle, 105, yPosition, { align: 'center' });
    yPosition += 30;
    
    // Building image if provided
    if (window.uploadedImages && window.uploadedImages['buildingImagePreview_data']) {
        const imageHeight = addImageToPDF(pdf, window.uploadedImages['buildingImagePreview_data'], 30, yPosition, 150, 100, false);
        yPosition += imageHeight + 20;
    }
    
    // Site information
    pdf.setFontSize(16);
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
    
    // Additional fields
    additionalFields.forEach(field => {
        if (field.value) {
            pdf.setFont(undefined, 'bold');
            pdf.text(field.label + ':', 105, yPosition, { align: 'center' });
            yPosition += 8;
            pdf.setFont(undefined, 'normal');
            pdf.text(field.value, 105, yPosition, { align: 'center' });
            yPosition += 12;
        }
    });
    
    // Date and engineer
    yPosition = 220;
    pdf.setFont(undefined, 'bold');
    pdf.text('Report Date: ', 20, yPosition);
    pdf.setFont(undefined, 'normal');
    pdf.text(date, 60, yPosition);
    
    pdf.setFont(undefined, 'bold');
    pdf.text('Engineer: ', 20, yPosition + 10);
    pdf.setFont(undefined, 'normal');
    pdf.text(engineerName, 60, yPosition + 10);
}

// Generate filename with date
function generateFilename(reportType) {
    const date = new Date().toISOString().split('T')[0];
    return `${reportType}_${date}.pdf`;
}

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
