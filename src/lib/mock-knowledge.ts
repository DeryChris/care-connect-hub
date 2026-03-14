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
  // Add 47 more realistic medical protocols...
  {
    id: '50',
    title: 'Sepsis Management Bundle',
    category: 'protocol',
    tags: ['sepsis', 'emergency', 'criticalcare'],
    content: `## Hour-1 Bundle
**Measure** lactate
**Blood cultures** prior antibiotics  
**Broad spectrum** antibiotics
**Fluids** 30ml/kg crystalloid

## Repeat lactate 2-4hrs
Lactate clearance <10% → escalate`,
    author_id: '1',
    author_name: 'Admin User',
    status: 'draft',
    version: 1,
    created_at: '2024-12-10',
    updated_at: '2024-12-10',
    views: 0
  }
];

