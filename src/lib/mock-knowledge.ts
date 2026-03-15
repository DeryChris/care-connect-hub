import { KnowledgeArticle } from './constants';

export const mockKnowledgeArticles: KnowledgeArticle[] = [
  {
    id: '1',
    title: 'Hypertension Management Protocol',
    category: 'protocol',
    tags: ['cardiology', 'hypertension', 'guideline'],
    content: `## Initial Assessment
1. Measure BP (both arms, 2 readings)
2. Fundoscopy for retinopathy
3. Assess end-organ damage

## Target BP
- <60yrs: <130/80 mmHg
- ≥60yrs: <150/90 mmHg

## First Line Drugs
- ACEI/ARB + CCB
- Thiazide diuretic

## Follow-up
- 1 week if BP >180/110
- 1 month otherwise`,
    author_id: '2',
    author_name: 'Dr. Sarah Wilson',
    status: 'approved',
    version: 3,
    created_at: '2024-01-15',
    updated_at: '2024-12-01',
    views: 245,
    department_id: '1'
  },
  {
    id: '2',
    title: 'Acute Asthma Exacerbation',
    category: 'protocol',
    tags: ['emergency', 'respiratory', 'asthma'],
    content: `## Assessment
FEV1 or PEF <50% predicted = Moderate/Severe

## Treatment
**Oxygen**: Maintain SaO2 ≥92%
**Salbutamol**: 4-8 puffs q20min x3
**Ipratropium**: 8 puffs q20min x3
**Steroids**: Prednisolone 40-50mg oral

## Admit Criteria
- PEF <75% 1hr post treatment
- RR >25, HR >120
- SaO2 <92% on air`,
    author_id: '6',
    author_name: 'Emergency Dept',
    status: 'approved',
    version: 2,
    created_at: '2024-02-10',
    updated_at: '2024-11-15',
    views: 189,
    department_id: '6'
  },
  {
    id: '3',
    title: 'Diabetic Foot Ulcer Protocol',
    category: 'guideline',
    tags: ['endocrinology', 'diabetes', 'woundcare'],
    content: `## Wagner Classification
1. Superficial ulcer
2. Deep ulcer to tendon
3. Deep ulcer + abscess
4. Gangrene partial foot
5. Gangrene whole foot

## Management
**Grade 1-2**: Offloading + antibiotics
**Grade 3+**: Surgical debridement
**All**: X-ray for osteomyelitis
**MRI if**: Suspected deep infection

## Antibiotics (MSSA coverage)
- Flucloxacillin 1g IV QID
- Add metronidazole if anaerobes`,
    author_id: '3',
    author_name: 'Dr. James Chen',
    status: 'approved',
    version: 1,
    created_at: '2024-03-05',
    updated_at: '2024-03-05',
    views: 156
  },
  {
    id: '4',
    title: 'Sepsis Management Bundle',
    category: 'protocol',
    tags: ['sepsis', 'emergency', 'criticalcare'],
    content: `## Hour-1 Bundle
**Measure** lactate
**Blood cultures** prior antibiotics
**Broad spectrum** antibiotics
**Fluids** 30ml/kg crystalloid

## Repeat lactate 2-4hrs
Lactate clearance <10% → escalate

## Vasopressors
Norepinephrine if MAP <65 despite fluids

## Source Control
Identify and remove source within 6-12hrs`,
    author_id: '1',
    author_name: 'Admin User',
    status: 'approved',
    version: 2,
    created_at: '2024-12-10',
    updated_at: '2024-12-10',
    views: 312,
    department_id: '6'
  },
  {
    id: '5',
    title: 'Acute Coronary Syndrome (ACS) Management',
    category: 'protocol',
    tags: ['cardiology', 'acs', 'stemi', 'nstemi'],
    content: `## Initial Steps
- 12-lead ECG within 10 minutes of arrival
- Aspirin 300mg chewed stat
- GTN sublingual if SBP >90

## STEMI
- PCI within 90 minutes (door-to-balloon)
- If PCI unavailable: thrombolysis within 30 min
- Dual antiplatelet: Aspirin + Ticagrelor 180mg

## NSTEMI/UA
- Risk stratify with GRACE score
- Fondaparinux 2.5mg SC daily
- High risk: early invasive strategy within 24hrs

## Medications
- Beta-blocker: Metoprolol 25mg BD
- ACE inhibitor: Ramipril 2.5mg OD
- Statin: Atorvastatin 80mg nocte`,
    author_id: '2',
    author_name: 'Dr. Sarah Wilson',
    status: 'approved',
    version: 4,
    created_at: '2024-01-20',
    updated_at: '2024-11-30',
    views: 421,
    department_id: '1'
  },
  {
    id: '6',
    title: 'Community Acquired Pneumonia (CAP)',
    category: 'guideline',
    tags: ['respiratory', 'pneumonia', 'antibiotic'],
    content: `## CURB-65 Score
- Confusion: 1 point
- Urea >7mmol/L: 1 point
- RR ≥30: 1 point
- BP <90 systolic or ≤60 diastolic: 1 point
- Age ≥65: 1 point

## Management by Score
**0-1**: Outpatient — Amoxicillin 500mg TDS x5 days
**2**: Consider hospital — IV Amoxicillin + Clarithromycin
**3-5**: ICU consult — IV Co-amoxiclav + Clarithromycin

## Atypicals Cover
Add Clarithromycin 500mg BD if atypical suspected`,
    author_id: '2',
    author_name: 'Dr. Sarah Wilson',
    status: 'approved',
    version: 2,
    created_at: '2024-02-01',
    updated_at: '2024-10-15',
    views: 198,
    department_id: '1'
  },
  {
    id: '7',
    title: 'Stroke Management Protocol',
    category: 'protocol',
    tags: ['neurology', 'stroke', 'tpa', 'thrombolysis'],
    content: `## FAST Assessment
- **F**ace drooping
- **A**rm weakness
- **S**peech difficulty
- **T**ime to call

## Immediate Actions
- Non-contrast CT head STAT
- Blood glucose (exclude hypoglycaemia)
- 12-lead ECG
- Target BP <185/110 before thrombolysis

## Thrombolysis Criteria
- Symptom onset <4.5 hours
- No haemorrhage on CT
- No recent surgery/trauma
- Dose: Alteplase 0.9mg/kg (max 90mg)

## Contraindications
- INR >1.7, platelets <100
- BP >185/110 uncontrolled
- Blood glucose <2.8 or >22.2`,
    author_id: '3',
    author_name: 'Dr. James Chen',
    status: 'approved',
    version: 3,
    created_at: '2024-01-25',
    updated_at: '2024-11-20',
    views: 267,
    department_id: '3'
  },
  {
    id: '8',
    title: 'Diabetic Ketoacidosis (DKA) Protocol',
    category: 'protocol',
    tags: ['endocrinology', 'diabetes', 'dka', 'emergency'],
    content: `## Diagnostic Criteria
- Glucose >11mmol/L
- Ketones >3mmol/L or urine ketones ≥2+
- pH <7.3 or bicarbonate <15

## Fluid Replacement
- 1L 0.9% NaCl over 1hr
- 1L over next 2hrs
- 1L over next 2hrs
- Then 1L over 4hrs

## Insulin Infusion
- Start when K+ >3.5mmol/L
- 0.1 units/kg/hr fixed rate
- Add 10% glucose when BG <14mmol/L

## Potassium
- K+ <3.5: 40mmol/hr, no insulin
- K+ 3.5-5.5: 20-40mmol/hr with insulin
- K+ >5.5: No KCl, check hourly`,
    author_id: '3',
    author_name: 'Dr. James Chen',
    status: 'approved',
    version: 2,
    created_at: '2024-02-20',
    updated_at: '2024-11-05',
    views: 203,
    department_id: '4'
  },
  {
    id: '9',
    title: 'Paediatric Fever Management',
    category: 'guideline',
    tags: ['paediatrics', 'fever', 'temperature'],
    content: `## Definition
Fever = rectal temp ≥38°C (100.4°F)

## Red Flags (immediate review)
- Age <3 months with any fever
- Petechial/purpuric rash
- Bulging fontanelle
- Stiff neck
- Prolonged seizure

## Antipyretics
**Paracetamol**: 15mg/kg every 4-6hrs (max 4 doses/24hr)
**Ibuprofen** (>3 months): 5-10mg/kg every 6-8hrs

## Do Not Use
- Aspirin (Reye syndrome risk)
- Alternating antipyretics routinely`,
    author_id: '4',
    author_name: 'Emily Davis',
    status: 'approved',
    version: 1,
    created_at: '2024-03-10',
    updated_at: '2024-03-10',
    views: 134,
    department_id: '4'
  },
  {
    id: '10',
    title: 'Anaphylaxis Management',
    category: 'protocol',
    tags: ['emergency', 'allergy', 'anaphylaxis', 'adrenaline'],
    content: `## Recognition
- Sudden onset
- Life-threatening airway/breathing/circulation compromise
- Skin changes (urticaria, angioedema)

## Immediate Treatment
1. **Adrenaline (Epinephrine)** IM 0.5mg (0.5ml of 1:1000) anterolateral thigh
2. Call for help
3. Lay patient flat (legs elevated if shocked)
4. High-flow oxygen 15L/min

## Second-line
- Chlorphenamine 10mg IV
- Hydrocortisone 200mg IV
- Salbutamol nebuliser for bronchospasm

## Repeat Adrenaline
Every 5 minutes if no improvement

## Discharge Criteria
Observe minimum 6hrs; 12hrs if severe`,
    author_id: '4',
    author_name: 'Emily Davis',
    status: 'approved',
    version: 2,
    created_at: '2024-02-15',
    updated_at: '2024-10-01',
    views: 289,
    department_id: '6'
  },
  {
    id: '11',
    title: 'Hand Hygiene SOP',
    category: 'sop',
    tags: ['infection-control', 'hygiene', 'who'],
    content: `## WHO 5 Moments
1. Before touching a patient
2. Before clean/aseptic procedure
3. After body fluid exposure risk
4. After touching a patient
5. After touching patient surroundings

## Technique (20-30 seconds)
1. Wet hands with water
2. Apply soap (palm to palm)
3. Right palm over left dorsum (vice versa)
4. Palm to palm fingers interlaced
5. Backs of fingers to opposing palms
6. Rotational rubbing of thumbs
7. Rinse and dry

## Alcohol Rub (20-30 seconds)
Apply to dry hands; rub until dry`,
    author_id: '1',
    author_name: 'Admin User',
    status: 'approved',
    version: 5,
    created_at: '2024-01-01',
    updated_at: '2024-09-01',
    views: 534
  },
  {
    id: '12',
    title: 'IV Cannulation Procedure',
    category: 'sop',
    tags: ['nursing', 'iv-access', 'cannula', 'procedure'],
    content: `## Equipment
- Cannula (18G green / 20G pink / 22G blue)
- Tourniquet, alcohol swab
- Tegaderm dressing, IV bung/extension set
- Gloves, sharps bin

## Procedure
1. Identify patient, explain procedure
2. Select vein (antecubital fossa preferred)
3. Apply tourniquet 10cm above site
4. Clean site with alcohol swab — 30 seconds dry time
5. Insert cannula bevel up at 10-30°
6. See flashback → advance 2mm → advance cannula
7. Remove stylet, release tourniquet
8. Apply bung, flush with 5ml 0.9% NaCl
9. Secure with Tegaderm

## Documentation
Record date, time, gauge, site, operator`,
    author_id: '4',
    author_name: 'Emily Davis',
    status: 'approved',
    version: 2,
    created_at: '2024-02-01',
    updated_at: '2024-08-15',
    views: 312
  },
  {
    id: '13',
    title: 'Morphine (Opioid) Drug Information',
    category: 'drug_info',
    tags: ['opioid', 'morphine', 'analgesia', 'palliative'],
    content: `## Drug Class
Opioid analgesic — Schedule II controlled substance

## Indications
- Moderate to severe acute pain
- Chronic cancer pain
- Palliative care
- Acute pulmonary oedema

## Dosing
**IV**: 0.05-0.1mg/kg every 4hrs
**Oral**: 5-20mg every 4hrs (IR); 30-200mg every 12hrs (SR)
**SC**: 2.5-10mg every 4hrs

## Contraindications
- Respiratory depression (RR <12)
- Head injury (pupil assessment)
- Bowel obstruction
- MAO inhibitor use within 14 days

## Reversal
Naloxone 0.4mg IV/IM — repeat every 2-3 minutes`,
    author_id: '5',
    author_name: 'Michael Brown',
    status: 'approved',
    version: 1,
    created_at: '2024-03-20',
    updated_at: '2024-03-20',
    views: 178
  },
  {
    id: '14',
    title: 'Warfarin Anticoagulation Management',
    category: 'drug_info',
    tags: ['anticoagulation', 'warfarin', 'inr', 'bleeding'],
    content: `## Target INR Ranges
| Indication | Target INR |
|------------|------------|
| AF, DVT, PE | 2.0 - 3.0 |
| Mechanical heart valve | 2.5 - 3.5 |
| Recurrent thrombosis | 3.0 - 4.0 |

## Elevated INR Management
**INR 3-5 (no bleed)**: Reduce dose
**INR 5-8 (no bleed)**: Omit 1-2 doses, monitor
**INR >8 (no bleed)**: Omit, Vitamin K 1-5mg oral
**Any INR + major bleed**: 4-factor PCC + Vitamin K 5mg IV

## Interactions (increase INR)
Amiodarone, Fluconazole, Metronidazole, Ciprofloxacin

## Interactions (decrease INR)
Rifampicin, Carbamazepine, St John's Wort`,
    author_id: '5',
    author_name: 'Michael Brown',
    status: 'approved',
    version: 3,
    created_at: '2024-02-10',
    updated_at: '2024-11-01',
    views: 221
  },
  {
    id: '15',
    title: 'CPR and Basic Life Support',
    category: 'training',
    tags: ['cpr', 'bls', 'resuscitation', 'acls'],
    content: `## Adult BLS Algorithm
1. Check safety
2. Check response (shake and shout)
3. Call for help / activate emergency system
4. Open airway (head-tilt chin-lift)
5. Check breathing (10 seconds max)
6. If not breathing: start CPR

## CPR Technique
- **Rate**: 100-120 compressions/min
- **Depth**: 5-6cm
- **Recoil**: Allow full chest recoil
- **Ratio**: 30 compressions : 2 breaths

## AED
- Power on immediately when available
- Attach pads (right clavicle, left axilla)
- Clear patient, deliver shock
- Resume CPR immediately after shock`,
    author_id: '4',
    author_name: 'Emily Davis',
    status: 'approved',
    version: 4,
    created_at: '2024-01-10',
    updated_at: '2024-10-10',
    views: 487,
    department_id: '6'
  },
  {
    id: '16',
    title: 'Infection Control — MRSA Protocol',
    category: 'sop',
    tags: ['infection-control', 'mrsa', 'isolation', 'ppe'],
    content: `## Transmission-Based Precautions
- Contact precautions required
- Single room with en-suite preferred
- Cohort if single room unavailable

## PPE Requirements
- Gloves: always on entering room
- Apron/gown: for direct patient contact
- Mask: if aerosol-generating procedure

## Decolonisation
- **Nasal**: Mupirocin 2% ointment TDS x5 days
- **Body**: Chlorhexidine 4% body wash daily x5 days
- **Hair**: Chlorhexidine shampoo x5 days

## Clearance Criteria
3 negative swabs (nose, groin, wound) taken ≥48hrs apart`,
    author_id: '1',
    author_name: 'Admin User',
    status: 'approved',
    version: 2,
    created_at: '2024-02-05',
    updated_at: '2024-09-15',
    views: 167
  },
  {
    id: '17',
    title: 'Upper GI Bleed Management',
    category: 'protocol',
    tags: ['gastroenterology', 'gi-bleed', 'endoscopy', 'rockall'],
    content: `## Rockall Score (Pre-endoscopy)
| Variable | Score |
|----------|-------|
| Age <60 | 0 |
| Age 60-79 | 1 |
| Age ≥80 | 2 |
| SBP <100 | 2 |
| HR >100 | 1 |
| Comorbidity: IHD/CCF | 2 |
| Comorbidity: Renal/Liver/Cancer | 3 |

## Resuscitation
- 2 large-bore IVs
- Crystalloid resuscitation
- Transfuse if Hb <8 g/dL (or <10 if cardiac)
- Terlipressin if variceal bleed suspected

## Endoscopy
- Within 24hrs (urgent <12hrs if haemodynamically unstable)
- Omeprazole 80mg IV bolus → 8mg/hr infusion pre-endoscopy`,
    author_id: '2',
    author_name: 'Dr. Sarah Wilson',
    status: 'approved',
    version: 2,
    created_at: '2024-03-15',
    updated_at: '2024-11-10',
    views: 143
  },
  {
    id: '18',
    title: 'Acute Kidney Injury (AKI) Guideline',
    category: 'guideline',
    tags: ['nephrology', 'aki', 'renal', 'creatinine'],
    content: `## KDIGO Staging
| Stage | Creatinine Criteria |
|-------|-------------------|
| 1 | 1.5-1.9x baseline or ≥26.5 µmol/L rise |
| 2 | 2.0-2.9x baseline |
| 3 | ≥3x baseline or ≥353.6 µmol/L |

## Causes (AEIOU)
- **A**: Acute tubular necrosis
- **E**: Electrolyte — hypovolaemia
- **I**: Infection/inflammation
- **O**: Obstruction
- **U**: Underperfusion

## Management
1. Stop nephrotoxic drugs (NSAIDs, ACEi, contrast)
2. Fluid challenge if volume depleted
3. Monitor K+, bicarbonate closely
4. Dialysis if: oliguria >12hrs, K+ >6.5, pH <7.2, pulmonary oedema`,
    author_id: '3',
    author_name: 'Dr. James Chen',
    status: 'approved',
    version: 1,
    created_at: '2024-04-01',
    updated_at: '2024-10-20',
    views: 189
  },
  {
    id: '19',
    title: 'Blood Transfusion SOP',
    category: 'sop',
    tags: ['transfusion', 'blood', 'crossmatch', 'safety'],
    content: `## Pre-Transfusion Checks
1. Valid group & screen (sample <72hrs)
2. Prescriber details and indication
3. Consent obtained and documented

## Bedside Verification (Two nurses)
- Patient ID band vs blood bag label
- ABO/RhD compatibility
- Expiry date
- Visual inspection (clots, discolouration)

## Monitoring
- Baseline obs before starting
- 15 min after start (attend bedside)
- Every 60 min during transfusion
- 1hr post-completion

## Transfusion Reactions
**Febrile**: Paracetamol, slow rate, monitor
**Urticarial**: Chlorphenamine 10mg IV, continue slowly
**Haemolytic**: STOP immediately, saline, notify blood bank`,
    author_id: '4',
    author_name: 'Emily Davis',
    status: 'approved',
    version: 3,
    created_at: '2024-01-30',
    updated_at: '2024-10-05',
    views: 245
  },
  {
    id: '20',
    title: 'Acute Pain Management',
    category: 'guideline',
    tags: ['pain', 'analgesia', 'who-ladder', 'multimodal'],
    content: `## WHO Pain Ladder
**Step 1** (Mild pain 1-3): Paracetamol ± NSAIDs
**Step 2** (Moderate pain 4-6): Weak opioid (Codeine/Tramadol)
**Step 3** (Severe pain 7-10): Strong opioid (Morphine)

## Regular Assessment
- Numeric Rating Scale (0-10) every 4hrs
- Document pain, sedation, respiratory rate

## Paracetamol
- 1g every 4-6hrs (max 4g/24hrs)
- Reduce to 500mg if <50kg or hepatic impairment

## NSAIDs
- Ibuprofen 400mg TDS with food
- Avoid if renal impairment, peptic ulcer, >75yrs
- Add PPI if high GI risk`,
    author_id: '2',
    author_name: 'Dr. Sarah Wilson',
    status: 'approved',
    version: 2,
    created_at: '2024-02-25',
    updated_at: '2024-11-25',
    views: 312
  },
  {
    id: '21',
    title: 'ECG Interpretation Guide',
    category: 'training',
    tags: ['ecg', 'cardiology', 'arrhythmia', 'interpretation'],
    content: `## Systematic Approach
1. Rate (normal 60-100 bpm)
2. Rhythm (regular/irregular)
3. P-waves (present, morphology)
4. PR interval (120-200ms)
5. QRS (narrow <120ms / broad ≥120ms)
6. QT interval (corrected <440ms men, <460ms women)
7. ST segment (elevation/depression)
8. T waves (inversion, hyperacuity)

## Common Abnormalities
**AF**: Absent P-waves, irregularly irregular
**STEMI**: ST elevation ≥1mm in 2 contiguous leads
**LBBB**: Broad QRS, negative in V1, positive in V6, M-pattern
**VT**: Broad complex tachycardia, rate 100-250`,
    author_id: '2',
    author_name: 'Dr. Sarah Wilson',
    status: 'approved',
    version: 2,
    created_at: '2024-03-01',
    updated_at: '2024-11-01',
    views: 356,
    department_id: '1'
  },
  {
    id: '22',
    title: 'Metformin Drug Information',
    category: 'drug_info',
    tags: ['diabetes', 'metformin', 'biguanide', 't2dm'],
    content: `## Drug Class
Biguanide — first-line T2DM therapy

## Mechanism
Decreases hepatic glucose production; increases insulin sensitivity

## Dosing
- Start: 500mg BD with meals
- Titrate by 500mg weekly
- Max: 2000-2500mg/day in divided doses

## Contraindications
- eGFR <30 ml/min (use with caution <45)
- Acute illness, dehydration
- IV contrast (hold 48hrs before and after)
- Hepatic impairment

## Side Effects
- GI: nausea, diarrhoea (take with food, slow titration)
- Lactic acidosis (rare, risk increases with renal impairment)
- B12 deficiency with long-term use`,
    author_id: '5',
    author_name: 'Michael Brown',
    status: 'approved',
    version: 2,
    created_at: '2024-03-25',
    updated_at: '2024-09-25',
    views: 198
  },
  {
    id: '23',
    title: 'Falls Prevention Protocol',
    category: 'sop',
    tags: ['patient-safety', 'falls', 'elderly', 'risk-assessment'],
    content: `## Risk Assessment (Morse Fall Scale)
| Factor | Score |
|--------|-------|
| History of falling | 25 |
| Secondary diagnosis | 15 |
| Ambulatory aid | 15-30 |
| IV/heparin lock | 20 |
| Gait: weak/impaired | 10-20 |
| Mental status: overestimates ability | 15 |

**High Risk**: ≥45 points → Implement all measures

## Prevention Measures
- Yellow fall risk wristband
- Bed in lowest position, brakes on
- Call bell within reach
- Non-slip footwear
- Bedside rails up
- Hourly rounding
- Commode at bedside if mobility reduced

## Post-Fall
- Assess for injury
- Document: time, circumstances, witnesses
- Incident report within 24hrs`,
    author_id: '4',
    author_name: 'Emily Davis',
    status: 'approved',
    version: 2,
    created_at: '2024-02-20',
    updated_at: '2024-08-20',
    views: 278
  },
  {
    id: '24',
    title: 'Neonatal Resuscitation',
    category: 'protocol',
    tags: ['neonatal', 'resuscitation', 'newborn', 'paediatrics'],
    content: `## Initial Assessment
- Term? Tone? Breathing/crying?
- If all YES: routine care
- If any NO: proceed to resuscitation

## Steps (Golden Minute)
1. **Warm**: Dry, remove wet towels, radiant warmer
2. **Airway**: Position, suction if needed
3. **Stimulate**: Rub back, flick feet
4. Assess breathing and HR

## Positive Pressure Ventilation (PPV)
- HR <100 or apnoeic
- Rate: 40-60 breaths/min
- FiO2: 0.21 for term; 0.30 for preterm

## Chest Compressions
- HR <60 despite 30 secs PPV
- 3:1 compression:ventilation ratio
- Rate: 90 compressions + 30 breaths/min`,
    author_id: '4',
    author_name: 'Emily Davis',
    status: 'approved',
    version: 1,
    created_at: '2024-04-10',
    updated_at: '2024-04-10',
    views: 112,
    department_id: '4'
  },
  {
    id: '25',
    title: 'Fluid Management in ICU',
    category: 'guideline',
    tags: ['icu', 'fluids', 'resuscitation', 'haemodynamics'],
    content: `## ROSE Model Phases
1. **Rescue**: Rapid fluid for haemodynamic collapse
2. **Optimise**: Goal-directed fluid for tissue perfusion
3. **Stabilise**: Minimal fluid, conservative approach
4. **Evacuation**: De-resuscitation (net negative balance)

## Fluid Responsiveness Assessment
- Passive Leg Raise (PLR) test
- Stroke volume variation (SVV) >13% on ventilator
- Pulse pressure variation (PPV) >13%

## Crystalloids
- 0.9% NaCl: risk of hyperchloraemic acidosis
- Hartmann's/Ringer's Lactate: preferred for large volumes
- Avoid dextrose for resuscitation`,
    author_id: '2',
    author_name: 'Dr. Sarah Wilson',
    status: 'approved',
    version: 2,
    created_at: '2024-03-08',
    updated_at: '2024-10-08',
    views: 234,
    department_id: '6'
  },
  {
    id: '26',
    title: 'Pressure Ulcer Prevention (Braden Scale)',
    category: 'sop',
    tags: ['nursing', 'pressure-ulcer', 'skin', 'braden'],
    content: `## Braden Scale Subscales
1. Sensory perception (1-4)
2. Moisture (1-4)
3. Activity (1-4)
4. Mobility (1-4)
5. Nutrition (1-4)
6. Friction and shear (1-3)

**Total 6-23: Lower = higher risk**
- ≤9: Very high risk
- 10-12: High risk
- 13-14: Moderate risk
- 15-18: Mild risk

## Prevention Bundle
- 2-hourly repositioning (document)
- Pressure-redistributing mattress for high risk
- Barrier cream for moisture
- Nutritional assessment and supplementation
- Gentle skin inspection each shift`,
    author_id: '4',
    author_name: 'Emily Davis',
    status: 'approved',
    version: 3,
    created_at: '2024-02-12',
    updated_at: '2024-09-12',
    views: 189
  },
  {
    id: '27',
    title: 'Insulin Administration SOP',
    category: 'sop',
    tags: ['diabetes', 'insulin', 'nursing', 'subcutaneous'],
    content: `## Types and Onset
| Type | Onset | Peak | Duration |
|------|-------|------|----------|
| Rapid (Lispro/Aspart) | 15min | 1-2hr | 3-5hr |
| Short (Actrapid) | 30min | 2-4hr | 6-8hr |
| Intermediate (NPH) | 2-4hr | 4-10hr | 10-18hr |
| Long (Glargine/Detemir) | 2-4hr | Flat | 20-24hr |

## Administration
- Sites: abdomen, outer thigh, upper arm, buttocks
- Rotate sites systematically
- 90° angle injection for most; 45° for thin patients
- Do NOT massage after injection

## Two-Nurse Check (hospital)
- Verify: patient ID, insulin type, dose, expiry
- Document glucose and insulin given together`,
    author_id: '5',
    author_name: 'Michael Brown',
    status: 'approved',
    version: 2,
    created_at: '2024-02-28',
    updated_at: '2024-09-28',
    views: 267
  },
  {
    id: '28',
    title: 'Mental Health — Acute Psychiatric Assessment',
    category: 'guideline',
    tags: ['psychiatry', 'mental-health', 'assessment', 'risk'],
    content: `## MSE Components
- **A**ppearance and behaviour
- **S**peech
- **M**ood and affect
- **T**hought form and content
- **P**erception (hallucinations)
- **C**ognition (MMSE/ACE-III)
- **I**nsight and judgement

## Risk Assessment
**Suicide risk factors**: Previous attempts, plan, access to means, social isolation, substance use, hopelessness

## Safety Planning
1. Remove means if possible
2. Support network identification
3. Crisis contact numbers
4. Coping strategies
5. Escalation plan`,
    author_id: '3',
    author_name: 'Dr. James Chen',
    status: 'pending_approval',
    version: 1,
    created_at: '2024-04-15',
    updated_at: '2024-12-01',
    views: 98,
    reviewer_id: '1',
  },
  {
    id: '29',
    title: 'Aseptic Non-Touch Technique (ANTT)',
    category: 'sop',
    tags: ['infection-control', 'sterile', 'antt', 'catheter'],
    content: `## Key Parts
Parts that must NOT be touched or contaminated:
- Needle tips
- Catheter tips
- Inner surface of syringe
- Wound contact parts of dressings

## Standard ANTT
For low-complexity, short procedures:
- Clean field technique
- Non-sterile gloves acceptable
- Alcohol hand rub + clean procedure field

## Surgical ANTT
For complex/long procedures:
- Critical aseptic field
- Sterile gloves
- Full sterile drape and equipment

## Key Principles
- Identify and protect key parts at all times
- Never touch key parts — even with gloves`,
    author_id: '4',
    author_name: 'Emily Davis',
    status: 'approved',
    version: 2,
    created_at: '2024-03-18',
    updated_at: '2024-08-18',
    views: 203
  },
  {
    id: '30',
    title: 'Nasogastric Tube Insertion SOP',
    category: 'sop',
    tags: ['nursing', 'ngt', 'enteral-feeding', 'placement'],
    content: `## Equipment
- NGT (size 12-16 Fr for adults)
- Lubricant, syringe (50ml), pH strips
- Securing tape, gloves, apron

## Procedure
1. Explain procedure; position upright
2. Measure tube: nose → earlobe → xiphisternum
3. Lubricate tip; pass through nostril
4. Ask patient to swallow repeatedly
5. Advance to measured mark
6. Secure temporarily

## Confirming Position (NPSA)
1. Aspirate and test pH ≤5.5 (safe to proceed)
2. If pH 5-6: retest or X-ray
3. X-ray: tip in stomach below diaphragm, left of midline

## NEVER rely on:
- Auscultation ("whoosh" test)
- Appearance of aspirate alone`,
    author_id: '4',
    author_name: 'Emily Davis',
    status: 'approved',
    version: 3,
    created_at: '2024-01-22',
    updated_at: '2024-10-22',
    views: 234
  },
  {
    id: '31',
    title: 'Palliative Care — Symptom Control',
    category: 'guideline',
    tags: ['palliative', 'end-of-life', 'symptom', 'syringe-driver'],
    content: `## Last Days of Life Recognition
- Bedbound, only sips of fluid
- Profound weakness, drowsiness
- Semi-comatose/comatose
- Mottled skin, Cheyne-Stokes breathing

## Syringe Driver (CSCI) — Common Drugs
| Drug | Dose (24hr) | Indication |
|------|-------------|------------|
| Morphine | 10-30mg | Pain, dyspnoea |
| Midazolam | 10-20mg | Agitation, myoclonus |
| Haloperidol | 1.5-5mg | Nausea, agitation |
| Hyoscine | 0.4-2.4mg | Secretions ("death rattle") |

## Anticipatory Medications
Prescribe PRN for:
- Pain: Morphine SC
- Agitation: Midazolam SC
- Nausea: Haloperidol SC
- Secretions: Hyoscine hydrobromide SC`,
    author_id: '2',
    author_name: 'Dr. Sarah Wilson',
    status: 'approved',
    version: 2,
    created_at: '2024-04-20',
    updated_at: '2024-11-20',
    views: 145
  },
  {
    id: '32',
    title: 'Urinary Catheter Care SOP',
    category: 'sop',
    tags: ['nursing', 'catheter', 'urine', 'infection-control'],
    content: `## Indications for Catheterisation
- Acute urinary retention
- Accurate urine output measurement in critically ill
- Urological surgery
- Immobile patients with pressure ulcers

## Catheter Selection
- Short-term (<14 days): Latex/silicone 12-14 Fr
- Long-term: Silicone 14-16 Fr, consider hydrogel coating
- Suprapubic: Specialist insertion

## Care Bundle (CAUTI Prevention)
- Insert using ANTT
- Maintain closed drainage system
- Secure catheter to thigh
- Bag below bladder level, never on floor
- Daily meatal hygiene with soap and water
- Review daily — remove ASAP

## Urine Output Concerns
- <0.5ml/kg/hr for >2hrs → review fluid status`,
    author_id: '4',
    author_name: 'Emily Davis',
    status: 'approved',
    version: 2,
    created_at: '2024-02-08',
    updated_at: '2024-09-08',
    views: 178
  },
  {
    id: '33',
    title: 'Antibiotics in Surgical Prophylaxis',
    category: 'guideline',
    tags: ['surgery', 'antibiotic', 'prophylaxis', 'ssi'],
    content: `## Principles
- Give within 60 minutes before incision
- Single dose usually sufficient
- Repeat if >3hrs operating time
- NOT for post-operative prophylaxis

## Common Regimens
| Surgery | Antibiotic |
|---------|------------|
| Colorectal | Co-amoxiclav 1.2g IV |
| Orthopaedic (implant) | Cefuroxime 1.5g IV |
| Cardiac | Cefuroxime 1.5g IV |
| Gynaecology | Co-amoxiclav 1.2g IV |
| Vascular | Cefuroxime 1.5g IV |

## Penicillin Allergy
- Mild/moderate: Cefuroxime (5% cross-reactivity)
- Severe (anaphylaxis): Clindamycin 600mg IV + Gentamicin`,
    author_id: '3',
    author_name: 'Dr. James Chen',
    status: 'approved',
    version: 2,
    created_at: '2024-03-12',
    updated_at: '2024-10-12',
    views: 156
  },
  {
    id: '34',
    title: 'Venous Thromboembolism (VTE) Prophylaxis',
    category: 'guideline',
    tags: ['vte', 'dvt', 'pe', 'heparin', 'prevention'],
    content: `## Risk Assessment (Caprini Score)
Each factor = points:
- Age 41-60: 1 | Age 61-74: 2 | Age ≥75: 3
- Major surgery: 2 | Hip/knee replacement: 5
- Cancer: 3 | Prior VTE: 3
- Obesity BMI >25: 1

**High risk (≥3)**: Pharmacological prophylaxis

## Pharmacological Options
**Enoxaparin (LMWH)**:
- Medical: 40mg SC OD
- Surgical: 40mg SC OD (start 12hrs pre or post-op)
- Renal impairment (eGFR <30): Unfractionated Heparin 5000u SC BD

## Mechanical
- TED stockings (if not contraindicated)
- Intermittent pneumatic compression`,
    author_id: '2',
    author_name: 'Dr. Sarah Wilson',
    status: 'approved',
    version: 3,
    created_at: '2024-02-14',
    updated_at: '2024-11-14',
    views: 287
  },
  {
    id: '35',
    title: 'Medication Reconciliation SOP',
    category: 'sop',
    tags: ['medication-safety', 'reconciliation', 'admission', 'pharmacy'],
    content: `## Definition
Formal process of comparing a patient's medication orders to all medications the patient has been taking.

## Process (MATCH)
- **M**edication history from 3 sources minimum
- **A**ssess for interactions, duplications, omissions
- **T**ranscribe accurately to inpatient chart
- **C**ommunicate changes to patient
- **H**andover documented at discharge

## Sources of Truth
1. Patient/carer interview
2. Community pharmacy records
3. GP referral letter / medication list
4. Pharmacy system record

## High-Risk Medications (extra checks)
Insulin, anticoagulants, opioids, digoxin, lithium, methotrexate, immunosuppressants`,
    author_id: '5',
    author_name: 'Michael Brown',
    status: 'approved',
    version: 2,
    created_at: '2024-02-18',
    updated_at: '2024-09-18',
    views: 213
  },
  {
    id: '36',
    title: 'Oxygen Therapy Guidelines',
    category: 'guideline',
    tags: ['respiratory', 'oxygen', 'spo2', 'copd'],
    content: `## Target Saturations
- **Most patients**: 94-98%
- **COPD / hypercapnia risk**: 88-92%
- **CO poisoning**: 100% regardless

## Delivery Devices
| Device | FiO2 | Flow Rate |
|--------|------|-----------|
| Nasal cannula | 24-44% | 1-4 L/min |
| Simple face mask | 35-60% | 5-10 L/min |
| Non-rebreather mask | 60-90% | 10-15 L/min |
| Venturi mask | 24-60% | Fixed |

## Weaning Oxygen
- Reduce by 1-2 L/min increments
- Allow 5-10 minutes between reductions
- Maintain target saturation throughout`,
    author_id: '2',
    author_name: 'Dr. Sarah Wilson',
    status: 'approved',
    version: 2,
    created_at: '2024-03-22',
    updated_at: '2024-10-22',
    views: 198
  },
  {
    id: '37',
    title: 'Chemotherapy Extravasation Protocol',
    category: 'protocol',
    tags: ['oncology', 'chemotherapy', 'extravasation', 'emergency'],
    content: `## Recognition
- Pain, burning, stinging at IV site
- Swelling, erythema, induration
- No blood return or resistance

## Immediate Actions
1. STOP infusion immediately
2. Leave cannula in place
3. Aspirate as much drug as possible
4. Remove cannula
5. Photograph and document site
6. Notify oncology team and pharmacy

## Vesicant-Specific Antidotes
- **Anthracyclines** (Doxorubicin): DMSO or Dexrazoxane
- **Vinca alkaloids**: Hyaluronidase + warm compress
- **Taxanes**: No antidote; cold compress

## Documentation
Full incident report; arrange surgical review if severe`,
    author_id: '3',
    author_name: 'Dr. James Chen',
    status: 'draft',
    version: 1,
    created_at: '2024-04-25',
    updated_at: '2024-11-25',
    views: 67,
    notes: 'Awaiting updated guidelines from oncology pharmacy before submission.',
  },
  {
    id: '38',
    title: 'AVPU and GCS Neurological Assessment',
    category: 'training',
    tags: ['neurology', 'gcs', 'avpu', 'consciousness'],
    content: `## AVPU Scale
- **A** — Alert
- **V** — Responds to Voice
- **P** — Responds to Pain
- **U** — Unresponsive

Any response <A → escalate

## Glasgow Coma Scale
| Component | Response | Score |
|-----------|----------|-------|
| Eyes | Spontaneous | 4 |
| | To voice | 3 |
| | To pain | 2 |
| | None | 1 |
| Verbal | Orientated | 5 |
| | Confused | 4 |
| | Words | 3 |
| | Sounds | 2 |
| | None | 1 |
| Motor | Obeys | 6 |
| | Localises | 5 |
| | Withdraws | 4 |
| | Flexion | 3 |
| | Extension | 2 |
| | None | 1 |

**GCS 8 or less = Coma → airway at risk**`,
    author_id: '3',
    author_name: 'Dr. James Chen',
    status: 'approved',
    version: 1,
    created_at: '2024-03-28',
    updated_at: '2024-03-28',
    views: 289
  },
  {
    id: '39',
    title: 'Medication Error Reporting SOP',
    category: 'sop',
    tags: ['medication-safety', 'incident', 'reporting', 'near-miss'],
    content: `## Definition of Medication Error
Any preventable event that may cause or lead to inappropriate medication use or patient harm.

## Categories
- **Wrong drug**: Different drug from prescribed
- **Wrong dose**: Dose differs from prescribed
- **Wrong route**: Different route used
- **Wrong time**: Outside ±1hr window
- **Wrong patient**: Given to incorrect patient
- **Omission**: Dose not given

## Reporting Process
1. Ensure patient safety (assess for harm)
2. Notify nurse in charge and prescriber
3. Document in clinical notes
4. Complete incident report within 24hrs
5. Pharmacy notification for all errors

## Near Miss
Must also be reported — valuable learning opportunity
Same process as actual error`,
    author_id: '5',
    author_name: 'Michael Brown',
    status: 'approved',
    version: 2,
    created_at: '2024-02-22',
    updated_at: '2024-09-22',
    views: 145
  },
  {
    id: '40',
    title: 'Acute Alcohol Withdrawal Protocol',
    category: 'protocol',
    tags: ['alcohol', 'withdrawal', 'ciwa', 'benzodiazepine'],
    content: `## CIWA-Ar Score Assessment
Assess q4-8hrs; ≥10 = pharmacological treatment

Scored components:
- Nausea/vomiting (0-7)
- Tremor (0-7)
- Paroxysmal sweats (0-7)
- Anxiety (0-7)
- Agitation (0-7)
- Tactile disturbances (0-7)
- Visual disturbances (0-7)
- Headache (0-7)
- Orientation (0-4)

## Treatment
**CIWA 8-15**: Diazepam 10mg oral q6hrs PRN
**CIWA >15**: Diazepam 20mg oral; reassess q2hrs

## Wernicke's Prophylaxis (ALL patients)
Pabrinex (Thiamine) IV 2 pairs TDS x3 days, then oral Thiamine 100mg TDS

## Seizure Risk
High risk: prior withdrawal seizures, concurrent illness, CIWA >20`,
    author_id: '2',
    author_name: 'Dr. Sarah Wilson',
    status: 'approved',
    version: 1,
    created_at: '2024-04-05',
    updated_at: '2024-11-05',
    views: 112
  },
  {
    id: '41',
    title: 'Skin Integrity Assessment (SSKIN)',
    category: 'sop',
    tags: ['nursing', 'skin', 'pressure-injury', 'wound'],
    content: `## SSKIN Bundle
- **S**urface: Appropriate pressure-relieving surface
- **S**kin inspection: Regularly assess skin
- **K**eep moving: Reposition regularly
- **I**ncontinence: Manage moisture
- **N**utrition and hydration: Ensure adequate

## Wound Assessment
Document:
- Location (body map)
- Size: length x width x depth (cm)
- Wound bed: granulating/sloughy/necrotic/epithelialising
- Exudate: amount and character
- Periwound skin: macerated/erythematous/intact
- Odour

## Dressing Selection
**Dry wound**: Hydrogel/hydrocolloid
**Moderate exudate**: Foam dressing
**Heavy exudate**: Alginate or hydrofibre
**Infected**: Silver-containing dressing`,
    author_id: '4',
    author_name: 'Emily Davis',
    status: 'approved',
    version: 2,
    created_at: '2024-03-05',
    updated_at: '2024-10-05',
    views: 167
  },
  {
    id: '42',
    title: 'Paediatric Dehydration Assessment',
    category: 'guideline',
    tags: ['paediatrics', 'dehydration', 'fluids', 'rehydration'],
    content: `## Clinical Assessment
| Sign | Mild (3-5%) | Moderate (6-9%) | Severe (≥10%) |
|------|-------------|-----------------|----------------|
| Mucous membranes | Slightly dry | Dry | Very dry |
| Eyes | Normal | Sunken | Very sunken |
| Skin turgor | Normal | Reduced | Very reduced |
| Capillary refill | <2s | 2-3s | >3s |
| Mental status | Alert | Irritable | Lethargic |

## Oral Rehydration (Mild/Moderate)
- ORS 50-100ml/kg over 4hrs
- Ongoing losses: 10ml/kg per loose stool

## IV Fluids (Severe)
- 10-20ml/kg 0.9% NaCl bolus
- Reassess and repeat if still shocked
- Total deficit replacement over 48hrs`,
    author_id: '4',
    author_name: 'Emily Davis',
    status: 'approved',
    version: 1,
    created_at: '2024-04-12',
    updated_at: '2024-04-12',
    views: 134,
    department_id: '4'
  },
  {
    id: '43',
    title: 'Handover Communication (ISBAR)',
    category: 'training',
    tags: ['communication', 'handover', 'isbar', 'patient-safety'],
    content: `## ISBAR Framework

**I — Identify**
- Your name and role
- Patient name, DOB, ward, bed number

**S — Situation**
- Why you are calling / current concern
- Vital signs
- Level of consciousness

**B — Background**
- Admission diagnosis
- Relevant medical history
- Current medications

**A — Assessment**
- Your clinical impression
- What do you think is happening?

**R — Recommendation**
- What you need from the person you're calling
- Review? Order? Escalate?

## Tips
- Use ISBAR for all escalations and shift handovers
- Do not interrupt unless safety concern
- Read back critical values`,
    author_id: '1',
    author_name: 'Admin User',
    status: 'approved',
    version: 3,
    created_at: '2024-01-08',
    updated_at: '2024-10-08',
    views: 378
  },
  {
    id: '44',
    title: 'Diabetes Sick Day Rules',
    category: 'guideline',
    tags: ['diabetes', 'sick-day', 'insulin', 'ketones'],
    content: `## Core Message
NEVER stop insulin when unwell — requirements often INCREASE

## Monitoring
- Blood glucose every 2-4 hours
- Urine/blood ketones if glucose >15mmol/L
- Fluid intake and output

## Fluid Replacement
- Small, frequent sips if nauseated
- Sugary drinks if glucose <10mmol/L
- Sugar-free if glucose >10mmol/L
- Target 3L/day

## Seek Medical Help if:
- Vomiting and unable to keep fluids down
- Blood ketones >3mmol/L
- Glucose >20mmol/L despite correction
- Signs of DKA (Kussmaul breathing, fruity odour)

## Medications to STOP during illness
- Metformin (AKI risk)
- SGLT2 inhibitors (DKA risk)`,
    author_id: '3',
    author_name: 'Dr. James Chen',
    status: 'approved',
    version: 2,
    created_at: '2024-03-30',
    updated_at: '2024-10-30',
    views: 187
  },
  {
    id: '45',
    title: 'NEWS2 (National Early Warning Score)',
    category: 'training',
    tags: ['news2', 'early-warning', 'deterioration', 'escalation'],
    content: `## Scored Parameters
| Parameter | 3 | 2 | 1 | 0 | 1 | 2 | 3 |
|-----------|---|---|---|---|---|---|---|
| SpO2 (Scale 1) | ≤91 | 92-93 | 94-95 | ≥96 | | | |
| Air or O2 | | O2 | | Air | | | |
| Systolic BP | ≤90 | 91-100 | 101-110 | 111-219 | | | ≥220 |
| Pulse | ≤40 | | 41-50 | 51-90 | 91-110 | 111-130 | ≥131 |
| Consciousness | | | | A | | | CVPU |
| Temperature | ≤35.0 | | 35.1-36.0 | 36.1-38.0 | 38.1-39.0 | ≥39.1 | |
| RR | ≤8 | | 9-11 | 12-20 | | 21-24 | ≥25 |

## Response Thresholds
- **0**: 12-hourly monitoring
- **1-4**: Minimum 4-hourly monitoring
- **5-6 or any 3**: Urgent review by clinician
- **7+**: Emergency assessment (consider HDU/ICU)`,
    author_id: '4',
    author_name: 'Emily Davis',
    status: 'approved',
    version: 2,
    created_at: '2024-01-12',
    updated_at: '2024-10-12',
    views: 423
  },
  {
    id: '46',
    title: 'Enteral Nutrition Guidelines',
    category: 'guideline',
    tags: ['nutrition', 'enteral', 'ngt', 'feeding'],
    content: `## Indications
- Unable to swallow safely
- Inadequate oral intake (less than 60% needs >3 days)
- Malnutrition or high nutritional risk (MUST score ≥2)

## MUST Score
1. BMI score (0-2)
2. Weight loss score (0-2)
3. Acute disease effect (0 or 2)
Total ≥2 = High risk → dietitian referral

## Starting Enteral Feeding
- Confirm NGT position before EVERY feed
- Start at 30ml/hr; increase by 10-20ml/hr each 4-6hrs
- Target rate usually 60-90ml/hr

## Refeeding Syndrome
- Risk: BMI <14, weight loss >15%, minimal intake >10 days
- Check K+, Mg2+, PO4 before and daily for 5 days
- Start at 20 kcal/kg/day max; increase over 3-5 days
- Pabrinex (Thiamine) prophylaxis`,
    author_id: '5',
    author_name: 'Michael Brown',
    status: 'approved',
    version: 1,
    created_at: '2024-04-18',
    updated_at: '2024-04-18',
    views: 123
  },
  {
    id: '47',
    title: 'Acute Liver Failure Protocol',
    category: 'protocol',
    tags: ['hepatology', 'liver', 'paracetamol', 'n-acetylcysteine'],
    content: `## King's College Criteria (Paracetamol)
**Transplant listing if ANY:**
- Arterial pH <7.3 after resuscitation
OR all three:
- PT >100s (INR >6.5)
- Creatinine >300 µmol/L
- Grade III/IV encephalopathy

## N-Acetylcysteine (NAC) for Paracetamol OD
- Within 8hrs: highest efficacy
- 8-24hrs: still beneficial
- >24hrs: consider if still deteriorating

## Regimen
1. 150mg/kg in 200ml 5% dextrose over 60min
2. 50mg/kg in 500ml 5% dextrose over 4hrs
3. 100mg/kg in 1000ml 5% dextrose over 16hrs

## Monitoring
- INR, creatinine, bilirubin every 12hrs
- Blood glucose hourly (hypoglycaemia risk)`,
    author_id: '2',
    author_name: 'Dr. Sarah Wilson',
    status: 'approved',
    version: 1,
    created_at: '2024-04-22',
    updated_at: '2024-11-22',
    views: 89
  },
  {
    id: '48',
    title: 'Surgical Site Infection Prevention',
    category: 'guideline',
    tags: ['surgery', 'infection', 'ssi', 'prevention', 'wound'],
    content: `## Pre-operative
- Shower with chlorhexidine soap night before and morning of surgery
- Nasal decolonisation with Mupirocin (Staph aureus carriers)
- Hair removal: clippers at time of surgery (NOT razors)
- Normoglycaemia: BG 6-10 mmol/L
- Antibiotic prophylaxis (see Surgical Prophylaxis guideline)

## Intra-operative
- Maintain normothermia (>36°C)
- Supplemental oxygen FiO2 >0.8
- Irrigation with saline before closure

## Post-operative
- Dressing change: 48hrs using ANTT
- Wound inspection at each dressing change
- Document: closure type, drain output, skin integrity

## SSI Diagnosis
Infection within 30 days (or 90 days if implant)`,
    author_id: '3',
    author_name: 'Dr. James Chen',
    status: 'approved',
    version: 2,
    created_at: '2024-03-08',
    updated_at: '2024-10-08',
    views: 134
  },
  {
    id: '49',
    title: 'Nausea and Vomiting — Antiemetic Guideline',
    category: 'guideline',
    tags: ['antiemetic', 'nausea', 'vomiting', 'pharmacy'],
    content: `## Step-wise Approach

**Step 1 — Cause-specific**
- Opioid-induced: Haloperidol 0.5-1.5mg SC/oral
- Motion sickness: Hyoscine 300mcg sublingual
- Gastric stasis: Metoclopramide 10mg TDS

**Step 2 — Broad spectrum**
- Ondansetron 4mg BD (5-HT3 antagonist)
- Cyclizine 50mg TDS (antihistamine)

**Step 3 — Refractory**
- Dexamethasone 8mg OD
- Levomepromazine 6mg at night (sedating)

## Avoid
- Metoclopramide >5 days (extrapyramidal)
- Domperidone with QT-prolonging drugs
- Ondansetron with other 5-HT agents (serotonin syndrome)`,
    author_id: '5',
    author_name: 'Michael Brown',
    status: 'approved',
    version: 2,
    created_at: '2024-03-14',
    updated_at: '2024-10-14',
    views: 176
  },
  {
    id: '50',
    title: 'Informed Consent Process',
    category: 'sop',
    tags: ['consent', 'ethics', 'capacity', 'legal'],
    content: `## Legal Framework
Valid consent requires:
1. **Capacity**: Can understand, retain, weigh, communicate
2. **Voluntary**: Free from coercion
3. **Informed**: Adequate information given

## Mental Capacity Assessment (MCA 2005)
Two-stage test:
1. Is there an impairment of the mind/brain?
2. Does this cause inability to decide?

**Unable to decide if cannot:**
- Understand information
- Retain it long enough
- Weigh it up
- Communicate decision

## Documentation
- Consent form: procedure, risks, alternatives, questions asked
- Witnessed where possible
- Copy given to patient

## When Capacity Absent
- Best Interests decision
- Consult family/carers (but they cannot consent for adult)
- Consider Lasting Power of Attorney (LPA)
- IMCA if no one to consult`,
    author_id: '1',
    author_name: 'Admin User',
    status: 'approved',
    version: 3,
    created_at: '2024-01-05',
    updated_at: '2024-09-05',
    views: 312
  },
  {
    id: '51',
    title: 'Laboratory Result Interpretation — Critical Values',
    category: 'training',
    tags: ['laboratory', 'critical-values', 'reporting', 'escalation'],
    content: `## Critical Values (Notify within 1 hour)

| Test | Critical Low | Critical High |
|------|-------------|---------------|
| Sodium (Na+) | <120 mmol/L | >160 mmol/L |
| Potassium (K+) | <2.5 mmol/L | >6.5 mmol/L |
| Glucose | <2.5 mmol/L | >33 mmol/L |
| Calcium | <1.6 mmol/L | >3.5 mmol/L |
| Haemoglobin | <60 g/L | >220 g/L |
| Platelets | <20 x10⁹/L | >1000 x10⁹/L |
| INR | — | >5.0 |
| Troponin | — | Any elevation |

## Notification Process
1. Lab calls clinical area directly
2. Nurse reads back result
3. Notifying clinician documents action taken
4. Lab documents notification time and recipient

## Documentation
Enter in notes: result, who notified, time, action taken`,
    author_id: '6',
    author_name: 'Lisa Anderson',
    status: 'approved',
    version: 2,
    created_at: '2024-02-16',
    updated_at: '2024-09-16',
    views: 289
  },
  {
    id: '52',
    title: 'Constipation Management Protocol',
    category: 'guideline',
    tags: ['constipation', 'laxative', 'bowel', 'opioid-induced'],
    content: `## Stimulant Laxatives (First Line)
- Senna 2-4 tablets at night
- Bisacodyl 5-10mg at night
**Start with opioids — do not wait for constipation**

## Osmotic Laxatives (Add-on)
- Macrogol (Movicol) 1-3 sachets daily in water
- Lactulose 15-30ml BD (slower onset, avoid in diabetes)

## Opioid-Induced Constipation
- Senna + Macrogol first line
- Naloxegol 25mg OD if refractory
- Methylnaltrexone SC if oral route unavailable

## Faecal Impaction
1. Rectal examination
2. Phosphate enema
3. Manual evacuation (last resort, sedation may be needed)`,
    author_id: '5',
    author_name: 'Michael Brown',
    status: 'approved',
    version: 1,
    created_at: '2024-04-28',
    updated_at: '2024-11-28',
    views: 145
  },
  {
    id: '53',
    title: 'Staff Orientation — Hospital Policies Overview',
    category: 'training',
    tags: ['orientation', 'hr', 'policies', 'onboarding'],
    content: `## Mandatory Training (Annual)
- Fire safety and evacuation
- Basic Life Support (BLS)
- Moving and handling
- Information governance
- Infection prevention and control
- Safeguarding (adults and children)

## Code of Conduct
- Professional boundaries with patients/families
- Social media: no patient information, no identification
- Confidentiality: GDPR compliance
- Whistleblowing: protected disclosure policy

## Uniform Policy
- Clean uniform every shift
- No nail polish or false nails (clinical areas)
- Bare below the elbows in clinical areas

## Incident Reporting
- All incidents, near misses, hazards reported online
- Immediate verbal notification to manager
- Duty of candour: honest with patients about errors`,
    author_id: '1',
    author_name: 'Admin User',
    status: 'approved',
    version: 4,
    created_at: '2024-01-02',
    updated_at: '2024-09-02',
    views: 456
  },
  {
    id: '54',
    title: 'Acute Heart Failure Management',
    category: 'protocol',
    tags: ['cardiology', 'heart-failure', 'pulmonary-oedema', 'diuretic'],
    content: `## Immediate Priorities
- Sit patient upright
- High-flow O2 if SpO2 <90% (CPAP if severe)
- IV access x2, 12-lead ECG, CXR

## Furosemide
- If not on diuretics: 40mg IV
- If on diuretics: 1-2.5x daily oral dose IV
- Monitor urine output (catheterise if anuric)
- Target: 0.5-1ml/kg/hr

## GTN (if SBP >100)
- Sublingual 400mcg PRN every 5min x3
- IV infusion: start 10mcg/min, titrate

## Opiates (cautiously)
- Morphine 2-4mg IV for anxiety/dyspnoea
- BUT risk of respiratory depression and vomiting

## Monitoring
- Hourly urine output
- Daily weight
- Electrolytes (K+, Mg2+) twice daily`,
    author_id: '2',
    author_name: 'Dr. Sarah Wilson',
    status: 'approved',
    version: 2,
    created_at: '2024-02-06',
    updated_at: '2024-11-06',
    views: 278,
    department_id: '1'
  },
  {
    id: '55',
    title: 'Drug Allergy and Adverse Reaction Reporting',
    category: 'sop',
    tags: ['allergy', 'adverse-reaction', 'reporting', 'pharmacy'],
    content: `## Definitions
**Adverse Drug Reaction (ADR)**: Unintended harmful effect at normal dose
**Allergy**: Immune-mediated hypersensitivity
**Intolerance**: Non-immune mediated reaction

## Classification
**Type A** (Augmented): Predictable, dose-related (e.g., opioid constipation)
**Type B** (Bizarre): Unpredictable, immune-mediated (e.g., penicillin anaphylaxis)

## Documentation Requirements
- Drug name, dose, route
- Reaction description and timing
- Severity (mild/moderate/severe)
- Treatment given
- Alert added to patient notes prominently

## Reporting
- Yellow Card scheme (MHRA): all suspected ADRs
- Serious reactions: immediate reporting
- Pharmacy review and documentation

## Cross-Reactivity
- Penicillin/Cephalosporins: ~5% cross-reactivity
- Never assume same class is safe without allergy history`,
    author_id: '5',
    author_name: 'Michael Brown',
    status: 'draft',
    version: 1,
    created_at: '2024-04-30',
    updated_at: '2024-12-01',
    views: 34
  },
];
