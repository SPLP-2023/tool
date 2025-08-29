// =============================================================================
// T&I PDF GENERATOR - COMPLETE STANDALONE FILE
// Create as: js/t&i-pdf-generator.js
// Replaces: pdf-generator.js + pdf-generator-shared.js for T&I reports only
// =============================================================================

        // Company logo URL (hosted on GitHub)
        const COMPANY_LOGO_URL = "./assets/Color logo - no background (px reduction).png";
        const FOOTER_IMAGE_URL = "./assets/es12.png";
        const HEADER_IMAGE_URL = "./assets/SP Bolt 400x400.png";
        
        // Ensure systemDetails is populated before PDF generation
        if (!window.systemDetails || Object.keys(window.systemDetails).length === 0) {
          const categories = [
            'groundType', 'boundaryType', 'roofType', 'roofLayout',
            'airTermination', 'airConductors', 'downConductorNetwork',
            'downConductors', 'earthTermination'
          ];
        
          window.systemDetails = {};
        
          categories.forEach(cat => {
            const selected = document.querySelectorAll(`#${cat}List .selected`);
            window.systemDetails[cat] = Array.from(selected).map(el => el.textContent.trim());
        
            // Handle "Other" input if visible
            const otherInput = document.getElementById(cat + 'Other');
            if (otherInput && !otherInput.classList.contains('hidden') && otherInput.value.trim()) {
              window.systemDetails[cat].push('Other: ' + otherInput.value.trim());
            }
          });
        }

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
        rebuildSystemDetailsFromDOM();
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
    const structureUse = document.getElementById('structureUse')?.value || '';
    const structureOccupancy = document.getElementById('structureOccupancy')?.value || '';
    const structureAge = document.getElementById('structureAge')?.value || '';
    const previousInspections = document.getElementById('previousInspections')?.value || '';
    
    // Get system details dropdowns
    const earthArrangement = document.getElementById('earthArrangement')?.value || '';
    const mainEquipotentialBond = document.getElementById('mainEquipotentialBond')?.value || '';
    const surgeInstalled = document.getElementById('surgeInstalled')?.value || '';
    const surgeType = document.getElementById('surgeType')?.value || '';
    const surgeSafe = document.getElementById('surgeSafe')?.value || '';
    
    let yPosition = 20;    

    // ==================== COVER PAGE ====================
    // Get new fields
    const jobReference = document.getElementById('jobReference')?.value || '';
    const siteStaffName = document.getElementById('siteStaffName')?.value || '';
    const siteStaffSignature = window.siteStaffSignature?.signatureData || null;

    // Initialize systemDetails from global variable
    const systemDetails = window.systemDetails || {};

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
        if (generalComments) {
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

    
    // Add general comments/recommendations if present
    if (generalComments) {
        const maxY = Math.max(leftColumnY, rightColumnY);
        if (maxY + 50 > pageBottom) {
            pdf.addPage();
            yPosition = addPageHeader(pdf, 'INSPECTION SUMMARY (CONTINUED)');
            addFooterToPage(pdf, footer);
        } else {
            yPosition = maxY + 15;
        }
        
        // Add recommendations header
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(0, 100, 200); // Blue color for recommendations
        pdf.text('RECOMMENDATIONS', leftColumnX, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 8;
        
        // Add recommendations content
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        const commentLines = pdf.splitTextToSize(generalComments, 170);
        pdf.text(commentLines, leftColumnX, yPosition);
    }
    
        // ==================== STRUCTURE & SYSTEM DETAILS ====================
        yPosition = startNewSection(pdf, 'Structure & System Details', footer);
        
        const leftColumnY_start = yPosition;
        const rightColumnY_start = yPosition;
        leftColumnY = leftColumnY_start;
        rightColumnY = rightColumnY_start;
        
        // Left Column - Structure Details
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('STRUCTURE DETAILS', leftColumnX, leftColumnY);
        leftColumnY += 12;
        
        pdf.setFontSize(10);
        
        // Structure Height
        if (structureHeight) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Structure Height:', leftColumnX, leftColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(structureHeight + ' m', leftColumnX, leftColumnY + 5);
            leftColumnY += 12;
        }
        
        // Structure Perimeter
        if (structurePerimeter) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Structure Perimeter:', leftColumnX, leftColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(structurePerimeter + ' m', leftColumnX, leftColumnY + 5);
            leftColumnY += 12;
        }
        
        // Ground Type
        if (systemDetails.groundType && systemDetails.groundType.length > 0) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Ground Type:', leftColumnX, leftColumnY);
            leftColumnY += 5;
            pdf.setFont(undefined, 'normal');
            const answers = systemDetails.groundType.join(', ');
            const answerLines = pdf.splitTextToSize(answers, columnWidth);
            pdf.text(answerLines, leftColumnX, leftColumnY);
            leftColumnY += answerLines.length * 4 + 8;
        }
        
        // Boundary Type
        if (systemDetails.boundaryType && systemDetails.boundaryType.length > 0) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Boundary Type:', leftColumnX, leftColumnY);
            leftColumnY += 5;
            pdf.setFont(undefined, 'normal');
            const answers = systemDetails.boundaryType.join(', ');
            const answerLines = pdf.splitTextToSize(answers, columnWidth);
            pdf.text(answerLines, leftColumnX, leftColumnY);
            leftColumnY += answerLines.length * 4 + 8;
        }
        
        // Roof Type
        if (systemDetails.roofType && systemDetails.roofType.length > 0) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Roof Type:', leftColumnX, leftColumnY);
            leftColumnY += 5;
            pdf.setFont(undefined, 'normal');
            const answers = systemDetails.roofType.join(', ');
            const answerLines = pdf.splitTextToSize(answers, columnWidth);
            pdf.text(answerLines, leftColumnX, leftColumnY);
            leftColumnY += answerLines.length * 4 + 8;
        }
        
        // Roof Layout
        if (systemDetails.roofLayout && systemDetails.roofLayout.length > 0) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Roof Layout:', leftColumnX, leftColumnY);
            leftColumnY += 5;
            pdf.setFont(undefined, 'normal');
            const answers = systemDetails.roofLayout.join(', ');
            const answerLines = pdf.splitTextToSize(answers, columnWidth);
            pdf.text(answerLines, leftColumnX, leftColumnY);
            leftColumnY += answerLines.length * 4 + 8;
        }
        
        // Structure Use
        if (structureUse) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Structure Use:', leftColumnX, leftColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(structureUse, leftColumnX, leftColumnY + 5);
            leftColumnY += 12;
        }
        
        // Structure Maximum Occupancy
        if (structureOccupancy) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Max Occupancy:', leftColumnX, leftColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(structureOccupancy + ' people', leftColumnX, leftColumnY + 5);
            leftColumnY += 12;
        }
        
        // Age of Structure
        if (structureAge) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Age of Structure:', leftColumnX, leftColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(structureAge + ' years', leftColumnX, leftColumnY + 5);
            leftColumnY += 12;
        }
        
        // Previous Inspections
        if (previousInspections) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Previous Inspections:', leftColumnX, leftColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(previousInspections, leftColumnX, leftColumnY + 5);
            leftColumnY += 12;
        }
        
        // Right Column - System Details
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('SYSTEM DETAILS', rightColumnX, rightColumnY);
        rightColumnY += 12;
        
        pdf.setFontSize(10);
        
        // Air Termination Network
        if (systemDetails.airTermination && systemDetails.airTermination.length > 0) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Air Termination Network:', rightColumnX, rightColumnY);
            rightColumnY += 5;
            pdf.setFont(undefined, 'normal');
            const answers = systemDetails.airTermination.join(', ');
            const answerLines = pdf.splitTextToSize(answers, columnWidth);
            pdf.text(answerLines, rightColumnX, rightColumnY);
            rightColumnY += answerLines.length * 4 + 8;
        }
        
        // Air Conductors & Fixings
        if (systemDetails.airConductors && systemDetails.airConductors.length > 0) {
            pdf.setFont(undefined, 'bold');
            pdf.text('AT Conductors & Fixings:', rightColumnX, rightColumnY);
            rightColumnY += 5;
            pdf.setFont(undefined, 'normal');
            const answers = systemDetails.airConductors.join(', ');
            const answerLines = pdf.splitTextToSize(answers, columnWidth);
            pdf.text(answerLines, rightColumnX, rightColumnY);
            rightColumnY += answerLines.length * 4 + 8;
        }
        
        // Down Conductor Network
        if (systemDetails.downConductorNetwork && systemDetails.downConductorNetwork.length > 0) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Down Conductor Network:', rightColumnX, rightColumnY);
            rightColumnY += 5;
            pdf.setFont(undefined, 'normal');
            const answers = systemDetails.downConductorNetwork.join(', ');
            const answerLines = pdf.splitTextToSize(answers, columnWidth);
            pdf.text(answerLines, rightColumnX, rightColumnY);
            rightColumnY += answerLines.length * 4 + 8;
        }
        
        // Down Conductors & Fixings
        if (systemDetails.downConductors && systemDetails.downConductors.length > 0) {
            pdf.setFont(undefined, 'bold');
            pdf.text('DC Conductors & Fixings:', rightColumnX, rightColumnY);
            rightColumnY += 5;
            pdf.setFont(undefined, 'normal');
            const answers = systemDetails.downConductors.join(', ');
            const answerLines = pdf.splitTextToSize(answers, columnWidth);
            pdf.text(answerLines, rightColumnX, rightColumnY);
            rightColumnY += answerLines.length * 4 + 8;
        }
        
        // Earth Termination Network
        if (systemDetails.earthTermination && systemDetails.earthTermination.length > 0) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Earth Termination Network:', rightColumnX, rightColumnY);
            rightColumnY += 5;
            pdf.setFont(undefined, 'normal');
            const answers = systemDetails.earthTermination.join(', ');
            const answerLines = pdf.splitTextToSize(answers, columnWidth);
            pdf.text(answerLines, rightColumnX, rightColumnY);
            rightColumnY += answerLines.length * 4 + 8;
        }
        
        // Earth Arrangement
        if (earthArrangement) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Earth Arrangement:', rightColumnX, rightColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(earthArrangement, rightColumnX, rightColumnY + 5);
            rightColumnY += 12;
        }
        
        // Main Equipotential Bond
        if (mainEquipotentialBond) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Main Equipotential Bond:', rightColumnX, rightColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(mainEquipotentialBond, rightColumnX, rightColumnY + 5);
            rightColumnY += 12;
        }
        
        // Surge Protection Installation
        if (surgeInstalled) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Surge Protection:', rightColumnX, rightColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(surgeInstalled, rightColumnX, rightColumnY + 5);
            rightColumnY += 12;
        }
        
        // Surge Protection Type
        if (surgeType) {
            pdf.setFont(undefined, 'bold');
            pdf.text('SPD Type:', rightColumnX, rightColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(surgeType, rightColumnX, rightColumnY + 5);
            rightColumnY += 12;
        }
        
        // Surge Protection Status
        if (surgeSafe) {
            pdf.setFont(undefined, 'bold');
            pdf.text('SPD Status:', rightColumnX, rightColumnY);
            pdf.setFont(undefined, 'normal');
            pdf.text(surgeSafe, rightColumnX, rightColumnY + 5);
            rightColumnY += 12;
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

function renderEarthResistanceTable(pdf, earthData, yPosition, footer, pageBottom) {
    const leftMargin = 20;
    const pageWidth = 170;
    const rowHeight = 10;
    const headerHeight = 12;
    const rowsPerPage = 18;
    
    // Column widths
    const columnWidths = [15, 18, 22, 18, 22, 22, 22, 31];
    const headers = ['E', 'Ohms', 'Test Clamp', 'Pit', 'Test Type', 'Ground Type', 'Earth Type', 'Comment'];
    
    let rowsOnCurrentPage = 0;
    let tableStartY = yPosition;
    
    // Function to draw table header
    function drawTableHeader(yPos) {
        let currentX = leftMargin;
        
        // Header background - your logo color
        pdf.setFillColor(8, 119, 195);
        pdf.rect(leftMargin, yPos, pageWidth, headerHeight, 'F');
        
        // Header text
        pdf.setTextColor(255, 255, 255); // White text
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'bold');
        
        headers.forEach((header, index) => {
            const colWidth = columnWidths[index];
            pdf.text(header, currentX + (colWidth / 2), yPos + 8, { align: 'center' });
            currentX += colWidth;
        });
        
        pdf.setTextColor(0, 0, 0);
        return yPos + headerHeight;
    }
    
    // Function to complete page border
    function completePageBorder(startY, endY) {
        pdf.setDrawColor(8, 119, 195);
        pdf.setLineWidth(0.5);
        // Top border
        pdf.line(leftMargin, startY, leftMargin + pageWidth, startY);
        // Left border
        pdf.line(leftMargin, startY, leftMargin, endY);
        // Right border
        pdf.line(leftMargin + pageWidth, startY, leftMargin + pageWidth, endY);
        // Bottom border
        pdf.line(leftMargin, endY, leftMargin + pageWidth, endY);
    }
    
    // Check if we need to start on new page (only if absolutely no room)
    const minSpaceNeeded = headerHeight + (3 * rowHeight); // At least 3 rows
    if (yPosition + minSpaceNeeded > pageBottom) {
        pdf.addPage();
        yPosition = addPageHeader(pdf, 'EARTH RESISTANCE TESTING');
        addFooterToPage(pdf, footer);
    }
    
    // Draw initial header
    tableStartY = yPosition;
    yPosition = drawTableHeader(yPosition);
    
    // Draw table rows
    earthData.earthData.forEach((earth, index) => {
        // Check if we need a new page (after exactly 18 rows)
        if (rowsOnCurrentPage >= rowsPerPage) {
            // Complete current page border
            completePageBorder(tableStartY, yPosition);
            
            // Start new page
            pdf.addPage();
            yPosition = addPageHeader(pdf, 'EARTH RESISTANCE TESTING (CONTINUED)');
            addFooterToPage(pdf, footer);
            
            tableStartY = yPosition;
            yPosition = drawTableHeader(yPosition);
            rowsOnCurrentPage = 0;
        }
        
        // Alternate row colors
        if (index % 2 === 0) {
            pdf.setFillColor(180, 210, 235);
            pdf.rect(leftMargin, yPosition, pageWidth, rowHeight, 'F');
        }
        
        // Draw row data
        let currentX = leftMargin;
        const rowData = [
            `E${earth.earthNumber}`,
            earth.resistance > 0 ? `${earth.resistance.toFixed(2)}Ω` : '-',
            earth.testClamp || '-',
            earth.pitType || '-',
            earth.testType || '-',
            earth.groundType || '-',
            earth.earthType || '-',
            earth.comment || '-'
        ];
        
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(8);
        
        rowData.forEach((data, colIndex) => {
            const colWidth = columnWidths[colIndex];
            const textLines = pdf.splitTextToSize(data, colWidth - 4);
            pdf.text(textLines[0], currentX + (colWidth / 2), yPosition + 7, { align: 'center' });
            currentX += colWidth;
        });
        
        yPosition += rowHeight;
        rowsOnCurrentPage++;
    });
    
    // Complete final page border
    completePageBorder(tableStartY, yPosition);
    
    return yPosition + 15;
}
    
    // ==================== EARTH TEST IMAGES SECTION ====================
    if (uploadedImages['earthImagesPreview_data']) {
        yPosition = startNewSection(pdf, 'INSPECTION IMAGES', footer);
        
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
                    yPosition = addPageHeader(pdf, 'INSPECTION IMAGES (CONTINUED)');
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
