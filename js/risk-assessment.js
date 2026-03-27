// ============================================================
// risk-assessment.js
// BS EN IEC 62305-2:2024 — R1 (Risk of Loss of Human Life)
// UK National Annexes NB and NC applied throughout
// Source S1 only (flashes to structure), LPZ 0A + LPZ 1
// ============================================================

// ── UK NSG values — Annex NG.2 (ATDnet/Meteorage 2013-2022) ──
const UK_NSG_REGIONS = [
    { label: 'Northern Scotland',                         nsg: 0.010 },
    { label: 'Central Scotland (Glasgow / Edinburgh)',    nsg: 0.025 },
    { label: 'Northern Ireland',                          nsg: 0.020 },
    { label: 'North West England (Carlisle / Lancaster)', nsg: 0.050 },
    { label: 'North East England (Newcastle)',            nsg: 0.100 },
    { label: 'Wales (North)',                             nsg: 0.080 },
    { label: 'Wales (South)',                             nsg: 0.050 },
    { label: 'Yorkshire / Leeds / Sheffield',             nsg: 0.225 },
    { label: 'East Midlands (Nottingham / Derby)',        nsg: 0.400 },
    { label: 'West Midlands (Birmingham)',                nsg: 0.350 },
    { label: 'East Anglia',                               nsg: 0.300 },
    { label: 'South West (Bristol / Somerset)',           nsg: 0.250 },
    { label: 'Cornwall / Devon',                          nsg: 0.080 },
    { label: 'London / South East',                       nsg: 0.550 },
    { label: 'Southampton / Hampshire',                   nsg: 0.400 },
    { label: 'Peak hotspot (SE / East Midlands border)',  nsg: 1.000 }
];

// ── Table A.4 — Environmental factor CE ──
const CE_OPTIONS = [
    { label: 'Rural',                              ce: 1.00 },
    { label: 'Suburban',                           ce: 0.50 },
    { label: 'Urban',                              ce: 0.10 },
    { label: 'Urban with buildings higher than 20m', ce: 0.01 }
];

// ── Table A.1 — Location factor CD ──
// (free text override kept; dropdown removed for flexibility)

// ── Table NB.2 — Surface type rt ──
const SURFACE_TYPE_OPTIONS = [
    { label: 'Agricultural soil / concrete (<=1 kOhm)',  rt: 1e-2 },
    { label: 'Marble / ceramic (1-10 kOhm)',             rt: 1e-3 },
    { label: 'Gravel / carpet (10-100 kOhm)',            rt: 1e-4 },
    { label: 'Asphalt / linoleum / wood (>=100 kOhm)',   rt: 1e-5 }
];

// ── Table NB.4 — Structure material PS (UK National Annex NB.4) ──
// Simplified to two options per UK annex
const STRUCTURE_PS_OPTIONS = [
    { label: 'Wood or masonry (brick / stone / timber)',  ps: 1.0 },
    { label: 'Electrically-continuous RC or metal framework', ps: 0.5 }
];

// ── Table NB.3 — Existing LPS probability PLPS ──
const LPS_OPTIONS = [
    { label: 'No LPS',                                                   plps: 1.000 },
    { label: 'LPS Class IV',                                             plps: 0.200 },
    { label: 'LPS Class III',                                            plps: 0.100 },
    { label: 'LPS Class II',                                             plps: 0.050 },
    { label: 'LPS Class I',                                              plps: 0.020 },
    { label: 'LPS Class I + continuous metal / RC framework',            plps: 0.010 },
    { label: 'LPS Class I + metal roof + air termination + RC framework',plps: 0.001 }
];

// ── Table NB.1 — Touch/step protection Pam ──
const PAM_OPTIONS = [
    { label: 'No protection measures',                        pam: 1.0   },
    { label: 'Warning notices',                               pam: 1e-1  },
    { label: 'Electrical insulation of exposed parts',        pam: 1e-2  },
    { label: 'Effective soil equipotentialization (meshed)',   pam: 1e-2  },
    { label: 'Natural LPS (reinforced concrete)',              pam: 1e-3  },
    { label: 'Access restrictions / physical barriers',        pam: 0.0   }
];

