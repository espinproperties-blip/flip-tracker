import { useState, useRef, useEffect } from "react";

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://xlusetknkmwyfwaejiei.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdXNldGtua213eWZ3YWVqaWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MDM4MjAsImV4cCI6MjA5NDk3OTgyMH0.tcqTSADJg19FuuUwFILDcMtFpEjPtfpDvzWcXn4FBZs";
const RECORD_ID = "main";

const headers = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
};

async function loadProjects() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/projects?id=eq.${RECORD_ID}&select=data`, { headers });
    const rows = await res.json();
    if (rows?.length > 0) return rows[0].data;
  } catch (err) {
    console.warn("Load failed:", err);
  }
  return null;
}

async function saveProjects(projects) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
      method: "POST",
      headers: { ...headers, "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify({ id: RECORD_ID, data: projects, updated_at: new Date().toISOString() }),
    });
  } catch (err) {
    console.warn("Save failed:", err);
  }
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:       "#0F0F0F",
  surface:  "#181818",
  card:     "#1E1E1E",
  border:   "#2A2A2A",
  border2:  "#333333",
  text:     "#F0F0F0",
  muted:    "#888888",
  faint:    "#444444",
  // Accent palette — warm slate + vivid accents
  gold:     "#D4A843",
  goldDim:  "#D4A84320",
  green:    "#4CAF7D",
  greenDim: "#4CAF7D20",
  red:      "#E05252",
  redDim:   "#E0525220",
  blue:     "#5B8DEF",
  blueDim:  "#5B8DEF20",
  purple:   "#9B72CF",
  purpleDim:"#9B72CF20",
  teal:     "#3DB8A8",
  tealDim:  "#3DB8A820",
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const PROJECT_TYPES = {
  flip:        { label: "Fix & Flip",       icon: "🏚️", accent: C.gold   },
  newbuild:    { label: "New Construction", icon: "🏗️", accent: C.blue   },
  multifamily: { label: "Multifamiliar",    icon: "🏢", accent: C.purple },
  reno:        { label: "Remodelación",     icon: "🔨", accent: C.teal   },
};

const CATEGORIES_BY_TYPE = {
  flip: {
    materials: { label: "Materiales",      color: C.gold,   icon: "🧱" },
    labor:     { label: "Contract Labor",  color: C.blue,   icon: "👷" },
    holding:   { label: "Holding Costs",   color: C.purple, icon: "🏠" },
    closing:   { label: "Closing / Legal", color: C.teal,   icon: "📋" },
    other:     { label: "Otros",           color: C.muted,  icon: "📦" },
  },
  newbuild: {
    foundation: { label: "Foundation",        color: "#C47B3A", icon: "⛏️" },
    framing:    { label: "Framing",           color: C.gold,    icon: "🪵" },
    mep:        { label: "MEP (Mec/Elec/Plu)",color: C.blue,    icon: "⚡" },
    exterior:   { label: "Exterior",          color: C.teal,    icon: "🪟" },
    interior:   { label: "Interior Finishes", color: C.purple,  icon: "🎨" },
    permits:    { label: "Permits & Fees",    color: C.red,     icon: "📋" },
    labor:      { label: "Contract Labor",    color: C.green,   icon: "👷" },
  },
  multifamily: {
    materials: { label: "Materiales",      color: C.gold,   icon: "🧱" },
    labor:     { label: "Contract Labor",  color: C.blue,   icon: "👷" },
    permits:   { label: "Permits & Legal", color: C.red,    icon: "📋" },
    utilities: { label: "Utilities Setup", color: C.green,  icon: "💡" },
    holding:   { label: "Holding Costs",   color: C.purple, icon: "🏠" },
    other:     { label: "Otros",           color: C.muted,  icon: "📦" },
  },
  reno: {
    materials: { label: "Materiales",     color: C.gold,   icon: "🧱" },
    labor:     { label: "Contract Labor", color: C.blue,   icon: "👷" },
    design:    { label: "Diseño / Arq",   color: "#C47B8A",icon: "📐" },
    permits:   { label: "Permisos",       color: C.red,    icon: "📋" },
    other:     { label: "Otros",          color: C.muted,  icon: "📦" },
  },
};

const DOC_TYPES = {
  contract:  { label: "Contrato", icon: "📝", color: C.blue   },
  permit:    { label: "Permiso",  icon: "🏛️", color: C.green  },
  invoice:   { label: "Factura", icon: "🧾", color: C.gold   },
  insurance: { label: "Seguro",  icon: "🛡️", color: C.purple },
  photo:     { label: "Foto",    icon: "📸", color: C.teal   },
  other:     { label: "Otro",    icon: "📎", color: C.muted  },
};

const STATUS = {
  active:    { label: "Activo",      color: C.green  },
  completed: { label: "Completado",  color: C.blue   },
  sold:      { label: "Vendido",     color: C.purple },
};

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
const pct  = (a, b) => b ? Math.min(Math.round((a / b) * 100), 100) : 0;
const uid  = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const totalSpent = (p) => p.expenses.reduce((s, e) => s + e.amount, 0);

// ─── SAMPLE DATA ──────────────────────────────────────────────────────────────
const SAMPLE = [
  {
    id: "p1", type: "flip", status: "active",
    name: "123 Oak Street", address: "123 Oak St, Miami FL 33101",
    budget: 85000, purchasePrice: 210000, arvEstimate: 380000,
    startDate: "2026-03-01", targetDate: "2026-07-01",
    investors: [{ name: "Carlos M.", share: 40 }, { name: "Rosa V.", share: 35 }],
    expenses: [
      { id: uid(), category: "materials", description: "Lumber & framing",    amount: 4200, date: "2026-04-01", receipt: null },
      { id: uid(), category: "labor",     description: "Plumbing contractor", amount: 6500, date: "2026-04-05", receipt: null },
      { id: uid(), category: "materials", description: "Kitchen cabinets",    amount: 8900, date: "2026-04-10", receipt: null },
      { id: uid(), category: "holding",   description: "Insurance mensual",   amount: 320,  date: "2026-04-15", receipt: null },
      { id: uid(), category: "labor",     description: "Electricista",        amount: 3800, date: "2026-04-18", receipt: null },
    ],
    photos: [], documents: [],
  },
  {
    id: "p2", type: "newbuild", status: "active",
    name: "Sunset Lot Build", address: "450 Sunset Blvd, Orlando FL 32801",
    budget: 220000, purchasePrice: 85000, arvEstimate: 550000,
    startDate: "2026-01-15", targetDate: "2026-12-01",
    investors: [{ name: "Pedro A.", share: 50 }],
    expenses: [
      { id: uid(), category: "foundation", description: "Foundation pour",  amount: 22000, date: "2026-02-01", receipt: null },
      { id: uid(), category: "framing",    description: "Framing crew",     amount: 35000, date: "2026-03-01", receipt: null },
      { id: uid(), category: "permits",    description: "Building permits", amount: 4500,  date: "2026-01-20", receipt: null },
      { id: uid(), category: "mep",        description: "Rough plumbing",   amount: 18000, date: "2026-03-20", receipt: null },
    ],
    photos: [], documents: [],
  },
];

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function Tag({ color, children, small }) {
  return (
    <span style={{ fontSize: small ? 10 : 11, color, background: color + "22", padding: small ? "1px 7px" : "2px 9px", borderRadius: 20, fontWeight: 600, whiteSpace: "nowrap", letterSpacing: 0.2 }}>
      {children}
    </span>
  );
}

function Btn({ onClick, children, variant = "primary", small, full, disabled, danger }) {
  const v = {
    primary: { bg: C.gold,  color: "#0F0F0F" },
    blue:    { bg: C.blue,  color: "#fff"    },
    green:   { bg: C.green, color: "#fff"    },
    ghost:   { bg: C.card,  color: C.muted, border: `1px solid ${C.border2}` },
    danger:  { bg: "#2A1212", color: C.red, border: `1px solid #4A2020` },
  }[danger ? "danger" : variant];
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background: v.bg, border: v.border || "none", borderRadius: small ? 10 : 14, padding: small ? "7px 15px" : "12px 22px", fontSize: small ? 12 : 14, fontWeight: 700, color: v.color, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, width: full ? "100%" : "auto", fontFamily: "'Sora',sans-serif", display: "inline-flex", alignItems: "center", gap: 6, transition: "opacity .15s" }}>
      {children}
    </button>
  );
}

