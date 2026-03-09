// ============================================================
// pdf-generator-risk.js
// BS EN IEC 62305-2:2024 — Risk Assessment PDF Generator
// 6-page report: Cover | Summary | Zone Details | Calc Breakdown | Methodology | Comments
// ============================================================

function generateRiskAssessmentPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    const d = getRACalculationData();

    const BLUE   = [41, 128, 185];
    const DARK   = [44, 62, 80];
    const GREEN  = [39, 174, 96];
    const RED    = [231, 76, 60];
    const LIGHT  = [245, 247, 250];
    const WHITE  = [255, 255, 255];
    const GREY   = [127, 140, 141];
    const GOLD   = [241, 196, 15];

    const PW = 210; // page width mm
    const PH = 297; // page height mm
    const ML = 15;  // margin left
    const MR = 15;  // margin right
    const CW = PW - ML - MR; // content width

    // ── Helper functions ──
    function setFont(size, style = 'normal', color = DARK) {
        pdf.setFontSize(size);
        pdf.setFont('helvetica', style);
        pdf.setTextColor(...color);
    }

    function fillRect(x, y, w, h, color) {
        pdf.setFillColor(...color);
        pdf.rect(x, y, w, h, 'F');
    }

    function hRule(y, color = [220, 220, 220], thickness = 0.3) {
        pdf.setDrawColor(...color);
        pdf.setLineWidth(thickness);
        pdf.line(ML, y, PW - MR, y);
    }

    function addFooter(pageNum, total) {
        const fy = PH - 10;
        fillRect(0, PH - 14, PW, 14, DARK);
        setFont(8, 'normal', WHITE);
        pdf.text('Strike Point Lightning Protection Ltd', ML, fy);
        pdf.text('BS EN IEC 62305-2:2024', PW / 2, fy, { align: 'center' });
        pdf.text(`Page ${pageNum} of ${total}`, PW - MR, fy, { align: 'right' });
    }

    function addHeader(title, pageNum) {
        fillRect(0, 0, PW, 18, DARK);
        setFont(10, 'bold', [52, 152, 219]);
        pdf.text('STRIKE POINT', ML, 7);
        setFont(8, 'normal', [189, 195, 199]);
        pdf.text('Lightning Protection Ltd', ML, 12.5);
        setFont(10, 'bold', WHITE);
        pdf.text(title, PW / 2, 10, { align: 'center' });
        setFont(8, 'normal', [189, 195, 199]);
        pdf.text('CONFIDENTIAL — SITE ASSESSMENT DOCUMENT', PW - MR, 10, { align: 'right' });
        return 24;
    }

    function twoColRow(label, value, y, shade = false) {
        if (shade) fillRect(ML, y - 4, CW, 8, LIGHT);
        setFont(9, 'bold', DARK);
        pdf.text(label, ML + 2, y);
        setFont(9, 'normal', DARK);
        pdf.text(String(value || '—'), ML + CW * 0.45, y);
        return y + 8;
    }

    function sectionHeading(text, y) {
        fillRect(ML, y - 4, CW, 9, BLUE);
        setFont(9, 'bold', WHITE);
        pdf.text(text, ML + 4, y + 1);
        return y + 10;
    }

    const TOTAL_PAGES = 6;
    let p = 1;

    // ══════════════════════════════════════════════
    // PAGE 1 — COVER
    // ══════════════════════════════════════════════
    fillRect(0, 0, PW, PH, DARK);

    // Top accent bar
    fillRect(0, 0, PW, 4, BLUE);

    // Logo area
    setFont(28, 'bold', BLUE);
    pdf.text('STRIKE POINT', PW / 2, 50, { align: 'center' });
    setFont(11, 'normal', [189, 195, 199]);
    pdf.text('Lightning Protection Ltd', PW / 2, 60, { align: 'center' });

    // Title box
    fillRect(ML, 75, CW, 40, [30, 50, 70]);
    setFont(18, 'bold', WHITE);
    pdf.text('LIGHTNING PROTECTION', PW / 2, 91, { align: 'center' });
    setFont(16, 'bold', GOLD);
    pdf.text('RISK ASSESSMENT REPORT', PW / 2, 103, { align: 'center' });

    // Standard badge
    fillRect(ML + CW * 0.2, 120, CW * 0.6, 10, BLUE);
    setFont(9, 'bold', WHITE);
    pdf.text('BS EN IEC 62305-2:2024 — Phase 1: R1 Loss of Human Life', PW / 2, 127, { align: 'center' });

    // Site info box
    fillRect(ML, 140, CW, 80, [30, 50, 70]);
    const rows = [
        ['Site Address:', d.siteAddress || '—'],
        ['Structure Ref:', d.structureRef || '—'],
        ['Structure Type:', d.structureType || '—'],
        ['Assessment Date:', formatDate ? formatDate(d.assessmentDate) : d.assessmentDate],
        ['Assessor:', d.surveyorName || '—'],
        ['UK Region:', d.ukRegion || '—']
    ];
    let ry = 152;
    rows.forEach(([label, val], i) => {
        setFont(9, 'bold', [189, 195, 199]);
        pdf.text(label, ML + 6, ry);
        setFont(9, 'normal', WHITE);
        const lines = pdf.splitTextToSize(String(val), CW * 0.55);
        pdf.text(lines[0], ML + CW * 0.4, ry);
        ry += 11;
    });

    // Pass/Fail on cover
    const isPass = d.passFail.toLowerCase().includes('pass');
    fillRect(ML, 230, CW, 18, isPass ? GREEN : RED);
    setFont(13, 'bold', WHITE);
    pdf.text(isPass ? '✔  PASS — Risk Acceptable. No LPS Required.'
                    : '✘  FAIL — LPS Required. See Recommendations.',
        PW / 2, 241, { align: 'center' });

    // Bottom bar
    fillRect(0, PH - 18, PW, 18, [15, 30, 50]);
    setFont(8, 'normal', GREY);
    pdf.text('Strike Point Lightning Protection Ltd', ML, PH - 8);
    pdf.text('STRICTLY CONFIDENTIAL', PW / 2, PH - 8, { align: 'center' });
    pdf.text(`Page 1 of ${TOTAL_PAGES}`, PW - MR, PH - 8, { align: 'right' });

    // ══════════════════════════════════════════════
    // PAGE 2 — RISK ASSESSMENT SUMMARY
    // ══════════════════════════════════════════════
    pdf.addPage(); p = 2;
    let y = addHeader('RISK ASSESSMENT SUMMARY', p);
    addFooter(p, TOTAL_PAGES);

    // Result banner
    fillRect(ML, y, CW, 16, isPass ? GREEN : RED);
    setFont(12, 'bold', WHITE);
    pdf.text(d.passFail, PW / 2, y + 10, { align: 'center' });
    y += 22;

    // Key values grid (2 × 3)
    const kvItems = [
        ['Collection Area A_D', d.AD],
        ['Annual Dangerous Events N_D', d.ND],
        ['Tolerable Risk R_T', '1 × 10⁻⁵ yr⁻¹'],
        ['Total Risk R₁', d.R1],
        ['NSG (strikes/km²/yr)', d.nsg],
        ['Location Factor C_D', d.cd]
    ];
    const colW = CW / 3;
    kvItems.forEach((item, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const bx = ML + col * colW;
        const by = y + row * 28;
        fillRect(bx + 1, by, colW - 2, 25, LIGHT);
        setFont(8, 'normal', GREY);
        pdf.text(item[0], bx + colW / 2, by + 8, { align: 'center' });
        setFont(11, 'bold', BLUE);
        pdf.text(String(item[1] || '—'), bx + colW / 2, by + 19, { align: 'center' });
    });
    y += 64;

    // Risk breakdown table
    y = sectionHeading('RISK COMPONENT BREAKDOWN', y);
    const bkRows = [
        ['R_AT — Touch/Step voltage (LPZ 0A)', d.RAT, d.pctRAT],
        ['R_B  — Physical damage / fire (both zones)', d.RB, d.pctRB],
        ['R_C  — Internal systems failure (LPZ 1)', d.RC, d.pctRC],
        ['R₁  — TOTAL RISK', d.R1, '100%']
    ];
    bkRows.forEach((row, i) => {
        const shade = i % 2 === 0;
        if (shade) fillRect(ML, y - 4, CW, 8, LIGHT);
        setFont(9, i === 3 ? 'bold' : 'normal', i === 3 ? BLUE : DARK);
        pdf.text(row[0], ML + 2, y);
        pdf.text(String(row[1]), ML + CW * 0.65, y, { align: 'right' });
        pdf.text(String(row[2]), ML + CW - 2, y, { align: 'right' });
        y += 9;
    });
    y += 8;

    // LPL Recommendation
    if (!isPass) {
        y = sectionHeading('LPL RECOMMENDATION', y);
        if (d.lplClass && d.lplClass !== 'N/A') {
            fillRect(ML, y - 2, CW, 30, [44, 26, 26]);
            setFont(10, 'bold', RED);
            pdf.text('Minimum Required LPS:', ML + 4, y + 6);
            setFont(16, 'bold', [231, 76, 60]);
            pdf.text(d.lplClass, ML + 65, y + 6);
            setFont(9, 'normal', WHITE);
            pdf.text('R₁ Achieved: ' + d.lplR1Achieved, ML + 4, y + 16);
            setFont(8, 'normal', [189, 195, 199]);
            const spdLines = pdf.splitTextToSize('SPD: ' + (d.spdReq || 'See methodology'), CW - 8);
            pdf.text(spdLines, ML + 4, y + 23);
            y += 36;
        } else {
            fillRect(ML, y - 2, CW, 14, [80, 50, 0]);
            setFont(9, 'bold', GOLD);
            pdf.text('⚠ Risk cannot be reduced to tolerable level by structural LPS alone.', ML + 4, y + 6);
            setFont(8, 'normal', WHITE);
            pdf.text('Consider Thunderstorm Warning System (TWS) per IEC 62793.', ML + 4, y + 12);
            y += 20;
        }
    }

    // ══════════════════════════════════════════════
    // PAGE 3 — STRUCTURE & ZONE DETAILS
    // ══════════════════════════════════════════════
    pdf.addPage(); p = 3;
    y = addHeader('STRUCTURE & ZONE DETAILS', p);
    addFooter(p, TOTAL_PAGES);

    y = sectionHeading('SITE & STRUCTURE', y);
    y = twoColRow('Site Address', d.siteAddress, y, false);
    y = twoColRow('Structure Reference', d.structureRef, y, true);
    y = twoColRow('Structure Type', d.structureType, y, false);
    y = twoColRow('Assessor', d.surveyorName, y, true);
    y = twoColRow('Assessment Date', d.assessmentDate, y, false);
    y += 6;

    y = sectionHeading('STRUCTURE DIMENSIONS', y);
    y = twoColRow('Height H', d.H + ' m', y, false);
    y = twoColRow('Length L', d.L + ' m', y, true);
    y = twoColRow('Width W', d.W + ' m', y, false);
    y = twoColRow('Collection Area A_D', d.AD, y, true);
    y += 6;

    y = sectionHeading('LOCATION & ENVIRONMENT', y);
    y = twoColRow('UK Region', d.ukRegion, y, false);
    y = twoColRow('N_SG (strikes/km²/yr)', d.nsg, y, true);
    y = twoColRow('Location Factor C_D', d.cd, y, false);
    y = twoColRow('Annual Dangerous Events N_D', d.ND, y, true);
    y += 6;

    y = sectionHeading('LPZ 0A — EXTERNAL ZONE', y);
    y = twoColRow('Persons in zone (n_z)', d.lpz0aNz, y, false);
    y = twoColRow('Total persons (n_t)', d.totalPersons, y, true);
    y = twoColRow('Surface type (r_t)', d.lpz0aSurface, y, false);
    y = twoColRow('Structure material (P_S)', d.lpz0aPsType, y, true);
    y = twoColRow('Existing LPS (P_LPS)', d.lpz0aLps, y, false);
    y = twoColRow('Touch/step protection (P_am)', d.lpz0aPam, y, true);
    y = twoColRow('TWS installed', d.lpz0aTws, y, false);
    y += 6;

    y = sectionHeading('LPZ 1 — INTERNAL ZONE', y);
    y = twoColRow('Persons in zone (n_z)', d.lpz1Nz || d.totalPersons + ' (= n_t)', y, false);
    y = twoColRow('Fire risk level (r_f)', d.lpz1FireRisk, y, true);
    y = twoColRow('Fire provisions (r_p)', d.lpz1FireProv, y, false);
    y = twoColRow('Structure material (P_S)', d.lpz1PsType, y, true);
    y = twoColRow('Existing LPS (P_LPS)', d.lpz1Lps, y, false);
    y = twoColRow('Loss category', d.lpz1LossCat, y, true);
    y = twoColRow('Internal systems (R_C enabled)', d.internalSystems, y, false);

    // ══════════════════════════════════════════════
    // PAGE 4 — CALCULATION BREAKDOWN
    // ══════════════════════════════════════════════
    pdf.addPage(); p = 4;
    y = addHeader('CALCULATION BREAKDOWN', p);
    addFooter(p, TOTAL_PAGES);

    y = sectionHeading('ANNUAL DANGEROUS EVENTS (N_D)', y);
    const calcRows = [
        ['Collection area A_D = L×W + 2×(3H)×(L+W) + π×(3H)²', d.AD],
        ['Annual dangerous events N_D = N_SG × A_D × C_D × 10⁻⁶', d.ND]
    ];
    calcRows.forEach((row, i) => {
        if (i % 2 === 0) fillRect(ML, y - 4, CW, 8, LIGHT);
        setFont(9, 'normal', DARK);
        pdf.text(row[0], ML + 2, y);
        setFont(9, 'bold', BLUE);
        pdf.text(String(row[1]), ML + CW - 2, y, { align: 'right' });
        y += 9;
    });
    y += 6;

    y = sectionHeading('R_AT — TOUCH/STEP VOLTAGE RISK (LPZ 0A)', y);
    const ratRows = [
        ['P_AT = P_am × r_t', '(touch/step probability)'],
        ['L_T = (n_z/n_t) × (t_z/8760)', '(loss factor)'],
        ['P_P = t_z/8760', '(time factor)'],
        ['R_AT = N_D × P_AT × L_T', d.RAT]
    ];
    ratRows.forEach((row, i) => {
        if (i % 2 === 0) fillRect(ML, y - 4, CW, 8, LIGHT);
        setFont(9, 'normal', DARK);
        pdf.text(row[0], ML + 2, y);
        setFont(9, 'bold', i === ratRows.length - 1 ? BLUE : GREY);
        pdf.text(String(row[1]), ML + CW - 2, y, { align: 'right' });
        y += 9;
    });
    y += 6;

    y = sectionHeading('R_B — PHYSICAL DAMAGE / FIRE RISK (BOTH ZONES)', y);
    const rbRows = [
        ['P_B = P_S × P_LPS × r_f × r_p', '(per zone)'],
        ['L_B1 = L_F1 × (n_z/n_t)', '(fire loss factor)'],
        ['R_B = N_D × P_B × L_B1  (LPZ 0A + LPZ 1)', d.RB]
    ];
    rbRows.forEach((row, i) => {
        if (i % 2 === 0) fillRect(ML, y - 4, CW, 8, LIGHT);
        setFont(9, 'normal', DARK);
        pdf.text(row[0], ML + 2, y);
        setFont(9, 'bold', i === rbRows.length - 1 ? BLUE : GREY);
        pdf.text(String(row[1]), ML + CW - 2, y, { align: 'right' });
        y += 9;
    });
    y += 6;

    y = sectionHeading('R_C — INTERNAL SYSTEM FAILURE RISK (LPZ 1)', y);
    const rcRows = [
        ['P_C = P_SPD × C_LD  (C_LD = 1, Phase 1)', d.internalSystems === 'Yes' ? '(calculated)' : 'DISABLED'],
        ['L_C1 = L_O1 × (n_z/n_t)', '(loss factor)'],
        ['R_C = N_D × P_C × L_C1', d.RC]
    ];
    rcRows.forEach((row, i) => {
        if (i % 2 === 0) fillRect(ML, y - 4, CW, 8, LIGHT);
        setFont(9, 'normal', DARK);
        pdf.text(row[0], ML + 2, y);
        setFont(9, 'bold', i === rcRows.length - 1 ? BLUE : GREY);
        pdf.text(String(row[1]), ML + CW - 2, y, { align: 'right' });
        y += 9;
    });
    y += 6;

    // Summary table
    y = sectionHeading('R₁ TOTAL — SUMMARY', y);
    const sumRows = [
        ['R_AT (LPZ 0A touch/step)', d.RAT, d.pctRAT],
        ['R_B  (both zones, physical damage)', d.RB, d.pctRB],
        ['R_C  (LPZ 1, internal systems)', d.RC, d.pctRC],
        ['R₁  TOTAL', d.R1, '100%'],
        ['R_T  Tolerable limit', '1 × 10⁻⁵', '—'],
        ['RESULT', isPass ? 'PASS' : 'FAIL', '']
    ];
    sumRows.forEach((row, i) => {
        const isLast = i === sumRows.length - 1;
        const isTot  = i === 3;
        fillRect(ML, y - 4, CW, 8, isLast ? (isPass ? GREEN : RED) : isTot ? BLUE : i % 2 === 0 ? LIGHT : WHITE);
        setFont(9, isTot || isLast ? 'bold' : 'normal', isLast || isTot ? WHITE : DARK);
        pdf.text(row[0], ML + 2, y);
        pdf.text(String(row[1]), ML + CW * 0.7, y, { align: 'right' });
        pdf.text(String(row[2]), ML + CW - 2, y, { align: 'right' });
        y += 9;
    });

    // ══════════════════════════════════════════════
    // PAGE 5 — METHODOLOGY
    // ══════════════════════════════════════════════
    pdf.addPage(); p = 5;
    y = addHeader('RISK ASSESSMENT METHODOLOGY', p);
    addFooter(p, TOTAL_PAGES);

    const methodText = [
        { heading: 'Standard Reference' },
        { body: 'This assessment has been conducted in strict accordance with BS EN IEC 62305-2:2024 "Protection against lightning — Part 2: Risk management." All table values, formulae, and risk limits are taken directly from the 2024 edition of the standard.' },
        { heading: 'Scope — Phase 1' },
        { body: 'Phase 1 evaluates R1 (Risk of Loss of Human Life) for a standalone structure with two protection zones: LPZ 0A (external/unshielded) and LPZ 1 (internal). Source S1 (flashes to structure) only. Connected lines (S3/S4), R2–R4 components, and additional LPZ analysis are planned for Phase 2.' },
        { heading: 'Collection Area (Clause A.2.1.2 — 2024 Edition)' },
        { body: 'A_D = L×W + 2×(3H)×(L+W) + π×(3H)²\nNote: The 2024 standard uses 3H (not H as in the 2012 edition) for the rolling sphere method.' },
        { heading: 'Annual Dangerous Events (Clause A.2.4)' },
        { body: 'N_D = N_SG × A_D × C_D × 10⁻⁶' },
        { heading: 'Risk Components' },
        { body: 'R_AT = N_D × P_AT × L_T  (touch/step voltage, LPZ 0A)\nR_B  = N_D × P_B  × L_B1 (physical damage/fire, both zones)\nR_C  = N_D × P_C  × L_C1 (internal systems, LPZ 1 — if enabled)\nR₁   = R_AT + R_B + R_C' },
        { heading: 'Table Sources' },
        { body: 'Table B.1 — Touch/step protection (P_am)\nTable B.2 — Surface type factor (r_t)\nTable B.3 — Existing LPS probability (P_LPS)\nTable B.4 — Structure type factor (P_S)\nTable B.5 — Fire provisions factor (r_p)\nTable B.6 — Fire risk level (r_f)\nTable B.7 — SPD protection factor (P_SPD)\nTable C.2 — Loss category (L_F1, L_O1)\nAnnex NG.2 — UK NSG regional values (ATDnet/Meteorage 2013–2022)' },
        { heading: 'Tolerable Risk' },
        { body: 'R_T = 1 × 10⁻⁵ per year (Clause 2, BS EN IEC 62305-2:2024)' },
        { heading: 'LPL Recommendation Logic' },
        { body: 'When R₁ > R_T, the tool iterates LPL IV → III → II → I, applying the corresponding P_LPS value from Table B.3 and recalculating R₁. The lowest LPL class that brings R₁ ≤ R_T is recommended. SPD requirements are then determined from Table B.7 for the recommended LPL class.' }
    ];

    methodText.forEach(item => {
        if (y > PH - 25) { pdf.addPage(); y = addHeader('METHODOLOGY (CONTINUED)', p); addFooter(p, TOTAL_PAGES); }
        if (item.heading) {
            y = sectionHeading(item.heading.toUpperCase(), y + 2);
        } else {
            setFont(9, 'normal', DARK);
            const lines = pdf.splitTextToSize(item.body, CW - 8);
            pdf.text(lines, ML + 4, y);
            y += lines.length * 5.5 + 6;
        }
    });

    // ══════════════════════════════════════════════
    // PAGE 6 — COMMENTS & RECOMMENDATIONS
    // ══════════════════════════════════════════════
    pdf.addPage(); p = 6;
    y = addHeader('ASSESSOR COMMENTS & RECOMMENDATIONS', p);
    addFooter(p, TOTAL_PAGES);

    y = sectionHeading('ASSESSOR COMMENTS', y);
    if (d.comments) {
        setFont(10, 'normal', DARK);
        const lines = pdf.splitTextToSize(d.comments, CW - 8);
        pdf.text(lines, ML + 4, y);
        y += lines.length * 5.5 + 10;
    } else {
        setFont(10, 'italic', GREY);
        pdf.text('No comments provided.', ML + 4, y);
        y += 12;
    }

    y += 6;
    y = sectionHeading('DECLARATION', y);
    setFont(9, 'normal', DARK);
    const declaration = `This risk assessment has been conducted in accordance with BS EN IEC 62305-2:2024 by the assessor named herein. The assessment is based on information available at the time of the assessment. It is the responsibility of the building owner to ensure that any recommended protection measures are installed and maintained by a competent contractor.`;
    const decLines = pdf.splitTextToSize(declaration, CW - 8);
    pdf.text(decLines, ML + 4, y);
    y += decLines.length * 5.5 + 16;

    // Signature line
    hRule(y, DARK, 0.3);
    setFont(9, 'normal', GREY);
    pdf.text('Assessor Name: ' + (d.surveyorName || '________________________'), ML + 4, y + 8);
    pdf.text('Date: ' + (d.assessmentDate || '________________________'), ML + CW / 2 + 4, y + 8);

    // ── Save ──
    const datePart = d.assessmentDate ? d.assessmentDate.replace(/-/g, '') : 'undated';
    const refPart  = (d.structureRef || d.siteAddress || 'RA').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    pdf.save(`Risk_Assessment_${refPart}_${datePart}.pdf`);
}
