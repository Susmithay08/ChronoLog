import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/index.js'
import { BookOpen, Plus, BarChart2, Sparkles, Trash2, Calendar, Tag, Heart, ChevronRight, ArrowLeft } from 'lucide-react'

const MOODS = [
  { key:'great', label:'🔥 Great', desc:'Crushing it' },
  { key:'good',  label:'✨ Good',  desc:'Solid day' },
  { key:'okay',  label:'😌 Okay',  desc:'Getting by' },
  { key:'rough', label:'😤 Rough', desc:'Hard day' },
]

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar() {
  const { view, setView, logs, generateDigest, digestLoading } = useStore()
  const streak = logs[0]?.streak || 0

  const navItems = [
    { key:'journal', label:'Journal', icon: BookOpen },
    { key:'new',     label:'New Entry', icon: Plus },
    { key:'stats',   label:'Insights', icon: BarChart2 },
  ]

  return (
    <div style={{ width:220, background:'var(--white)', borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column', height:'100vh', position:'fixed', left:0, top:0, zIndex:10 }}>

      {/* Logo */}
      <div style={{ padding:'28px 20px 20px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:24, color:'var(--ink)', lineHeight:1.1 }}>
          Chrono<span style={{ color:'var(--forest)', fontStyle:'italic' }}>Log</span>
        </div>
        <div style={{ fontSize:11, color:'var(--ink3)', marginTop:4, fontFamily:'var(--font-mono)' }}>dev journal</div>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div style={{ margin:'16px 12px', background:'linear-gradient(135deg, var(--forest), var(--forest2))',
          borderRadius:12, padding:'12px 14px', color:'#fff' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, lineHeight:1 }}>{streak}</div>
          <div style={{ fontSize:11, opacity:0.8, marginTop:2 }}>day streak 🔥</div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex:1, padding:'8px 0' }}>
        {navItems.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setView(key)}
            style={{ width:'100%', padding:'11px 20px', display:'flex', alignItems:'center', gap:10,
              background: view === key ? 'var(--bg2)' : 'none',
              border:'none', borderLeft: view === key ? '3px solid var(--forest)' : '3px solid transparent',
              cursor:'pointer', textAlign:'left', color: view === key ? 'var(--forest)' : 'var(--ink2)',
              fontSize:14, fontWeight: view === key ? 600 : 400, transition:'all 0.15s', fontFamily:'var(--font-body)' }}>
            <Icon size={16}/> {label}
          </button>
        ))}
      </nav>

      {/* AI Digest button */}
      <div style={{ padding:'16px 12px', borderTop:'1px solid var(--border)' }}>
        <button onClick={generateDigest} disabled={digestLoading || logs.length === 0}
          className="btn-primary" style={{ width:'100%', justifyContent:'center',
            background:'var(--blush)', fontSize:13, opacity: logs.length === 0 ? 0.5 : 1 }}>
          <Sparkles size={14}/>
          {digestLoading ? 'Generating...' : 'Weekly Digest'}
        </button>
        <div style={{ fontSize:10, color:'var(--ink3)', textAlign:'center', marginTop:6, fontFamily:'var(--font-mono)' }}>
          AI summary of your week
        </div>
      </div>
    </div>
  )
}

