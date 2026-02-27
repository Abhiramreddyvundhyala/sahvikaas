import { useState, useEffect, useMemo } from 'react'
import { getResources, getFeaturedResources, downloadResource } from '../../lib/api'

// ─── Resource Categories ───
const resourceCategories = [
  { id: 'all', label: 'All Resources', icon: 'ri-folder-line' },
  { id: 'notes', label: 'Notes', icon: 'ri-sticky-note-line' },
  { id: 'presentations', label: 'Presentations', icon: 'ri-slideshow-3-line' },
  { id: 'practice', label: 'Practice Sets', icon: 'ri-pencil-ruler-2-line' },
  { id: 'videos', label: 'Videos', icon: 'ri-video-line' },
  { id: 'papers', label: 'Question Papers', icon: 'ri-file-list-3-line' },
  { id: 'lab', label: 'Lab Manuals', icon: 'ri-test-tube-line' },
  { id: 'ebooks', label: 'E-Books', icon: 'ri-book-2-line' },
  { id: 'cheatsheets', label: 'Cheat Sheets', icon: 'ri-flashlight-line' },
  { id: 'mindmaps', label: 'Mind Maps', icon: 'ri-mind-map' },
]

const semesters = ['All', 'Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8']
const subjects = ['All', 'Data Structures', 'Algorithms', 'Database Systems', 'Computer Networks', 'Operating Systems', 'Machine Learning', 'Web Development', 'Mathematics', 'Physics']
const sortOptions = ['Newest', 'Most Downloaded', 'Highest Rated']

// ─── Star Rating Component ───
function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <i
          key={star}
          className={`text-xs ${star <= Math.round(rating) ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-gray-300'}`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}</span>
    </div>
  )
}

