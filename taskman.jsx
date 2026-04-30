import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// ── Initial Data ──────────────────────────────────────────────────
const INIT_TASKS = [
  { id: 1, title: "Design landing page mockups", cat: "Design", priority: "high", status: "in-progress", progress: 65, due: "2026-05-02", tags: ["UI"] },
  { id: 2, title: "API authentication integration", cat: "Dev", priority: "high", status: "todo", progress: 0, due: "2026-05-05", tags: ["Backend"] },
  { id: 3, title: "Write project documentation", cat: "Docs", priority: "medium", status: "todo", progress: 0, due: "2026-05-08", tags: [] },
  { id: 4, title: "Code review — PR #47", cat: "Dev", priority: "medium", status: "done", progress: 100, due: "2026-04-30", tags: [] },
  { id: 5, title: "User research interviews", cat: "Research", priority: "low", status: "in-progress", progress: 30, due: "2026-05-10", tags: ["UX"] },
  { id: 6, title: "Database query optimization", cat: "Dev", priority: "medium", status: "todo", progress: 0, due: "2026-05-12", tags: ["Perf"] },
  { id: 7, title: "Deploy staging environment", cat: "DevOps", priority: "high", status: "blocked", progress: 20, due: "2026-05-01", tags: [] },
  { id: 8, title: "Update brand guidelines", cat: "Design", priority: "low", status: "done", progress: 100, due: "2026-04-29", tags: [] },
];

const INIT_PROJECTS = [
  { id: 1, name: "Web App Redesign", color: "#f59e0b", taskIds: [1, 3, 8], deadline: "2026-05-15" },
  { id: 2, name: "Backend API v2", color: "#3b82f6", taskIds: [2, 6], deadline: "2026-05-20" },
  { id: 3, name: "DevOps Migration", color: "#ef4444", taskIds: [7], deadline: "2026-05-01" },
  { id: 4, name: "UX Research Sprint", color: "#22c55e", taskIds: [4, 5], deadline: "2026-05-10" },
];

const INIT_SCHEDULE = [
  { id: 1, day: "Mon", title: "Deep Work", start: "09:00", end: "11:00", type: "work" },
  { id: 2, day: "Mon", title: "Standup", start: "11:00", end: "11:30", type: "meeting" },
  { id: 3, day: "Mon", title: "Design Review", start: "14:00", end: "15:30", type: "meeting" },
  { id: 4, day: "Tue", title: "Deep Work", start: "09:00", end: "12:00", type: "work" },
  { id: 5, day: "Tue", title: "Lunch Break", start: "12:00", end: "13:00", type: "break" },
  { id: 6, day: "Tue", title: "Code Review", start: "15:00", end: "16:00", type: "work" },
  { id: 7, day: "Wed", title: "All Hands", start: "10:00", end: "11:00", type: "meeting" },
  { id: 8, day: "Wed", title: "Research Block", start: "14:00", end: "16:00", type: "focus" },
  { id: 9, day: "Thu", title: "Deep Work", start: "09:00", end: "12:00", type: "work" },
  { id: 10, day: "Thu", title: "Sprint Planning", start: "15:00", end: "16:30", type: "meeting" },
  { id: 11, day: "Fri", title: "Wrap Up", start: "09:00", end: "10:00", type: "work" },
  { id: 12, day: "Fri", title: "Retrospective", start: "11:00", end: "12:00", type: "meeting" },
];

const WEEKLY_DATA = [
  { day: "Mon", completed: 4, hours: 6.5 },
  { day: "Tue", completed: 3, hours: 7 },
  { day: "Wed", completed: 5, hours: 5.5 },
  { day: "Thu", completed: 2, hours: 8 },
  { day: "Fri", completed: 6, hours: 4 },
  { day: "Sat", completed: 1, hours: 2 },
  { day: "Sun", completed: 0, hours: 0 },
];

