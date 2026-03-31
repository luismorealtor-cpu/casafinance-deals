import { useState, useEffect, useCallback, useMemo } from "react";

// ─── SUPABASE CONFIG ───
const SUPABASE_URL = "https://hekxuqpoopvztttqybdj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhla3h1cXBvb3B2enR0dHF5YmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTkxNTAsImV4cCI6MjA5MDQ3NTE1MH0.VXcxc1q0S52Vx_oPIp9Oql-6VWDzwD2SFNlFsVhZg1M";

const sb = {
  headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" },
  async get(table, query = "") {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers: this.headers });
    return r.ok ? await r.json() : [];
  },
  async post(table, data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method: "POST", headers: this.headers, body: JSON.stringify(data) });
    return r.ok ? await r.json() : null;
  },
  async patch(table, id, data) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method: "PATCH", headers: this.headers, body: JSON.stringify(data) });
    return r.ok ? await r.json() : null;
  },
  async del(table, id) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method: "DELETE", headers: this.headers });
    return r.ok;
  }
};

// ─── CONSTANTS ───
const FONT = `'Outfit', sans-serif`;
const MONO = `'Space Mono', monospace`;
const C = {
  bg: "#FFFFFF", surface: "#F8FAFB", card: "#FFFFFF", cardHover: "#F3F6F8",
  border: "#E5E9EF", borderHi: "#D0D7E0",
  text: "#111827", sub: "#6B7280", muted: "#9CA3AF",
  accent: "#059669", accentLight: "#ECFDF5", accentMed: "rgba(5,150,105,0.15)", accentGlow: "rgba(5,150,105,0.25)",
  red: "#EF4444", redLight: "#FEF2F2",
  amber: "#D97706", amberLight: "#FFFBEB",
  sky: "#0284C7", skyLight: "#F0F9FF",
  violet: "#7C3AED", violetLight: "#F5F3FF",
};
const PHOTOS = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1564013799919-ab600027fde2?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=600&h=400&fit=crop",
];
const ADMIN_CREDS = { email: "admin@casafinance.com", password: "CasaDeals2026!!!" };
const fmt = (n) => "$" + Math.round(n).toLocaleString();
const pct = (n) => (n * 100).toFixed(1) + "%";

function calcLoan(d, lp) {
  const totalCost = (+d.price || 0) + (+d.rehab || 0);
  const ltcAmount = totalCost * 0.90;
  const arvAmount = (+d.arv || 0) * (lp.maxARV || 0.70);
  const autoLoan = Math.min(ltcAmount, arvAmount);
  const loanAmt = d.max_loan && d.max_loan > 0 ? d.max_loan : autoLoan;
  const ltv = d.price > 0 ? loanAmt / d.price : 0;
  const ltArv = d.arv > 0 ? loanAmt / d.arv : 0;
  const ltc = totalCost > 0 ? loanAmt / totalCost : 0;
  return { loanAmt, ltv, ltArv, ltc, ltcAmount, arvAmount };
}

// ─── Components ───
const Tag = ({ color, bg, children, style: sx }) => (
  <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 600, color, background: bg, borderRadius: 20, padding: "4px 10px", whiteSpace: "nowrap", letterSpacing: 0.2, ...sx }}>{children}</span>
);
const Stat = ({ label, value, color, big }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <span style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
    <span style={{ fontSize: big ? 20 : 15, fontWeight: 700, fontFamily: MONO, letterSpacing: -0.5, color: color || C.text }}>{value}</span>
  </div>
);
const Input = ({ label, value, onChange, error, placeholder, type = "text", small, onKeyDown }) => (
  <div style={{ flex: 1, minWidth: small ? 80 : 140 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 6, display: "block" }}>{label}</label>}
    <input style={{ width: "100%", padding: small ? "9px 12px" : "12px 16px", borderRadius: 10, border: `1.5px solid ${error ? C.red : C.border}`, background: C.surface, color: C.text, fontFamily: FONT, fontSize: 14, outline: "none", boxSizing: "border-box" }}
      placeholder={placeholder} type={type} value={value} onChange={e => onChange(e.target.value)} onKeyDown={onKeyDown} />
    {error && <div style={{ fontSize: 11, color: C.red, marginTop: 4, fontWeight: 500 }}>{error}</div>}
  </div>
);
const Btn = ({ children, primary, danger, small, ghost, disabled, onClick, full }) => (
  <button disabled={disabled} onClick={onClick}
    style={{ padding: small ? "8px 16px" : "12px 24px", borderRadius: 10, border: primary || danger ? "none" : `1.5px solid ${C.border}`, background: disabled ? C.surface : danger ? C.red : primary ? C.accent : ghost ? "transparent" : C.surface, color: disabled ? C.muted : primary || danger ? "#fff" : C.text, fontFamily: FONT, fontSize: small ? 13 : 14, fontWeight: 600, cursor: disabled ? "default" : "pointer", transition: "all 0.2s", width: full ? "100%" : "auto", opacity: disabled ? 0.5 : 1, boxShadow: primary && !disabled ? `0 2px 12px ${C.accentGlow}` : "none" }}>
    {children}</button>
);
const Modal = ({ children, onClose, wide }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }} onClick={onClose}>
    <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, maxWidth: wide ? 640 : 520, width: "100%", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }} onClick={e => e.stopPropagation()}>{children}</div>
  </div>
);
const ModalHead = ({ title, subtitle, onClose, children }) => (
  <div style={{ padding: "22px 28px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: C.sub, marginTop: 3 }}>{subtitle}</div>}
      {children}
    </div>
    <button onClick={onClose} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.sub, fontSize: 16, flexShrink: 0, marginLeft: 12 }}>×</button>
  </div>
);
const selectSt = { background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.text, fontFamily: FONT, fontSize: 13, padding: "9px 14px", cursor: "pointer", outline: "none" };

