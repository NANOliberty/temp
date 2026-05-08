import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './landing.css'

// ── 로고 마크 ──
function LogoMark({ small = false }: { small?: boolean }) {
  const s = small ? { ring: { width: 20, height: 20, borderWidth: 3 }, d: { width: 17, height: 20 }, hand: { width: 2.5, height: 7 } } : {}
  return (
    <div className="lm">
      <div className="lm-ring" style={s.ring}>
        <div className="lm-hand" style={s.hand} />
      </div>
      <div className="lm-d" style={s.d}><b /></div>
      <div className="lm-d o" style={s.d}><b /></div>
      <div className="lm-ll">
        <span /><span /><span />
      </div>
    </div>
  )
}

// ── 카운트다운 훅 ──
function useCountdown(initialSeconds: number) {
  const [t, setT] = useState(initialSeconds)
  useEffect(() => {
    const id = setInterval(() => setT((prev) => (prev > 0 ? prev - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [])
  const hh = String(Math.floor(t / 3600)).padStart(2, '0')
  const mm = String(Math.floor((t % 3600) / 60)).padStart(2, '0')
  const ss = String(t % 60).padStart(2, '0')
  return { hh, mm, ss }
}

// ── 스크롤 reveal 훅 ──
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target) } }),
      { threshold: 0.08 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

export default function Landing() {
  const navigate = useNavigate()
  const { hh, mm, ss } = useCountdown(5 * 60 - 1)
  const [isLoggedIn] = useState(!!localStorage.getItem('accessToken'))
  const handleCreate = () => navigate(isLoggedIn ? '/create' : '/login')
  useReveal()

  return (
    <div style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>

      {/* NAV */}
      <nav className="landing-nav">
        <LogoMark />
        <div className="nav-r">
          <button className="nav-link" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>사용법</button>
          <button className="nav-link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>기능</button>
          {isLoggedIn ? (
            <>
              <button className="nav-link" onClick={() => { localStorage.removeItem('accessToken'); window.location.reload() }}>로그아웃</button>
              <button className="nav-link" onClick={() => navigate('/my')}>MY 방</button>
              <button className="nav-btn" onClick={() => navigate('/create')}>임시방 만들기</button>
            </>
          ) : (
            <>
              <button className="nav-link" onClick={() => navigate('/login')}>로그인</button>
              <button className="nav-btn" onClick={() => navigate('/login')}>임시방 만들기</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-left">
          <div className="hero-badge">선착순 이벤트 룸 플랫폼</div>
          <h1 className="hero-title">버튼 하나,<br /><em>선착순</em> 완료.</h1>
          <p className="hero-sub">방 만들고 링크 공유하면 끝.<br />비회원도 즉시 응모 — 나중에 계정 연동도 OK.</p>
          <div className="hero-btns">
            <button className="btn-main" onClick={handleCreate}>임시방 만들기 →</button>
            <button className="btn-out" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>기능 보기</button>
          </div>
        </div>
        <div className="hero-right">
          <div className="mock">
            <div className="mock-head">
              <div>
                <div className="mock-ttl">여름 한정 굿즈 선착순 100명</div>
                <div className="mock-url">wadak.io/r/summer24</div>
              </div>
              <div className="mock-badge">진행 중</div>
            </div>
            <div className="mock-timer">
              <span className="mock-timer-lbl">선착순 시작까지</span>
              <span className="mock-timer-val">
                {hh}<span className="sp">:</span>{mm}<span className="sp">:</span>{ss}
              </span>
            </div>
            <div className="mock-list">
              {[
                { n: '1', av: '🦊', nm: '와다닥', ts: '09:00:00.312', first: true },
                { n: '2', av: '🐷', nm: 'user_287', ts: '09:00:00.489', first: false },
                { n: '3', av: '🐱', nm: '제발 3등만', ts: '09:00:00.601', first: false },
              ].map((r) => (
                <div className="mock-item" key={r.n}>
                  <span className={`mock-n${r.first ? ' f' : ''}`}>{r.n}</span>
                  <span className="mock-av">{r.av}</span>
                  <span className="mock-nm">{r.nm}</span>
                  <span className="mock-ts">{r.ts}</span>
                </div>
              ))}
            </div>
            <button className="mock-cta">⚡ 지금 응모하기</button>
          </div>
        </div>
      </div>

      <hr className="landing-hr" />

      {/* HOW IT WORKS */}
      <div className="sec" id="how">
        <div className="reveal">
          <div className="eye">// How it works</div>
          <h2 className="h2">3단계가 전부</h2>
          <p className="desc">만들고, 공유하고, 응모 받기.</p>
        </div>
        <div className="step-list">
          <div className="step-item reveal">
            <div className="step-txt">
              <div className="step-n">Step 01 — 생성</div>
              <h3>30초면 방이 만들어집니다</h3>
              <p>이벤트명, 시작 시간, 인원 제한만 입력하면 끝.</p>
            </div>
            <div className="step-vis">
              <div className="vis">
                <div className="ff"><label>TITLE</label><div className="v">여름 한정 굿즈 선착순</div></div>
                <div className="ff-row">
                  <div className="ff"><label>START</label><div className="v">09:00</div></div>
                  <div className="ff"><label>LIMIT</label><div className="v">100명</div></div>
                </div>
                <div className="ff"><label>RANKING</label><div className="v">공개</div></div>
                <div className="tags">
                  <span className="tag">선착순</span>
                  <span className="tag">임시방</span>
                  <span className="tag">링크 공유</span>
                </div>
              </div>
            </div>
          </div>

          <div className="step-item flip reveal">
            <div className="step-txt">
              <div className="step-n">Step 02 — 공유</div>
              <h3>링크 하나로 어디든</h3>
              <p>카카오톡, 인스타그램, 슬랙 — 붙여넣기 하면 끝.</p>
            </div>
            <div className="step-vis">
              <div className="vis">
                <div className="share-box">
                  <span className="share-link">wadak.io/r/summer24</span>
                  <button className="share-copy">복사</button>
                </div>
                <div className="chips">
                  <span className="chip">카카오톡</span>
                  <span className="chip">인스타그램</span>
                  <span className="chip">슬랙</span>
                  <span className="chip">링크 복사</span>
                </div>
              </div>
            </div>
          </div>

          <div className="step-item reveal">
            <div className="step-txt">
              <div className="step-n">Step 03 — 응모</div>
              <h3>누르는 순간, 순번 확정</h3>
              <p>비회원도 OK. 나중에 로그인하면 등수 그대로.</p>
            </div>
            <div className="step-vis">
              <div className="vis">
                <div className="apply-wrap">
                  <button className="big-btn">⚡ 지금 응모하기</button>
                  <div className="apply-ts">클릭한 순간 <strong>09:00:00.312</strong> 기록</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="landing-hr" />

      {/* FEATURES */}
      <div id="features">
        {/* F1 즉시 확정 */}
        <div className="fblock alt">
          <div className="fblock-inner sec">
            <div className="fblock-text reveal">
              <div className="eye">즉시 확정</div>
              <h2 className="h2">누르는 순간,<br />순번이 기록됩니다</h2>
              <p className="fdesc">응모 버튼을 클릭하는 바로 그 순간 서버에 티켓이 생성됩니다. 로그인 여부와 무관하게 선착순이 즉시 확정됩니다.</p>
              <div className="fpills">
                <span className="fpill">밀리초 단위 기록</span>
                <span className="fpill">서버 사이드 확정</span>
                <span className="fpill">동시 처리 안전</span>
              </div>
            </div>
            <div className="fblock-vis reveal">
              <div className="fvis-card">
                <div className="fvc-header">
                  <span className="fvc-dot red" /><span className="fvc-dot yellow" /><span className="fvc-dot green" />
                  <span className="fvc-title">응모 완료</span>
                </div>
                <div className="fvc-body">
                  <div className="ticket-confirmed">
                    <div className="tc-badge">✓ 응모 완료</div>
                    <div className="tc-rank">
                      <strong>1</strong><span>등</span>
                    </div>
                    <div className="tc-rows">
                      <div className="tc-row"><span>이벤트</span><span>여름 한정 굿즈 선착순</span></div>
                      <div className="tc-row"><span>기록 시각</span><span className="tc-mono orange">09:00:00.312</span></div>
                      <div className="tc-row"><span>상태</span><span className="tc-green">CONFIRMED</span></div>
                      <div className="tc-row"><span>총 인원</span><span>100명 중 1번째</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* F2 비회원 응모 */}
        <div className="fblock">
          <div className="fblock-inner sec">
            <div className="fblock-vis reveal">
              <div className="fvis-card">
                <div className="fvc-header">
                  <span className="fvc-dot red" /><span className="fvc-dot yellow" /><span className="fvc-dot green" />
                  <span className="fvc-title">게스트 응모 흐름</span>
                </div>
                <div className="fvc-body">
                  <div className="guest-flow">
                    {[
                      { title: '응모 버튼 클릭', desc: '닉네임 입력 후 즉시 완료' },
                      { title: '순번 확정', desc: '클릭한 시각 그대로 기록' },
                      { title: '나중에 로그인', desc: '언제든 계정으로 이어받기 가능' },
                      { title: '내 등수 확인', desc: '순번이 그대로 유지됩니다' },
                    ].map((s, i, arr) => {
                      const colors = ['#ffc5b3', '#ff997a', '#fd7b54', '#f55a2b']
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'stretch', gap: 16 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: colors[i],
                              boxShadow: `0 4px 12px ${colors[i]}55`,
                              flexShrink: 0,
                            }} />
                            {i < arr.length - 1 && (
                              <div style={{ width: 1.5, flex: 1, minHeight: 20, background: `linear-gradient(to bottom, ${colors[i]}, ${colors[i+1]})`, margin: '4px 0' }} />
                            )}
                          </div>
                          <div style={{ paddingBottom: i < arr.length - 1 ? 20 : 0, paddingTop: 2 }}>
                            <strong style={{ fontSize: 14, fontWeight: 700, color: '#0d0d17', display: 'block', marginBottom: 3 }}>{s.title}</strong>
                            <span style={{ fontSize: 12, color: '#9898b2' }}>{s.desc}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="fblock-text reveal">
              <div className="eye">비회원 응모</div>
              <h2 className="h2">회원 가입 없이도<br />먼저 응모하세요</h2>
              <p className="fdesc">닉네임 하나면 선착순 완료. 나중에 로그인하면 내 등수가 그대로 이어집니다.</p>
              <div className="fpills">
                <span className="fpill">닉네임만으로 응모</span>
                <span className="fpill">순번 즉시 확정</span>
                <span className="fpill">로그인 후 등수 이어받기</span>
              </div>
            </div>
          </div>
        </div>

        {/* F3 나머지 */}
        <div className="fblock alt fblock-split">
          <div className="fblock-inner sec">
            <div className="fblock-text reveal" style={{ gridColumn: '1/-1', marginBottom: 48 }}>
              <div className="eye">그 외 기능</div>
              <h2 className="h2">나머지도 알아서</h2>
            </div>
            <div className="fsplit-grid">
              <div className="fsplit-card reveal">
                <div className="fsplit-vis">
                  <div className="ranking-preview">
                    <div className="rp-header">
                      <span className="rp-title">실시간 랭킹</span>
                      <span className="rp-live">● LIVE</span>
                    </div>
                    <div className="rp-rows">
                      {[
                        { n: '1', av: '🦊', nm: '와다닥', t: '00.312', first: true },
                        { n: '2', av: '🐷', nm: 'user_287', t: '00.489', first: false },
                        { n: '3', av: '🐱', nm: '제발 3등만', t: '00.601', first: false },
                        { n: '4', av: '🐻', nm: '굿즈좋아', t: '00.720', first: false },
                      ].map((r) => (
                        <div className={`rp-row${r.first ? ' first' : ''}`} key={r.n}>
                          <span className="rp-n">{r.n}</span>
                          <span className="rp-av">{r.av}</span>
                          <span className="rp-nm">{r.nm}</span>
                          <span className="rp-t">{r.t}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rp-toggle"><span>공개</span><div className="toggle on" /></div>
                  </div>
                </div>
                <div className="fsplit-text">
                  <h3>실시간 랭킹</h3>
                  <p>Host가 공개 설정 시 참여자들이 실시간으로 등수를 확인할 수 있습니다. 비공개도 가능.</p>
                </div>
              </div>

              <div className="fsplit-card reveal">
                <div className="fsplit-vis">
                  <div className="cleanup-preview">
                    {[
                      { title: '이벤트 종료', desc: '선착순이 마감됩니다' },
                      { title: '방 비공개 전환', desc: '더 이상 접근되지 않아요' },
                      { title: '자동 삭제', desc: '일정 기간 후 완전히 사라집니다' },
                    ].map((s, i, arr) => {
                      const colors = ['#f55a2b', '#c73d08', '#a83206']
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'stretch', gap: 16 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                            <div style={{
                              width: 24, height: 24, borderRadius: '50%',
                              background: colors[i],
                              boxShadow: `0 4px 10px ${colors[i]}55`,
                              flexShrink: 0,
                            }} />
                            {i < arr.length - 1 && (
                              <div style={{ width: 1.5, flex: 1, minHeight: 16, background: `linear-gradient(to bottom, ${colors[i]}, ${colors[i+1]})`, margin: '4px 0' }} />
                            )}
                          </div>
                          <div style={{ paddingBottom: i < arr.length - 1 ? 18 : 0, paddingTop: 1 }}>
                            <strong style={{ fontSize: 13, fontWeight: 700, color: '#0d0d17', display: 'block', marginBottom: 2 }}>{s.title}</strong>
                            <span style={{ fontSize: 12, color: '#9898b2' }}>{s.desc}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="fsplit-text">
                  <h3>방 자동 정리</h3>
                  <p>이벤트가 끝나면 알아서 정리됩니다. 따로 삭제할 필요 없어요.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-band reveal">
        <div>
          <h2>지금 바로 <em>와다닥</em></h2>
          <p>임시방 만드는 데 30초면 충분합니다.</p>
        </div>
        <button className="btn-w" onClick={handleCreate}>임시방 만들기 →</button>
      </div>

      {/* FOOTER */}
      <footer className="landing-footer">
        <LogoMark small />
        <small>선착순 이벤트 룸 플랫폼 · 와다닥</small>
      </footer>
    </div>
  )
}