// ── Table NB.6 — Fire/explosion risk rf ──
const FIRE_RISK_OPTIONS = [
    { label: 'None — no fire or explosion risk',              rf: 0.0   },
    { label: 'Low fire risk (<400 MJ/m2 fire load)',          rf: 1e-3  },
    { label: 'Ordinary fire risk (400-800 MJ/m2)',            rf: 1e-2  },
    { label: 'High fire risk (>800 MJ/m2 or combustible)',    rf: 1e-1  },
    { label: 'Explosion — Zone 2 / Zone 22',                  rf: 1e-3  },
    { label: 'Explosion — Zone 1 / Zone 21',                  rf: 1e-1  },
    { label: 'Explosion — Zone 0 / Zone 20 / solid explosive',rf: 1.0   }
];

// ── Table NB.5 — Fire provisions rp ──
const FIRE_PROVISION_OPTIONS = [
    { label: 'No fire provisions',                                            rp: 1.0 },
    { label: 'Extinguishers / manual alarm / hydrants / fire compartments',   rp: 0.5 },
    { label: 'Fixed automatic extinguishing / automatic alarm installations', rp: 0.2 }
];

// ── LF1 — Persons injured by fire (Table NC.2 / Table C.2 highest values) ──
// LT is fixed at 1e-2 for all structure types per 2024 standard Table C.2
// LF1 uses the highest recommended value from each row as the default
const LF1_OPTIONS = [
    { label: 'None — no fire risk in this zone',                              lf1: 0.0   },
    { label: 'Low-loss (houses, private buildings) — LF1 = 2x10^-2',         lf1: 2e-2  },
    { label: 'Normal loss (offices, hotels, schools, public) — LF1 = 5x10^-2', lf1: 5e-2 },
    { label: 'High loss (hospitals wards, prisons, power stations, museums) — LF1 = 10^-1', lf1: 1e-1 },
    { label: 'Very high loss (ICU/operating rooms, explosion risk) — LF1 = 2x10^-1', lf1: 2e-1 }
];

// ── LO1 — Persons injured by internal systems failure (Table NC.2 separate) ──
// LO1 = 0 for most structures; only non-zero for specific high-risk occupancies
const LO1_OPTIONS = [
    { label: 'None — LO1 = 0 (most buildings, residential, offices)',         lo1: 0.0   },
    { label: 'Low-loss — applies only when explosion / PV / DC voltage risk', lo1: 1e-4  },
    { label: 'Normal loss — explosion risk or surge-sensitive equipment',      lo1: 5e-4  },
    { label: 'High loss (control rooms, telecoms centres, power stations)',    lo1: 1e-3  },
    { label: 'Very high loss (ICU hospitals, explosion risk)',                  lo1: 1e-2  }
];

// ── Table NB.7 — SPD protection PSPD (low voltage system) ──
const SPD_OPTIONS = [
    { label: 'No SPDs (PSPD = 1.0)',
      pspd: 1.00, s1r: '-', s1i: '-', s3: '-' },
    { label: 'LPS Class III-IV SPDs (PSPD = 0.05) — S1 12.5kA / 0.3kA, S3 5kA',
      pspd: 0.05, s1r: '12.5 kA', s1i: '0.3 kA',  s3: '5 kA'   },
    { label: 'LPS Class II SPDs (PSPD = 0.02) — S1 18.75kA / 0.45kA, S3 7.5kA',
      pspd: 0.02, s1r: '18.75 kA', s1i: '0.45 kA', s3: '7.5 kA' },
    { label: 'LPS Class I SPDs (PSPD = 0.01) — S1 25kA / 0.6kA, S3 10kA',
      pspd: 0.01, s1r: '25 kA',    s1i: '0.6 kA',  s3: '10 kA'  }
];

// ── LPL iteration for recommendation engine ──
const LPL_CLASSES = [
    { label: 'LPS Class IV', plps: 0.20 },
    { label: 'LPS Class III', plps: 0.10 },
    { label: 'LPS Class II',  plps: 0.05 },
    { label: 'LPS Class I',   plps: 0.02 }
];

