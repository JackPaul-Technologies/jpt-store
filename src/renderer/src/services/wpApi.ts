import { WPPost, WPCategory } from '../types/wordpress'

const SITE_DOMAIN = 'jackpaultechnologies.wordpress.com'
const BASE_URL = `https://public-api.wordpress.com/wp/v2/sites/${SITE_DOMAIN}`

export interface DownloadInfo {
  url: string
  label: string
  type: 'apk' | 'exe' | 'zip' | 'generic'
}

class WordPressApiService {
  private cache = new Map<string, { data: unknown; timestamp: number }>()
  private cacheTTL = 1000 * 60 * 10 // 10 minutes cache duration

  private async fetchWithCache<T>(url: string): Promise<T> {
    const cached = this.cache.get(url)
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as T
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    this.cache.set(url, { data, timestamp: Date.now() })
    return data as T
  }

  clearCache(): void {
    this.cache.clear()
  }

  async getPosts(options: {
    page?: number
    perPage?: number
    categoryIds?: number[]
    search?: string
  } = {}): Promise<WPPost[]> {
    const { page = 1, perPage = 10, categoryIds, search } = options
    const params = new URLSearchParams({
      _embed: '1',
      page: page.toString(),
      per_page: perPage.toString()
    })

    if (categoryIds && categoryIds.length > 0) {
      params.append('categories', categoryIds.join(','))
    }
    if (search && search.trim()) {
      params.append('search', search.trim())
    }

    return this.fetchWithCache<WPPost[]>(`${BASE_URL}/posts?${params.toString()}`)
  }

  async getCategories(): Promise<WPCategory[]> {
    return this.fetchWithCache<WPCategory[]>(`${BASE_URL}/categories?per_page=50`)
  }

  getFeaturedImageUrl(post: WPPost): string | null {
    const media = post._embedded?.['wp:featuredmedia']?.[0]
    return (
      media?.media_details?.sizes?.medium?.source_url ||
      media?.source_url ||
      null
    )
  }

  getPostCategories(post: WPPost): string[] {
    const terms = post._embedded?.['wp:term']?.[0]
    if (!terms) return []
    return terms.map((term) => term.name)
  }

  // Automatically parse WordPress post content for download links / buttons
  extractDownloadInfo(post: WPPost): DownloadInfo | null {
    if (!post?.content?.rendered) return null

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(post.content.rendered, 'text/html')
      const links = Array.from(doc.querySelectorAll('a'))

      for (const link of links) {
        const href = (link.getAttribute('href') || '').trim()
        const text = (link.textContent || '').trim().toLowerCase()
        const isWPButton =
          link.classList.contains('wp-block-button__link') ||
          link.closest('.wp-block-button') !== null

        // Ignore empty, anchor, or internal admin links
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) continue

        const hasDownloadKeywords =
          text.includes('download') ||
          text.includes('get app') ||
          text.includes('install') ||
          text.includes('get for windows') ||
          text.includes('get for android') ||
          text.includes('direct download')

        const hasDownloadAttr = link.hasAttribute('download')
        const hasBinaryExtension = /\.(apk|exe|msi|msix|appxbundle|zip|rar|7z|tar\.gz)$/i.test(href)
        const hasReleasePath = href.includes('/releases/download/') || href.includes('drive.google.com')

        if (
          hasDownloadKeywords ||
          hasDownloadAttr ||
          hasBinaryExtension ||
          hasReleasePath ||
          (isWPButton && (text.includes('download') || text.includes('get')))
        ) {
          let type: 'apk' | 'exe' | 'zip' | 'generic' = 'generic'
          let label = 'Download'

          if (/\.apk$/i.test(href) || text.includes('apk') || text.includes('android')) {
            type = 'apk'
            label = 'Download APK'
          } else if (
            /\.(exe|msi|msix|appxbundle)$/i.test(href) ||
            text.includes('windows') ||
            text.includes('exe')
          ) {
            type = 'exe'
            label = 'Download .EXE'
          } else if (/\.(zip|rar|7z|tar\.gz)$/i.test(href) || text.includes('zip')) {
            type = 'zip'
            label = 'Download ZIP'
          } else if (link.textContent?.trim() && link.textContent.trim().length <= 22) {
            label = link.textContent.trim()
          }

          return { url: href, label, type }
        }
      }
    } catch {
      // Return null on parsing issues
    }

    return null
  }
}

export const wpApi = new WordPressApiService()
