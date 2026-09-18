import { adminServiceClient } from '@/lib/axios'
import type {
  HelpArticle,
  HelpCategory,
  CreateHelpArticleRequest,
  UpdateHelpArticleRequest,
  AuditLog,
  PageResponse,
  PaginationParams,
} from '@/types'

// Admin service: direct to port 8083
const HELP_BASE = '/api/v1/admin/help-center/articles'
const AUDIT_BASE = '/api/v1/admin/audit-logs'

export const adminApi = {
  // ---- Help Center Admin ------------------------------------

  /** POST /api/v1/admin/help-center/articles (ADMIN) */
  createArticle: (data: CreateHelpArticleRequest) =>
    adminServiceClient.post<HelpArticle>(HELP_BASE, data),

  /** GET /api/v1/admin/help-center/articles (ADMIN, paginated) */
  getAllArticles: (params?: PaginationParams) =>
    adminServiceClient.get<PageResponse<HelpArticle>>(HELP_BASE, { params }),

  /** GET /api/v1/admin/help-center/articles/:articleId */
  getArticleById: (articleId: number) =>
    adminServiceClient.get<HelpArticle>(`${HELP_BASE}/${articleId}`),

  /** PUT /api/v1/admin/help-center/articles/:articleId */
  updateArticle: (articleId: number, data: UpdateHelpArticleRequest) =>
    adminServiceClient.put<HelpArticle>(`${HELP_BASE}/${articleId}`, data),

  /** DELETE /api/v1/admin/help-center/articles/:articleId */
  deleteArticle: (articleId: number) =>
    adminServiceClient.delete(`${HELP_BASE}/${articleId}`),

  // ---- Audit Logs ------------------------------------------

  /** GET /api/v1/admin/audit-logs (ADMIN, paginated) */
  getAuditLogs: (params?: PaginationParams) =>
    adminServiceClient.get<PageResponse<AuditLog>>(AUDIT_BASE, { params }),

  /** GET /api/v1/admin/audit-logs/actor/:actorId */
  getAuditLogsByActor: (actorId: number, params?: PaginationParams) =>
    adminServiceClient.get<PageResponse<AuditLog>>(`${AUDIT_BASE}/actor/${actorId}`, { params }),

  /** GET /api/v1/admin/audit-logs/role/:actorRole */
  getAuditLogsByRole: (actorRole: string, params?: PaginationParams) =>
    adminServiceClient.get<PageResponse<AuditLog>>(`${AUDIT_BASE}/role/${actorRole}`, { params }),

  /** GET /api/v1/admin/audit-logs/action/:action */
  getAuditLogsByAction: (action: string, params?: PaginationParams) =>
    adminServiceClient.get<PageResponse<AuditLog>>(`${AUDIT_BASE}/action/${action}`, { params }),

  /** GET /api/v1/admin/audit-logs/resource/:resourceType */
  getAuditLogsByResource: (resourceType: string, params?: PaginationParams) =>
    adminServiceClient.get<PageResponse<AuditLog>>(`${AUDIT_BASE}/resource/${resourceType}`, { params }),

  /** GET /api/v1/admin/audit-logs/resource/:resourceType/:resourceId */
  getAuditLogsByResourceId: (resourceType: string, resourceId: string, params?: PaginationParams) =>
    adminServiceClient.get<PageResponse<AuditLog>>(`${AUDIT_BASE}/resource/${resourceType}/${resourceId}`, { params }),
}

// ---- Help Category summary ----------------------------------
export type { HelpCategory }
