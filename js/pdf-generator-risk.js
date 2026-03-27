// ============================================================
// pdf-generator-risk.js
// BS EN IEC 62305-2:2024 — Risk Assessment PDF Generator
// UK National Annexes NB and NC applied
// ============================================================

function generateRiskAssessmentPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    const d = getRACalculationData();

    const BLUE  = [41, 128, 185];
    const DARK  = [44, 62, 80];
    const GREEN = [39, 174, 96];
    const RED   = [231, 76, 60];
    const LIGHT = [245, 247, 250];
    const WHITE = [255, 255, 255];
    const GREY  = [127, 140, 141];
    const LGREY = [200, 210, 220];
    const GOLD  = [211, 156, 25];

    const PW = 210;
    const PH = 297;
    const ML = 15;
    const MR = 15;
    const CW = PW - ML - MR;
    const PAGE_BOTTOM = PH - 20;

    // ── Strip all non-ASCII characters ──
    function safe(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/[^\x00-\x7F]/g, function(c) {
                const map = {
                    '\u00B2': '^2', '\u00B3': '^3', '\u00B9': '^1',
                    '\u2070': '^0', '\u2074': '^4', '\u2075': '^5',
                    '\u2076': '^6', '\u2077': '^7', '\u2078': '^8', '\u2079': '^9',
                    '\u207B': '^-', '\u00D7': 'x', '\u03C0': 'pi',
                    '\u2192': '->', '\u2264': '<=', '\u2265': '>=',
                    '\u2013': '-', '\u2014': '-',
                    '\u2018': "'", '\u2019': "'",
                    '\u201C': '"', '\u201D': '"',
                    '\u00E9': 'e', '\u00E8': 'e', '\u00EA': 'e',
                    '\u2081': '1', '\u2082': '2', '\u2083': '3',
                    '\u2084': '4', '\u2085': '5',
                    '\u00B0': ' deg', '\u2260': '!='
                };
                return map[c] || '?';
            });
    }

    function setFont(size, style, color) {
        pdf.setFontSize(size);
        pdf.setFont('helvetica', style || 'normal');
        pdf.setTextColor(...(color || DARK));
    }

    function fillRect(x, y, w, h, color) {
        pdf.setFillColor(...color);
        pdf.rect(x, y, w, h, 'F');
    }

    function hRule(y, color, thickness) {
        pdf.setDrawColor(...(color || LGREY));
        pdf.setLineWidth(thickness || 0.3);
        pdf.line(ML, y, PW - MR, y);
    }

    // Standard header — identical on all pages
    function addHeader(title) {
        fillRect(0, 0, PW, 3, BLUE);
        fillRect(0, 3, PW, 17, DARK);
        // Logo top-left
        addImageToPDF(pdf, COMPANY_LOGO_URL, ML, 4, 45, 14, true);
        // Title centre
        setFont(10, 'bold', WHITE);
        pdf.text(safe(title), PW / 2, 13, { align: 'center' });
        // Right label
        setFont(7, 'normal', LGREY);
        pdf.text('SITE ASSESSMENT DOCUMENT', PW - MR, 13, { align: 'right' });
        return 28;
    }

    function addFooter(pageNum, total) {
        fillRect(0, PH - 14, PW, 14, DARK);
        setFont(8, 'normal', WHITE);
        pdf.text('Strike Point Lightning Protection Ltd', ML, PH - 6);
        pdf.text('BS EN IEC 62305-2:2024', PW / 2, PH - 6, { align: 'center' });
        pdf.text('Page ' + pageNum + ' of ' + total, PW - MR, PH - 6, { align: 'right' });
    }

    function secHead(text, y) {
        fillRect(ML, y, CW, 8, BLUE);
        setFont(9, 'bold', WHITE);
        pdf.text(safe(text), ML + 3, y + 5.5);
        return y + 13;
    }

    function row2(label, value, y, shade) {
        if (y + 8 > PAGE_BOTTOM) return y; // overflow guard
        if (shade) fillRect(ML, y, CW, 7, LIGHT);
        setFont(8, 'bold', DARK);
        pdf.text(safe(label), ML + 2, y + 5);
        setFont(8, 'normal', DARK);
        const val = safe(String(value || '-'));
        const vLines = pdf.splitTextToSize(val, CW * 0.54);
        pdf.text(vLines[0], ML + CW * 0.44, y + 5);
        return y + 8;
    }

    function calcRow(label, value, y, shade) {
        if (y + 8 > PAGE_BOTTOM) return y;
        if (shade) fillRect(ML, y, CW, 7, LIGHT);
        setFont(8, 'normal', DARK);
        pdf.text(safe(label), ML + 2, y + 5);
        setFont(8, 'bold', BLUE);
        pdf.text(safe(String(value || '-')), PW - MR - 2, y + 5, { align: 'right' });
        return y + 8;
    }

    // Safe section heading with page break
    function safeSec(text, y, pageNum, total, contTitle) {
        if (y + 14 > PAGE_BOTTOM) {
            pdf.addPage();
            y = addHeader(contTitle || text + ' (CONTINUED)');
            addFooter(pageNum, total);
        }
        return secHead(text, y);
    }

    // Safe row with page break
    function safeRow(label, value, y, shade, pageNum, total, contTitle) {
        if (y + 8 > PAGE_BOTTOM) {
            pdf.addPage();
            y = addHeader(contTitle || 'CONTINUED');
            addFooter(pageNum, total);
        }
        return row2(label, value, y, shade);
    }

    const TOTAL_PAGES = 6;
    const isPass = d.passFail && d.passFail.toLowerCase().includes('pass');

    // ════════════════════════════════════════════════
    // PAGE 1 — COVER
    // ════════════════════════════════════════════════
    fillRect(0, 0, PW, 3, BLUE); // accent stripe
    fillRect(0, 3, PW, 17, DARK); // header bar (no text on cover)

    // Logo centred
    const logoHeight = addImageToPDF(pdf, COMPANY_LOGO_URL, 30, 20, 150, 60, true);
    const titleY = 20 + logoHeight + 10;

    // Title block
    fillRect(ML, titleY, CW, 34, DARK);
    setFont(16, 'bold', WHITE);
    pdf.text('LIGHTNING PROTECTION', PW / 2, titleY + 13, { align: 'center' });
    setFont(13, 'bold', GOLD);
    pdf.text('RISK ASSESSMENT REPORT', PW / 2, titleY + 25, { align: 'center' });

    // Standard badge
    fillRect(ML, titleY + 38, CW, 9, BLUE);
    setFont(8, 'bold', WHITE);
    pdf.text('BS EN IEC 62305-2:2024  |  Phase 1: R1 Loss of Human Life  |  UK National Annexes NB & NC',
        PW / 2, titleY + 44, { align: 'center' });

    // Info block
    fillRect(ML, titleY + 56, CW, 36, LIGHT);
    pdf.setDrawColor(...BLUE);
    pdf.setLineWidth(0.5);
    pdf.rect(ML, titleY + 56, CW, 36);
    setFont(8, 'bold', GREY);
    pdf.text('STRUCTURE REF', ML + 4, titleY + 64);
    pdf.text('DATE', ML + CW * 0.65, titleY + 64);
    setFont(10, 'normal', DARK);
    pdf.text(safe(d.structureRef || '-'), ML + 4, titleY + 73);
    const [yyyy, mm, dd2] = (d.assessmentDate || '').split('-');
    const coverDate = yyyy ? dd2 + '-' + mm + '-' + yyyy.slice(2) : '-';
    pdf.text(safe(coverDate), ML + CW * 0.65, titleY + 73);
    setFont(8, 'bold', GREY);
    pdf.text('SITE ADDRESS', ML + 4, titleY + 84);
    setFont(10, 'normal', DARK);
    const addrLines = pdf.splitTextToSize(safe(d.siteAddress || '-'), CW * 0.55);
    pdf.text(addrLines[0], ML + 4, titleY + 92);
    if (addrLines[1]) pdf.text(addrLines[1], ML + 4, titleY + 98);

    // Footer
    fillRect(0, PH - 14, PW, 14, DARK);
    setFont(8, 'normal', WHITE);
    pdf.text('Strike Point Lightning Protection Ltd', ML, PH - 6);
    pdf.text('BS EN IEC 62305-2:2024', PW / 2, PH - 6, { align: 'center' });
    pdf.text('Page 1 of ' + TOTAL_PAGES, PW - MR, PH - 6, { align: 'right' });

    // ════════════════════════════════════════════════
    // PAGE 2 — RISK ASSESSMENT SUMMARY
    // ════════════════════════════════════════════════
    pdf.addPage();
    let y = addHeader('RISK ASSESSMENT SUMMARY');
    addFooter(2, TOTAL_PAGES);

    // Pass/Fail banner
    fillRect(ML, y, CW, 14, isPass ? GREEN : RED);
    setFont(11, 'bold', WHITE);
    pdf.text(
        isPass ? 'PASS  -  Risk Acceptable. No LPS Required.'
               : 'FAIL  -  LPS Required. R1 exceeds tolerable limit.',
        PW / 2, y + 9.5, { align: 'center' }
    );
    y += 20;

    // Key values grid
    const colW3 = CW / 3;
    [
        ['Collection Area AD',          d.AD],
        ['Annual Dangerous Events ND',  d.ND],
        ['Tolerable Risk RT',           '1 x 10^-5 yr^-1'],
        ['Total Risk R1',               d.R1],
        ['NSG (strikes/km2/yr)',        d.nsg],
        ['Location Factor CD x CE',     d.cd + ' x ' + d.ce]
    ].forEach((item, i) => {
        const col = i % 3;
        const rw  = Math.floor(i / 3);
        const bx  = ML + col * colW3;
        const by  = y + rw * 26;
        fillRect(bx + 1, by, colW3 - 2, 23, LIGHT);
        setFont(7, 'normal', GREY);
        pdf.text(safe(item[0]), bx + colW3 / 2, by + 7, { align: 'center' });
        setFont(10, 'bold', BLUE);
        pdf.text(safe(String(item[1] || '-')), bx + colW3 / 2, by + 17, { align: 'center' });
    });
    y += 58;

    // Risk component breakdown table
    y = secHead('RISK COMPONENT BREAKDOWN', y);
    [
        ['RAT  -  Touch/Step voltage (LPZ 0A)',          d.RAT,  d.pctRAT],
        ['RB   -  Physical damage / fire (both zones)',  d.RB,   d.pctRB],
        ['RC   -  Internal systems failure (LPZ 1)',     d.RC,   d.pctRC],
        ['R1   -  TOTAL RISK',                           d.R1,   '100%'],
        ['RT   -  Tolerable limit',                      '1 x 10^-5', '-'],
        ['RESULT',                                       isPass ? 'PASS' : 'FAIL', '']
    ].forEach((r, i) => {
        const isLast = i === 5;
        const isTot  = i === 3;
        fillRect(ML, y, CW, 7, isLast ? (isPass ? GREEN : RED) : isTot ? BLUE : i % 2 === 0 ? LIGHT : WHITE);
        setFont(8, isTot || isLast ? 'bold' : 'normal', (isLast || isTot) ? WHITE : DARK);
        pdf.text(safe(r[0]), ML + 2, y + 5);
        pdf.text(safe(String(r[1])), ML + CW * 0.68, y + 5, { align: 'right' });
        pdf.text(safe(String(r[2])), PW - MR - 2, y + 5, { align: 'right' });
        y += 8;
    });
    y += 8;

    // LPL Recommendation
    if (!isPass) {
        y = secHead('LPS RECOMMENDATION', y);
        if (d.lplClass && d.lplClass !== 'N/A') {
            fillRect(ML, y, CW, 28, [240, 235, 235]);
            pdf.setDrawColor(...RED);
            pdf.setLineWidth(0.5);
            pdf.rect(ML, y, CW, 28);
            setFont(9, 'bold', DARK);
            pdf.text('Minimum Required LPS Class:', ML + 3, y + 8);
            setFont(14, 'bold', RED);
            pdf.text(safe(d.lplClass), ML + 60, y + 8);
            setFont(8, 'normal', DARK);
            pdf.text('R1 Achieved: ' + safe(d.lplR1Achieved || '-'), ML + 3, y + 17);
            setFont(7, 'normal', GREY);
            const spdLines = pdf.splitTextToSize('SPD Requirement: ' + safe(d.spdReq || '-'), CW - 6);
            pdf.text(spdLines[0], ML + 3, y + 24);
            y += 34;
        } else {
            fillRect(ML, y, CW, 14, [80, 50, 0]);
            setFont(8, 'bold', GOLD);
            pdf.text('Risk cannot be reduced to tolerable level by structural LPS alone.', ML + 3, y + 6);
            setFont(7, 'normal', WHITE);
            pdf.text('Consider a Thunderstorm Warning System (TWS) per IEC 62793.', ML + 3, y + 11);
            y += 18;
        }
    }

    // ════════════════════════════════════════════════
    // PAGE 3 — STRUCTURE & ZONE DETAILS
    // ════════════════════════════════════════════════
    pdf.addPage();
    y = addHeader('STRUCTURE & ZONE DETAILS');
    addFooter(3, TOTAL_PAGES);

    const P3 = 3;
    const P3T = 'STRUCTURE & ZONE DETAILS (CONTINUED)';

    y = safeSec('SITE & STRUCTURE', y, P3, TOTAL_PAGES, P3T);
    [
        ['Site Address',    d.siteAddress],
        ['Structure Ref',   d.structureRef],
        ['Structure Type',  d.structureType],
        ['Assessor',        d.surveyorName],
        ['Assessment Date', d.assessmentDate]
    ].forEach((r, i) => { y = safeRow(r[0], r[1], y, i % 2 === 0, P3, TOTAL_PAGES, P3T); });
    y += 4;

    y = safeSec('STRUCTURE DIMENSIONS', y, P3, TOTAL_PAGES, P3T);
    [
        ['Height H',           d.H + ' m'],
        ['Length L',           d.L + ' m'],
        ['Width W',            d.W + ' m'],
        ['Collection Area AD', d.AD + '  [Clause A.2.1.2 — 2024: L x W + 2x(3H)x(L+W) + pi x (3H)^2]']
    ].forEach((r, i) => { y = safeRow(r[0], r[1], y, i % 2 === 0, P3, TOTAL_PAGES, P3T); });
    y += 4;

    y = safeSec('LOCATION & ENVIRONMENT', y, P3, TOTAL_PAGES, P3T);
    [
        ['UK Region',                      d.ukRegion],
        ['NSG (strikes/km2/yr)',            d.nsg],
        ['Location Factor CD  (Table A.1)', d.cd],
        ['Environment Factor CE  (Table A.4)', d.ce + '  (' + d.ceLabel + ')'],
        ['Annual Dangerous Events ND',      d.ND + '  [ND = NSG x AD x CD x CE x 10^-6]']
    ].forEach((r, i) => { y = safeRow(r[0], r[1], y, i % 2 === 0, P3, TOTAL_PAGES, P3T); });
    y += 4;

    y = safeSec('LPZ 0A  -  EXTERNAL ZONE', y, P3, TOTAL_PAGES, P3T);
    [
        ['Persons in zone (nz)',                      d.lpz0aNz],
        ['Total persons (nt)',                        d.totalPersons],
        ['Surface type (rt)  Table NB.2',             d.lpz0aSurface],
        ['Structure material (PS)  Table NB.4',       d.lpz0aPsType],
        ['Existing LPS (PLPS)  Table NB.3',           d.lpz0aLps],
        ['Touch/step protection (Pam)  Table NB.1',   d.lpz0aPam],
        ['TWS installed',                              d.lpz0aTws],
        ['Fire provisions (rp)  LPZ 0A',              'rp = 1.0 (fixed — external zone)'],
        ['Loss factor LT  Table NC.2',                'LT = 10^-2 (fixed per 2024 standard)']
    ].forEach((r, i) => { y = safeRow(r[0], r[1], y, i % 2 === 0, P3, TOTAL_PAGES, P3T); });
    y += 4;

    y = safeSec('LPZ 1  -  INTERNAL ZONE', y, P3, TOTAL_PAGES, P3T);
    [
        ['Persons in zone (nz)',                    d.lpz1Nz || (d.totalPersons + ' (= nt)')],
        ['Fire risk level (rf)  Table NB.6',        d.lpz1FireRisk],
        ['Fire provisions (rp)  Table NB.5',        d.lpz1FireProv],
        ['Structure material (PS)  Table NB.4',     d.lpz1PsType],
        ['Existing LPS (PLPS)  Table NB.3',         d.lpz1Lps],
        ['LF1 — Loss from fire/explosion  NC.2',    d.lpz1LF1],
        ['LO1 — Loss from internal systems  NC.2',  d.lpz1LO1],
        ['Internal systems enabled (RC)',            d.internalSystems],
        ['SPD protection (PSPD)  Table NB.7',       d.lpz1Spd]
    ].forEach((r, i) => { y = safeRow(r[0], r[1], y, i % 2 === 0, P3, TOTAL_PAGES, P3T); });

    // ════════════════════════════════════════════════
    // PAGE 4 — CALCULATION BREAKDOWN
    // ════════════════════════════════════════════════
    pdf.addPage();
    y = addHeader('CALCULATION BREAKDOWN');
    addFooter(4, TOTAL_PAGES);

    y = secHead('ANNUAL DANGEROUS EVENTS (ND)  -  CLAUSE A.2.4', y);
    y = calcRow('AD = L x W + 2 x (3H) x (L+W) + pi x (3H)^2   [Clause A.2.1.2 - 2024]', d.AD, y, false);
    y = calcRow('ND = NSG x AD x CD x CE x 10^-6   [Clause A.2.4 + Table A.4]', d.ND, y, true);
    y += 4;

    y = secHead('RAT  -  TOUCH/STEP VOLTAGE RISK (LPZ 0A)  -  CLAUSE NB.2', y);
    y = calcRow('PAT = PLPS x Pam x rt x PTWS   (Equation NB.2)', '-', y, false);
    y = calcRow('LT = 10^-2 fixed   (Table NC.2 / C.2 - 2024)', '1x10^-2', y, true);
    y = calcRow('LAT = LT   (Table NC.1)', '-', y, false);
    y = calcRow('RAT = ND x PAT x LT x (nz/nt)', d.RAT, y, true);
    y += 4;

    y = secHead('RB  -  PHYSICAL DAMAGE / FIRE RISK (BOTH ZONES)  -  CLAUSE NB.4', y);
    y = calcRow('PB0 = PS x PLPS x rf x 1.0   LPZ 0A: rp fixed = 1.0 (external zone)', '-', y, false);
    y = calcRow('PB1 = PS x PLPS x rf x rp   LPZ 1: rp from Table NB.5', '-', y, true);
    y = calcRow('LB1 = LF1 x (nz/nt)   (Table NC.1: LB1 = LF1)', '-', y, false);
    y = calcRow('RB = ND x (PB0 x LB1_0 + PB1 x LB1_1)   (LPZ 0A + LPZ 1)', d.RB, y, true);
    y += 4;

    y = secHead('RC  -  INTERNAL SYSTEM FAILURE RISK (LPZ 1)  -  CLAUSE NB.5', y);
    y = calcRow('PC = PSPD x CLD   (CLD = 1 Phase 1)   (Equation NB.5)',
        d.internalSystems === 'Yes' ? '(calculated)' : 'DISABLED', y, false);
    y = calcRow('LC1 = LO1 x (nz/nt)   (Table NC.1: LC1 = LO1)', '-', y, true);
    y = calcRow('RC = ND x PC x LC1', d.RC, y, false);
    y += 4;

    y = secHead('R1 TOTAL  -  SUMMARY', y);
    [
        ['RAT  (LPZ 0A, touch/step)',          d.RAT,         d.pctRAT],
        ['RB   (both zones, physical damage)',  d.RB,          d.pctRB],
        ['RC   (LPZ 1, internal systems)',      d.RC,          d.pctRC],
        ['R1   TOTAL',                          d.R1,          '100%'],
        ['RT   Tolerable limit',                '1 x 10^-5',   '-'],
        ['RESULT',                              isPass ? 'PASS' : 'FAIL', '']
    ].forEach((r, i) => {
        const isLast = i === 5;
        const isTot  = i === 3;
        fillRect(ML, y, CW, 7, isLast ? (isPass ? GREEN : RED) : isTot ? BLUE : i % 2 === 0 ? LIGHT : WHITE);
        setFont(8, isTot || isLast ? 'bold' : 'normal', (isLast || isTot) ? WHITE : DARK);
        pdf.text(safe(r[0]), ML + 2, y + 5);
        pdf.text(safe(String(r[1])), ML + CW * 0.68, y + 5, { align: 'right' });
        pdf.text(safe(String(r[2])), PW - MR - 2, y + 5, { align: 'right' });
        y += 8;
    });

    // ════════════════════════════════════════════════
    // PAGE 5 — METHODOLOGY
    // ════════════════════════════════════════════════
    pdf.addPage();
    y = addHeader('RISK ASSESSMENT METHODOLOGY');
    addFooter(5, TOTAL_PAGES);

    const methodSections = [
        {
            heading: 'STANDARD REFERENCE',
            body: 'This assessment has been conducted in accordance with BS EN IEC 62305-2:2024 "Protection against lightning - Part 2: Risk management." UK National Annexes NB and NC have been applied throughout in preference to the IEC Annexes B and C, as required by the UK committee (BSI GEL/81).'
        },
        {
            heading: 'SCOPE  -  PHASE 1',
            body: 'Phase 1 evaluates R1 (Risk of Loss of Human Life) for a standalone structure with two protection zones: LPZ 0A (external/unshielded) and LPZ 1 (internal). Source S1 (flashes to structure) only. Connected lines (S3/S4, sources RU/RV/RW/RZ), R2-R4 risk components, and additional LPZ analysis are planned for Phase 2.'
        },
        {
            heading: 'COLLECTION AREA  -  CLAUSE A.2.1.2 (2024 EDITION)',
            body: 'AD = L x W + 2 x (3H) x (L+W) + pi x (3H)^2\n\nThe 2024 edition uses 3H for the rolling sphere method, replacing H used in the 2012 edition. This gives a significantly larger collection area and a more conservative risk result.'
        },
        {
            heading: 'ANNUAL DANGEROUS EVENTS  -  CLAUSE A.2.4',
            body: 'ND = NSG x AD x CD x CE x 10^-6\n\nWhere: NSG = Ground strike-point density (Annex NG.2, UK data 2013-2022)  |  CD = Location factor (Table A.1)  |  CE = Environmental factor (Table A.4). Note: CE applies to sources S3/S4 (flashes near a line) and reduces ND to reflect shielding by surrounding structures. For Source S1 only assessments, CE = 1 (Rural) is conservative.'
        },
        {
            heading: 'RISK COMPONENTS  -  SOURCE S1 ONLY',
            body: 'RAT = ND x PAT x LT x (nz/nt)    Touch/step voltage injury, LPZ 0A only\nRB  = ND x PB  x LB1             Physical damage and fire injury, both zones\nRC  = ND x PC  x LC1             Internal systems failure injury, LPZ 1 only (if enabled)\nR1  = RAT + RB + RC              Total risk of loss of human life'
        },
        {
            heading: 'KEY PROBABILITY FACTORS',
            body: 'PAT = PLPS x Pam x rt x PTWS   (Equation NB.2)\nPB  = PS x PLPS x rf x rp       (Equation NB.4)\nPC  = PSPD x CLD                 (Equation NB.5, CLD = 1 for Phase 1)\n\nNote: For LPZ 0A, rp = 1.0 is fixed (no fire provisions applicable to external zone). rf is a property of the structure and is shared across both zones.'
        },
        {
            heading: 'LOSS VALUES  -  TABLE NC.2 (UK NATIONAL ANNEX)',
            body: 'LT  = 10^-2 fixed for all structure types (2024 change from 2012)\nLF1 = Persons injured by fire/explosion — selected per occupancy type\nLO1 = Persons injured by internal systems failure — 0 for most structures; non-zero only for explosion risk or specific hospital/industrial occupancies\n\nTable NC.1: LAT = LUT = LT  |  LB1 = LV1 = LF1  |  LC1 = LM1 = LW1 = LZ1 = LO1'
        },
        {
            heading: 'ENVIRONMENTAL FACTOR CE  -  TABLE A.4',
            body: 'Rural = 1.0  |  Suburban = 0.5  |  Urban = 0.1  |  Urban with buildings >20m = 0.01\n\nNOTE 6 (Table A.4): CE reduces the number of dangerous events caused by sources S3 and S4 due to the protection of surrounding structures. For a standalone structure Phase 1 assessment (S1 only), CE has less significance but should still be set correctly for completeness.'
        },
        {
            heading: 'TOLERABLE RISK  -  CLAUSE 7.3',
            body: 'RT = 1 x 10^-5 per year (loss of human life)\n\nIf R1 <= RT the risk of loss of human life is acceptable. If R1 > RT, lightning protection measures are required to reduce R1 to or below RT.'
        },
        {
            heading: 'LPS RECOMMENDATION LOGIC',
            body: 'When R1 > RT, the tool iterates through LPS classes: Class IV -> Class III -> Class II -> Class I. For each class, the corresponding PLPS value from Table NB.3 is applied and R1 is recalculated. The SPD level is matched to the recommended LPS class per Table NB.7. The lowest (least stringent) LPS class achieving R1 <= RT is recommended.'
        },
        {
            heading: 'TABLE SOURCES  -  BS EN IEC 62305-2:2024 UK NATIONAL ANNEXES',
            body: 'Table NB.1  -  Pam: Touch/step protection factor\nTable NB.2  -  rt:  Surface type factor\nTable NB.3  -  PLPS: Existing LPS protection probability\nTable NB.4  -  PS:  Structure material probability (simplified UK values)\nTable NB.5  -  rp:  Fire provisions reduction factor\nTable NB.6  -  rf:  Fire/explosion risk reduction factor\nTable NB.7  -  PSPD: SPD protection factor (low-voltage system)\nTable NC.1  -  Loss value assignments per zone\nTable NC.2  -  LT, LF1, LO1: Typical mean loss values per occupancy\nTable A.1   -  CD: Location factor\nTable A.4   -  CE: Environmental factor\nAnnex NG.2  -  NSG: UK ground strike density (ATDnet/Meteorage 2013-2022, k=1.7)'
        }
    ];

    methodSections.forEach(section => {
        if (y + 14 > PAGE_BOTTOM) {
            pdf.addPage();
            y = addHeader('RISK ASSESSMENT METHODOLOGY (CONTINUED)');
            addFooter(5, TOTAL_PAGES);
        }
        y = secHead(section.heading, y);
        setFont(8, 'normal', DARK);
        const lines = pdf.splitTextToSize(section.body, CW - 6);
        lines.forEach(line => {
            if (y + 6 > PAGE_BOTTOM) {
                pdf.addPage();
                y = addHeader('RISK ASSESSMENT METHODOLOGY (CONTINUED)');
                addFooter(5, TOTAL_PAGES);
                setFont(8, 'normal', DARK);
            }
            pdf.text(line, ML + 3, y);
            y += 5.5;
        });
        y += 5;
    });

    // ════════════════════════════════════════════════
    // PAGE 6 — COMMENTS & RECOMMENDATIONS
    // ════════════════════════════════════════════════
    pdf.addPage();
    y = addHeader('ASSESSOR COMMENTS & RECOMMENDATIONS');
    addFooter(6, TOTAL_PAGES);

    y = secHead('ASSESSOR COMMENTS', y);
    if (d.comments && d.comments.trim()) {
        setFont(9, 'normal', DARK);
        const commentLines = pdf.splitTextToSize(safe(d.comments), CW - 6);
        commentLines.forEach(line => {
            if (y + 6 > PAGE_BOTTOM) {
                pdf.addPage();
                y = addHeader('ASSESSOR COMMENTS (CONTINUED)');
                addFooter(6, TOTAL_PAGES);
                setFont(9, 'normal', DARK);
            }
            pdf.text(line, ML + 3, y);
            y += 5.5;
        });
        y += 8;
    } else {
        setFont(9, 'italic', GREY);
        pdf.text('No comments provided.', ML + 3, y);
        y += 12;
    }

    y += 4;
    y = secHead('DECLARATION', y);
    setFont(8, 'normal', DARK);
    const declaration =
        'This risk assessment has been conducted in accordance with BS EN IEC 62305-2:2024 ' +
        '(UK National Annexes NB and NC) by the assessor named herein. The assessment is based ' +
        'on information available at the time of assessment. It is the responsibility of the ' +
        'building owner to ensure that any recommended protection measures are installed and ' +
        'maintained by a competent contractor in accordance with BS EN IEC 62305-3:2024 ' +
        '(design and installation) and BS EN IEC 62305-4:2024 (electrical and electronic ' +
        'systems within structures).';
    const decLines = pdf.splitTextToSize(declaration, CW - 6);
    pdf.text(decLines, ML + 3, y);
    y += decLines.length * 5.5 + 14;

    hRule(y, LGREY, 0.4);
    y += 8;
    setFont(8, 'normal', DARK);
    const [syyyy, smm, sdd] = (d.assessmentDate || '').split('-');
    const sigDate = syyyy ? sdd + '-' + smm + '-' + syyyy.slice(2) : '_______________';
    pdf.text('Assessor Name: ' + safe(d.surveyorName || '_________________________'), ML + 2, y);
    pdf.text('Date: ' + safe(sigDate), ML + CW * 0.55, y);
    y += 12;
    hRule(y, LGREY, 0.4);
    y += 8;
    setFont(8, 'normal', GREY);
    pdf.text('Signature: _____________________________________________', ML + 2, y);

    // ── Save ──
    const datePart = syyyy ? sdd + '-' + smm + '-' + syyyy.slice(2) : 'undated';
    const sitePart = (d.siteAddress || 'Unknown')
        .replace(/[^a-zA-Z0-9 ]/g, '').trim().substring(0, 40);
    pdf.save('LPRA - ' + sitePart + ' ' + datePart + '.pdf');
}
