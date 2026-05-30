import client from './client'

export const fetchAdminQuestions = (type) =>
  client.get(`/api/admin/questions/${type}`).then(r => r.data)

export const createQuestion = (data) =>
  client.post('/api/admin/questions', data).then(r => r.data)

export const updateQuestion = (id, data) =>
  client.put(`/api/admin/questions/${id}`, data).then(r => r.data)

export const deleteQuestion = (id) =>
  client.delete(`/api/admin/questions/${id}`).then(r => r.data)

export const toggleQuestion = (id) =>
  client.patch(`/api/admin/questions/${id}/toggle`).then(r => r.data)

export const reorderQuestions = (orderList) =>
  client.put('/api/admin/questions/reorder', orderList).then(r => r.data)