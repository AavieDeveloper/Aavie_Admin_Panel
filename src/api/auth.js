import client from './client'

/**
 * POST /api/auth/login
 * Spring Boot AuthController → AuthService.login()
 * Returns: { userId, gender, name, token }
 */
export const loginAdmin = async ({ email, password }) => {
  const { data } = await client.post('/api/auth/login', { email, password })
  return data
}
