import { useState, useEffect } from "react";

// ── Route guard ────────────────────────────────────────────────────────────
const ALLOWED_PATH = "/_OTP";

// ── Mock data — exact records from screenshot ──────────────────────────────
const MOCK_STATS = { total: 142, verified: 118, expired: 19, newUsers: 34 };

const MOCK_RECORDS = [
  { id: 1, mobile: "+91 98765 43210", otp: "847291", status: "used",    userType: "existing", created: "2025-06-23T05:02:00", expires: "2025-06-23T05:12:00" },
  { id: 2, mobile: "+91 91234 56789", otp: "553910", status: "active",  userType: "new",      created: "2025-06-23T05:15:00", expires: "2025-06-23T05:25:00" },
  { id: 3, mobile: "+91 70000 11111", otp: "334402", status: "expired", userType: "existing", created: "2025-06-23T04:28:00", expires: "2025-06-23T04:38:00" },
  { id: 4, mobile: "+91 12345 67890", otp: "123456", status: "active",  userType: "test",     created: "2025-06-23T04:31:00", expires: "2025-06-23T05:31:00" },
  { id: 5, mobile: "+91 88880 22222", otp: "991023", status: "used",    userType: "new",      created: "2025-06-23T03:50:00", expires: "2025-06-23T04:00:00" },
  { id: 6, mobile: "+91 77771 33333", otp: "210984", status: "expired", userType: "existing", created: "2025-06-23T03:10:00", expires: "2025-06-23T03:20:00" },
  { id: 7, mobile: "+91 66662 44444", otp: "778833", status: "used",    userType: "existing", created: "2025-06-23T02:45:00", expires: "2025-06-23T02:55:00" },
  { id: 8, mobile: "+91 55553 55555", otp: "445566", status: "active",  userType: "new",      created: "2025-06-23T05:20:00", expires: "2025-06-23T05:30:00" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function fmtCreated(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) +
    ", " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function isPast(iso) { return new Date(iso) < new Date(); }

// ── Pills ──────────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg = {
    used:    { bg: "#EAF3DE", color: "#27500A", label: "Used" },
    active:  { bg: "#DBEAFE", color: "#1E40AF", label: "Active" },
    expired: { bg: "#FEE2E2", color: "#991B1B", label: "Expired" },
  };
  const s = cfg[status] || cfg.expired;
  return (
    <span style={{ display:"inline-block", fontSize:11, padding:"3px 11px",
      borderRadius:20, fontWeight:600, background:s.bg, color:s.color, whiteSpace:"nowrap" }}>
      {s.label}
    </span>
  );
}

function UserTypePill({ type }) {
  const cfg = {
    new:      { bg: "#EDE9FE", color: "#4C1D95", label: "New user" },
    existing: { bg: "#FEF3C7", color: "#78350F", label: "Existing" },
    test:     { bg: "#F1EFE8", color: "#444441", label: "Test" },
  };
  const s = cfg[type] || cfg.existing;
  return (
    <span style={{ display:"inline-block", fontSize:11, padding:"3px 11px",
      borderRadius:20, fontWeight:600, background:s.bg, color:s.color, whiteSpace:"nowrap" }}>
      {s.label}
    </span>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, accent, icon }) {
  return (
    <div style={{ background:"#fff", borderRadius:12, padding:"16px 18px",
      borderLeft:`4px solid ${accent}`, flex:"1 1 130px", minWidth:0,
      border:`1px solid #F3F4F6`, borderLeftWidth:4, borderLeftColor:accent,
      boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize:12, color:"#6B7280", marginBottom:6,
        display:"flex", alignItems:"center", gap:5 }}>
        <span style={{ fontSize:14 }}>{icon}</span>{label}
      </div>
      <div style={{ fontSize:26, fontWeight:700, color:accent, lineHeight:1 }}>{value}</div>
    </div>
  );
}

