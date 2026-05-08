import client from './client'
import type { Room, Entry, RankingResponse } from '../types'

export const getRoom = (roomCode: string) =>
  client.get<Room>(`/rooms/${roomCode}`)

export const getRoomRankings = (roomCode: string, page = 0, size = 20) =>
  client.get<RankingResponse>(`/rooms/${roomCode}/rankings`, {
    params: { page, size },
  })

export const postEntry = (roomCode: string) =>
  client.post<Entry>(`/rooms/${roomCode}/entries`)

export const getMyEntry = (roomCode: string) =>
  client.get<Entry>(`/rooms/${roomCode}/entries/me`)

export const claimTicket = (ticketToken: string) =>
  client.post(`/entry-tickets/${ticketToken}/claim`)

export const createRoom = (data: Record<string, unknown>) =>
  client.post('/host/rooms', data)

export const getMyRooms = () =>
  client.get('/host/rooms')

export const getOAuthUrl = (provider: 'google' | 'kakao') =>
  client.get(`/auth/oauth/${provider}/authorize-url`)