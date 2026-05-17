'use client'

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Line,
  ComposedChart,
  Legend,
} from 'recharts'

interface RevenueChartProps {
  data: Array<{ mois: string; CA: number; objectif: number }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Chiffre d&apos;affaires mensuel</h2>
        <p className="text-xs text-gray-500 mt-0.5">CA réalisé vs objectif mensuel</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
          <Tooltip
            formatter={(value: number) => [`${value.toLocaleString('fr-FR')} €`, '']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="CA" name="CA réalisé" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="objectif" name="Objectif" stroke="#e2e8f0" strokeWidth={2} dot={false} strokeDasharray="5 5" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
