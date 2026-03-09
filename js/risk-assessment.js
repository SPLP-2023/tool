// ============================================================
// risk-assessment.js
// BS EN IEC 62305-2:2024 — Phase 1: R1 (Loss of Human Life)
// Standalone structure, Source S1 only, LPZ 0A + LPZ 1
// ============================================================

// ── UK Regional NSG values (Annex NG.2, ATDnet/Meteorage 2013-2022) ──
const UK_NSG_REGIONS = [
    { label: 'Northern Scotland',                        nsg: 0.010 },
    { label: 'Central Scotland (Glasgow / Edinburgh)',   nsg: 0.025 },
    { label: 'Northern Ireland',                         nsg: 0.020 },
    { label: 'North West England (Carlisle / Lancaster)',nsg: 0.050 },
    { label: 'North East England (Newcastle)',           nsg: 0.100 },
    { label: 'Wales (North)',                            nsg: 0.080 },
    { label: 'Wales (South)',                            nsg: 0.050 },
    { label: 'Yorkshire / Leeds / Sheffield',            nsg: 0.225 },
    { label: 'East Midlands (Nottingham / Derby)',       nsg: 0.400 },
    { label: 'West Midlands (Birmingham)',               nsg: 0.350 },
    { label: 'East Anglia',                              nsg: 0.300 },
    { label: 'South West (Bristol / Somerset)',          nsg: 0.250 },
    { label: 'Cornwall / Devon',                         nsg: 0.080 },
    { label: 'London / South East',                      nsg: 0.550 },
    { label: 'Southampton / Hampshire',                  nsg: 0.400 },
    { label: 'Peak hotspot (SE / East Midlands border)', nsg: 1.000 }
];

// ── Table B.2 — Surface type / touch-step reduction factor (rt) ──
const SURFACE_TYPE_OPTIONS = [
    { label: 'Agricultural soil / concrete (≤1 kΩ)',  rt: 1e-2 },
    { label: 'Marble / ceramic tile (1–10 kΩ)',        rt: 1e-3 },
    { label: 'Gravel / carpet (10–100 kΩ)',            rt: 1e-4 },
    { label: 'Asphalt / linoleum / wood (≥100 kΩ)',    rt: 1e-5 }
];

// ── Table B.4 — Structure type factor (PS) ──
const STRUCTURE_PS_OPTIONS = [
    { label: 'Metal structure',                         ps: 0.0  },
    { label: 'Reinforced concrete / metal roof',        ps: 0.1  },
    { label: 'Non-reinforced concrete',                 ps: 0.3  },
    { label: 'Masonry (brick / stone)',                 ps: 0.5  },
    { label: 'Wood / light materials',                  ps: 1.0  }
];

// ── Table B.3 — Existing LPS (PLPS) ──
const LPS_OPTIONS = [
    { label: 'No LPS',                                  plps: 1.000 },
    { label: 'LPL IV',                                  plps: 0.200 },
    { label: 'LPL III',                                 plps: 0.100 },
    { label: 'LPL II',                                  plps: 0.050 },
    { label: 'LPL I',                                   plps: 0.020 },
    { label: 'LPL I + natural down conductors',         plps: 0.010 },
    { label: 'LPL I + metal roof + natural down cond.', plps: 0.001 }
];

// ── Table B.1 — Touch/step protection measure (Pam) ──
const PAM_OPTIONS = [
    { label: 'No measures',                          pam: 1.0  },
    { label: 'Warning notices',                      pam: 1e-1 },
    { label: 'Electrical insulation of down cond.',  pam: 1e-2 },
    { label: 'Meshed earth termination network',     pam: 1e-2 },
    { label: 'Natural LPS (reinforced concrete)',    pam: 1e-3 },
    { label: 'Physical restrictions / access ctrl',  pam: 0.0  }
];

