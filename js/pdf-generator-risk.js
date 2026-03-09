// ============================================================
// pdf-generator-risk.js
// BS EN IEC 62305-2:2024 — Risk Assessment PDF Generator
// 6-page report: Cover | Summary | Zone Details | Calc Breakdown | Methodology | Comments
// ============================================================

async function generateRiskAssessmentPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    const d = getRACalculationData();

    // ── Fetch logo as base64 ──
    let logoBase64 = null;
    try {
        const resp = await fetch('https://raw.githubusercontent.com/SPLP-2023/tool/refs/heads/main/assets/Color%20logo%20-%20no%20background%20(px%20reduction).png');
        const blob = await resp.blob();
        logoBase64 = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(r.result);
            r.onerror = rej;
            r.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn('Logo fetch failed:', e);
    }

    const BLUE   = [41, 128, 185];
    const DARK   = [44, 62, 80];
    const GREEN  = [39, 174, 96];
    const RED    = [231, 76, 60];
    const LIGHT  = [245, 247, 250];
    const WHITE  = [255, 255, 255];
    const GREY   = [127, 140, 141];
    const LGREY  = [200, 210, 220];
    const GOLD   = [211, 156, 25];

    const PW = 210;
    const PH = 297;
    const ML = 15;
    const MR = 15;
    const CW = PW - ML - MR;
    const PAGE_BOTTOM = PH - 20;

    // ── jsPDF-safe: strip/replace all non-ASCII chars ──
    function safe(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/R[\u2081\u2082]/g,  'R1')
            .replace(/N[\u2082]/g,        'N2')
            .replace(/[\u2080-\u2089]/g,  c => String(c.charCodeAt(0) - 0x2080))
            .replace(/10[\u207B][\u2075]/g, '10^-5')
            .replace(/10[\u207B][\u2076]/g, '10^-6')
            .replace(/[\u207B]/g,   '^-')
            .replace(/[\u00B2]/g,   '^2')
            .replace(/[\u00B3]/g,   '^3')
            .replace(/[\u2074-\u2079]/g, c => String(c.charCodeAt(0) - 0x2070))
            .replace(/[\u03C0]/g,   'pi')
            .replace(/[\u00D7]/g,   'x')
            .replace(/[\u2192]/g,   '->')
            .replace(/[\u2264]/g,   '<=')
            .replace(/[\u2265]/g,   '>=')
            .replace(/[\u2013\u2014]/g, '-')
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/[\u201C\u201D]/g, '"')
            .replace(/[\u00E9\u00E8\u00EA]/g, 'e')
            .replace(/[^\x00-\x7F]/g, '?');
    }

    // ── Helpers ──
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

    // Standard header — all pages including cover
    function addHeader(title) {
        fillRect(0, 0, PW, 20, DARK);
        setFont(11, 'bold', BLUE);
        pdf.text('STRIKE POINT', ML, 8);
        setFont(8, 'normal', LGREY);
        pdf.text('Lightning Protection Ltd', ML, 14.5);
        setFont(10, 'bold', WHITE);
        pdf.text(safe(title), PW / 2, 12, { align: 'center' });
        setFont(7, 'normal', LGREY);
        pdf.text('CONFIDENTIAL - SITE ASSESSMENT DOCUMENT', PW - MR, 12, { align: 'right' });
        return 28; // extra clearance below header
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
        if (shade) fillRect(ML, y, CW, 7, LIGHT);
        setFont(8, 'normal', DARK);
        pdf.text(safe(label), ML + 2, y + 5);
        setFont(8, 'bold', BLUE);
        pdf.text(safe(String(value || '-')), PW - MR - 2, y + 5, { align: 'right' });
        return y + 8;
    }

    const TOTAL_PAGES = 6;
    const isPass = d.passFail && d.passFail.toLowerCase().includes('pass');

    // ════════════════════════════════════════════════
    // PAGE 1 — COVER
    // White background, accent stripe, logo, title, badge, site address, date
    // ════════════════════════════════════════════════

    // Top accent stripe
    fillRect(0, 0, PW, 3, BLUE);

    // Standard header bar (dark, matches all other pages)
    fillRect(0, 3, PW, 17, DARK);
    setFont(10, 'bold', BLUE);
    pdf.text('STRIKE POINT', ML, 12);
    setFont(8, 'normal', LGREY);
    pdf.text('Lightning Protection Ltd', ML, 17.5);
    setFont(10, 'bold', WHITE);
    pdf.text('RISK ASSESSMENT REPORT', PW / 2, 13, { align: 'center' });
    setFont(7, 'normal', LGREY);
    pdf.text('CONFIDENTIAL - SITE ASSESSMENT DOCUMENT', PW - MR, 13, { align: 'right' });

    // Logo — centred, large
    if (logoBase64) {
        const logoW = 100;
        const logoH = 40; // maintain approx aspect ratio
        pdf.addImage(logoBase64, 'PNG', (PW - logoW) / 2, 32, logoW, logoH);
    } else {
        // Fallback text if logo fails to load
        setFont(22, 'bold', BLUE);
        pdf.text('STRIKE POINT', PW / 2, 52, { align: 'center' });
        setFont(10, 'normal', GREY);
        pdf.text('Lightning Protection Ltd', PW / 2, 62, { align: 'center' });
    }

    // Title block
    fillRect(ML, 82, CW, 34, DARK);
    setFont(16, 'bold', WHITE);
    pdf.text('LIGHTNING PROTECTION', PW / 2, 95, { align: 'center' });
    setFont(13, 'bold', GOLD);
    pdf.text('RISK ASSESSMENT REPORT', PW / 2, 107, { align: 'center' });

    // Standard badge
    fillRect(ML, 120, CW, 9, BLUE);
    setFont(8, 'bold', WHITE);
    pdf.text('BS EN IEC 62305-2:2024  |  Phase 1: R1 Loss of Human Life', PW / 2, 126, { align: 'center' });

    // Site address & date info block
    fillRect(ML, 138, CW, 26, LIGHT);
    pdf.setDrawColor(...BLUE);
    pdf.setLineWidth(0.5);
    pdf.rect(ML, 138, CW, 26);
    setFont(8, 'bold', GREY);
    pdf.text('SITE ADDRESS', ML + 4, 146);
    pdf.text('DATE', ML + CW * 0.65, 146);
    setFont(10, 'normal', DARK);
    const addrLines = pdf.splitTextToSize(safe(d.siteAddress || '-'), CW * 0.55);
    pdf.text(addrLines[0], ML + 4, 155);
    if (addrLines[1]) pdf.text(addrLines[1], ML + 4, 161);
    pdf.text(safe(d.assessmentDate || '-'), ML + CW * 0.65, 155);

    // Standard footer bar
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

    fillRect(ML, y, CW, 14, isPass ? GREEN : RED);
    setFont(11, 'bold', WHITE);
    pdf.text(
        isPass ? 'PASS  -  Risk Acceptable. No LPS Required.'
               : 'FAIL  -  LPS Required. R1 exceeds tolerable limit.',
        PW / 2, y + 9.5, { align: 'center' }
    );
    y += 20;

    // 3-column key values
    const colW3 = CW / 3;
    [
        ['Collection Area AD',         d.AD],
        ['Annual Dangerous Events ND', d.ND],
        ['Tolerable Risk RT',          '1 x 10^-5 yr^-1'],
        ['Total Risk R1',              d.R1],
        ['NSG (strikes/km2/yr)',       d.nsg],
        ['Location Factor CD',         d.cd]
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

    y = secHead('RISK COMPONENT BREAKDOWN', y);
    [
        ['RAT  -  Touch/Step voltage (LPZ 0A)',         d.RAT, d.pctRAT],
        ['RB   -  Physical damage / fire (both zones)', d.RB,  d.pctRB],
        ['RC   -  Internal systems failure (LPZ 1)',    d.RC,  d.pctRC],
        ['R1   -  TOTAL RISK',                          d.R1,  '100%'],
        ['RT   -  Tolerable limit',                     '1 x 10^-5', '-'],
        ['RESULT',                                      isPass ? 'PASS' : 'FAIL', '']
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

    if (!isPass) {
        y = secHead('LPL RECOMMENDATION', y);
        if (d.lplClass && d.lplClass !== 'N/A') {
            fillRect(ML, y, CW, 24, [240, 235, 235]);
            setFont(9, 'bold', DARK);
            pdf.text('Minimum Required LPS:', ML + 3, y + 8);
            setFont(14, 'bold', RED);
            pdf.text(safe(d.lplClass), ML + 56, y + 8);
            setFont(8, 'normal', DARK);
            pdf.text('R1 Achieved: ' + safe(d.lplR1Achieved || '-'), ML + 3, y + 16);
            setFont(7, 'normal', GREY);
            const spdSafe = safe(d.spdReq || '-');
            const spdLines = pdf.splitTextToSize('SPD Requirement: ' + spdSafe, CW - 6);
            pdf.text(spdLines[0], ML + 3, y + 22);
            y += 30;
        } else {
            fillRect(ML, y, CW, 12, [80, 60, 0]);
            setFont(8, 'bold', GOLD);
            pdf.text('Risk cannot be reduced to tolerable level by structural LPS alone.', ML + 3, y + 5);
            setFont(7, 'normal', WHITE);
            pdf.text('Consider Thunderstorm Warning System (TWS) per IEC 62793.', ML + 3, y + 10);
            y += 16;
        }
    }

    // ════════════════════════════════════════════════
    // PAGE 3 — STRUCTURE & ZONE DETAILS
    // ════════════════════════════════════════════════
    pdf.addPage();
    y = addHeader('STRUCTURE & ZONE DETAILS');
    addFooter(3, TOTAL_PAGES);

    // Safe row with page-break check
    function safeRow(label, value, y, shade) {
        if (y + 8 > PAGE_BOTTOM) {
            pdf.addPage();
            y = addHeader('STRUCTURE & ZONE DETAILS (CONTINUED)');
            addFooter(3, TOTAL_PAGES);
        }
        return row2(label, value, y, shade);
    }

    // Safe section heading with page-break check
    function safeSec(text, y) {
        if (y + 14 > PAGE_BOTTOM) {
            pdf.addPage();
            y = addHeader('STRUCTURE & ZONE DETAILS (CONTINUED)');
            addFooter(3, TOTAL_PAGES);
        }
        return secHead(text, y);
    }

    y = safeSec('SITE & STRUCTURE', y);
    [
        ['Site Address',    d.siteAddress],
        ['Structure Ref',   d.structureRef],
        ['Structure Type',  d.structureType],
        ['Assessor',        d.surveyorName],
        ['Assessment Date', d.assessmentDate]
    ].forEach((r, i) => { y = safeRow(r[0], r[1], y, i % 2 === 0); });
    y += 4;

    y = safeSec('STRUCTURE DIMENSIONS', y);
    [
        ['Height H', d.H + ' m'],
        ['Length L', d.L + ' m'],
        ['Width W',  d.W + ' m'],
        ['Collection Area AD', d.AD]
    ].forEach((r, i) => { y = safeRow(r[0], r[1], y, i % 2 === 0); });
    y += 4;

    y = safeSec('LOCATION & ENVIRONMENT', y);
    [
        ['UK Region',                    d.ukRegion],
        ['NSG (strikes/km2/yr)',         d.nsg],
        ['Location Factor CD',           d.cd],
        ['Annual Dangerous Events ND',   d.ND]
    ].forEach((r, i) => { y = safeRow(r[0], r[1], y, i % 2 === 0); });
    y += 4;

    y = safeSec('LPZ 0A  -  EXTERNAL ZONE', y);
    [
        ['Persons in zone (nz)',                    d.lpz0aNz],
        ['Total persons (nt)',                      d.totalPersons],
        ['Surface type (rt)  Table B.2',            d.lpz0aSurface],
        ['Structure material (PS)  Table B.4',      d.lpz0aPsType],
        ['Existing LPS (PLPS)  Table B.3',          d.lpz0aLps],
        ['Touch/step protection (Pam)  Table B.1',  d.lpz0aPam],
        ['TWS installed',                            d.lpz0aTws]
    ].forEach((r, i) => { y = safeRow(r[0], r[1], y, i % 2 === 0); });
    y += 4;

    y = safeSec('LPZ 1  -  INTERNAL ZONE', y);
    [
        ['Persons in zone (nz)',                    d.lpz1Nz || (d.totalPersons + ' (= nt)')],
        ['Fire risk level (rf)  Table B.6',         d.lpz1FireRisk],
        ['Fire provisions (rp)  Table B.5',         d.lpz1FireProv],
        ['Structure material (PS)  Table B.4',      d.lpz1PsType],
        ['Existing LPS (PLPS)  Table B.3',          d.lpz1Lps],
        ['Loss category  Table C.2',                d.lpz1LossCat],
        ['Internal systems enabled (RC)',            d.internalSystems]
    ].forEach((r, i) => { y = safeRow(r[0], r[1], y, i % 2 === 0); });

    // ════════════════════════════════════════════════
    // PAGE 4 — CALCULATION BREAKDOWN
    // ════════════════════════════════════════════════
    pdf.addPage();
    y = addHeader('CALCULATION BREAKDOWN');
    addFooter(4, TOTAL_PAGES);

    y = secHead('ANNUAL DANGEROUS EVENTS (ND)', y);
    y = calcRow('AD = L x W + 2 x (3H) x (L+W) + pi x (3H)^2   [Clause A.2.1.2 - 2024]', d.AD, y, false);
    y = calcRow('ND = NSG x AD x CD x 10^-6   [Clause A.2.4]', d.ND, y, true);
    y += 4;

    y = secHead('RAT  -  TOUCH/STEP VOLTAGE RISK (LPZ 0A)', y);
    y = calcRow('PAT = Pam x rt   (touch/step probability)', '-', y, false);
    y = calcRow('LT = (nz/nt) x (tz/8760)   (loss factor)', '-', y, true);
    y = calcRow('PP = tz/8760   (time factor)', '-', y, false);
    y = calcRow('RAT = ND x PAT x LT   [Clause B.2]', d.RAT, y, true);
    y += 4;

    y = secHead('RB  -  PHYSICAL DAMAGE / FIRE RISK (BOTH ZONES)', y);
    y = calcRow('PB = PS x PLPS x rf x rp   (per zone)  [Clause B.4]', '-', y, false);
    y = calcRow('LB1 = LF1 x (nz/nt)   (fire loss factor from Table C.2)', '-', y, true);
    y = calcRow('RB = ND x PB x LB1   (LPZ 0A + LPZ 1 summed)', d.RB, y, false);
    y += 4;

    y = secHead('RC  -  INTERNAL SYSTEM FAILURE RISK (LPZ 1)', y);
    y = calcRow('PC = PSPD x CLD   (CLD = 1 for Phase 1)  [Clause B.5]',
        d.internalSystems === 'Yes' ? '(calculated)' : 'DISABLED', y, false);
    y = calcRow('LC1 = LO1 x (nz/nt)   (loss factor from Table C.2)', '-', y, true);
    y = calcRow('RC = ND x PC x LC1', d.RC, y, false);
    y += 4;

    y = secHead('R1 TOTAL  -  SUMMARY', y);
    [
        ['RAT  (LPZ 0A touch/step)',          d.RAT,          d.pctRAT],
        ['RB   (both zones, physical damage)', d.RB,           d.pctRB],
        ['RC   (LPZ 1, internal systems)',     d.RC,           d.pctRC],
        ['R1   TOTAL',                         d.R1,           '100%'],
        ['RT   Tolerable limit',               '1 x 10^-5',    '-'],
        ['RESULT',                             isPass ? 'PASS' : 'FAIL', '']
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
            body: 'This assessment has been conducted in strict accordance with BS EN IEC 62305-2:2024 "Protection against lightning - Part 2: Risk management." All table values, formulae, and risk limits are taken directly from the 2024 edition of the standard.'
        },
        {
            heading: 'SCOPE  -  PHASE 1',
            body: 'Phase 1 evaluates R1 (Risk of Loss of Human Life) for a standalone structure with two protection zones: LPZ 0A (external/unshielded) and LPZ 1 (internal). Source S1 (flashes to structure) only. Connected lines (S3/S4), R2-R4 components, and additional LPZ analysis are planned for Phase 2.'
        },
        {
            heading: 'COLLECTION AREA  -  CLAUSE A.2.1.2 (2024 EDITION)',
            body: 'AD = L x W + 2 x (3H) x (L+W) + pi x (3H)^2\n\nThe 2024 standard uses 3H (not H as in the 2012 edition) for the rolling sphere method, giving a larger collection area and therefore a more conservative risk result.'
        },
        {
            heading: 'ANNUAL DANGEROUS EVENTS  -  CLAUSE A.2.4',
            body: 'ND = NSG x AD x CD x 10^-6\n\nWhere: NSG = Ground flash density (strikes/km2/yr)  |  AD = Collection area (m2)  |  CD = Location factor (Table A.1)'
        },
        {
            heading: 'RISK COMPONENTS',
            body: 'RAT = ND x PAT x LT    Touch/step voltage injury, LPZ 0A only\nRB  = ND x PB  x LB1   Physical damage and fire injury, both zones\nRC  = ND x PC  x LC1   Internal systems failure injury, LPZ 1 only (if enabled)\nR1  = RAT + RB + RC    Total risk of loss of human life'
        },
        {
            heading: 'TABLE SOURCES  -  BS EN IEC 62305-2:2024',
            body: 'Table B.1  -  Touch/step protection factor (Pam)\nTable B.2  -  Surface type factor (rt)\nTable B.3  -  Existing LPS probability (PLPS)\nTable B.4  -  Structure type factor (PS)\nTable B.5  -  Fire provisions factor (rp)\nTable B.6  -  Fire risk level (rf)\nTable B.7  -  SPD protection factor (PSPD)\nTable C.2  -  Loss category (LF1, LO1)\nAnnex NG.2 -  UK NSG regional values (ATDnet/Meteorage 2013-2022)'
        },
        {
            heading: 'TOLERABLE RISK',
            body: 'RT = 1 x 10^-5 per year  (Clause 2, BS EN IEC 62305-2:2024)\n\nIf R1 <= RT the structure has an acceptable risk of loss of human life from lightning. If R1 > RT, a lightning protection system is required.'
        },
        {
            heading: 'LPL RECOMMENDATION LOGIC',
            body: 'When R1 > RT, the tool iterates through LPL classes in order: LPL IV -> LPL III -> LPL II -> LPL I. For each class, the corresponding PLPS value from Table B.3 is applied and R1 is recalculated. The lowest LPL class that achieves R1 <= RT is recommended. SPD requirements are taken from Table B.7.'
        },
        {
            heading: 'SPD REQUIREMENTS  -  TABLE B.7',
            body: 'No SPDs:         PSPD = 1.00\nLPL III-IV SPDs: PSPD = 0.05  |  S1 Resistive: 12.5 kA  |  S1 Inductive: 0.3 kA   |  S3: 5 kA\nLPL II SPDs:     PSPD = 0.02  |  S1 Resistive: 18.75 kA |  S1 Inductive: 0.45 kA  |  S3: 7.5 kA\nLPL I SPDs:      PSPD = 0.01  |  S1 Resistive: 25 kA    |  S1 Inductive: 0.6 kA   |  S3: 10 kA'
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
        'This risk assessment has been conducted in accordance with BS EN IEC 62305-2:2024 by the assessor ' +
        'named herein. The assessment is based on information available at the time of the assessment. It is ' +
        'the responsibility of the building owner to ensure that any recommended protection measures are ' +
        'installed and maintained by a competent contractor in accordance with BS EN 62305-3 (design and ' +
        'installation) and BS EN 62305-4 (electrical and electronic systems within structures).';
    const decLines = pdf.splitTextToSize(declaration, CW - 6);
    pdf.text(decLines, ML + 3, y);
    y += decLines.length * 5.5 + 14;

    hRule(y, LGREY, 0.4);
    y += 8;
    setFont(8, 'normal', DARK);
    pdf.text('Assessor Name: ' + safe(d.surveyorName || '_________________________'), ML + 2, y);
    pdf.text('Date: ' + safe(d.assessmentDate || '______________'), ML + CW * 0.55, y);
    y += 12;
    hRule(y, LGREY, 0.4);
    y += 8;
    setFont(8, 'normal', GREY);
    pdf.text('Signature: _____________________________________________', ML + 2, y);

    // ── Save ──
    const datePart = d.assessmentDate ? d.assessmentDate.replace(/-/g, '') : 'undated';
    const refPart  = (d.structureRef || d.siteAddress || 'RA')
        .replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    pdf.save('Risk_Assessment_' + refPart + '_' + datePart + '.pdf');
}
