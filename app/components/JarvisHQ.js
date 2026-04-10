"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// âââ STORAGE (localStorage) âââ
const S = {
  async get(k, fb) {
    try {
      if (typeof window === "undefined") return fb;
      const r = localStorage.getItem(k);
      return r ? JSON.parse(r) : fb;
    } catch { return fb; }
  },
  async set(k, v) {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};

// âââ JARVIS THEME âââ
const C = {
  bg: "#020610", bg2: "#060D1A", card: "#0A1628",
  border: "#0F2847", borderGlow: "#1A4A7A",
  // Primary HUD colors
  cyan: "#00D4FF", cyanDim: "#006B80", cyanGlow: "#00D4FF40",
  blue: "#1E90FF", blueGlow: "#1E90FF30",
  // Accent colors
  orange: "#FF6B35", orangeGlow: "#FF6B3530",
  gold: "#FFD700", goldGlow: "#FFD70025",
  green: "#00FF88", greenGlow: "#00FF8825",
  red: "#FF4757", redGlow: "#FF475720",
  purple: "#C084FC",
  // Text
  text: "#E0F0FF", dim: "#3A5A7A", mid: "#6B8EB0",
  // Special
  hologram: "rgba(0, 212, 255, 0.03)",
  scanline: "rgba(0, 212, 255, 0.015)",
};

const TABS = [
  { id: "dash", label: "OVERVIEW", icon: "â", color: C.cyan },
  { id: "academy", label: "ACADEMY", icon: "â³", color: C.cyan },
  { id: "health", label: "VITALS", icon: "â¡", color: C.green },
  { id: "tasks", label: "MISSIONS", icon: "â¬¡", color: C.gold },
  { id: "revenue", label: "REVENUE", icon: "â", color: C.purple },
  { id: "invest", label: "MARKET", icon: "â½", color: C.green },
];

// âââ AI GREETING âââ
function getGreeting() {
  const h = new Date().getHours();
  const greetings = {
    morning: [
      "Good morning, sir. All systems operational.",
      "Morning briefing ready, sir. Shall we begin?",
      "Rise and shine, sir. I've prepared your daily overview.",
    ],
    afternoon: [
      "Good afternoon, sir. Running at optimal capacity.",
      "Afternoon check-in ready, sir.",
      "All systems nominal this afternoon, sir.",
    ],
    evening: [
      "Good evening, sir. Today's summary is ready.",
      "Evening report prepared, sir.",
      "Good evening. Shall I run the daily debrief?",
    ],
    night: [
      "Burning the midnight oil, sir? I'm here.",
      "Late night session initiated, sir.",
      "Night mode active. All systems standing by.",
    ],
  };
  const period = h < 6 ? "night" : h < 12 ? "morning" : h < 18 ? "afternoon" : h < 22 ? "evening" : "night";
  const arr = greetings[period];
  return arr[Math.floor(Math.random() * arr.length)];
}

// âââ SVG ARC COMPONENT âââ
function Arc({ cx, cy, r, start, end, color, width = 2, opacity = 1 }) {
  const startRad = (start - 90) * Math.PI / 180;
  const endRad = (end - 90) * Math.PI / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const large = end - start > 180 ? 1 : 0;
  return (
    <path
      d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
      stroke={color} strokeWidth={width} fill="none" opacity={opacity}
      strokeLinecap="round"
    />
  );
}

// âââ CIRCULAR GAUGE âââ
function CircularGauge({ value, max, label, sub, color, size = 100, icon }) {
  const pct = Math.min(value / max, 1);
  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${color}15`} strokeWidth={3} />
        {/* Value arc */}
        <Arc cx={cx} cy={cy} r={r} start={0} end={pct * 360} color={color} width={3} />
        {/* Tick marks */}
        {[0, 90, 180, 270].map(deg => {
          const rad = (deg - 90) * Math.PI / 180;
          return (
            <line key={deg}
              x1={cx + (r - 4) * Math.cos(rad)} y1={cy + (r - 4) * Math.sin(rad)}
              x2={cx + (r + 2) * Math.cos(rad)} y2={cy + (r + 2) * Math.sin(rad)}
              stroke={`${color}40`} strokeWidth={1}
            />
          );
        })}
        {/* Center text */}
        <text x={cx} y={cy - 4} textAnchor="middle" fill={C.text} fontSize={size / 5} fontWeight="800" fontFamily="inherit">
          {icon || value}
        </text>
        <text x={cx} y={cy + size / 7} textAnchor="middle" fill={C.mid} fontSize={size / 10} fontFamily="inherit">
          {label}
        </text>
      </svg>
      {sub && <div style={{ fontSize: 9, color: C.dim, marginTop: -4 }}>{sub}</div>}
    </div>
  );
}

// âââ ARC REACTOR âââ
function ArcReactor({ size = 120, pulse = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ filter: `drop-shadow(0 0 20px ${C.cyanGlow})` }}>
      <defs>
        <radialGradient id="reactor-glow">
          <stop offset="0%" stopColor={C.cyan} stopOpacity="0.6" />
          <stop offset="50%" stopColor={C.cyan} stopOpacity="0.1" />
          <stop offset="100%" stopColor={C.cyan} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Glow */}
      <circle cx="60" cy="60" r="55" fill="url(#reactor-glow)" />
      {/* Outer ring */}
      <circle cx="60" cy="60" r="50" fill="none" stroke={`${C.cyan}20`} strokeWidth="1" />
      <circle cx="60" cy="60" r="48" fill="none" stroke={`${C.cyan}30`} strokeWidth="0.5" strokeDasharray="4 8" className="j-spin-slow" />
      {/* Middle ring */}
      <circle cx="60" cy="60" r="38" fill="none" stroke={`${C.cyan}25`} strokeWidth="1" />
      <circle cx="60" cy="60" r="36" fill="none" stroke={`${C.cyan}40`} strokeWidth="0.5" strokeDasharray="2 6" className="j-spin-rev" />
      {/* Inner segments */}
      {[0, 60, 120, 180, 240, 300].map(deg => (
        <Arc key={deg} cx={60} cy={60} r={26} start={deg + 5} end={deg + 50} color={C.cyan} width={2} opacity={0.5} />
      ))}
      {/* Core */}
      <circle cx="60" cy="60" r="14" fill={`${C.cyan}08`} stroke={C.cyan} strokeWidth="1.5" className={pulse ? "j-pulse" : ""} />
      <circle cx="60" cy="60" r="6" fill={C.cyan} opacity="0.8" className={pulse ? "j-pulse" : ""} />
      {/* Triangle inside */}
      <polygon points="60,50 67,65 53,65" fill="none" stroke={C.cyan} strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

// âââ VOICE WAVE âââ
function VoiceWave({ active = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 16 }}>
      {[0, 1, 2, 3, 4, 3, 2, 1, 0].map((h, i) => (
        <div key={i} className={active ? "j-wave" : ""} style={{
          width: 2, height: 4 + h * 2, background: C.cyan, borderRadius: 1,
          opacity: active ? 0.7 : 0.2,
          animationDelay: `${i * 0.08}s`,
        }} />
      ))}
    </div>
  );
}

// âââ HUD PANEL âââ
function HudPanel({ children, style = {}, glow, accent }) {
  const col = accent || C.cyan;
  return (
    <div style={{
      position: "relative", background: `${C.card}E0`,
      border: `1px solid ${glow ? col + "40" : C.border}`,
      borderRadius: 4, padding: 14,
      backdropFilter: "blur(10px)",
      boxShadow: glow ? `0 0 20px ${col}10, inset 0 0 30px ${col}05` : "none",
      ...style,
    }}>
      {/* Corner accents */}
      <div style={{ position: "absolute", top: -1, left: -1, width: 12, height: 12,
        borderTop: `2px solid ${col}60`, borderLeft: `2px solid ${col}60` }} />
      <div style={{ position: "absolute", top: -1, right: -1, width: 12, height: 12,
        borderTop: `2px solid ${col}60`, borderRight: `2px solid ${col}60` }} />
      <div style={{ position: "absolute", bottom: -1, left: -1, width: 12, height: 12,
        borderBottom: `2px solid ${col}40`, borderLeft: `2px solid ${col}40` }} />
      <div style={{ position: "absolute", bottom: -1, right: -1, width: 12, height: 12,
        borderBottom: `2px solid ${col}40`, borderRight: `2px solid ${col}40` }} />
      {children}
    </div>
  );
}

// âââ HUD HEADER âââ
function HudHdr({ icon, title, color, right, status }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: color || C.cyan, fontSize: 10 }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: color || C.cyan, letterSpacing: 3, textTransform: "uppercase" }}>
          {title}
        </span>
        {status && (
          <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 2,
            background: `${C.green}15`, color: C.green, letterSpacing: 1 }}>{status}</span>
        )}
      </div>
      {right}
    </div>
  );
}

// âââ HUD BUTTON âââ
function HudBtn({ children, color, onClick, full, small }) {
  const c = color || C.cyan;
  return (
    <button onClick={onClick} style={{
      padding: small ? "5px 12px" : "10px 16px", borderRadius: 2,
      border: `1px solid ${c}40`,
      background: `linear-gradient(180deg, ${c}12 0%, ${c}05 100%)`,
      color: c, fontSize: small ? 9 : 11, fontWeight: 700, cursor: "pointer",
      fontFamily: "inherit", letterSpacing: 1, textTransform: "uppercase",
      width: full ? "100%" : "auto", transition: "all 0.15s",
      position: "relative", overflow: "hidden",
    }}>{children}</button>
  );
}

// âââ DATA LINE âââ
function DataLine({ label, value, color, pct }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 3 }}>
        <span style={{ color: C.mid, letterSpacing: 1 }}>{label}</span>
        <span style={{ color: color || C.text, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{value}</span>
      </div>
      {pct !== undefined && (
        <div style={{ height: 2, background: `${color || C.cyan}10`, borderRadius: 1, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`,
            background: `linear-gradient(90deg, ${color || C.cyan}60, ${color || C.cyan})`,
            borderRadius: 1, transition: "width 0.6s ease", boxShadow: `0 0 6px ${color || C.cyan}40` }} />
        </div>
      )}
    </div>
  );
}