// ─── Resource Card ───
function ResourceCard({ resource, onPreview }) {
  return (
    <div className="group bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${resource.iconColor}`}>
            <i className={`${resource.icon} text-xl`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-600 transition-colors">{resource.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{resource.subject}</p>
          </div>
        </div>

        {/* Meta tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">{resource.semester}</span>
          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{resource.type}</span>
          {resource.size !== '-' && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{resource.size}</span>
          )}
        </div>

        {/* Rating & Downloads */}
        <div className="flex items-center justify-between mt-3">
          <StarRating rating={resource.rating} />
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <i className="ri-download-2-line" />
            {resource.downloads.toLocaleString()}
          </div>
        </div>

        {/* Contributor */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-[10px] font-bold text-indigo-600">{resource.contributor.charAt(0)}</span>
          </div>
          <span className="text-xs text-gray-500">by {resource.contributor}</span>
          <span className="text-xs text-gray-400 ml-auto">{new Date(resource.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex border-t border-gray-100">
        <button
          onClick={() => onPreview(resource)}
          className="flex-1 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <i className="ri-eye-line" />
          Preview
        </button>
        <div className="w-px bg-gray-100" />
        <button className="flex-1 py-2.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1.5">
          <i className="ri-download-2-line" />
          Download
        </button>
      </div>
    </div>
  )
}

// ─── Upload Modal ───
function UploadModal({ onClose }) {
  const [dragOver, setDragOver] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Upload Resource</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <i className="ri-close-line text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Title</label>
            <input type="text" placeholder="e.g. Data Structures Notes" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>
          {/* Subject & Semester */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Subject</label>
              <select className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white">
                {subjects.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Semester</label>
              <select className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white">
                {semesters.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
            <select className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white">
              {resourceCategories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          {/* File Upload */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false) }}
          >
            <i className="ri-upload-cloud-2-line text-3xl text-gray-400" />
            <p className="text-sm text-gray-600 mt-2">Drag & drop your file here, or <span className="text-indigo-600 font-medium cursor-pointer">browse</span></p>
            <p className="text-xs text-gray-400 mt-1">PDF, PPT, DOC, MP4 up to 50MB</p>
          </div>
          {/* Submit */}
          <button className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            Upload Resource
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Preview Modal ───
function PreviewModal({ resource, onClose }) {
  if (!resource) return null
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Resource Preview</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <i className="ri-close-line text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${resource.iconColor}`}>
              <i className={`${resource.icon} text-2xl`} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{resource.title}</h4>
              <p className="text-sm text-gray-500">{resource.subject}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Type', value: resource.type },
              { label: 'Size', value: resource.size },
              { label: 'Downloads', value: resource.downloads.toLocaleString() },
              { label: 'Rating', value: `${resource.rating}/5` },
              { label: 'Semester', value: resource.semester },
              { label: 'Contributor', value: resource.contributor },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-medium text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
              Close
            </button>
            <button className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              <i className="ri-download-2-line" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Semester Quick Access ───
function SemesterQuickAccess({ onSelect, allResources }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <i className="ri-folder-open-line text-indigo-500" />
        Quick Access by Semester
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {semesters.filter(s => s !== 'All').map(sem => {
          const count = allResources.filter(r => r.semester === sem).length
          return (
            <button
              key={sem}
              onClick={() => onSelect(sem)}
              className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
            >
              <i className="ri-folder-3-line text-gray-400 group-hover:text-indigo-500 transition-colors" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{sem}</p>
                <p className="text-xs text-gray-500">{count} resources</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Page ───
export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeSemester, setActiveSemester] = useState('All')
  const [activeSubject, setActiveSubject] = useState('All')
  const [sortBy, setSortBy] = useState('Newest')
  const [search, setSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [previewResource, setPreviewResource] = useState(null)
  const [allResources, setAllResources] = useState([])
  const [featuredResources, setFeaturedResources] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const [resAll, resFeat] = await Promise.all([
          getResources().catch(() => null),
          getFeaturedResources().catch(() => null),
        ])
        if (!mounted) return
        if (resAll?.ok) setAllResources(resAll.resources || [])
        if (resFeat?.ok) setFeaturedResources(resFeat.resources || [])
      } catch { /* ignore */ }
      if (mounted) setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  const filteredResources = useMemo(() => {
    let results = allResources

    if (activeCategory !== 'all') results = results.filter(r => r.category === activeCategory)
    if (activeSemester !== 'All') results = results.filter(r => r.semester === activeSemester)
    if (activeSubject !== 'All') results = results.filter(r => r.subject === activeSubject)
    if (search) results = results.filter(r =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.subject.toLowerCase().includes(search.toLowerCase())
    )

    // Sort
    if (sortBy === 'Most Downloaded') results = [...results].sort((a, b) => b.downloads - a.downloads)
    else if (sortBy === 'Highest Rated') results = [...results].sort((a, b) => b.rating - a.rating)
    else results = [...results].sort((a, b) => new Date(b.date) - new Date(a.date))

    return results
  }, [activeCategory, activeSemester, activeSubject, search, sortBy, allResources])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-sm text-gray-500 mt-1">Browse, download, and share study materials</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors w-fit"
        >
          <i className="ri-upload-2-line" />
          Contribute
        </button>
      </div>

      {/* Featured Resources Carousel */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-5 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <i className="ri-star-line text-yellow-500" />
          Featured Resources
        </h3>
        <div className="flex gap-3 overflow-x-auto study-feature-tabs pb-1">
          {featuredResources.map(res => (
            <div key={res.id} className="min-w-[220px] sm:min-w-[260px] bg-white rounded-xl border border-gray-200 p-4 shrink-0 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${res.iconColor}`}>
                  <i className={`${res.icon} text-lg`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{res.title}</p>
                  <p className="text-xs text-gray-500">{res.subject}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <StarRating rating={res.rating} />
                <span className="text-xs text-gray-400">{res.downloads.toLocaleString()} downloads</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Semester Quick Access */}
      <SemesterQuickAccess onSelect={setActiveSemester} allResources={allResources} />

      {/* Category Tabs */}
      <div className="overflow-x-auto study-feature-tabs">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 min-w-fit">
          {resourceCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                activeCategory === cat.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className={cat.icon} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <select
            value={activeSemester}
            onChange={e => setActiveSemester(e.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-indigo-500"
          >
            {semesters.map(s => <option key={s}>{s}</option>)}
          </select>
          <select
            value={activeSubject}
            onChange={e => setActiveSubject(e.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-indigo-500 hidden sm:block"
          >
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-indigo-500"
          >
            {sortOptions.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-900">{filteredResources.length}</span> resources
        </p>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map(resource => (
          <ResourceCard key={resource.id} resource={resource} onPreview={setPreviewResource} />
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-16">
          <i className="ri-folder-open-line text-5xl text-gray-300" />
          <p className="text-gray-500 mt-3 text-sm">No resources found matching your filters.</p>
          <button
            onClick={() => { setActiveCategory('all'); setActiveSemester('All'); setActiveSubject('All'); setSearch('') }}
            className="mt-3 text-sm text-indigo-600 font-medium hover:text-indigo-700"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Modals */}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {previewResource && <PreviewModal resource={previewResource} onClose={() => setPreviewResource(null)} />}
    </div>
  )
}
