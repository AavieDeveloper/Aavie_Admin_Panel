import client from './client'

/**
 * GET /api/admin/users?page=0&size=50&search=
 * Admin-only endpoint — returns paginated UserAdminDTO list
 * Fields: id, name, age, city, email, gender, profileCompletion, createdAt
 *
 * NOTE: Add this endpoint to your Spring Boot AdminController:
 *   @GetMapping("/api/admin/users")
 *   @PreAuthorize("hasRole('ADMIN')")
 *   public Page<UserAdminDTO> getUsers(@RequestParam int page, @RequestParam int size, @RequestParam(required=false) String search)
 */
export const fetchUsers = async ({ page = 0, size = 200, search = '', status = 'all' } = {}) => {
  const { data } = await client.get('/api/admin/users', {
    params: { page, size, search, status },
  })
  return data
}

/**
 * GET /api/admin/users/stats
 * Returns: { total, prakritiDone, pcosDone, vikritiDone, allComplete }
 */
export const fetchUserStats = async () => {
  const { data } = await client.get('/api/admin/users/stats')
  return data
}

/**
 * GET /api/assessments/status/{userId}
 * Spring Boot UserAssessmentService.getStatus()
 * Returns: { prakritiDone, pcosDone, vikritiDone, prakritiResult, pcosResult, pcosSeverity, vikritiResult }
 */
export const fetchAssessmentStatus = async (userId) => {
  const { data } = await client.get(`/api/assessments/status/${userId}`)
  return data
}

/**
 * GET /api/admin/assessments/overview
 * Returns aggregate counts for all assessment types
 */
export const fetchAssessmentOverview = async () => {
  const { data } = await client.get('/api/admin/assessments/overview')
  return data
}

/**
 * GET /api/admin/dashboard/stats
 * Returns: { totalUsers, assessmentsDone, articlesLive, activeThisMonth, weeklyGrowth, monthlyDelta }
 */
export const fetchDashboardStats = async () => {
  const { data } = await client.get('/api/admin/dashboard/stats')
  return data
}

// ADD at bottom of api/users.js:

export const fetchAssessmentStats = async () => {
  const { data } = await client.get('/api/admin/assessments/stats')
  return data
}

export const fetchActivity = async () => {
  const { data } = await client.get('/api/admin/activity')
  return data
}
