import client from './client'

export const fetchAdminSlides = () =>
  client.get('/api/admin/intro-slides').then(r => r.data)

export const updateSlide = (id, data) =>
  client.put(`/api/admin/intro-slides/${id}`, data).then(r => r.data)

export const reorderSlides = (items) =>
  client.put('/api/admin/intro-slides/reorder', items).then(r => r.data)

export const uploadSlideImage = (id, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return client.post(`/api/admin/intro-slides/${id}/upload-image`, formData, {
    headers: { 'Content-Type': undefined },
  }).then(r => r.data)
}