// ── Design Tokens ─────────────────────────────────────────────────
const C = {
  bg: "#090909", surface: "#111111", card: "#191919", border: "#242424",
  amber: "#f59e0b", amberDim: "#78350f", text: "#e2ddd4", muted: "#4e4e4e",
  dim: "#303030", green: "#22c55e", red: "#ef4444", blue: "#60a5fa", purple: "#a78bfa",
};
const TYPE_C = { work: "#f59e0b", meeting: "#60a5fa", break: "#22c55e", focus: "#a78bfa" };
const PRI_C = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };
const STS_C = { todo: "#4e4e4e", "in-progress": "#f59e0b", done: "#22c55e", blocked: "#ef4444" };
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HOURS = Array.from({ length: 10 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);
const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const NAV = [
  { id: "dashboard", icon: "◉", label: "Dashboard" },
  { id: "tasks", icon: "☰", label: "Tasks" },
  { id: "schedule", icon: "▦", label: "Schedule" },
  { id: "progress", icon: "◧", label: "Progress" },
  { id: "timer", icon: "◎", label: "Focus Timer" },
  { id: "analytics", icon: "▣", label: "Analytics" },
];

// ── Micro-Components ──────────────────────────────────────────────
const Bar2 = ({ v, color }) => (
  <div style={{ background: C.dim, borderRadius: 4, height: 4 }}>
    <div style={{ width: `${v}%`, height: "100%", background: color || C.amber, borderRadius: 4, transition: "width .3s" }} />
  </div>
);

const Pill = ({ text, color }) => (
  <span style={{ fontSize: 10, background: `${color}20`, color, border: `1px solid ${color}40`, borderRadius: 4, padding: "2px 7px", fontWeight: 700, letterSpacing: ".05em", whiteSpace: "nowrap" }}>{text}</span>
);

const SInput = ({ label, ...props }) => (
  <div style={{ marginBottom: 12 }}>
    {label && <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, letterSpacing: ".08em" }}>{label}</div>}
    <input {...props} style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 13px", color: C.text, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", outline: "none", ...props.style }} />
  </div>
);

const SSelect = ({ label, options, ...props }) => (
  <div style={{ marginBottom: 12 }}>
    {label && <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, letterSpacing: ".08em" }}>{label}</div>}
    <select {...props} style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 13px", color: C.text, fontSize: 13, fontFamily: "inherit", ...props.style }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

// ── Sidebar ───────────────────────────────────────────────────────
function Sidebar({ view, setView, stats }) {
  return (
    <aside style={{ width: 210, background: C.surface, borderRight: `1px solid ${C.border}`, padding: "24px 14px", display: "flex", flexDirection: "column", minHeight: "100vh", flexShrink: 0 }}>
      <div style={{ padding: "0 6px 28px" }}>
        <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-1px", color: C.amber }}>TASK<span style={{ color: C.text }}>MAN</span></div>
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: ".14em", marginTop: 2 }}>PRODUCTIVITY SUITE v2</div>
      </div>
      <nav style={{ flex: 1 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setView(n.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "10px 10px", marginBottom: 2, borderRadius: 8, background: view === n.id ? C.card : "transparent", border: `1px solid ${view === n.id ? C.border : "transparent"}`, color: view === n.id ? C.amber : C.muted, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
            <span style={{ fontSize: 14 }}>{n.icon}</span>
            <span style={{ fontSize: 12, letterSpacing: ".02em" }}>{n.label}</span>
            {n.id === "tasks" && stats.overdue > 0 && <span style={{ marginLeft: "auto", background: "#ef444422", color: "#ef4444", border: "1px solid #ef444444", borderRadius: 8, padding: "1px 6px", fontSize: 9 }}>{stats.overdue}</span>}
          </button>
        ))}
      </nav>
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginTop: 8 }}>
        <div style={{ fontSize: 9, color: C.muted, marginBottom: 8, letterSpacing: ".1em" }}>OVERALL PROGRESS</div>
        <Bar2 v={Math.round(stats.done / stats.total * 100)} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          <span style={{ fontSize: 10, color: C.muted }}>{stats.done}/{stats.total} done</span>
          <span style={{ fontSize: 10, color: C.amber }}>{Math.round(stats.done / stats.total * 100)}%</span>
        </div>
      </div>
    </aside>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────