// âââ STATUS INDICATOR âââ
function StatusDot({ status, label }) {
  const colors = { online: C.green, offline: C.red, warning: C.gold, standby: C.cyan };
  const col = colors[status] || C.dim;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: col,
        boxShadow: `0 0 6px ${col}80` }} className={status === "online" ? "j-pulse" : ""} />
      {label && <span style={{ fontSize: 8, color: C.mid, letterSpacing: 1 }}>{label}</span>}
    </div>
  );
}

// ââââââââââââââââââââââââââââââââââââââââââââââââââ
// TAB: DASHBOARD
// ââââââââââââââââââââââââââââââââââââââââââââââââââ
function DashTab({ campuses, log, todos, rev, greeting }) {
  const total = campuses.reduce((s, c) => s + c.students, 0);
  const latest = log[log.length - 1];
  const doneTodos = todos.filter(t => t.done).length;
  const totalRev = rev.gn + rev.jg + rev.ds;
  const pendingTodos = todos.filter(t => !t.done);

  return (
    <div>
      {/* AI Greeting */}
      <HudPanel glow style={{ marginBottom: 14, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <ArcReactor size={80} />
        </div>
        <div style={{ fontSize: 12, color: C.cyan, fontWeight: 300, letterSpacing: 1, lineHeight: 1.6 }} className="j-typewriter">
          "{greeting}"
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
          <VoiceWave />
        </div>
      </HudPanel>

      {/* System Status */}
      <HudPanel style={{ marginBottom: 10 }}>
        <HudHdr icon="â" title="SYSTEM STATUS" status="ONLINE" />
        <div style={{ display: "flex", justifyContent: "space-around", padding: "4px 0" }}>
          {[
            { label: "ACADEMY", status: "online" },
            { label: "HEALTH", status: latest ? "online" : "standby" },
            { label: "REVENUE", status: totalRev > 0 ? "online" : "standby" },
            { label: "MARKET", status: "online" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <StatusDot status={s.status} />
              <div style={{ fontSize: 7, color: C.dim, marginTop: 3, letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </HudPanel>

      {/* Metric Gauges */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <HudPanel style={{ textAlign: "center" }}>
          <CircularGauge value={total} max={1000} label="STUDENTS" color={C.cyan} size={90} />
          <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginTop: 4 }}>{total}</div>
          <div style={{ fontSize: 9, color: C.dim }}>/ 1,000 TARGET</div>
        </HudPanel>
        <HudPanel style={{ textAlign: "center" }}>
          <CircularGauge
            value={latest ? Math.max(0, 120 - latest.kg) : 0} max={20}
            label="WEIGHT" color={C.green} size={90}
          />
          <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginTop: 4 }}>
            {latest ? `${latest.kg}` : "---"}<span style={{ fontSize: 11, color: C.dim }}>kg</span>
          </div>
          <div style={{ fontSize: 9, color: C.dim }}>TARGET 100kg</div>
        </HudPanel>
        <HudPanel style={{ textAlign: "center" }}>
          <CircularGauge value={doneTodos} max={Math.max(todos.length, 1)} label="MISSIONS" color={C.gold} size={90} />
          <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginTop: 4 }}>
            {doneTodos}<span style={{ fontSize: 11, color: C.dim }}>/{todos.length}</span>
          </div>
          <div style={{ fontSize: 9, color: C.dim }}>COMPLETED</div>
        </HudPanel>
        <HudPanel style={{ textAlign: "center" }}>
          <CircularGauge value={totalRev} max={100000000} label="REVENUE" color={C.purple} size={90} />
          <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginTop: 4 }}>
            {totalRev > 0 ? `${(totalRev / 10000).toFixed(0)}` : "0"}<span style={{ fontSize: 11, color: C.dim }}>ë§</span>
          </div>
          <div style={{ fontSize: 9, color: C.dim }}>THIS MONTH â©</div>
        </HudPanel>
      </div>

      {/* Campus Overview */}
      <HudPanel style={{ marginBottom: 10 }}>
        <HudHdr icon="â³" title="CAMPUS INTEL" color={C.cyan} />
        {campuses.map(c => {
          const pct = Math.round((c.students / c.target) * 100);
          return <DataLine key={c.name} label={c.name} value={`${c.students}/${c.target} (${pct}%)`}
            color={c.color} pct={pct} />;
        })}
      </HudPanel>

      {/* Active Missions */}
      {pendingTodos.length > 0 && (
        <HudPanel accent={C.gold}>
          <HudHdr icon="â " title="ACTIVE MISSIONS" color={C.gold} />
          {pendingTodos.slice(0, 5).map(t => (
            <div key={t.id} style={{ fontSize: 11, color: C.text, padding: "4px 0",
              borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: C.gold, fontSize: 8 }}>â¸</span> {t.text}
            </div>
          ))}
        </HudPanel>
      )}
    </div>
  );
}