// ── Constants ──
const RT = 1e-5;   // Tolerable risk — Clause 7.3
const LT = 1e-2;   // Fixed per Table C.2 / NC.2 2024 for all structures

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('assessmentDate').valueAsDate = new Date();

    // Populate region dropdown
    const regionSel = document.getElementById('ukRegion');
    UK_NSG_REGIONS.forEach((r, i) => {
        const o = document.createElement('option');
        o.value = i;
        o.textContent = r.label;
        regionSel.appendChild(o);
    });

    // Populate CE dropdown
    populateSelect('environmentType', CE_OPTIONS, 'label', 'ce');

    // Populate table-driven selects
    populateSelect('lpz0aSurface',  SURFACE_TYPE_OPTIONS,  'label', 'rt');
    populateSelect('lpz0aPsType',   STRUCTURE_PS_OPTIONS,  'label', 'ps');
    populateSelect('lpz0aLps',      LPS_OPTIONS,           'label', 'plps');
    populateSelect('lpz0aPam',      PAM_OPTIONS,           'label', 'pam');
    populateSelect('lpz1FireRisk',  FIRE_RISK_OPTIONS,     'label', 'rf');
    populateSelect('lpz1FireProv',  FIRE_PROVISION_OPTIONS,'label', 'rp');
    populateSelect('lpz1PsType',    STRUCTURE_PS_OPTIONS,  'label', 'ps');
    populateSelect('lpz1Lps',       LPS_OPTIONS,           'label', 'plps');
    populateSelect('lpz1LF1',       LF1_OPTIONS,           'label', 'lf1');
    populateSelect('lpz1LO1',       LO1_OPTIONS,           'label', 'lo1');
    populateSelect('lpz1Spd',       SPD_OPTIONS,           'label', 'pspd');

    // Region → NSG pre-fill
    regionSel.addEventListener('change', function () {
        const idx = parseInt(this.value);
        if (!isNaN(idx)) {
            document.getElementById('nsgOverride').value = UK_NSG_REGIONS[idx].nsg;
        }
        liveCalculate();
    });

    // Environment → CE pre-fill
    document.getElementById('environmentType').addEventListener('change', function () {
        liveCalculate();
    });

    // Internal systems toggle → show/hide SPD row
    document.getElementById('lpz1InternalSystems').addEventListener('change', function () {
        document.getElementById('spdRow').style.display = this.checked ? '' : 'none';
        liveCalculate();
    });

    // Live calculation on all inputs
    document.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('change', liveCalculate);
        el.addEventListener('input', liveCalculate);
    });

    setResultsPending();
});

function populateSelect(id, options, labelKey, valueKey) {
    const sel = document.getElementById(id);
    if (!sel) return;
    options.forEach((opt, i) => {
        const el = document.createElement('option');
        el.value = (valueKey === 'idx') ? i : opt[valueKey];
        el.textContent = opt[labelKey];
        sel.appendChild(el);
    });
}