function BudgetRing({ spent, budget, size = 130 }) {
  const r = size * 0.37;
  const circ = 2 * Math.PI * r;
  const p = Math.min(spent / budget, 1);
  const color = p > 0.9 ? C.red : p > 0.7 ? C.gold : C.green;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border2} strokeWidth={11} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={11}
          strokeDasharray={`${circ*p} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: size < 100 ? 14 : 19, fontWeight: 800, color, fontFamily: "'Sora',sans-serif", lineHeight: 1 }}>{pct(spent,budget)}%</div>
        <div style={{ fontSize: 8, color: C.faint, marginTop: 3, letterSpacing: 1 }}>USADO</div>
      </div>
    </div>
  );
}

// ─── MODAL SHELL ─────────────────────────────────────────────────────────────
function Modal({ onClose, title, children, maxWidth = 480 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 22, padding: 24, width: "100%", maxWidth, maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ color: C.text, fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.faint, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── DELETE CONFIRM ───────────────────────────────────────────────────────────
function DeleteConfirm({ title, onCancel, onConfirm }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: C.surface, border: `1.5px solid #4A2020`, borderRadius: 22, padding: 28, maxWidth: 360, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>⚠️</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.text, fontFamily: "'Sora',sans-serif", marginBottom: 10 }}>¿Eliminar Proyecto?</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 6 }}>
          <span style={{ color: C.gold, fontWeight: 700 }}>"{title}"</span> será eliminado permanentemente.
        </div>
        <div style={{ fontSize: 13, color: C.red, fontWeight: 600, marginBottom: 24 }}>Esta acción no se puede deshacer.</div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={onCancel} full variant="ghost">Cancelar</Btn>
          <Btn onClick={onConfirm} full danger>Sí, eliminar</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── COMPLETE CONFIRM ─────────────────────────────────────────────────────────
function CompleteConfirm({ title, onCancel, onConfirm }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: C.surface, border: `1.5px solid #1A3A2A`, borderRadius: 22, padding: 28, maxWidth: 360, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>🏁</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.text, fontFamily: "'Sora',sans-serif", marginBottom: 10 }}>¿Marcar como Completado?</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 24 }}>
          <span style={{ color: C.gold, fontWeight: 700 }}>"{title}"</span> se moverá a la sección de proyectos completados y no aparecerá en la pantalla principal.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={onCancel} full variant="ghost">Cancelar</Btn>
          <Btn onClick={onConfirm} full variant="green">✓ Completar</Btn>
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.3, display: "block", marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

