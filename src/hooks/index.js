import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUsers, fetchUserStats, fetchDashboardStats, fetchAssessmentOverview, fetchAssessmentStats, fetchActivity } from '../api/users'
import { fetchArticles, fetchArticle, createArticle, updateArticle, deleteArticle, fetchArticleStats } from '../api/articles'
import { useToastStore } from '../store'

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const useDashboardStats = () =>
  useQuery({ queryKey: ['dashStats'], queryFn: fetchDashboardStats })

// ── Users ─────────────────────────────────────────────────────────────────────
export const useUsers = (params) =>
  useQuery({ queryKey: ['users', params], queryFn: () => fetchUsers(params) })

export const useUserStats = () =>
  useQuery({ queryKey: ['userStats'], queryFn: fetchUserStats })

export const useAssessmentOverview = () =>
  useQuery({ queryKey: ['assessOverview'], queryFn: fetchAssessmentOverview })

export const useAssessmentStats = () =>
  useQuery({ queryKey: ['assessmentStats'], queryFn: fetchAssessmentStats, staleTime: 30000 })

export const useActivity = () =>
  useQuery({ queryKey: ['activity'], queryFn: fetchActivity, refetchInterval: 30000 })

// ── Articles ──────────────────────────────────────────────────────────────────
export const useArticles = (params) =>
  useQuery({ queryKey: ['articles', params], queryFn: () => fetchArticles(params) })

export const useArticle = (id) =>
  useQuery({ queryKey: ['article', id], queryFn: () => fetchArticle(id), enabled: !!id })

export const useArticleStats = () =>
  useQuery({ queryKey: ['articleStats'], queryFn: fetchArticleStats })

export const useCreateArticle = () => {
  const qc = useQueryClient()
  const toast = useToastStore((s) => s.addToast)
  return useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['articles'] })
      qc.invalidateQueries({ queryKey: ['articleStats'] })
      qc.invalidateQueries({ queryKey: ['dashStats'] })
      toast('Article published successfully', 'success')
    },
    onError: (err) => toast(err?.response?.data?.message || 'Failed to publish', 'error'),
  })
}

export const useUpdateArticle = () => {
  const qc = useQueryClient()
  const toast = useToastStore((s) => s.addToast)
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateArticle(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['articles'] })
      toast('Article updated', 'success')
    },
    onError: () => toast('Update failed', 'error'),
  })
}

export const useDeleteArticle = () => {
  const qc = useQueryClient()
  const toast = useToastStore((s) => s.addToast)
  return useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['articles'] })
      qc.invalidateQueries({ queryKey: ['articleStats'] })
      toast('Article deleted', 'success')
    },
    onError: () => toast('Delete failed', 'error'),
  })
}
