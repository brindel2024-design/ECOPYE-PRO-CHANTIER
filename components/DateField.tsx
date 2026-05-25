'use client'

import { useEffect, useState } from 'react'

/**
 * Sélecteur de date robuste (Jour / Mois / Année) — remplace `<input type="date">`
 * dont la saisie manuelle est peu fiable (segments vides, focus aléatoire,
 * valeur silencieusement vide → enregistrée en null).
 *
 * Le composant conserve son propre état pour les trois parties : choisir le jour
 * seul ne réinitialise pas la liste. Une chaîne ISO `YYYY-MM-DD` n'est émise que
 * lorsque les trois parties sont renseignées ; sinon `onChange('')`.
 *
 * `value`    : chaîne ISO `YYYY-MM-DD` ou '' (vide).
 * `onChange` : reçoit une chaîne ISO valide `YYYY-MM-DD`, ou '' tant que la
 *              date n'est pas entièrement renseignée.
 */

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function partsFromIso(value: string): { d: string; m: string; y: string } {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-')
    return { d: String(Number(d)), m: String(Number(m)), y }
  }
  return { d: '', m: '', y: '' }
}

interface DateFieldProps {
  value: string
  onChange: (iso: string) => void
  startYear?: number
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
  const initial = partsFromIso(value)
  const [day, setDay] = useState(initial.d)
  const [month, setMonth] = useState(initial.m)
  const [year, setYear] = useState(initial.y)

  // Re-synchronise si la valeur externe change (ex: chargement async d'un formulaire d'édition).
  useEffect(() => {
    const p = partsFromIso(value)
    setDay(p.d)
    setMonth(p.m)
    setYear(p.y)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  function commit(nextDay: string, nextMonth: string, nextYear: string) {
    setDay(nextDay)
    setMonth(nextMonth)
    setYear(nextYear)
    if (!nextDay || !nextMonth || !nextYear) {
      onChange('')
      return
    }
    const yy = Number(nextYear)
    const mm = Number(nextMonth)
    let dd = Number(nextDay)
    const max = daysInMonth(yy, mm)
    if (dd > max) dd = max
    onChange(
      `${yy.toString().padStart(4, '0')}-${mm
        .toString()
        .padStart(2, '0')}-${dd.toString().padStart(2, '0')}`
    )
  }

  const now = new Date()
  const firstYear = startYear ?? now.getFullYear() - 1
  const years = Array.from({ length: yearSpan }, (_, i) => firstYear + i)
  const maxDays = month && year ? daysInMonth(Number(year), Number(month)) : 31
  const days = Array.from({ length: maxDays }, (_, i) => i + 1)

  const selectClass =
    'rounded-lg border border-gray-300 px-2 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white'

  return (
    <div id={id} className={`grid grid-cols-3 gap-2 ${className}`}>
      <select
        aria-label="Jour"
        value={day}
        onChange={(e) => commit(e.target.value, month, year)}
        className={selectClass}
      >
        <option value="">Jour</option>
        {days.map((dd) => (
          <option key={dd} value={dd}>{dd}</option>
        ))}
      </select>
      <select
        aria-label="Mois"
        value={month}
        onChange={(e) => commit(day, e.target.value, year)}
        className={selectClass}
      >
        <option value="">Mois</option>
        {MONTHS.map((label, i) => (
          <option key={label} value={i + 1}>{label}</option>
        ))}
      </select>
      <select
        aria-label="Année"
        value={year}
        onChange={(e) => commit(day, month, e.target.value)}
        className={selectClass}
      >
        <option value="">Année</option>
        {years.map((yy) => (
          <option key={yy} value={yy}>{yy}</option>
        ))}
      </select>
    </div>
  )
}
