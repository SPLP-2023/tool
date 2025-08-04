// Shared PDF Generator Functions
// Common functions used across all report types

// Company branding URLs
const COMPANY_LOGO_URL = "./assets/SP%20Bolt%20400x400.png";
const FOOTER_IMAGE_URL = "./assets/es12.png";
const HEADER_IMAGE_URL = "./assets/SP%20Bolt%20400x400.png";

// Common page settings
const PAGE_BOTTOM = 270;
const LEFT_COLUMN_X = 20;
const RIGHT_COLUMN_X = 110;
const COLUMN_WIDTH = 85;

// Company footer text
const COMPANY_FOOTER = "Strike Point Lightning Protection Ltd Registered office: Atkinson Evans, 10 Arnot Hill Road, Nottingham NG5 6LJ. Company No. 15114852, Registered in England and Wales. @: info@strikepoint.uk Tel: 01159903220";

// Global images storage
let uploadedImages = {};

// Enhanced image handling with aspect ratio preservation
function addImageToPDF(pdf, imageData, x, y, maxWidth, maxHeight, centerAlign = false) {
    if (imageData) {
        try {
            const format = imageData.includes('data:image/jpeg') ? 'JPEG' : 'PNG';
            
            // Use jsPDF's built-in getImageProperties method
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

// Add standardized page header with company branding
function addPageHeader(pdf, title) {
    // Company logo in header
    addImageToPDF(pdf, HEADER_IMAGE_URL, 160, 8, 40, 20, true);
    
    // Add section title spanning full width
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text(title, 105, 30, { align: 'center' });
    
    return 40; // Return Y position after header
}

// Add standardized footer with company branding and info
function addFooterToPage(pdf, footer) {
    // Add footer image - larger, centered, above text
    addImageToPDF(pdf, FOOTER_IMAGE_URL, 50, 265, 90, 30, true);
    
    // Add footer text below the image
    pdf.setFontSize(8);
    const footerLines = pdf.splitTextToSize(footer, 190);
    pdf.text(footerLines, 105, 285, { align: 'center' });
}

// Start a new section with header and footer
function startNewSection(pdf, title, footer) {
    pdf.addPage();
    const yStart = addPageHeader(pdf, title);
    addFooterToPage(pdf, footer);
    return yStart;
}

// Create standardized cover page
function createCoverPage(pdf, options) {
    const {
        reportTitle,
        siteAddress,
        date,
        engineerName,
        additionalFields = []
    } = options;

    let yPosition = 20;
    
    // Company logo centered at top
    const logoHeight = addImageToPDF(pdf, COMPANY_LOGO_URL, 30, 20, 150, 60, true);
    yPosition = 20 + logoHeight + 10;
    
    // Report title
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text(reportTitle, 105, yPosition, { align: 'center' });
    yPosition += 30;
    
    // Building image if provided
    if (uploadedImages['buildingImagePreview_data']) {
        const imageHeight = addImageToPDF(pdf, uploadedImages['buildingImagePreview_data'], 30, yPosition, 150, 100, true);
        yPosition += imageHeight + 20;
    }
    
    // Site details section
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('Site Details:', 105, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Basic details
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    
    const basicDetails = [
        'Site Address: ' + siteAddress,
        'Date: ' + date,
        'Engineer: ' + engineerName
    ];
    
    // Add additional fields
    additionalFields.forEach(field => {
        basicDetails.push(field.label + ': ' + field.value);
    });
    
    basicDetails.forEach((detail, index) => {
        pdf.text(detail, 105, yPosition + (index * 10), { align: 'center' });
    });
    
    yPosition += basicDetails.length * 10 + 20;
    
    // Add signatures if provided
    if (uploadedImages['clientSignaturePreview_data']) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Client Representative Signature:', 105, yPosition, { align: 'center' });
        yPosition += 15;
        
        const signatureHeight = addImageToPDF(pdf, uploadedImages['clientSignaturePreview_data'], 60, yPosition, 90, 30, true);
        yPosition += signatureHeight + 10;
    }
    
    return yPosition;
}

// Utility function to format numbers
function formatNumber(value, decimals = 2) {
    if (value === null || value === undefined || isNaN(value)) {
        return '-';
    }
    return parseFloat(value).toFixed(decimals);
}

// Utility function to format dates
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Handle image uploads with EXIF correction
function handleImageUpload(input, previewId) {
    if (input.files[0]) {
        const file = input.files[0];
        
        // Show loading message
        document.getElementById(previewId).textContent = 'Processing image...';
        
        // Fix orientation and compress
        fixImageOrientation(file).then(correctedImageData => {
            uploadedImages[previewId] = file;
            uploadedImages[previewId + '_data'] = correctedImageData;
            document.getElementById(previewId).textContent = 'Image uploaded successfully';
        }).catch(error => {
            console.error('Error processing image:', error);
            // Fallback to original method
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedImages[previewId + '_data'] = e.target.result;
            };
            reader.readAsDataURL(file);
            uploadedImages[previewId] = file;
            document.getElementById(previewId).textContent = 'Image uploaded (orientation may need manual correction)';
        });
    }
}

// Generate filename with date
function generateFilename(reportType) {
    const date = new Date().toISOString().split('T')[0];
    return `${reportType}_${date}.pdf`;
}

// Enhanced EXIF image orientation fix
function fixImageOrientation(file) {
    return new Promise((resolve) => {
        EXIF.getData(file, function() {
            const orientation = EXIF.getTag(this, "Orientation") || 1;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Determine if image is naturally landscape or portrait shaped
                    const isLandscapeShape = img.width > img.height;
                    
                    // Smart logic: only apply rotation to landscape-shaped images that need it
                    if (isLandscapeShape && (orientation === 6 || orientation === 8)) {
                        // Apply rotation for landscape images
                        if (orientation === 6) {
                            // Rotate 90° clockwise
                            canvas.width = img.height;
                            canvas.height = img.width;
                            ctx.rotate(90 * Math.PI / 180);
                            ctx.translate(0, -canvas.width);
                        } else if (orientation === 8) {
                            // Rotate 90° counter-clockwise  
                            canvas.width = img.height;
                            canvas.height = img.width;
                            ctx.rotate(-90 * Math.PI / 180);
                            ctx.translate(-canvas.height, 0);
                        }
                    } else {
                        // For portrait-shaped images or normal orientation, don't rotate
                        canvas.width = img.width;
                        canvas.height = img.height;
                    }
                    
                    ctx.drawImage(img, 0, 0);
                    
                    // Convert back with compression
                    const correctedImageData = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(correctedImageData);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    });
}