function Dashboard({ tasks, stats, schedule, setShowAdd, setView }) {
  const todayItems = schedule.filter(s => s.day === "Thu");
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, color: C.muted, letterSpacing: ".12em", marginBottom: 3 }}>THURSDAY · APRIL 30, 2026</div>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-1.5px" }}>Good morning<span style={{ color: C.amber }}>.</span></h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Total Tasks", val: stats.total, color: C.text, icon: "⊞" },
          { label: "Completed", val: stats.done, color: C.green, icon: "✓" },
          { label: "In Progress", val: stats.inProgress, color: C.amber, icon: "▶" },
          { label: "Overdue", val: stats.overdue, color: C.red, icon: "!" },
        ].map(s => (
          <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: "-1px" }}>{s.val}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 3, letterSpacing: ".08em" }}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: C.muted, letterSpacing: ".1em" }}>TODAY'S SCHEDULE</div>
            <button onClick={() => setView("schedule")} style={{ fontSize: 10, color: C.amber, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>view all →</button>
          </div>
          {todayItems.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No items scheduled.</div>}
          {todayItems.map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 3, height: 34, background: TYPE_C[item.type], borderRadius: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: C.text }}>{item.title}</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{item.start} – {item.end}</div>
              </div>
              <Pill text={item.type} color={TYPE_C[item.type]} />
            </div>
          ))}
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: C.muted, letterSpacing: ".1em" }}>RECENT TASKS</div>
            <button onClick={() => setView("tasks")} style={{ fontSize: 10, color: C.amber, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>view all →</button>
          </div>
          {tasks.slice(0, 6).map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: STS_C[t.status], flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 12, color: t.status === "done" ? C.muted : C.text, textDecoration: t.status === "done" ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
              <Pill text={t.priority} color={PRI_C[t.priority]} />
            </div>
          ))}
          <button onClick={() => setShowAdd(true)} style={{ marginTop: 12, width: "100%", background: `${C.amber}11`, border: `1px dashed ${C.amber}44`, borderRadius: 8, padding: "9px", color: C.amber, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>+ Add Task</button>
        </div>
      </div>
    </div>
  );
}

// ── Tasks View ────────────────────────────────────────────────────
function TasksView({ tasks, filter, setFilter, onToggle, onDelete, setShowAdd }) {
  const statuses = ["all", "todo", "in-progress", "done", "blocked"];
  const priorities = ["all", "high", "medium", "low"];
  const Btn = ({ active, color, onClick, children }) => (
    <button onClick={onClick} style={{ background: active ? (color ? `${color}22` : C.dim) : "transparent", color: active ? (color || C.text) : C.muted, border: `1px solid ${active ? (color || C.border) : C.border}`, borderRadius: 6, padding: "5px 13px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>{children}</button>
  );
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-1px" }}>Tasks</h2>
        <button onClick={() => setShowAdd(true)} style={{ background: C.amber, border: "none", borderRadius: 8, padding: "9px 20px", color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ New Task</button>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        {statuses.map(s => <Btn key={s} active={filter.status === s} onClick={() => setFilter(f => ({ ...f, status: s }))}>{s}</Btn>)}
        <div style={{ width: 1, background: C.border, margin: "0 4px" }} />
        {priorities.map(p => <Btn key={p} active={filter.priority === p} color={p !== "all" ? PRI_C[p] : undefined} onClick={() => setFilter(f => ({ ...f, priority: p }))}>{p}</Btn>)}
      </div>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 12, letterSpacing: ".08em" }}>{tasks.length} TASK{tasks.length !== 1 ? "S" : ""}</div>
      {tasks.map(t => (
        <div key={t.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "13px 16px", display: "flex", alignItems: "center", gap: 13, marginBottom: 7 }}>
          <button onClick={() => onToggle(t.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: t.status === "done" ? C.green : C.dim, padding: 0, flexShrink: 0, lineHeight: 1 }}>{t.status === "done" ? "✓" : "○"}</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: t.status === "done" ? C.muted : C.text, textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}</span>
              <Pill text={t.cat} color={C.blue} />
              <Pill text={t.priority} color={PRI_C[t.priority]} />
              <Pill text={t.status} color={STS_C[t.status]} />
            </div>
            {t.progress > 0 && t.progress < 100 && <div style={{ marginTop: 6 }}><Bar2 v={t.progress} /></div>}
          </div>
          <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{t.due}</div>
          <button onClick={() => onDelete(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 14, padding: "0 3px", opacity: .5, lineHeight: 1 }}>✕</button>
        </div>
      ))}
      {tasks.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: C.muted, fontSize: 13 }}>No tasks match the filter.</div>}
    </div>
  );
}