// ── Table B.6 — Fire risk level (rf) ──
const FIRE_RISK_OPTIONS = [
    { label: 'No fire risk',                          rf: 0.0  },
    { label: 'Low fire risk',                         rf: 1e-3 },
    { label: 'Ordinary fire risk',                    rf: 1e-2 },
    { label: 'High fire risk (high fire load)',        rf: 1e-1 },
    { label: 'Explosion zone 2 / 22',                 rf: 1e-3 },
    { label: 'Explosion zone 1 / 21',                 rf: 1e-1 },
    { label: 'Explosion zone 0 / 20',                 rf: 1.0  }
];

// ── Table B.5 — Fire provisions (rp) ──
const FIRE_PROVISION_OPTIONS = [
    { label: 'No fire provisions',                        rp: 1.0 },
    { label: 'Extinguishers / manual alarm / hydrants',   rp: 0.5 },
    { label: 'Automatic extinguishing / automatic alarm', rp: 0.2 }
];

// ── Table C.2 — Loss category ──
const LOSS_CATEGORY_OPTIONS = [
    { label: 'Low Loss — residential (single family, small office)', lf1: 1e-4, lo1: 1e-4 },
    { label: 'Normal Loss — public buildings, offices, hotels',      lf1: 1e-3, lo1: 1e-3 },
    { label: 'High Loss — hospital rooms, museums, schools',         lf1: 1e-2, lo1: 1e-2 },
    { label: 'Very High Loss — hospitals, explosion risk buildings',  lf1: 1e-1, lo1: 1e-1 }
];

// ── Table B.7 — SPD protection ──
const SPD_OPTIONS = [
    { label: 'No SPDs',         pspd: 1.00, s1r: '—',        s1i: '—',       s3: '—'     },
    { label: 'LPL III–IV SPDs', pspd: 0.05, s1r: '12.5 kA',  s1i: '0.3 kA',  s3: '5 kA'  },
    { label: 'LPL II SPDs',     pspd: 0.02, s1r: '18.75 kA', s1i: '0.45 kA', s3: '7.5 kA'},
    { label: 'LPL I SPDs',      pspd: 0.01, s1r: '25 kA',    s1i: '0.6 kA',  s3: '10 kA' }
];

// ── LPL iteration ──
const LPL_CLASSES = [
    { label: 'LPL IV', plps: 0.20 },
    { label: 'LPL III',plps: 0.10 },
    { label: 'LPL II', plps: 0.05 },
    { label: 'LPL I',  plps: 0.02 }
];

