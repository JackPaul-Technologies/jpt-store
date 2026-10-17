import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { WPPost, WPCategory } from '../types/wordpress'
import { wpApi } from '../services/wpApi'
import { PostCard } from '../components/PostCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { PostModal } from '../components/PostModal'
import {
  Search,
  AlertCircle,
  RefreshCw,
  Monitor,
  Smartphone,
  Globe,
  FileText,
  Download,
  X,
  Layers
} from 'lucide-react'

// Map category slugs to icons and accent styling
const getCategoryMetadata = (slug: string = '') => {
  const s = slug.toLowerCase()
  if (s.includes('window')) {
    return {
      icon: Monitor,
      color: 'text-sky-400',
      badge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      description: 'Native software tools, utilities, and desktop installations for Windows.'
    }
  }
  if (s.includes('android')) {
    return {
      icon: Smartphone,
      color: 'text-emerald-400',
      badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Mobile applications, APK releases, and Android system guides.'
    }
  }
  if (s.includes('web')) {
    return {
      icon: Globe,
      color: 'text-purple-400',
      badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      description: 'Web-based portals, browser utilities, and online services.'
    }
  }
  return {
    icon: FileText,
    color: 'text-indigo-400',
    badge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    description: 'Engineering notes, technology insights, and release documentation.'
  }
}

export const CategoryView: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>()
  const [posts, setPosts] = useState<WPPost[]>([])
  const [categories, setCategories] = useState<WPCategory[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [downloadsOnly, setDownloadsOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activePost, setActivePost] = useState<WPPost | null>(null)

  const meta = getCategoryMetadata(categorySlug)
  const Icon = meta.icon

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const fetchedCategories = await wpApi.getCategories()
      setCategories(fetchedCategories)

      // Flexible slug matching (e.g. 'windows' matches 'windows', 'windows-apps', etc.)
      const slug = (categorySlug || '').toLowerCase()
      const matchedCats = fetchedCategories.filter(
        (c) =>
          c.slug.toLowerCase() === slug ||
          c.slug.toLowerCase().includes(slug) ||
          c.name.toLowerCase().includes(slug)
      )

      const categoryIds = matchedCats.length > 0 ? matchedCats.map((c) => c.id) : undefined

      const fetchedPosts = await wpApi.getPosts({
        perPage: 50,
        categoryIds
      })

      // Secondary client-side fallback if WordPress API category filter was broad
      let filtered = fetchedPosts
      if (slug && matchedCats.length === 0) {
        filtered = fetchedPosts.filter((post) => {
          const postCats = wpApi.getPostCategories(post).map((c) => c.toLowerCase())
          return postCats.some((c) => c.includes(slug))
        })
      }

      setPosts(filtered)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load category feed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setSearchQuery('')
    setDownloadsOnly(false)
    loadData()
  }, [categorySlug])

  // Instant client-side search and download filtering
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        !searchQuery.trim() ||
        post.title.rendered.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.rendered.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDownload = !downloadsOnly || wpApi.extractDownloadInfo(post) !== null

      return matchesSearch && matchesDownload
    })
  }, [posts, searchQuery, downloadsOnly])

  const categoryName =
    categories.find((c) => c.slug.toLowerCase() === categorySlug?.toLowerCase())?.name ||
    (categorySlug ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1) : 'Category')

  return (
    <div className="p-8 space-y-8 overflow-y-auto flex-1 select-none">
      {/* 1. Header Hero Card with Dynamic Platform Branding */}
      <div className="glass-card bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl shrink-0">
            <Icon className={`w-7 h-7 ${meta.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{categoryName}</h1>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${meta.badge}`}
              >
                {filteredPosts.length} items
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              {meta.description}
            </p>
          </div>
        </div>

        {/* Action Controls: Search & Downloads Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => setDownloadsOnly((prev) => !prev)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              downloadsOnly
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700/80'
            }`}
            title="Filter releases with downloadable packages"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Downloads Only</span>
          </button>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${categoryName}...`}
              className="w-full bg-slate-800/80 border border-slate-700 text-xs rounded-xl pl-9 pr-8 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors shrink-0 flex items-center justify-center"
            title="Refresh category"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Error Banner */}
      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center justify-between text-red-200 text-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* 3. Post Grid or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-3 bg-slate-900/30 rounded-2xl border border-slate-800/40">
          <div className="p-4 rounded-full bg-slate-800/60 text-slate-500">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300">No Releases Found</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {downloadsOnly
              ? 'No posts in this category contain direct downloadable packages.'
              : 'No articles match your current search query.'}
          </p>
          {(searchQuery || downloadsOnly) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setDownloadsOnly(false)
              }}
              className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Reset all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onReadMore={setActivePost} />
          ))}
        </div>
      )}

      {/* 4. Full Article Reader Modal */}
      <PostModal post={activePost} onClose={() => setActivePost(null)} />
    </div>
  )
}
