'use client'

/**
 * Sélecteur de date robuste (Jour / Mois / Année) — remplace `<input type="date">`
 * dont la saisie manuelle est peu fiable (segments vides, focus aléatoire,
 * valeur silencieusement vide → enregistrée en null).
 *
 * `value`    : chaîne ISO `YYYY-MM-DD` ou '' (vide).
 * `onChange` : reçoit une chaîne ISO valide `YYYY-MM-DD`, ou '' tant que la
 *              date n'est pas entièrement et valablement renseignée.
 */

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function daysInMonth(year: number, month: number): number {
  // month: 1-12 ; jour 0 du mois suivant = dernier jour du mois courant
  return new Date(year, month, 0).getDate()
}

interface DateFieldProps {
  value: string
  onChange: (iso: string) => void
  /** Première année proposée (défaut : année courante - 1). */
  startYear?: number
  /** Nombre d'années proposées (défaut : 6). */
  yearSpan?: number
  id?: string
  className?: string
}

export default function DateField({
  value,
  onChange,
  startYear,
  yearSpan = 6,
  id,
  className = '',
}: DateFieldProps) {
  const [y, m, d] = value && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value.split('-').map(Number)
    : [NaN, NaN, NaN]

  const now = new Date()
  const firstYear = startYear ?? now.getFullYear() - 1
  const years = Array.from({ length: yearSpan }, (_, i) => firstYear + i)

  const selDay = Number.isNaN(d) ? '' : String(d)
  const selMonth = Number.isNaN(m) ? '' : String(m)
  const selYear = Number.isNaN(y) ? '' : String(y)

  function emit(day: string, month: string, year: string) {
    if (!day || !month || !year) {
      onChange('')
      return
    }
    const yy = Number(year)
    const mm = Number(month)
    let dd = Number(day)
    // Corrige un jour impossible (ex: 31 février → dernier jour du mois)
    const max = daysInMonth(yy, mm)
    if (dd > max) dd = max
    onChange(
      `${yy.toString().padStart(4, '0')}-${mm
        .toString()
        .padStart(2, '0')}-${dd.toString().padStart(2, '0')}`
    )
  }

  // Nombre de jours du mois sélectionné (sinon 31 par défaut)
  const maxDays =
    selMonth && selYear ? daysInMonth(Number(selYear), Number(selMonth)) : 31
  const days = Array.from({ length: maxDays }, (_, i) => i + 1)

  const selectClass =
    'rounded-lg border border-gray-300 px-2 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white'

  return (
    <div id={id} className={`grid grid-cols-3 gap-2 ${className}`}>
      <select
        aria-label="Jour"
        value={selDay}
        onChange={(e) => emit(e.target.value, selMonth, selYear)}
        className={selectClass}
      >
        <option value="">Jour</option>
        {days.map((day) => (
          <option key={day} value={day}>{day}</option>
        ))}
      </select>
      <select
        aria-label="Mois"
        value={selMonth}
        onChange={(e) => emit(selDay, e.target.value, selYear)}
        className={selectClass}
      >
        <option value="">Mois</option>
        {MONTHS.map((label, i) => (
          <option key={label} value={i + 1}>{label}</option>
        ))}
      </select>
      <select
        aria-label="Année"
        value={selYear}
        onChange={(e) => emit(selDay, selMonth, e.target.value)}
        className={selectClass}
      >
        <option value="">Année</option>
        {years.map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  )
}
