import React from 'react'
import { WPPost } from '../types/wordpress'
import { wpApi, DownloadInfo } from '../services/wpApi'
import { openExternal } from '../services/openExternal'
import {
  Calendar,
  ArrowRight,
  Clock,
  ImageOff,
  Download,
  Smartphone,
  Monitor,
  FolderArchive
} from 'lucide-react'

interface PostCardProps {
  post: WPPost
  onReadMore: (post: WPPost) => void
  variant?: 'standard' | 'compact' | 'hero'
}

const getCategoryBadgeStyle = (categoryName: string): string => {
  const name = categoryName.toLowerCase()
  if (name.includes('windows')) return 'bg-sky-500/15 text-sky-400 border-sky-500/30'
  if (name.includes('android')) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
  if (name.includes('web')) return 'bg-purple-500/15 text-purple-400 border-purple-500/30'
  return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
}

const getDownloadIcon = (type: DownloadInfo['type']) => {
  switch (type) {
    case 'apk':
      return <Smartphone className="w-3.5 h-3.5" />
    case 'exe':
      return <Monitor className="w-3.5 h-3.5" />
    case 'zip':
      return <FolderArchive className="w-3.5 h-3.5" />
    default:
      return <Download className="w-3.5 h-3.5" />
  }
}

export const PostCard: React.FC<PostCardProps> = ({ post, onReadMore, variant = 'standard' }) => {
  const imageUrl = wpApi.getFeaturedImageUrl(post)
  const categories = wpApi.getPostCategories(post)
  const primaryCategory = categories[0] || 'Articles'
  const downloadInfo = wpApi.extractDownloadInfo(post)

  const formattedDate = new Date(post.date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  const wordCount = post.content.rendered.replace(/<[^>]+>/g, '').split(/\s+/).length
  const readTimeMinutes = Math.max(1, Math.round(wordCount / 200))
  const cleanExcerpt = post.excerpt.rendered.replace(/<[^>]+>/g, '').trim()

  const handleDownloadClick = (e: React.MouseEvent): void => {
    e.stopPropagation()
    if (downloadInfo?.url) {
      openExternal(downloadInfo.url)
    }
  }

  // 1. Compact Variant
  if (variant === 'compact') {
    return (
      <div
        onClick={() => onReadMore(post)}
        className="glass-card group flex gap-3.5 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40 hover:border-indigo-500/40 cursor-pointer transition-all duration-200"
      >
        <div className="w-20 h-16 rounded-lg bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center border border-slate-700/50">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          ) : (
            <ImageOff className="w-4 h-4 text-slate-600" />
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getCategoryBadgeStyle(primaryCategory)}`}>
              {primaryCategory}
            </span>
            {downloadInfo && (
              <button
                onClick={handleDownloadClick}
                className="text-[10px] flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20"
                title={`Direct ${downloadInfo.label}`}
              >
                <Download className="w-2.5 h-2.5" />
                <span>Get</span>
              </button>
            )}
          </div>
          <h4
            className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 truncate transition-colors"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
        </div>
      </div>
    )
  }

  // 2. Hero Spotlight Variant
  if (variant === 'hero') {
    return (
      <div className="glass-card relative group bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-xl flex flex-col lg:flex-row transition-all duration-300">
        <div className="lg:w-7/12 relative aspect-video lg:aspect-auto bg-slate-950 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="text-slate-600 flex flex-col items-center gap-2">
              <ImageOff className="w-10 h-10" />
              <span className="text-xs">No media preview</span>
            </div>
          )}
          <span className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full border backdrop-blur-md shadow-sm ${getCategoryBadgeStyle(primaryCategory)}`}>
            {primaryCategory}
          </span>
        </div>

        <div className="lg:w-5/12 p-6 lg:p-8 flex flex-col justify-between bg-gradient-to-b from-slate-800/40 to-slate-900/60">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {readTimeMinutes} min read
              </span>
            </div>

            <h2
              className="text-xl font-bold text-slate-100 group-hover:text-indigo-300 transition-colors leading-snug line-clamp-3"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
              {cleanExcerpt}
            </p>
          </div>

          <div className="pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => onReadMore(post)}
              className="flex-1 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all"
            >
              <span>Read Article</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {downloadInfo && (
              <button
                onClick={handleDownloadClick}
                className="flex-1 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                title={`Open download link: ${downloadInfo.url}`}
              >
                {getDownloadIcon(downloadInfo.type)}
                <span>{downloadInfo.label}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 3. Standard Grid Card Variant
  return (
    <div
      onClick={() => onReadMore(post)}
      className="glass-card group bg-slate-800/50 hover:bg-slate-800/90 border border-slate-700/60 hover:border-indigo-500/40 rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5"
    >
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-slate-600 flex flex-col items-center gap-1">
            <ImageOff className="w-6 h-6" />
            <span className="text-[11px]">No image</span>
          </div>
        )}
        <span className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border backdrop-blur-md ${getCategoryBadgeStyle(primaryCategory)}`}>
          {primaryCategory}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1.5">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
            <span>•</span>
            <Clock className="w-3 h-3" />
            <span>{readTimeMinutes} min read</span>
          </div>

          <h3
            className="text-sm font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />

          <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {cleanExcerpt}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-700/40 flex items-center justify-between text-xs font-semibold">
          <span className="text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
            <span>Read Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>

          {downloadInfo && (
            <button
              onClick={handleDownloadClick}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-colors"
              title={`Download: ${downloadInfo.url}`}
            >
              {getDownloadIcon(downloadInfo.type)}
              <span>{downloadInfo.label}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