const RT = 1e-5;

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('assessmentDate').valueAsDate = new Date();

    // Populate UK region
    const regionSel = document.getElementById('ukRegion');
    UK_NSG_REGIONS.forEach((r, i) => {
        const o = document.createElement('option');
        o.value = i; o.textContent = r.label;
        regionSel.appendChild(o);
    });

    // Populate table-driven selects
    populateSelect('lpz0aSurface',     SURFACE_TYPE_OPTIONS,   'label', 'rt');
    populateSelect('lpz1Surface',      SURFACE_TYPE_OPTIONS,   'label', 'rt');
    populateSelect('lpz0aPsType',      STRUCTURE_PS_OPTIONS,   'label', 'ps');
    populateSelect('lpz1PsType',       STRUCTURE_PS_OPTIONS,   'label', 'ps');
    populateSelect('lpz0aLps',         LPS_OPTIONS,            'label', 'plps');
    populateSelect('lpz1Lps',          LPS_OPTIONS,            'label', 'plps');
    populateSelect('lpz0aPam',         PAM_OPTIONS,            'label', 'pam');
    populateSelect('lpz1FireRisk',     FIRE_RISK_OPTIONS,      'label', 'rf');
    populateSelect('lpz1FireProv',     FIRE_PROVISION_OPTIONS, 'label', 'rp');
    populateSelect('lpz1LossCategory', LOSS_CATEGORY_OPTIONS,  'label', 'idx');
    populateSelect('lpz1Spd',          SPD_OPTIONS,            'label', 'pspd');

    // Region → NSG pre-fill
    regionSel.addEventListener('change', function () {
        const idx = parseInt(this.value);
        if (!isNaN(idx)) document.getElementById('nsgOverride').value = UK_NSG_REGIONS[idx].nsg;
        liveCalculate();
    });

    // Internal systems toggle → show SPD row
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
// LIVE CALCULATION ENGINE
// ============================================================
function liveCalculate() {
    const H = parseFloat(document.getElementById('structureHeight').value) || 0;
    const L = parseFloat(document.getElementById('structureLength').value) || 0;
    const W = parseFloat(document.getElementById('structureWidth').value) || 0;
    if (H <= 0 || L <= 0 || W <= 0) { setResultsPending(); return; }

    const NSG = parseFloat(document.getElementById('nsgOverride').value) || 0;
    const CD  = parseFloat(document.getElementById('locationFactor').value) || 1.0;
    if (NSG <= 0) { setResultsPending(); return; }

    // Collection area — Clause A.2.1.2 (2024 uses 3H)
    const AD = (L * W) + (2 * 3 * H * (L + W)) + (Math.PI * Math.pow(3 * H, 2));
    const ND = NSG * AD * CD * 1e-6;

    // ── LPZ 0A ──
    const nz0   = parseFloat(document.getElementById('lpz0aNz').value)    || 0;
    const nt    = parseFloat(document.getElementById('totalPersons').value)|| 1;
    const tz0   = parseFloat(document.getElementById('lpz0aTz').value)    || 0.25;
    const rt0   = parseFloat(document.getElementById('lpz0aSurface').value)|| 1e-2;
    const ps0   = parseFloat(document.getElementById('lpz0aPsType').value) || 1.0;
    const plps0 = parseFloat(document.getElementById('lpz0aLps').value)   || 1.0;
    const pam0  = parseFloat(document.getElementById('lpz0aPam').value)   || 1.0;
    const ptws0 = document.getElementById('lpz0aTws').checked ? 0.02 : 1.0;

    const PAT0 = pam0 * rt0;
    const PP0  = tz0 / 8760;
    const lossCatIdx = parseInt(document.getElementById('lpz1LossCategory').value) || 0;
    const lossCat = LOSS_CATEGORY_OPTIONS[lossCatIdx];

    const LT0  = (nz0 / nt) * PP0;
    const RAT  = ND * PAT0 * LT0;

    const PB0  = ps0 * plps0 * ptws0;
    const LB1_0 = lossCat.lf1 * (nz0 / nt);
    const RB0  = ND * PB0 * LB1_0;

    // ── LPZ 1 ──
    const nz1   = parseFloat(document.getElementById('lpz1Nz').value)      || nt;
    const tz1   = parseFloat(document.getElementById('lpz1Tz').value)      || 1.0;
    const rf1   = parseFloat(document.getElementById('lpz1FireRisk').value) || 0;
    const rp1   = parseFloat(document.getElementById('lpz1FireProv').value) || 1.0;
    const ps1   = parseFloat(document.getElementById('lpz1PsType').value)  || 1.0;
    const plps1 = parseFloat(document.getElementById('lpz1Lps').value)     || 1.0;
    const internalSystems = document.getElementById('lpz1InternalSystems').checked;
    const pspd  = internalSystems ? (parseFloat(document.getElementById('lpz1Spd').value) || 1.0) : 1.0;

    const PB1   = ps1 * plps1 * rf1 * rp1;
    const LB1_1 = lossCat.lf1 * (nz1 / nt);
    const RB1   = ND * PB1 * LB1_1;
    const RB    = RB0 + RB1;

    const PP1  = tz1 / 8760;
    const LC1  = lossCat.lo1 * (nz1 / nt);
    const PC   = internalSystems ? pspd * 1.0 : 0; // CLD=1 Phase 1
    const RC   = internalSystems ? ND * PC * LC1 : 0;

    const R1 = RAT + RB + RC;

    // LPL recommendation
    let lplRec = null;
    if (R1 > RT) {
        lplRec = recommendLPL({ ND, PAT0, LT0, ps0, ptws0, LB1_0, ps1, rf1, rp1, LB1_1, LC1, internalSystems, lossCat });
    }

    updateResultsDisplay({ AD, ND, RAT, RB, RC, R1, PB0, PB1, PC, lplRec, internalSystems, nt });
}