// ═══════════════════════════════════
export default function App() {
  const [mode, setMode] = useState("borrower");
  const [adminAuth, setAdminAuth] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const [deals, setDeals] = useState([]);
  const [lp, setLp] = useState({ maxLTV: 0.90, maxARV: 0.70, rate: 11.5, termMo: 12, origPts: 2.0 });
  const [requests, setRequests] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const [bView, setBView] = useState("deals");
  const [filterMarket, setFilterMarket] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showLeadGate, setShowLeadGate] = useState(false);
  const [pendingDealId, setPendingDealId] = useState(null);
  const [lead, setLead] = useState({ name: "", email: "", phone: "" });
  const [leadErrors, setLeadErrors] = useState({});
  const [animIn, setAnimIn] = useState(false);

  const [aView, setAView] = useState("deals");
  const [showDealForm, setShowDealForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [dealForm, setDealForm] = useState({});
  const [dealFormErrors, setDealFormErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  const flash = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); }, []);

  // ─── Load data from Supabase ───
  const loadDeals = useCallback(async () => {
    const data = await sb.get("deals", "order=created_at.desc");
    if (data) setDeals(data);
  }, []);

  const loadLeads = useCallback(async () => {
    const data = await sb.get("leads", "order=created_at.desc");
    if (data) setRequests(data);
  }, []);

  useEffect(() => {
    const init = async () => {
      await loadDeals();
      await loadLeads();
      setLoading(false);
      setTimeout(() => setAnimIn(true), 50);
    };
    init();
  }, [loadDeals, loadLeads]);

  // Auth
  const handleLogin = () => {
    if (loginForm.email === ADMIN_CREDS.email && loginForm.password === ADMIN_CREDS.password) {
      setAdminAuth(true); setMode("admin"); setShowLogin(false); setLoginError(""); setLoginForm({ email: "", password: "" }); flash("Welcome back, Admin");
    } else { setLoginError("Invalid email or password"); }
  };
  const handleLogout = () => { setAdminAuth(false); setMode("borrower"); setAView("deals"); };

  // Borrower
  const activeDeals = useMemo(() => deals.filter(d => d.active), [deals]);
  const markets = useMemo(() => ["All", ...new Set(activeDeals.map(d => d.market))], [activeDeals]);
  const types = useMemo(() => ["All", ...new Set(activeDeals.map(d => d.type))], [activeDeals]);
  const filtered = useMemo(() => activeDeals.filter(d => (filterMarket === "All" || d.market === filterMarket) && (filterType === "All" || d.type === filterType)), [activeDeals, filterMarket, filterType]);

  const validateLead = () => {
    const e = {};
    if (!lead.name.trim()) e.name = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) e.email = "Valid email required";
    if (!/^\d{10,}$/.test(lead.phone.replace(/\D/g, ""))) e.phone = "Valid phone required";
    setLeadErrors(e); return Object.keys(e).length === 0;
  };
  const handleRequestDeal = (id) => { setPendingDealId(id); setShowLeadGate(true); };

  const submitLead = async () => {
    if (!validateLead()) return;
    const result = await sb.post("leads", { deal_id: pendingDealId, name: lead.name, email: lead.email, phone: lead.phone, status: "pending" });
    if (result) {
      await loadLeads();
      setShowLeadGate(false); setLead({ name: "", email: "", phone: "" }); setLeadErrors({}); setPendingDealId(null);
      flash("Request submitted — deal details coming soon.");
    } else { flash("Error submitting request. Please try again."); }
  };
  const alreadyRequested = (dealId) => requests.some(r => r.deal_id === dealId);

  // Admin CRUD
  const emptyDeal = { wholesaler: "", market: "", zip: "", type: "Single Family", beds: 3, baths: 2, sqft: "", price: "", arv: "", rehab: "", max_loan: "", notes: "", active: true, image_url: "" };
  const openNewDeal = () => { setEditingDeal(null); setDealForm({ ...emptyDeal }); setDealFormErrors({}); setShowDealForm(true); };
  const openEditDeal = (d) => { setEditingDeal(d.id); setDealForm({ ...d }); setDealFormErrors({}); setShowDealForm(true); };
  const validateDealForm = () => {
    const e = {};
    if (!dealForm.wholesaler || !dealForm.wholesaler.toString().trim()) e.wholesaler = "Required";
    if (!dealForm.market || !dealForm.market.toString().trim()) e.market = "Required";
    if (!dealForm.zip || !dealForm.zip.toString().trim()) e.zip = "Required";
    ["price", "arv", "rehab", "sqft"].forEach(k => { if (!dealForm[k] || isNaN(dealForm[k])) e[k] = "Required"; });
    setDealFormErrors(e); return Object.keys(e).length === 0;
  };

  const saveDeal = async () => {
    if (!validateDealForm()) return;
    const data = {
      wholesaler: dealForm.wholesaler, market: dealForm.market, zip: dealForm.zip, type: dealForm.type,
      beds: +dealForm.beds, baths: +dealForm.baths, sqft: +dealForm.sqft, price: +dealForm.price,
      arv: +dealForm.arv, rehab: +dealForm.rehab, max_loan: dealForm.max_loan ? +dealForm.max_loan : 0,
      notes: dealForm.notes || "", active: dealForm.active !== false, image_url: dealForm.image_url || "",
    };
    if (editingDeal) {
      await sb.patch("deals", editingDeal, data);
      flash("Deal updated");
    } else {
      await sb.post("deals", data);
      flash("Deal added");
    }
    await loadDeals();
    setShowDealForm(false);
  };

  const deleteDeal = async (id) => {
    await sb.del("deals", id);
    await loadDeals();
    setConfirmDelete(null);
    flash("Deal removed");
  };

  const toggleActive = async (id) => {
    const deal = deals.find(d => d.id === id);
    if (deal) {
      await sb.patch("deals", id, { active: !deal.active });
      await loadDeals();
    }
  };

  // CSV
  const exportCSV = () => {
    if (!requests.length) { flash("No leads to export"); return; }
    const h = ["Date", "Name", "Email", "Phone", "Status", "Deal ID"];
    const rows = requests.map(r => [new Date(r.created_at).toLocaleDateString(), r.name, r.email, r.phone, r.status, r.deal_id]);
    const csv = [h, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = `casafinance-leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    flash("CSV exported");
  };

  const updateReqStatus = async (id, s) => {
    await sb.patch("leads", id, { status: s });
    await loadLeads();
  };

  const getPhoto = (d) => d.image_url && d.image_url.trim() ? d.image_url.trim() : PHOTOS[d.id % PHOTOS.length];
  const getDealForLead = (r) => deals.find(d => d.id === r.deal_id) || { type: "Unknown", market: "Unknown", price: 0, arv: 0 };

  if (loading) return (
    <div style={{ fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: C.sub, fontSize: 16 }}>Loading deals...</div>
  );

  return (
    <div style={{ fontFamily: FONT, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        @keyframes fadeUp { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }
        input:focus, select:focus, textarea:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px ${C.accentMed}; outline: none; }
        .deal-card { transition: all 0.35s cubic-bezier(.4,0,.2,1); }
        .deal-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
        .deal-card:hover .deal-img { transform: scale(1.05); }
        .deal-img { transition: transform 0.5s cubic-bezier(.4,0,.2,1); }
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="42" height="36" viewBox="0 0 42 36" fill="none">
              <rect x="0" y="10" width="10" height="26" rx="5" fill="#F5A623" />
              <rect x="14" y="0" width="10" height="36" rx="5" fill="#2D7DD2" />
              <rect x="28" y="6" width="10" height="30" rx="5" fill="#45B649" />
            </svg>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 300, color: "#3A3F47", letterSpacing: -0.3 }}>casa</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: "#1E2227", letterSpacing: -0.3, marginLeft: -6 }}>finance</span>
                {mode === "admin" && <Tag color={C.violet} bg={C.violetLight}>ADMIN</Tag>}
              </div>
              <div style={{ fontSize: 12, color: C.sub, fontWeight: 500, marginTop: 1, letterSpacing: 0.3 }}>
                By <span style={{ fontWeight: 700, color: C.text }}>Luis Morales</span> <span style={{ color: C.muted }}>—</span> Private Lender
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {mode === "borrower" && (
              <>
                <div style={{ display: "flex", gap: 2, background: C.surface, borderRadius: 12, padding: 3, border: `1px solid ${C.border}` }}>
                  {["deals", "pipeline"].map(v => (
                    <button key={v} onClick={() => setBView(v)} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: bView === v ? C.accent : "transparent", color: bView === v ? "#fff" : C.sub, fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                      {v === "deals" ? "Live Deals" : <>My Requests{requests.length > 0 && <span style={{ background: bView === "pipeline" ? "rgba(255,255,255,0.3)" : C.accent, color: "#fff", borderRadius: 20, padding: "1px 7px", fontSize: 10, fontWeight: 700, marginLeft: 5 }}>{requests.length}</span>}</>}
                    </button>
                  ))}
                </div>
                {adminAuth
                  ? <Btn small onClick={() => setMode("admin")}>← Back to Admin</Btn>
                  : <Btn small ghost onClick={() => setShowLogin(true)} style={{ color: C.muted }}>Admin</Btn>
                }
              </>
            )}
            {mode === "admin" && (
              <>
                <div style={{ display: "flex", gap: 2, background: C.surface, borderRadius: 12, padding: 3, border: `1px solid ${C.border}` }}>
                  {[["deals", "Deals"], ["leads", "Leads"], ["settings", "Loan Terms"]].map(([k, l]) => (
                    <button key={k} onClick={() => setAView(k)} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: aView === k ? C.violet : "transparent", color: aView === k ? "#fff" : C.sub, fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      {l}{k === "leads" && requests.length > 0 && <span style={{ background: "rgba(255,255,255,0.25)", color: "#fff", borderRadius: 20, padding: "1px 7px", fontSize: 10, fontWeight: 700, marginLeft: 5 }}>{requests.length}</span>}
                    </button>
                  ))}
                </div>
                <Btn small onClick={() => setMode("borrower")}>Preview</Btn>
                <Btn small danger onClick={handleLogout}>Logout</Btn>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 28px 60px" }}>

        {/* BORROWER: DEALS */}
        {mode === "borrower" && bView === "deals" && (
          <>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 6 }}>Live Deals</h1>
              <p style={{ fontSize: 15, color: C.sub, maxWidth: 520 }}>Pre-approved bridge loans on wholesale investment properties. Submit your info to unlock the full address and get funded fast.</p>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
              <select style={selectSt} value={filterMarket} onChange={e => setFilterMarket(e.target.value)}>{markets.map(m => <option key={m}>{m === "All" ? "All Markets" : m}</option>)}</select>
              <select style={selectSt} value={filterType} onChange={e => setFilterType(e.target.value)}>{types.map(t => <option key={t}>{t === "All" ? "All Types" : t}</option>)}</select>
              <span style={{ marginLeft: "auto", fontSize: 13, color: C.muted, fontWeight: 500 }}>{filtered.length} deal{filtered.length !== 1 ? "s" : ""} available</span>
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: C.muted }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.sub }}>No deals available right now</div>
                <div style={{ fontSize: 14, marginTop: 4 }}>Check back soon for new pre-approved properties.</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
                {filtered.map((d, i) => {
                  const ln = calcLoan(d, lp);
                  return (
                    <div key={d.id} className="deal-card"
                      style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", cursor: "pointer", opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(20px)", transitionDelay: `${i * 60}ms`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                      onClick={() => setSelectedDeal(d)}>
                      <div style={{ position: "relative", height: 180, overflow: "hidden", background: C.surface }}>
                        <img className="deal-img" src={getPhoto(d)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.target.style.display = "none"; }} />
                        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
                          <Tag color="#fff" bg="rgba(0,0,0,0.55)" style={{ backdropFilter: "blur(4px)" }}>{d.type}</Tag>
                          <Tag color="#fff" bg="rgba(0,0,0,0.55)" style={{ backdropFilter: "blur(4px)" }}>{d.beds}bd / {d.baths}ba</Tag>
                        </div>
                        <div style={{ position: "absolute", top: 12, right: 12 }}>
                          <Tag color="#fff" bg={C.accent} style={{ fontWeight: 700 }}>NEW</Tag>
                        </div>
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(transparent, rgba(0,0,0,0.4))" }} />
                        <div style={{ position: "absolute", bottom: 12, left: 14 }}>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{d.market} · ZIP {d.zip}</div>
                        </div>
                      </div>
                      <div style={{ padding: "16px 18px 18px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
                          <div>
                            <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>Purchase Price</div>
                            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: MONO, letterSpacing: -1 }}>{fmt(d.price)}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>ARV</div>
                            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: MONO, color: C.accent, letterSpacing: -0.5 }}>{fmt(d.arv)}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 0, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                          <div style={{ flex: 1 }}><Stat label="Est. Rehab" value={fmt(d.rehab)} color={C.amber} /></div>
                          <div style={{ flex: 1, textAlign: "right" }}><Stat label="Approved Loan" value={fmt(ln.loanAmt)} color={C.sky} /></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* BORROWER: PIPELINE */}
        {mode === "borrower" && bView === "pipeline" && (
          requests.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: C.muted }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: C.surface, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 16, border: `1px solid ${C.border}` }}>📋</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: C.text }}>No requests yet</div>
              <div style={{ fontSize: 14 }}>Browse live deals and submit your info to request addresses.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>My Requests</h2>
              {requests.map(r => {
                const deal = getDealForLead(r);
                const sc = { pending: C.amber, approved: C.accent, contacted: C.sky, closed: C.muted }[r.status] || C.amber;
                const sbc = { pending: C.amberLight, approved: C.accentLight, contacted: C.skyLight, closed: C.surface }[r.status] || C.amberLight;
                return (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "16px 20px", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{deal.type} · {deal.market}</div>
                      <div style={{ fontSize: 13, color: C.sub }}>{fmt(deal.price)} → ARV {fmt(deal.arv)}</div>
                    </div>
                    <Tag color={sc} bg={sbc}>{r.status}</Tag>
                    <div style={{ fontSize: 12, color: C.muted }}>{new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ADMIN: DEALS */}
        {mode === "admin" && aView === "deals" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <div><h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>Manage Deals</h2><p style={{ fontSize: 13, color: C.sub }}>{deals.length} total · {deals.filter(d => d.active).length} live</p></div>
              <Btn primary onClick={openNewDeal}>+ Add Deal</Btn>
            </div>
            {deals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 20px", color: C.muted }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🏗️</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.sub }}>No deals yet. Click "+ Add Deal" to create your first one.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {deals.map(d => {
                  const ln = calcLoan(d, lp);
                  return (
                    <div key={d.id} style={{ display: "flex", alignItems: "center", background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "12px 18px", gap: 14, flexWrap: "wrap", opacity: d.active ? 1 : 0.45 }}>
                      <div style={{ width: 56, height: 42, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: C.surface }}>
                        <img src={getPhoto(d)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                      </div>
                      <div style={{ flex: 2, minWidth: 180 }}>
                        <div style={{ display: "flex", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                          <Tag color={C.accent} bg={C.accentLight}>{d.type}</Tag>
                          <Tag color={C.sky} bg={C.skyLight}>{d.market}</Tag>
                          {!d.active && <Tag color={C.red} bg={C.redLight}>Inactive</Tag>}
                        </div>
                        <div style={{ fontSize: 12, color: C.sub }}>{d.wholesaler} · ZIP {d.zip}</div>
                      </div>
                      <div style={{ display: "flex", gap: 16, flex: 1, minWidth: 120 }}><Stat label="Price" value={fmt(d.price)} /><Stat label="ARV" value={fmt(d.arv)} /></div>
                      <Stat label="Approved Loan" value={fmt(ln.loanAmt)} color={C.accent} />
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <Btn small onClick={() => toggleActive(d.id)}>{d.active ? "Pause" : "Go Live"}</Btn>
                        <Btn small onClick={() => openEditDeal(d)}>Edit</Btn>
                        <Btn small danger onClick={() => setConfirmDelete(d.id)}>×</Btn>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ADMIN: LEADS */}
        {mode === "admin" && aView === "leads" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
              {[
                { l: "Requests", v: requests.length, c: C.text, bg: C.surface },
                { l: "Unique Leads", v: new Set(requests.map(r => r.email)).size, c: C.sky, bg: C.skyLight },
                { l: "Pending", v: requests.filter(r => r.status === "pending").length, c: C.amber, bg: C.amberLight },
                { l: "Approved", v: requests.filter(r => r.status === "approved").length, c: C.accent, bg: C.accentLight },
              ].map((s, i) => (
                <div key={i} style={{ background: s.bg, borderRadius: 14, padding: "18px 20px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{s.l}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, fontFamily: MONO, color: s.c, letterSpacing: -1 }}>{s.v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Lead Pipeline</h2>
              <Btn small primary onClick={exportCSV}>Export CSV</Btn>
            </div>
            {!requests.length ? (
              <div style={{ textAlign: "center", padding: "50px 20px", color: C.muted, fontSize: 14 }}>Leads appear here when borrowers request deal info.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {requests.map(r => {
                  const deal = getDealForLead(r);
                  const sc = { pending: C.amber, approved: C.accent, contacted: C.sky, closed: C.muted }[r.status] || C.amber;
                  const sbc = { pending: C.amberLight, approved: C.accentLight, contacted: C.skyLight, closed: C.surface }[r.status] || C.amberLight;
                  return (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "14px 20px", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 150 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{deal.type} · {deal.market}</div>
                        <div style={{ fontSize: 12, color: C.sub }}>{fmt(deal.price)} → {fmt(deal.arv)}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 140 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                        <div style={{ fontSize: 12, color: C.sub }}>{r.email}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{r.phone}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Tag color={sc} bg={sbc}>{r.status}</Tag>
                        <select style={{ ...selectSt, fontSize: 12, padding: "5px 10px" }} value={r.status} onChange={e => updateReqStatus(r.id, e.target.value)}>
                          {["pending", "contacted", "approved", "closed"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, textAlign: "right", minWidth: 60 }}>{new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ADMIN: LOAN SETTINGS */}
        {mode === "admin" && aView === "settings" && (
          <div style={{ maxWidth: 580 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Bridge Loan Parameters</h2>
            <p style={{ fontSize: 14, color: C.sub, marginBottom: 24 }}>These terms apply to auto-calculated loan amounts (when no manual amount is set).</p>
            <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Input label="Max ARV %" value={(lp.maxARV * 100).toFixed(0)} onChange={v => setLp(p => ({ ...p, maxARV: +v / 100 }))} small type="number" />
                <Input label="Interest Rate %" value={lp.rate} onChange={v => setLp(p => ({ ...p, rate: +v }))} small type="number" />
                <Input label="Term (months)" value={lp.termMo} onChange={v => setLp(p => ({ ...p, termMo: +v }))} small type="number" />
              </div>
              <div style={{ paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, fontWeight: 500 }}>Live preview — $200K purchase / $350K ARV:</div>
                {(() => { const p = calcLoan({ price: 200000, arv: 350000, rehab: 50000, max_loan: 0 }, lp); return (
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}><Stat label="Approved Loan" value={fmt(p.loanAmt)} color={C.accent} /><Stat label="LTV" value={pct(p.ltv)} /><Stat label="LT-ARV" value={pct(p.ltArv)} /></div>
                ); })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ MODALS ═══ */}

      {selectedDeal && (
        <Modal onClose={() => setSelectedDeal(null)} wide>
          <div style={{ position: "relative", height: 220, overflow: "hidden", borderRadius: "20px 20px 0 0", background: C.surface }}>
            <img src={getPhoto(selectedDeal)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%, rgba(0,0,0,0.6))" }} />
            <button onClick={() => setSelectedDeal(null)} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "none", borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 18 }}>×</button>
            <div style={{ position: "absolute", bottom: 16, left: 24, right: 24 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <Tag color="#fff" bg="rgba(255,255,255,0.2)" style={{ backdropFilter: "blur(4px)" }}>{selectedDeal.type}</Tag>
                <Tag color="#fff" bg="rgba(255,255,255,0.2)" style={{ backdropFilter: "blur(4px)" }}>{selectedDeal.beds}bd / {selectedDeal.baths}ba · {Number(selectedDeal.sqft).toLocaleString()} sqft</Tag>
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{selectedDeal.market} · ZIP {selectedDeal.zip}</div>
            </div>
          </div>
          <div style={{ padding: "20px 28px 28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
              <div><div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Purchase Price</div><div style={{ fontSize: 26, fontWeight: 800, fontFamily: MONO, letterSpacing: -1 }}>{fmt(selectedDeal.price)}</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>After Repair Value</div><div style={{ fontSize: 22, fontWeight: 700, fontFamily: MONO, color: C.accent, letterSpacing: -0.5 }}>{fmt(selectedDeal.arv)}</div></div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Pre-Approved Bridge Loan</div>
            <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 20 }}>
              {(() => { const ln = calcLoan(selectedDeal, lp); return (<>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Stat label="Approved Loan Amount" value={fmt(ln.loanAmt)} color={C.accent} big />
                  <Stat label="Estimated Rehab" value={fmt(selectedDeal.rehab)} color={C.amber} big />
                </div>
                <div style={{ marginTop: 18, padding: "14px 18px", background: `linear-gradient(135deg, ${C.accentLight}, #F0FDFA)`, borderRadius: 12, border: `1px solid ${C.accentMed}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.accent, lineHeight: 1.5 }}>
                    Get up to 90% LTC including 100% of the rehab, 3 days closing
                  </div>
                </div>
              </>); })()}
            </div>
            {selectedDeal.notes && <div style={{ marginTop: 14, fontSize: 14, color: C.sub, lineHeight: 1.6, padding: "12px 16px", background: C.surface, borderRadius: 10, border: `1px solid ${C.border}` }}>{selectedDeal.notes}</div>}
            <div style={{ marginTop: 20 }}>
              {alreadyRequested(selectedDeal.id)
                ? <Btn disabled full>✓ Address Requested</Btn>
                : <Btn primary full onClick={() => { setSelectedDeal(null); handleRequestDeal(selectedDeal.id); }}>Request Full Address & Details →</Btn>
              }
            </div>
          </div>
        </Modal>
      )}

      {showLeadGate && (
        <Modal onClose={() => setShowLeadGate(false)}>
          <ModalHead title="Unlock Deal Details" subtitle="Enter your contact info to receive the full address and connect with our team." onClose={() => setShowLeadGate(false)}>
            {(() => { const d = deals.find(x => x.id === pendingDealId); return d ? (
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                <Tag color={C.accent} bg={C.accentLight}>{d.type}</Tag><Tag color={C.sky} bg={C.skyLight}>{d.market}</Tag>
                <Tag color={C.text} bg={C.surface} style={{ fontFamily: MONO, fontWeight: 700 }}>{fmt(d.price)}</Tag>
              </div>
            ) : null; })()}
          </ModalHead>
          <div style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Full Name" value={lead.name} onChange={v => setLead(p => ({ ...p, name: v }))} error={leadErrors.name} placeholder="John Smith" />
            <Input label="Email" value={lead.email} onChange={v => setLead(p => ({ ...p, email: v }))} error={leadErrors.email} placeholder="john@example.com" type="email" />
            <Input label="Phone" value={lead.phone} onChange={v => setLead(p => ({ ...p, phone: v }))} error={leadErrors.phone} placeholder="(555) 123-4567" type="tel" />
            <Btn primary full onClick={submitLead}>Submit & Get Deal Info</Btn>
            <div style={{ fontSize: 12, color: C.muted, textAlign: "center", lineHeight: 1.5 }}>Your info is used solely to send you this deal's details.</div>
          </div>
        </Modal>
      )}

      {showLogin && (
        <Modal onClose={() => { setShowLogin(false); setLoginError(""); }}>
          <ModalHead title="Admin Login" subtitle="Access your deal management dashboard." onClose={() => { setShowLogin(false); setLoginError(""); }} />
          <div style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
            {loginError && <div style={{ background: C.redLight, color: C.red, padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>{loginError}</div>}
            <Input label="Email" value={loginForm.email} onChange={v => setLoginForm(p => ({ ...p, email: v }))} placeholder="Enter admin email" type="email" onKeyDown={e => { if (e.key === "Enter") handleLogin(); }} />
            <Input label="Password" value={loginForm.password} onChange={v => setLoginForm(p => ({ ...p, password: v }))} placeholder="••••••••" type="password" onKeyDown={e => { if (e.key === "Enter") handleLogin(); }} />
            <button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); handleLogin(); }}
              style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: C.accent, color: "#fff", fontFamily: FONT, fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%", boxShadow: `0 2px 12px ${C.accentGlow}` }}>
              Sign In
            </button>
          </div>
        </Modal>
      )}

      {showDealForm && (
        <Modal onClose={() => setShowDealForm(false)} wide>
          <ModalHead title={editingDeal ? "Edit Deal" : "Add New Deal"} onClose={() => setShowDealForm(false)} />
          <div style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Input label="Wholesaler (internal)" value={dealForm.wholesaler || ""} onChange={v => setDealForm(p => ({ ...p, wholesaler: v }))} error={dealFormErrors.wholesaler} placeholder="FastFlip Capital" />
              <Input label="Market" value={dealForm.market || ""} onChange={v => setDealForm(p => ({ ...p, market: v }))} error={dealFormErrors.market} placeholder="Miami-Dade, FL" />
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Input label="ZIP (masked)" value={dealForm.zip || ""} onChange={v => setDealForm(p => ({ ...p, zip: v }))} error={dealFormErrors.zip} placeholder="331xx" small />
              <div style={{ flex: 1, minWidth: 120 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 6, display: "block" }}>Property Type</label>
                <select style={{ ...selectSt, width: "100%", padding: "12px 14px" }} value={dealForm.type || "Single Family"} onChange={e => setDealForm(p => ({ ...p, type: e.target.value }))}>
                  {["Single Family", "Duplex", "Triplex", "Quadplex", "Townhouse", "Condo"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Input label="Beds" value={dealForm.beds || ""} onChange={v => setDealForm(p => ({ ...p, beds: v }))} small type="number" />
              <Input label="Baths" value={dealForm.baths || ""} onChange={v => setDealForm(p => ({ ...p, baths: v }))} small type="number" />
              <Input label="Sq Ft" value={dealForm.sqft || ""} onChange={v => setDealForm(p => ({ ...p, sqft: v }))} error={dealFormErrors.sqft} small type="number" />
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Input label="Purchase Price ($)" value={dealForm.price || ""} onChange={v => setDealForm(p => ({ ...p, price: v }))} error={dealFormErrors.price} small type="number" />
              <Input label="ARV ($)" value={dealForm.arv || ""} onChange={v => setDealForm(p => ({ ...p, arv: v }))} error={dealFormErrors.arv} small type="number" />
              <Input label="Rehab Est. ($)" value={dealForm.rehab || ""} onChange={v => setDealForm(p => ({ ...p, rehab: v }))} error={dealFormErrors.rehab} small type="number" />
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
              <Input label="Approved Loan Amount ($)" value={dealForm.max_loan || ""} onChange={v => setDealForm(p => ({ ...p, max_loan: v }))} placeholder="Leave blank for auto-calc" type="number" />
              {!dealForm.max_loan && dealForm.arv && dealForm.price && (
                <div style={{ fontSize: 11, color: C.muted, paddingBottom: 12, lineHeight: 1.5 }}>
                  Auto: {fmt(Math.min((+dealForm.price + (+dealForm.rehab || 0)) * 0.90, +dealForm.arv * 0.70))}
                  <br />
                  <span style={{ fontSize: 10 }}>90% LTC: {fmt((+dealForm.price + (+dealForm.rehab || 0)) * 0.90)} · 70% ARV: {fmt(+dealForm.arv * 0.70)}</span>
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 6, display: "block" }}>Deal Photo</label>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                <label style={{ padding: "10px 20px", borderRadius: 10, background: C.accent, color: "#fff", fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: `0 2px 8px ${C.accentGlow}` }}>
                  📷 Upload Photo
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) { flash("Image must be under 2MB"); return; }
                    const reader = new FileReader();
                    reader.onload = (ev) => setDealForm(p => ({ ...p, image_url: ev.target.result }));
                    reader.readAsDataURL(file);
                  }} />
                </label>
                <div style={{ fontSize: 12, color: C.muted, paddingTop: 4 }}>or paste a direct image URL below</div>
              </div>
              <div style={{ marginTop: 10 }}>
                <input style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.surface, color: C.text, fontFamily: FONT, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  placeholder="https://i.ibb.co/xxxxx/photo.jpg (optional)"
                  value={dealForm.image_url && !dealForm.image_url.startsWith("data:") ? dealForm.image_url : ""}
                  onChange={e => setDealForm(p => ({ ...p, image_url: e.target.value }))} />
              </div>
              {dealForm.image_url && dealForm.image_url.trim() && (
                <div style={{ marginTop: 10, borderRadius: 12, overflow: "hidden", height: 140, background: C.surface, border: `1px solid ${C.border}`, position: "relative" }}>
                  <img src={dealForm.image_url.trim()} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                  <button onClick={() => setDealForm(p => ({ ...p, image_url: "" }))} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.5)", border: "none", borderRadius: 6, width: 26, height: 26, color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 6, display: "block" }}>Notes (visible to borrowers)</label>
              <textarea style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.surface, color: C.text, fontFamily: FONT, fontSize: 14, outline: "none", boxSizing: "border-box", minHeight: 70, resize: "vertical" }}
                value={dealForm.notes || ""} onChange={e => setDealForm(p => ({ ...p, notes: e.target.value }))} placeholder="Deal notes..." />
            </div>
            <Btn primary full onClick={saveDeal}>{editingDeal ? "Save Changes" : "Add Deal"}</Btn>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(null)}>
          <div style={{ padding: "32px 28px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: C.redLight, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>🗑️</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Delete this deal?</div>
            <div style={{ fontSize: 14, color: C.sub, marginBottom: 24 }}>This can't be undone. Existing lead requests will stay in your pipeline.</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Btn onClick={() => setConfirmDelete(null)}>Cancel</Btn>
              <Btn danger onClick={() => deleteDeal(confirmDelete)}>Delete</Btn>
            </div>
          </div>
        </Modal>
      )}

      {toast && <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: C.accent, color: "#fff", padding: "14px 28px", borderRadius: 14, fontWeight: 700, fontSize: 14, zIndex: 200, boxShadow: `0 8px 30px ${C.accentGlow}`, animation: "fadeUp 0.3s ease", whiteSpace: "nowrap" }}>{toast}</div>}
    </div>
  );
}
