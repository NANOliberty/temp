// ─────────────────────────────────────────────
// 공통 응답 envelope
// 백엔드 모든 응답은 { success, status, data, timestamp } 로 감싸짐.
// 실제 페이로드는 항상 data 안에 있음.
// ─────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  status: number
  data: T
  error?: {
    code: string
    message: string
  } | null
  timestamp: string
}

// ─────────────────────────────────────────────
// 공통 enum류
// ─────────────────────────────────────────────
export type RoomStatus = 'READY' | 'OPEN' | 'CLOSED' | 'DELETED'

// 응모(Entry)는 생성되면 CONFIRMED. Ticket 상태와 구분.
export type EntryStatus = 'CONFIRMED'

// 응모 티켓 상태 머신
export type TicketStatus =
  | 'WAITING'        // 정원 초과 대기열
  | 'PENDING_AUTH'   // 등수 임시 점유, 인증 전 (비로그인)
  | 'CONFIRMED'      // 최종 확정 (Entry 생성됨)
  | 'EXPIRED'        // TTL 만료
  | 'CANCELED'       // 취소

export type MemberType = 'SERVICE_MEMBER' | 'GUEST'

// 응모 처리 모드 (POST /entries 응답 entryMode)
//  DIRECT_CONFIRMED: 정원 내 + 인증 → Entry 즉시 확정
//  그 외(비로그인 임시점유/대기열): 티켓 발급
export type EntryMode = 'DIRECT_CONFIRMED' | (string & {})

export type OAuthProvider = 'google' | 'kakao'

// 인원 무제한일 때 백엔드가 내려주는 sentinel 값 (Integer.MAX_VALUE)
export const UNLIMITED_PARTICIPANTS = 2147483647

// ─────────────────────────────────────────────
// Public / Host Room 정보
// GET /host/rooms/{roomId} 응답 data (인증 불필요, 공개 룸 정보 조회 용도)
// roomId = 내부 식별자(Host용), roomCode = 외부 공유용 식별자(참여자용)
// ─────────────────────────────────────────────
export interface RoomInfo {
  roomId: string
  roomCode: string
  eventName: string
  openAt: string | null
  roomStatus: RoomStatus
  participantCount: number
  participantLimit: number
  rankingExposed: boolean
  isPublic: boolean
  summary?: {
    participantCount: number
  }
}

// GET /host/rooms 목록 아이템
export interface HostRoomListItem {
  roomId: string
  eventName: string
  roomStatus: RoomStatus
  openAt: string | null
  participantLimit: number | null
  appliedCount: number
}

// GET /host/rooms 응답 data (페이지네이션)
export interface HostRoomList {
  rooms: HostRoomListItem[]
  page: number
  size: number
  totalElements: number
}

// POST /host/rooms 생성 요청
export interface CreateRoomRequest {
  eventName: string
  openAt?: string
  participantLimit?: number
  rankingExposed: boolean
  isPublic: boolean
}

// POST /host/rooms 생성 응답 data
// eventId = roomId = roomCode (동일 식별자)
export interface CreateRoomResult {
  eventId: string
  roomStatus: RoomStatus
  createdAt: string
}

// PATCH /host/rooms/{roomId} 수정 요청
export interface UpdateRoomRequest {
  eventName?: string
  openAt?: string
  participantLimit?: number
  rankingExposed?: boolean
  isPublic?: boolean
}

// PATCH /host/rooms/{roomId} 응답 data
export interface UpdateRoomResult {
  roomId: string
  updatedFields: string[]
}

// DELETE /host/rooms/{roomId} 응답 data
export interface DeleteRoomResult {
  roomId: string
  roomStatus: RoomStatus
}

// GET /host/rooms/{roomId}/participants 응답 data
export interface ParticipantItem {
  entryId: number
  rank: number | null
  name: string
  memberType: string
  entryStatus: string
  appliedAt: string | null
}
export interface ParticipantList {
  roomId: string
  participants: ParticipantItem[]
  page: number
  size: number
  totalElements: number
}

// ─────────────────────────────────────────────
// 응모 / 티켓
// ─────────────────────────────────────────────
// POST /rooms/{roomCode}/entries 응답
//  - entryMode=DIRECT_CONFIRMED → Entry 즉시 생성 (entryId/rank/entryStatus)
//  - 그 외(비로그인 임시점유/대기열) → 티켓 발급 (ticketToken/ticketStatus)
//  reservedRank: 전체 응모 순서(재사용 안 함), waitingNumber: 현재 유효 대기열 예비번호
export interface EntryOrTicketResult {
  entryMode: EntryMode
  // 인증 응모 (DIRECT_CONFIRMED)
  entryId?: number | null
  entryStatus?: EntryStatus | null
  rank?: number | null
  appliedAt?: string | null
  // 비로그인 임시점유 / 대기열 티켓
  ticketToken?: string | null
  ticketStatus?: TicketStatus | null
  reservedRank?: number | null
  waitingNumber?: number | null
  expiresAt?: string | null
}

