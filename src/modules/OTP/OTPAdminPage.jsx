import { useState, useEffect, useCallback } from "react";

const ALLOWED_PATH = "/_OTP";
const BASE = import.meta.env.VITE_API_BASE || "https://aavie-backend-d4ju.onrender.com";
const PAGE_SIZE = 10;

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
}
function fmtCreated(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day:"2-digit", month:"short" }) +
    ", " + d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
}
function isPast(iso) { return iso && new Date(iso) < new Date(); }

// ── Pills ──────────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg = {
    used:    { bg:"#EAF3DE", color:"#27500A", label:"Used" },
    active:  { bg:"#DBEAFE", color:"#1E40AF", label:"Active" },
    expired: { bg:"#FEE2E2", color:"#991B1B", label:"Expired" },
  };
  const s = cfg[status] || cfg.expired;
  return <span style={{ display:"inline-block", fontSize:11, padding:"3px 11px",
    borderRadius:20, fontWeight:600, background:s.bg, color:s.color, whiteSpace:"nowrap" }}>{s.label}</span>;
}

function UserTypePill({ type }) {
  const cfg = {
    new:      { bg:"#EDE9FE", color:"#4C1D95", label:"New user" },
    existing: { bg:"#FEF3C7", color:"#78350F", label:"Existing" },
    test:     { bg:"#F1EFE8", color:"#444441", label:"Test" },
  };
  const s = cfg[type] || cfg.existing;
  return <span style={{ display:"inline-block", fontSize:11, padding:"3px 11px",
    borderRadius:20, fontWeight:600, background:s.bg, color:s.color, whiteSpace:"nowrap" }}>{s.label}</span>;
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, accent, icon, loading }) {
  return (
    <div style={{ background:"#fff", borderRadius:12, padding:"16px 18px", flex:"1 1 130px", minWidth:0,
      border:"1px solid #F3F4F6", borderLeft:`4px solid ${accent}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize:12, color:"#6B7280", marginBottom:6, display:"flex", alignItems:"center", gap:5 }}>
        <span style={{ fontSize:14 }}>{icon}</span>{label}
      </div>
      <div style={{ fontSize:26, fontWeight:700, color:loading ? "#E5E7EB" : accent, lineHeight:1 }}>
        {loading ? "···" : value}
      </div>
    </div>
  );
}

// ── Skeleton row ───────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr>
      {[140,70,60,70,100,60].map((w,i) => (
        <td key={i} style={{ padding:"13px 10px" }}>
          <div style={{ height:12, width:w, borderRadius:6, background:"#F3F4F6",
            animation:"pulse 1.4s ease-in-out infinite" }} />
        </td>
      ))}
    </tr>
  );
}

// ── Pagination controls ────────────────────────────────────────────────────
function Pagination({ page, totalPages, total, pageSize, onChange }) {
  if (totalPages <= 1) return null;

  const from = page * pageSize + 1;
  const to   = Math.min((page + 1) * pageSize, total);

  // Build page number buttons — show max 5 around current
  const pages = [];
  let start = Math.max(0, page - 2);
  let end   = Math.min(totalPages - 1, page + 2);
  if (end - start < 4) {
    if (start === 0) end = Math.min(4, totalPages - 1);
    else start = Math.max(0, end - 4);
  }
  for (let i = start; i <= end; i++) pages.push(i);

  const btnBase = {
    minWidth:32, height:32, borderRadius:8, border:"1px solid #E5E7EB",
    background:"#fff", color:"#374151", cursor:"pointer", fontSize:13,
    display:"flex", alignItems:"center", justifyContent:"center", fontWeight:500,
    transition:"all 0.15s",
  };
  const btnActive = { ...btnBase, background:"#4F46E5", color:"#fff", border:"1.5px solid #4F46E5", fontWeight:700 };
  const btnDisabled = { ...btnBase, opacity:0.35, cursor:"not-allowed" };

  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"12px 18px", borderTop:"1px solid #F3F4F6", flexWrap:"wrap", gap:8 }}>

      {/* Record count */}
      <span style={{ fontSize:12, color:"#9CA3AF" }}>
        Showing <b style={{ color:"#374151" }}>{from}–{to}</b> of <b style={{ color:"#374151" }}>{total}</b> records
      </span>

      {/* Page buttons */}
      <div style={{ display:"flex", gap:4, alignItems:"center" }}>
        {/* First */}
        <button onClick={() => onChange(0)} disabled={page===0}
          style={page===0 ? btnDisabled : btnBase} title="First page">
          «
        </button>
        {/* Prev */}
        <button onClick={() => onChange(page-1)} disabled={page===0}
          style={page===0 ? btnDisabled : btnBase} title="Previous">
          ‹
        </button>

        {/* Ellipsis left */}
        {start > 0 && <span style={{ color:"#9CA3AF", fontSize:13, padding:"0 2px" }}>…</span>}

        {/* Page numbers */}
        {pages.map(p => (
          <button key={p} onClick={() => onChange(p)}
            style={p === page ? btnActive : btnBase}>
            {p + 1}
          </button>
        ))}

        {/* Ellipsis right */}
        {end < totalPages - 1 && <span style={{ color:"#9CA3AF", fontSize:13, padding:"0 2px" }}>…</span>}

        {/* Next */}
        <button onClick={() => onChange(page+1)} disabled={page===totalPages-1}
          style={page===totalPages-1 ? btnDisabled : btnBase} title="Next">
          ›
        </button>
        {/* Last */}
        <button onClick={() => onChange(totalPages-1)} disabled={page===totalPages-1}
          style={page===totalPages-1 ? btnDisabled : btnBase} title="Last page">
          »
        </button>
      </div>
    </div>
  );
}

// ── OTP Table ──────────────────────────────────────────────────────────────
function OTPTable({ records, showOtp, filter, loading, error, page, onPageChange }) {
  // 1. Filter first
  const filtered = filter === "all" ? records : records.filter(r => r.status === filter);

  // 2. Paginate
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage   = Math.min(page, Math.max(0, totalPages - 1));
  const rows       = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  if (error) {
    return (
      <div style={{ textAlign:"center", padding:"36px 20px" }}>
        <div style={{ fontSize:28, marginBottom:8 }}>⚠️</div>
        <div style={{ color:"#DC2626", fontWeight:600, fontSize:13, marginBottom:4 }}>Failed to load records</div>
        <div style={{ color:"#6B7280", fontSize:12 }}>{error}</div>
      </div>
    );
  }

  return (
    <>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* Scrollable table area — fixed height so it doesn't push layout */}
      <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, minWidth:580 }}>
          <thead>
            <tr style={{ borderBottom:"1.5px solid #F3F4F6", position:"sticky", top:0, background:"#fff" }}>
              {["Mobile number","OTP code","Status","User type","Created","Expires"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"9px 10px", color:"#9CA3AF",
                  fontWeight:500, whiteSpace:"nowrap", fontSize:11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array(PAGE_SIZE).fill(0).map((_, i) => <SkeletonRow key={i} />)
              : rows.length === 0
                ? <tr><td colSpan={6} style={{ textAlign:"center", padding:"40px 0",
                    color:"#9CA3AF", fontSize:13 }}>No records for this filter.</td></tr>
                : rows.map((row, i) => (
                  <tr key={row.id || i} style={{
                    borderBottom: i < rows.length-1 ? "1px solid #F9FAFB" : "none",
                    background: row.userType==="test" ? "#FFFBF5" : i%2===0 ? "#fff" : "#FAFAFA",
                    transition:"background 0.1s",
                  }}>
                    <td style={{ padding:"11px 10px", fontFamily:"monospace", fontSize:12,
                      color:"#374151", whiteSpace:"nowrap" }}>
                      {row.userType==="test" && (
                        <span style={{ marginRight:5, fontSize:10, background:"#F1EFE8",
                          color:"#444441", borderRadius:3, padding:"1px 4px", fontFamily:"sans-serif" }}>TEST</span>
                      )}
                      {row.mobile}
                    </td>
                    <td style={{ padding:"11px 10px", fontFamily:"monospace", fontSize:13 }}>
                      {showOtp || row.userType==="test"
                        ? <span style={{ color:row.userType==="test" ? "#92400E" : "#111827", fontWeight:700 }}>{row.otp}</span>
                        : <span style={{ color:"#D1D5DB", letterSpacing:3 }}>••••••</span>}
                    </td>
                    <td style={{ padding:"11px 10px" }}><StatusPill status={row.status} /></td>
                    <td style={{ padding:"11px 10px" }}><UserTypePill type={row.userType} /></td>
                    <td style={{ padding:"11px 10px", color:"#6B7280", fontSize:11, whiteSpace:"nowrap" }}>
                      {fmtCreated(row.createdAt)}
                    </td>
                    <td style={{ padding:"11px 10px", fontSize:11, whiteSpace:"nowrap" }}>
                      <span style={{ color:isPast(row.expiresAt) ? "#DC2626" : "#15803D", fontWeight:600 }}>
                        {fmtTime(row.expiresAt)}
                      </span>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Pagination bar */}
      {!loading && !error && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={onPageChange}
        />
      )}
    </>
  );
}

// ── Access Denied ──────────────────────────────────────────────────────────
function AccessDenied() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
      padding:80, fontFamily:"system-ui,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:12 }}>🔒</div>
        <h2 style={{ fontSize:20, fontWeight:700, color:"#111827", marginBottom:6 }}>Access denied</h2>
        <p style={{ color:"#6B7280", fontSize:13 }}>Navigate to <code>/_OTP</code> to access this panel.</p>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function OTPAdminPage() {
  if (window.location.pathname !== ALLOWED_PATH) return <AccessDenied />;

  const [filter,      setFilter]      = useState("all");
  const [page,        setPage]        = useState(0);   // ← pagination state
  const [showOtp,     setShowOtp]     = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [records,     setRecords]     = useState([]);
  const [stats,       setStats]       = useState({ total:0, verified:0, expired:0, newUsers:0 });
  const [loadingRec,  setLoadingRec]  = useState(true);
  const [loadingStat, setLoadingStat] = useState(true);
  const [errorRec,    setErrorRec]    = useState(null);
  const [waking,      setWaking]      = useState(false);

  // Reset to page 0 whenever filter changes
  useEffect(() => { setPage(0); }, [filter]);

  const fetchData = useCallback(async () => {
    setLoadingRec(true);
    setLoadingStat(true);
    setErrorRec(null);
    setWaking(false);
    setPage(0);

    const wakeTimer = setTimeout(() => setWaking(true), 3000);

    try {
      let token = "";
try {
  const raw = localStorage.getItem("aavie-admin-auth");
  if (raw) {
    const parsed = JSON.parse(raw);
    token = parsed?.state?.token || "";
  }
} catch {}
const headers = token ? { "Authorization": `Bearer ${token}` } : {};

      const [recRes, statRes] = await Promise.all([
        fetch(`${BASE}/api/admin/otp/records`, { headers }),
        fetch(`${BASE}/api/admin/otp/stats`,   { headers }),
      ]);

      clearTimeout(wakeTimer);
      setWaking(false);

      if (!recRes.ok)  throw new Error(`Records API returned ${recRes.status}`);
      if (!statRes.ok) throw new Error(`Stats API returned ${statRes.status}`);

      const recData  = await recRes.json();
      const statData = await statRes.json();

      const mapped = recData.map(r => ({
        id:        r.id,
        mobile:    r.mobile,
        otp:       r.otp,
        status:    r.status,
        userType:  r.isTestNumber ? "test" : r.isNewUser ? "new" : "existing",
        createdAt: r.createdAt,
        expiresAt: r.expiresAt,
      }));

      setRecords(mapped);
      setStats({
        total:    statData.total    ?? 0,
        verified: statData.verified ?? 0,
        expired:  statData.expired  ?? 0,
        newUsers: statData.newUsers ?? 0,
      });

    } catch (err) {
      clearTimeout(wakeTimer);
      setWaking(false);
      setErrorRec(err.message || "Could not reach backend");
    } finally {
      setLoadingRec(false);
      setLoadingStat(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Counts per filter tab
  const counts = {
    all:     records.length,
    active:  records.filter(r => r.status==="active").length,
    used:    records.filter(r => r.status==="used").length,
    expired: records.filter(r => r.status==="expired").length,
  };

  const FILTERS = [
    { key:"all",     label:`All (${counts.all})` },
    { key:"active",  label:`Active (${counts.active})` },
    { key:"used",    label:`Used (${counts.used})` },
    { key:"expired", label:`Expired (${counts.expired})` },
  ];

  const ENDPOINTS = [
    { step:"1", method:"POST", path:"/api/auth/send-otp",
      desc:"Send 6-digit OTP via 2Factor SMS. 10 min expiry for real numbers, 60 min for test account." },
    { step:"2", method:"POST", path:"/api/auth/verify-otp",
      desc:"Validate OTP, mark as used, create user if new, return JWT for complete profiles." },
    { step:"3", method:"POST", path:"/api/auth/complete-profile",
      desc:"Save name, age, city, gender. Optional: email, height, weight. Returns JWT on success." },
  ];

  const card = { background:"#fff", borderRadius:12, border:"1px solid #F3F4F6",
    boxShadow:"0 1px 4px rgba(0,0,0,0.04)" };

  return (
    <div style={{ width:"100%", padding:"20px 24px", boxSizing:"border-box",
      fontFamily:"'Inter',system-ui,sans-serif", background:"#F8F9FB", minHeight:"100%" }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:9,
            background:"linear-gradient(135deg,#4F46E5,#7C3AED)",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:17, color:"#111827", lineHeight:1.2 }}>OTP Admin Panel</div>
            <div style={{ fontSize:11, color:"#9CA3AF" }}>Live data · {BASE}</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:11, fontFamily:"monospace", background:"#F3F4F6",
            color:"#6B7280", padding:"4px 10px", borderRadius:6 }}>/_OTP</span>
          <button onClick={fetchData} disabled={loadingRec}
            style={{ fontSize:12, padding:"6px 14px", borderRadius:8, border:"1px solid #E5E7EB",
              background:"#fff", color:"#374151", cursor:loadingRec ? "not-allowed":"pointer",
              display:"flex", alignItems:"center", gap:5, fontWeight:500, opacity:loadingRec ? 0.6:1 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ animation:loadingRec ? "spin 1s linear infinite":"none" }}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {loadingRec ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* ── Render wake banner ───────────────────────────────────────────── */}
      {waking && (
        <div style={{ background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:10,
          padding:"11px 16px", display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"
            style={{ flexShrink:0, animation:"spin 1.2s linear infinite" }}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          <span style={{ fontSize:12, color:"#1D4ED8", fontWeight:500 }}>
            Waking up Render backend — may take 30–60 seconds on the free plan…
          </span>
        </div>
      )}

      {/* ── Test bypass warning ──────────────────────────────────────────── */}
      <div style={{ background:"#FFFBEB", border:"1px solid #FCD34D", borderRadius:10,
        padding:"11px 16px", display:"flex", alignItems:"flex-start", gap:10, marginBottom:20 }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"
          style={{ flexShrink:0, marginTop:1 }}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <div>
          <span style={{ fontWeight:600, fontSize:12, color:"#92400E" }}>Play Store test bypass active — </span>
          <span style={{ fontSize:12, color:"#B45309" }}>
            <code style={{ background:"#FEF3C7", padding:"1px 5px", borderRadius:3, fontSize:11 }}>+91 1234567890</code>
            {" "}always receives OTP{" "}
            <code style={{ background:"#FEF3C7", padding:"1px 5px", borderRadius:3, fontSize:11 }}>123456</code>
            {" "}without real SMS. Valid for 60 min.
          </span>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:12, marginBottom:22 }}>
        <StatCard label="OTPs sent today"  value={stats.total}    accent="#4F46E5" icon="📤" loading={loadingStat} />
        <StatCard label="Verified"         value={stats.verified} accent="#15803D" icon="✅" loading={loadingStat} />
        <StatCard label="Expired / unused" value={stats.expired}  accent="#DC2626" icon="⏰" loading={loadingStat} />
        <StatCard label="New users today"  value={stats.newUsers} accent="#D97706" icon="🆕" loading={loadingStat} />
      </div>

      {/* ── 2-col layout ────────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:18, alignItems:"start" }}>

        {/* LEFT — table card */}
        <div style={{ ...card, overflow:"hidden" }}>

          {/* Table header row */}
          <div style={{ padding:"16px 18px 0", display:"flex", alignItems:"center",
            justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontWeight:700, fontSize:14, color:"#111827" }}>OTP records</span>
              {!loadingRec && (
                <span style={{ fontSize:11, background:"#F3F4F6", color:"#6B7280",
                  padding:"2px 8px", borderRadius:20 }}>{records.length} total</span>
              )}
            </div>
            <button onClick={() => setShowOtp(v => !v)}
              style={{ fontSize:11, padding:"5px 12px", borderRadius:6, border:"1px solid #E5E7EB",
                background:showOtp ? "#EEF2FF":"#fff", color:showOtp ? "#4F46E5":"#6B7280",
                cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontWeight:500 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                {showOtp
                  ? <path strokeLinecap="round" strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                }
              </svg>
              {showOtp ? "Hide OTPs" : "Show OTPs"}
            </button>
          </div>

          {/* Filter tabs */}
          <div style={{ display:"flex", gap:6, padding:"12px 18px", flexWrap:"wrap" }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                style={{ fontSize:12, padding:"4px 13px", borderRadius:20, cursor:"pointer",
                  fontWeight:filter===f.key ? 600:400,
                  border:filter===f.key ? "1.5px solid #4F46E5":"1px solid #E5E7EB",
                  background:filter===f.key ? "#EEF2FF":"#fff",
                  color:filter===f.key ? "#4F46E5":"#6B7280" }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Table + pagination */}
          <OTPTable
            records={records}
            showOtp={showOtp}
            filter={filter}
            loading={loadingRec}
            error={errorRec}
            page={page}
            onPageChange={setPage}
          />

          {/* Last refreshed footer */}
          <div style={{ padding:"8px 18px", borderTop:"1px solid #F9FAFB",
            fontSize:11, color:"#C4C9D4", textAlign:"right" }}>
            Last refreshed: {lastRefresh.toLocaleTimeString("en-IN",
              { hour:"2-digit", minute:"2-digit", hour12:true })}
          </div>
        </div>

        {/* RIGHT — sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* API endpoints */}
          {/* <div style={{ ...card, padding:18 }}>
            <div style={{ fontWeight:700, fontSize:13, color:"#111827", marginBottom:14 }}>
              OTP flow — API endpoints
            </div>
            {ENDPOINTS.map((ep, i) => (
              <div key={ep.step} style={{ display:"flex", gap:12,
                paddingBottom:i<2?12:0, marginBottom:i<2?12:0,
                borderBottom:i<2?"1px solid #F3F4F6":"none" }}>
                <div style={{ width:22, height:22, borderRadius:"50%", flexShrink:0, marginTop:1,
                  background:["#EEF2FF","#EDE9FE","#DCFCE7"][i],
                  color:["#4F46E5","#4C1D95","#15803D"][i],
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, fontWeight:700 }}>{ep.step}</div>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                    <span style={{ fontSize:10, fontWeight:700, color:"#15803D",
                      background:"#DCFCE7", padding:"1px 5px", borderRadius:3 }}>{ep.method}</span>
                    <code style={{ fontSize:11, color:"#374151", fontFamily:"monospace" }}>{ep.path}</code>
                  </div>
                  <p style={{ fontSize:11, color:"#6B7280", lineHeight:1.55, margin:0 }}>{ep.desc}</p>
                </div>
              </div>
            ))}
          </div> */}

          {/* Backend status */}
          <div style={{ ...card, padding:18 }}>
            <div style={{ fontWeight:700, fontSize:13, color:"#111827", marginBottom:12 }}>Backend status</div>
            <div style={{ fontSize:12, color:"#6B7280", marginBottom:8 }}>
              <span style={{ fontFamily:"monospace", fontSize:11,
                background:"#F3F4F6", padding:"2px 6px", borderRadius:4 }}>{BASE}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:"50%",
                background:errorRec ? "#DC2626":loadingRec ? "#F59E0B":"#15803D",
                boxShadow:errorRec ? "0 0 0 3px #FEE2E2":loadingRec ? "0 0 0 3px #FEF3C7":"0 0 0 3px #DCFCE7" }} />
              <span style={{ fontSize:12, fontWeight:600,
                color:errorRec ? "#DC2626":loadingRec ? "#D97706":"#15803D" }}>
                {errorRec ? "Unreachable":loadingRec ? "Connecting…":"Connected"}
              </span>
            </div>
            {errorRec && (
              <div style={{ marginTop:8, fontSize:11, color:"#DC2626",
                background:"#FEF2F2", padding:"6px 10px", borderRadius:6 }}>{errorRec}</div>
            )}
          </div>

          {/* DB schema */}
          {/* <div style={{ ...card, padding:18 }}>
            <div style={{ fontWeight:700, fontSize:13, color:"#111827", marginBottom:12 }}>
              otp_verifications table
            </div>
            {[
              { col:"id",            type:"BIGINT",    note:"PK, auto-increment" },
              { col:"mobile_number", type:"VARCHAR",   note:"E.164 format (+91...)" },
              { col:"otp_code",      type:"CHAR(6)",   note:"6-digit random code" },
              { col:"is_used",       type:"BOOLEAN",   note:"true after verify" },
              { col:"created_at",    type:"TIMESTAMP", note:"set on @PrePersist" },
              { col:"expires_at",    type:"TIMESTAMP", note:"10 min / 60 min (test)" },
            ].map((row, i, arr) => (
              <div key={row.col} style={{ display:"flex", justifyContent:"space-between",
                alignItems:"flex-start", padding:"7px 0", gap:8,
                borderBottom:i<arr.length-1?"1px solid #F9FAFB":"none" }}>
                <div>
                  <code style={{ fontSize:12, color:"#4F46E5", fontFamily:"monospace" }}>{row.col}</code>
                  <div style={{ fontSize:10, color:"#9CA3AF", marginTop:1 }}>{row.note}</div>
                </div>
                <span style={{ fontSize:10, fontFamily:"monospace", color:"#6B7280",
                  background:"#F9FAFB", padding:"2px 6px", borderRadius:3, whiteSpace:"nowrap" }}>
                  {row.type}
                </span>
              </div>
            ))}
          </div> */}
        </div>
      </div>

      <div style={{ textAlign:"center", marginTop:28, color:"#D1D5DB", fontSize:11, paddingBottom:8 }}>
        Aavie OTP Admin · Live data from {BASE}
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}