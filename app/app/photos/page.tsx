'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Upload, Download, Camera, Loader2, X } from 'lucide-react'

type PhotoCategory = 'AVANT' | 'PENDANT' | 'APRES' | 'PROBLEME' | 'DETAIL' | 'RECEPTION'

interface Photo {
  id: string
  projectId: string
  category: string
  caption: string | null
  url: string
  takenAt: string
  createdAt: string
}

interface ProjectLite {
  id: string
  title: string
}

const CATEGORY_LABELS: Record<string, string> = {
  TOUS: 'Tous',
  AVANT: 'Avant',
  PENDANT: 'Pendant',
  APRES: 'Après',
  PROBLEME: 'Problème',
  DETAIL: 'Détail',
  RECEPTION: 'Réception',
}

const CATEGORY_COLORS: Record<string, string> = {
  AVANT: 'text-gray-600 bg-gray-100',
  PENDANT: 'text-blue-700 bg-blue-100',
  APRES: 'text-green-700 bg-green-100',
  PROBLEME: 'text-red-700 bg-red-100',
  DETAIL: 'text-yellow-700 bg-yellow-100',
  RECEPTION: 'text-purple-700 bg-purple-100',
}

const ALL_TABS: Array<PhotoCategory | 'TOUS'> = ['TOUS', 'AVANT', 'PENDANT', 'APRES', 'PROBLEME', 'DETAIL', 'RECEPTION']

export default function PhotosPage() {
  const [projects, setProjects] = useState<ProjectLite[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [activeTab, setActiveTab] = useState<PhotoCategory | 'TOUS'>('TOUS')
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadCategory, setUploadCategory] = useState<PhotoCategory>('PENDANT')
  const [uploadCaption, setUploadCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3500) }

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((j) => {
        const list: ProjectLite[] = (j.data ?? []).map((p: { id: string; title: string }) => ({ id: p.id, title: p.title }))
        setProjects(list)
        if (list.length > 0) setSelectedProject(list[0].id)
        else setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const loadPhotos = useCallback(async () => {
    if (!selectedProject) return
    setLoading(true)
    try {
      const r = await fetch(`/api/photos?projectId=${selectedProject}`)
      const j = await r.json()
      setPhotos(r.ok ? (j.data ?? []) : [])
    } catch {
      setPhotos([])
    }
    setLoading(false)
  }, [selectedProject])

  useEffect(() => { loadPhotos() }, [loadPhotos])

  async function handleUpload() {
    const file = fileRef.current?.files?.[0]
    if (!file) { showToast('Sélectionnez une photo'); return }
    if (!selectedProject) { showToast('Sélectionnez un chantier'); return }
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('projectId', selectedProject)
    fd.append('category', uploadCategory)
    if (uploadCaption) fd.append('caption', uploadCaption)
    try {
      const r = await fetch('/api/photos', { method: 'POST', body: fd })
      const j = await r.json().catch(() => ({}))
      if (r.ok) {
        setShowUpload(false)
        setUploadCaption('')
        if (fileRef.current) fileRef.current.value = ''
        showToast('Photo ajoutée')
        loadPhotos()
      } else {
        showToast(j.error || 'Échec du téléversement')
      }
    } catch {
      showToast('Échec du téléversement')
    }
    setUploading(false)
  }

  const filtered = activeTab === 'TOUS' ? photos : photos.filter((p) => p.category === activeTab)
  const countByCategory = (cat: PhotoCategory | 'TOUS') =>
    cat === 'TOUS' ? photos.length : photos.filter((p) => p.category === cat).length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Photos chantier</h1>
          <p className="text-sm text-gray-500 mt-0.5">{photos.length} photo(s)</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          disabled={!selectedProject}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          Ajouter des photos
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Camera className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Créez d&apos;abord un chantier pour ajouter des photos</p>
        </div>
      ) : (
        <>
          <div className="mb-5">
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Chantier</label>
            <select
              value={selectedProject}
              onChange={(e) => { setSelectedProject(e.target.value); setActiveTab('TOUS') }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-xs w-full"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-1 flex-wrap mb-6 border-b border-gray-200">
            {ALL_TABS.map((tab) => {
              const count = countByCategory(tab)
              if (count === 0 && tab !== 'TOUS') return null
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
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

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Camera className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune photo — cliquez sur « Ajouter des photos »</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((photo) => (
                <div key={photo.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt={photo.caption ?? 'Photo chantier'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{photo.caption || 'Sans légende'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(photo.takenAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[photo.category] ?? 'bg-gray-100 text-gray-600'}`}>
                          {CATEGORY_LABELS[photo.category] ?? photo.category}
                        </span>
                        <a href={photo.url} download className="text-gray-400 hover:text-gray-600 transition-colors" title="Télécharger">
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Ajouter une photo</h2>
              <button onClick={() => setShowUpload(false)} aria-label="Fermer la fenêtre" className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fichier image *</label>
              <input ref={fileRef} type="file" accept="image/*" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie</label>
              <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value as PhotoCategory)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {(['AVANT', 'PENDANT', 'APRES', 'PROBLEME', 'DETAIL', 'RECEPTION'] as PhotoCategory[]).map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Légende</label>
              <input value={uploadCaption} onChange={(e) => setUploadCaption(e.target.value)}
                placeholder="Ex: Pose carrelage mural"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={handleUpload} disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Téléverser
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
