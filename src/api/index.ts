import client from './client'
import type {
  ApiResponse,
  RoomInfo,
  HostRoomList,
  CreateRoomRequest,
  UpdateRoomRequest,
  EntryOrTicketResult,
  MyEntry,
  EntryTicket,
  ClaimResult,
  RoomMemberProfile,
  GuestAuthRequest,
  GuestAuthResult,
  LinkAuthorizeResult,
  AccountLinkStatus,
  AuthorizeUrlResult,
  OAuthProvider,
} from '../types'

// 모든 응답은 { success, status, data, timestamp } envelope 로 옴.
// 각 함수는 envelope 를 벗기고 실제 data 만 반환한다.
const unwrap = <T>(p: Promise<{ data: ApiResponse<T> }>): Promise<T> =>
  p.then((res) => res.data.data)

// ─────────────────────────────────────────────
// 1. Public Room (공개 룸 정보 조회)
//    백엔드가 GET /rooms/{roomCode} 대신 GET /host/rooms/{roomId} 로 구현 (인증 불필요).
//    roomId 자리에는 외부 공유용 roomCode 를 넣어 호출한다.
// ─────────────────────────────────────────────
export const getRoom = (roomId: string) =>
  unwrap(client.get<ApiResponse<RoomInfo>>(`/host/rooms/${roomId}`))

// ─────────────────────────────────────────────
// 2. Host Room 관리 (인증 필요)
// ─────────────────────────────────────────────
export const getMyRooms = () =>
  unwrap(client.get<ApiResponse<HostRoomList>>('/host/rooms'))

export const createRoom = (data: CreateRoomRequest) =>
  unwrap(client.post<ApiResponse<RoomInfo>>('/host/rooms', data))

export const getHostRoom = (roomId: string) =>
  unwrap(client.get<ApiResponse<RoomInfo>>(`/host/rooms/${roomId}`))

export const updateRoom = (roomId: string, data: UpdateRoomRequest, hostToken?: string) =>
  unwrap(
    client.patch<ApiResponse<RoomInfo>>(`/host/rooms/${roomId}`, data, {
      headers: hostToken ? { Authorization: `Bearer ${hostToken}` } : undefined,
    }),
  )

export const deleteRoom = (roomId: string, hostToken?: string) =>
  client.delete(`/host/rooms/${roomId}`, {
    headers: hostToken ? { Authorization: `Bearer ${hostToken}` } : undefined,
  })

export const getParticipants = (roomId: string) =>
  unwrap(client.get<ApiResponse<unknown>>(`/host/rooms/${roomId}/participants`))

// ─────────────────────────────────────────────
// 3. Room Participation (응모 / 방멤버 프로필)
// ─────────────────────────────────────────────
// 응모 생성 또는 대기열 등록.
//  - Authorization 있으면 Entry 즉시 생성, 없으면 EntryTicket 발급.
export const postEntry = (roomCode: string) =>
  unwrap(client.post<ApiResponse<EntryOrTicketResult>>(`/rooms/${roomCode}/entries`))

// 내 응모 상태 조회
export const getMyEntry = (roomCode: string) =>
  unwrap(client.get<ApiResponse<MyEntry>>(`/rooms/${roomCode}/entries/me`))

// 내 방멤버 프로필 생성 또는 조회/수정
export const patchMyProfile = (roomCode: string, data: Record<string, unknown> = {}) =>
  unwrap(client.patch<ApiResponse<RoomMemberProfile>>(`/rooms/${roomCode}/me`, data))

// ─────────────────────────────────────────────
// 4. Guest Auth (방 전용 회원가입 / 로그인)
// ─────────────────────────────────────────────
export const guestSignup = (roomCode: string, data: GuestAuthRequest) =>
  unwrap(client.post<ApiResponse<GuestAuthResult>>(`/rooms/${roomCode}/auth/signup`, data))

export const guestLogin = (roomCode: string, data: GuestAuthRequest) =>
  unwrap(client.post<ApiResponse<GuestAuthResult>>(`/rooms/${roomCode}/auth/login`, data))

// ─────────────────────────────────────────────
// 5. Entry Ticket (비로그인 선응모 후 확정)
// ─────────────────────────────────────────────
export const getTicket = (ticketToken: string) =>
  unwrap(client.get<ApiResponse<EntryTicket>>(`/entry-tickets/${ticketToken}`))

export const claimTicket = (ticketToken: string) =>
  unwrap(client.post<ApiResponse<ClaimResult>>(`/entry-tickets/${ticketToken}/claim`))

// ─────────────────────────────────────────────
// 6. 일반 인증 (서비스 회원)
// ─────────────────────────────────────────────
export const getOAuthUrl = (provider: OAuthProvider) =>
  unwrap(client.get<ApiResponse<AuthorizeUrlResult>>(`/auth/oauth/${provider}/authorize-url`))

export const logout = () => client.post('/auth/logout')

export const withdraw = () => client.delete('/auth/withdraw')

// ─────────────────────────────────────────────
// 7. 소셜 계정 연동 (guest → social member)
// ─────────────────────────────────────────────
// redirect=false 면 authorizeUrl 을 받아 프론트에서 직접 이동.
export const getAccountLinkAuthorizeUrl = (roomCode: string, provider: OAuthProvider) =>
  unwrap(
    client.get<ApiResponse<LinkAuthorizeResult>>(
      `/rooms/${roomCode}/me/oauth/${provider}/link/authorize`,
      { params: { redirect: false } },
    ),
  )

export const getAccountLinkStatus = (roomCode: string) =>
  unwrap(client.get<ApiResponse<AccountLinkStatus>>(`/rooms/${roomCode}/me/account-link`))
