import React, { useEffect, useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import { WPPost } from '../types/wordpress'
import { wpApi, DownloadInfo } from '../services/wpApi'
import { openExternal } from '../services/openExternal'
import {
  X,
  ExternalLink,
  Calendar,
  Clock,
  Check,
  Type,
  Share2,
  Download,
  Smartphone,
  Monitor,
  FolderArchive,
  Sparkles
} from 'lucide-react'

interface PostModalProps {
  post: WPPost | null
  onClose: () => void
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
      return <Smartphone className="w-4 h-4" />
    case 'exe':
      return <Monitor className="w-4 h-4" />
    case 'zip':
      return <FolderArchive className="w-4 h-4" />
    default:
      return <Download className="w-4 h-4" />
  }
}

type FontSize = 'sm' | 'base' | 'lg'

export const PostModal: React.FC<PostModalProps> = ({ post, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [fontSize, setFontSize] = useState<FontSize>('base')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    if (!contentRef.current) return

    const handleAnchorClick = (e: MouseEvent): void => {
      const target = (e.target as HTMLElement).closest('a')
      if (target && target.href) {
        e.preventDefault()
        openExternal(target.href)
      }
    }

    const container = contentRef.current
    container.addEventListener('click', handleAnchorClick)
    return () => container.removeEventListener('click', handleAnchorClick)
  }, [post])

  if (!post) return null

  const imageUrl = wpApi.getFeaturedImageUrl(post)
  const categories = wpApi.getPostCategories(post)
  const primaryCategory = categories[0] || 'Articles'
  const downloadInfo = wpApi.extractDownloadInfo(post)

  const wordCount = post.content.rendered.replace(/<[^>]+>/g, '').split(/\s+/).length
  const readTimeMinutes = Math.max(1, Math.round(wordCount / 200))

  const cleanContent = DOMPurify.sanitize(post.content.rendered, {
    ADD_ATTR: ['target', 'rel']
  })

  const handleCopyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(post.link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const cycleFontSize = (): void => {
    setFontSize((prev) => (prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : 'sm'))
  }

  const fontSizeClass = {
    sm: 'text-xs [&>p]:leading-relaxed',
    base: 'text-sm [&>p]:leading-relaxed',
    lg: 'text-base [&>p]:leading-loose'
  }[fontSize]

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="glass-panel bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Desktop Reader Toolbar */}
        <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeStyle(
                primaryCategory
              )}`}
            >
              {primaryCategory}
            </span>
            {categories.length > 1 && (
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                +{categories.slice(1).join(', ')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Package Download Action */}
            {downloadInfo && (
              <button
                onClick={() => openExternal(downloadInfo.url)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
                title={`Download from ${downloadInfo.url}`}
              >
                {getDownloadIcon(downloadInfo.type)}
                <span>{downloadInfo.label}</span>
              </button>
            )}

            {/* Font Size Adjuster */}
            <button
              onClick={cycleFontSize}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 text-xs font-medium transition-colors"
              title="Toggle font size"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="uppercase text-[10px] font-mono">{fontSize}</span>
            </button>

            {/* Copy Article Link */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 text-xs font-medium transition-colors"
              title="Copy link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px]">Copied</span>
                </>
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Open in Default External Browser */}
            <button
              onClick={() => openExternal(post.link)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
              title="Open full article on WordPress"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WordPress</span>
            </button>

            {/* Close Modal (ESC) */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Body */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-6 select-text">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {new Date(post.date).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {readTimeMinutes} min read
              </span>
            </div>

            <h1
              className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight leading-snug"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
          </div>

          {/* Featured Image */}
          {imageUrl && (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg">
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Prominent In-Modal Download Callout Box */}
          {downloadInfo && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900/80 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Release File Available</span>
                </div>
                <p className="text-xs text-slate-300">
                  This release contains an official binary package ready to install on your device.
                </p>
              </div>
              <button
                onClick={() => openExternal(downloadInfo.url)}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all shrink-0"
              >
                {getDownloadIcon(downloadInfo.type)}
                <span>{downloadInfo.label}</span>
              </button>
            </div>
          )}

          {/* Sanitized Content */}
          <div
            ref={contentRef}
            className={`text-slate-300 space-y-5 ${fontSizeClass}
              [&>p]:text-slate-300 [&>p]:leading-relaxed
              [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-slate-100 [&>h2]:pt-4 [&>h2]:border-b [&>h2]:border-slate-800 [&>h2]:pb-2
              [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-slate-200 [&>h3]:pt-2
              [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 [&>ul]:text-slate-300
              [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-2 [&>ol]:text-slate-300
              [&>blockquote]:border-l-4 [&>blockquote]:border-indigo-500 [&>blockquote]:bg-slate-800/40 [&>blockquote]:py-2 [&>blockquote]:px-4 [&>blockquote]:rounded-r-lg [&>blockquote]:italic [&>blockquote]:text-slate-400
              [&>pre]:bg-slate-950 [&>pre]:border [&>pre]:border-slate-800 [&>pre]:p-4 [&>pre]:rounded-xl [&>pre]:overflow-x-auto [&>pre]:font-mono [&>pre]:text-xs [&>pre]:text-indigo-300
              [&>code]:bg-slate-800 [&>code]:text-indigo-300 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:font-mono [&>code]:text-xs
              [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-slate-800 [&_table]:my-4 [&_table]:text-xs
              [&_th]:bg-slate-800/80 [&_th]:p-2.5 [&_th]:text-left [&_th]:font-semibold [&_th]:border [&_th]:border-slate-800
              [&_td]:p-2.5 [&_td]:border [&_td]:border-slate-800/60
              [&_img]:rounded-xl [&_img]:border [&_img]:border-slate-800 [&_img]:my-4 [&_img]:max-w-full [&_img]:h-auto
              [&_a]:text-indigo-400 [&_a]:underline [&_a]:decoration-indigo-500/40 [&_a]:underline-offset-2 hover:[&_a]:text-indigo-300
            `}
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />
        </div>
      </div>
    </div>
  )
}
