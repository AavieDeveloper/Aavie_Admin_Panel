import client from './client'

export const fetchAdminSlides = () =>
  client.get('/api/admin/intro-slides').then(r => r.data)

export const updateSlide = (id, data) =>
  client.put(`/api/admin/intro-slides/${id}`, data).then(r => r.data)

export const reorderSlides = (items) =>
  client.put('/api/admin/intro-slides/reorder', items).then(r => r.data)