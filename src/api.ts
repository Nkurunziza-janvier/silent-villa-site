const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export type Room = {
  id: number
  name: string
  price: number
  imageUrl: string
  description: string | null
}

export type GalleryImage = {
  id: number
  title: string
  altText: string | null
  imageUrl: string
  createdAt?: string
}

export type Booking = {
  id: number
  roomId: number
  roomName: string
  roomImage: string
  roomPrice: number
  name: string
  email: string
  phone: string
  stayType?: 'short_stay' | 'long_stay' | 'overnight' | null
  checkIn: string
  checkOut: string
  checkInTime?: string | null
  checkOutTime?: string | null
  durationHours?: number | null
  guests: number
  specialRequests: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  notificationRead: boolean
  createdAt: string
}

export type BookingSlot = {
  id: number
  stayType?: string | null
  checkIn: string
  checkOut: string
  checkInTime?: string | null
  checkOutTime?: string | null
  durationHours?: number | null
  status: 'pending' | 'confirmed'
}

export function imageUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('/media/')) return url
  return `${API_URL.replace(/\/api$/, '')}${url}`
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'The request could not be completed.')
  return data as T
}

export const api = {
  rooms: () => request<Room[]>('/rooms'),
  gallery: () => request<GalleryImage[]>('/gallery'),
  availability: (roomId: number, date: string) =>
    request<BookingSlot[]>(`/bookings/availability?roomId=${encodeURIComponent(roomId)}&date=${encodeURIComponent(date)}`).catch(() => []),
  book: (booking: Record<string, unknown>) => request<{ id: number; message: string }>('/bookings', { method: 'POST', body: JSON.stringify(booking) }),
  login: (email: string, password: string) => request<{ token: string; email: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  bookings: (token: string) => request<Booking[]>('/admin/bookings', {}, token),
  adminRooms: (token: string) => request<(Room & { isActive: boolean })[]>('/admin/rooms', {}, token),
  addRoom: (token: string, form: FormData) => request<Room>('/admin/rooms', { method: 'POST', body: form }, token),
  updateRoom: (token: string, id: number, form: FormData) => request<Room & { isActive: boolean }>(`/admin/rooms/${id}`, { method: 'PATCH', body: form }, token),
  deleteRoom: (token: string, id: number) => request<{ message: string }>(`/admin/rooms/${id}`, { method: 'DELETE' }, token),
  adminGallery: (token: string) => request<GalleryImage[]>('/admin/gallery', {}, token),
  addGalleryImage: (token: string, form: FormData) => request<GalleryImage>('/admin/gallery', { method: 'POST', body: form }, token),
  deleteGalleryImage: (token: string, id: number) => request<{ message: string }>(`/admin/gallery/${id}`, { method: 'DELETE' }, token),
  updateBooking: (token: string, id: number, status: Booking['status']) => request(`/admin/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token),
  deleteBooking: (token: string, id: number) => request<{ message: string }>(`/admin/bookings/${id}`, { method: 'DELETE' }, token),
  markRead: (token: string, ids: number[]) => request('/admin/bookings/read', { method: 'PATCH', body: JSON.stringify({ ids }) }, token),
}
