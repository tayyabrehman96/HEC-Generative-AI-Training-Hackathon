/**
 * Sehat Saathi — Pakistani Drug Database
 * Common medicines in Pakistan with Urdu names and generic equivalents
 */

export const DRUG_DATABASE = [
  { brand: 'Augmentin', generic: 'Amoxicillin + Clavulanic Acid', category: 'Antibiotic', urdu: 'آگمنٹن' },
  { brand: 'Panadol', generic: 'Paracetamol', category: 'Pain/Fever', urdu: 'پینا ڈول' },
  { brand: 'Brufen', generic: 'Ibuprofen', category: 'Pain/Anti-inflammatory', urdu: 'بروفین' },
  { brand: 'Disprin', generic: 'Aspirin', category: 'Pain/Blood thinner', urdu: 'ڈسپرن' },
  { brand: 'Flagyl', generic: 'Metronidazole', category: 'Antibiotic/Antiparasitic', urdu: 'فلیجل' },
  { brand: 'Risek', generic: 'Omeprazole', category: 'Stomach acid reducer', urdu: 'رسک' },
  { brand: 'Amoxil', generic: 'Amoxicillin', category: 'Antibiotic', urdu: 'اموکسل' },
  { brand: 'Norvasc', generic: 'Amlodipine', category: 'Blood Pressure', urdu: 'نورویسک' },
  { brand: 'Glucophage', generic: 'Metformin', category: 'Diabetes', urdu: 'گلوکوفیج' },
  { brand: 'Calpol', generic: 'Paracetamol', category: 'Pain/Fever (Pediatric)', urdu: 'کالپول' },
  { brand: 'Septran', generic: 'Sulfamethoxazole + Trimethoprim', category: 'Antibiotic', urdu: 'سیپٹران' },
  { brand: 'Ponstan', generic: 'Mefenamic Acid', category: 'Pain/Anti-inflammatory', urdu: 'پونسٹان' },
  { brand: 'Arinac', generic: 'Ibuprofen + Pseudoephedrine', category: 'Cold/Flu', urdu: 'ارینک' },
  { brand: 'Rigix', generic: 'Cetirizine', category: 'Allergy', urdu: 'ریجکس' },
  { brand: 'Zyrtec', generic: 'Cetirizine', category: 'Allergy', urdu: 'زرٹیک' },
  { brand: 'Ventolin', generic: 'Salbutamol', category: 'Asthma', urdu: 'وینٹولین' },
  { brand: 'Ciprocin', generic: 'Ciprofloxacin', category: 'Antibiotic', urdu: 'سیپروسن' },
  { brand: 'Entoflox', generic: 'Ofloxacin', category: 'Antibiotic', urdu: 'اینٹوفلوکس' },
  { brand: 'Ceclor', generic: 'Cefaclor', category: 'Antibiotic', urdu: 'سیکلور' },
  { brand: 'Motilium', generic: 'Domperidone', category: 'Anti-nausea', urdu: 'موٹیلیم' },
  { brand: 'Imodium', generic: 'Loperamide', category: 'Anti-diarrheal', urdu: 'اموڈیم' },
  { brand: 'Zantac', generic: 'Ranitidine', category: 'Stomach acid reducer', urdu: 'زینٹک' },
  { brand: 'Nexium', generic: 'Esomeprazole', category: 'Stomach acid reducer', urdu: 'نیکسیم' },
  { brand: 'Losec', generic: 'Omeprazole', category: 'Stomach acid reducer', urdu: 'لوسیک' },
  { brand: 'Novaclav', generic: 'Amoxicillin + Clavulanic Acid', category: 'Antibiotic', urdu: 'نوواکلاو' },
  { brand: 'Cefspan', generic: 'Cefixime', category: 'Antibiotic', urdu: 'سیفسپان' },
  { brand: 'Tegral', generic: 'Carbamazepine', category: 'Epilepsy', urdu: 'ٹیگرل' },
  { brand: 'Lipitor', generic: 'Atorvastatin', category: 'Cholesterol', urdu: 'لیپیٹور' },
  { brand: 'Concor', generic: 'Bisoprolol', category: 'Blood Pressure/Heart', urdu: 'کونکور' },
  { brand: 'Cardace', generic: 'Ramipril', category: 'Blood Pressure', urdu: 'کارڈیس' },
  { brand: 'Amaryl', generic: 'Glimepiride', category: 'Diabetes', urdu: 'ایمریل' },
  { brand: 'Diamicron', generic: 'Gliclazide', category: 'Diabetes', urdu: 'ڈائمیکرون' },
  { brand: 'Insulatard', generic: 'Insulin (NPH)', category: 'Diabetes', urdu: 'انسولیٹارڈ' },
  { brand: 'Loprin', generic: 'Aspirin', category: 'Blood thinner', urdu: 'لوپرین' },
  { brand: 'Claritek', generic: 'Clarithromycin', category: 'Antibiotic', urdu: 'کلاریٹیک' },
  { brand: 'Rulide', generic: 'Roxithromycin', category: 'Antibiotic', urdu: 'رولائیڈ' },
  { brand: 'Surbex Z', generic: 'Multivitamin + Zinc', category: 'Vitamin', urdu: 'سربیکس زی' },
  { brand: 'Centrum', generic: 'Multivitamin', category: 'Vitamin', urdu: 'سینٹرم' },
  { brand: 'Neurobion', generic: 'Vitamin B Complex', category: 'Vitamin', urdu: 'نیوروبیون' },
  { brand: 'Voren', generic: 'Diclofenac', category: 'Pain/Anti-inflammatory', urdu: 'وورین' },
];

/**
 * Search for a drug in the local database
 */
export function searchDrug(query) {
  const q = query.toLowerCase();
  return DRUG_DATABASE.filter(d =>
    d.brand.toLowerCase().includes(q) ||
    d.generic.toLowerCase().includes(q)
  );
}