// ── OTP Table ──────────────────────────────────────────────────────────────
function OTPTable({ records, showOtp, filter }) {
  const rows = filter === "all" ? records : records.filter(r => r.status === filter);
  if (!rows.length)
    return <div style={{ textAlign:"center", padding:"36px 0", color:"#9CA3AF", fontSize:13 }}>No records for this filter.</div>;

  return (
    <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, minWidth:580 }}>
        <thead>
          <tr style={{ borderBottom:"1.5px solid #F3F4F6" }}>
            {["Mobile number","OTP code","Status","User type","Created","Expires"].map(h => (
              <th key={h} style={{ textAlign:"left", padding:"9px 10px", color:"#9CA3AF",
                fontWeight:500, whiteSpace:"nowrap", fontSize:11 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} style={{
              borderBottom: i < rows.length-1 ? "1px solid #F9FAFB" : "none",
              background: row.userType === "test" ? "#FFFBF5" : "transparent",
            }}>
              {/* Mobile */}
              <td style={{ padding:"11px 10px", fontFamily:"monospace", fontSize:12,
                color:"#374151", whiteSpace:"nowrap" }}>
                {row.userType === "test" && (
                  <span style={{ marginRight:5, fontSize:10, background:"#F1EFE8",
                    color:"#444441", borderRadius:3, padding:"1px 4px", fontFamily:"sans-serif" }}>TEST</span>
                )}
                {row.mobile}
              </td>
              {/* OTP */}
              <td style={{ padding:"11px 10px", fontFamily:"monospace", fontSize:13 }}>
                {showOtp || row.userType === "test"
                  ? <span style={{ color: row.userType==="test" ? "#92400E" : "#111827", fontWeight:700 }}>{row.otp}</span>
                  : <span style={{ color:"#D1D5DB", letterSpacing:3 }}>••••••</span>}
              </td>
              {/* Status */}
              <td style={{ padding:"11px 10px" }}><StatusPill status={row.status} /></td>
              {/* User type */}
              <td style={{ padding:"11px 10px" }}><UserTypePill type={row.userType} /></td>
              {/* Created */}
              <td style={{ padding:"11px 10px", color:"#6B7280", fontSize:11, whiteSpace:"nowrap" }}>
                {fmtCreated(row.created)}
              </td>
              {/* Expires */}
              <td style={{ padding:"11px 10px", fontSize:11, whiteSpace:"nowrap" }}>
                <span style={{ color: isPast(row.expires) ? "#DC2626" : "#15803D", fontWeight:600 }}>
                  {fmtTime(row.expires)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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

// ── Main component — renders INSIDE your existing admin layout ─────────────
export default function OTPAdminPage() {

  // Route guard
  if (window.location.pathname !== ALLOWED_PATH) return <AccessDenied />;

  const [filter,      setFilter]      = useState("all");
  const [showOtp,     setShowOtp]     = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [records]                     = useState(MOCK_RECORDS);
  const [stats]                       = useState(MOCK_STATS);

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

  // ── Styles shared ──────────────────────────────────────────────────────
  const card = {
    background:"#fff", borderRadius:12, border:"1px solid #F3F4F6",
    boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
  };

  return (
    // KEY FIX: width:100%, no minHeight:100vh, no fixed positioning
    // This fits naturally inside your admin panel content area
    <div style={{ width:"100%", padding:"20px 24px", boxSizing:"border-box",
      fontFamily:"'Inter',system-ui,sans-serif", background:"#F8F9FB", minHeight:"100%" }}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:9,
            background:"linear-gradient(135deg,#4F46E5,#7C3AED)",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
              stroke="#fff" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:17, color:"#111827", lineHeight:1.2 }}>OTP Admin Panel</div>
            <div style={{ fontSize:11, color:"#9CA3AF" }}>Aavie App · Internal</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:11, fontFamily:"monospace", background:"#F3F4F6",
            color:"#6B7280", padding:"4px 10px", borderRadius:6 }}>/_OTP</span>
          <button onClick={() => setLastRefresh(new Date())}
            style={{ fontSize:12, padding:"6px 14px", borderRadius:8,
              border:"1px solid #E5E7EB", background:"#fff", color:"#374151",
              cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontWeight:500 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* ── Test bypass warning ──────────────────────────────────────────── */}
      <div style={{ background:"#FFFBEB", border:"1px solid #FCD34D",
        borderRadius:10, padding:"11px 16px", display:"flex",
        alignItems:"flex-start", gap:10, marginBottom:20 }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke="#D97706" strokeWidth="2" style={{ flexShrink:0, marginTop:1 }}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <div>
          <span style={{ fontWeight:600, fontSize:12, color:"#92400E" }}>Play Store test bypass active — </span>
          <span style={{ fontSize:12, color:"#B45309" }}>
            <code style={{ background:"#FEF3C7", padding:"1px 5px", borderRadius:3, fontSize:11 }}>+91 1234567890</code>
            {" "}always receives OTP{" "}
            <code style={{ background:"#FEF3C7", padding:"1px 5px", borderRadius:3, fontSize:11 }}>123456</code>
            {" "}without real SMS. Valid for 60 min. Used by Google Play reviewers.
          </span>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:12, marginBottom:22 }}>
        <StatCard label="OTPs sent today"  value={stats.total}    accent="#4F46E5" icon="📤" />
        <StatCard label="Verified"         value={stats.verified} accent="#15803D" icon="✅" />
        <StatCard label="Expired / unused" value={stats.expired}  accent="#DC2626" icon="⏰" />
        <StatCard label="New users today"  value={stats.newUsers} accent="#D97706" icon="🆕" />
      </div>

      {/* ── Main 2-col layout ────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px",
        gap:18, alignItems:"start" }}>

        {/* LEFT — records table */}
        <div style={{ ...card, overflow:"hidden" }}>
          {/* Table header */}
          <div style={{ padding:"16px 18px 0",
            display:"flex", alignItems:"center",
            justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
            <div style={{ fontWeight:700, fontSize:14, color:"#111827" }}>Recent OTP records</div>
            <button onClick={() => setShowOtp(v => !v)}
              style={{ fontSize:11, padding:"5px 12px", borderRadius:6,
                border:"1px solid #E5E7EB",
                background: showOtp ? "#EEF2FF" : "#fff",
                color: showOtp ? "#4F46E5" : "#6B7280",
                cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontWeight:500 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
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
                  fontWeight: filter===f.key ? 600 : 400,
                  border: filter===f.key ? "1.5px solid #4F46E5" : "1px solid #E5E7EB",
                  background: filter===f.key ? "#EEF2FF" : "#fff",
                  color: filter===f.key ? "#4F46E5" : "#6B7280" }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <OTPTable records={records} showOtp={showOtp} filter={filter} />

          {/* Footer */}
          <div style={{ padding:"10px 18px", borderTop:"1px solid #F9FAFB",
            fontSize:11, color:"#C4C9D4", textAlign:"right" }}>
            Last refreshed: {lastRefresh.toLocaleTimeString("en-IN",
              { hour:"2-digit", minute:"2-digit", hour12:true })}
          </div>
        </div>
  
      </div>

      {/* Footer */}
      <div style={{ textAlign:"center", marginTop:28, color:"#D1D5DB", fontSize:11, paddingBottom:8 }}>
        Aavie OTP Admin · Restricted access · <code>/_OTP</code>
      </div>
    </div>
  );
}