// ââââââââââââââââââââââââââââââââââââââââââââââââââ
// TAB: ACADEMY
// ââââââââââââââââââââââââââââââââââââââââââââââââââ
function AcademyTab({ campuses, setCampuses }) {
  const [editing, setEditing] = useState(null);
  const [tmp, setTmp] = useState("");
  const [editField, setEditField] = useState(null);

  const total = campuses.reduce((s, c) => s + c.students, 0);

  return (
    <div>
      {/* HUD Header */}
      <HudPanel glow style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 9, color: C.cyan, letterSpacing: 3, marginBottom: 4 }}>TOTAL ENROLLMENT</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: C.text, lineHeight: 1 }}>{total}</div>
            <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>TARGET 1,000 Â· {((total / 1000) * 100).toFixed(1)}%</div>
          </div>
          <CircularGauge value={total} max={1000} label="" color={C.cyan} size={80} />
        </div>
        {/* Total bar */}
        <div style={{ marginTop: 10, height: 3, background: `${C.cyan}10`, borderRadius: 1.5, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(total / 1000) * 100}%`,
            background: `linear-gradient(90deg, ${C.cyan}60, ${C.cyan})`,
            boxShadow: `0 0 10px ${C.cyan}40`, transition: "width 0.6s" }} />
        </div>
      </HudPanel>

      {/* Campus Cards */}
      {campuses.map((c, i) => {
        const pct = Math.round((c.students / c.target) * 100);
        return (
          <HudPanel key={c.name} accent={c.color} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <StatusDot status={pct >= 80 ? "online" : pct >= 50 ? "warning" : "standby"} />
                <span style={{ fontSize: 14, fontWeight: 800, color: c.color, letterSpacing: 2 }}>{c.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {editing === i ? (
                  <input value={tmp} onChange={e => setTmp(e.target.value)} autoFocus
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        const n = [...campuses];
                        if (editField === "target") n[i] = { ...n[i], target: parseInt(tmp) || c.target };
                        else n[i] = { ...n[i], students: parseInt(tmp) || c.students };
                        setCampuses(n); setEditing(null);
                      }
                      if (e.key === "Escape") setEditing(null);
                    }}
                    onBlur={() => setEditing(null)}
                    style={{ width: 50, padding: "2px 6px", fontSize: 14, background: C.bg,
                      border: `1px solid ${c.color}80`, borderRadius: 2, color: C.text,
                      fontFamily: "inherit", textAlign: "right" }} />
                ) : (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                    <span onClick={() => { setEditing(i); setEditField("students"); setTmp(String(c.students)); }}
                      style={{ fontSize: 24, fontWeight: 800, color: C.text, cursor: "pointer" }}>{c.students}</span>
                    <span style={{ color: C.dim, fontSize: 11 }}>/</span>
                    <span onClick={() => { setEditing(i); setEditField("target"); setTmp(String(c.target)); }}
                      style={{ fontSize: 12, color: C.dim, cursor: "pointer" }}>{c.target}</span>
                  </div>
                )}
              </div>
            </div>
            <DataLine label="CAPACITY" value={`${pct}%`} color={c.color} pct={pct} />
            <div style={{ fontSize: 9, color: C.mid, marginTop: 4 }}>{c.staff}</div>
          </HudPanel>
        );
      })}

      {/* Staff Matrix */}
      <HudPanel>
        <HudHdr icon="â" title="PERSONNEL MATRIX" color={C.orange} />
        {[
          { campus: "ê³µë¦", people: [
            { name: "ì±ì", role: "COMMANDER", status: "online" },
            { name: "Sarah", role: "LEAD/MGR", status: "online" },
            { name: "Belle", role: "INSTRUCTOR", status: "offline" },
            { name: "Esther", role: "TEMP", status: "warning" },
            { name: "Jessica", role: "INSTRUCTOR", status: "online" },
            { name: "Ethan", role: "INSTRUCTOR", status: "online" },
          ]},
          { campus: "ì¤ê³", people: [
            { name: "Sue", role: "TEAM LEAD", status: "online" },
            { name: "ìë", role: "INSTRUCTOR", status: "online" },
            { name: "Cici", role: "INSTRUCTOR", status: "online" },
            { name: "Chloe", role: "INSTRUCTOR", status: "online" },
          ]},
          { campus: "ë¤ì°", people: [
            { name: "Liam", role: "DIRECTOR", status: "online" },
          ]},
        ].map(g => (
          <div key={g.campus} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: C.cyan, fontWeight: 700, marginBottom: 4, letterSpacing: 2 }}>
              â {g.campus}
            </div>
            {g.people.map(p => (
              <div key={p.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "4px 0 4px 10px", fontSize: 10, borderLeft: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <StatusDot status={p.status} />
                  <span style={{ color: C.text }}>{p.name}</span>
                  <span style={{ color: C.dim, fontSize: 8, letterSpacing: 1 }}>{p.role}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </HudPanel>
    </div>
  );
}

// ââââââââââââââââââââââââââââââââââââââââââââââââââ
// TAB: HEALTH (VITALS)
// ââââââââââââââââââââââââââââââââââââââââââââââââââ
function HealthTab({ log, setLog }) {
  const [input, setInput] = useState("");
  const target = 100;

  const add = () => {
    if (!input) return;
    const entry = { d: new Date().toLocaleDateString("ko-KR"), kg: parseFloat(input), t: Date.now() };
    setLog([...log, entry].slice(-90));
    setInput("");
  };
  const remove = (t) => setLog(log.filter(e => e.t !== t));

  const latest = log[log.length - 1];
  const weekAgo = log.length >= 7 ? log[log.length - 7] : log[0];
  const weekDiff = latest && weekAgo ? (latest.kg - weekAgo.kg).toFixed(1) : null;
  const monthAgo = log.length >= 30 ? log[log.length - 30] : log[0];
  const monthDiff = latest && monthAgo ? (latest.kg - monthAgo.kg).toFixed(1) : null;
  const best = log.length > 0 ? Math.min(...log.map(e => e.kg)) : null;

  // Heart rate style display for weight trend
  const recentWeights = log.slice(-20).map(e => e.kg);
  const minW = recentWeights.length > 0 ? Math.min(...recentWeights) : 95;
  const maxW = recentWeights.length > 0 ? Math.max(...recentWeights) : 110;
  const rangeW = maxW - minW || 1;

  return (
    <div>
      {/* Vital Signs Header */}
      <HudPanel glow accent={C.green} style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 9, color: C.green, letterSpacing: 3, marginBottom: 4 }}>CURRENT WEIGHT</div>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span style={{ fontSize: 44, fontWeight: 800, color: C.text, lineHeight: 1 }}>
                {latest ? latest.kg : "---"}
              </span>
              <span style={{ fontSize: 14, color: C.dim, marginLeft: 4 }}>kg</span>
            </div>
            {latest && (
              <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4,
                color: latest.kg <= target ? C.green : C.orange }}>
                {latest.kg <= target ? "â TARGET ACHIEVED" : `â¸ ${(latest.kg - target).toFixed(1)}kg TO TARGET`}
              </div>
            )}
          </div>
          <CircularGauge
            value={latest ? Math.max(0, 120 - latest.kg) : 0} max={20}
            label="STATUS" color={latest && latest.kg <= target ? C.green : C.orange} size={80}
          />
        </div>
      </HudPanel>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { label: "7D DELTA", val: weekDiff, suffix: "kg" },
          { label: "30D DELTA", val: monthDiff, suffix: "kg" },
          { label: "ALL-TIME LOW", val: best, suffix: "kg" },
        ].map(s => (
          <HudPanel key={s.label} style={{ textAlign: "center", padding: 10 }}>
            <div style={{ fontSize: 8, color: C.dim, marginBottom: 4, letterSpacing: 1 }}>{s.label}</div>
            <div style={{
              fontSize: 16, fontWeight: 800,
              color: s.val && typeof s.val === "string" && parseFloat(s.val) < 0 ? C.green
                : s.val && typeof s.val === "string" && parseFloat(s.val) > 0 ? C.red : C.text,
            }}>
              {s.val !== null && s.val !== undefined
                ? (typeof s.val === "string" && parseFloat(s.val) > 0 ? "+" : "") + s.val
                : "---"}
            </div>
            <div style={{ fontSize: 8, color: C.dim }}>{s.suffix}</div>
          </HudPanel>
        ))}
      </div>

      {/* Weight Waveform */}
      {log.length > 2 && (
        <HudPanel style={{ marginBottom: 14, padding: "8px 10px" }}>
          <HudHdr icon="ã" title="WEIGHT WAVEFORM" color={C.green} />
          <svg width="100%" height="60" viewBox={`0 0 ${Math.max(recentWeights.length * 14, 100)} 60`}
            preserveAspectRatio="none" style={{ display: "block" }}>
            {/* Grid lines */}
            {[0, 20, 40, 60].map(y => (
              <line key={y} x1="0" y1={y} x2="100%" y2={y} stroke={`${C.cyan}08`} strokeWidth="0.5" />
            ))}
            {/* Target line */}
            <line x1="0" y1={60 - ((target - minW) / rangeW) * 50 - 5}
              x2="100%" y2={60 - ((target - minW) / rangeW) * 50 - 5}
              stroke={`${C.green}30`} strokeWidth="1" strokeDasharray="4 4" />
            {/* Weight path */}
            {recentWeights.length > 1 && (
              <>
                <polyline fill="none" stroke={C.green} strokeWidth="2"
                  points={recentWeights.map((w, i) => {
                    const x = i * (280 / Math.max(recentWeights.length - 1, 1));
                    const y = 55 - ((w - minW) / rangeW) * 50;
                    return `${x},${y}`;
                  }).join(" ")}
                  style={{ filter: `drop-shadow(0 0 4px ${C.green}60)` }}
                />
                {/* Dots */}
                {recentWeights.map((w, i) => {
                  const x = i * (280 / Math.max(recentWeights.length - 1, 1));
                  const y = 55 - ((w - minW) / rangeW) * 50;
                  return <circle key={i} cx={x} cy={y} r={i === recentWeights.length - 1 ? 3 : 1.5}
                    fill={w <= target ? C.green : C.orange}
                    opacity={i === recentWeights.length - 1 ? 1 : 0.5} />;
                })}
              </>
            )}
          </svg>
        </HudPanel>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="WEIGHT INPUT (kg)" type="number" step="0.1"
          style={{
            flex: 1, padding: "12px 16px", borderRadius: 2, border: `1px solid ${C.border}`,
            background: C.bg, color: C.text, fontSize: 14, outline: "none",
            fontFamily: "inherit", letterSpacing: 1,
          }} />
        <button onClick={add} style={{
          padding: "12px 20px", borderRadius: 2, border: `1px solid ${C.green}60`,
          background: `linear-gradient(180deg, ${C.green}20 0%, ${C.green}08 100%)`,
          color: C.green, fontSize: 12, fontWeight: 800, cursor: "pointer",
          fontFamily: "inherit", letterSpacing: 2,
        }}>LOG</button>
      </div>

      {/* History */}
      {log.length > 0 && (
        <HudPanel>
          <HudHdr icon="â" title="DATA LOG" color={C.green} />
          {log.slice(-10).reverse().map(e => (
            <div key={e.t} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "5px 0", borderBottom: `1px solid ${C.border}`, fontSize: 11 }}>
              <span style={{ color: C.mid, fontVariantNumeric: "tabular-nums" }}>{e.d}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, color: e.kg <= target ? C.green : C.text,
                  fontVariantNumeric: "tabular-nums" }}>{e.kg}kg</span>
                <span onClick={() => remove(e.t)} style={{ color: C.dim, cursor: "pointer", fontSize: 9 }}>â</span>
              </div>
            </div>
          ))}
        </HudPanel>
      )}
    </div>
  );
}

// ââââââââââââââââââââââââââââââââââââââââââââââââââ
// TAB: TASKS (MISSIONS)
// ââââââââââââââââââââââââââââââââââââââââââââââââââ
function TasksTab({ todos, setTodos }) {
  const [input, setInput] = useState("");
  const [cat, setCat] = useState("all");

  const add = () => {
    if (!input.trim()) return;
    const text = input.trim();
    let category = "general";
    if (/íì|ìº í´ì¤|ì ì|íë¶ëª¨|ìë´|ìì/.test(text)) category = "academy";
    else if (/ë¬ë¼ì½|dallako/i.test(text)) category = "dallako";
    else if (/ì¬ì¥ì|sajangso|threads/i.test(text)) category = "sajangso";
    else if (/í¬ì|ì£¼ì|ë§¤ì|ë§ ë|nvda|vti/i.test(text)) category = "invest";
    else if (/ì´ë|ì²´ì¤|ê±´ê°|ë¬ë|ë¬ë¦¬ê¸°/.test(text)) category = "health";
    setTodos([...todos, { text, done: false, id: Date.now(), category }]);
    setInput("");
  };

  const toggle = id => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = id => setTodos(todos.filter(t => t.id !== id));
  const clearDone = () => setTodos(todos.filter(t => !t.done));

  const cats = [
    { id: "all", label: "ALL", color: C.text },
    { id: "academy", label: "ACADEMY", color: C.cyan },
    { id: "dallako", label: "DALLAKO", color: C.orange },
    { id: "sajangso", label: "ì¬ì¥ì", color: C.purple },
    { id: "invest", label: "MARKET", color: C.green },
    { id: "health", label: "VITALS", color: C.gold },
    { id: "general", label: "OTHER", color: C.mid },
  ];

  const filtered = cat === "all" ? todos : todos.filter(t => t.category === cat);
  const done = todos.filter(t => t.done).length;
  const pct = todos.length > 0 ? Math.round((done / todos.length) * 100) : 0;

  return (
    <div>
      {/* Mission Status */}
      <HudPanel glow accent={C.gold} style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 9, color: C.gold, letterSpacing: 3, marginBottom: 4 }}>MISSION STATUS</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.text }}>{done}<span style={{ fontSize: 14, color: C.dim }}>/{todos.length}</span></div>
            <div style={{ fontSize: 10, color: C.dim }}>OBJECTIVES COMPLETED</div>
          </div>
          <CircularGauge value={done} max={Math.max(todos.length, 1)} label="" color={C.gold} size={70} />
        </div>
        <div style={{ marginTop: 8 }}>
          <DataLine label="COMPLETION" value={`${pct}%`} color={C.gold} pct={pct} />
        </div>
      </HudPanel>

      {/* Category Filter */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
        {cats.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} style={{
            padding: "4px 10px", borderRadius: 2, fontFamily: "inherit",
            border: `1px solid ${cat === c.id ? c.color + "60" : C.border}`,
            background: cat === c.id ? `${c.color}12` : "transparent",
            color: cat === c.id ? c.color : C.dim, fontSize: 8, fontWeight: 700,
            cursor: "pointer", letterSpacing: 1,
          }}>{c.label}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="NEW MISSION (AUTO-CLASSIFIED)"
          style={{
            flex: 1, padding: "12px 16px", borderRadius: 2, border: `1px solid ${C.border}`,
            background: C.bg, color: C.text, fontSize: 12, outline: "none",
            fontFamily: "inherit", letterSpacing: 0.5,
          }} />
        <button onClick={add} style={{
          padding: "12px 18px", borderRadius: 2, border: `1px solid ${C.gold}60`,
          background: `linear-gradient(180deg, ${C.gold}20 0%, ${C.gold}08 100%)`,
          color: C.gold, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
        }}>+</button>
      </div>

      {done > 0 && (
        <div style={{ marginBottom: 10 }}>
          <HudBtn color={C.dim} onClick={clearDone} small>CLEAR COMPLETED</HudBtn>
        </div>
      )}

      {/* Mission List */}
      <div style={{ maxHeight: 350, overflowY: "auto" }}>
        {filtered.map(t => {
          const catInfo = cats.find(c => c.id === t.category) || cats[6];
          return (
            <div key={t.id} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 0",
              borderBottom: `1px solid ${C.border}`,
            }}>
              <span onClick={() => toggle(t.id)} style={{ cursor: "pointer", fontSize: 14,
                color: t.done ? C.green : C.dim }}>
                {t.done ? "â" : "â"}
              </span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 12, color: t.done ? C.dim : C.text,
                  textDecoration: t.done ? "line-through" : "none", letterSpacing: 0.3 }}>{t.text}</span>
                <span style={{ fontSize: 8, color: catInfo.color, marginLeft: 6, padding: "1px 5px",
                  background: `${catInfo.color}12`, borderRadius: 2, letterSpacing: 1 }}>{catInfo.label}</span>
              </div>
              <span onClick={() => remove(t.id)} style={{ cursor: "pointer", color: C.dim, fontSize: 10 }}>â</span>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 30, color: C.dim, fontSize: 11, letterSpacing: 2 }}>
            NO ACTIVE MISSIONS
          </div>
        )}
      </div>
    </div>
  );
}

// ââââââââââââââââââââââââââââââââââââââââââââââââââ
// TAB: REVENUE
// ââââââââââââââââââââââââââââââââââââââââââââââââââ
function RevenueTab({ rev, setRev, revHist, setRevHist }) {
  const total = rev.gn + rev.jg + rev.ds;
  const items = [
    { key: "gn", label: "GONGREUNG", color: C.cyan },
    { key: "jg", label: "JUNGGYE", color: C.orange },
    { key: "ds", label: "DASAN", color: C.gold },
  ];
  const profits = { gn: 0.53, jg: 0.35, ds: 0.40 };

  const snapshot = () => {
    const entry = { ...rev, month: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "short" }), t: Date.now() };
    setRevHist([...revHist, entry].slice(-12));
  };
  const resetMonth = () => setRev({ gn: 0, jg: 0, ds: 0 });

  const totalProfit = items.reduce((s, it) => s + (rev[it.key] * (profits[it.key] || 0.4)), 0);

  return (
    <div>
      <HudPanel glow accent={C.purple} style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 9, color: C.purple, letterSpacing: 3, marginBottom: 4 }}>MONTHLY REVENUE</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: C.text }}>
              â©{total > 0 ? total.toLocaleString() : "0"}
            </div>
          </div>
          {total > 0 && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, color: C.green, letterSpacing: 2, marginBottom: 2 }}>EST. PROFIT</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>
                â©{Math.round(totalProfit).toLocaleString()}
              </div>
            </div>
          )}
        </div>
        {/* Revenue breakdown bar */}
        {total > 0 && (
          <div style={{ display: "flex", height: 4, borderRadius: 2, overflow: "hidden", marginTop: 10, gap: 2 }}>
            {items.map(it => (
              <div key={it.key} style={{
                width: `${(rev[it.key] / total) * 100}%`, background: it.color,
                transition: "width 0.3s", boxShadow: `0 0 6px ${it.color}40`,
              }} />
            ))}
          </div>
        )}
      </HudPanel>

      {/* Campus Revenue Inputs */}
      {items.map(it => (
        <HudPanel key={it.key} accent={it.color} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: it.color, fontWeight: 800, letterSpacing: 2 }}>{it.label}</span>
            <span style={{ fontSize: 9, color: C.dim }}>MARGIN ~{(profits[it.key] * 100).toFixed(0)}%</span>
          </div>
          <input value={rev[it.key] || ""}
            onChange={e => setRev({ ...rev, [it.key]: parseInt(e.target.value) || 0 })}
            placeholder="REVENUE INPUT (â©)" type="number"
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 2, border: `1px solid ${C.border}`,
              background: C.bg, color: C.text, fontSize: 13, outline: "none",
              fontFamily: "inherit", letterSpacing: 0.5,
            }} />
          {rev[it.key] > 0 && (
            <div style={{ fontSize: 9, color: C.mid, marginTop: 4 }}>
              = {(rev[it.key] / 10000).toFixed(0)}ë§ì Â· PROFIT ~{(rev[it.key] * profits[it.key] / 10000).toFixed(0)}ë§ì
            </div>
          )}
        </HudPanel>
      ))}

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <HudBtn color={C.purple} onClick={snapshot} full>â SAVE SNAPSHOT</HudBtn>
        <HudBtn color={C.dim} onClick={resetMonth} small>RESET</HudBtn>
      </div>

      {revHist.length > 0 && (
        <HudPanel style={{ marginTop: 12 }}>
          <HudHdr icon="â" title="MONTHLY ARCHIVE" color={C.purple} />
          {revHist.slice(-6).reverse().map((h, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0",
              fontSize: 10, borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.mid }}>{h.month}</span>
              <span style={{ color: C.text, fontWeight: 600 }}>â©{((h.gn + h.jg + h.ds) / 10000).toFixed(0)}ë§</span>
            </div>
          ))}
        </HudPanel>
      )}
    </div>
  );
}

// ââââââââââââââââââââââââââââââââââââââââââââââââââ
// TAB: INVEST (MARKET)
// ââââââââââââââââââââââââââââââââââââââââââââââââââ
function InvestTab() {
  const [portfolio, setPortfolio] = useState([]);
  const [sym, setSym] = useState("");
  const [shares, setShares] = useState("");
  const [avgPrice, setAvgPrice] = useState("");

  useEffect(() => { S.get("hq-portfolio", []).then(setPortfolio); }, []);
  const save = p => { setPortfolio(p); S.set("hq-portfolio", p); };

  const defaults = [
    { symbol: "NVDA", shares: 0, avgPrice: 0, tag: "AI CORE" },
    { symbol: "VTI", shares: 0, avgPrice: 0, tag: "INDEX" },
    { symbol: "TSLA", shares: 0, avgPrice: 0, tag: "GROWTH" },
    { symbol: "PLTR", shares: 0, avgPrice: 0, tag: "DATA" },
    { symbol: "GOOGL", shares: 0, avgPrice: 0, tag: "BIG TECH" },
    { symbol: "DIS", shares: 0, avgPrice: 0, tag: "MEDIA" },
  ];
  const items = portfolio.length > 0 ? portfolio : defaults;
  const totalInvested = items.reduce((s, i) => s + (i.shares * i.avgPrice), 0);

  const addStock = () => {
    if (!sym.trim()) return;
    const exists = items.find(i => i.symbol === sym.toUpperCase());
    if (exists) {
      save(items.map(i => i.symbol === sym.toUpperCase()
        ? { ...i, shares: parseFloat(shares) || i.shares, avgPrice: parseFloat(avgPrice) || i.avgPrice }
        : i));
    } else {
      save([...items, { symbol: sym.toUpperCase(), shares: parseFloat(shares) || 0, avgPrice: parseFloat(avgPrice) || 0, tag: "" }]);
    }
    setSym(""); setShares(""); setAvgPrice("");
  };
  const removeStock = (symbol) => save(items.filter(i => i.symbol !== symbol));

  return (
    <div>
      <HudPanel glow accent={C.green} style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: C.green, letterSpacing: 3, marginBottom: 4 }}>TOTAL PORTFOLIO VALUE</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.text }}>
          ${totalInvested > 0 ? totalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0"}
        </div>
        <div style={{ fontSize: 10, color: C.dim }}>{items.filter(i => i.shares > 0).length} ACTIVE POSITIONS</div>
      </HudPanel>

      {/* Holdings */}
      {items.map(i => (
        <HudPanel key={i.symbol} accent={C.green} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StatusDot status={i.shares > 0 ? "online" : "standby"} />
              <span style={{ fontSize: 14, fontWeight: 800, color: C.green, letterSpacing: 1 }}>${i.symbol}</span>
              {i.tag && <span style={{ fontSize: 8, color: C.dim, letterSpacing: 1 }}>{i.tag}</span>}
            </div>
            <span onClick={() => removeStock(i.symbol)} style={{ color: C.dim, cursor: "pointer", fontSize: 9 }}>â</span>
          </div>
          {(i.shares > 0 || i.avgPrice > 0) && (
            <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 10, color: C.mid }}>
              <span>{i.shares} SHARES</span>
              <span>AVG ${i.avgPrice}</span>
              <span style={{ color: C.text, fontWeight: 600 }}>= ${(i.shares * i.avgPrice).toLocaleString()}</span>
            </div>
          )}
        </HudPanel>
      ))}

      {/* Add Form */}
      <HudPanel style={{ marginTop: 12 }}>
        <HudHdr icon="+" title="ADD / UPDATE POSITION" color={C.green} />
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <input value={sym} onChange={e => setSym(e.target.value)} placeholder="TICKER"
            style={{ flex: 1, padding: "8px", borderRadius: 2, border: `1px solid ${C.border}`,
              background: C.bg, color: C.text, fontSize: 11, outline: "none",
              fontFamily: "inherit", letterSpacing: 1 }} />
          <input value={shares} onChange={e => setShares(e.target.value)} placeholder="QTY" type="number"
            style={{ width: 55, padding: "8px", borderRadius: 2, border: `1px solid ${C.border}`,
              background: C.bg, color: C.text, fontSize: 11, outline: "none",
              fontFamily: "inherit" }} />
          <input value={avgPrice} onChange={e => setAvgPrice(e.target.value)} placeholder="AVG$" type="number"
            style={{ width: 65, padding: "8px", borderRadius: 2, border: `1px solid ${C.border}`,
              background: C.bg, color: C.text, fontSize: 11, outline: "none",
              fontFamily: "inherit" }} />
        </div>
        <HudBtn color={C.green} onClick={addStock} full>EXECUTE</HudBtn>
      </HudPanel>

      <HudPanel style={{ marginTop: 12, padding: 10 }}>
        <div style={{ fontSize: 10, color: C.mid, lineHeight: 1.6 }}>
          <span style={{ color: C.cyan }}>â J.A.R.V.I.S. TIP:</span> Ask me for real-time quotes in this chat.
          Try "NVDA current price" or "portfolio analysis"
        </div>
      </HudPanel>
    </div>
  );
}


// ââââââââââââââââââââââââââââââââââââââââââââââââââ
// MAIN APP
// ââââââââââââââââââââââââââââââââââââââââââââââââââ
export default function JarvisHQ() {
  const [tab, setTab] = useState("dash");
  const [time, setTime] = useState(new Date());
  const [loaded, setLoaded] = useState(false);
  const [greeting] = useState(getGreeting);

  // State
  const [campuses, setCampusesRaw] = useState([
    { name: "ê³µë¦", students: 152, target: 180, staff: "ì±ì(CMD) Â· Sarah Â· Esther(TMP) Â· Jessica Â· Ethan", color: C.cyan },
    { name: "ì¤ê³", students: 87, target: 120, staff: "Sue(LEAD) Â· ìë Â· Cici Â· Chloe", color: C.orange },
    { name: "ë¤ì°", students: 45, target: 80, staff: "Liam(DIR)", color: C.gold },
  ]);
  const [log, setLogRaw] = useState([]);
  const [todos, setTodosRaw] = useState([]);
  const [rev, setRevRaw] = useState({ gn: 0, jg: 0, ds: 0 });
  const [revHist, setRevHistRaw] = useState([]);

  const setCampuses = c => { setCampusesRaw(c); S.set("hq-camp3", c); };
  const setLog = l => { setLogRaw(l); S.set("hq-weight3", l); };
  const setTodos = t => { setTodosRaw(t); S.set("hq-todos3", t); };
  const setRev = r => { setRevRaw(r); S.set("hq-rev3", r); };
  const setRevHist = h => { setRevHistRaw(h); S.set("hq-revh3", h); };

  useEffect(() => {
    Promise.all([
      S.get("hq-camp3", null), S.get("hq-weight3", []),
      S.get("hq-todos3", []), S.get("hq-rev3", { gn: 0, jg: 0, ds: 0 }),
      S.get("hq-revh3", []),
    ]).then(([c, w, t, r, rh]) => {
      if (c) setCampusesRaw(c);
      setLogRaw(w); setTodosRaw(t); setRevRaw(r); setRevHistRaw(rh);
      setLoaded(true);
    });
  }, []);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const renderTab = () => {
    if (!loaded) return <div style={{ textAlign: "center", padding: 40, color: C.dim, letterSpacing: 3 }}>INITIALIZING...</div>;
    switch (tab) {
      case "dash": return <DashTab campuses={campuses} log={log} todos={todos} rev={rev} greeting={greeting} />;
      case "academy": return <AcademyTab campuses={campuses} setCampuses={setCampuses} />;
      case "health": return <HealthTab log={log} setLog={setLog} />;
      case "tasks": return <TasksTab todos={todos} setTodos={setTodos} />;
      case "revenue": return <RevenueTab rev={rev} setRev={setRev} revHist={revHist} setRevHist={setRevHist} />;
      case "invest": return <InvestTab />;
    }
  };

  const activeTab = TABS.find(t => t.id === tab);

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      display: "flex", flexDirection: "column", position: "relative", overflow: "hidden",
    }}>
      {/* ââ CSS ââ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700;800&display=swap');

        /* Animations */
        @keyframes j-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes j-spin-r { from { transform: rotate(360deg) } to { transform: rotate(0deg) } }
        @keyframes j-pulse { 0%,100% { opacity: 0.6 } 50% { opacity: 1 } }
        @keyframes j-glow { 0%,100% { box-shadow: 0 0 8px ${C.cyan}30 } 50% { box-shadow: 0 0 25px ${C.cyan}70 } }
        @keyframes j-scan { 0% { top: -2px } 100% { top: 100% } }
        @keyframes j-wave {
          0%,100% { transform: scaleY(0.4) }
          50% { transform: scaleY(1.8) }
        }
        @keyframes j-fadeIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes j-border-trace {
          0% { clip-path: inset(0 100% 100% 0) }
          25% { clip-path: inset(0 0 100% 0) }
          50% { clip-path: inset(0 0 0 0) }
          75% { clip-path: inset(0 0 0 0) }
          100% { clip-path: inset(0 100% 100% 0) }
        }

        .j-spin-slow { transform-origin: 60px 60px; animation: j-spin 20s linear infinite; }
        .j-spin-rev { transform-origin: 60px 60px; animation: j-spin-r 15s linear infinite; }
        .j-pulse { animation: j-pulse 2s ease-in-out infinite; }
        .j-glow { animation: j-glow 2.5s ease-in-out infinite; }
        .j-wave { animation: j-wave 1.2s ease-in-out infinite; }
        .j-fadeIn { animation: j-fadeIn 0.4s ease-out; }

        /* Scan line overlay */
        .j-scanlines::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 2px,
            ${C.scanline} 2px, ${C.scanline} 4px
          );
          pointer-events: none;
          z-index: 1;
        }

        /* Moving scan beam */
        .j-scan-beam::after {
          content: '';
          position: absolute;
          left: 0; right: 0;
          height: 60px;
          background: linear-gradient(180deg, transparent, ${C.cyan}04, transparent);
          animation: j-scan 4s linear infinite;
          pointer-events: none;
          z-index: 2;
        }

        /* Grid background */
        .j-grid-bg {
          background-image:
            linear-gradient(${C.cyan}05 1px, transparent 1px),
            linear-gradient(90deg, ${C.cyan}05 1px, transparent 1px);
          background-size: 40px 40px;
        }

        input::placeholder { color: ${C.dim}; }
        input[type=number]::-webkit-inner-spin-button { display: none; }
        button:active { transform: scale(0.97); }
        ::-webkit-scrollbar { width: 2px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ââ BACKGROUND EFFECTS ââ */}
      <div className="j-scanlines j-scan-beam j-grid-bg" style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none",
      }} />

      {/* Radial glow from top */}
      <div style={{
        position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
        width: 400, height: 300,
        background: `radial-gradient(ellipse, ${C.cyan}08 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* ââ HEADER ââ */}
      <div style={{
        padding: "12px 18px", borderBottom: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: `linear-gradient(180deg, ${C.bg2}F0, ${C.bg}F0)`,
        backdropFilter: "blur(20px)", position: "relative", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%", background: C.cyan,
              boxShadow: `0 0 15px ${C.cyan}80, 0 0 30px ${C.cyan}40`,
            }} className="j-glow" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 4, color: C.cyan }}>
              J.A.R.V.I.S.
            </div>
            <div style={{ fontSize: 8, color: C.dim, letterSpacing: 2 }}>
              JUST A RATHER VERY INTELLIGENT SYSTEM Â· v4.0
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontVariantNumeric: "tabular-nums",
            textShadow: `0 0 10px ${C.cyan}30` }}>
            {time.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div style={{ fontSize: 8, color: C.dim, letterSpacing: 1 }}>
            {time.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}
          </div>
        </div>
      </div>

      {/* ââ TABS ââ */}
      <div style={{
        display: "flex", borderBottom: `1px solid ${C.border}`,
        background: `${C.card}E0`, backdropFilter: "blur(10px)",
        position: "relative", zIndex: 10,
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "8px 2px", border: "none", background: "none",
            color: tab === t.id ? t.color : C.dim, fontSize: 8, fontWeight: 700,
            letterSpacing: 1, cursor: "pointer", fontFamily: "inherit",
            borderBottom: tab === t.id ? `2px solid ${t.color}` : "2px solid transparent",
            transition: "all 0.2s", position: "relative",
            textShadow: tab === t.id ? `0 0 10px ${t.color}60` : "none",
          }}>
            <div style={{ fontSize: 14, marginBottom: 2, opacity: tab === t.id ? 1 : 0.4 }}>{t.icon}</div>
            <div>{t.label}</div>
            {tab === t.id && (
              <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
                width: 4, height: 4, background: t.color, borderRadius: "50%",
                boxShadow: `0 0 8px ${t.color}` }} />
            )}
          </button>
        ))}
      </div>

      {/* ââ CONTENT ââ */}
      <div className="j-fadeIn" key={tab} style={{
        flex: 1, padding: 16, overflowY: "auto", position: "relative", zIndex: 10,
      }}>
        {renderTab()}
      </div>

      {/* ââ FOOTER ââ */}
      <div style={{
        padding: "6px 16px", borderTop: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 7, color: C.dim, letterSpacing: 2,
        background: `${C.card}E0`, backdropFilter: "blur(10px)",
        position: "relative", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <StatusDot status="online" />
          <span>ALL SYSTEMS NOMINAL</span>
        </div>
        <span>AWESOME ENGLISH EMPIRE</span>
      </div>
    </div>
  );
}
