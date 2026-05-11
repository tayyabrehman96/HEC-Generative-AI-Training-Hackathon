/**
 * Build a small FHIR R4 Bundle for interoperability demos — not a legal medical record.
 * Client-side only; does not call the analysis API.
 */

/**
 * @param {unknown[]} medications — normalized meds from state
 */
export function buildMedicationBundle(medications) {
  const timestamp = new Date().toISOString();
  const entry = [];

  medications.forEach((med, i) => {
    const doseText = [med.timing, med.usage_instructions]
      .filter((x) => x && String(x).trim() && String(x) !== '—')
      .join(' — ');
    const notes = [];
    if (med.purpose && med.purpose !== '—') notes.push({ text: `Purpose: ${med.purpose}` });
    if (med.generic_name && med.generic_name !== '—') notes.push({ text: `Generic: ${med.generic_name}` });
    if (med.raw_text && med.raw_text !== '—') notes.push({ text: `Rx line: ${med.raw_text}` });
    if (med.prescriber_note_ur) notes.push({ text: `Safety note: ${med.prescriber_note_ur}` });

    entry.push({
      fullUrl: `urn:uuid:medication-statement-${i}`,
      resource: {
        resourceType: 'MedicationStatement',
        id: `sehat-med-${i + 1}`,
        meta: {
          lastUpdated: timestamp,
          tag: [
            {
              system: 'https://sehat-saathi.app/fhir/tag',
              code: 'prescription-scan',
              display: 'Derived from Sehat Saathi AI scan — verify with prescriber',
            },
          ],
        },
        status: 'active',
        medicationCodeableConcept: {
          text: String(med.brand_name || `Medicine ${i + 1}`).trim(),
        },
        subject: {
          reference: 'Patient/unknown',
          display: 'Link to real Patient resource in your EMR',
        },
        dateAsserted: timestamp.slice(0, 10),
        dosage: [
          {
            text:
              doseText ||
              'Incomplete in export — confirm timing and dose with prescription or clinician.',
          },
        ],
        ...(notes.length ? { note: notes } : {}),
      },
    });
  });

  return {
    resourceType: 'Bundle',
    type: 'collection',
    timestamp,
    meta: {
      tag: [
        {
          system: 'https://sehat-saathi.app/fhir/tag',
          code: 'demo-export',
          display: 'Unofficial bundle for testing — not for clinical decisions',
        },
      ],
    },
    entry,
  };
}

/**
 * @param {unknown[]} medications
 */
export function downloadFhirBundle(medications) {
  if (!Array.isArray(medications) || medications.length === 0) return;
  const bundle = buildMedicationBundle(medications);
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/fhir+json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sehat-saathi-fhir-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