// ─── JOURNAL VIEW ─────────────────────────────────────────────────────────────
function JournalView() {
  const { logs, deleteLog } = useStore()

  if (logs.length === 0) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      height:'70vh', gap:16, color:'var(--ink3)' }}>
      <BookOpen size={48} strokeWidth={1}/>
      <p style={{ fontFamily:'var(--font-display)', fontSize:24, color:'var(--ink2)' }}>Your journal is empty</p>
      <p style={{ fontSize:14 }}>Start logging your dev journey</p>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {logs.map((log, i) => (
        <motion.div key={log.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          transition={{ delay: i * 0.05 }} className="card"
          style={{ padding:'24px 28px', position:'relative', overflow:'hidden' }}>

          {/* Mood accent bar */}
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4,
            background: log.mood==='great'?'var(--forest)':log.mood==='good'?'var(--sky)':log.mood==='okay'?'var(--gold)':'var(--blush)' }}/>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink3)' }}>{log.date}</span>
                <span className={`mood-${log.mood}`} style={{ fontSize:11, padding:'2px 8px', borderRadius:10, fontWeight:600 }}>
                  {MOODS.find(m=>m.key===log.mood)?.label}
                </span>
                {log.streak > 1 && (
                  <span style={{ fontSize:11, color:'var(--forest)', fontWeight:600 }}>🔥 Day {log.streak}</span>
                )}
              </div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--ink)', lineHeight:1.2 }}>{log.title}</h3>
            </div>
            <button onClick={() => deleteLog(log.id)} style={{ background:'none', border:'none',
              color:'var(--border)', cursor:'pointer', padding:4, transition:'color 0.2s' }}
              onMouseEnter={e=>e.target.style.color='var(--blush)'}
              onMouseLeave={e=>e.target.style.color='var(--border)'}>
              <Trash2 size={15}/>
            </button>
          </div>

          {log.body && <p style={{ fontSize:14, color:'var(--ink2)', lineHeight:1.7, marginBottom:16 }}>{log.body}</p>}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            {log.built && (
              <div style={{ background:'var(--bg2)', borderRadius:8, padding:'10px 12px' }}>
                <div style={{ fontSize:10, color:'var(--forest)', fontWeight:600, marginBottom:4, letterSpacing:'0.08em' }}>BUILT</div>
                <div style={{ fontSize:13, color:'var(--ink2)' }}>{log.built}</div>
              </div>
            )}
            {log.learned && (
              <div style={{ background:'var(--bg2)', borderRadius:8, padding:'10px 12px' }}>
                <div style={{ fontSize:10, color:'var(--sky)', fontWeight:600, marginBottom:4, letterSpacing:'0.08em' }}>LEARNED</div>
                <div style={{ fontSize:13, color:'var(--ink2)' }}>{log.learned}</div>
              </div>
            )}
          </div>

          {log.tags && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {log.tags.split(',').filter(Boolean).map((t,i) => (
                <span key={i} style={{ fontSize:11, color:'var(--ink3)', background:'var(--bg3)',
                  padding:'3px 8px', borderRadius:6, fontFamily:'var(--font-mono)' }}>#{t.trim()}</span>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

// ─── NEW ENTRY ────────────────────────────────────────────────────────────────
function NewEntry() {
  const { addLog, setView } = useStore()
  const [form, setForm] = useState({ title:'', body:'', mood:'good', tags:'', built:'', learned:'', date:'' })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const submit = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    await addLog(form)
    setSaving(false)
  }

  return (
    <div style={{ maxWidth:700 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
        <button onClick={() => setView('journal')} className="btn-ghost" style={{ padding:'8px 12px' }}>
          <ArrowLeft size={14}/>
        </button>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:32, color:'var(--ink)' }}>New Entry</h2>
      </div>

      <div className="card" style={{ padding:'32px' }}>
        {/* Date */}
        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--ink3)', marginBottom:6, letterSpacing:'0.08em' }}>DATE</label>
          <input type="date" value={form.date} onChange={e=>set('date',e.target.value)}
            style={{ border:'1.5px solid var(--border)', borderRadius:8, padding:'10px 12px', fontSize:14,
              color:'var(--ink)', background:'var(--bg)', outline:'none', width:200 }}/>
        </div>

        {/* Title */}
        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--ink3)', marginBottom:6, letterSpacing:'0.08em' }}>TITLE</label>
          <input value={form.title} onChange={e=>set('title',e.target.value)}
            placeholder="What defined today?"
            style={{ width:'100%', border:'1.5px solid var(--border)', borderRadius:8, padding:'12px 14px',
              fontSize:16, color:'var(--ink)', background:'var(--bg)', outline:'none' }}
            onFocus={e=>e.target.style.borderColor='var(--forest)'}
            onBlur={e=>e.target.style.borderColor='var(--border)'}/>
        </div>

        {/* Mood */}
        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--ink3)', marginBottom:10, letterSpacing:'0.08em' }}>MOOD</label>
          <div style={{ display:'flex', gap:10 }}>
            {MOODS.map(m => (
              <button key={m.key} onClick={() => set('mood', m.key)}
                style={{ flex:1, padding:'10px 8px', borderRadius:10, fontSize:13, fontWeight:500,
                  border: form.mood === m.key ? '2px solid var(--forest)' : '1.5px solid var(--border)',
                  background: form.mood === m.key ? 'var(--bg2)' : 'var(--white)',
                  color: form.mood === m.key ? 'var(--forest)' : 'var(--ink2)',
                  cursor:'pointer', transition:'all 0.15s', textAlign:'center' }}>
                <div>{m.label}</div>
                <div style={{ fontSize:10, opacity:0.7, marginTop:2 }}>{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Journal body */}
        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--ink3)', marginBottom:6, letterSpacing:'0.08em' }}>JOURNAL</label>
          <textarea value={form.body} onChange={e=>set('body',e.target.value)}
            placeholder="What happened today? What did you work on? How did it go?"
            rows={4}
            style={{ width:'100%', border:'1.5px solid var(--border)', borderRadius:8, padding:'12px 14px',
              fontSize:14, color:'var(--ink)', background:'var(--bg)', outline:'none', resize:'vertical', lineHeight:1.7 }}
            onFocus={e=>e.target.style.borderColor='var(--forest)'}
            onBlur={e=>e.target.style.borderColor='var(--border)'}/>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
          {[['BUILT TODAY','built','What did you ship or make?'],['LEARNED TODAY','learned','What clicked for you?']].map(([lbl,key,ph]) => (
            <div key={key}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--ink3)', marginBottom:6, letterSpacing:'0.08em' }}>{lbl}</label>
              <textarea value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={ph} rows={3}
                style={{ width:'100%', border:'1.5px solid var(--border)', borderRadius:8, padding:'10px 12px',
                  fontSize:13, color:'var(--ink)', background:'var(--bg)', outline:'none', resize:'none', lineHeight:1.6 }}
                onFocus={e=>e.target.style.borderColor='var(--forest)'}
                onBlur={e=>e.target.style.borderColor='var(--border)'}/>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div style={{ marginBottom:28 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--ink3)', marginBottom:6, letterSpacing:'0.08em' }}>TAGS</label>
          <input value={form.tags} onChange={e=>set('tags',e.target.value)}
            placeholder="react, api, bugfix, design..."
            style={{ width:'100%', border:'1.5px solid var(--border)', borderRadius:8, padding:'10px 14px',
              fontSize:14, color:'var(--ink)', background:'var(--bg)', outline:'none' }}
            onFocus={e=>e.target.style.borderColor='var(--forest)'}
            onBlur={e=>e.target.style.borderColor='var(--border)'}/>
        </div>

        <button onClick={submit} disabled={saving || !form.title.trim()} className="btn-primary"
          style={{ width:'100%', justifyContent:'center', fontSize:15, padding:'14px', opacity: !form.title.trim() ? 0.5 : 1 }}>
          {saving ? 'Saving...' : '📝 Save Entry'}
        </button>
      </div>
    </div>
  )
}

// ─── STATS VIEW ───────────────────────────────────────────────────────────────
function StatsView() {
  const { stats, logs } = useStore()
  if (!stats || stats.total === 0) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--ink3)', fontFamily:'var(--font-display)', fontSize:24 }}>
      No data yet — start journaling!
    </div>
  )

  const moodColors = { great:'var(--forest)', good:'var(--sky)', okay:'var(--gold)', rough:'var(--blush)' }

  return (
    <div>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:36, marginBottom:28, color:'var(--ink)' }}>
        Your <span style={{ color:'var(--forest)', fontStyle:'italic' }}>Insights</span>
      </h2>

      {/* Big stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        {[
          ['Total Entries', stats.total, BookOpen, 'var(--forest)'],
          ['Current Streak', `${stats.streak} days`, Heart, 'var(--blush)'],
          ['Most Used Tag', stats.tags[0]?.[0] || '—', Tag, 'var(--sky)'],
        ].map(([label, val, Icon, color]) => (
          <div key={label} className="card" style={{ padding:'24px', textAlign:'center' }}>
            <div style={{ width:44, height:44, borderRadius:12, background:color, display:'flex',
              alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
              <Icon size={20} color="#fff"/>
            </div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:700, color:'var(--ink)' }}>{val}</div>
            <div style={{ fontSize:12, color:'var(--ink3)', marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Mood breakdown */}
      <div className="card" style={{ padding:'24px', marginBottom:20 }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, marginBottom:20, color:'var(--ink)' }}>Mood Breakdown</h3>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {Object.entries(stats.moods).map(([mood, count]) => (
            <div key={mood} style={{ flex:1, minWidth:100, background:'var(--bg2)', borderRadius:10, padding:'14px',
              borderTop:`3px solid ${moodColors[mood] || 'var(--border)'}`, textAlign:'center' }}>
              <div style={{ fontSize:24, fontFamily:'var(--font-display)', fontWeight:700, color:'var(--ink)' }}>{count}</div>
              <div style={{ fontSize:12, color:'var(--ink3)', marginTop:4 }}>{MOODS.find(m=>m.key===mood)?.label || mood}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      {stats.tags.length > 0 && (
        <div className="card" style={{ padding:'24px' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, marginBottom:16, color:'var(--ink)' }}>Top Tags</h3>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {stats.tags.map(([tag, count]) => (
              <div key={tag} style={{ display:'flex', alignItems:'center', gap:6, background:'var(--bg3)',
                borderRadius:8, padding:'6px 12px' }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'var(--forest)' }}>#{tag}</span>
                <span style={{ fontSize:11, color:'var(--ink3)', background:'var(--white)',
                  borderRadius:4, padding:'1px 6px' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── DIGEST VIEW ─────────────────────────────────────────────────────────────
function DigestView() {
  const { digest, setView } = useStore()
  if (!digest) return null

  return (
    <div style={{ maxWidth:680 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
        <button onClick={() => setView('journal')} className="btn-ghost" style={{ padding:'8px 12px' }}>
          <ArrowLeft size={14}/>
        </button>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:32, color:'var(--ink)' }}>Weekly Digest</h2>
      </div>

      <div className="card" style={{ padding:'36px', background:'linear-gradient(135deg, var(--white), var(--bg2))' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--blush)',
          color:'#fff', padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:600, marginBottom:24 }}>
          <Sparkles size={12}/> AI GENERATED
        </div>

        <h3 style={{ fontFamily:'var(--font-display)', fontSize:28, color:'var(--ink)', marginBottom:8, lineHeight:1.2 }}>
          {digest.headline}
        </h3>

        <div style={{ display:'inline-block', background:'var(--bg3)', borderRadius:8, padding:'4px 12px',
          fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink3)', marginBottom:20 }}>
          Mood: {digest.mood_trend}
        </div>

        <p style={{ fontSize:15, color:'var(--ink2)', lineHeight:1.8, marginBottom:28 }}>{digest.summary}</p>

        {digest.highlights && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--forest)', marginBottom:12, letterSpacing:'0.08em' }}>HIGHLIGHTS</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {digest.highlights.map((h, i) => (
                <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <div style={{ width:20, height:20, borderRadius:6, background:'var(--forest)', display:'flex',
                    alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                    <span style={{ color:'#fff', fontSize:10, fontWeight:700 }}>{i+1}</span>
                  </div>
                  <span style={{ fontSize:14, color:'var(--ink2)', lineHeight:1.5 }}>{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {digest.technologies?.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--sky)', marginBottom:10, letterSpacing:'0.08em' }}>TECHNOLOGIES THIS WEEK</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {digest.technologies.map((t,i) => (
                <span key={i} style={{ background:'var(--bg3)', borderRadius:6, padding:'4px 12px',
                  fontFamily:'var(--font-mono)', fontSize:12, color:'var(--ink2)' }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {digest.next_week_suggestion && (
          <div style={{ background:'var(--forest)', borderRadius:12, padding:'16px 20px' }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', marginBottom:6, letterSpacing:'0.08em' }}>SUGGESTED FOCUS FOR NEXT WEEK</div>
            <p style={{ fontSize:14, color:'#fff', lineHeight:1.6 }}>{digest.next_week_suggestion}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const { view, fetchLogs, fetchStats } = useStore()

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [])

  const views = { journal: JournalView, new: NewEntry, stats: StatsView, digest: DigestView }
  const View = views[view] || JournalView

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar/>
      <main style={{ marginLeft:220, flex:1, padding:'40px 48px', maxWidth:900 }}>
        {/* Header */}
        {view === 'journal' && (
          <div style={{ marginBottom:32 }}>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(36px,4vw,52px)', color:'var(--ink)', lineHeight:1.1 }}>
              Your Dev <span style={{ color:'var(--forest)', fontStyle:'italic' }}>Journal</span>
            </h1>
            <p style={{ fontSize:14, color:'var(--ink3)', marginTop:8 }}>
              {new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
            </p>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            transition={{ duration:0.2 }}>
            <View/>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
