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

## 환경 변수

현재 `src/api/client.ts` 에 dev API URL이 하드코딩 되어있음
추후 `.env` 파일로 분리 예정

```
VITE_API_BASE_URL=https://dev-api.wadadakk.xyz/api/v1
```

<br>

## 프로젝트 구조

```
src/
├── api/
│   ├── client.ts       # axios 인스턴스 + JWT 인터셉터
│   └── index.ts        # API 호출 함수 모음
├── pages/
│   ├── Landing/        # 랜딩 페이지
│   ├── Login/          # Google OAuth 로그인
│   ├── Auth/
│   │   └── Callback.tsx  # OAuth 콜백 처리
│   ├── Create/         # 임시방 생성
│   │   ├── index.tsx
│   │   └── Done.tsx    # 생성 완료 (링크 공유)
│   ├── My/             # 내 임시방 목록
│   └── Room/           # 응모 페이지
├── types/
│   └── index.ts        # TypeScript 타입 정의
└── App.tsx             # 라우터 설정
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
| `/r/:roomCode` | Room | 응모 페이지 |

<br>

## API 연동 현황
 
| Domain | API | 상태 |
|--------|-----|------|
| Member Auth | `GET /auth/oauth/{provider}/authorize` | O |
| Member Auth | `GET /auth/oauth/{provider}/callback` | O |
| Member Auth | `POST /auth/reissue` | O 인터셉터 적용 |
| Member Auth | `POST /auth/logout` | O |
| Member Auth | `DELETE /auth/withdraw` | X |
| Guest Auth | `POST /rooms/{roomCode}/auth/signup` | X |
| Guest Auth | `POST /rooms/{roomCode}/auth/login` | X |
| Room | `GET /rooms/{roomCode}` | 미구현 |
| Room | `GET /rooms/{roomCode}/rankings` | 미구현 |
| Entry | `POST /rooms/{roomCode}/entries` | 미구현 |
| Entry | `GET /rooms/{roomCode}/entries/me` | 미구현 |
| Entry Ticket | `GET /entry-tickets/{ticketToken}` | 미구현 |
| Entry Ticket | `POST /entry-tickets/{ticketToken}/claim` | 미구현 |
| Member Room | `POST /host/rooms` | O |
| Member Room | `GET /host/rooms` | 미구현 |
| Member Room | `GET /host/rooms/{roomId}` | 미구현 |
| Member Room | `GET /host/rooms/{roomId}/participants` | 미구현 |
| Member Room | `PATCH /host/rooms/{roomId}` | X |
| Member Room | `DELETE /host/rooms/{roomId}` | X |
| Room Profile | `PATCH /rooms/{roomCode}/me` | 미구현 |
| Room Account Link | `GET /rooms/{roomCode}/me/oauth/{provider}/link/authorize` | 추가 예정 |
| Room Account Link | `GET /rooms/{roomCode}/me/oauth/{provider}/link/callback` | 추가 예정 |
| Room Account Link | `GET /rooms/{roomCode}/me/account-link` | 추가 예정 |
