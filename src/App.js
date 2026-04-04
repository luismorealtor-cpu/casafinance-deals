import { useState, useEffect, useCallback, useMemo } from "react";

const SUPABASE_URL = "https://hekxuqpoopvztttqybdj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhla3h1cXBvb3B2enR0dHF5YmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTkxNTAsImV4cCI6MjA5MDQ3NTE1MH0.VXcxc1q0S52Vx_oPIp9Oql-6VWDzwD2SFNlFsVhZg1M";
const sb = {
  headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
  async get(t, q = "") { const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}?${q}`, { headers: this.headers }); return r.ok ? await r.json() : []; },
  async post(t, d) { const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}`, { method: "POST", headers: this.headers, body: JSON.stringify(d) }); return r.ok ? await r.json() : null; },
  async patch(t, id, d) { const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}?id=eq.${id}`, { method: "PATCH", headers: this.headers, body: JSON.stringify(d) }); return r.ok ? await r.json() : null; },
  async del(t, id) { const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}?id=eq.${id}`, { method: "DELETE", headers: this.headers }); return r.ok; }
};

const FONT = "'Outfit', sans-serif";
const C = {
  bg: "#FFFFFF", surface: "#F8FAFB", card: "#FFFFFF", cardHover: "#F3F6F8",
  border: "#E5E9EF", borderHi: "#D0D7E0", text: "#111827", sub: "#6B7280", muted: "#9CA3AF",
  accent: "#059669", accentLight: "#ECFDF5", accentMed: "rgba(5,150,105,0.15)", accentGlow: "rgba(5,150,105,0.25)",
  red: "#EF4444", redLight: "#FEF2F2", amber: "#D97706", amberLight: "#FFFBEB",
  sky: "#0284C7", skyLight: "#F0F9FF", violet: "#7C3AED", violetLight: "#F5F3FF",
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
const CASAHUB_LOGO = "data:image/png;base64,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";
const fmt = (n) => "$" + Math.round(n).toLocaleString();

function calcLoan(d) {
  const totalCost = (+d.price || 0) + (+d.rehab || 0);
  const ltcAmount = totalCost * 0.90;
  const arvAmount = (+d.arv || 0) * 0.70;
  const autoLoan = Math.min(ltcAmount, arvAmount);
  const loanAmt = d.max_loan && d.max_loan > 0 ? +d.max_loan : autoLoan;
  return { loanAmt, ltcAmount, arvAmount };
}

const Tag = ({ color, bg, children, style: sx }) => <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 600, color, background: bg, borderRadius: 20, padding: "4px 10px", whiteSpace: "nowrap", ...sx }}>{children}</span>;
const Stat = ({ label, value, color, big }) => <div style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span><span style={{ fontSize: big ? 20 : 15, fontWeight: 700, fontFamily: FONT, letterSpacing: -0.5, color: color || C.text }}>{value}</span></div>;
const Input = ({ label, value, onChange, error, placeholder, type = "text", small, onKeyDown }) => <div style={{ flex: 1, minWidth: small ? 80 : 140 }}>{label && <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 6, display: "block" }}>{label}</label>}<input style={{ width: "100%", padding: small ? "9px 12px" : "12px 16px", borderRadius: 10, border: `1.5px solid ${error ? C.red : C.border}`, background: C.surface, color: C.text, fontFamily: FONT, fontSize: 14, outline: "none", boxSizing: "border-box" }} placeholder={placeholder} type={type} value={value} onChange={e => onChange(e.target.value)} onKeyDown={onKeyDown} />{error && <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>{error}</div>}</div>;
const Btn = ({ children, primary, danger, small, ghost, disabled, onClick, full }) => <button disabled={disabled} onClick={onClick} style={{ padding: small ? "8px 16px" : "12px 24px", borderRadius: 10, border: primary || danger ? "none" : `1.5px solid ${C.border}`, background: disabled ? C.surface : danger ? C.red : primary ? C.accent : ghost ? "transparent" : C.surface, color: disabled ? C.muted : primary || danger ? "#fff" : C.text, fontFamily: FONT, fontSize: small ? 13 : 14, fontWeight: 600, cursor: disabled ? "default" : "pointer", width: full ? "100%" : "auto", opacity: disabled ? 0.5 : 1, boxShadow: primary && !disabled ? `0 2px 12px ${C.accentGlow}` : "none" }}>{children}</button>;
const Modal = ({ children, onClose, wide }) => <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }} onClick={onClose}><div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, maxWidth: wide ? 640 : 520, width: "100%", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }} onClick={e => e.stopPropagation()}>{children}</div></div>;
const ModalHead = ({ title, subtitle, onClose, children }) => <div style={{ padding: "22px 28px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}><div style={{ flex: 1 }}><div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>{subtitle && <div style={{ fontSize: 13, color: C.sub, marginTop: 3 }}>{subtitle}</div>}{children}</div><button onClick={onClose} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.sub, fontSize: 16 }}>×</button></div>;
const selectSt = { background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.text, fontFamily: FONT, fontSize: 13, padding: "9px 14px", cursor: "pointer", outline: "none" };

export default function App() {
  const [mode, setMode] = useState("borrower");
  const [adminUser, setAdminUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [deals, setDeals] = useState([]);
  const [requests, setRequests] = useState([]);
  const [admins, setAdmins] = useState([]);
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
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "" });
  const [userFormErrors, setUserFormErrors] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [showInstallDismissed, setShowInstallDismissed] = useState(false);

  const flash = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); }, []);
  const isMaster = adminUser && adminUser.role === "master";

  const loadDeals = useCallback(async () => { const d = await sb.get("deals", "order=created_at.desc"); if (d) setDeals(d); }, []);
  const loadLeads = useCallback(async () => { const d = await sb.get("leads", "order=created_at.desc"); if (d) setRequests(d); }, []);
  const loadAdmins = useCallback(async () => { const d = await sb.get("admins", "order=created_at.desc"); if (d) setAdmins(d); }, []);

  useEffect(() => { const init = async () => { await loadDeals(); await loadLeads(); setLoading(false); setTimeout(() => setAnimIn(true), 50); }; init(); }, [loadDeals, loadLeads]);

  const handleLogin = async () => {
    const users = await sb.get("admins", `email=eq.${loginForm.email}&password=eq.${loginForm.password}&active=eq.true`);
    if (users && users.length > 0) {
      setAdminUser(users[0]); setMode("admin"); setShowLogin(false); setLoginError(""); setLoginForm({ email: "", password: "" });
      if (users[0].role === "master") await loadAdmins();
      flash(`Welcome back, ${users[0].name}`);
    } else { setLoginError("Invalid email or password"); }
  };
  const handleLogout = () => { setAdminUser(null); setMode("borrower"); setAView("deals"); };

  const activeDeals = useMemo(() => deals.filter(d => d.active && d.approval_status === "approved"), [deals]);
  const myDeals = useMemo(() => adminUser ? (isMaster ? deals : deals.filter(d => d.submitted_by === adminUser.email)) : [], [deals, adminUser, isMaster]);
  const pendingDeals = useMemo(() => deals.filter(d => d.approval_status === "pending"), [deals]);
  const markets = useMemo(() => ["All", ...new Set(activeDeals.map(d => d.market))], [activeDeals]);
  const types = useMemo(() => ["All", ...new Set(activeDeals.map(d => d.type))], [activeDeals]);
  const filtered = useMemo(() => activeDeals.filter(d => (filterMarket === "All" || d.market === filterMarket) && (filterType === "All" || d.type === filterType)), [activeDeals, filterMarket, filterType]);

  const validateLead = () => { const e = {}; if (!lead.name.trim()) e.name = "Required"; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) e.email = "Valid email required"; if (!/^\d{10,}$/.test(lead.phone.replace(/\D/g, ""))) e.phone = "Valid phone required"; setLeadErrors(e); return Object.keys(e).length === 0; };
  const handleRequestDeal = (id) => { setPendingDealId(id); setShowLeadGate(true); };
  const submitLead = async () => { if (!validateLead()) return; const r = await sb.post("leads", { deal_id: pendingDealId, name: lead.name, email: lead.email, phone: lead.phone, status: "pending" }); if (r) { await loadLeads(); setShowLeadGate(false); setLead({ name: "", email: "", phone: "" }); setLeadErrors({}); setPendingDealId(null); flash("Request submitted — deal details coming soon."); } else flash("Error. Please try again."); };
  const alreadyRequested = (id) => requests.some(r => r.deal_id === id);

  const emptyDeal = { wholesaler: "", market: "", zip: "", type: "Single Family", beds: 3, baths: 2, sqft: "", price: "", arv: "", rehab: "", max_loan: "", notes: "", active: true, image_url: "" };
  const openNewDeal = () => { setEditingDeal(null); setDealForm({ ...emptyDeal }); setDealFormErrors({}); setShowDealForm(true); };
  const openEditDeal = (d) => { setEditingDeal(d.id); setDealForm({ ...d }); setDealFormErrors({}); setShowDealForm(true); };
  const validateDealForm = () => { const e = {}; if (!dealForm.market?.toString().trim()) e.market = "Required"; if (!dealForm.zip?.toString().trim()) e.zip = "Required"; ["price", "arv", "rehab", "sqft"].forEach(k => { if (!dealForm[k] || isNaN(dealForm[k])) e[k] = "Required"; }); setDealFormErrors(e); return Object.keys(e).length === 0; };

  const saveDeal = async () => {
    if (!validateDealForm()) return;
    const data = { wholesaler: dealForm.wholesaler || "", market: dealForm.market, zip: dealForm.zip, type: dealForm.type, beds: +dealForm.beds, baths: +dealForm.baths, sqft: +dealForm.sqft, price: +dealForm.price, arv: +dealForm.arv, rehab: +dealForm.rehab, max_loan: dealForm.max_loan ? +dealForm.max_loan : 0, notes: dealForm.notes || "", active: dealForm.active !== false, image_url: dealForm.image_url || "", submitted_by: adminUser.email, approval_status: isMaster ? "approved" : "pending" };
    if (editingDeal) { await sb.patch("deals", editingDeal, data); flash("Deal updated"); }
    else { await sb.post("deals", data); flash(isMaster ? "Deal added" : "Deal submitted for approval"); }
    await loadDeals(); setShowDealForm(false);
  };
  const deleteDeal = async (id) => { await sb.del("deals", id); await loadDeals(); setConfirmDelete(null); flash("Deal removed"); };
  const toggleActive = async (id) => { const d = deals.find(x => x.id === id); if (d) { await sb.patch("deals", id, { active: !d.active }); await loadDeals(); } };
  const approveDeal = async (id) => { await sb.patch("deals", id, { approval_status: "approved", active: true }); await loadDeals(); flash("Deal approved and live"); };
  const rejectDeal = async (id) => { await sb.patch("deals", id, { approval_status: "rejected" }); await loadDeals(); flash("Deal rejected"); };

  const exportCSV = () => { if (!requests.length) { flash("No leads"); return; } const h = ["Date","Name","Email","Phone","Status","Deal ID"]; const rows = requests.map(r => [new Date(r.created_at).toLocaleDateString(), r.name, r.email, r.phone, r.status, r.deal_id]); const csv = [h, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n"); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = `casahub-leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); flash("CSV exported"); };
  const updateReqStatus = async (id, s) => { await sb.patch("leads", id, { status: s }); await loadLeads(); };
  const getPhoto = (d) => d.image_url?.trim() ? d.image_url.trim() : PHOTOS[d.id % PHOTOS.length];
  const getDealForLead = (r) => deals.find(d => d.id === r.deal_id) || { type: "?", market: "?", price: 0, arv: 0 };

  // Admin user management
  const saveUser = async () => {
    const e = {};
    if (!userForm.name.trim()) e.name = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) e.email = "Valid email";
    if (!editingUser && (!userForm.password || userForm.password.length < 6)) e.password = "Min 6 chars";
    setUserFormErrors(e); if (Object.keys(e).length > 0) return;
    if (editingUser) {
      const upd = { name: userForm.name, email: userForm.email };
      if (userForm.password) upd.password = userForm.password;
      await sb.patch("admins", editingUser, upd);
      flash("User updated");
    } else {
      await sb.post("admins", { name: userForm.name, email: userForm.email, password: userForm.password, role: "wholesaler", active: true });
      flash("Wholesaler account created");
    }
    await loadAdmins(); setShowUserForm(false);
  };
  const deleteUser = async (id) => { await sb.del("admins", id); await loadAdmins(); setConfirmDeleteUser(null); flash("User removed"); };
  const toggleUserActive = async (id) => { const u = admins.find(x => x.id === id); if (u) { await sb.patch("admins", id, { active: !u.active }); await loadAdmins(); } };

  if (loading) return <div style={{ fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: C.sub }}>Loading deals...</div>;

  const adminTabs = isMaster ? [["deals","Deals"],["pending","Pending"],["leads","Leads"],["users","Users"],["settings","Settings"]] : [["deals","My Deals"],["leads","Leads"]];
  const myLeads = isMaster ? requests : requests.filter(r => { const d = deals.find(x => x.id === r.deal_id); return d && d.submitted_by === adminUser?.email; });

  return (
    <div style={{ fontFamily: FONT, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, select:focus, textarea:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px ${C.accentMed}; outline: none; }
        .deal-card { transition: all 0.35s cubic-bezier(.4,0,.2,1); }
        .deal-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
        .deal-card:hover .deal-img { transform: scale(1.05); }
        .deal-img { transition: transform 0.5s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeUp { from { opacity:0; transform:translate(-50%,12px); } to { opacity:1; transform:translate(-50%,0); } }
      `}</style>

      <div style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src={CASAHUB_LOGO} alt="casahub" style={{ height: 50 }} />
            {mode === "admin" && <Tag color={C.violet} bg={C.violetLight}>ADMIN</Tag>}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {mode === "borrower" && <>
              <div style={{ display: "flex", gap: 2, background: C.surface, borderRadius: 12, padding: 3, border: `1px solid ${C.border}` }}>
                {["deals","pipeline"].map(v => <button key={v} onClick={() => setBView(v)} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: bView === v ? C.accent : "transparent", color: bView === v ? "#fff" : C.sub, fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{v === "deals" ? "Live Deals" : "My Requests"}</button>)}
              </div>
              {adminUser ? <button onClick={() => setMode("admin")} style={{ background:"none",border:"none",color:C.border,fontSize:10,cursor:"pointer",padding:"4px 8px" }}>←</button> : <button onClick={() => setShowLogin(true)} style={{ background:"none",border:"none",color:C.border,fontSize:10,cursor:"pointer",padding:"4px 8px" }}>•</button>}
            </>}
            {mode === "admin" && <>
              <div style={{ display: "flex", gap: 2, background: C.surface, borderRadius: 12, padding: 3, border: `1px solid ${C.border}` }}>
                {adminTabs.map(([k,l]) => <button key={k} onClick={() => setAView(k)} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: aView === k ? C.violet : "transparent", color: aView === k ? "#fff" : C.sub, fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {l}{k === "pending" && pendingDeals.length > 0 && <span style={{ background: "rgba(255,255,255,0.25)", color: "#fff", borderRadius: 20, padding: "1px 7px", fontSize: 10, fontWeight: 700, marginLeft: 5 }}>{pendingDeals.length}</span>}
                </button>)}
              </div>
              <Btn small onClick={() => setMode("borrower")}>Preview</Btn>
              <Btn small danger onClick={handleLogout}>Logout</Btn>
              <span style={{ fontSize: 11, color: C.muted }}>{adminUser?.name}</span>
            </>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 28px 60px" }}>

        {mode === "borrower" && bView === "deals" && <>
          <div style={{ marginBottom: 28 }}><h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 6 }}>Live Deals</h1><p style={{ fontSize: 15, color: C.sub, maxWidth: 520 }}>Pre-approved bridge loans on wholesale investment properties. Submit your info to unlock the full address and get funded fast.</p></div>
          <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
            <select style={selectSt} value={filterMarket} onChange={e => setFilterMarket(e.target.value)}>{markets.map(m => <option key={m}>{m === "All" ? "All Markets" : m}</option>)}</select>
            <select style={selectSt} value={filterType} onChange={e => setFilterType(e.target.value)}>{types.map(t => <option key={t}>{t === "All" ? "All Types" : t}</option>)}</select>
            <span style={{ marginLeft: "auto", fontSize: 13, color: C.muted }}>{filtered.length} deal{filtered.length !== 1 ? "s" : ""} available</span>
          </div>
          {filtered.length === 0 ? <div style={{ textAlign: "center", padding: "60px 20px", color: C.muted }}><div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div><div style={{ fontSize: 16, fontWeight: 600, color: C.sub }}>No deals available right now</div></div> :
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {filtered.map((d, i) => { const ln = calcLoan(d); return (
              <div key={d.id} className="deal-card" style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", cursor: "pointer", opacity: animIn?1:0, transform: animIn?"translateY(0)":"translateY(20px)", transition: "all 0.35s", transitionDelay: `${i*60}ms`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }} onClick={() => setSelectedDeal(d)}>
                <div style={{ position: "relative", height: 180, overflow: "hidden", background: C.surface }}>
                  <img className="deal-img" src={getPhoto(d)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.target.style.display="none"; }} />
                  <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}><Tag color="#fff" bg="rgba(0,0,0,0.55)">{d.type}</Tag><Tag color="#fff" bg="rgba(0,0,0,0.55)">{d.beds}bd / {d.baths}ba</Tag></div>
                  <div style={{ position: "absolute", top: 12, right: 12 }}><Tag color="#fff" bg={C.accent} style={{ fontWeight: 700 }}>NEW</Tag></div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(transparent, rgba(0,0,0,0.4))" }} />
                  <div style={{ position: "absolute", bottom: 12, left: 14, right: 14 }}><div style={{ fontSize: 14, color: "#fff", fontWeight: 700, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{d.market}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 500, marginTop: 1 }}>ZIP {d.zip}</div></div>
                </div>
                <div style={{ padding: "16px 18px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
                    <div><div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>Purchase Price</div><div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -1 }}>{fmt(d.price)}</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>ARV</div><div style={{ fontSize: 18, fontWeight: 700, color: C.accent }}>{fmt(d.arv)}</div></div>
                  </div>
                  <div style={{ display: "flex", borderTop: `1px solid ${C.border}`, paddingTop: 12 }}><div style={{ flex: 1 }}><Stat label="Est. Rehab" value={fmt(d.rehab)} color={C.amber} /></div><div style={{ flex: 1, textAlign: "right" }}><Stat label="Approved Loan" value={fmt(ln.loanAmt)} color={C.sky} /></div></div>
                </div>
              </div>); })}
          </div>}
        </>}

        {mode === "borrower" && bView === "pipeline" && (requests.length === 0 ? <div style={{ textAlign: "center", padding: "80px 20px", color: C.muted }}><div style={{ fontSize: 40, marginBottom: 12 }}>📋</div><div style={{ fontSize: 17, fontWeight: 700, color: C.text }}>No requests yet</div></div> :
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}><h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>My Requests</h2>
            {requests.map(r => { const deal = getDealForLead(r); const sc = {pending:C.amber,approved:C.accent,contacted:C.sky,closed:C.muted}[r.status]||C.amber; const sbc = {pending:C.amberLight,approved:C.accentLight,contacted:C.skyLight,closed:C.surface}[r.status]||C.amberLight; return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "16px 20px", gap: 14, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 160 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{deal.type} · {deal.market}</div><div style={{ fontSize: 13, color: C.sub }}>{fmt(deal.price)} → ARV {fmt(deal.arv)}</div></div>
                <Tag color={sc} bg={sbc}>{r.status}</Tag><div style={{ fontSize: 12, color: C.muted }}>{new Date(r.created_at).toLocaleDateString()}</div>
              </div>); })}
          </div>)}

        {mode === "admin" && aView === "deals" && <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <div><h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>{isMaster ? "All Deals" : "My Deals"}</h2><p style={{ fontSize: 13, color: C.sub }}>{myDeals.length} total · {myDeals.filter(d=>d.active&&d.approval_status==="approved").length} live</p></div>
            <Btn primary onClick={openNewDeal}>+ Add Deal</Btn>
          </div>
          {myDeals.length === 0 ? <div style={{ textAlign: "center", padding: "50px 20px", color: C.muted }}>No deals yet. Click "+ Add Deal" to create one.</div> :
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{myDeals.map(d => { const ln = calcLoan(d); return (
            <div key={d.id} style={{ display: "flex", alignItems: "center", background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "12px 18px", gap: 14, flexWrap: "wrap", opacity: d.active ? 1 : 0.45 }}>
              <div style={{ width: 56, height: 42, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: C.surface }}><img src={getPhoto(d)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e=>{e.target.style.display="none";}} /></div>
              <div style={{ flex: 2, minWidth: 180 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 3, flexWrap: "wrap" }}><Tag color={C.accent} bg={C.accentLight}>{d.type}</Tag><Tag color={C.sky} bg={C.skyLight}>{d.market}</Tag>
                  {d.approval_status === "pending" && <Tag color={C.amber} bg={C.amberLight}>Pending</Tag>}
                  {d.approval_status === "rejected" && <Tag color={C.red} bg={C.redLight}>Rejected</Tag>}
                  {!d.active && d.approval_status === "approved" && <Tag color={C.red} bg={C.redLight}>Paused</Tag>}
                </div>
                <div style={{ fontSize: 12, color: C.sub }}>{d.submitted_by || "—"} · ZIP {d.zip}</div>
              </div>
              <div style={{ display: "flex", gap: 16 }}><Stat label="Price" value={fmt(d.price)} /><Stat label="ARV" value={fmt(d.arv)} /></div>
              <Stat label="Loan" value={fmt(ln.loanAmt)} color={C.accent} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {d.approval_status === "approved" && <Btn small onClick={() => toggleActive(d.id)}>{d.active ? "Pause" : "Go Live"}</Btn>}
                <Btn small onClick={() => openEditDeal(d)}>Edit</Btn>
                <Btn small danger onClick={() => setConfirmDelete(d.id)}>×</Btn>
              </div>
            </div>); })}</div>}
        </>}

        {mode === "admin" && aView === "pending" && isMaster && <>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Pending Approval ({pendingDeals.length})</h2>
          {pendingDeals.length === 0 ? <div style={{ textAlign: "center", padding: "50px 20px", color: C.muted }}>No deals waiting for approval.</div> :
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{pendingDeals.map(d => { const ln = calcLoan(d); return (
            <div key={d.id} style={{ display: "flex", alignItems: "center", background: C.card, borderRadius: 14, border: `2px solid ${C.amber}`, padding: "14px 18px", gap: 14, flexWrap: "wrap" }}>
              <div style={{ width: 56, height: 42, borderRadius: 8, overflow: "hidden", background: C.surface }}><img src={getPhoto(d)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e=>{e.target.style.display="none";}} /></div>
              <div style={{ flex: 2, minWidth: 180 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 3 }}><Tag color={C.accent} bg={C.accentLight}>{d.type}</Tag><Tag color={C.sky} bg={C.skyLight}>{d.market}</Tag></div>
                <div style={{ fontSize: 12, color: C.sub }}>Submitted by: <strong>{d.submitted_by}</strong></div>
              </div>
              <div style={{ display: "flex", gap: 16 }}><Stat label="Price" value={fmt(d.price)} /><Stat label="ARV" value={fmt(d.arv)} /><Stat label="Rehab" value={fmt(d.rehab)} /></div>
              <Stat label="Loan" value={fmt(ln.loanAmt)} color={C.accent} />
              <div style={{ display: "flex", gap: 6 }}>
                <Btn small primary onClick={() => approveDeal(d.id)}>✓ Approve</Btn>
                <Btn small onClick={() => openEditDeal(d)}>Edit</Btn>
                <Btn small danger onClick={() => rejectDeal(d.id)}>✗ Reject</Btn>
              </div>
            </div>); })}</div>}
        </>}

        {mode === "admin" && aView === "leads" && <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
            {[{l:"Requests",v:myLeads.length,c:C.text,bg:C.surface},{l:"Unique",v:new Set(myLeads.map(r=>r.email)).size,c:C.sky,bg:C.skyLight},{l:"Pending",v:myLeads.filter(r=>r.status==="pending").length,c:C.amber,bg:C.amberLight},{l:"Approved",v:myLeads.filter(r=>r.status==="approved").length,c:C.accent,bg:C.accentLight}].map((s,i) =>
              <div key={i} style={{ background: s.bg, borderRadius: 14, padding: "18px 20px", border: `1px solid ${C.border}` }}><div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{s.l}</div><div style={{ fontSize: 28, fontWeight: 800, color: s.c, letterSpacing: -1 }}>{s.v}</div></div>)}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}><h2 style={{ fontSize: 18, fontWeight: 700 }}>Lead Pipeline</h2><Btn small primary onClick={exportCSV}>Export CSV</Btn></div>
          {myLeads.length === 0 ? <div style={{ textAlign: "center", padding: "50px 20px", color: C.muted }}>No leads yet.</div> :
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{myLeads.map(r => { const deal = getDealForLead(r); const sc = {pending:C.amber,approved:C.accent,contacted:C.sky,closed:C.muted}[r.status]||C.amber; const sbc = {pending:C.amberLight,approved:C.accentLight,contacted:C.skyLight,closed:C.surface}[r.status]||C.amberLight; return (
            <div key={r.id} style={{ display: "flex", alignItems: "center", background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "14px 20px", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 150 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{deal.type} · {deal.market}</div><div style={{ fontSize: 12, color: C.sub }}>{fmt(deal.price)} → {fmt(deal.arv)}</div></div>
              <div style={{ flex: 1, minWidth: 140 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div><div style={{ fontSize: 12, color: C.sub }}>{r.email}</div><div style={{ fontSize: 12, color: C.muted }}>{r.phone}</div></div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Tag color={sc} bg={sbc}>{r.status}</Tag>
                <select style={{ ...selectSt, fontSize: 12, padding: "5px 10px" }} value={r.status} onChange={e => updateReqStatus(r.id, e.target.value)}>{["pending","contacted","approved","closed"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}</select>
              </div>
              <div style={{ fontSize: 11, color: C.muted }}>{new Date(r.created_at).toLocaleDateString()}</div>
            </div>); })}</div>}
        </>}

        {mode === "admin" && aView === "users" && isMaster && <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div><h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>Manage Users</h2><p style={{ fontSize: 13, color: C.sub }}>{admins.length} accounts</p></div>
            <Btn primary onClick={() => { setEditingUser(null); setUserForm({ name: "", email: "", password: "" }); setUserFormErrors({}); setShowUserForm(true); }}>+ Add Wholesaler</Btn>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{admins.map(u =>
            <div key={u.id} style={{ display: "flex", alignItems: "center", background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "14px 20px", gap: 14, flexWrap: "wrap", opacity: u.active ? 1 : 0.45 }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: C.sub }}>{u.email}</div>
              </div>
              <Tag color={u.role === "master" ? C.violet : C.sky} bg={u.role === "master" ? C.violetLight : C.skyLight}>{u.role}</Tag>
              {u.role !== "master" && <div style={{ display: "flex", gap: 6 }}>
                <Btn small onClick={() => toggleUserActive(u.id)}>{u.active ? "Disable" : "Enable"}</Btn>
                <Btn small onClick={() => { setEditingUser(u.id); setUserForm({ name: u.name, email: u.email, password: "" }); setUserFormErrors({}); setShowUserForm(true); }}>Edit</Btn>
                <Btn small danger onClick={() => setConfirmDeleteUser(u.id)}>×</Btn>
              </div>}
            </div>)}
          </div>
        </>}

        {mode === "admin" && aView === "settings" && <>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Loan Settings</h2>
          <p style={{ fontSize: 14, color: C.sub, marginBottom: 24 }}>Auto-calc: lesser of 90% LTC or 70% ARV. Override per deal with manual amount.</p>
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Preview — $200K purchase + $50K rehab / $350K ARV:</div>
            {(() => { const p = calcLoan({ price: 200000, arv: 350000, rehab: 50000, max_loan: 0 }); return <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}><Stat label="90% LTC" value={fmt(p.ltcAmount)} /><Stat label="70% ARV" value={fmt(p.arvAmount)} /><Stat label="Result (lesser)" value={fmt(p.loanAmt)} color={C.accent} big /></div>; })()}
          </div>
        </>}

        {/* Add to Home Screen - only on borrower view */}
        {mode === "borrower" && bView === "deals" && !showInstallDismissed && (
          <div style={{ textAlign: "center", padding: "40px 20px 20px" }}>
            <button onClick={() => {
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
              const isAndroid = /Android/.test(navigator.userAgent);
              if (isIOS) {
                flash("Tap the Share button ↑ then 'Add to Home Screen'");
              } else if (isAndroid) {
                flash("Tap the ⋮ menu then 'Add to Home Screen'");
              } else {
                flash("Use your browser menu to add this page to your home screen");
              }
              setShowInstallDismissed(true);
            }} style={{ background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", fontFamily: FONT, textDecoration: "underline", padding: "8px 16px" }}>
              Add to Home Screen
            </button>
          </div>
        )}
      </div>

      {selectedDeal && <Modal onClose={() => setSelectedDeal(null)} wide>
        <div style={{ position: "relative", height: 220, overflow: "hidden", borderRadius: "20px 20px 0 0", background: C.surface }}>
          <img src={getPhoto(selectedDeal)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e=>{e.target.style.display="none";}} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%, rgba(0,0,0,0.6))" }} />
          <button onClick={() => setSelectedDeal(null)} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "none", borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 18 }}>×</button>
          <div style={{ position: "absolute", bottom: 16, left: 24, right: 24 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}><Tag color="#fff" bg="rgba(255,255,255,0.2)">{selectedDeal.type}</Tag><Tag color="#fff" bg="rgba(255,255,255,0.2)">{selectedDeal.beds}bd / {selectedDeal.baths}ba · {Number(selectedDeal.sqft).toLocaleString()} sqft</Tag></div>
            <div style={{ fontSize: 15, color: "#fff", fontWeight: 700, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{selectedDeal.market}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", marginTop: 2 }}>ZIP {selectedDeal.zip}</div>
          </div>
        </div>
        <div style={{ padding: "20px 28px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
            <div><div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase" }}>Purchase Price</div><div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1 }}>{fmt(selectedDeal.price)}</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase" }}>After Repair Value</div><div style={{ fontSize: 22, fontWeight: 700, color: C.accent }}>{fmt(selectedDeal.arv)}</div></div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Pre-Approved Bridge Loan</div>
          <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: 20 }}>
            {(() => { const ln = calcLoan(selectedDeal); return <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><Stat label="Approved Loan Amount" value={fmt(ln.loanAmt)} color={C.accent} big /><Stat label="Estimated Rehab" value={fmt(selectedDeal.rehab)} color={C.amber} big /></div>
              <div style={{ marginTop: 18, padding: "14px 18px", background: `linear-gradient(135deg, ${C.accentLight}, #F0FDFA)`, borderRadius: 12, border: `1px solid ${C.accentMed}` }}><div style={{ fontSize: 15, fontWeight: 700, color: C.accent, lineHeight: 1.5 }}>Get up to 90% LTC including 100% of the rehab, 3 days closing</div></div>
            </>; })()}
          </div>
          {selectedDeal.notes && <div style={{ marginTop: 14, fontSize: 14, color: C.sub, lineHeight: 1.6, padding: "12px 16px", background: C.surface, borderRadius: 10, border: `1px solid ${C.border}` }}>{selectedDeal.notes}</div>}
          <div style={{ marginTop: 20 }}>{alreadyRequested(selectedDeal.id) ? <Btn disabled full>✓ Address Requested</Btn> : <Btn primary full onClick={() => { setSelectedDeal(null); handleRequestDeal(selectedDeal.id); }}>Request Full Address & Details →</Btn>}</div>
        </div>
      </Modal>}

      {showLeadGate && <Modal onClose={() => setShowLeadGate(false)}>
        <ModalHead title="Unlock Deal Details" subtitle="Enter your contact info to receive the full address." onClose={() => setShowLeadGate(false)} />
        <div style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Full Name" value={lead.name} onChange={v => setLead(p => ({...p, name: v}))} error={leadErrors.name} placeholder="John Smith" />
          <Input label="Email" value={lead.email} onChange={v => setLead(p => ({...p, email: v}))} error={leadErrors.email} placeholder="john@example.com" type="email" />
          <Input label="Phone" value={lead.phone} onChange={v => setLead(p => ({...p, phone: v}))} error={leadErrors.phone} placeholder="(555) 123-4567" type="tel" />
          <Btn primary full onClick={submitLead}>Submit & Get Deal Info</Btn>
          <div style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>Your info is used solely to send you this deal's details.</div>
        </div>
      </Modal>}

      {showLogin && <Modal onClose={() => { setShowLogin(false); setLoginError(""); }}>
        <ModalHead title="Admin Login" onClose={() => { setShowLogin(false); setLoginError(""); }} />
        <div style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          {loginError && <div style={{ background: C.redLight, color: C.red, padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>{loginError}</div>}
          <Input label="Email" value={loginForm.email} onChange={v => setLoginForm(p => ({...p, email: v}))} placeholder="Enter admin email" type="email" onKeyDown={e => { if (e.key === "Enter") handleLogin(); }} />
          <Input label="Password" value={loginForm.password} onChange={v => setLoginForm(p => ({...p, password: v}))} placeholder="••••••••" type="password" onKeyDown={e => { if (e.key === "Enter") handleLogin(); }} />
          <button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); handleLogin(); }} style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: C.accent, color: "#fff", fontFamily: FONT, fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%", boxShadow: `0 2px 12px ${C.accentGlow}` }}>Sign In</button>
        </div>
      </Modal>}

      {showDealForm && <Modal onClose={() => setShowDealForm(false)} wide>
        <ModalHead title={editingDeal ? "Edit Deal" : "Add New Deal"} onClose={() => setShowDealForm(false)} />
        <div style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {isMaster && <Input label="Wholesaler (internal)" value={dealForm.wholesaler||""} onChange={v => setDealForm(p => ({...p, wholesaler: v}))} placeholder="Internal note" />}
            <Input label="Market" value={dealForm.market||""} onChange={v => setDealForm(p => ({...p, market: v}))} error={dealFormErrors.market} placeholder="Miami-Dade, FL" />
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Input label="ZIP" value={dealForm.zip||""} onChange={v => setDealForm(p => ({...p, zip: v}))} error={dealFormErrors.zip} placeholder="33162" small />
            <div style={{ flex: 1, minWidth: 120 }}><label style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 6, display: "block" }}>Type</label><select style={{ ...selectSt, width: "100%", padding: "12px 14px" }} value={dealForm.type||"Single Family"} onChange={e => setDealForm(p => ({...p, type: e.target.value}))}>{["Single Family","Duplex","Triplex","Quadplex","Townhouse","Condo"].map(t => <option key={t}>{t}</option>)}</select></div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Input label="Beds" value={dealForm.beds||""} onChange={v => setDealForm(p => ({...p, beds: v}))} small type="number" />
            <Input label="Baths" value={dealForm.baths||""} onChange={v => setDealForm(p => ({...p, baths: v}))} small type="number" />
            <Input label="Sq Ft" value={dealForm.sqft||""} onChange={v => setDealForm(p => ({...p, sqft: v}))} error={dealFormErrors.sqft} small type="number" />
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Input label="Purchase Price ($)" value={dealForm.price||""} onChange={v => setDealForm(p => ({...p, price: v}))} error={dealFormErrors.price} small type="number" />
            <Input label="ARV ($)" value={dealForm.arv||""} onChange={v => setDealForm(p => ({...p, arv: v}))} error={dealFormErrors.arv} small type="number" />
            <Input label="Rehab Est. ($)" value={dealForm.rehab||""} onChange={v => setDealForm(p => ({...p, rehab: v}))} error={dealFormErrors.rehab} small type="number" />
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <Input label="Approved Loan Amount ($)" value={dealForm.max_loan||""} onChange={v => setDealForm(p => ({...p, max_loan: v}))} placeholder="Leave blank for auto-calc" type="number" />
            {!dealForm.max_loan && dealForm.arv && dealForm.price && <div style={{ fontSize: 11, color: C.muted, paddingBottom: 12, lineHeight: 1.5 }}>Auto: {fmt(Math.min((+dealForm.price+(+dealForm.rehab||0))*0.90, +dealForm.arv*0.70))}<br/><span style={{ fontSize: 10 }}>90% LTC: {fmt((+dealForm.price+(+dealForm.rehab||0))*0.90)} · 70% ARV: {fmt(+dealForm.arv*0.70)}</span></div>}
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 6, display: "block" }}>Deal Photo</label>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
              <label style={{ padding: "10px 20px", borderRadius: 10, background: C.accent, color: "#fff", fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>📷 Upload Photo<input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (!f) return; if (f.size > 2*1024*1024) { flash("Max 2MB"); return; } const r = new FileReader(); r.onload = ev => setDealForm(p => ({...p, image_url: ev.target.result})); r.readAsDataURL(f); }} /></label>
              <div style={{ fontSize: 12, color: C.muted, paddingTop: 4 }}>or paste URL below</div>
            </div>
            <div style={{ marginTop: 10 }}><input style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.surface, color: C.text, fontFamily: FONT, fontSize: 13, outline: "none", boxSizing: "border-box" }} placeholder="https://example.com/photo.jpg" value={dealForm.image_url && !dealForm.image_url.startsWith("data:") ? dealForm.image_url : ""} onChange={e => setDealForm(p => ({...p, image_url: e.target.value}))} /></div>
            {dealForm.image_url?.trim() && <div style={{ marginTop: 10, borderRadius: 12, overflow: "hidden", height: 140, background: C.surface, border: `1px solid ${C.border}`, position: "relative" }}><img src={dealForm.image_url.trim()} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e=>{e.target.style.display="none";}} /><button onClick={() => setDealForm(p => ({...p, image_url: ""}))} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.5)", border: "none", borderRadius: 6, width: 26, height: 26, color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button></div>}
          </div>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 6, display: "block" }}>Notes</label><textarea style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.surface, color: C.text, fontFamily: FONT, fontSize: 14, outline: "none", boxSizing: "border-box", minHeight: 70, resize: "vertical" }} value={dealForm.notes||""} onChange={e => setDealForm(p => ({...p, notes: e.target.value}))} /></div>
          <Btn primary full onClick={saveDeal}>{editingDeal ? "Save Changes" : isMaster ? "Add Deal" : "Submit for Approval"}</Btn>
          {!isMaster && !editingDeal && <div style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>Your deal will be reviewed by CasaHub before going live.</div>}
        </div>
      </Modal>}

      {showUserForm && <Modal onClose={() => setShowUserForm(false)}>
        <ModalHead title={editingUser ? "Edit User" : "Add Wholesaler Account"} onClose={() => setShowUserForm(false)} />
        <div style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Name" value={userForm.name} onChange={v => setUserForm(p => ({...p, name: v}))} error={userFormErrors.name} placeholder="John's Wholesale Co" />
          <Input label="Email" value={userForm.email} onChange={v => setUserForm(p => ({...p, email: v}))} error={userFormErrors.email} placeholder="john@casahub.com" />
          <Input label={editingUser ? "New Password (leave blank to keep)" : "Password"} value={userForm.password} onChange={v => setUserForm(p => ({...p, password: v}))} error={userFormErrors.password} placeholder="Min 6 characters" type="password" />
          <Btn primary full onClick={saveUser}>{editingUser ? "Save Changes" : "Create Account"}</Btn>
        </div>
      </Modal>}

      {confirmDelete && <Modal onClose={() => setConfirmDelete(null)}><div style={{ padding: "32px 28px", textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Delete this deal?</div><div style={{ fontSize: 14, color: C.sub, marginBottom: 24 }}>This can't be undone.</div><div style={{ display: "flex", gap: 10, justifyContent: "center" }}><Btn onClick={() => setConfirmDelete(null)}>Cancel</Btn><Btn danger onClick={() => deleteDeal(confirmDelete)}>Delete</Btn></div></div></Modal>}

      {confirmDeleteUser && <Modal onClose={() => setConfirmDeleteUser(null)}><div style={{ padding: "32px 28px", textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Remove this user?</div><div style={{ fontSize: 14, color: C.sub, marginBottom: 24 }}>They'll lose access immediately.</div><div style={{ display: "flex", gap: 10, justifyContent: "center" }}><Btn onClick={() => setConfirmDeleteUser(null)}>Cancel</Btn><Btn danger onClick={() => deleteUser(confirmDeleteUser)}>Remove</Btn></div></div></Modal>}

      {toast && <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: C.accent, color: "#fff", padding: "14px 28px", borderRadius: 14, fontWeight: 700, fontSize: 14, zIndex: 200, boxShadow: `0 8px 30px ${C.accentGlow}`, animation: "fadeUp 0.3s ease", whiteSpace: "nowrap" }}>{toast}</div>}
    </div>
  );
}
