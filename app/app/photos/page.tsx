'use client'

import { useState } from 'react'
import { Upload, Download, Camera } from 'lucide-react'
import { MOCK_PROJECTS } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'

type PhotoCategory = 'AVANT' | 'PENDANT' | 'APRES' | 'PROBLEME' | 'DETAIL' | 'RECEPTION'

interface MockPhoto {
  id: string
  projectId: string
  category: PhotoCategory
  caption: string
  url: string
  takenAt: Date
}

const MOCK_PHOTOS: MockPhoto[] = [
  { id: 'p1', projectId: 'project-1', category: 'AVANT', caption: 'État initial salle de bain', url: 'https://picsum.photos/seed/p1/400/300', takenAt: new Date('2024-06-14') },
  { id: 'p2', projectId: 'project-1', category: 'AVANT', caption: 'Vieille plomberie', url: 'https://picsum.photos/seed/p2/400/300', takenAt: new Date('2024-06-14') },
  { id: 'p3', projectId: 'project-1', category: 'PENDANT', caption: 'Démolition en cours', url: 'https://picsum.photos/seed/p3/400/300', takenAt: new Date('2024-06-17') },
  { id: 'p4', projectId: 'project-1', category: 'PENDANT', caption: 'Pose étanchéité', url: 'https://picsum.photos/seed/p4/400/300', takenAt: new Date('2024-06-20') },
  { id: 'p5', projectId: 'project-1', category: 'PENDANT', caption: 'Pose carrelage mural', url: 'https://picsum.photos/seed/p5/400/300', takenAt: new Date('2024-06-22') },
  { id: 'p6', projectId: 'project-1', category: 'PROBLEME', caption: 'Fissure découverte', url: 'https://picsum.photos/seed/p6/400/300', takenAt: new Date('2024-06-19') },
  { id: 'p7', projectId: 'project-2', category: 'AVANT', caption: 'Ancienne chaudière', url: 'https://picsum.photos/seed/p7/400/300', takenAt: new Date('2024-06-25') },
  { id: 'p8', projectId: 'project-2', category: 'AVANT', caption: 'Local chaudière', url: 'https://picsum.photos/seed/p8/400/300', takenAt: new Date('2024-06-25') },
  { id: 'p9', projectId: 'project-3', category: 'PENDANT', caption: 'Nouveau tableau électrique', url: 'https://picsum.photos/seed/p9/400/300', takenAt: new Date('2024-05-25') },
  { id: 'p10', projectId: 'project-3', category: 'PROBLEME', caption: 'Câblage non conforme trouvé', url: 'https://picsum.photos/seed/p10/400/300', takenAt: new Date('2024-05-28') },
  { id: 'p11', projectId: 'project-1', category: 'APRES', caption: 'Résultat final salle de bain', url: 'https://picsum.photos/seed/p11/400/300', takenAt: new Date('2024-07-04') },
  { id: 'p12', projectId: 'project-1', category: 'RECEPTION', caption: 'Réception client signée', url: 'https://picsum.photos/seed/p12/400/300', takenAt: new Date('2024-07-05') },
]

const CATEGORY_LABELS: Record<PhotoCategory | 'TOUS', string> = {
  TOUS: 'Tous',
  AVANT: 'Avant',
  PENDANT: 'Pendant',
  APRES: 'Après',
  PROBLEME: 'Problème',
  DETAIL: 'Détail',
  RECEPTION: 'Réception',
}

const CATEGORY_COLORS: Record<PhotoCategory, string> = {
  AVANT: 'text-gray-600 bg-gray-100',
  PENDANT: 'text-blue-700 bg-blue-100',
  APRES: 'text-green-700 bg-green-100',
  PROBLEME: 'text-red-700 bg-red-100',
  DETAIL: 'text-yellow-700 bg-yellow-100',
  RECEPTION: 'text-purple-700 bg-purple-100',
}

const ALL_TABS: Array<PhotoCategory | 'TOUS'> = ['TOUS', 'AVANT', 'PENDANT', 'APRES', 'PROBLEME', 'RECEPTION']

export default function PhotosPage() {
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<PhotoCategory | 'TOUS'>('TOUS')

  const projectPhotos = selectedProject === 'all'
    ? MOCK_PHOTOS
    : MOCK_PHOTOS.filter((p) => p.projectId === selectedProject)

  const filtered = activeTab === 'TOUS'
    ? projectPhotos
    : projectPhotos.filter((p) => p.category === activeTab)

  const countByCategory = (cat: PhotoCategory | 'TOUS') =>
    cat === 'TOUS'
      ? projectPhotos.length
      : projectPhotos.filter((p) => p.category === cat).length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Photos chantier</h1>
          <p className="text-sm text-gray-500 mt-0.5">{MOCK_PHOTOS.length} photos au total</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('Téléversement disponible en version PRO')}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Upload className="h-4 w-4" />
            Ajouter des photos
          </button>
        </div>
      </div>

      {/* Project selector */}
      <div className="mb-5">
        <label className="text-xs font-medium text-gray-500 block mb-1.5">Filtrer par chantier</label>
        <select
          value={selectedProject}
          onChange={(e) => { setSelectedProject(e.target.value); setActiveTab('TOUS') }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-xs w-full"
        >
          <option value="all">Tous les chantiers</option>
          {MOCK_PROJECTS.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 flex-wrap mb-6 border-b border-gray-200 pb-0">
        {ALL_TABS.map((tab) => {
          const count = countByCategory(tab)
          if (count === 0 && tab !== 'TOUS') return null
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {CATEGORY_LABELS[tab]}
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Photo grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Camera className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucune photo dans cette catégorie</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((photo) => (
            <div key={photo.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
              <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{photo.caption}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(photo.takenAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[photo.category]}`}>
                      {CATEGORY_LABELS[photo.category]}
                    </span>
                    <button
                      onClick={() => alert('Téléchargement disponible en version PRO')}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Télécharger"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
