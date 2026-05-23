import client from './client'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ARTICLE ENDPOINTS
 *
 * These need to be added to your Spring Boot backend.
 * Add a new ArticleController + Article entity + ArticleRepository.
 *
 * Article entity fields:
 *   Long id
 *   String title
 *   String category        // Prakriti | Cycle intelligence | Kitchen wisdom | etc.
 *   String ageGroup        // "18-24" | "25-30" | "31-35" | "36-45" | "all"
 *   String body            // Full article text
 *   String imageUrl        // Cover image URL
 *   String readTime        // "5 min read"
 *   String status          // "live" | "draft"
 *   LocalDateTime createdAt
 *   LocalDateTime updatedAt
 *
 * Spring Boot endpoints to add:
 *
 * @RestController
 * @RequestMapping("/api/admin/articles")
 * public class ArticleController {
 *
 *   @GetMapping                          → getAllArticles()
 *   @GetMapping("/{id}")                 → getArticle()
 *   @PostMapping                         → createArticle()
 *   @PutMapping("/{id}")                 → updateArticle()
 *   @DeleteMapping("/{id}")              → deleteArticle()
 * }
 *
 * Public endpoint for the Expo app (no auth required):
 * @GetMapping("/api/public/articles")    → getPublicArticles(@RequestParam String ageGroup)
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * GET /api/admin/articles?ageGroup=&status=&page=0&size=50
 */
export const fetchArticles = async ({ ageGroup = '', status = '', page = 0, size = 50 } = {}) => {
  const { data } = await client.get('/api/admin/articles', {
    params: { ageGroup, status, page, size },
  })
  return data
}

/**
 * GET /api/admin/articles/:id
 */
export const fetchArticle = async (id) => {
  const { data } = await client.get(`/api/admin/articles/${id}`)
  return data
}

/**
 * POST /api/admin/articles
 * Body: { title, category, ageGroup, body, imageUrl, readTime, status }
 */
export const createArticle = async (payload) => {
  const { data } = await client.post('/api/admin/articles', payload)
  return data
}

/**
 * PUT /api/admin/articles/:id
 */
export const updateArticle = async (id, payload) => {
  const { data } = await client.put(`/api/admin/articles/${id}`, payload)
  return data
}

/**
 * DELETE /api/admin/articles/:id
 */
export const deleteArticle = async (id) => {
  const { data } = await client.delete(`/api/admin/articles/${id}`)
  return data
}

/**
 * GET /api/admin/articles/stats
 * Returns: { total, live, draft, ageGroupCounts: { "18-24": N, ... } }
 */
export const fetchArticleStats = async () => {
  const { data } = await client.get('/api/admin/articles/stats')
  return data
}
