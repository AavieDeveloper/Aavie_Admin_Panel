import client from './client'

export const fetchHomeSections = () =>
  client.get('/api/admin/home-sections').then(r => r.data)

export const updateHomeSection = (key, contentJson) =>
  client.put(`/api/admin/home-sections/${key}`, { contentJson }).then(r => r.data)

export const uploadHomeSectionImage = (key, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return client.post(`/api/admin/home-sections/${key}/upload-image`, formData, {
    headers: { 'Content-Type': undefined },
  }).then(r => r.data)
}