function recommendLPL({ ND, PAT0, LT0, ps0, ptws0, LB1_0, ps1, rf1, rp1, LB1_1, LC1, internalSystems }) {
    for (const lpl of LPL_CLASSES) {
        const RB0n = ND * (ps0 * lpl.plps * ptws0) * LB1_0;
        const RB1n = ND * (ps1 * lpl.plps * rf1 * rp1) * LB1_1;
        const RAT  = ND * PAT0 * LT0;
        const RC   = internalSystems ? ND * (0.05 * 1.0) * LC1 : 0; // assume LPL III-IV SPDs with LPS
        const R1n  = RAT + RB0n + RB1n + RC;
        if (R1n <= RT) {
            const spdReq = lpl.label === 'LPL I'  ? SPD_OPTIONS[3] :
                           lpl.label === 'LPL II' ? SPD_OPTIONS[2] :
                                                     SPD_OPTIONS[1];
            return { lpl: lpl.label, r1achieved: R1n, spd: spdReq };
        }
    }
    return null;
}

// ============================================================
// DISPLAY
// ============================================================
function updateResultsDisplay({ AD, ND, RAT, RB, RC, R1, lplRec, internalSystems }) {
    setText('resAD',  AD.toFixed(1) + ' m²');
    setText('resND',  ND.toExponential(3));
    setText('resRAT', RAT > 0 ? RAT.toExponential(2) : '0');
    setText('resRB',  RB.toExponential(2));
    setText('resRC',  internalSystems && RC > 0 ? RC.toExponential(2) : 'N/A');
    setText('resR1',  R1.toExponential(2));
    setText('resRT',  '1 × 10⁻⁵');

    const total = R1 || 1;
    setText('pctRAT', ((RAT/total)*100).toFixed(1) + '%');
    setText('pctRB',  ((RB/total)*100).toFixed(1) + '%');
    setText('pctRC',  internalSystems ? ((RC/total)*100).toFixed(1) + '%' : 'N/A');

    const banner = document.getElementById('passFailBanner');
    if (R1 <= RT) {
        banner.textContent = '✔  PASS — Risk Acceptable. No LPS Required.';
        banner.className = 'pass-fail-banner pass';
    } else {
        banner.textContent = '✘  FAIL — LPS Required. R1 exceeds tolerable limit (' + R1.toExponential(2) + ' > 1×10⁻⁵)';
        banner.className = 'pass-fail-banner fail';
    }

    const lplSection = document.getElementById('lplRecommendation');
    if (R1 > RT) {
        lplSection.style.display = 'block';
        if (lplRec) {
            setText('lplClass',      lplRec.lpl);
            setText('lplR1Achieved', lplRec.r1achieved.toExponential(2));
            setText('spdReqText', lplRec.spd
                ? `${lplRec.spd.label} — S1 Resistive: ${lplRec.spd.s1r}, S1 Inductive: ${lplRec.spd.s1i}, S3: ${lplRec.spd.s3} (PSPD = ${lplRec.spd.pspd})`
                : 'No SPDs required');
            show('lplSolution'); hide('lplNoSolution');
        } else {
            show('lplNoSolution'); hide('lplSolution');
        }
    } else {
        lplSection.style.display = 'none';
    }
}

function setResultsPending() {
    ['resAD','resND','resRAT','resRB','resRC','resR1'].forEach(id => setText(id, '—'));
    setText('resRT','1 × 10⁻⁵');
    setText('pctRAT','—'); setText('pctRB','—'); setText('pctRC','—');
    const b = document.getElementById('passFailBanner');
    if (b) { b.textContent = 'Enter structure dimensions to begin'; b.className = 'pass-fail-banner pending'; }
    hide('lplRecommendation');
}

function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function show(id) { const el = document.getElementById(id); if (el) el.style.display = 'block'; }
function hide(id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }

// ============================================================
// CLEAR FORM
// ============================================================
function clearRiskAssessmentData() {
    if (!confirm('Clear all data and start a new risk assessment?')) return;
    ['siteAddress','structureNameRef','surveyorName','assessmentComments',
     'structureHeight','structureLength','structureWidth','nsgOverride','totalPersons',
     'lpz1Nz'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    document.getElementById('assessmentDate').valueAsDate = new Date();
    document.getElementById('structureType').value = '';
    document.getElementById('ukRegion').value = '';
    document.getElementById('locationFactor').value = '1';
    document.getElementById('lpz0aNz').value = '0';
    document.getElementById('lpz0aTz').value = '0.25';
    document.getElementById('lpz1Tz').value = '1.0';
    document.getElementById('lpz0aTws').checked = false;
    document.getElementById('lpz1InternalSystems').checked = false;
    document.getElementById('spdRow').style.display = 'none';
    setResultsPending();
}

// ============================================================
// DATA EXPORT FOR PDF
// ============================================================
function getRACalculationData() {
    return {
        siteAddress:    document.getElementById('siteAddress').value,
        structureRef:   document.getElementById('structureNameRef').value,
        assessmentDate: document.getElementById('assessmentDate').value,
        surveyorName:   document.getElementById('surveyorName').value,
        structureType:  document.getElementById('structureType').value,
        ukRegion:       document.getElementById('ukRegion').options[document.getElementById('ukRegion').selectedIndex]?.text || '',
        nsg:            document.getElementById('nsgOverride').value,
        cd:             document.getElementById('locationFactor').value,
        H:              document.getElementById('structureHeight').value,
        L:              document.getElementById('structureLength').value,
        W:              document.getElementById('structureWidth').value,
        AD:             document.getElementById('resAD').textContent,
        ND:             document.getElementById('resND').textContent,
        RAT:            document.getElementById('resRAT').textContent,
        RB:             document.getElementById('resRB').textContent,
        RC:             document.getElementById('resRC').textContent,
        R1:             document.getElementById('resR1').textContent,
        passFail:       document.getElementById('passFailBanner').textContent,
        lplClass:       document.getElementById('lplClass')?.textContent || 'N/A',
        spdReq:         document.getElementById('spdReqText')?.textContent || 'N/A',
        pctRAT:         document.getElementById('pctRAT').textContent,
        pctRB:          document.getElementById('pctRB').textContent,
        pctRC:          document.getElementById('pctRC').textContent,
        comments:       document.getElementById('assessmentComments').value,
        // LPZ 0A detail labels
        lpz0aSurface:   document.getElementById('lpz0aSurface').options[document.getElementById('lpz0aSurface').selectedIndex]?.text || '',
        lpz0aPsType:    document.getElementById('lpz0aPsType').options[document.getElementById('lpz0aPsType').selectedIndex]?.text || '',
        lpz0aLps:       document.getElementById('lpz0aLps').options[document.getElementById('lpz0aLps').selectedIndex]?.text || '',
        lpz0aPam:       document.getElementById('lpz0aPam').options[document.getElementById('lpz0aPam').selectedIndex]?.text || '',
        lpz0aTws:       document.getElementById('lpz0aTws').checked ? 'Yes' : 'No',
        lpz0aNz:        document.getElementById('lpz0aNz').value,
        totalPersons:   document.getElementById('totalPersons').value,
        // LPZ 1 detail labels
        lpz1FireRisk:   document.getElementById('lpz1FireRisk').options[document.getElementById('lpz1FireRisk').selectedIndex]?.text || '',
        lpz1FireProv:   document.getElementById('lpz1FireProv').options[document.getElementById('lpz1FireProv').selectedIndex]?.text || '',
        lpz1PsType:     document.getElementById('lpz1PsType').options[document.getElementById('lpz1PsType').selectedIndex]?.text || '',
        lpz1Lps:        document.getElementById('lpz1Lps').options[document.getElementById('lpz1Lps').selectedIndex]?.text || '',
        lpz1LossCat:    document.getElementById('lpz1LossCategory').options[document.getElementById('lpz1LossCategory').selectedIndex]?.text || '',
        lpz1Nz:         document.getElementById('lpz1Nz').value,
        internalSystems:document.getElementById('lpz1InternalSystems').checked ? 'Yes' : 'No',
    };
}
