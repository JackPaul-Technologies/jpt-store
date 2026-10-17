import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { WPPost, WPCategory } from '../types/wordpress'
import { wpApi } from '../services/wpApi'
import { PostCard } from '../components/PostCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { PostModal } from '../components/PostModal'
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  Search,
  Monitor,
  Smartphone,
  Globe,
  FileText,
  ChevronRight,
  Flame
} from 'lucide-react'

export const Home: React.FC = () => {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<WPPost[]>([])
  const [categories, setCategories] = useState<WPCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activePost, setActivePost] = useState<WPPost | null>(null)

  // Interactive dashboard state
  const [searchFilter, setSearchFilter] = useState('')
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all')

  const loadDashboard = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const [fetchedPosts, fetchedCategories] = await Promise.all([
        wpApi.getPosts({ perPage: 24 }),
        wpApi.getCategories()
      ])
      setPosts(fetchedPosts)
      setCategories(fetchedCategories)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to WordPress API')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  // Filter posts dynamically by tab & live search
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        !searchFilter.trim() ||
        post.title.rendered.toLowerCase().includes(searchFilter.toLowerCase()) ||
        post.excerpt.rendered.toLowerCase().includes(searchFilter.toLowerCase())

      if (activeCategoryFilter === 'all') return matchesSearch

      const postCats = wpApi.getPostCategories(post).map((c) => c.toLowerCase())
      return matchesSearch && postCats.some((c) => c.includes(activeCategoryFilter.toLowerCase()))
    })
  }, [posts, searchFilter, activeCategoryFilter])

  // Partition data for dashboard layout
  const heroPost = posts[0]
  const trendingPosts = posts.slice(1, 4)

  // Extract posts by specific ecosystem rails
  const getPostsBySlug = (slugKeywords: string[]): WPPost[] => {
    return posts.filter((post) => {
      const cats = wpApi.getPostCategories(post).map((c) => c.toLowerCase())
      return cats.some((c) => slugKeywords.some((keyword) => c.includes(keyword)))
    })
  }

  const windowsPosts = useMemo(() => getPostsBySlug(['window']), [posts])
  const androidPosts = useMemo(() => getPostsBySlug(['android']), [posts])
  const webPosts = useMemo(() => getPostsBySlug(['web']), [posts])
  const articlePosts = useMemo(() => getPostsBySlug(['article', 'tech', 'general']), [posts])

  return (
    <div className="p-8 space-y-10 overflow-y-auto flex-1 select-none">
      {/* 1. Header Toolbar: Title, Search, and Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Latest Updates</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse official software packages, apps, and updates from Jack Paul Technologies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Quick search posts..."
              className="w-full bg-slate-800/80 border border-slate-700 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors border border-slate-700 shrink-0"
            title="Refresh feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Category Quick-Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Releases' },
          { id: 'windows', label: 'Windows Apps', icon: Monitor },
          { id: 'android', label: 'Android Apps', icon: Smartphone },
          { id: 'web', label: 'Web Apps', icon: Globe },
          { id: 'article', label: 'Articles', icon: FileText },
          ...categories
            .filter(
              (category) =>
                !['windows apps', 'android apps', 'web apps', 'articles'].includes(
                  category.name.toLowerCase()
                )
            )
            .map((category) => ({
              id: category.name.toLowerCase(),
              label: category.name,
              icon: undefined
            }))
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeCategoryFilter === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategoryFilter(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* 3. Error Banner */}
      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center justify-between text-red-200 text-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadDashboard}
            className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4. Main Body */}
      {loading ? (
        <div className="space-y-6">
          <div className="h-72 bg-slate-800/40 rounded-2xl animate-pulse border border-slate-700/50" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      ) : activeCategoryFilter !== 'all' || searchFilter.trim() ? (
        /* Filtered Search / Category View */
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-300">
            Matching Items ({filteredPosts.length})
          </h2>
          {filteredPosts.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-sm">
              No matching posts found. More posts coming soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} onReadMore={setActivePost} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Full Dashboard View */
        <>
          {/* Spotlight Hero (70%) + Trending List (30%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 flex flex-col">
              {heroPost && <PostCard post={heroPost} onReadMore={setActivePost} variant="hero" />}
            </div>

            <div className="glass-card lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Recent Posts</span>
                </div>
                <div className="space-y-2.5">
                  {trendingPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onReadMore={setActivePost}
                      variant="compact"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Categorized Rail: Windows Apps */}
          {windowsPosts.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <Monitor className="w-4 h-4 text-sky-400" />
                  <span>Windows</span>
                </div>
                <button
                  onClick={() => navigate('/category/windows')}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {windowsPosts.slice(0, 3).map((post) => (
                  <PostCard key={post.id} post={post} onReadMore={setActivePost} />
                ))}
              </div>
            </div>
          )}

          {/* Categorized Rail: Android Apps */}
          {androidPosts.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Android</span>
                </div>
                <button
                  onClick={() => navigate('/category/android')}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {androidPosts.slice(0, 3).map((post) => (
                  <PostCard key={post.id} post={post} onReadMore={setActivePost} />
                ))}
              </div>
            </div>
          )}

          {/* Categorized Rail: Web Apps */}
          {webPosts.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>Web Apps</span>
                </div>
                <button
                  onClick={() => navigate('/category/web')}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {webPosts.slice(0, 3).map((post) => (
                  <PostCard key={post.id} post={post} onReadMore={setActivePost} />
                ))}
              </div>
            </div>
          )}

          {/* Categorized Rail: Articles & Publications */}
          {articlePosts.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Articles</span>
                </div>
                <button
                  onClick={() => navigate('/category/articles')}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articlePosts.slice(0, 3).map((post) => (
                  <PostCard key={post.id} post={post} onReadMore={setActivePost} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Internal Reader Modal */}
      <PostModal post={activePost} onClose={() => setActivePost(null)} />
    </div>
  )
}
