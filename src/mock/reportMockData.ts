export interface LabParameter {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag?: 'H' | 'L' | null; // High or Low
}

export interface LabSection {
  category: string;
  parameters: LabParameter[];
}

export interface LabReport {
  id: string;
  testName: string;
  date: string;
  patientName: string;
  ageSex: string;
  referredBy: string;
  regNo: string;
  registeredOn: string;
  collectedOn: string;
  receivedOn: string;
  reportedOn: string;
  sections: LabSection[];
  clinicalNotes: string;
  interpretation?: string;
}

export const MOCK_REPORTS_DETAILS: Record<string, LabReport> = {
  'REP-001': {
    id: 'REP-001',
    testName: 'Complete Blood Count (CBC)',
    date: '10 May 2026',
    patientName: 'Mr. Saubhik Bhaumik',
    ageSex: '27 YRS / M',
    referredBy: 'Self',
    regNo: '1001',
    registeredOn: '10/05/2026 09:30 AM',
    collectedOn: '10/05/2026 09:45 AM',
    receivedOn: '10/05/2026 11:15 AM',
    reportedOn: '10/05/2026 04:55 PM',
    sections: [
      {
        category: 'HAEMATOLOGY',
        parameters: [
          { name: 'HEMOGLOBIN', value: '12.5', unit: 'g/dl', referenceRange: '13 - 17', flag: 'L' },
          { name: 'TOTAL LEUKOCYTE COUNT', value: '11,200', unit: 'cumm', referenceRange: '4,800 - 10,800', flag: 'H' },
          { name: 'NEUTROPHILS', value: '79', unit: '%', referenceRange: '40 - 80' },
          { name: 'LYMPHOCYTE', value: '18', unit: '%', referenceRange: '20 - 40', flag: 'L' },
          { name: 'EOSINOPHILS', value: '1', unit: '%', referenceRange: '1 - 6' },
          { name: 'MONOCYTES', value: '1', unit: '%', referenceRange: '2 - 10', flag: 'L' },
          { name: 'BASOPHILS', value: '1', unit: '%', referenceRange: '< 2' },
          { name: 'PLATELET COUNT', value: '3.5', unit: 'lakhs/cumm', referenceRange: '1.5 - 4.1' },
          { name: 'TOTAL RBC COUNT', value: '5.0', unit: 'million/cumm', referenceRange: '4.5 - 5.5' },
          { name: 'HEMATOCRIT VALUE, HCT', value: '42', unit: '%', referenceRange: '40 - 50' },
          { name: 'MEAN CORPUSCULAR VOLUME, MCV', value: '84.0', unit: 'fL', referenceRange: '83 - 101' },
          { name: 'MEAN CELL HAEMOGLOBIN, MCH', value: '30.0', unit: 'Pg', referenceRange: '27 - 32' },
          { name: 'MEAN CELL HAEMOGLOBIN CON, MCHC', value: '35.7', unit: '%', referenceRange: '31.5 - 34.5', flag: 'H' },
        ]
      }
    ],
    clinicalNotes: 'A complete blood count (CBC) is used to evaluate overall health and detect a wide range of disorders, including anemia, infection, and leukemia. Elevated WBC and MCHC combined with slightly low Hemoglobin and Lymphocytes suggests mild infection or acute inflammation response.',
  },
  'REP-002': {
    id: 'REP-002',
    testName: 'Lipid Profile',
    date: '15 Apr 2026',
    patientName: 'Mr. Saubhik Bhaumik',
    ageSex: '27 YRS / M',
    referredBy: 'Self',
    regNo: '1001',
    registeredOn: '15/04/2026 07:30 AM',
    collectedOn: '15/04/2026 07:45 AM',
    receivedOn: '15/04/2026 09:15 AM',
    reportedOn: '15/04/2026 02:30 PM',
    sections: [
      {
        category: 'BIOCHEMISTRY',
        parameters: [
          { name: 'TOTAL CHOLESTEROL', value: '195', unit: 'mg/dl', referenceRange: '< 200' },
          { name: 'TRIGLYCERIDES', value: '145', unit: 'mg/dl', referenceRange: '< 150' },
          { name: 'HDL CHOLESTEROL', value: '38', unit: 'mg/dl', referenceRange: '> 40', flag: 'L' },
          { name: 'LDL CHOLESTEROL', value: '128', unit: 'mg/dl', referenceRange: '< 100', flag: 'H' },
          { name: 'VLDL CHOLESTEROL', value: '29', unit: 'mg/dl', referenceRange: '< 30' },
          { name: 'CHOLESTEROL / HDL RATIO', value: '5.1', unit: 'ratio', referenceRange: '3.3 - 4.4', flag: 'H' },
        ]
      }
    ],
    clinicalNotes: 'A lipid profile evaluates the balance of various lipids and cholesterol types in your bloodstream. Marginally high LDL and Cholesterol/HDL ratio with lower HDL levels suggest focus on low-fat diets, high-fiber foods, and regular physical cardiovascular exercise.',
  },
  'REP-003': {
    id: 'REP-003',
    testName: 'Thyroid Profile (T3, T4, TSH)',
    date: '12 May 2026',
    patientName: 'Mr. Saubhik Bhaumik',
    ageSex: '27 YRS / M',
    referredBy: 'Self',
    regNo: '1001',
    registeredOn: '12/05/2026 08:00 AM',
    collectedOn: '12/05/2026 08:15 AM',
    receivedOn: '12/05/2026 10:00 AM',
    reportedOn: '12/05/2026 03:15 PM',
    sections: [
      {
        category: 'ENDOCRINOLOGY',
        parameters: [
          { name: 'T3 (TOTAL TRIIODOTHYRONINE)', value: '1.2', unit: 'ng/mL', referenceRange: '0.8 - 2.0' },
          { name: 'T4 (TOTAL THYROXINE)', value: '8.5', unit: 'µg/dL', referenceRange: '5.1 - 14.1' },
          { name: 'TSH (THYROID STIMULATING HORMONE)', value: '2.45', unit: 'µIU/mL', referenceRange: '0.27 - 4.20' },
        ]
      }
    ],
    clinicalNotes: 'Thyroid Profile indicates optimal and healthy activity of the thyroid gland. T3, T4, and TSH are fully within optimal reference physiological boundaries.',
  }
};