// GET /rooms/{roomCode}/entries/me 응답 (내 응모 상태)
// 조회 시 lazy promotion 실행. WAITING이면 ticket 관련 필드가 함께 옴.
export interface MyEntry {
  hasApplied: boolean
  entryId?: number | null
  roomMemberId?: number | null
  memberType?: MemberType
  entryStatus?: EntryStatus | TicketStatus | null
  myRank?: number | null
  badgeLabel?: string | null
  openAt?: string | null
  currentProfile?: Record<string, unknown> | null
  missingRequiredFields?: string[]
  profileCompleted?: boolean
  socialLinked?: boolean
  // 대기열(WAITING) 상태일 때
  ticketToken?: string | null
  ticketStatus?: TicketStatus | null
  reservedRank?: number | null
  waitingNumber?: number | null
  ticketExpiresAt?: string | null
}

// GET /entry-tickets/{ticketToken} 응답 (티켓 상태 조회)
export interface EntryTicket {
  ticketToken: string
  ticketStatus: TicketStatus
  roomCode?: string
  reservedRank?: number | null
  waitingNumber?: number | null
  expiresAt?: string | null
}

// POST /entry-tickets/{ticketToken}/claim 응답
//  PENDING_AUTH → CONFIRMED 확정, WAITING → 귀속 후 WAITING 유지
export interface ClaimResult {
  entryStatus: EntryStatus | TicketStatus
  entryId?: number | null
  rank?: number | null
  appliedAt?: string | null
  ticketStatus?: TicketStatus | null
  waitingNumber?: number | null
}

// ─────────────────────────────────────────────
// Room Member (방 멤버 프로필 / 인증)
// ─────────────────────────────────────────────
// PATCH /rooms/{roomCode}/me 응답 (방 멤버 프로필 생성 또는 조회)
export interface RoomMemberProfile {
  roomCode: string
  roomMemberId: number
  memberType: MemberType
  socialLinked?: boolean
  currentProfile: Record<string, unknown> | null
  missingRequiredFields?: string[]
  profileCompleted: boolean
}

// 방 전용 회원가입/로그인 요청
//  ticketToken: 비로그인 선응모로 받은 티켓을 가입/로그인과 연결할 때 전달
export interface GuestAuthRequest {
  roomNickname: string
  roomPassword: string
  ticketToken?: string
  isHost?: boolean
}

// POST /rooms/{roomCode}/auth/signup | login 응답
export interface GuestAuthResult {
  roomMemberId: number
  principalType: string
  roomCode: string
  accessToken: string
  accessTokenExpiresAt: string
}

// ─────────────────────────────────────────────
// 소셜 계정 연동
// ─────────────────────────────────────────────
// GET /rooms/{roomCode}/me/oauth/{provider}/link/authorize (redirect=false 시)
export interface LinkAuthorizeResult {
  authorizeUrl?: string
}

// GET /rooms/{roomCode}/me/account-link
export interface AccountLinkStatus {
  linked: boolean
  roomCode?: string
  roomMemberId?: number
  memberId?: number | null
  memberType?: string
  provider?: string
  linkedAt?: string | null
}

// GET /auth/oauth/{provider}/link/callback 결과
export interface LinkCallbackResult {
  linked: boolean
  memberId?: string
  roomMemberId?: string | number
  accessToken?: string
  socialLinked?: boolean
}

// ─────────────────────────────────────────────
// 일반 인증
// ─────────────────────────────────────────────
// GET /auth/oauth/{provider}/authorize-url
export interface AuthorizeUrlResult {
  authorizationUrl: string
}

// ─────────────────────────────────────────────
// 랭킹 (현재 스웨거 미구현 — UI/목업용 타입만 유지)
// ─────────────────────────────────────────────
export interface RankingItem {
  rank: number
  name: string
  confirmedAt: string
}

export interface RankingResponse {
  content: RankingItem[]
  totalElements: number
  totalPages: number
  number: number
}

// ─────────────────────────────────────────────
// 레거시 UI 타입 (Room 페이지/목업이 사용 중 — 점진적으로 RoomInfo 로 이관 예정)
// ─────────────────────────────────────────────
export interface Room {
  roomCode: string
  title: string
  isRankingPublic: boolean
  openAt: string | null
  maxEntries: number | null
  status: RoomStatus
  entryCount: number
}

export interface Entry {
  rank: number | null
  confirmedAt: string | null
  status: 'CONFIRMED' | 'PENDING'
  ticketToken?: string
  waitingNumber?: number | null
  requiredFields?: string[]
}