// ── Schedule View ─────────────────────────────────────────────────
function ScheduleView({ schedule, setSchedule }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ day: "Mon", title: "", start: "09:00", end: "10:00", type: "work" });
  const toMin = t => { const [h, m] = t.split(":").map(Number); return (h - 8) * 60 + m; };
  const dur = (s, e) => { const [sh, sm] = s.split(":").map(Number); const [eh, em] = e.split(":").map(Number); return (eh * 60 + em) - (sh * 60 + sm); };
  const submit = () => {
    if (!form.title.trim()) return;
    setSchedule(s => [...s, { ...form, id: Date.now() }]);
    setShowAdd(false);
    setForm({ day: "Mon", title: "", start: "09:00", end: "10:00", type: "work" });
  };
  const deleteItem = (id) => setSchedule(s => s.filter(x => x.id !== id));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-1px" }}>Work Schedule</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {Object.entries(TYPE_C).map(([k, v]) => <Pill key={k} text={k} color={v} />)}
          <button onClick={() => setShowAdd(true)} style={{ marginLeft: 8, background: C.amber, border: "none", borderRadius: 7, padding: "8px 16px", color: "#000", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Add</button>
        </div>
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "52px repeat(5,1fr)", borderBottom: `1px solid ${C.border}` }}>
          <div />
          {DAYS.map(d => <div key={d} style={{ padding: "10px 6px", fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: ".1em", borderLeft: `1px solid ${C.border}`, textAlign: "center" }}>{d.toUpperCase()}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "52px repeat(5,1fr)" }}>
          <div>{HOURS.map(h => <div key={h} style={{ height: 48, fontSize: 9, color: C.muted, padding: "3px 6px", borderBottom: `1px solid ${C.border}22` }}>{h}</div>)}</div>
          {DAYS.map(day => (
            <div key={day} style={{ borderLeft: `1px solid ${C.border}`, position: "relative", height: 480 }}>
              {HOURS.map(h => <div key={h} style={{ height: 48, borderBottom: `1px solid ${C.border}22` }} />)}
              {schedule.filter(s => s.day === day).map(item => {
                const top = toMin(item.start) / 60 * 48;
                const h = Math.max(dur(item.start, item.end) / 60 * 48 - 2, 18);
                const col = TYPE_C[item.type];
                return (
                  <div key={item.id} style={{ position: "absolute", top, left: 2, right: 2, height: h, background: `${col}1a`, borderLeft: `3px solid ${col}`, borderRadius: "0 4px 4px 0", padding: "3px 5px", overflow: "hidden", cursor: "pointer" }} onClick={() => deleteItem(item.id)} title="Click to remove">
                    <div style={{ fontSize: 10, color: col, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                    <div style={{ fontSize: 9, color: `${col}99` }}>{item.start}–{item.end}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 10, color: C.muted }}>Click on a block to remove it.</div>
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, width: 360, fontFamily: "inherit" }}>
            <h3 style={{ margin: "0 0 18px", color: C.text, fontSize: 15, fontWeight: 700 }}>Add Schedule Block</h3>
            <SInput label="TITLE" type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Block title..." />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <SInput label="START" type="time" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
              <SInput label="END" type="time" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <SSelect label="DAY" value={form.day} options={DAYS} onChange={e => setForm(f => ({ ...f, day: e.target.value }))} />
              <SSelect label="TYPE" value={form.type} options={Object.keys(TYPE_C)} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button onClick={submit} style={{ flex: 1, background: C.amber, border: "none", borderRadius: 9, padding: "11px", color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Add Block</button>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: "11px", color: C.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Progress View ─────────────────────────────────────────────────
function ProgressView({ tasks, projects }) {
  const catMap = {};
  tasks.forEach(t => { if (!catMap[t.cat]) catMap[t.cat] = { total: 0, done: 0 }; catMap[t.cat].total++; if (t.status === "done") catMap[t.cat].done++; });
  const catData = Object.entries(catMap).map(([name, v]) => ({ name, pct: Math.round(v.done / v.total * 100), done: v.done, total: v.total }));
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: "0 0 24px", letterSpacing: "-1px" }}>Progress</h2>
      <div style={{ fontSize: 10, color: C.muted, letterSpacing: ".1em", marginBottom: 12 }}>PROJECTS</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
        {projects.map(proj => {
          const pt = tasks.filter(t => proj.taskIds.includes(t.id));
          const done = pt.filter(t => t.status === "done").length;
          const pct = pt.length ? Math.round(done / pt.length * 100) : 0;
          return (
            <div key={proj.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderLeft: `3px solid ${proj.color}`, borderRadius: 10, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{proj.name}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: proj.color, letterSpacing: "-1px" }}>{pct}%</div>
              </div>
              <Bar2 v={pct} color={proj.color} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 10, color: C.muted }}>{done}/{pt.length} tasks</span>
                <span style={{ fontSize: 10, color: C.muted }}>Due {proj.deadline}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 10, color: C.muted, letterSpacing: ".1em", marginBottom: 12 }}>BY CATEGORY</div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
        {catData.map(({ name, pct, done, total }) => (
          <div key={name} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: C.text }}>{name}</span>
              <span style={{ fontSize: 11, color: C.muted }}>{done}/{total} — <span style={{ color: C.amber }}>{pct}%</span></span>
            </div>
            <Bar2 v={pct} />
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, color: C.muted, letterSpacing: ".1em", marginBottom: 12 }}>WEEKLY OUTPUT</div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={WEEKLY_DATA} barSize={22}>
            <XAxis dataKey="day" tick={{ fill: C.muted, fontSize: 10, fontFamily: "Courier New" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "Courier New", color: C.text, fontSize: 11 }} />
            <Bar dataKey="completed" fill={C.amber} radius={[4, 4, 0, 0]} name="Tasks" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Timer View ────────────────────────────────────────────────────
function TimerView({ timerSec, running, setRunning, mode, setMode, setSec, sessions }) {
  const MODES = { work: { label: "Focus Work", dur: 25 * 60, color: C.amber }, break: { label: "Short Break", dur: 5 * 60, color: C.green }, long: { label: "Long Break", dur: 15 * 60, color: C.blue } };
  const m = MODES[mode] || MODES.work;
  const pct = timerSec / m.dur * 100;
  const R = 90, circ = 2 * Math.PI * R;
  const switchMode = k => { setMode(k); setRunning(false); setSec(MODES[k].dur); };
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: "0 0 24px", letterSpacing: "-1px" }}>Focus Timer</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
            {Object.entries(MODES).map(([k, v]) => (
              <button key={k} onClick={() => switchMode(k)} style={{ background: mode === k ? `${v.color}22` : "transparent", color: mode === k ? v.color : C.muted, border: `1px solid ${mode === k ? v.color : C.border}`, borderRadius: 6, padding: "5px 11px", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>{v.label}</button>
            ))}
          </div>
          <div style={{ position: "relative", marginBottom: 28 }}>
            <svg width={216} height={216} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={108} cy={108} r={R} fill="none" stroke={C.dim} strokeWidth={8} />
              <circle cx={108} cy={108} r={R} fill="none" stroke={m.color} strokeWidth={8} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ - pct / 100 * circ} style={{ transition: "stroke-dashoffset .6s ease" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 42, fontWeight: 700, color: m.color, letterSpacing: "-2px" }}>{fmt(timerSec)}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 4, letterSpacing: ".1em" }}>{m.label.toUpperCase()}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setRunning(false); setSec(m.dur); }} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 18px", color: C.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>↺ Reset</button>
            <button onClick={() => setRunning(r => !r)} style={{ background: running ? "#ef444422" : `${m.color}22`, border: `1px solid ${running ? C.red : m.color}`, borderRadius: 8, padding: "9px 26px", color: running ? C.red : m.color, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 }}>
              {running ? "⏸ Pause" : "▶ Start"}
            </button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 10, color: C.muted, letterSpacing: ".1em", marginBottom: 6 }}>SESSIONS TODAY</div>
            <div style={{ fontSize: 40, fontWeight: 700, color: C.amber, letterSpacing: "-2px" }}>{sessions}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sessions * 25} min of focused work</div>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 10, color: C.muted, letterSpacing: ".1em", marginBottom: 12 }}>SESSION TILES</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} style={{ width: 34, height: 34, borderRadius: 7, background: i < sessions ? C.amber : C.dim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: i < sessions ? "#000" : C.muted, fontWeight: 700 }}>
                  {i < sessions ? "✓" : i + 1}
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 10, color: C.muted, letterSpacing: ".1em", marginBottom: 12 }}>POMODORO GUIDE</div>
            {[{ l: "Focus session", t: "25 min", c: C.amber }, { l: "Short break", t: "5 min", c: C.green }, { l: "Long break (×4)", t: "15 min", c: C.blue }].map(({ l, t, c }) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
                  <span style={{ fontSize: 12, color: C.text }}>{l}</span>
                </div>
                <span style={{ fontSize: 11, color: c }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Analytics View ────────────────────────────────────────────────
function AnalyticsView({ tasks }) {
  const done = tasks.filter(t => t.status === "done").length;
  const rate = Math.round(done / tasks.length * 100);
  const avgProg = Math.round(tasks.reduce((a, t) => a + t.progress, 0) / tasks.length);
  const statusData = ["todo", "in-progress", "done", "blocked"].map(s => ({ name: s, val: tasks.filter(t => t.status === s).length, c: STS_C[s] }));
  const priData = ["high", "medium", "low"].map(p => ({ name: p, val: tasks.filter(t => t.priority === p).length, c: PRI_C[p] }));
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: "0 0 24px", letterSpacing: "-1px" }}>Analytics</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 22 }}>
        {[{ l: "Completion Rate", v: `${rate}%`, c: C.green }, { l: "Avg Progress", v: `${avgProg}%`, c: C.amber }, { l: "High Priority", v: tasks.filter(t => t.priority === "high").length, c: C.red }, { l: "Active Projects", v: 4, c: C.blue }].map(s => (
          <div key={s.l} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.c, letterSpacing: "-1px" }}>{s.v}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 3, letterSpacing: ".07em" }}>{s.l.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: ".1em", marginBottom: 14 }}>TASKS COMPLETED / DAY</div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={WEEKLY_DATA} barSize={20}>
              <XAxis dataKey="day" tick={{ fill: C.muted, fontSize: 10, fontFamily: "Courier New" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "Courier New", color: C.text, fontSize: 11 }} />
              <Bar dataKey="completed" fill={C.amber} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: ".1em", marginBottom: 14 }}>HOURS WORKED / DAY</div>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={WEEKLY_DATA}>
              <XAxis dataKey="day" tick={{ fill: C.muted, fontSize: 10, fontFamily: "Courier New" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "Courier New", color: C.text, fontSize: 11 }} />
              <Line dataKey="hours" stroke={C.green} strokeWidth={2} dot={{ fill: C.green, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: ".1em", marginBottom: 14 }}>STATUS BREAKDOWN</div>
          {statusData.map(({ name, val, c }) => (
            <div key={name} style={{ marginBottom: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: C.text, textTransform: "capitalize" }}>{name}</span>
                <span style={{ fontSize: 11, color: c }}>{val}</span>
              </div>
              <Bar2 v={Math.round(val / tasks.length * 100)} color={c} />
            </div>
          ))}
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: ".1em", marginBottom: 14 }}>PRIORITY MIX</div>
          {priData.map(({ name, val, c }) => (
            <div key={name} style={{ marginBottom: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: C.text, textTransform: "capitalize" }}>{name} priority</span>
                <span style={{ fontSize: 11, color: c }}>{val} tasks</span>
              </div>
              <Bar2 v={Math.round(val / tasks.length * 100)} color={c} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Add Task Modal ────────────────────────────────────────────────
function AddModal({ task, setTask, onAdd, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, width: 430, fontFamily: "inherit" }}>
        <h3 style={{ margin: "0 0 18px", color: C.text, fontSize: 15, fontWeight: 700 }}>New Task</h3>
        <SInput label="TITLE" type="text" value={task.title} onChange={e => setTask(t => ({ ...t, title: e.target.value }))} placeholder="What needs to be done?" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <SSelect label="CATEGORY" value={task.cat} options={["Dev", "Design", "Docs", "Research", "DevOps", "Other"]} onChange={e => setTask(t => ({ ...t, cat: e.target.value }))} />
          <SSelect label="PRIORITY" value={task.priority} options={["high", "medium", "low"]} onChange={e => setTask(t => ({ ...t, priority: e.target.value }))} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <SSelect label="STATUS" value={task.status} options={["todo", "in-progress", "blocked"]} onChange={e => setTask(t => ({ ...t, status: e.target.value }))} />
          <SInput label="DUE DATE" type="date" value={task.due} onChange={e => setTask(t => ({ ...t, due: e.target.value }))} />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button onClick={onAdd} style={{ flex: 1, background: C.amber, border: "none", borderRadius: 10, padding: "12px", color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Create Task</button>
          <button onClick={onClose} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px", color: C.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────
export default function TaskMan() {
  const [view, setView] = useState("dashboard");
  const [tasks, setTasks] = useState(INIT_TASKS);
  const [projects] = useState(INIT_PROJECTS);
  const [schedule, setSchedule] = useState(INIT_SCHEDULE);
  const [filter, setFilter] = useState({ status: "all", priority: "all" });
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", cat: "Dev", priority: "medium", status: "todo", due: "", progress: 0, tags: [] });
  const [timerSec, setTimerSec] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [timerMode, setTimerMode] = useState("work");
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTimerSec(s => {
        if (s <= 1) {
          setRunning(false);
          if (timerMode === "work") { setSessions(n => n + 1); setTimerMode("break"); return 5 * 60; }
          setTimerMode("work"); return 25 * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, timerMode]);

  const addTask = () => {
    if (!newTask.title.trim()) return;
    setTasks(p => [{ ...newTask, id: Date.now() }, ...p]);
    setNewTask({ title: "", cat: "Dev", priority: "medium", status: "todo", due: "", progress: 0, tags: [] });
    setShowAdd(false);
  };
  const toggleTask = id => setTasks(p => p.map(t => t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done", progress: t.status === "done" ? 0 : 100 } : t));
  const deleteTask = id => setTasks(p => p.filter(t => t.id !== id));

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === "done").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    overdue: tasks.filter(t => t.due && new Date(t.due) < new Date() && t.status !== "done").length,
  };

  const filteredTasks = tasks.filter(t => {
    if (filter.status !== "all" && t.status !== filter.status) return false;
    if (filter.priority !== "all" && t.priority !== filter.priority) return false;
    return true;
  });

  return (
    <div style={{ fontFamily: "'Courier New', 'Lucida Console', monospace", background: C.bg, minHeight: "100vh", display: "flex", color: C.text }}>
      <Sidebar view={view} setView={setView} stats={stats} />
      <main style={{ flex: 1, padding: "2rem 2.5rem", overflowY: "auto", maxHeight: "100vh" }}>
        {view === "dashboard" && <Dashboard tasks={tasks} stats={stats} schedule={schedule} setShowAdd={setShowAdd} setView={setView} />}
        {view === "tasks" && <TasksView tasks={filteredTasks} filter={filter} setFilter={setFilter} onToggle={toggleTask} onDelete={deleteTask} setShowAdd={setShowAdd} />}
        {view === "schedule" && <ScheduleView schedule={schedule} setSchedule={setSchedule} />}
        {view === "progress" && <ProgressView tasks={tasks} projects={projects} />}
        {view === "timer" && <TimerView timerSec={timerSec} running={running} setRunning={setRunning} mode={timerMode} setMode={setTimerMode} setSec={setTimerSec} sessions={sessions} />}
        {view === "analytics" && <AnalyticsView tasks={tasks} />}
      </main>
      {showAdd && <AddModal task={newTask} setTask={setNewTask} onAdd={addTask} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