// ============================================================
// LIVE CALCULATION ENGINE — BS EN IEC 62305-2:2024
// ============================================================
function liveCalculate() {
    // ── Structure dimensions ──
    const H = parseFloat(document.getElementById('structureHeight').value) || 0;
    const L = parseFloat(document.getElementById('structureLength').value)  || 0;
    const W = parseFloat(document.getElementById('structureWidth').value)   || 0;
    if (H <= 0 || L <= 0 || W <= 0) { setResultsPending(); return; }

    // ── Location & environment ──
    const NSG = parseFloat(document.getElementById('nsgOverride').value)    || 0;
    const CD  = parseFloat(document.getElementById('locationFactor').value) || 1.0;
    const CE  = parseFloat(document.getElementById('environmentType').value)|| 1.0;
    if (NSG <= 0) { setResultsPending(); return; }

    // ── Collection area — Clause A.2.1.2 (2024 uses 3H) ──
    // AD = L×W + 2×(3H)×(L+W) + π×(3H)²
    const AD = (L * W) + (2 * 3 * H * (L + W)) + (Math.PI * Math.pow(3 * H, 2));

    // ── Annual dangerous events — Clause A.2.4 ──
    // ND = NSG × AD × CD × CE × 10^-6
    // Note: CE is applied here per Table A.4
    const ND = NSG * AD * CD * CE * 1e-6;

    // ── Persons ──
    const nt  = parseFloat(document.getElementById('totalPersons').value) || 1;

    // ──────────────────────────────────────────────
    // LPZ 0A — EXTERNAL ZONE
    // ──────────────────────────────────────────────
    const nz0   = parseFloat(document.getElementById('lpz0aNz').value)     || 0;
    const rt0   = parseFloat(document.getElementById('lpz0aSurface').value)|| 1e-2;
    const ps0   = parseFloat(document.getElementById('lpz0aPsType').value) || 1.0;
    const plps0 = parseFloat(document.getElementById('lpz0aLps').value)    || 1.0;
    const pam0  = parseFloat(document.getElementById('lpz0aPam').value)    || 1.0;
    const ptws  = document.getElementById('lpz0aTws').checked ? 0.02 : 1.0;

    // ── LPZ 1 fire risk (shared with LPZ 0A for RB per standard) ──
    const rf1   = parseFloat(document.getElementById('lpz1FireRisk').value) || 0;
    const rp1   = parseFloat(document.getElementById('lpz1FireProv').value) || 1.0;

    // RAT — Touch/step voltage risk, LPZ 0A only
    // PAT = PLPS × Pam × rt × PTWS  (NB.2)
    // LT = 1×10^-2 fixed  (Table C.2 / NC.2 2024)
    // LAT = LT (Table C.1)
    // RAT = ND × PAT × LT × (nz/nt)
    const PAT = plps0 * pam0 * rt0 * ptws;
    const RAT = ND * PAT * LT * (nz0 / nt);

    // RB (LPZ 0A) — Physical damage / fire
    // PB0 = PS × PLPS × rf × rp  (NB.4)
    // rp fixed at 1.0 for external zone (no fire provisions outdoors)
    // rf shared from LPZ 1 input (property of the structure, not the zone)
    // LB1 = LF1 × (nz/nt)  (Table C.1: LB1 = LF1)
    const lf1_val = parseFloat(document.getElementById('lpz1LF1').value) || 0;
    const PB0   = ps0 * plps0 * rf1 * 1.0;
    const LB1_0 = lf1_val * (nz0 / nt);
    const RB0   = ND * PB0 * LB1_0;

    // ──────────────────────────────────────────────
    // LPZ 1 — INTERNAL ZONE
    // ──────────────────────────────────────────────
    const nz1   = parseFloat(document.getElementById('lpz1Nz').value)      || nt;
    const ps1   = parseFloat(document.getElementById('lpz1PsType').value)  || 1.0;
    const plps1 = parseFloat(document.getElementById('lpz1Lps').value)     || 1.0;
    const lo1_val = parseFloat(document.getElementById('lpz1LO1').value)   || 0;
    const internalSystems = document.getElementById('lpz1InternalSystems').checked;
    const pspd  = internalSystems
        ? (parseFloat(document.getElementById('lpz1Spd').value) || 1.0)
        : 0;

    // RB (LPZ 1) — Physical damage / fire
    // PB1 = PS × PLPS × rf × rp  (NB.4)
    // LB1_1 = LF1 × (nz1/nt)
    const PB1   = ps1 * plps1 * rf1 * rp1;
    const LB1_1 = lf1_val * (nz1 / nt);
    const RB1   = ND * PB1 * LB1_1;

    const RB = RB0 + RB1;

    // RC — Internal system failure risk, LPZ 1 only
    // PC = PSPD × CLD  (NB.5); CLD = 1 for Phase 1 (no line shielding considered)
    // LC1 = LO1 × (nz1/nt)  (Table C.1: LC1 = LO1)
    const PC  = internalSystems ? pspd * 1.0 : 0;
    const LC1 = lo1_val * (nz1 / nt);
    const RC  = internalSystems ? ND * PC * LC1 : 0;

    // ── Total risk ──
    const R1 = RAT + RB + RC;

    // ── LPL recommendation if failing ──
    let lplRec = null;
    if (R1 > RT) {
        lplRec = recommendLPL({
            ND, PAT, LT, nz0, nt,
            ps0, lf1_val, nz1,
            rf1, rp1, ps1,
            internalSystems, lo1_val,
            pspd
        });
    }

    updateResultsDisplay({ AD, ND, RAT, RB, RC, R1, lplRec, internalSystems });
}

// ============================================================
// LPL RECOMMENDATION ENGINE
// Iterates LPS Class IV → III → II → I
// Applies PLPS to both RB zones and recalculates R1
// SPD level matched to LPS class per Table NB.7
// ============================================================
function recommendLPL({ ND, PAT, LT, nz0, nt, ps0, lf1_val, nz1, rf1, rp1, ps1, internalSystems, lo1_val }) {
    const LB1_0 = lf1_val * (nz0 / nt);
    const LB1_1 = lf1_val * (nz1 / nt);
    const LC1   = lo1_val * (nz1 / nt);

    for (const lpl of LPL_CLASSES) {
        // Apply new PLPS to both zones
        const RATn = ND * (lpl.plps * PAT / (document.getElementById('lpz0aLps') ?
            parseFloat(document.getElementById('lpz0aLps').value) || 1.0 : 1.0)
            * LT * (nz0 / nt));

        // Simpler: recalculate directly with the new PLPS
        const newPAT  = parseFloat(document.getElementById('lpz0aPam').value  || 1) *
                        parseFloat(document.getElementById('lpz0aSurface').value || 1e-2) *
                        (document.getElementById('lpz0aTws').checked ? 0.02 : 1.0) *
                        lpl.plps;
        const newRAT  = ND * newPAT * LT * (nz0 / nt);
        const newRB0  = ND * (ps0 * lpl.plps * rf1 * 1.0) * LB1_0;
        const newRB1  = ND * (ps1 * lpl.plps * rf1 * rp1) * LB1_1;

        // Match SPD level to LPS class
        const spdMatch = lpl.label === 'LPS Class I'   ? SPD_OPTIONS[3] :
                         lpl.label === 'LPS Class II'  ? SPD_OPTIONS[2] :
                                                          SPD_OPTIONS[1];
        const newPC   = internalSystems ? spdMatch.pspd * 1.0 : 0;
        const newRC   = internalSystems ? ND * newPC * LC1 : 0;

        const newR1 = newRAT + newRB0 + newRB1 + newRC;

        if (newR1 <= RT) {
            return { lpl: lpl.label, r1achieved: newR1, spd: spdMatch };
        }
    }
    return null; // No standard LPS class achieves RT — recommend TWS investigation
}

