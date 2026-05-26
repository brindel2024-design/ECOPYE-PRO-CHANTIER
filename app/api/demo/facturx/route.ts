import { NextResponse } from 'next/server'
import { buildFacturXml } from '@/lib/facturx'

/**
 * Démo PUBLIQUE : renvoie un XML Factur-X (CII EN16931) d'exemple généré par
 * le moteur ECOPYE, pour tester la validité dans un validateur tiers (ex. Iopole).
 * Données fictives — aucun secret. Peut être retiré après validation.
 */
export async function GET() {
  const xml = buildFacturXml({
    invoice: {
      number: 'FAC-2026-0001',
      type: 'FINALE',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 864e5),
      currency: 'EUR',
      lines: [
        { label: 'Rénovation salle de bain', quantity: 1, unit: 'forfait', unitPriceHT: 5000, vatRate: 10, totalHT: 5000 },
        { label: 'Fourniture carrelage', quantity: 18, unit: 'm2', unitPriceHT: 45, vatRate: 20, totalHT: 810 },
      ],
      subtotalHT: 5810,
      vatAmount: 662,
      totalTTC: 6472,
    },
    seller: { name: 'ECOPYE Démo', siret: '12345678900012', vatNumber: 'FR12345678900', address: '1 rue Démo', postalCode: '75001', city: 'Paris', countryCode: 'FR' },
    buyer: { name: 'Client Démo SARL', siret: '98765432100019', address: '2 rue Client', postalCode: '69001', city: 'Lyon', countryCode: 'FR' },
  })

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ecopye-factur-x-demo.xml"',
    },
  })
}
