import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAdminQuestions, createQuestion, updateQuestion, deleteQuestion, toggleQuestion } from '../api/questions'
import { useToastStore } from '../store'

export function useAdminQuestions(type) {
  return useQuery({
    queryKey: ['questions', type],
    queryFn: () => fetchAdminQuestions(type),
    enabled: !!type,
  })
}

export function useCreateQuestion() {
  const qc = useQueryClient()
  const toast = useToastStore(s => s.addToast)
  return useMutation({
    mutationFn: createQuestion,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['questions', vars.assessmentType] })
      toast('Question added', 'success')
    },
    onError: () => toast('Failed to add question', 'error'),
  })
}

export function useUpdateQuestion() {
  const qc = useQueryClient()
  const toast = useToastStore(s => s.addToast)
  return useMutation({
    mutationFn: ({ id, ...data }) => updateQuestion(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['questions'] })
      toast('Question updated', 'success')
    },
    onError: () => toast('Failed to update', 'error'),
  })
}

export function useDeleteQuestion() {
  const qc = useQueryClient()
  const toast = useToastStore(s => s.addToast)
  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['questions'] })
      toast('Question deleted', 'success')
    },
    onError: () => toast('Delete failed', 'error'),
  })
}

export function useToggleQuestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: toggleQuestion,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['questions'] }),
  })
}