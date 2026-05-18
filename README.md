<img width="1326" height="792" alt="Dark 버전" src="https://github.com/user-attachments/assets/0ae252a5-7f21-489e-8c8e-af479ef6c882" />

<br>

# 와다닥 Frontend
> 선착순 이벤트 룸 플랫폼

<br>

## 기술 스택

- **React 19** + **TypeScript**
- **Vite**
- **Tailwind CSS**
- **React Router DOM**
- **Axios**

<br>

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

<br>


## 보안 주의사항
 
현재 개발 단계에서 아래 항목들이 보안상 취약하므로 프로덕션 배포 전 반드시 수정 필요:
 
- **API URL 하드코딩**: `src/api/client.ts` 에 dev API URL이 직접 입력되어 있음 → `.env` 파일로 분리 필요
- **토큰 localStorage 저장**: `accessToken`, `hostToken_{roomId}` 등을 localStorage에 저장 중 → httpOnly 쿠키 방식으로 전환 권장
- **roomId localStorage 저장**: `myRoomIds` 배열을 localStorage로 관리 중 → `GET /host/rooms` API 정상화 후 제거 필요
- **host 판단 클라이언트 의존**: localStorage의 `myRoomIds` 로 host 여부를 판단 중 → API 응답에 `isHost` 필드 추가 필요
```
# .env 설정 예시
VITE_API_BASE_URL=https://dev-api.wadadakk.xyz/api/v1
```

<br>

## 프로젝트 구조

```
src/
├── api/
│   ├── client.ts         # axios 인스턴스 + JWT 인터셉터 + 401 재발급
│   ├── index.ts          # API 호출 함수 모음
│   └── mock.ts           # mock 데이터 (USE_MOCK 플래그)
├── pages/
│   ├── Landing/          # 랜딩 페이지
│   ├── Login/            # Google OAuth 로그인
│   ├── Auth/
│   │   └── Callback.tsx  # OAuth 콜백 처리
│   ├── Create/           # 임시방 생성
│   │   ├── index.tsx
│   │   └── Done.tsx      # 생성 완료 (링크 공유)
│   ├── My/               # 내 임시방 목록
│   ├── Room/             # 응모 페이지 (host/참여자 분기)
│   ├── RoomSettings/     # 임시방 설정 및 삭제
│   └── NotFound/         # 에러 페이지 (404 / 마감 / 삭제)
├── types/
│   └── index.ts          # TypeScript 타입 정의
└── App.tsx               # 라우터 설정
```

<br>

## 라우팅
 
| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | Landing | 랜딩 페이지 |
| `/login` | Login | Google OAuth 로그인 |
| `/auth/callback` | AuthCallback | OAuth 콜백 처리 |
| `/my` | My | 내 임시방 목록 (로그인 필요) |
| `/create` | Create | 임시방 생성 (로그인 필요) |
| `/create/done` | CreateDone | 생성 완료 및 링크 공유 |
| `/r/:roomCode` | Room | 응모 페이지 (host/참여자 자동 분기) |
| `/host/:roomId/settings` | RoomSettings | 임시방 설정 및 삭제 |
| `*` | NotFound | 존재하지 않는 경로 |

<br>

## API 연동 현황
 
| Domain | API | 상태 |
|--------|-----|------|
| Member Auth | `GET /auth/oauth/{provider}/authorize` | O |
| Member Auth | `GET /auth/oauth/{provider}/callback` | O |
| Member Auth | `POST /auth/reissue` | O 인터셉터 적용 |
| Member Auth | `POST /auth/logout` | O |
| Member Auth | `DELETE /auth/withdraw` | X |
| Guest Auth | `POST /rooms/{roomCode}/auth/signup` | O |
| Guest Auth | `POST /rooms/{roomCode}/auth/login` | X |
| Room | `GET /rooms/{roomCode}` | 미구현 |
| Room | `GET /rooms/{roomCode}/rankings` | 미구현 |
| Entry | `POST /rooms/{roomCode}/entries` | X |
| Entry | `GET /rooms/{roomCode}/entries/me` | X |
| Entry Ticket | `GET /entry-tickets/{ticketToken}` | X |
| Entry Ticket | `POST /entry-tickets/{ticketToken}/claim` | X |
| Member Room | `POST /host/rooms` | O |
| Member Room | `GET /host/rooms` | O |
| Member Room | `GET /host/rooms/{roomId}` | O |
| Member Room | `GET /host/rooms/{roomId}/participants` | 미구현 |
| Member Room | `PATCH /host/rooms/{roomId}` | 문제발생 |
| Member Room | `DELETE /host/rooms/{roomId}` | 문제발생 |
| Room Profile | `PATCH /rooms/{roomCode}/me` | X |
| Room Account Link | `GET /rooms/{roomCode}/me/oauth/{provider}/link/authorize` | X |
| Room Account Link | `GET /rooms/{roomCode}/me/oauth/{provider}/link/callback` | X |
| Room Account Link | `GET /rooms/{roomCode}/me/account-link` | X |

아래는 GET /rooms/{roomCode} 구현되면 한 번에 연동할 듯
| Entry | `POST /rooms/{roomCode}/entries` | X |
| Entry | `GET /rooms/{roomCode}/entries/me` | X |
| Entry Ticket | `GET /entry-tickets/{ticketToken}` | X |
| Entry Ticket | `POST /entry-tickets/{ticketToken}/claim` | X |