// ============================================================
// DISPLAY
// ============================================================
function updateResultsDisplay({ AD, ND, RAT, RB, RC, R1, lplRec, internalSystems }) {
    setText('resAD',  AD.toFixed(1) + ' m2');
    setText('resND',  ND.toExponential(3));
    setText('resRAT', RAT > 0 ? RAT.toExponential(2) : '0');
    setText('resRB',  RB.toExponential(2));
    setText('resRC',  internalSystems && RC > 0 ? RC.toExponential(2) : 'N/A');
    setText('resR1',  R1.toExponential(2));
    setText('resRT',  '1 x 10^-5');

    const total = R1 || 1;
    setText('pctRAT', ((RAT / total) * 100).toFixed(1) + '%');
    setText('pctRB',  ((RB  / total) * 100).toFixed(1) + '%');
    setText('pctRC',  internalSystems ? ((RC / total) * 100).toFixed(1) + '%' : 'N/A');

    const banner = document.getElementById('passFailBanner');
    if (R1 <= RT) {
        banner.textContent = 'PASS — Risk Acceptable. No LPS Required.';
        banner.className   = 'pass-fail-banner pass';
    } else {
        banner.textContent = 'FAIL — LPS Required. R1 exceeds tolerable limit (' +
            R1.toExponential(2) + ' > 1x10^-5)';
        banner.className = 'pass-fail-banner fail';
    }

    const lplSection = document.getElementById('lplRecommendation');
    if (R1 > RT) {
        lplSection.style.display = 'block';
        if (lplRec) {
            setText('lplClass',      lplRec.lpl);
            setText('lplR1Achieved', lplRec.r1achieved.toExponential(2));
            setText('spdReqText',
                lplRec.spd
                    ? lplRec.spd.label + ' — S1 Resistive: ' + lplRec.spd.s1r +
                      ', S1 Inductive: ' + lplRec.spd.s1i + ', S3: ' + lplRec.spd.s3 +
                      ' (PSPD = ' + lplRec.spd.pspd + ')'
                    : 'No SPDs required'
            );
            show('lplSolution');
            hide('lplNoSolution');
        } else {
            show('lplNoSolution');
            hide('lplSolution');
        }
    } else {
        lplSection.style.display = 'none';
    }
}

function setResultsPending() {
    ['resAD','resND','resRAT','resRB','resRC','resR1'].forEach(id => setText(id, '—'));
    setText('resRT', '1 x 10^-5');
    setText('pctRAT', '—'); setText('pctRB', '—'); setText('pctRC', '—');
    const b = document.getElementById('passFailBanner');
    if (b) {
        b.textContent = 'Enter structure dimensions to begin';
        b.className   = 'pass-fail-banner pending';
    }
    hide('lplRecommendation');
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}
function show(id) { const el = document.getElementById(id); if (el) el.style.display = 'block'; }
function hide(id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }

