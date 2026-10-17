export interface WPRenderedContent {
  rendered: string
}

export interface WPMediaSize {
  source_url: string
  width: number
  height: number
}

export interface WPMedia {
  id: number
  source_url: string
  alt_text?: string
  media_details?: {
    sizes?: {
      thumbnail?: WPMediaSize
      medium?: WPMediaSize
      full?: WPMediaSize
    }
  }
}

export interface WPCategory {
  id: number
  count: number
  description: string
  name: string
  slug: string
}

export interface WPPost {
  id: number
  date: string
  modified: string
  slug: string
  status: string
  type: string
  link: string
  title: WPRenderedContent
  content: WPRenderedContent
  excerpt: WPRenderedContent
  featured_media: number
  categories: number[]
  _embedded?: {
    'wp:featuredmedia'?: WPMedia[]
    'wp:term'?: WPCategory[][]
  }
}
