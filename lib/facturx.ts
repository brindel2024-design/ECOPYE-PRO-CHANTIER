/**
 * Génération du XML structuré Factur-X (UN/CEFACT CrossIndustryInvoice, CII)
 * profil BASIC / EN16931. C'est le cœur "structuré" de la facture électronique.
 *
 * NB : la facture Factur-X finale = ce XML EMBARQUÉ dans un PDF/A-3.
 * L'embarquement PDF/A-3 et la transmission seront gérés via la plateforme (PDP).
 * Ici on produit le XML conforme, indépendant du PDP.
 */

export interface FxParty {
  name: string
  siret?: string | null
  vatNumber?: string | null
  address?: string | null
  postalCode?: string | null
  city?: string | null
  countryCode?: string
}

export interface FxLine {
  label: string
  quantity: number
  unit?: string | null
  unitPriceHT: number
  vatRate: number
  totalHT: number
}

export interface FxInvoice {
  number: string
  type?: string | null
  issueDate: Date
  dueDate?: Date | null
  currency?: string
  lines: FxLine[]
  subtotalHT: number
  vatAmount: number
  totalTTC: number
}

function esc(s: string | null | undefined): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
function n2(v: number): string {
  return (Math.round((Number(v) || 0) * 100) / 100).toFixed(2)
}
function cefactDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}
function unitCode(unit?: string | null): string {
  switch ((unit ?? '').toLowerCase()) {
    case 'm²':
    case 'm2':
      return 'MTK'
    case 'h':
    case 'heure':
    case 'heures':
      return 'HUR'
    case 'ml':
    case 'm':
      return 'MTR'
    case 'forfait':
      return 'LS'
    default:
      return 'C62' // unité
  }
}

function partyXml(tag: string, p: FxParty): string {
  const legalOrg = p.siret
    ? `<ram:SpecifiedLegalOrganization><ram:ID schemeID="0002">${esc(p.siret)}</ram:ID></ram:SpecifiedLegalOrganization>`
    : ''
  const tax = p.vatNumber
    ? `<ram:SpecifiedTaxRegistration><ram:ID schemeID="VA">${esc(p.vatNumber)}</ram:ID></ram:SpecifiedTaxRegistration>`
    : ''
  return `<ram:${tag}>
  <ram:Name>${esc(p.name)}</ram:Name>
  ${legalOrg}
  <ram:PostalTradeAddress>
    <ram:PostcodeCode>${esc(p.postalCode)}</ram:PostcodeCode>
    <ram:LineOne>${esc(p.address)}</ram:LineOne>
    <ram:CityName>${esc(p.city)}</ram:CityName>
    <ram:CountryID>${esc(p.countryCode ?? 'FR')}</ram:CountryID>
  </ram:PostalTradeAddress>
  ${tax}
</ram:${tag}>`
}