// ============================================================
// CLEAR FORM
// ============================================================
function clearRiskAssessmentData() {
    if (!confirm('Clear all data and start a new risk assessment?')) return;
    ['siteAddress','structureNameRef','surveyorName','assessmentComments',
     'structureHeight','structureLength','structureWidth',
     'nsgOverride','totalPersons','lpz1Nz','lpz0aNz'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('assessmentDate').valueAsDate = new Date();
    document.getElementById('structureType').value     = '';
    document.getElementById('ukRegion').value          = '';
    document.getElementById('environmentType').value   = CE_OPTIONS[0].ce;
    document.getElementById('locationFactor').value    = '1';
    document.getElementById('lpz0aTws').checked        = false;
    document.getElementById('lpz1InternalSystems').checked = false;
    document.getElementById('spdRow').style.display    = 'none';
    setResultsPending();
}

// ============================================================
// DATA EXPORT FOR PDF
// ============================================================
function getRACalculationData() {
    const envIdx = document.getElementById('environmentType').selectedIndex;
    const envLabel = envIdx >= 0 ? CE_OPTIONS[envIdx]?.label || '' : '';

    return {
        // Site info
        siteAddress:     document.getElementById('siteAddress').value,
        structureRef:    document.getElementById('structureNameRef').value,
        assessmentDate:  document.getElementById('assessmentDate').value,
        surveyorName:    document.getElementById('surveyorName').value,
        structureType:   document.getElementById('structureType').value,
        // Location
        ukRegion:        document.getElementById('ukRegion').options[
                             document.getElementById('ukRegion').selectedIndex]?.text || '',
        nsg:             document.getElementById('nsgOverride').value,
        cd:              document.getElementById('locationFactor').value,
        ce:              document.getElementById('environmentType').value,
        ceLabel:         envLabel,
        // Dimensions
        H:               document.getElementById('structureHeight').value,
        L:               document.getElementById('structureLength').value,
        W:               document.getElementById('structureWidth').value,
        // Results (from display elements)
        AD:              document.getElementById('resAD').textContent,
        ND:              document.getElementById('resND').textContent,
        RAT:             document.getElementById('resRAT').textContent,
        RB:              document.getElementById('resRB').textContent,
        RC:              document.getElementById('resRC').textContent,
        R1:              document.getElementById('resR1').textContent,
        passFail:        document.getElementById('passFailBanner').textContent,
        lplClass:        document.getElementById('lplClass')?.textContent       || 'N/A',
        lplR1Achieved:   document.getElementById('lplR1Achieved')?.textContent  || '-',
        spdReq:          document.getElementById('spdReqText')?.textContent     || 'N/A',
        pctRAT:          document.getElementById('pctRAT').textContent,
        pctRB:           document.getElementById('pctRB').textContent,
        pctRC:           document.getElementById('pctRC').textContent,
        comments:        document.getElementById('assessmentComments').value,
        // LPZ 0A details
        lpz0aNz:         document.getElementById('lpz0aNz').value,
        totalPersons:    document.getElementById('totalPersons').value,
        lpz0aSurface:    document.getElementById('lpz0aSurface').options[
                             document.getElementById('lpz0aSurface').selectedIndex]?.text || '',
        lpz0aPsType:     document.getElementById('lpz0aPsType').options[
                             document.getElementById('lpz0aPsType').selectedIndex]?.text || '',
        lpz0aLps:        document.getElementById('lpz0aLps').options[
                             document.getElementById('lpz0aLps').selectedIndex]?.text || '',
        lpz0aPam:        document.getElementById('lpz0aPam').options[
                             document.getElementById('lpz0aPam').selectedIndex]?.text || '',
        lpz0aTws:        document.getElementById('lpz0aTws').checked ? 'Yes' : 'No',
        // LPZ 1 details
        lpz1Nz:          document.getElementById('lpz1Nz').value,
        lpz1FireRisk:    document.getElementById('lpz1FireRisk').options[
                             document.getElementById('lpz1FireRisk').selectedIndex]?.text || '',
        lpz1FireProv:    document.getElementById('lpz1FireProv').options[
                             document.getElementById('lpz1FireProv').selectedIndex]?.text || '',
        lpz1PsType:      document.getElementById('lpz1PsType').options[
                             document.getElementById('lpz1PsType').selectedIndex]?.text || '',
        lpz1Lps:         document.getElementById('lpz1Lps').options[
                             document.getElementById('lpz1Lps').selectedIndex]?.text || '',
        lpz1LF1:         document.getElementById('lpz1LF1').options[
                             document.getElementById('lpz1LF1').selectedIndex]?.text || '',
        lpz1LO1:         document.getElementById('lpz1LO1').options[
                             document.getElementById('lpz1LO1').selectedIndex]?.text || '',
        internalSystems: document.getElementById('lpz1InternalSystems').checked ? 'Yes' : 'No',
        lpz1Spd:         document.getElementById('lpz1InternalSystems').checked
                             ? (document.getElementById('lpz1Spd').options[
                                document.getElementById('lpz1Spd').selectedIndex]?.text || '')
                             : 'N/A'
    };
}