const IS = { width: "100%", padding: "11px 14px", background: C.bg, border: `1px solid ${C.border2}`, borderRadius: 11, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'Sora',sans-serif" };

// ─── NEW PROJECT MODAL ────────────────────────────────────────────────────────
function NewProjectModal({ onClose, onSave }) {
  const [form, setForm] = useState({ type: "flip", name: "", address: "", budget: "", purchasePrice: "", arvEstimate: "", startDate: new Date().toISOString().split("T")[0], targetDate: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name && form.budget && form.purchasePrice;
  return (
    <Modal onClose={onClose} title="🏠 Nuevo Proyecto" maxWidth={520}>
      <Field label="Tipo de Proyecto">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {Object.entries(PROJECT_TYPES).map(([k, t]) => (
            <button key={k} onClick={() => set("type", k)}
              style={{ padding: "11px 12px", border: `1.5px solid ${form.type === k ? t.accent : C.border}`, borderRadius: 12, background: form.type === k ? t.accent + "18" : C.bg, color: form.type === k ? t.accent : C.muted, cursor: "pointer", fontSize: 13, fontWeight: 700, textAlign: "left" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Nombre del Proyecto"><input style={IS} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ej: 123 Oak Street" /></Field>
      <Field label="Dirección"><input style={IS} value={form.address} onChange={e => set("address", e.target.value)} placeholder="Dirección completa" /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Budget Remodelación ($)"><input style={IS} type="number" value={form.budget} onChange={e => set("budget", e.target.value)} placeholder="85000" /></Field>
        <Field label="Precio de Compra ($)"><input style={IS} type="number" value={form.purchasePrice} onChange={e => set("purchasePrice", e.target.value)} placeholder="210000" /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="ARV Estimado ($)"><input style={IS} type="number" value={form.arvEstimate} onChange={e => set("arvEstimate", e.target.value)} placeholder="380000" /></Field>
        <Field label="Fecha Objetivo"><input style={IS} type="date" value={form.targetDate} onChange={e => set("targetDate", e.target.value)} /></Field>
      </div>
      <div style={{ marginTop: 8 }}>
        <Btn full disabled={!valid} variant="primary" onClick={() => valid && onSave({ ...form, id: uid(), status: "active", expenses: [], photos: [], documents: [], investors: [], budget: parseFloat(form.budget)||0, purchasePrice: parseFloat(form.purchasePrice)||0, arvEstimate: parseFloat(form.arvEstimate)||0 })}>
          Crear Proyecto
        </Btn>
      </div>
    </Modal>
  );
}

// ─── EXPENSE MODAL ────────────────────────────────────────────────────────────
function ExpenseModal({ project, onClose, onSave }) {
  const cats = CATEGORIES_BY_TYPE[project.type];
  const [form, setForm] = useState({ category: Object.keys(cats)[0], description: "", amount: "", date: new Date().toISOString().split("T")[0], receipt: null });
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileRef = useRef();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePhoto = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setPreview(dataUrl); setAnalyzing(true);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: dataUrl.split(",")[1],
            mediaType: file.type,
            categories: Object.keys(cats).join(", ")
          })
        });
        const parsed = await res.json();
        setForm(f => ({
          ...f,
          description: parsed.description || f.description,
          amount: parsed.amount ? String(parsed.amount) : f.amount,
          category: (parsed.category && Object.keys(cats).includes(parsed.category)) ? parsed.category : f.category,
          date: parsed.date || f.date,
          receipt: dataUrl
        }));
      } catch { setForm(f => ({ ...f, receipt: dataUrl })); }
      setAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  const valid = form.description && parseFloat(form.amount) > 0;
  return (
    <Modal onClose={onClose} title="💸 Nuevo Gasto">
      <div onClick={() => fileRef.current.click()} style={{ border: `2px dashed ${C.border2}`, borderRadius: 14, padding: 16, textAlign: "center", cursor: "pointer", marginBottom: 18, minHeight: 110, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", background: C.bg }}>
        {preview ? <img src={preview} alt="" style={{ width: "100%", maxHeight: 130, objectFit: "cover", borderRadius: 8 }} /> : <div style={{ color: C.faint }}><div style={{ fontSize: 26 }}>📷</div><div style={{ fontSize: 11, marginTop: 6 }}>Foto de factura — IA extrae los datos</div></div>}
        {analyzing && <div style={{ position: "absolute", inset: 0, background: "rgba(15,15,15,.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}><div style={{ width: 26, height: 26, border: `3px solid ${C.gold}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} /><div style={{ color: C.muted, fontSize: 12 }}>Analizando con IA...</div></div>}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: "none" }} />
      </div>
      <Field label="Categoría">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Object.entries(cats).map(([k, c]) => (
            <button key={k} onClick={() => set("category", k)} style={{ padding: "5px 11px", borderRadius: 18, border: `1px solid ${form.category===k ? c.color : C.border}`, background: form.category===k ? c.color+"20" : "transparent", color: form.category===k ? c.color : C.muted, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Descripción"><input style={IS} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Descripción del gasto..." /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Monto ($)"><input style={IS} type="number" value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="0" /></Field>
        <Field label="Fecha"><input style={IS} type="date" value={form.date} onChange={e => set("date", e.target.value)} /></Field>
      </div>
      <div style={{ marginTop: 6 }}><Btn full disabled={!valid} variant="blue" onClick={() => valid && onSave({ ...form, amount: parseFloat(form.amount), id: uid() })}>Agregar Gasto</Btn></div>
    </Modal>
  );
}

// ─── DOCUMENT MODAL ───────────────────────────────────────────────────────────
function DocumentModal({ onClose, onSave }) {
  const [form, setForm] = useState({ type: "contract", name: "", notes: "", fileData: null, fileName: "", file: null });
  const fileRef = useRef();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, file, fileData: ev.target.result, fileName: file.name, name: f.name || file.name.replace(/\.[^.]+$/, "") }));
    reader.readAsDataURL(file);
  };
  const valid = form.fileData && form.name;
  return (
    <Modal onClose={onClose} title="📎 Subir Documento">
      <div onClick={() => fileRef.current.click()} style={{ border: `2px dashed ${C.border2}`, borderRadius: 14, padding: 20, textAlign: "center", cursor: "pointer", marginBottom: 18, background: C.bg, minHeight: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {form.fileData ? (
          form.file?.type?.startsWith("image/") ? <img src={form.fileData} alt="" style={{ maxHeight: 120, borderRadius: 8, objectFit: "cover" }} />
          : <div style={{ color: C.muted }}><div style={{ fontSize: 34 }}>📄</div><div style={{ fontSize: 13, marginTop: 6 }}>{form.fileName}</div></div>
        ) : <div style={{ color: C.faint }}><div style={{ fontSize: 30 }}>📁</div><div style={{ fontSize: 12, marginTop: 6 }}>Subir archivo (PDF, imagen, doc...)</div></div>}
        <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleFile} style={{ display: "none" }} />
      </div>
      <Field label="Tipo de Documento">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Object.entries(DOC_TYPES).map(([k, d]) => (
            <button key={k} onClick={() => set("type", k)} style={{ padding: "5px 11px", borderRadius: 18, border: `1px solid ${form.type===k ? d.color : C.border}`, background: form.type===k ? d.color+"20" : "transparent", color: form.type===k ? d.color : C.muted, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
              {d.icon} {d.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Nombre"><input style={IS} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ej: Contrato con plomero" /></Field>
      <Field label="Notas (opcional)"><input style={IS} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Descripción adicional..." /></Field>
      <div style={{ marginTop: 6 }}><Btn full disabled={!valid} variant="green" onClick={() => valid && onSave({ ...form, id: uid(), date: new Date().toLocaleDateString(), size: form.file ? (form.file.size/1024).toFixed(0)+" KB" : "" })}>Guardar Documento</Btn></div>
    </Modal>
  );
}

// ─── PHOTO MODAL ──────────────────────────────────────────────────────────────
function PhotoModal({ onClose, onSave }) {
  const [photo, setPhoto] = useState(null);
  const [caption, setCaption] = useState("");
  const fileRef = useRef();
  const handleFile = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setPhoto(ev.target.result); r.readAsDataURL(f); };
  return (
    <Modal onClose={onClose} title="📸 Foto del Avance">
      <div onClick={() => fileRef.current.click()} style={{ border: `2px dashed ${C.border2}`, borderRadius: 14, overflow: "hidden", cursor: "pointer", minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, background: C.bg }}>
        {photo ? <img src={photo} alt="" style={{ width: "100%", maxHeight: 220, objectFit: "cover" }} /> : <div style={{ color: C.faint, textAlign: "center" }}><div style={{ fontSize: 30 }}>📷</div><div style={{ fontSize: 12 }}>Tomar foto del avance</div></div>}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
      </div>
      <Field label="Descripción del avance"><input style={IS} value={caption} onChange={e => setCaption(e.target.value)} placeholder="Ej: Drywall completado" /></Field>
      <Btn full disabled={!photo} variant="green" onClick={() => photo && onSave({ photo, caption, date: new Date().toLocaleDateString(), id: uid() })}>Guardar Foto</Btn>
    </Modal>
  );
}

// ─── INVESTOR VIEW ────────────────────────────────────────────────────────────
function InvestorView({ project, onClose }) {
  const cats = CATEGORIES_BY_TYPE[project.type];
  const spent = totalSpent(project);
  const remaining = project.budget - spent;
  const pType = PROJECT_TYPES[project.type];
  const byCat = Object.entries(cats).map(([k,c]) => ({ key:k,...c, total: project.expenses.filter(e=>e.category===k).reduce((s,e)=>s+e.amount,0) })).filter(c=>c.total>0);
  return (
    <Modal onClose={onClose} title={`👥 Vista Inversor`} maxWidth={560}>
      <div style={{ background: C.bg, borderRadius: 14, padding: 18, marginBottom: 18, textAlign: "center" }}>
        <Tag color={pType.accent}>{pType.icon} {pType.label}</Tag>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, fontFamily:"'Sora',sans-serif", marginTop: 8 }}>{project.name}</div>
        <div style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>{project.address}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
        {[["Budget", fmt(project.budget), C.muted],["Gastado", fmt(spent), C.gold],["Disponible", fmt(remaining), remaining>=0?C.green:C.red]].map(([l,v,color]) => (
          <div key={l} style={{ background: C.bg, borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 9, color: C.faint, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color, fontFamily:"'Sora',sans-serif" }}>{v}</div>
          </div>
        ))}
      </div>
      {byCat.map(cat => (
        <div key={cat.key} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: C.text, fontSize: 13 }}>{cat.icon} {cat.label}</span>
            <span style={{ color: cat.color, fontSize: 13, fontWeight: 700 }}>{fmt(cat.total)}</span>
          </div>
          <div style={{ background: C.border, borderRadius: 4, height: 4 }}>
            <div style={{ height:"100%", width:`${(cat.total/spent)*100}%`, background: cat.color, borderRadius: 4 }} />
          </div>
        </div>
      ))}
      {project.photos.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Avances del Proyecto</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
            {project.photos.map(p => <img key={p.id} src={p.photo} alt="" style={{ width:"100%", aspectRatio:"1", objectFit:"cover", borderRadius: 10 }} />)}
          </div>
        </div>
      )}
      {project.arvEstimate > 0 && (
        <div style={{ background: "#0A1F14", border: `1px solid #1A3A24`, borderRadius: 14, padding: 16, marginTop: 16 }}>
          <div style={{ fontSize: 10, color: C.green, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>💰 Profit Projection</div>
          {[["Purchase Price", fmt(project.purchasePrice)],["Budget Reno", fmt(project.budget)],["ARV Estimado", fmt(project.arvEstimate)],["Profit Potencial", fmt(project.arvEstimate-project.purchasePrice-project.budget)]].map(([l,v],i) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom: i<3?`1px solid #1A3A24`:"none" }}>
              <span style={{ color: C.muted, fontSize: 13 }}>{l}</span>
              <span style={{ color: i===3?C.green:C.text, fontWeight: 700, fontSize: 13 }}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ─── PROJECT CARD (home) ──────────────────────────────────────────────────────
function ProjectCard({ project, onClick }) {
  const spent = totalSpent(project);
  const remaining = project.budget - spent;
  const pType = PROJECT_TYPES[project.type];
  const statusInfo = STATUS[project.status] || STATUS.active;
  return (
    <div onClick={onClick} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 18, cursor: "pointer", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: pType.accent }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 7, flexWrap: "wrap" }}>
            <Tag color={pType.accent}>{pType.icon} {pType.label}</Tag>
            <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.text, fontFamily:"'Sora',sans-serif", lineHeight: 1.2, marginBottom: 2 }}>{project.name}</div>
          <div style={{ fontSize: 12, color: C.faint }}>{project.address}</div>
        </div>
        <BudgetRing spent={spent} budget={project.budget} size={68} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        {[["Budget", fmt(project.budget), C.muted],["Gastado", fmt(spent), C.gold],["Disponible", fmt(remaining), remaining>=0?C.green:C.red]].map(([l,v,color]) => (
          <div key={l} style={{ background: C.surface, borderRadius: 10, padding: "9px 10px" }}>
            <div style={{ fontSize: 9, color: C.faint, textTransform:"uppercase", letterSpacing:.8 }}>{l}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color, fontFamily:"'Sora',sans-serif", marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14, color: C.faint, fontSize: 11 }}>
        <span>💸 {project.expenses.length} gastos</span>
        <span>📸 {project.photos.length} fotos</span>
        <span>📎 {project.documents.length} docs</span>
      </div>
    </div>
  );
}

// ─── PROJECT DETAIL ───────────────────────────────────────────────────────────
function ProjectDetail({ project, onBack, onUpdate, onDelete, onComplete }) {
  const [tab, setTab] = useState("dashboard");
  const [showExpense, setShowExpense] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showDoc, setShowDoc] = useState(false);
  const [showInvestor, setShowInvestor] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [filterDoc, setFilterDoc] = useState("all");
  const [viewDoc, setViewDoc] = useState(null);
  const [settings, setSettings] = useState({ ...project });

  const cats = CATEGORIES_BY_TYPE[project.type];
  const pType = PROJECT_TYPES[project.type];
  const spent = totalSpent(project);
  const remaining = project.budget - spent;

  const addExpense = (exp) => { onUpdate({ ...project, expenses: [exp, ...project.expenses] }); setShowExpense(false); };
  const addPhoto   = (ph)  => { onUpdate({ ...project, photos:   [ph,  ...project.photos]   }); setShowPhoto(false);   };
  const addDoc     = (doc) => { onUpdate({ ...project, documents:[doc, ...project.documents] }); setShowDoc(false);     };
  const delExpense = (id)  => onUpdate({ ...project, expenses: project.expenses.filter(e => e.id !== id) });
  const delDoc     = (id)  => onUpdate({ ...project, documents: project.documents.filter(d => d.id !== id) });
  const saveSettings = () => onUpdate({ ...project, ...settings, budget: parseFloat(settings.budget)||0, purchasePrice: parseFloat(settings.purchasePrice)||0, arvEstimate: parseFloat(settings.arvEstimate)||0 });

  const filteredExpenses = filterCat === "all" ? project.expenses : project.expenses.filter(e => e.category === filterCat);
  const filteredDocs     = filterDoc === "all" ? project.documents : project.documents.filter(d => d.type === filterDoc);

  const isCompleted = project.status === "completed";

  const tabs = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "expenses",  icon: "💸", label: "Gastos"    },
    { id: "docs",      icon: "📎", label: "Docs"      },
    { id: "photos",    icon: "📸", label: "Fotos"     },
    { id: "settings",  icon: "⚙️", label: "Ajustes"  },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "14px 18px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={onBack} style={{ background: C.card, border: "none", borderRadius: 10, padding: "7px 12px", color: C.muted, cursor: "pointer", fontSize: 16 }}>←</button>
            <div>
              <div style={{ fontSize: 9, color: pType.accent, textTransform:"uppercase", letterSpacing: 2 }}>{pType.icon} {pType.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.text, fontFamily:"'Sora',sans-serif", lineHeight: 1.1 }}>{project.name}</div>
            </div>
          </div>
          <button onClick={() => setShowInvestor(true)} style={{ padding: "7px 13px", background: C.card, border: `1px solid ${C.border2}`, borderRadius: 18, color: C.muted, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
            👥 Inversor
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 0 88px" }}>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div style={{ padding: "18px 18px 0" }}>
            {/* Hero */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 20, position: "relative", overflow: "hidden", marginBottom: 14 }}>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 20% 0%,${pType.accent}10,transparent 60%)` }} />
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <BudgetRing spent={spent} budget={project.budget} size={116} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: C.faint, textTransform:"uppercase", letterSpacing: 1.5 }}>Disponible</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: remaining>=0?C.green:C.red, fontFamily:"'Sora',sans-serif", lineHeight: 1 }}>{fmt(Math.abs(remaining))}</div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{remaining<0?"⚠️ OVER BUDGET":`de ${fmt(project.budget)}`}</div>
                  <div style={{ display:"flex", gap: 14, marginTop: 12 }}>
                    <div><div style={{ fontSize: 9, color: C.faint }}>GASTADO</div><div style={{ fontSize: 15, fontWeight: 700, color: C.gold, fontFamily:"'Sora',sans-serif" }}>{fmt(spent)}</div></div>
                    {project.arvEstimate>0 && <div><div style={{ fontSize: 9, color: C.faint }}>PROFIT EST.</div><div style={{ fontSize: 15, fontWeight: 700, color: C.green, fontFamily:"'Sora',sans-serif" }}>{fmt(project.arvEstimate-project.purchasePrice-project.budget)}</div></div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div style={{ fontSize: 10, color: C.faint, textTransform:"uppercase", letterSpacing: 1.5, marginBottom: 10, paddingLeft: 2 }}>Breakdown por Categoría</div>
            {Object.entries(cats).map(([k, cat]) => {
              const catTotal = project.expenses.filter(e=>e.category===k).reduce((s,e)=>s+e.amount,0);
              if (!catTotal) return null;
              return (
                <div key={k} style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius: 14, padding: "13px 15px", marginBottom: 8, display:"flex", alignItems:"center", gap: 12 }}>
                  <div style={{ width:40, height:40, borderRadius:11, background: cat.color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, flexShrink:0 }}>{cat.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom: 5 }}>
                      <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{cat.label}</span>
                      <span style={{ color: cat.color, fontWeight: 800, fontSize: 14, fontFamily:"monospace" }}>{fmt(catTotal)}</span>
                    </div>
                    <div style={{ background: C.border, borderRadius: 4, height: 4 }}>
                      <div style={{ height:"100%", width:`${(catTotal/project.budget)*100}%`, background: cat.color, borderRadius: 4 }} />
                    </div>
                    <div style={{ color: C.faint, fontSize: 10, marginTop: 3 }}>{pct(catTotal,project.budget)}% del budget · {project.expenses.filter(e=>e.category===k).length} gastos</div>
                  </div>
                </div>
              );
            })}

            {/* Profit box */}
            {project.arvEstimate > 0 && (
              <div style={{ background:"#0A1A0F", border:`1px solid #1A3A24`, borderRadius:16, padding:18, marginTop:8 }}>
                <div style={{ fontSize:10, color:C.green, textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>💰 Profit Projection</div>
                {[["Purchase Price",fmt(project.purchasePrice),C.muted],["Budget Reno",fmt(project.budget),C.muted],["ARV Estimado",fmt(project.arvEstimate),C.green],["Profit Potencial",fmt(project.arvEstimate-project.purchasePrice-project.budget),C.green]].map(([l,v,color],i) => (
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:i<3?`1px solid #1A3A24`:"none" }}>
                    <span style={{ color:C.muted, fontSize:13 }}>{l}</span>
                    <span style={{ color, fontSize:14, fontWeight:700, fontFamily:"monospace" }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EXPENSES */}
        {tab === "expenses" && (
          <div style={{ padding: 18 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ color:C.muted, fontSize:13 }}>Total: <span style={{ color:C.gold, fontWeight:700 }}>{fmt(filteredExpenses.reduce((s,e)=>s+e.amount,0))}</span></div>
              <Btn onClick={() => setShowExpense(true)} variant="blue" small>+ Gasto</Btn>
            </div>
            <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:10, marginBottom:12 }}>
              <button onClick={() => setFilterCat("all")} style={{ padding:"5px 12px", borderRadius:18, border:`1px solid ${filterCat==="all"?C.blue:C.border}`, background:filterCat==="all"?C.blueDim:"transparent", color:filterCat==="all"?C.blue:C.muted, fontSize:11, cursor:"pointer", whiteSpace:"nowrap", fontWeight:600 }}>Todos ({project.expenses.length})</button>
              {Object.entries(cats).map(([k,c]) => { const count=project.expenses.filter(e=>e.category===k).length; return count>0?(<button key={k} onClick={()=>setFilterCat(k)} style={{ padding:"5px 12px", borderRadius:18, border:`1px solid ${filterCat===k?c.color:C.border}`, background:filterCat===k?c.color+"18":"transparent", color:filterCat===k?c.color:C.muted, fontSize:11, cursor:"pointer", whiteSpace:"nowrap" }}>{c.icon} {c.label} ({count})</button>):null; })}
            </div>
            {filteredExpenses.length === 0
              ? <div style={{ textAlign:"center", padding:"50px 20px", color:C.faint }}><div style={{ fontSize:36 }}>💸</div><div style={{ marginTop:10 }}>Sin gastos aún</div></div>
              : filteredExpenses.map(exp => {
                  const cat = cats[exp.category]||{icon:"📦",color:C.muted,label:exp.category};
                  return (
                    <div key={exp.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:13, marginBottom:8, display:"flex", gap:11, alignItems:"flex-start" }}>
                      {exp.receipt ? <img src={exp.receipt} alt="" style={{ width:44,height:44,objectFit:"cover",borderRadius:10,flexShrink:0 }}/> : <div style={{ width:44,height:44,borderRadius:10,background:cat.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0 }}>{cat.icon}</div>}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                          <div style={{ color:C.text, fontSize:14, fontWeight:600 }}>{exp.description}</div>
                          <div style={{ color:cat.color, fontWeight:800, fontSize:14, fontFamily:"monospace", flexShrink:0, marginLeft:8 }}>{fmt(exp.amount)}</div>
                        </div>
                        <div style={{ display:"flex", gap:6, marginTop:5, flexWrap:"wrap", alignItems:"center" }}>
                          <Tag color={cat.color}>{cat.label}</Tag>
                          <span style={{ fontSize:11, color:C.faint }}>{exp.date}</span>
                          <button onClick={()=>delExpense(exp.id)} style={{ marginLeft:"auto", background:"none", border:"none", color:C.faint, cursor:"pointer", fontSize:14 }}>🗑</button>
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}

        {/* DOCS */}
        {tab === "docs" && (
          <div style={{ padding: 18 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ color:C.muted, fontSize:13 }}>{project.documents.length} documentos</div>
              <Btn onClick={() => setShowDoc(true)} variant="green" small>+ Documento</Btn>
            </div>
            <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:10, marginBottom:12 }}>
              <button onClick={()=>setFilterDoc("all")} style={{ padding:"5px 12px",borderRadius:18,border:`1px solid ${filterDoc==="all"?C.green:C.border}`,background:filterDoc==="all"?C.greenDim:"transparent",color:filterDoc==="all"?C.green:C.muted,fontSize:11,cursor:"pointer",whiteSpace:"nowrap",fontWeight:600 }}>Todos</button>
              {Object.entries(DOC_TYPES).map(([k,d]) => { const count=project.documents.filter(doc=>doc.type===k).length; return count>0?(<button key={k} onClick={()=>setFilterDoc(k)} style={{ padding:"5px 12px",borderRadius:18,border:`1px solid ${filterDoc===k?d.color:C.border}`,background:filterDoc===k?d.color+"18":"transparent",color:filterDoc===k?d.color:C.muted,fontSize:11,cursor:"pointer",whiteSpace:"nowrap" }}>{d.icon} {d.label} ({count})</button>):null; })}
            </div>
            {filteredDocs.length === 0
              ? <div style={{ textAlign:"center", padding:"50px 20px", color:C.faint }}><div style={{ fontSize:36 }}>📁</div><div style={{ marginTop:10, fontSize:14 }}>Sube contratos, permisos, seguros</div></div>
              : filteredDocs.map(doc => {
                  const dtype = DOC_TYPES[doc.type];
                  const isImage = doc.fileData?.startsWith("data:image");
                  return (
                    <div key={doc.id} style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:13,marginBottom:8,display:"flex",gap:11,alignItems:"center" }}>
                      {isImage ? <img src={doc.fileData} alt="" style={{ width:46,height:46,borderRadius:10,objectFit:"cover",flexShrink:0,cursor:"pointer" }} onClick={()=>setViewDoc(doc)}/> : <div style={{ width:46,height:46,borderRadius:10,background:dtype.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,flexShrink:0,cursor:"pointer" }} onClick={()=>setViewDoc(doc)}>{dtype.icon}</div>}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ color:C.text,fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{doc.name}</div>
                        <div style={{ display:"flex",gap:6,marginTop:4,flexWrap:"wrap",alignItems:"center" }}>
                          <Tag color={dtype.color}>{dtype.icon} {dtype.label}</Tag>
                          <span style={{ fontSize:11,color:C.faint }}>{doc.date}</span>
                          {doc.size && <span style={{ fontSize:11,color:C.faint }}>{doc.size}</span>}
                        </div>
                        {doc.notes && <div style={{ fontSize:11,color:C.muted,marginTop:3 }}>{doc.notes}</div>}
                      </div>
                      <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                        <button onClick={()=>setViewDoc(doc)} style={{ background:C.card,border:"none",borderRadius:8,padding:"5px 10px",color:C.muted,cursor:"pointer",fontSize:11 }}>Ver</button>
                        <button onClick={()=>delDoc(doc.id)} style={{ background:"none",border:"none",color:C.faint,cursor:"pointer",fontSize:13 }}>🗑</button>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}

        {/* PHOTOS */}
        {tab === "photos" && (
          <div style={{ padding: 18 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ color:C.muted, fontSize:13 }}>{project.photos.length} fotos</div>
              <Btn onClick={() => setShowPhoto(true)} variant="green" small>+ Foto</Btn>
            </div>
            {project.photos.length === 0
              ? <div style={{ textAlign:"center", padding:"50px 20px", color:C.faint }}><div style={{ fontSize:36 }}>📸</div><div style={{ marginTop:10 }}>Documenta el avance</div></div>
              : <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {project.photos.map(p => (
                    <div key={p.id} style={{ background:C.surface, borderRadius:14, overflow:"hidden" }}>
                      <img src={p.photo} alt="" style={{ width:"100%", aspectRatio:"4/3", objectFit:"cover", display:"block" }} />
                      {p.caption && <div style={{ padding:"7px 11px", color:C.muted, fontSize:11 }}>{p.caption}</div>}
                      <div style={{ padding:"0 11px 9px", color:C.faint, fontSize:10 }}>{p.date}</div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}

        {/* ─── SETTINGS TAB ─────────────────────────────────────────── */}
        {tab === "settings" && (
          <div style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily:"'Sora',sans-serif", marginBottom: 16 }}>Información del Proyecto</div>

            <Field label="Nombre del Proyecto"><input style={IS} value={settings.name} onChange={e => setSettings(s=>({...s,name:e.target.value}))} /></Field>
            <Field label="Dirección"><input style={IS} value={settings.address} onChange={e => setSettings(s=>({...s,address:e.target.value}))} /></Field>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label="Budget ($)"><input style={IS} type="number" value={settings.budget} onChange={e => setSettings(s=>({...s,budget:e.target.value}))} /></Field>
              <Field label="Precio Compra ($)"><input style={IS} type="number" value={settings.purchasePrice} onChange={e => setSettings(s=>({...s,purchasePrice:e.target.value}))} /></Field>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label="ARV Estimado ($)"><input style={IS} type="number" value={settings.arvEstimate} onChange={e => setSettings(s=>({...s,arvEstimate:e.target.value}))} /></Field>
              <Field label="Fecha Objetivo"><input style={IS} type="date" value={settings.targetDate} onChange={e => setSettings(s=>({...s,targetDate:e.target.value}))} /></Field>
            </div>

            <Btn full variant="primary" onClick={saveSettings}>Guardar Cambios</Btn>

            {/* Divider */}
            <div style={{ borderTop:`1px solid ${C.border}`, margin:"28px 0 20px" }} />

            {/* Status actions */}
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily:"'Sora',sans-serif", marginBottom: 14 }}>Estado del Proyecto</div>

            {!isCompleted ? (
              <div style={{ background:"#0A1A0F", border:`1px solid #1A3A24`, borderRadius:14, padding:16, marginBottom:14 }}>
                <div style={{ fontSize:13, color:C.green, fontWeight:600, marginBottom:6 }}>🏁 Marcar como Completado</div>
                <div style={{ fontSize:12, color:C.muted, marginBottom:14, lineHeight:1.6 }}>El proyecto se moverá a la sección de Completados y dejará de aparecer en la lista principal.</div>
                <Btn full variant="green" onClick={() => setShowCompleteConfirm(true)}>Marcar Completado</Btn>
              </div>
            ) : (
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:16, marginBottom:14, display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontSize:28 }}>✅</div>
                <div>
                  <div style={{ fontSize:13, color:C.green, fontWeight:700 }}>Proyecto Completado</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>Este proyecto está en la sección de completados</div>
                </div>
              </div>
            )}

            {/* Delete */}
            <div style={{ background:"#1A0A0A", border:`1px solid #3A1A1A`, borderRadius:14, padding:16 }}>
              <div style={{ fontSize:13, color:C.red, fontWeight:600, marginBottom:6 }}>🗑️ Eliminar Proyecto</div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:14, lineHeight:1.6 }}>Esta acción eliminará permanentemente el proyecto con todos sus gastos, fotos y documentos. No se puede deshacer.</div>
              <Btn full danger onClick={() => setShowDeleteConfirm(true)}>Eliminar Proyecto</Btn>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:C.surface, borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-around", padding:"9px 0 14px", zIndex:50 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ background:"none", border:"none", color:tab===t.id?pType.accent:C.faint, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"3px 12px" }}>
            <span style={{ fontSize:19 }}>{t.icon}</span>
            <span style={{ fontSize:9, fontWeight:tab===t.id?700:400, letterSpacing:.4 }}>{t.label}</span>
          </button>
        ))}
      </div>

      {showExpense  && <ExpenseModal project={project} onClose={() => setShowExpense(false)} onSave={addExpense} />}
      {showPhoto    && <PhotoModal onClose={() => setShowPhoto(false)} onSave={addPhoto} />}
      {showDoc      && <DocumentModal onClose={() => setShowDoc(false)} onSave={addDoc} />}
      {showInvestor && <InvestorView project={project} onClose={() => setShowInvestor(false)} />}

      {showDeleteConfirm && (
        <DeleteConfirm title={project.name} onCancel={() => setShowDeleteConfirm(false)} onConfirm={() => { setShowDeleteConfirm(false); onDelete(project.id); }} />
      )}
      {showCompleteConfirm && (
        <CompleteConfirm title={project.name} onCancel={() => setShowCompleteConfirm(false)} onConfirm={() => { setShowCompleteConfirm(false); onComplete(project.id); }} />
      )}

      {/* Doc viewer */}
      {viewDoc && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.95)", zIndex:300, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", width:"100%", maxWidth:600, marginBottom:12 }}>
            <div style={{ color:C.text, fontWeight:700 }}>{viewDoc.name}</div>
            <button onClick={() => setViewDoc(null)} style={{ background:"none", border:"none", color:C.text, fontSize:22, cursor:"pointer" }}>✕</button>
          </div>
          {viewDoc.fileData?.startsWith("data:image") ? (
            <img src={viewDoc.fileData} alt="" style={{ maxWidth:"100%", maxHeight:"75vh", borderRadius:12, objectFit:"contain" }} />
          ) : viewDoc.fileData?.includes("application/pdf") ? (
            <iframe src={viewDoc.fileData} style={{ width:"100%", maxWidth:600, height:"70vh", borderRadius:12, border:"none" }} />
          ) : (
            <div style={{ color:C.muted, textAlign:"center", padding:40 }}>
              <div style={{ fontSize:48 }}>{DOC_TYPES[viewDoc.type]?.icon}</div>
              <div style={{ marginTop:12 }}>{viewDoc.fileName}</div>
              <a href={viewDoc.fileData} download={viewDoc.fileName} style={{ display:"inline-block", marginTop:16, padding:"10px 24px", background:C.blue, borderRadius:12, color:"#fff", textDecoration:"none", fontWeight:600 }}>Descargar</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
export default function App() {
  const [projects, setProjects] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew]   = useState(false);
  const [view, setView]         = useState("active");
  const [saved, setSaved]       = useState(false);

  // Load on mount
  useEffect(() => {
    loadProjects().then(data => setProjects(data ?? SAMPLE));
  }, []);

  // Auto-save whenever projects change
  useEffect(() => {
    if (projects === null) return;
    saveProjects(projects).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    });
  }, [projects]);

  const updateProject = (updated) => {
    setProjects(ps => ps.map(p => p.id === updated.id ? updated : p));
    setSelected(updated);
  };

  const addProject = (p) => { setProjects(ps => [p, ...ps]); setShowNew(false); setSelected(p); };

  const deleteProject = (id) => { setProjects(ps => ps.filter(p => p.id !== id)); setSelected(null); };

  const completeProject = (id) => {
    setProjects(ps => ps.map(p => p.id === id ? { ...p, status: "completed" } : p));
    const updated = projects.find(p => p.id === id);
    if (updated) setSelected({ ...updated, status: "completed" });
  };

  // Loading screen
  if (projects === null) {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
        <div style={{ width:36, height:36, border:`3px solid ${C.gold}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }} />
        <div style={{ color:C.muted, fontSize:13 }}>Cargando proyectos...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (selected) {
    return (
      <ProjectDetail
        project={selected}
        onBack={() => setSelected(null)}
        onUpdate={updateProject}
        onDelete={deleteProject}
        onComplete={completeProject}
      />
    );
  }

  const activeProjects    = projects.filter(p => p.status !== "completed");
  const completedProjects = projects.filter(p => p.status === "completed");
  const displayed = view === "active" ? activeProjects : completedProjects;

  const totalBudget    = activeProjects.reduce((s,p) => s + p.budget, 0);
  const totalSpentAll  = activeProjects.reduce((s,p) => s + totalSpent(p), 0);
  const totalProfit    = completedProjects.reduce((s,p) => s + (p.arvEstimate - p.purchasePrice - p.budget), 0);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:${C.bg}; } ::-webkit-scrollbar-thumb { background:${C.border2}; border-radius:2px; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadein { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
        input[type=date]::-webkit-calendar-picker-indicator { filter:invert(0.4); }
      `}</style>

      {/* Header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"16px 18px", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:720, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <img src="/logo.png" alt="Logo" style={{ width:42, height:42, borderRadius:10, objectFit:"cover" }} />
            <div>
              <div style={{ fontSize:9, color:C.gold, textTransform:"uppercase", letterSpacing:3, fontFamily:"monospace" }}>PROJECT HQ</div>
              <div style={{ fontSize:21, fontWeight:800, color:C.text, fontFamily:"'Sora',sans-serif" }}>Mis Proyectos</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {saved && <span style={{ fontSize:11, color:C.green, fontWeight:600, animation:"fadein .3s ease" }}>✓ Guardado</span>}
            <Btn onClick={() => setShowNew(true)} variant="primary" small>+ Nuevo</Btn>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"18px 18px 40px" }}>

        {/* Portfolio Stats */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, padding:18, marginBottom:18 }}>
          <div style={{ fontSize:9, color:C.faint, textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>Portfolio Overview</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {[
              ["Activos",       activeProjects.length,  C.gold  ],
              ["Total Budget",  fmt(totalBudget),        C.blue  ],
              ["Total Gastado", fmt(totalSpentAll),      C.red   ],
            ].map(([l,v,color]) => (
              <div key={l} style={{ background:C.bg, borderRadius:11, padding:"11px 12px" }}>
                <div style={{ fontSize:9, color:C.faint, textTransform:"uppercase", letterSpacing:.8, marginBottom:4 }}>{l}</div>
                <div style={{ fontSize:typeof v==="number"?26:14, fontWeight:800, color, fontFamily:"'Sora',sans-serif" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Active / Completed toggle */}
        <div style={{ display:"flex", background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:4, marginBottom:16, gap:4 }}>
          {[["active","🟢 Activos", activeProjects.length],["completed","✅ Completados", completedProjects.length]].map(([k,l,count]) => (
            <button key={k} onClick={() => setView(k)}
              style={{ flex:1, padding:"9px", borderRadius:11, border:"none", background:view===k?C.card:"transparent", color:view===k?C.text:C.muted, fontSize:13, fontWeight:view===k?700:500, cursor:"pointer", transition:"all .2s" }}>
              {l} <span style={{ fontSize:11, color:view===k?C.gold:C.faint }}>({count})</span>
            </button>
          ))}
        </div>

        {/* Completed bonus stats */}
        {view === "completed" && completedProjects.length > 0 && (
          <div style={{ background:"#0A1A0F", border:`1px solid #1A3A24`, borderRadius:14, padding:14, marginBottom:14, display:"flex", gap:14, alignItems:"center" }}>
            <div style={{ fontSize:28 }}>🏆</div>
            <div>
              <div style={{ fontSize:11, color:C.green, fontWeight:700 }}>{completedProjects.length} proyecto{completedProjects.length>1?"s":""} completado{completedProjects.length>1?"s":""}</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>Profit total estimado: <span style={{ color:C.green, fontWeight:700 }}>{fmt(totalProfit)}</span></div>
            </div>
          </div>
        )}

        {/* Cards */}
        {displayed.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", color:C.faint }}>
            <div style={{ fontSize:44, marginBottom:12 }}>{view==="active"?"🏠":"✅"}</div>
            <div style={{ fontSize:15, color:C.muted }}>{view==="active"?"No hay proyectos activos":"No hay proyectos completados aún"}</div>
            {view==="active" && <div style={{ marginTop:20 }}><Btn onClick={() => setShowNew(true)} variant="primary">+ Crear Primer Proyecto</Btn></div>}
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {displayed.map(p => <ProjectCard key={p.id} project={p} onClick={() => setSelected(p)} />)}
          </div>
        )}
      </div>

      {showNew && <NewProjectModal onClose={() => setShowNew(false)} onSave={addProject} />}
    </div>
  );
}