export function buildFacturXml(input: {
  invoice: FxInvoice
  seller: FxParty
  buyer: FxParty
}): string {
  const { invoice, seller, buyer } = input
  const currency = invoice.currency ?? 'EUR'
  const typeCode = (invoice.type ?? '').toUpperCase() === 'AVOIR' ? '381' : '380'

  // Lignes
  const lines = invoice.lines
    .map((l, i) => {
      const lineTotal = l.totalHT ?? l.quantity * l.unitPriceHT
      return `<ram:IncludedSupplyChainTradeLineItem>
  <ram:AssociatedDocumentLineDocument><ram:LineID>${i + 1}</ram:LineID></ram:AssociatedDocumentLineDocument>
  <ram:SpecifiedTradeProduct><ram:Name>${esc(l.label)}</ram:Name></ram:SpecifiedTradeProduct>
  <ram:SpecifiedLineTradeAgreement>
    <ram:NetPriceProductTradePrice><ram:ChargeAmount>${n2(l.unitPriceHT)}</ram:ChargeAmount></ram:NetPriceProductTradePrice>
  </ram:SpecifiedLineTradeAgreement>
  <ram:SpecifiedLineTradeDelivery><ram:BilledQuantity unitCode="${unitCode(l.unit)}">${n2(l.quantity)}</ram:BilledQuantity></ram:SpecifiedLineTradeDelivery>
  <ram:SpecifiedLineTradeSettlement>
    <ram:ApplicableTradeTax><ram:TypeCode>VAT</ram:TypeCode><ram:CategoryCode>S</ram:CategoryCode><ram:RateApplicablePercent>${n2(l.vatRate)}</ram:RateApplicablePercent></ram:ApplicableTradeTax>
    <ram:SpecifiedTradeSettlementLineMonetarySummation><ram:LineTotalAmount>${n2(lineTotal)}</ram:LineTotalAmount></ram:SpecifiedTradeSettlementLineMonetarySummation>
  </ram:SpecifiedLineTradeSettlement>
</ram:IncludedSupplyChainTradeLineItem>`
    })
    .join('\n')

  // Ventilation TVA par taux
  const byRate = new Map<number, { base: number; tax: number }>()
  for (const l of invoice.lines) {
    const rate = Number(l.vatRate ?? 0)
    const base = l.totalHT ?? l.quantity * l.unitPriceHT
    const cur = byRate.get(rate) ?? { base: 0, tax: 0 }
    cur.base += base
    cur.tax += base * (rate / 100)
    byRate.set(rate, cur)
  }
  const taxBlocks = Array.from(byRate.entries())
    .map(
      ([rate, v]) => `<ram:ApplicableTradeTax>
  <ram:CalculatedAmount>${n2(v.tax)}</ram:CalculatedAmount>
  <ram:TypeCode>VAT</ram:TypeCode>
  <ram:BasisAmount>${n2(v.base)}</ram:BasisAmount>
  <ram:CategoryCode>S</ram:CategoryCode>
  <ram:RateApplicablePercent>${n2(rate)}</ram:RateApplicablePercent>
</ram:ApplicableTradeTax>`
    )
    .join('\n')

  const paymentTerms = invoice.dueDate
    ? `<ram:SpecifiedTradePaymentTerms><ram:DueDateDateTime><udt:DateTimeString format="102">${cefactDate(new Date(invoice.dueDate))}</udt:DateTimeString></ram:DueDateDateTime></ram:SpecifiedTradePaymentTerms>`
    : ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100" xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter><ram:ID>urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic</ram:ID></ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${esc(invoice.number)}</ram:ID>
    <ram:TypeCode>${typeCode}</ram:TypeCode>
    <ram:IssueDateTime><udt:DateTimeString format="102">${cefactDate(new Date(invoice.issueDate))}</udt:DateTimeString></ram:IssueDateTime>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
${lines}
    <ram:ApplicableHeaderTradeAgreement>
      ${partyXml('SellerTradeParty', seller)}
      ${partyXml('BuyerTradeParty', buyer)}
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeDelivery/>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>${currency}</ram:InvoiceCurrencyCode>
${taxBlocks}
      ${paymentTerms}
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${n2(invoice.subtotalHT)}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${n2(invoice.subtotalHT)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="${currency}">${n2(invoice.vatAmount)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${n2(invoice.totalTTC)}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${n2(invoice.totalTTC)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`
}

/** Données manquantes pour une facture électronique conforme (B2B notamment). */
export function facturxReadiness(input: {
  seller: FxParty
  buyer: FxParty
  buyerIsBusiness: boolean
}): { ready: boolean; missing: string[] } {
  const missing: string[] = []
  if (!input.seller.siret) missing.push('SIRET émetteur')
  if (!input.seller.vatNumber) missing.push('N° TVA émetteur (ou mention franchise)')
  if (!input.seller.address || !input.seller.postalCode || !input.seller.city) missing.push('Adresse émetteur complète')
  if (input.buyerIsBusiness && !input.buyer.siret) missing.push('SIRET du client professionnel')
  if (!input.buyer.address || !input.buyer.postalCode || !input.buyer.city) missing.push('Adresse client complète')
  return { ready: missing.length === 0, missing }
}
