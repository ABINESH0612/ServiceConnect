import { gatewayClient } from '@/lib/axios'
import type {
  CatalogItem,
  CreateCatalogItemRequest,
  UpdateCatalogItemRequest,
  PageResponse,
  PaginationParams,
} from '@/types'

// ============================================================
// Catalog API
//
// Gateway routes: /api/v1/catalog/**
// Controller path: /api/catalog/**
//
// IMPORTANT: Gateway path rewriting (/api/v1/catalog → /api/catalog)
// must be verified against backend source. Using gateway URL pattern
// here. If rewrites are not working, switch BASE to use catalog
// service directly (add VITE_CATALOG_SERVICE_URL env var).
// ============================================================

const BASE = '/api/v1/catalog'

export const catalogApi = {
  /** POST /api/v1/catalog — Create catalog item (PROVIDER) */
  create: (data: CreateCatalogItemRequest) =>
    gatewayClient.post<CatalogItem>(BASE, data),

  /**
   * GET /api/v1/catalog — Search/list items
   * Query params: search, category (paginated)
   */
  search: (params?: PaginationParams & { search?: string; category?: string }) =>
    gatewayClient.get<PageResponse<CatalogItem>>(BASE, { params }),

  /** GET /api/v1/catalog/:id */
  getById: (id: number) =>
    gatewayClient.get<CatalogItem>(`${BASE}/${id}`),

  /** GET /api/v1/catalog/provider/:providerId — All items for a provider */
  getByProvider: (providerId: number, params?: PaginationParams) =>
    gatewayClient.get<PageResponse<CatalogItem>>(`${BASE}/provider/${providerId}`, { params }),

  /** PUT /api/v1/catalog/:id (PROVIDER) */
  update: (id: number, data: UpdateCatalogItemRequest) =>
    gatewayClient.put<CatalogItem>(`${BASE}/${id}`, data),

  /** DELETE /api/v1/catalog/:id — Soft deactivate (PROVIDER) */
  deactivate: (id: number) =>
    gatewayClient.delete(`${BASE}/${id}`),

  /** PATCH /api/v1/catalog/:id/activate — Re-enable (PROVIDER) */
  activate: (id: number) =>
    gatewayClient.patch(`${BASE}/${id}/activate`),
}
