 import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Scroll reveal hook ───
function useReveal(threshold = 0.12) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.unobserve(el) } },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, vis]
}

// ─── Smooth scroll helper ───
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ─── App link helpers ───
const APP = '../frontend/#'
const appLink = (path) => `${APP}${path}`

// ─── Stagger class helper ───
const stagger = (visible, i, base = '') =>
  `${base} transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [heroRef, heroVis] = useReveal(0.05)
  const [stackRef, stackVis] = useReveal()
  const [bentoRef, bentoVis] = useReveal()
  const [aiRef, aiVis] = useReveal()
  const [roomRef, roomVis] = useReveal()
  const [howRef, howVis] = useReveal()
  const [schedRef, schedVis] = useReveal()
  const [caseRef, caseVis] = useReveal()
  const [compRef, compVis] = useReveal()
  const [ctaRef, ctaVis] = useReveal()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const nav = [
    ['Features', 'features'],
    ['AI Engine', 'ai'],
    ['Experience', 'room'],
    ['Use Cases', 'cases'],
    ['Compare', 'compare'],
  ]

  return (
    <div className="landing-root">
      {/* ════════════════════════════════════════════
          NAVBAR
          ════════════════════════════════════════════ */}
      <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <div className="nav__inner">
          <a href="#" className="nav__brand">
            <span className="nav__logo-icon"><i className="ri-book-open-line" /></span>
            <span className="nav__logo-text">StudyHub</span>
          </a>

          <div className="nav__links">
            {nav.map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="nav__link">{label}</button>
            ))}
          </div>

          <div className="nav__actions">
            <a href={appLink('/login')} className="nav__login">Log in</a>
            <a href={appLink('/signup')} className="nav__cta">Get Started</a>
          </div>

          <button className="nav__burger" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
            <i className={mobileMenu ? 'ri-close-line' : 'ri-menu-3-line'} />
          </button>
        </div>

        {mobileMenu && (
          <div className="nav__mobile">
            {nav.map(([label, id]) => (
              <button key={id} onClick={() => { scrollTo(id); setMobileMenu(false) }} className="nav__mobile-link">{label}</button>
            ))}
            <div className="nav__mobile-actions">
              <a href={appLink('/login')} className="nav__mobile-login">Log in</a>
              <a href={appLink('/signup')} className="nav__mobile-cta">Get Started Free</a>
            </div>
          </div>
        )}
      </nav>

      {/* ════════════════════════════════════════════
          HERO
          ════════════════════════════════════════════ */}
      <section ref={heroRef} className="hero">
        <div className="hero__bg">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__orb hero__orb--3" />
          <div className="hero__noise" />
        </div>

        <div className="hero__inner">
          <div className={`hero__content ${heroVis ? 'hero__content--visible' : ''}`}>
            <div className="hero__badge">
              <span className="hero__badge-pulse" />
              <span>Open Beta — Free Forever</span>
            </div>

            <h1 className="hero__title">
              One workspace.<br />
              Every tool a student<br />
              <span className="hero__title-gradient">actually needs.</span>
            </h1>

            <p className="hero__subtitle">
              StudyHub unifies live video rooms, AI-powered quizzes and summaries, real-time
              collaboration, academic scheduling, and a gamification engine into one seamless
              platform — so you never have to juggle Zoom, Quizlet, Notion, and WhatsApp again.
            </p>

            <div className="hero__buttons">
              <a href={appLink('/signup')} className="btn btn--primary btn--lg">
                Start Studying Free
                <i className="ri-arrow-right-line" />
              </a>
              <button onClick={() => scrollTo('room')} className="btn btn--outline btn--lg">
                <i className="ri-play-circle-line" />
                See It in Action
              </button>
            </div>

            <div className="hero__proof">
              <div className="hero__avatars">
                {['#6366f1','#8b5cf6','#10b981','#f59e0b','#ec4899'].map((c, i) => (
                  <div key={i} className="hero__avatar" style={{ background: c }}>{['S','A','P','R','M'][i]}</div>
                ))}
              </div>
              <p className="hero__proof-text">Join students already studying smarter</p>
            </div>
          </div>

          {/* Hero Mockup */}
          <div className={`hero__mockup ${heroVis ? 'hero__mockup--visible' : ''}`}>
            <div className="mockup">
              <div className="mockup__chrome">
                <div className="mockup__dots">
                  <span className="mockup__dot mockup__dot--r" /><span className="mockup__dot mockup__dot--y" /><span className="mockup__dot mockup__dot--g" />
                </div>
                <div className="mockup__url">studyhub.app/room/physics-101</div>
              </div>

              <div className="mockup__body">
                <div className="mockup__sidebar">
                  {['ri-vidicon-line','ri-message-3-line','ri-file-text-line','ri-questionnaire-line','ri-todo-line','ri-robot-line','ri-folder-line'].map((ic, i) => (
                    <div key={i} className={`mockup__sidebar-icon ${i === 0 ? 'mockup__sidebar-icon--active' : ''}`}>
                      <i className={ic} />
                    </div>
                  ))}
                </div>

                <div className="mockup__main">
                  <div className="mockup__video-grid">
                    {['You','Priya','Alex','Sam','Maya','Jordan'].map((name, i) => (
                      <div key={i} className={`mockup__video-tile ${i === 0 ? 'mockup__video-tile--you' : ''}`}>
                        <div className="mockup__video-avatar">{name[0]}</div>
                        <span className="mockup__video-name">{name}</span>
                        {i === 0 && <span className="mockup__video-mic"><i className="ri-mic-line" /></span>}
                      </div>
                    ))}
                  </div>

                  <div className="mockup__chat">
                    <div className="mockup__msg">
                      <span className="mockup__msg-author">Alex</span>
                      <span className="mockup__msg-text">Can someone explain the second law of thermodynamics?</span>
                    </div>
                    <div className="mockup__msg mockup__msg--ai">
                      <span className="mockup__msg-author"><i className="ri-robot-2-line" /> AI</span>
                      <span className="mockup__msg-text">The second law states that entropy of an isolated system always increases over time…</span>
                    </div>
                    <div className="mockup__msg mockup__msg--you">
                      <span className="mockup__msg-author">You</span>
                      <span className="mockup__msg-text">Let&apos;s quiz on this chapter — everyone ready? 🎯</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div className="hero__float hero__float--top">
              <span className="hero__float-icon hero__float-icon--green"><i className="ri-check-double-line" /></span>
              <span>Quiz: 9/10 — Top Scorer</span>
            </div>
            <div className="hero__float hero__float--bottom">
              <span className="hero__float-icon hero__float-icon--amber"><i className="ri-fire-line" /></span>
              <span>23-day study streak 🔥</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          REPLACES STACK
          ════════════════════════════════════════════ */}
      <section ref={stackRef} className={`stack ${stackVis ? 'stack--visible' : ''}`}>
        <p className="stack__label">Replaces your entire study stack</p>
        <div className="stack__items">
          {[
            ['ri-video-chat-line','Zoom'],
            ['ri-sticky-note-line','Notion'],
            ['ri-flashlight-line','Quizlet'],
            ['ri-google-line','Google Classroom'],
            ['ri-chat-1-line','WhatsApp Groups'],
            ['ri-calendar-line','Calendar Apps'],
          ].map(([ic, name]) => (
            <div key={name} className="stack__item">
              <i className={ic} /><span>{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          BENTO FEATURES
          ════════════════════════════════════════════ */}
      <section id="features" ref={bentoRef} className="bento">
        <div className="section-wrap">
          <div className={`section-head ${bentoVis ? 'section-head--visible' : ''}`}>
            <span className="section-tag">Platform</span>
            <h2 className="section-title">Built different. By design.</h2>
            <p className="section-subtitle">Not a stitched-together Frankenstein of plugins. A ground-up study workspace where every feature is aware of every other.</p>
          </div>

          <div className="bento__grid">
            {[
              { icon: 'ri-vidicon-line', color: 'indigo', title: 'Live Video Study Rooms', desc: 'SFU-powered multi-participant rooms with host controls, a waiting-room gate, screen sharing, and one-click invite links. Not another Zoom — this is engineered around studying.', size: 'lg' },
              { icon: 'ri-robot-2-line', color: 'violet', title: 'AI Academic Engine', desc: 'Generate quizzes from PDFs, create flashcards by topic, summarize 50-page chapters, or type @AI in any room chat for instant, context-aware explanations.', size: 'lg' },
              { icon: 'ri-trophy-line', color: 'amber', title: 'Gamification Layer', desc: 'Points for every meaningful action. Achievement badges. Study streaks. Room leaderboards. An 84-day contribution heatmap. Consistency becomes addictive.', size: 'md' },
              { icon: 'ri-wireless-charging-line', color: 'emerald', title: 'Real-Time Sync', desc: 'Chat, tasks, notes, resources — all propagated via WebSocket in milliseconds across every participant. Zero refresh. Zero lag.', size: 'md' },
              { icon: 'ri-calendar-schedule-line', color: 'rose', title: 'Academic Planner', desc: 'Exams with live countdowns, syllabus progress tracking color-coded by completion, calendar view, priority-based reminders with overdue warnings.', size: 'md' },
              { icon: 'ri-broadcast-line', color: 'blue', title: 'Live Quiz Broadcast', desc: 'Generate a quiz and push it to every participant simultaneously. Real-time submission tracking, instant scoring, speed-based leaderboards.', size: 'md' },
            ].map((f, i) => (
              <div
                key={i}
                className={`bento__card bento__card--${f.size} bento__card--${f.color} ${bentoVis ? 'bento__card--visible' : ''}`}
                style={{ transitionDelay: `${i * 80 + 100}ms` }}
              >
                <div className={`bento__icon bento__icon--${f.color}`}>
                  <i className={f.icon} />
                </div>
                <h3 className="bento__card-title">{f.title}</h3>
                <p className="bento__card-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          AI ENGINE — Dark Section
          ════════════════════════════════════════════ */}
      <section id="ai" ref={aiRef} className="ai-section">
        <div className="section-wrap">
          <div className={`section-head ${aiVis ? 'section-head--visible' : ''}`}>
            <span className="section-tag section-tag--dark">AI Engine</span>
            <h2 className="section-title section-title--white">Your personal academic intelligence.</h2>
            <p className="section-subtitle section-subtitle--white">Purpose-built AI tools powered by Google Gemini 2.0 Flash — not generic chatbots, but specialized instruments designed to compress how you learn.</p>
          </div>

          <div className="ai__grid">
            {[
              { icon: 'ri-questionnaire-line', title: 'Quiz Generator', desc: 'Drop in a topic or upload a PDF. Choose difficulty and question count. Get instant MCQs with detailed explanations — then broadcast them live to your entire room for a real-time group assessment.' },
              { icon: 'ri-file-pdf-2-line', title: 'PDF Summarizer', desc: 'Upload any textbook chapter or research paper. The AI extracts structured summaries — key concepts, important definitions, glossary terms, and organized study-ready notes in seconds.' },
              { icon: 'ri-stack-line', title: 'Flashcard Engine', desc: 'Generate categorized, interactive flip cards on any topic. Each card has a front (question/term) and back (answer/definition). Visual, tappable, and optimized for spaced repetition before exams.' },
              { icon: 'ri-chat-smile-2-line', title: 'Study Assistant', desc: 'A multi-turn conversational AI that doesn\'t just answer questions — it explains concepts, walks through problem-solving steps, analogizes complex topics, and adapts its depth to your level.' },
              { icon: 'ri-edit-2-line', title: 'Notes Enhancer', desc: 'Paste messy lecture notes or rough drafts. Choose a mode — summarize, expand, restructure, or reformat. Get clean, organized, study-ready material that you can export or share with your room.' },
              { icon: 'ri-at-line', title: '@AI in Room Chat', desc: 'Mention @AI during any live room conversation. It reads the last 10 messages for context and responds like a knowledgeable tutor sitting right in the room — instant, contextual, and collaborative.' },
            ].map((tool, i) => (
              <div
                key={i}
                className={`ai__card ${aiVis ? 'ai__card--visible' : ''}`}
                style={{ transitionDelay: `${i * 70 + 100}ms` }}
              >
                <div className="ai__card-icon"><i className={tool.icon} /></div>
                <h3 className="ai__card-title">{tool.title}</h3>
                <p className="ai__card-desc">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          ROOM EXPERIENCE — Full-Width Showcase
          ════════════════════════════════════════════ */}
      <section id="room" ref={roomRef} className="room-section">
        <div className="section-wrap">
          <div className={`section-head ${roomVis ? 'section-head--visible' : ''}`}>
            <span className="section-tag">Experience</span>
            <h2 className="section-title">Everything happens in one room.</h2>
            <p className="section-subtitle">Video, chat, notes, tasks, quizzes, resources, and AI — all live inside a single study room. No tab switching. No context loss. Everyone stays in sync.</p>
          </div>

          <div className={`room__showcase ${roomVis ? 'room__showcase--visible' : ''}`}>
            <div className="room__features-ring">
              {[
                { icon: 'ri-vidicon-line', label: 'Video', color: '#6366f1' },
                { icon: 'ri-message-3-line', label: 'Chat', color: '#8b5cf6' },
                { icon: 'ri-file-text-line', label: 'Notes', color: '#10b981' },
                { icon: 'ri-todo-line', label: 'Tasks', color: '#f59e0b' },
                { icon: 'ri-questionnaire-line', label: 'Quizzes', color: '#ef4444' },
                { icon: 'ri-folder-line', label: 'Resources', color: '#3b82f6' },
                { icon: 'ri-robot-2-line', label: 'AI', color: '#ec4899' },
                { icon: 'ri-settings-3-line', label: 'Settings', color: '#64748b' },
              ].map((f, i) => (
                <div key={i} className="room__feature-pill" style={{ '--pill-color': f.color }}>
                  <i className={f.icon} /><span>{f.label}</span>
                </div>
              ))}
            </div>

            <div className="room__detail-grid">
              {[
                { icon: 'ri-user-voice-line', title: 'Host Controls', desc: 'Mute participants, approve waiting room entries, end the session. The host has full control.' },
                { icon: 'ri-share-line', title: 'One-Click Invite', desc: 'Generate a shareable room link. Anyone with the link can join — waiting room keeps it secure.' },
                { icon: 'ri-broadcast-line', title: 'Live Quiz Push', desc: 'Generate a quiz and broadcast it to everyone in real-time. See submissions stream in live.' },
                { icon: 'ri-award-line', title: 'Room Leaderboard', desc: 'Points earned inside each room. See who\'s contributing the most — quiz scores, chats, tasks completed.' },
              ].map((d, i) => (
                <div key={i} className={`room__detail ${roomVis ? 'room__detail--visible' : ''}`} style={{ transitionDelay: `${i * 100 + 300}ms` }}>
                  <div className="room__detail-icon"><i className={d.icon} /></div>
                  <h4 className="room__detail-title">{d.title}</h4>
                  <p className="room__detail-desc">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          HOW IT WORKS
          ════════════════════════════════════════════ */}
      <section id="how" ref={howRef} className="how-section">
        <div className="section-wrap section-wrap--narrow">
          <div className={`section-head ${howVis ? 'section-head--visible' : ''}`}>
            <span className="section-tag">Getting Started</span>
            <h2 className="section-title">Three steps. Zero friction.</h2>
          </div>

          <div className="how__steps">
            {[
              { n: '01', icon: 'ri-user-add-line', title: 'Create your account', desc: 'Name, email, password. No credit card required. No forced onboarding. No trial that expires. You\'re in — permanently.' },
              { n: '02', icon: 'ri-door-open-line', title: 'Start or join a room', desc: 'Create a room with a subject, description, and privacy settings. Invite participants by sharing the link or let them discover your room.' },
              { n: '03', icon: 'ri-rocket-2-line', title: 'Study with superpowers', desc: 'Video, chat, shared tasks, AI-generated quizzes, collaborative notes — all live inside one room. Earn points. Build streaks. Climb leaderboards.' },
            ].map((s, i) => (
              <div key={i} className={`how__step ${howVis ? 'how__step--visible' : ''}`} style={{ transitionDelay: `${i * 150 + 100}ms` }}>
                <div className="how__step-number">{s.n}</div>
                <div className="how__step-icon"><i className={s.icon} /></div>
                <h3 className="how__step-title">{s.title}</h3>
                <p className="how__step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SCHEDULE SHOWCASE
          ════════════════════════════════════════════ */}
      <section ref={schedRef} className="sched-section">
        <div className="section-wrap">
          <div className="sched__layout">
            <div className={`sched__content ${schedVis ? 'sched__content--visible' : ''}`}>
              <span className="section-tag section-tag--rose">Scheduling</span>
              <h2 className="section-title section-title--left">Your exam is in 12&nbsp;days.<br />Do you know where you stand?</h2>
              <p className="section-subtitle section-subtitle--left">Most students don't fail because they lack intelligence — they fail because they lack visibility. StudyHub's academic planner gives you uncomfortable clarity about exactly where you are.</p>

              <div className="sched__features">
                {[
                  { icon: 'ri-timer-line', c: 'rose', title: 'Live Exam Countdown', desc: 'Days, hours, minutes, seconds — ticking down constantly. Urgency isn\'t a bug, it\'s a feature that keeps you honest.' },
                  { icon: 'ri-bar-chart-box-line', c: 'emerald', title: 'Syllabus Progress Tracking', desc: 'Track completion percentage per exam. Color-coded: red below 50%, amber at 50–75%, green above 75%. No hiding from reality.' },
                  { icon: 'ri-calendar-2-line', c: 'indigo', title: 'Unified Calendar View', desc: 'Study sessions, exams, events, reminders — all rendered on one calendar with color-coded dots. Your entire academic life, at a glance.' },
                  { icon: 'ri-alarm-warning-line', c: 'amber', title: 'Smart Reminders', desc: 'Priority-based with visual urgency. Shows "3 days overdue" in red or "Due tomorrow" in amber. Nothing slips through the cracks.' },
                ].map((f, i) => (
                  <div key={i} className="sched__feature">
                    <div className={`sched__feature-icon sched__feature-icon--${f.c}`}><i className={f.icon} /></div>
                    <div>
                      <h4 className="sched__feature-title">{f.title}</h4>
                      <p className="sched__feature-desc">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`sched__mockup ${schedVis ? 'sched__mockup--visible' : ''}`}>
              {/* Exam countdown card */}
              <div className="sched__card">
                <div className="sched__card-head">
                  <h4>Mathematics — Final Exam</h4>
                  <span className="sched__card-badge">UPCOMING</span>
                </div>
                <div className="sched__countdown">
                  {[['12','Days'],['08','Hrs'],['34','Min'],['--','Sec']].map(([n,l]) => (
                    <div key={l} className="sched__countdown-item">
                      <span className="sched__countdown-num">{n}</span>
                      <span className="sched__countdown-label">{l}</span>
                    </div>
                  ))}
                </div>
                <div className="sched__progress">
                  <div className="sched__progress-head">
                    <span>Syllabus Progress</span>
                    <span className="sched__progress-pct">72%</span>
                  </div>
                  <div className="sched__progress-bar">
                    <div className="sched__progress-fill" style={{ width: schedVis ? '72%' : '0%' }} />
                  </div>
                </div>
              </div>

              {/* Mini Calendar */}
              <div className="sched__calendar">
                <div className="sched__calendar-title">March 2026</div>
                <div className="sched__calendar-grid">
                  {['M','T','W','T','F','S','S'].map((d,i) => <span key={i} className="sched__cal-head">{d}</span>)}
                  {['','','','','','','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'].map((d,i) => {
                    let cls = 'sched__cal-day'
                    if (d === '11') cls += ' sched__cal-day--today'
                    else if (d === '23') cls += ' sched__cal-day--exam'
                    else if (d === '15' || d === '19') cls += ' sched__cal-day--session'
                    else if (d === '21') cls += ' sched__cal-day--event'
                    return <span key={i} className={cls}>{d}</span>
                  })}
                </div>
                <div className="sched__cal-legend">
                  {[['Today','today'],['Exam','exam'],['Session','session'],['Event','event']].map(([l,c]) => (
                    <div key={l} className="sched__cal-legend-item"><span className={`sched__cal-legend-dot sched__cal-legend-dot--${c}`} />{l}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          USE CASES
          ════════════════════════════════════════════ */}
      <section id="cases" ref={caseRef} className="cases-section">
        <div className="section-wrap">
          <div className={`section-head ${caseVis ? 'section-head--visible' : ''}`}>
            <span className="section-tag">Use Cases</span>
            <h2 className="section-title">One platform. Every learning context.</h2>
            <p className="section-subtitle">Whether you're studying alone at midnight or running a coaching institute with 200 students — StudyHub adapts.</p>
          </div>

          <div className="cases__grid">
            {[
              { icon: 'ri-user-line', color: 'indigo', title: 'Solo Learners', desc: 'AI-generated quizzes for self-testing. PDF summaries to cut through dense textbooks. Streaks and heatmaps to fight procrastination. Your study companion that never sleeps and never judges.' },
              { icon: 'ri-team-line', color: 'violet', title: 'Study Groups', desc: 'One room fits everything: video, chat, shared tasks, notes, and resources. Broadcast quizzes to the whole group. Room leaderboards create healthy competition without leaving the platform.' },
              { icon: 'ri-medal-line', color: 'amber', title: 'Competitive Exam Prep', desc: 'JEE, NEET, UPSC, GATE, CAT. Exam countdowns that tick every second. Syllabus progress you can\'t lie about. Unlimited AI-generated practice sets. Group accountability that actually works.' },
              { icon: 'ri-parent-line', color: 'emerald', title: 'Parents Teaching Children', desc: 'Create a private room. Generate age-appropriate quizzes and flashcards instantly. Points and badges turn "go study" into a game your child genuinely wants to play.' },
              { icon: 'ri-presentation-line', color: 'rose', title: 'Teachers & Tutors', desc: 'Conduct live video classes with full host controls. Broadcast assessments to 30+ students simultaneously with instant scoring. Assign tasks, track completion, share materials — all in one place.' },
              { icon: 'ri-building-line', color: 'blue', title: 'Coaching Institutes', desc: 'Separate rooms per batch. Scheduled classes with automated notifications. Weekly quiz broadcasts. Subject-wise resource libraries. Inter-student leaderboards across batches.' },
            ].map((c, i) => (
              <div
                key={i}
                className={`cases__card cases__card--${c.color} ${caseVis ? 'cases__card--visible' : ''}`}
                style={{ transitionDelay: `${i * 80 + 100}ms` }}
              >
                <div className={`cases__card-icon cases__card-icon--${c.color}`}><i className={c.icon} /></div>
                <h3 className="cases__card-title">{c.title}</h3>
                <p className="cases__card-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          COMPARISON
          ════════════════════════════════════════════ */}
      <section id="compare" ref={compRef} className="compare-section">
        <div className="section-wrap">
          <div className={`section-head ${compVis ? 'section-head--visible' : ''}`}>
            <span className="section-tag">Compare</span>
            <h2 className="section-title">The honest comparison.</h2>
            <p className="section-subtitle">What happens when you stop duct-taping five tools together and use one that was designed for studying.</p>
          </div>

          <div className={`compare__table-wrap ${compVis ? 'compare__table-wrap--visible' : ''}`}>
            <table className="compare__table">
              <thead>
                <tr>
                  <th className="compare__th-cap">Capability</th>
                  <th className="compare__th-hub"><i className="ri-book-open-line" /> StudyHub</th>
                  <th>Zoom</th>
                  <th>Notion</th>
                  <th>Quizlet</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Live video conferencing', true, true, false, false],
                  ['AI quiz generation from PDFs', true, false, false, 'partial'],
                  ['Live quiz broadcasting to room', true, false, false, false],
                  ['Real-time collaborative tasks', true, 'partial', true, false],
                  ['AI flashcard generation', true, false, false, true],
                  ['Gamification, badges & streaks', true, false, false, 'partial'],
                  ['Exam countdown timer', true, false, false, false],
                  ['PDF summarization', true, false, 'partial', false],
                  ['Shared tasks & notes in rooms', true, false, false, false],
                  ['@AI contextual chat assistant', true, false, false, false],
                  ['Free & open source', true, 'partial', 'partial', 'partial'],
                ].map(([feat, ...vals], i) => (
                  <tr key={i}>
                    <td className="compare__td-feat">{feat}</td>
                    {vals.map((v, j) => (
                      <td key={j} className={j === 0 ? 'compare__td-hub' : ''}>
                        {v === true  && <i className="ri-checkbox-circle-fill compare__yes" />}
                        {v === false && <i className="ri-close-circle-line compare__no" />}
                        {v === 'partial' && <i className="ri-indeterminate-circle-line compare__partial" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TECH STACK
          ════════════════════════════════════════════ */}
      <section className="tech-section">
        <div className="section-wrap">
          <p className="tech__label">Engineering</p>
          <div className="tech__chips">
            {[
              ['ri-reactjs-line','React 19'],
              ['ri-nodejs-line','Node.js + Express'],
              ['ri-database-2-line','MongoDB'],
              ['ri-wireless-charging-line','Socket.IO'],
              ['ri-vidicon-line','WebRTC / mediasoup'],
              ['ri-robot-2-line','Google Gemini AI'],
              ['ri-cloud-line','Cloudinary'],
              ['ri-shield-keyhole-line','JWT + bcrypt'],
            ].map(([ic, label]) => (
              <div key={label} className="tech__chip"><i className={ic} />{label}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FINAL CTA
          ════════════════════════════════════════════ */}
      <section ref={ctaRef} className="cta-section">
        <div className="section-wrap section-wrap--narrow">
          <div className={`cta__card ${ctaVis ? 'cta__card--visible' : ''}`}>
            <div className="cta__bg-orb cta__bg-orb--1" />
            <div className="cta__bg-orb cta__bg-orb--2" />
            <div className="cta__inner">
              <h2 className="cta__title">Stop switching tabs.<br />Start studying.</h2>
              <p className="cta__desc">Create your free account in 30 seconds. No credit card. No trial that expires. No strings. Just a genuinely better way to learn.</p>
              <div className="cta__buttons">
                <a href={appLink('/signup')} className="btn btn--white btn--lg">
                  Get Started Free <i className="ri-arrow-right-line" />
                </a>
                <a href={appLink('/login')} className="btn btn--ghost-white btn--lg">
                  I have an account
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════ */}
      <footer className="footer">
        <div className="section-wrap">
          <div className="footer__grid">
            <div className="footer__brand">
              <div className="footer__logo">
                <span className="footer__logo-icon"><i className="ri-book-open-line" /></span>
                <span className="footer__logo-text">StudyHub</span>
              </div>
              <p className="footer__brand-desc">The all-in-one collaborative study workspace for students, teachers, and parents.</p>
            </div>

            <div className="footer__col">
              <h4 className="footer__col-title">Platform</h4>
              {[['Features','features'],['AI Engine','ai'],['Experience','room'],['Use Cases','cases'],['Compare','compare']].map(([l,id]) => (
                <button key={id} onClick={() => scrollTo(id)} className="footer__link">{l}</button>
              ))}
            </div>

            <div className="footer__col">
              <h4 className="footer__col-title">Get Started</h4>
              <a href={appLink('/signup')} className="footer__link">Create Account</a>
              <a href={appLink('/login')} className="footer__link">Log In</a>
              <button onClick={() => scrollTo('how')} className="footer__link">How It Works</button>
            </div>

            <div className="footer__col">
              <h4 className="footer__col-title">Built With</h4>
              <span className="footer__text">React 19 + Vite</span>
              <span className="footer__text">Node.js + Express</span>
              <span className="footer__text">MongoDB + Mongoose</span>
              <span className="footer__text">Socket.IO + mediasoup</span>
            </div>
          </div>

          <div className="footer__bottom">
            <p>&copy; 2026 StudyHub. Crafted with <i className="ri-heart-fill footer__heart" /> for students everywhere.</p>
            <div className="footer__socials">
              {['ri-github-fill','ri-twitter-x-line','ri-linkedin-box-fill'].map(ic => (
                <span key={ic} className="footer__social"><i className={ic} /></span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
