import { gatewayClient } from '@/lib/axios'
import type { HelpArticle, HelpCategory, PageResponse, PaginationParams } from '@/types'

// Public Help Center — routes through gateway: /api/v1/help-center/**
const BASE = '/api/v1/help-center'

export const helpCenterApi = {
  /** GET /api/v1/help-center/categories — Published categories */
  getCategories: () =>
    gatewayClient.get<HelpCategory[]>(`${BASE}/categories`),

  /**
   * GET /api/v1/help-center/articles
   * Query: category, search (paginated)
   */
  getArticles: (params?: PaginationParams & { category?: string; search?: string }) =>
    gatewayClient.get<PageResponse<HelpArticle>>(`${BASE}/articles`, { params }),

  /**
   * GET /api/v1/help-center/articles/:slug — Published article by slug
   *
   * IMPORTANT: Article content field is HTML.
   * Always sanitize with DOMPurify before rendering innerHTML.
   * Never render raw article.content directly.
   */
  getArticleBySlug: (slug: string) =>
    gatewayClient.get<HelpArticle>(`${BASE}/articles/${slug}`),
}
