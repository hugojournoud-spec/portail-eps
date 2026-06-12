import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════
// DESIGN TOKENS — Sport / Énergie / Moderne
// ═══════════════════════════════════════════════════
const T = {
  // Bases
  navy:    "#0F2147",
  navyL:   "#162D5E",
  navyM:   "#1E3A72",
  gold:    "#4F8EF7",
  goldL:   "#EEF4FF",
  goldD:   "#2563EB",
  white:   "#FFFFFF",
  light:   "#F0F4FF",
  lightAlt:"#F8F9FF",
  border:  "#E2E8F8",
  gray:    "#7A87A0",
  grayL:   "#B8C2D6",
  text:    "#111827",
  textSoft:"#374151",
  // Accents
  coral:   "#FF4D6D",
  coralL:  "#FFF0F3",
  green:   "#10B981",
  greenL:  "#ECFDF5",
  purple:  "#7C3AED",
  purpleL: "#F5F0FF",
  orange:  "#F97316",
  orangeL: "#FFF7ED",
  sky:     "#EEF4FF",
  // Gradients (strings)
  gradNav: "linear-gradient(135deg, #0F2147 0%, #1E3A72 100%)",
  grad6:   "linear-gradient(135deg, #0F2147 0%, #1E3A72 100%)",
  grad5:   "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
  grad4:   "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
  grad3:   "linear-gradient(135deg, #10B981 0%, #059669 100%)",
  // Legacy aliases (keep compat)
  red:     "#FF4D6D",
  redL:    "#FFF0F3",
  purpleL2:"#F5F0FF",
  orangeL2:"#FFF7ED",
};

// Couleur par classe
const CLASS_GRAD = { "6ème": T.grad6, "5ème": T.grad5, "4ème": T.grad4, "3ème": T.grad3 };
const CLASS_COLOR = { "6ème": T.navy, "5ème": T.purple, "4ème": T.orange, "3ème": T.green };
const CLASS_EMOJI = { "6ème": "🏃", "5ème": "⚽", "4ème": "🏀", "3ème": "🏆" };

const CLASSES = ["6ème", "5ème", "4ème", "3ème"];
const ADMIN_PW = "eps2025";

// ═══════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════
async function load(key) {
  try { const r = await window.storage.get(key, true); return r ? JSON.parse(r.value) : null; }
  catch { return null; }
}
async function save(key, val) {
  try { await window.storage.set(key, JSON.stringify(val), true); } catch {}
}

// ═══════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════
const mkClassData = () => ({
  seance: { titre: "Séance du jour", objectif: "", echauffement: "", situations: [], bilan: "" },
  sequence: { titre: "", AFC: "", objectif: "", seances: [] },
  annonces: [],
  notes: [],
  depots: [],
  historique: [],
});
const seedStore = () => {
  const s = {};
  CLASSES.forEach(c => { s[c] = mkClassData(); });
  return s;
};

// ═══════════════════════════════════════════════════
// LOGO EPS — badge épuré
// ═══════════════════════════════════════════════════
function LogoEPS({ size = 72 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.25, background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 28px ${T.gold}55`, flexShrink: 0 }}>
      <span style={{ fontWeight: 900, color: T.white, fontSize: size * 0.3, letterSpacing: 2 }}>EPS</span>
    </div>
  );
}

function LogoEPSSmall() {
  return (
    <div style={{ width: 38, height: 38, borderRadius: 10, background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 3px 10px ${T.gold}55` }}>
      <span style={{ fontWeight: 900, color: T.white, fontSize: 14, letterSpacing: 1.5 }}>EPS</span>
    </div>
  );
}


function Btn({ children, onClick, color = T.navy, bg, outline, small, danger, ghost, style = {} }) {
  const bgC = danger ? T.coral : outline || ghost ? "transparent" : (bg || color);
  const fc  = outline ? T.navy : ghost ? T.gray : T.white;
  const brd = outline ? `2px solid ${T.border}` : "none";
  return (
    <button onClick={onClick} style={{
      background: bgC, color: fc, border: brd,
      borderRadius: 10, cursor: "pointer",
      fontWeight: 700, fontSize: small ? 12 : 14,
      padding: small ? "5px 12px" : "9px 20px",
      display: "inline-flex", alignItems: "center", gap: 6,
      transition: "transform .12s, box-shadow .12s, opacity .12s",
      whiteSpace: "nowrap", fontFamily: "inherit",
      boxShadow: outline || ghost || danger ? "none" : `0 3px 12px ${(bg || color)}44`,
      letterSpacing: .2,
      ...style,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.opacity = ".92"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.opacity = "1"; }}
    >{children}</button>
  );
}

function Tag({ children, color = T.navy, bg }) {
  return (
    <span style={{
      background: bg || color + "18", color,
      borderRadius: 20, fontSize: 11, fontWeight: 800,
      padding: "3px 10px", display: "inline-block",
      letterSpacing: .4, textTransform: "uppercase",
    }}>{children}</span>
  );
}

function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: T.white, borderRadius: 16,
      border: `1.5px solid ${T.border}`,
      padding: "18px 20px", marginBottom: 12,
      boxShadow: "0 2px 12px rgba(15,33,71,.06)",
      cursor: onClick ? "pointer" : "default",
      transition: "transform .15s, box-shadow .15s",
      ...style,
    }}
      onMouseEnter={onClick ? e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(15,33,71,.12)"; } : undefined}
      onMouseLeave={onClick ? e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(15,33,71,.06)"; } : undefined}
    >{children}</div>
  );
}

function Inp({ label, value, onChange, type = "text", multi, placeholder, rows = 3 }) {
  const s = {
    width: "100%", borderRadius: 10, border: `2px solid ${T.border}`,
    padding: "10px 13px", fontSize: 14, fontFamily: "inherit",
    outline: "none", color: T.text, background: T.lightAlt,
    boxSizing: "border-box", transition: "border-color .15s, box-shadow .15s",
  };
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 800, color: T.gray, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: .8 }}>{label}</label>}
      {multi
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
            style={{ ...s, resize: "vertical" }}
            onFocus={e => { e.target.style.borderColor = T.gold; e.target.style.boxShadow = `0 0 0 3px ${T.gold}22`; }}
            onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={s}
            onFocus={e => { e.target.style.borderColor = T.gold; e.target.style.boxShadow = `0 0 0 3px ${T.gold}22`; }}
            onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }} />
      }
    </div>
  );
}

function Sel({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 800, color: T.gray, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: .8 }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: "100%", padding: "10px 13px", borderRadius: 10,
        border: `2px solid ${T.border}`, fontSize: 14, background: T.lightAlt,
        fontFamily: "inherit", color: T.text, outline: "none",
      }}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  );
}

function Section({ title, action, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 14, color: T.navy, fontWeight: 800, textTransform: "uppercase", letterSpacing: .8 }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Empty({ msg }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 20px" }}>
      <div style={{ fontSize: 36, marginBottom: 8, opacity: .4 }}>📭</div>
      <p style={{ color: T.gray, fontSize: 14, margin: 0 }}>{msg}</p>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
      background: T.navy, color: T.white, padding: "12px 28px", borderRadius: 40,
      fontWeight: 700, fontSize: 14, zIndex: 999,
      boxShadow: "0 8px 32px rgba(15,33,71,.35)",
      pointerEvents: "none", display: "flex", alignItems: "center", gap: 8,
    }}>{msg}</div>
  );
}

// Pill de statut coloré
function Pill({ children, color = T.navy }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: color + "15", color,
      borderRadius: 20, fontSize: 11, fontWeight: 800,
      padding: "3px 10px", letterSpacing: .4,
    }}>{children}</span>
  );
}

// ═══════════════════════════════════════════════════
// NAV SIDEBAR (desktop) / bottom bar (mobile)
// ═══════════════════════════════════════════════════
const NAV_STUDENT = [
  { id: "seance",     label: "Séance",          emoji: "📋" },
  { id: "regles",     label: "Règles d'Or",     emoji: "⭐" },
  { id: "sequence",   label: "Séquence",        emoji: "📚" },
  { id: "annonces",   label: "Annonces",        emoji: "📣" },
  { id: "calendrier", label: "Calendrier",      emoji: "📅" },
  { id: "evaluations",label: "Évaluations",     emoji: "🎯" },
  { id: "mesnotes",   label: "Mes notes",       emoji: "📊" },
  { id: "exercices",  label: "Exercices",       emoji: "⚡" },
  { id: "sondages",   label: "Sondages",        emoji: "🗳" },
  { id: "ressources", label: "Ressources",      emoji: "📁" },
  { id: "depot",      label: "Mes dépôts",      emoji: "📤" },
  { id: "AS",         label: "Asso. Sportive",  emoji: "🏆" },
];
const NAV_ADMIN = [
  { id: "dashboard",  label: "Tableau de bord",  emoji: "🖥" },
  { id: "seance",     label: "Séance",            emoji: "📋" },
  { id: "regles",     label: "Règles d'Or",       emoji: "⭐" },
  { id: "sequence",   label: "Séquence",          emoji: "📚" },
  { id: "annonces",   label: "Annonces",          emoji: "📣" },
  { id: "calendrier", label: "Calendrier",        emoji: "📅" },
  { id: "evaluations",label: "Évaluations",       emoji: "🎯" },
  { id: "exercices",  label: "Exercices",         emoji: "⚡" },
  { id: "sondages",   label: "Sondages",          emoji: "🗳" },
  { id: "ressources", label: "Ressources",        emoji: "📁" },
  { id: "notes",      label: "Notes élèves",      emoji: "📊" },
  { id: "depots",     label: "Dépôts élèves",     emoji: "📥" },
  { id: "historique", label: "Historique",        emoji: "🕐" },
  { id: "AS",         label: "Asso. Sportive",    emoji: "🏆" },
  { id: "codes",      label: "Codes d'accès",     emoji: "🔑" },
];

// ═══════════════════════════════════════════════════
// RÈGLES D'OR
// ═══════════════════════════════════════════════════

// Emojis suggérés pour l'admin
const EMOJI_SUGGESTIONS = ["⭐","🤝","🏃","🎯","💪","🧠","🔇","👀","🙌","🚫","✅","💛","🌟","🔥","⚡","🏅","👊","🎒","🤫","🕐"];

function ReglesView({ regles }) {
  if (!regles?.length) return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
      <p style={{ color: T.gray, fontSize: 15 }}>Les règles d'Or seront affichées ici.</p>
    </div>
  );
  return (
    <div>
      <Card style={{ background: T.goldL, borderLeft: `4px solid ${T.gold}`, marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: T.navy }}>⭐ Les Règles d'Or de l'EPS</div>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: T.gray }}>Ces règles s'appliquent à chaque séance. Elles sont le socle de notre vie de classe en EPS.</p>
      </Card>
      {regles.map((r, i) => (
        <Card key={i} style={{ display: "flex", gap: 14, alignItems: "center", borderLeft: `4px solid ${T.gold}` }}>
          {/* Numéro + emoji */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 44, flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: T.navy }}>{i + 1}</div>
            <div style={{ fontSize: 22 }}>{r.emoji || "⭐"}</div>
          </div>
          {/* Texte */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: T.navy }}>{r.titre}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ReglesAdmin({ regles, setRegles }) {
  const [titre, setTitre]   = useState("");
  const [emoji, setEmoji]   = useState("⭐");
  const [showPicker, setShowPicker] = useState(false);
  const [editIdx, setEditIdx] = useState(null);

  const add = () => {
    if (!titre.trim()) return;
    if (editIdx !== null) {
      setRegles(r => r.map((x, i) => i === editIdx ? { titre: titre.trim(), emoji } : x));
      setEditIdx(null);
    } else {
      setRegles(r => [...r, { titre: titre.trim(), emoji }]);
    }
    setTitre(""); setEmoji("⭐"); setShowPicker(false);
  };

  const startEdit = (r, i) => { setTitre(r.titre); setEmoji(r.emoji || "⭐"); setEditIdx(i); };
  const cancel    = () => { setTitre(""); setEmoji("⭐"); setEditIdx(null); setShowPicker(false); };

  const moveUp   = i => { if (i === 0) return; setRegles(r => { const a = [...r]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; }); };
  const moveDown = i => { if (i === regles.length - 1) return; setRegles(r => { const a = [...r]; [a[i], a[i+1]] = [a[i+1], a[i]]; return a; }); };

  return (
    <div>
      {/* Formulaire ajout / édition */}
      <Card style={{ borderLeft: `4px solid ${T.gold}` }}>
        <h3 style={{ margin: "0 0 14px", color: T.navy }}>
          {editIdx !== null ? `✏️ Modifier la règle ${editIdx + 1}` : "✨ Ajouter une règle d'Or"}
        </h3>

        {/* Sélecteur emoji */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: T.gray, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: .5 }}>Icône</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button type="button" onClick={() => setShowPicker(p => !p)} style={{ fontSize: 28, background: T.goldL, border: `2px solid ${T.gold}`, borderRadius: 10, width: 48, height: 48, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {emoji}
            </button>
            <span style={{ fontSize: 13, color: T.gray }}>← Clique pour choisir</span>
          </div>
          {showPicker && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10, background: T.light, borderRadius: 10, padding: 10, border: `1px solid ${T.border}` }}>
              {EMOJI_SUGGESTIONS.map(e => (
                <button type="button" key={e} onClick={() => { setEmoji(e); setShowPicker(false); }}
                  style={{ fontSize: 22, background: emoji === e ? T.goldL : T.white, border: `1.5px solid ${emoji === e ? T.gold : T.border}`, borderRadius: 8, width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        <Inp label="Texte de la règle *" value={titre} onChange={setTitre} placeholder="ex : Je respecte le matériel et mes camarades" />

        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={add} color={T.gold} style={{ color: T.navy }}>
            {editIdx !== null ? "✅ Enregistrer" : "➕ Ajouter"}
          </Btn>
          {editIdx !== null && <Btn outline onClick={cancel}>Annuler</Btn>}
        </div>
      </Card>

      {/* Liste des règles */}
      {regles.length > 0 && (
        <Section title={`Règles d'Or (${regles.length})`}>
          {regles.map((r, i) => (
            <Card key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {/* Ordre */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                <button type="button" onClick={() => moveUp(i)} disabled={i === 0} style={{ background: "none", border: "none", cursor: i === 0 ? "default" : "pointer", opacity: i === 0 ? .3 : 1, fontSize: 14, lineHeight: 1 }}>▲</button>
                <button type="button" onClick={() => moveDown(i)} disabled={i === regles.length - 1} style={{ background: "none", border: "none", cursor: i === regles.length - 1 ? "default" : "pointer", opacity: i === regles.length - 1 ? .3 : 1, fontSize: 14, lineHeight: 1 }}>▼</button>
              </div>
              {/* Numéro */}
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: T.navy, flexShrink: 0 }}>{i + 1}</div>
              {/* Emoji */}
              <div style={{ fontSize: 24, flexShrink: 0 }}>{r.emoji || "⭐"}</div>
              {/* Texte */}
              <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{r.titre}</div>
              {/* Actions */}
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <Btn small outline onClick={() => startEdit(r, i)}>✏️</Btn>
                <Btn small danger onClick={() => { setRegles(x => x.filter((_, j) => j !== i)); if (editIdx === i) cancel(); }}>✕</Btn>
              </div>
            </Card>
          ))}
        </Section>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// ── SÉANCE ──────────────────────────────────────────

// ── Helpers publication ─────────────────────────────
function isPublished(seance) {
  if (!seance) return false;
  if (seance.pubMode === "brouillon") return false;
  if (seance.pubMode === "publiee")   return true;
  // programmée : comparer l'heure de publication à maintenant
  if (seance.pubMode === "programmee" && seance.pubDate) {
    return new Date() >= new Date(seance.pubDate);
  }
  // par défaut (ancien format sans pubMode) : toujours visible
  return true;
}

function PubStatusBadge({ seance }) {
  if (!seance) return null;
  if (seance.pubMode === "brouillon")
    return <Pill color={T.gray}>📝 Brouillon</Pill>;
  if (seance.pubMode === "publiee")
    return <Pill color={T.green}>✅ Publiée</Pill>;
  if (seance.pubMode === "programmee" && seance.pubDate) {
    const pub = new Date(seance.pubDate);
    const now  = new Date();
    if (now >= pub) return <Pill color={T.green}>✅ Publiée (programmée)</Pill>;
    return <Pill color={T.orange}>⏰ Programmée — {pub.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} à {pub.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</Pill>;
  }
  return <Pill color={T.green}>✅ Publiée</Pill>;
}

// ── SÉANCE — vue élève ───────────────────────────────
function SeanceView({ seance }) {
  const visible = isPublished(seance);
  if (!visible) return (
    <div style={{ textAlign: "center", padding: "48px 20px" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>⏳</div>
      <h3 style={{ color: T.navy, margin: "0 0 8px", fontWeight: 900 }}>Pas encore disponible</h3>
      <p style={{ color: T.gray, fontSize: 14, margin: 0 }}>La séance du jour sera publiée par ton professeur prochainement.</p>
    </div>
  );
  return (
    <div>
      <h2 style={{ margin: "0 0 16px", fontSize: 20, color: T.navy, fontWeight: 900 }}>{seance.titre || "Séance du jour"}</h2>
      {seance.objectif && (
        <Card style={{ borderLeft: `4px solid ${T.gold}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.gray, textTransform: "uppercase", letterSpacing: .8, marginBottom: 4 }}>Objectif</div>
          <div style={{ fontSize: 15 }}>{seance.objectif}</div>
        </Card>
      )}
      {seance.echauffement && (
        <Card>
          <div style={{ fontWeight: 700, color: T.orange, marginBottom: 6 }}>🔥 Échauffement</div>
          <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{seance.echauffement}</div>
        </Card>
      )}
      {(seance.situations || []).map((s, i) => (
        <Card key={i} style={{ borderLeft: `3px solid ${T.navy}` }}>
          <div style={{ fontWeight: 700, color: T.navy, marginBottom: 6 }}>
            Situation {i + 1}{s.titre ? ` — ${s.titre}` : ""}
          </div>
          <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{s.description}</div>
          {s.consigne && <div style={{ marginTop: 8, fontSize: 13, color: T.gray, fontStyle: "italic" }}>📌 {s.consigne}</div>}
        </Card>
      ))}
      {seance.bilan && (
        <Card style={{ borderLeft: `4px solid ${T.green}` }}>
          <div style={{ fontWeight: 700, color: T.green, marginBottom: 6 }}>✅ Bilan</div>
          <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{seance.bilan}</div>
        </Card>
      )}
      {!seance.objectif && !seance.echauffement && (!seance.situations?.length) && !seance.bilan && (
        <Empty msg="La séance n'est pas encore renseignée." />
      )}
    </div>
  );
}

// ── SÉANCE — panneau admin ────────────────────────────
function SeanceAdmin({ seance, setSeance, store, activeClass, updateCls, setAllHisto, allHisto }) {
  const addSit = () => setSeance(s => ({ ...s, situations: [...(s.situations || []), { titre: "", description: "", consigne: "" }] }));
  const updSit = (i, f, v) => setSeance(s => { const a = [...(s.situations || [])]; a[i] = { ...a[i], [f]: v }; return { ...s, situations: a }; });
  const delSit = i => setSeance(s => ({ ...s, situations: s.situations.filter((_, j) => j !== i) }));

  const pubMode = seance.pubMode || "publiee";
  const pubDate = seance.pubDate || "";
  const toLocalDT = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const setPubMode = v => setSeance(s => ({ ...s, pubMode: v }));
  const setPubDate = v => setSeance(s => ({ ...s, pubDate: v ? new Date(v).toISOString() : "" }));
  const published = isPublished(seance);

  // Duplication
  const [dupTarget, setDupTarget] = useState("");
  const [dupMsg, setDupMsg]       = useState("");
  const autresClasses = CLASSES.filter(c => c !== activeClass);

  const dupliquer = () => {
    if (!dupTarget) return;
    const copie = { ...seance, pubMode: "brouillon" }; // copie en brouillon
    updateCls("seance", copie, dupTarget);
    setDupMsg(`✅ Séance copiée vers ${dupTarget} (en brouillon)`);
    setTimeout(() => { setDupMsg(""); setDupTarget(""); }, 3000);
  };

  // Archivage auto
  const [archiveMsg, setArchiveMsg] = useState("");
  const archiverEtReinitialiser = () => {
    if (!seance.titre && !seance.objectif) { setArchiveMsg("⚠️ Séance vide, rien à archiver."); setTimeout(() => setArchiveMsg(""), 2000); return; }
    // Archiver la séance courante
    const entree = {
      classe: activeClass,
      date: new Date().toISOString().split("T")[0],
      titre: seance.titre || "Séance sans titre",
      resume: seance.objectif || "",
    };
    setAllHisto(h => [entree, ...h]);
    // Réinitialiser
    setSeance({ titre: "Séance du jour", objectif: "", echauffement: "", situations: [], bilan: "", pubMode: "brouillon" });
    setArchiveMsg("✅ Séance archivée, nouvelle séance prête !");
    setTimeout(() => setArchiveMsg(""), 3000);
  };

  return (
    <div>
      {/* ── Bloc publication ── */}
      <Card style={{ borderLeft: `4px solid ${pubMode === "brouillon" ? T.gray : pubMode === "programmee" ? T.orange : T.green}`, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: T.navy, marginBottom: 2 }}>🗓 Publication</div>
            <div style={{ fontSize: 12, color: T.gray }}>Contrôle la visibilité de cette séance pour les élèves</div>
          </div>
          <PubStatusBadge seance={seance} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: pubMode === "programmee" ? 12 : 0 }}>
          {[
            { id: "brouillon",  label: "📝 Brouillon",  desc: "Invisible pour les élèves" },
            { id: "programmee", label: "⏰ Programmer",  desc: "Visible à une date/heure fixée" },
            { id: "publiee",    label: "✅ Publier",     desc: "Visible immédiatement" },
          ].map(opt => (
            <button key={opt.id} type="button" onClick={() => setPubMode(opt.id)} style={{
              flex: 1, minWidth: 100,
              background: pubMode === opt.id ? (opt.id === "brouillon" ? T.gray : opt.id === "programmee" ? T.orange : T.green) : T.lightAlt,
              color: pubMode === opt.id ? T.white : T.gray,
              border: `2px solid ${pubMode === opt.id ? (opt.id === "brouillon" ? T.gray : opt.id === "programmee" ? T.orange : T.green) : T.border}`,
              borderRadius: 12, padding: "10px 8px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13, textAlign: "center", transition: "all .15s",
            }}>
              <div>{opt.label}</div>
              <div style={{ fontSize: 11, fontWeight: 400, opacity: pubMode === opt.id ? .85 : .7, marginTop: 2 }}>{opt.desc}</div>
            </button>
          ))}
        </div>
        {pubMode === "programmee" && (
          <div style={{ marginTop: 12, background: T.orangeL, borderRadius: 10, padding: "12px 14px" }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: T.orange, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: .8 }}>Date et heure de publication</label>
            <input type="datetime-local" value={toLocalDT(pubDate)} onChange={e => setPubDate(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `2px solid ${T.orange}`, fontSize: 14, fontFamily: "inherit", background: T.white, outline: "none", boxSizing: "border-box", color: T.text }} />
            {pubDate && (
              <div style={{ fontSize: 12, color: T.orange, fontWeight: 600, marginTop: 6 }}>
                {published ? "✅ Visible maintenant." : `⏳ Sera visible le ${new Date(pubDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à ${new Date(pubDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ── Contenu ── */}
      <Card>
        <Inp label="Titre" value={seance.titre} onChange={v => setSeance(s => ({ ...s, titre: v }))} />
        <Inp label="Objectif" value={seance.objectif} onChange={v => setSeance(s => ({ ...s, objectif: v }))} multi />
        <Inp label="Échauffement" value={seance.echauffement} onChange={v => setSeance(s => ({ ...s, echauffement: v }))} multi placeholder="Décris l'échauffement…" />
        <Inp label="Bilan / retour" value={seance.bilan} onChange={v => setSeance(s => ({ ...s, bilan: v }))} multi />
      </Card>

      <Section title="Situations d'apprentissage" action={<Btn small onClick={addSit}>+ Ajouter</Btn>}>
        {(seance.situations || []).map((sit, i) => (
          <Card key={i} style={{ background: T.sky }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <b style={{ color: T.navy }}>Situation {i + 1}</b>
              <Btn small danger onClick={() => delSit(i)}>Supprimer</Btn>
            </div>
            <Inp label="Titre" value={sit.titre} onChange={v => updSit(i, "titre", v)} />
            <Inp label="Description" value={sit.description} onChange={v => updSit(i, "description", v)} multi />
            <Inp label="Consigne clé" value={sit.consigne} onChange={v => updSit(i, "consigne", v)} />
          </Card>
        ))}
      </Section>

      {/* ── Duplication ── */}
      <Card style={{ borderLeft: `4px solid ${T.navy}` }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: T.navy, marginBottom: 8 }}>📋 Copier cette séance vers une autre classe</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Sel label="" value={dupTarget} onChange={setDupTarget}
            options={[{ value: "", label: "Choisir la classe…" }, ...autresClasses.map(c => ({ value: c, label: `${CLASS_EMOJI[c]} ${c}` }))]} />
          <Btn onClick={dupliquer} color={T.navy} style={{ flexShrink: 0 }}>Copier →</Btn>
        </div>
        {dupMsg && <div style={{ fontSize: 13, color: dupMsg.startsWith("⚠") ? T.coral : T.green, fontWeight: 700, marginTop: 6 }}>{dupMsg}</div>}
        <div style={{ fontSize: 12, color: T.gray, marginTop: 6 }}>La copie arrive en brouillon dans la classe cible — tu pourras la modifier avant publication.</div>
      </Card>

      {/* ── Archivage auto ── */}
      <Card style={{ borderLeft: `4px solid ${T.gray}` }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: T.navy, marginBottom: 4 }}>🗃 Archiver et préparer la prochaine séance</div>
        <div style={{ fontSize: 13, color: T.gray, marginBottom: 12 }}>Archive la séance actuelle dans l'historique et ouvre une page vierge pour la suivante.</div>
        <Btn onClick={archiverEtReinitialiser} color={T.gray}>🗃 Archiver cette séance</Btn>
        {archiveMsg && <div style={{ fontSize: 13, color: archiveMsg.startsWith("⚠") ? T.coral : T.green, fontWeight: 700, marginTop: 8 }}>{archiveMsg}</div>}
      </Card>
    </div>
  );
}

// ── SÉQUENCE ─────────────────────────────────────────
function SequenceView({ seq }) {
  return (
    <div>
      {!seq.titre ? <Empty msg="Aucune séquence en cours." /> : (
        <>
          <Card style={{ borderLeft: `4px solid ${T.purple}` }}>
            <div style={{ fontSize: 11, color: T.gray, fontWeight: 700, textTransform: "uppercase", letterSpacing: .8, marginBottom: 4 }}>Séquence en cours</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: T.navy, marginBottom: 4 }}>{seq.titre}</div>
            {seq.AFC && <Tag color={T.purple}>{seq.AFC}</Tag>}
            {seq.objectif && <p style={{ margin: "10px 0 0", fontSize: 14 }}>{seq.objectif}</p>}
          </Card>
          {(seq.seances || []).length > 0 && (
            <Section title="Progression des séances">
              {seq.seances.map((s, i) => (
                <Card key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: s.fait ? T.green : T.border, display: "flex", alignItems: "center", justifyContent: "center", color: T.white, fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                    {s.fait ? "✓" : i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.titre || `Séance ${i + 1}`}</div>
                    {s.objectif && <div style={{ fontSize: 13, color: T.gray }}>{s.objectif}</div>}
                  </div>
                  {s.fait && <Tag color={T.green}>Fait</Tag>}
                </Card>
              ))}
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function SequenceAdmin({ seq, setSeq }) {
  const addSeanc = () => setSeq(s => ({ ...s, seances: [...(s.seances || []), { titre: "", objectif: "", fait: false }] }));
  const updS = (i, f, v) => setSeq(s => { const a = [...(s.seances || [])]; a[i] = { ...a[i], [f]: v }; return { ...s, seances: a }; });
  const delS = i => setSeq(s => ({ ...s, seances: s.seances.filter((_, j) => j !== i) }));
  return (
    <div>
      <Card>
        <Inp label="Titre de la séquence" value={seq.titre} onChange={v => setSeq(s => ({ ...s, titre: v }))} />
        <Inp label="Champ d'apprentissage / AFC" value={seq.AFC} onChange={v => setSeq(s => ({ ...s, AFC: v }))} placeholder="ex : CA4 — Affrontement collectif" />
        <Inp label="Objectif général" value={seq.objectif} onChange={v => setSeq(s => ({ ...s, objectif: v }))} multi />
      </Card>
      <Section title="Séances de la séquence" action={<Btn small onClick={addSeanc}>+ Ajouter</Btn>}>
        {(seq.seances || []).map((s, i) => (
          <Card key={i} style={{ background: T.sky }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
              <b style={{ color: T.navy }}>Séance {i + 1}</b>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <label style={{ fontSize: 13, display: "flex", gap: 4, alignItems: "center", cursor: "pointer" }}>
                  <input type="checkbox" checked={!!s.fait} onChange={e => updS(i, "fait", e.target.checked)} /> Faite
                </label>
                <Btn small danger onClick={() => delS(i)}>Supprimer</Btn>
              </div>
            </div>
            <Inp label="Titre" value={s.titre} onChange={v => updS(i, "titre", v)} />
            <Inp label="Objectif" value={s.objectif} onChange={v => updS(i, "objectif", v)} />
          </Card>
        ))}
      </Section>
    </div>
  );
}

// ── ANNONCES ─────────────────────────────────────────
function AnnoncesView({ annonces }) {
  const sorted = [...annonces].sort((a, b) => new Date(b.date) - new Date(a.date));
  return !sorted.length ? <Empty msg="Aucune annonce pour l'instant." /> : (
    <div>
      {sorted.map((a, i) => (
        <Card key={i} style={{ borderLeft: `4px solid ${a.type === "urgent" ? T.red : a.type === "info" ? T.navy : T.green}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{a.titre}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <Tag color={a.type === "urgent" ? T.red : a.type === "info" ? T.navy : T.green}>
                {a.type === "urgent" ? "🔴 Urgent" : a.type === "info" ? "ℹ️ Info" : "✅ Rappel"}
              </Tag>
              <span style={{ fontSize: 12, color: T.gray, alignSelf: "center" }}>{new Date(a.date).toLocaleDateString("fr-FR")}</span>
            </div>
          </div>
          <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{a.contenu}</div>
        </Card>
      ))}
    </div>
  );
}

function AnnoncesAdmin({ annonces, setAnnonces }) {
  const [n, setN] = useState({ titre: "", type: "info", contenu: "" });
  const add = () => {
    if (!n.titre) return;
    setAnnonces(a => [{ ...n, date: new Date().toISOString() }, ...a]);
    setN({ titre: "", type: "info", contenu: "" });
  };
  return (
    <div>
      <Card>
        <h3 style={{ margin: "0 0 14px", color: T.navy }}>Nouvelle annonce</h3>
        <Inp label="Titre *" value={n.titre} onChange={v => setN(x => ({ ...x, titre: v }))} />
        <Sel label="Type" value={n.type} onChange={v => setN(x => ({ ...x, type: v }))} options={[{ value: "info", label: "ℹ️ Information" }, { value: "rappel", label: "✅ Rappel" }, { value: "urgent", label: "🔴 Urgent" }]} />
        <Inp label="Contenu" value={n.contenu} onChange={v => setN(x => ({ ...x, contenu: v }))} multi />
        <Btn onClick={add}>Publier l'annonce</Btn>
      </Card>
      <Section title={`Annonces publiées (${annonces.length})`}>
        {!annonces.length ? <Empty msg="Aucune annonce." /> : annonces.map((a, i) => (
          <Card key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div><b>{a.titre}</b> <span style={{ fontSize: 12, color: T.gray }}>{new Date(a.date).toLocaleDateString("fr-FR")}</span></div>
            <Btn small danger onClick={() => setAnnonces(x => x.filter((_, j) => j !== i))}>Supprimer</Btn>
          </Card>
        ))}
      </Section>
    </div>
  );
}

// ── CALENDRIER ───────────────────────────────────────
function CalendrierView({ calendrier }) {
  const sorted = [...(calendrier || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
  const typeColor = t => t === "évaluation" ? T.red : t === "sortie" ? T.green : t === "AS" ? T.purple : T.navy;
  return !sorted.length ? <Empty msg="Aucun événement calendrier." /> : (
    <div>
      {sorted.map((e, i) => (
        <Card key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ minWidth: 50, textAlign: "center", background: T.navy, borderRadius: 10, padding: "7px 0", color: T.white, flexShrink: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{new Date(e.date).getDate()}</div>
            <div style={{ fontSize: 10, textTransform: "uppercase", opacity: .8 }}>{new Date(e.date).toLocaleString("fr-FR", { month: "short" })}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{e.titre}</div>
            <div style={{ marginTop: 4, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {e.type && <Tag color={typeColor(e.type)}>{e.type}</Tag>}
              {e.classe && e.classe !== "Toutes" && <Tag color={T.gold}>{e.classe}</Tag>}
            </div>
            {e.description && <p style={{ margin: "6px 0 0", fontSize: 13, color: T.gray }}>{e.description}</p>}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── ÉVALUATIONS ──────────────────────────────────────
function EvalsView({ evaluations }) {
  return !evaluations.length ? <Empty msg="Aucune évaluation renseignée." /> : (
    <div>
      {[...evaluations].sort((a, b) => new Date(a.date) - new Date(b.date)).map((ev, i) => (
        <Card key={i} style={{ borderLeft: `4px solid ${T.red}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{ev.titre}</div>
              {ev.date && <div style={{ fontSize: 13, color: T.gray, marginTop: 2 }}>📅 {new Date(ev.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</div>}
            </div>
            {ev.activite && <Tag color={T.red}>{ev.activite}</Tag>}
          </div>
          {ev.description && <p style={{ margin: "10px 0 0", fontSize: 14, whiteSpace: "pre-wrap" }}>{ev.description}</p>}
          {ev.criteres?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.gray, textTransform: "uppercase", marginBottom: 4 }}>Critères</div>
              {ev.criteres.map((c, ci) => <div key={ci} style={{ fontSize: 13, padding: "3px 0", borderBottom: `1px solid ${T.border}` }}>• {c}</div>)}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ── EXERCICES ────────────────────────────────────────
function ExosView({ exercices }) {
  return !exercices.length ? <Empty msg="Aucun exercice renseigné." /> : (
    <div>
      {exercices.map((ex, i) => (
        <Card key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{ex.titre}</div>
            {ex.categorie && <Tag color={T.gold}>{ex.categorie}</Tag>}
          </div>
          {ex.objectif && <p style={{ margin: "0 0 8px", fontSize: 13, color: T.gray, fontStyle: "italic" }}>Objectif : {ex.objectif}</p>}
          {ex.description && <p style={{ margin: "0 0 8px", fontSize: 14, whiteSpace: "pre-wrap" }}>{ex.description}</p>}
          {ex.consignes?.length > 0 && ex.consignes.map((c, ci) => (
            <div key={ci} style={{ fontSize: 13, padding: "4px 0", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 8 }}>
              <span style={{ color: T.gold, fontWeight: 700 }}>{ci + 1}.</span> {c}
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
}

// ── RESSOURCES ───────────────────────────────────────
function RessourcesView({ ressources }) {
  const typeIcon = t => t === "video" ? "🎬" : t === "document" ? "📄" : t === "image" ? "🖼" : "🔗";
  return !ressources?.length ? <Empty msg="Aucune ressource partagée." /> : (
    <div>
      {ressources.map((r, i) => (
        <Card key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontSize: 28 }}>{typeIcon(r.type)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{r.titre}</div>
            {r.description && <div style={{ fontSize: 13, color: T.gray, marginTop: 2 }}>{r.description}</div>}
            {r.url && <a href={r.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: T.navy, marginTop: 4, display: "block" }}>🔗 Ouvrir le lien</a>}
          </div>
          <Tag color={T.navy}>{r.type}</Tag>
        </Card>
      ))}
    </div>
  );
}

// ── DÉPÔT ÉLÈVE — version privée enrichie ────────────
const NIVEAUX = ["1 — Je ne maîtrise pas encore", "2 — Je commence à maîtriser", "3 — Je maîtrise bien", "4 — Je maîtrise très bien"];

function DepotView({ depots, setDepots, classe, evaluations }) {
  const [mode, setMode]           = useState(null); // null | "fichier" | "autoeval"
  const [nom, setNom]             = useState("");
  const [msg, setMsg]             = useState("");
  const fileRef                   = useRef();

  // Fichier
  const [titreFichier, setTitreFichier] = useState("");
  const [commentaire, setCommentaire]   = useState("");
  const [fileName, setFileName]         = useState("");

  // Auto-éval
  const [evalChoisie, setEvalChoisie]   = useState("");
  const [reponses, setReponses]         = useState({});   // { critere: niveau (0-3) }
  const [ressenti, setRessenti]         = useState("");
  const [pointsForts, setPointsForts]   = useState("");
  const [axesProgres, setAxesProgres]   = useState("");

  const classeEvals = (evaluations || []).filter(e => e.criteres?.length > 0);
  const evalActive  = classeEvals.find(e => e.titre === evalChoisie);

  const reset = () => {
    setNom(""); setTitreFichier(""); setCommentaire(""); setFileName("");
    setEvalChoisie(""); setReponses({}); setRessenti(""); setPointsForts(""); setAxesProgres("");
    if (fileRef.current) fileRef.current.value = "";
    setMode(null);
  };

  const submitFichier = () => {
    if (!nom) { setMsg("⚠️ Indique ton prénom et nom."); return; }
    if (!titreFichier) { setMsg("⚠️ Donne un titre à ton dépôt."); return; }
    const depot = {
      type: "fichier", nom, titre: titreFichier, commentaire,
      fichier: fileName || null, classe,
      date: new Date().toISOString(), lu: false, prive: true,
    };
    setDepots(d => [...d, depot]);
    setMsg("✅ Ton dépôt a bien été envoyé à ton professeur !");
    setTimeout(() => { setMsg(""); reset(); }, 3000);
  };

  const submitAutoeval = () => {
    if (!nom) { setMsg("⚠️ Indique ton prénom et nom."); return; }
    if (!evalChoisie) { setMsg("⚠️ Choisis une évaluation."); return; }
    if (!evalActive) return;
    const criteresFilled = evalActive.criteres.every(c => reponses[c] !== undefined);
    if (!criteresFilled) { setMsg("⚠️ Note-toi sur tous les critères."); return; }
    const depot = {
      type: "autoeval", nom, titre: `Auto-éval — ${evalChoisie}`,
      evaluation: evalChoisie,
      reponses,          // { critere: niveau string }
      ressenti, pointsForts, axesProgres,
      classe, date: new Date().toISOString(), lu: false, prive: true,
    };
    setDepots(d => [...d, depot]);
    setMsg("✅ Ton auto-évaluation a bien été envoyée !");
    setTimeout(() => { setMsg(""); reset(); }, 3000);
  };

  // Mes dépôts perso : on filtre par nom saisi — sinon on montre les dépôts non-nominatifs
  // En fait on montre uniquement un résumé neutre (pas les détails) → confidentialité
  const mesDepots = depots.filter(d => d.classe === classe && d.prive);

  return (
    <div>
      {/* Bannière confidentialité */}
      <Card style={{ background: T.purpleL, borderLeft: `4px solid ${T.purple}`, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: T.purple, fontSize: 15, marginBottom: 4 }}>🔒 Espace privé</div>
        <p style={{ margin: 0, fontSize: 13, color: T.gray, lineHeight: 1.6 }}>
          Ce que tu envoies ici est <strong>visible uniquement par ton professeur</strong>. Les autres élèves n'ont pas accès à tes envois.
        </p>
      </Card>

      {/* Choix du mode */}
      {!mode && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Card onClick={() => setMode("fichier")} style={{ textAlign: "center", cursor: "pointer", padding: 24 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📎</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: T.navy }}>Déposer un fichier</div>
            <div style={{ fontSize: 13, color: T.gray, marginTop: 6 }}>Devoir, fiche, document…</div>
          </Card>
          <Card onClick={() => { if (!classeEvals.length) { setMsg("⚠️ Aucune évaluation avec critères n'est disponible pour ta classe."); return; } setMode("autoeval"); }} style={{ textAlign: "center", cursor: "pointer", padding: 24 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📝</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: T.navy }}>Auto-évaluation</div>
            <div style={{ fontSize: 13, color: T.gray, marginTop: 6 }}>Note-toi sur les critères</div>
          </Card>
        </div>
      )}
      {msg && !mode && <p style={{ color: msg.startsWith("⚠") ? T.red : T.green, fontWeight: 600, fontSize: 13, marginTop: 8 }}>{msg}</p>}

      {/* ── MODE FICHIER ── */}
      {mode === "fichier" && (
        <Card style={{ borderLeft: `4px solid ${T.purple}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, color: T.navy }}>📎 Déposer un fichier</h3>
            <Btn small ghost onClick={reset}>← Retour</Btn>
          </div>
          <Inp label="Ton prénom et nom *" value={nom} onChange={setNom} placeholder="ex : Marie Dupont" />
          <Inp label="Titre du dépôt *" value={titreFichier} onChange={setTitreFichier} placeholder="ex : Fiche d'auto-évaluation handball" />
          <Inp label="Message pour ton prof (facultatif)" value={commentaire} onChange={setCommentaire} multi placeholder="Ajoute une note, une question…" />
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: T.gray, display: "block", marginBottom: 4, textTransform: "uppercase" }}>Fichier joint (nom enregistré)</label>
            <input ref={fileRef} type="file" onChange={e => setFileName(e.target.files[0]?.name || "")} style={{ fontSize: 13 }} />
            {fileName && <div style={{ fontSize: 12, color: T.green, marginTop: 4 }}>📎 {fileName}</div>}
          </div>
          {msg && <p style={{ color: msg.startsWith("⚠") ? T.red : T.green, fontWeight: 600, fontSize: 13 }}>{msg}</p>}
          <Btn onClick={submitFichier} color={T.purple}>📤 Envoyer au professeur</Btn>
        </Card>
      )}

      {/* ── MODE AUTO-ÉVAL ── */}
      {mode === "autoeval" && (
        <Card style={{ borderLeft: `4px solid ${T.red}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, color: T.navy }}>📝 Auto-évaluation</h3>
            <Btn small ghost onClick={reset}>← Retour</Btn>
          </div>
          <Inp label="Ton prénom et nom *" value={nom} onChange={setNom} placeholder="ex : Marie Dupont" />
          <Sel label="Évaluation concernée *" value={evalChoisie} onChange={v => { setEvalChoisie(v); setReponses({}); }}
            options={[{ value: "", label: "— Choisir —" }, ...classeEvals.map(e => ({ value: e.titre, label: e.titre }))]} />

          {evalActive && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.gray, textTransform: "uppercase", marginBottom: 10 }}>
                Note-toi sur chaque critère
              </div>
              {evalActive.criteres.map((critere, ci) => (
                <div key={ci} style={{ marginBottom: 14, background: T.light, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: T.navy }}>• {critere}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {NIVEAUX.map((niv, ni) => {
                      const selected = reponses[critere] === ni;
                      const colors = [T.red, T.orange, T.gold, T.green];
                      return (
                        <label key={ni} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "6px 10px", borderRadius: 8, border: `1.5px solid ${selected ? colors[ni] : T.border}`, background: selected ? colors[ni] + "15" : T.white, transition: "all .12s" }}>
                          <input type="radio" name={`critere-${ci}`} checked={selected} onChange={() => setReponses(r => ({ ...r, [critere]: ni }))} style={{ accentColor: colors[ni] }} />
                          <span style={{ fontSize: 13, fontWeight: selected ? 700 : 400, color: selected ? colors[ni] : T.text }}>{niv}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.gray, textTransform: "uppercase", marginBottom: 8 }}>Bilan personnel</div>
                <Inp label="Comment tu t'es senti(e) pendant cette séquence ?" value={ressenti} onChange={setRessenti} multi placeholder="Tes impressions, tes émotions…" rows={2} />
                <Inp label="Tes points forts" value={pointsForts} onChange={setPointsForts} multi placeholder="Ce que tu as réussi…" rows={2} />
                <Inp label="Tes axes de progrès" value={axesProgres} onChange={setAxesProgres} multi placeholder="Ce que tu veux améliorer…" rows={2} />
              </div>
            </div>
          )}

          {msg && <p style={{ color: msg.startsWith("⚠") ? T.red : T.green, fontWeight: 600, fontSize: 13 }}>{msg}</p>}
          <Btn onClick={submitAutoeval} color={T.red} style={{ marginTop: 8 }}>📤 Envoyer au professeur</Btn>
        </Card>
      )}

      {/* Historique neutre — pas de détails visibles */}
      {mesDepots.length > 0 && !mode && (
        <Section title="Tes envois">
          <p style={{ fontSize: 13, color: T.gray, margin: "0 0 10px", fontStyle: "italic" }}>
            🔒 Seul ton professeur peut voir le contenu de tes envois.
          </p>
          {mesDepots.map((d, i) => (
            <Card key={i} style={{ background: T.purpleL, display: "flex", gap: 10, alignItems: "flex-start", flexDirection: "column" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", width: "100%" }}>
                <span style={{ fontSize: 20 }}>{d.type === "autoeval" ? "📝" : "📎"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{d.titre}</div>
                  <div style={{ fontSize: 12, color: T.gray }}>
                    {new Date(d.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} — {d.type === "autoeval" ? "Auto-évaluation" : "Fichier"}
                  </div>
                </div>
                {d.reponse ? <Pill color={T.green}>💬 Réponse</Pill> : <Tag color={T.purple}>Envoyé ✓</Tag>}
              </div>
              {d.reponse && (
                <div style={{ width: "100%", background: T.greenL, border: `1.5px solid ${T.green}`, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.green, textTransform: "uppercase", marginBottom: 4 }}>💬 Réponse de ton professeur</div>
                  <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{d.reponse}</div>
                </div>
              )}
            </Card>
          ))}
        </Section>
      )}
    </div>
  );
}

// ── AS ───────────────────────────────────────────────
function ASView({ as }) {
  const sorted = [...(as || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
  return (
    <div>
      <Card style={{ background: T.purpleL, borderLeft: `4px solid ${T.purple}` }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: T.purple, marginBottom: 4 }}>🏆 Association Sportive</div>
        <p style={{ margin: 0, fontSize: 14, color: T.gray }}>Retrouve ici le calendrier des compétitions et les informations de l'AS.</p>
      </Card>
      <Section title="Compétitions & événements">
        {!sorted.length ? <Empty msg="Aucune compétition programmée." /> : sorted.map((e, i) => (
          <Card key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ minWidth: 50, background: T.purple, borderRadius: 10, textAlign: "center", padding: "7px 0", color: T.white, flexShrink: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{new Date(e.date).getDate()}</div>
              <div style={{ fontSize: 10, textTransform: "uppercase", opacity: .8 }}>{new Date(e.date).toLocaleString("fr-FR", { month: "short" })}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{e.titre}</div>
              <div style={{ marginTop: 4, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {e.sport && <Tag color={T.purple}>{e.sport}</Tag>}
                {e.lieu && <span style={{ fontSize: 12, color: T.gray }}>📍 {e.lieu}</span>}
              </div>
              {e.description && <p style={{ margin: "6px 0 0", fontSize: 13, color: T.gray }}>{e.description}</p>}
            </div>
          </Card>
        ))}
      </Section>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// ADMIN-ONLY SECTIONS
// ═══════════════════════════════════════════════════

// ── DASHBOARD ────────────────────────────────────────
function Dashboard({ store, globalCal, globalAS, allDepots }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000); // refresh toutes les 30s
    return () => clearInterval(t);
  }, []);

  const totalDepots    = allDepots.filter(d => !d.lu).length;
  const totalAutoevals = allDepots.filter(d => !d.lu && d.type === "autoeval").length;
  const nextEv   = [...(globalCal || [])].filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  const nextComp = [...(globalAS  || [])].filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  // Séances programmées à venir
  const programmees = CLASSES.flatMap(c => {
    const s = store[c]?.seance;
    if (!s || s.pubMode !== "programmee" || !s.pubDate) return [];
    const pub = new Date(s.pubDate);
    if (pub <= now) return [];
    return [{ classe: c, titre: s.titre, pubDate: s.pubDate }];
  }).sort((a, b) => new Date(a.pubDate) - new Date(b.pubDate));

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", color: T.navy, fontWeight: 900 }}>Tableau de bord</h2>

      {/* Grille des classes */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        {CLASSES.map(c => {
          const seance = store[c]?.seance;
          const seq    = store[c]?.sequence?.titre;
          const pub    = seance ? isPublished(seance) : false;
          const mode   = seance?.pubMode || "publiee";
          return (
            <Card key={c} style={{ background: CLASS_GRAD[c], border: "none", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -10, right: -10, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,.1)" }} />
              <div style={{ fontSize: 22, marginBottom: 4 }}>{CLASS_EMOJI[c]}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: T.white }}>{c}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", marginTop: 3, marginBottom: 8 }}>
                {seq ? `📚 ${seq.slice(0, 20)}` : "Pas de séquence"}
              </div>
              {/* Statut séance */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,.25)", borderRadius: 20, padding: "3px 9px", fontSize: 11, color: T.white, fontWeight: 700 }}>
                {mode === "brouillon"  ? "📝 Brouillon" :
                 mode === "programmee" && !pub ? "⏰ Programmée" :
                 "✅ Publiée"}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <Card style={{ borderLeft: `4px solid ${T.purple}` }}>
          <div style={{ fontSize: 11, color: T.gray, fontWeight: 800, textTransform: "uppercase", marginBottom: 6, letterSpacing: .8 }}>Dépôts non lus</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: T.purple }}>{totalDepots}</div>
          {totalAutoevals > 0 && <div style={{ fontSize: 12, color: T.gray, marginTop: 4 }}>dont {totalAutoevals} auto-éval{totalAutoevals > 1 ? "s" : ""}</div>}
        </Card>
        <Card style={{ borderLeft: `4px solid ${T.gold}` }}>
          <div style={{ fontSize: 11, color: T.gray, fontWeight: 800, textTransform: "uppercase", marginBottom: 6, letterSpacing: .8 }}>Prochain événement</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{nextEv ? nextEv.titre : "—"}</div>
          {nextEv && <div style={{ fontSize: 12, color: T.gray }}>{new Date(nextEv.date).toLocaleDateString("fr-FR")}</div>}
        </Card>
      </div>

      {/* Séances programmées */}
      {programmees.length > 0 && (
        <Card style={{ borderLeft: `4px solid ${T.orange}` }}>
          <div style={{ fontSize: 11, color: T.orange, fontWeight: 800, textTransform: "uppercase", marginBottom: 10, letterSpacing: .8 }}>⏰ Publications programmées à venir</div>
          {programmees.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < programmees.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 16 }}>{CLASS_EMOJI[p.classe]}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p.classe} — {p.titre || "Séance"}</div>
                  <div style={{ fontSize: 12, color: T.gray }}>
                    {new Date(p.pubDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {new Date(p.pubDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
              <Pill color={T.orange}>⏳ En attente</Pill>
            </div>
          ))}
        </Card>
      )}

      {nextComp && (
        <Card style={{ borderLeft: `4px solid ${T.purple}`, marginTop: 4 }}>
          <div style={{ fontSize: 11, color: T.gray, fontWeight: 800, textTransform: "uppercase", marginBottom: 4, letterSpacing: .8 }}>Prochaine compétition AS</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{nextComp.titre}</div>
          <div style={{ fontSize: 12, color: T.gray }}>{new Date(nextComp.date).toLocaleDateString("fr-FR")} {nextComp.lieu && `— ${nextComp.lieu}`}</div>
        </Card>
      )}
    </div>
  );
}

// ── DÉPÔTS ADMIN — vue complète avec auto-évals ──────
const NIVEAU_COLORS = [T.red, T.orange, T.gold, T.green];
const NIVEAU_LABELS = ["1 — Insuffisant", "2 — Fragile", "3 — Satisfaisant", "4 — Très bonne maîtrise"];

function DepotsAdmin({ depots, setDepots, classe }) {
  const [filtre, setFiltre]   = useState("tous");
  const [ouvert, setOuvert]   = useState(null);
  const [reponse, setReponse] = useState("");

  const classeDepots = depots
    .filter(d => d.classe === classe)
    .filter(d => filtre === "tous" ? true : filtre === "nonlu" ? !d.lu : d.type === filtre)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const markLu = (depot) => setDepots(x => x.map(d => d === depot ? { ...d, lu: true } : d));
  const del    = (depot) => { setDepots(x => x.filter(d => d !== depot)); if (ouvert === depot) setOuvert(null); };

  const sendReply = (depot) => {
    if (!reponse.trim()) return;
    setDepots(x => x.map(d => d === depot ? { ...d, reponse: reponse.trim(), reponseDate: new Date().toISOString() } : d));
    setReponse("");
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[["tous","Tous"], ["nonlu","Non lus"], ["fichier","Fichiers"], ["autoeval","Auto-évals"]].map(([v, l]) => (
          <button key={v} onClick={() => setFiltre(v)} style={{ background: filtre === v ? T.navy : T.white, color: filtre === v ? T.white : T.gray, border: `1.5px solid ${filtre === v ? T.navy : T.border}`, borderRadius: 20, padding: "5px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
        ))}
      </div>

      {!classeDepots.length ? <Empty msg="Aucun dépôt pour ce filtre." /> : classeDepots.map((d, i) => (
        <div key={i}>
          <Card onClick={() => { setOuvert(ouvert === d ? null : d); setReponse(d.reponse || ""); if (!d.lu) markLu(d); }}
            style={{ borderLeft: `4px solid ${d.reponse ? T.green : d.lu ? T.border : T.purple}`, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 18 }}>{d.type === "autoeval" ? "📝" : "📎"}</span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{d.nom}</span>
                  {!d.lu && <Pill color={T.purple}>Nouveau</Pill>}
                  {d.reponse && <Pill color={T.green}>💬 Répondu</Pill>}
                </div>
                <div style={{ fontSize: 13, color: T.gray, marginTop: 3 }}>{d.titre} — {new Date(d.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              <Btn small danger onClick={e => { e.stopPropagation(); del(d); }}>✕</Btn>
            </div>
          </Card>

          {ouvert === d && (
            <div style={{ background: T.sky, borderRadius: 12, padding: 16, marginTop: -8, marginBottom: 12, border: `1px solid ${T.border}` }}>
              {/* Contenu dépôt */}
              {d.type === "fichier" && (
                <>
                  {d.fichier && <p style={{ margin: "0 0 8px", fontSize: 14 }}>📎 <strong>{d.fichier}</strong></p>}
                  {d.commentaire && <p style={{ margin: 0, fontSize: 14, whiteSpace: "pre-wrap", fontStyle: "italic", background: T.white, padding: "10px 12px", borderRadius: 8 }}>{d.commentaire}</p>}
                </>
              )}
              {d.type === "autoeval" && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.gray, textTransform: "uppercase", marginBottom: 10 }}>Critères auto-évalués</div>
                  {Object.entries(d.reponses || {}).map(([critere, niveau], ci) => (
                    <div key={ci} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: T.white, borderRadius: 8, marginBottom: 6, border: `1px solid ${T.border}` }}>
                      <span style={{ fontSize: 13, flex: 1 }}>• {critere}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: NIVEAU_COLORS[niveau], background: NIVEAU_COLORS[niveau] + "18", borderRadius: 20, padding: "2px 10px" }}>Niveau {niveau + 1}</span>
                    </div>
                  ))}
                  {d.ressenti   && <div style={{ marginTop: 8 }}><div style={{ fontSize: 11, fontWeight: 800, color: T.gray, textTransform: "uppercase", marginBottom: 3 }}>Ressenti</div><p style={{ margin: 0, fontSize: 13, fontStyle: "italic", background: T.white, padding: "8px 10px", borderRadius: 8 }}>{d.ressenti}</p></div>}
                  {d.pointsForts && <div style={{ marginTop: 8 }}><div style={{ fontSize: 11, fontWeight: 800, color: T.green, textTransform: "uppercase", marginBottom: 3 }}>Points forts</div><p style={{ margin: 0, fontSize: 13, background: T.white, padding: "8px 10px", borderRadius: 8 }}>{d.pointsForts}</p></div>}
                  {d.axesProgres && <div style={{ marginTop: 8 }}><div style={{ fontSize: 11, fontWeight: 800, color: T.orange, textTransform: "uppercase", marginBottom: 3 }}>Axes de progrès</div><p style={{ margin: 0, fontSize: 13, background: T.white, padding: "8px 10px", borderRadius: 8 }}>{d.axesProgres}</p></div>}
                </>
              )}

              {/* Zone réponse prof */}
              <div style={{ marginTop: 14, borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.navy, textTransform: "uppercase", marginBottom: 6 }}>💬 Ta réponse à l'élève</div>
                {d.reponse && (
                  <div style={{ background: T.greenL, border: `1.5px solid ${T.green}`, borderRadius: 10, padding: "10px 12px", marginBottom: 10, fontSize: 13 }}>
                    <div style={{ fontSize: 11, color: T.green, fontWeight: 800, marginBottom: 3 }}>Réponse envoyée le {new Date(d.reponseDate).toLocaleDateString("fr-FR")}</div>
                    {d.reponse}
                  </div>
                )}
                <textarea value={reponse} onChange={e => setReponse(e.target.value)}
                  placeholder={d.reponse ? "Modifier la réponse…" : "Écris un retour pour cet élève…"}
                  rows={3} style={{ width: "100%", borderRadius: 10, border: `2px solid ${T.border}`, padding: "9px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box", background: T.white }}
                  onFocus={e => e.target.style.borderColor = T.green}
                  onBlur={e => e.target.style.borderColor = T.border} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <Btn onClick={() => sendReply(d)} color={T.green}>💬 {d.reponse ? "Modifier" : "Envoyer"} la réponse</Btn>
                  {d.reponse && <Btn small danger onClick={() => setDepots(x => x.map(dd => dd === d ? { ...dd, reponse: undefined, reponseDate: undefined } : dd))}>Supprimer</Btn>}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── HISTORIQUE ───────────────────────────────────────
function HistoriqueAdmin({ historique, setHistorique, classe }) {
  const [n, setN] = useState({ date: "", titre: "", resume: "" });
  const add = () => {
    if (!n.titre || !n.date) return;
    setHistorique(h => [{ ...n, classe }, ...h]);
    setN({ date: "", titre: "", resume: "" });
  };
  const classeH = historique.filter(h => h.classe === classe).sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <div>
      <Card>
        <h3 style={{ margin: "0 0 14px", color: T.navy }}>Archiver une séance passée</h3>
        <Inp label="Date *" type="date" value={n.date} onChange={v => setN(x => ({ ...x, date: v }))} />
        <Inp label="Titre *" value={n.titre} onChange={v => setN(x => ({ ...x, titre: v }))} />
        <Inp label="Résumé / bilan" value={n.resume} onChange={v => setN(x => ({ ...x, resume: v }))} multi />
        <Btn onClick={add}>Archiver</Btn>
      </Card>
      <Section title={`Séances passées — ${classe}`}>
        {!classeH.length ? <Empty msg="Aucune séance archivée." /> : classeH.map((h, i) => (
          <Card key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ minWidth: 46, background: T.gray, borderRadius: 8, textAlign: "center", padding: "6px 0", color: T.white, flexShrink: 0, fontSize: 11, lineHeight: 1.4 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{new Date(h.date).getDate()}</div>
              <div style={{ textTransform: "uppercase" }}>{new Date(h.date).toLocaleString("fr-FR", { month: "short" })}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{h.titre}</div>
              {h.resume && <div style={{ fontSize: 13, color: T.gray, marginTop: 3, fontStyle: "italic" }}>{h.resume}</div>}
            </div>
            <Btn small danger onClick={() => setHistorique(x => x.filter((_, j) => j !== classeH.indexOf(h)))}>✕</Btn>
          </Card>
        ))}
      </Section>
    </div>
  );
}

// ── RESSOURCES ADMIN ─────────────────────────────────
function RessourcesAdmin({ ressources, setRessources }) {
  const [n, setN] = useState({ titre: "", type: "document", url: "", description: "" });
  const add = () => {
    if (!n.titre) return;
    setRessources(r => [...r, { ...n }]);
    setN({ titre: "", type: "document", url: "", description: "" });
  };
  return (
    <div>
      <Card>
        <h3 style={{ margin: "0 0 14px", color: T.navy }}>Ajouter une ressource</h3>
        <Inp label="Titre *" value={n.titre} onChange={v => setN(x => ({ ...x, titre: v }))} />
        <Sel label="Type" value={n.type} onChange={v => setN(x => ({ ...x, type: v }))} options={[{ value: "document", label: "📄 Document" }, { value: "video", label: "🎬 Vidéo" }, { value: "image", label: "🖼 Image" }, { value: "lien", label: "🔗 Lien web" }]} />
        <Inp label="URL / lien" value={n.url} onChange={v => setN(x => ({ ...x, url: v }))} placeholder="https://..." />
        <Inp label="Description" value={n.description} onChange={v => setN(x => ({ ...x, description: v }))} multi />
        <Btn onClick={add}>Ajouter</Btn>
      </Card>
      <Section title={`Ressources (${ressources.length})`}>
        {!ressources.length ? <Empty msg="Aucune ressource." /> : ressources.map((r, i) => (
          <Card key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div><b>{r.titre}</b> <Tag color={T.navy}>{r.type}</Tag></div>
            <Btn small danger onClick={() => setRessources(x => x.filter((_, j) => j !== i))}>✕</Btn>
          </Card>
        ))}
      </Section>
    </div>
  );
}

// ── ÉVALS + EXOS ADMIN ───────────────────────────────
function EvalsAdmin({ evaluations, setEvaluations }) {
  const [n, setN] = useState({ titre: "", date: "", activite: "", description: "", criteres: "" });
  const add = () => {
    if (!n.titre) return;
    const criteres = n.criteres ? n.criteres.split("\n").filter(Boolean) : [];
    setEvaluations(e => [...e, { ...n, criteres }]);
    setN({ titre: "", date: "", activite: "", description: "", criteres: "" });
  };
  return (
    <div>
      <Card>
        <Inp label="Titre *" value={n.titre} onChange={v => setN(x => ({ ...x, titre: v }))} />
        <Inp label="Date" type="date" value={n.date} onChange={v => setN(x => ({ ...x, date: v }))} />
        <Inp label="Activité" value={n.activite} onChange={v => setN(x => ({ ...x, activite: v }))} placeholder="ex: Handball" />
        <Inp label="Description" value={n.description} onChange={v => setN(x => ({ ...x, description: v }))} multi />
        <Inp label="Critères (un par ligne)" value={n.criteres} onChange={v => setN(x => ({ ...x, criteres: v }))} multi placeholder={"Critère 1\nCritère 2"} />
        <Btn onClick={add}>Ajouter</Btn>
      </Card>
      {evaluations.map((ev, i) => (
        <Card key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: `4px solid ${T.red}` }}>
          <div><b>{ev.titre}</b> {ev.date && <span style={{ fontSize: 12, color: T.gray }}>— {new Date(ev.date).toLocaleDateString("fr-FR")}</span>}</div>
          <Btn small danger onClick={() => setEvaluations(x => x.filter((_, j) => j !== i))}>✕</Btn>
        </Card>
      ))}
    </div>
  );
}

function ExosAdmin({ exercices, setExercices }) {
  const [n, setN] = useState({ titre: "", categorie: "", objectif: "", description: "", consignes: "" });
  const add = () => {
    if (!n.titre) return;
    const consignes = n.consignes ? n.consignes.split("\n").filter(Boolean) : [];
    setExercices(e => [...e, { ...n, consignes }]);
    setN({ titre: "", categorie: "", objectif: "", description: "", consignes: "" });
  };
  return (
    <div>
      <Card>
        <Inp label="Titre *" value={n.titre} onChange={v => setN(x => ({ ...x, titre: v }))} />
        <Inp label="Catégorie" value={n.categorie} onChange={v => setN(x => ({ ...x, categorie: v }))} placeholder="ex: Cardio, Technique…" />
        <Inp label="Objectif" value={n.objectif} onChange={v => setN(x => ({ ...x, objectif: v }))} />
        <Inp label="Description" value={n.description} onChange={v => setN(x => ({ ...x, description: v }))} multi />
        <Inp label="Étapes (une par ligne)" value={n.consignes} onChange={v => setN(x => ({ ...x, consignes: v }))} multi placeholder={"Étape 1\nÉtape 2"} />
        <Btn onClick={add}>Ajouter</Btn>
      </Card>
      {exercices.map((ex, i) => (
        <Card key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><b>{ex.titre}</b> {ex.categorie && <Tag color={T.gold}>{ex.categorie}</Tag>}</div>
          <Btn small danger onClick={() => setExercices(x => x.filter((_, j) => j !== i))}>✕</Btn>
        </Card>
      ))}
    </div>
  );
}

// ── MES NOTES — vue élève (privée par nom) ───────────
const NIV_COLORS = [T.red, T.orange, T.gold, T.green];
const NIV_LABELS = ["Maîtrise insuffisante", "Maîtrise fragile", "Maîtrise satisfaisante", "Très bonne maîtrise"];
const NIV_SHORT  = ["Insuff.", "Fragile", "Satisf.", "Très bien"];

function MesNotes({ allNotes, classe }) {
  const [nom, setNom]       = useState("");
  const [cherche, setCherche] = useState("");
  const [err, setErr]       = useState("");

  const normalise = s => s.toLowerCase().trim().replace(/\s+/g, " ");

  const mesResultats = allNotes.filter(n =>
    n.classe === classe &&
    cherche &&
    normalise(n.eleve).includes(normalise(cherche))
  );

  const handleRecherche = () => {
    if (!nom.trim()) { setErr("Saisis ton prénom et ton nom."); return; }
    setErr("");
    setCherche(nom.trim());
  };

  return (
    <div>
      {/* Bannière confidentialité */}
      <Card style={{ background: T.greenL, borderLeft: `4px solid ${T.green}`, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: T.green, fontSize: 15, marginBottom: 4 }}>🔒 Résultats personnels</div>
        <p style={{ margin: 0, fontSize: 13, color: T.gray, lineHeight: 1.6 }}>
          Saisis ton prénom et ton nom pour consulter <strong>tes résultats uniquement</strong>. Les notes des autres élèves restent invisibles.
        </p>
      </Card>

      {/* Formulaire identification */}
      <Card>
        <Inp label="Ton prénom et nom" value={nom} onChange={setNom} placeholder="ex : Marie Dupont" />
        {err && <p style={{ color: T.red, fontSize: 13, fontWeight: 600, margin: "-4px 0 8px" }}>{err}</p>}
        <Btn onClick={handleRecherche} color={T.green}>🔍 Voir mes résultats</Btn>
      </Card>

      {/* Résultats */}
      {cherche && mesResultats.length === 0 && (
        <Card style={{ textAlign: "center", padding: 24 }}>
          <p style={{ color: T.gray, margin: 0, fontSize: 14 }}>
            Aucun résultat trouvé pour « {cherche} ».<br />
            <span style={{ fontSize: 13 }}>Vérifie l'orthographe de ton nom, ou demande à ton professeur.</span>
          </p>
        </Card>
      )}

      {mesResultats.map((r, i) => (
        <Card key={i} style={{ borderLeft: `4px solid ${T.green}` }}>
          {/* En-tête évaluation */}
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: T.navy }}>{r.evaluation}</div>
              {r.activite && <Tag color={T.red} style={{ marginTop: 4 }}>{r.activite}</Tag>}
              {r.date && <div style={{ fontSize: 12, color: T.gray, marginTop: 4 }}>📅 {new Date(r.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>}
            </div>
            {r.noteGlobale !== "" && r.noteGlobale !== undefined && (
              <div style={{ textAlign: "center", background: parseFloat(r.noteGlobale) >= 10 ? T.greenL : T.redL, borderRadius: 12, padding: "10px 18px", minWidth: 70 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: parseFloat(r.noteGlobale) >= 10 ? T.green : T.red, lineHeight: 1 }}>{r.noteGlobale}</div>
                <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>/20</div>
              </div>
            )}
          </div>

          {/* Critères */}
          {r.criteres?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.gray, textTransform: "uppercase", marginBottom: 8 }}>Détail par critère</div>
              {r.criteres.map((c, ci) => {
                const niv = c.niveau; // 0-3
                const hasNiv = niv !== undefined && niv !== null && niv !== "";
                return (
                  <div key={ci} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: T.light, borderRadius: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, flex: 1, paddingRight: 10 }}>• {c.libelle}</span>
                    {hasNiv && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: NIV_COLORS[niv], background: NIV_COLORS[niv] + "18", borderRadius: 20, padding: "3px 12px", flexShrink: 0 }}>
                        {NIV_SHORT[niv]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Appréciation */}
          {r.appreciation && (
            <div style={{ background: T.sky, borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: "uppercase", marginBottom: 4 }}>Appréciation du professeur</div>
              <p style={{ margin: 0, fontSize: 14, fontStyle: "italic", lineHeight: 1.6 }}>{r.appreciation}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ── NOTES ADMIN — saisie par critères individualisée ─
function NotesAdmin({ allNotes, setAllNotes, classe, evaluations, onExport }) {
  // Sélection évaluation
  const [evalChoisie, setEvalChoisie] = useState("");
  // Formulaire saisie
  const [eleve, setEleve]           = useState("");
  const [noteGlobale, setNoteGlobale] = useState("");
  const [appreciation, setAppreciation] = useState("");
  const [niveaux, setNiveaux]       = useState({}); // { libelle: 0-3 }
  const [msg, setMsg]               = useState("");
  // Vue liste
  const [onglet, setOnglet]         = useState("saisie"); // "saisie" | "liste"

  const classeEvals = (evaluations || []);
  const evalActive  = classeEvals.find(e => e.titre === evalChoisie);

  const resetForm = () => { setEleve(""); setNoteGlobale(""); setAppreciation(""); setNiveaux({}); };

  const handleEvalChange = v => { setEvalChoisie(v); setNiveaux({}); setMsg(""); };

  const add = () => {
    if (!eleve.trim()) { setMsg("⚠️ Saisis le nom de l'élève."); return; }
    if (!evalChoisie)  { setMsg("⚠️ Choisis une évaluation."); return; }
    const criteres = (evalActive?.criteres || []).map(lib => ({
      libelle: lib,
      niveau: niveaux[lib] !== undefined ? niveaux[lib] : null,
    }));
    const record = {
      eleve: eleve.trim(),
      evaluation: evalChoisie,
      activite: evalActive?.activite || "",
      date: evalActive?.date || new Date().toISOString().split("T")[0],
      noteGlobale: noteGlobale.trim(),
      appreciation: appreciation.trim(),
      criteres,
      classe,
      createdAt: new Date().toISOString(),
    };
    setAllNotes(n => [...n, record]);
    setMsg(`✅ Note de ${eleve} enregistrée.`);
    resetForm();
    setTimeout(() => setMsg(""), 3000);
  };

  const del = (record) => setAllNotes(n => n.filter(x => x !== record));

  const classeNotes = allNotes.filter(n => n.classe === classe);
  const filtreEval  = onglet === "liste" ? evalChoisie : null;
  const listeAffichee = classeNotes
    .filter(n => !filtreEval || n.evaluation === filtreEval)
    .sort((a, b) => a.eleve.localeCompare(b.eleve));

  // Stats rapides
  const notesNum = listeAffichee.map(n => parseFloat(n.noteGlobale)).filter(v => !isNaN(v));
  const moyenne  = notesNum.length ? (notesNum.reduce((a, b) => a + b, 0) / notesNum.length).toFixed(1) : null;

  return (
    <div>
      {/* Onglets */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["saisie", "✏️ Saisir les notes"], ["liste", "📋 Voir / gérer"]].map(([id, label]) => (
          <button key={id} onClick={() => setOnglet(id)} style={{ background: onglet === id ? T.navy : T.white, color: onglet === id ? T.white : T.gray, border: `1.5px solid ${onglet === id ? T.navy : T.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── SAISIE ── */}
      {onglet === "saisie" && (
        <div>
          <Card>
            <h3 style={{ margin: "0 0 14px", color: T.navy }}>Saisir les résultats d'un élève</h3>

            <Sel label="Évaluation *" value={evalChoisie} onChange={handleEvalChange}
              options={[{ value: "", label: "— Choisir une évaluation —" }, ...classeEvals.map(e => ({ value: e.titre, label: e.titre }))]} />

            <Inp label="Nom de l'élève *" value={eleve} onChange={setEleve} placeholder="ex : Marie Dupont" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Inp label="Note globale /20" type="number" value={noteGlobale} onChange={setNoteGlobale} placeholder="ex : 14" />
              <div /> {/* spacer */}
            </div>

            {/* Critères */}
            {evalActive?.criteres?.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.gray, textTransform: "uppercase", marginBottom: 10 }}>Niveau par critère</div>
                {evalActive.criteres.map((critere, ci) => (
                  <div key={ci} style={{ marginBottom: 12, background: T.light, borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: T.navy, marginBottom: 8 }}>• {critere}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {NIV_LABELS.map((lbl, ni) => {
                        const sel = niveaux[critere] === ni;
                        return (
                          <button key={ni} onClick={() => setNiveaux(v => ({ ...v, [critere]: ni }))}
                            style={{ background: sel ? NIV_COLORS[ni] : T.white, color: sel ? T.white : T.gray, border: `1.5px solid ${sel ? NIV_COLORS[ni] : T.border}`, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .12s" }}>
                            {ni + 1} — {NIV_SHORT[ni]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Inp label="Appréciation" value={appreciation} onChange={setAppreciation} multi placeholder="Bilan qualitatif pour l'élève…" />

            {msg && <p style={{ color: msg.startsWith("⚠") ? T.red : T.green, fontWeight: 600, fontSize: 13 }}>{msg}</p>}
            <Btn onClick={add} color={T.green}>✅ Enregistrer</Btn>
          </Card>
        </div>
      )}

      {/* ── LISTE ── */}
      {onglet === "liste" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <Sel label="" value={evalChoisie} onChange={setEvalChoisie}
              options={[{ value: "", label: "Toutes les évaluations" }, ...classeEvals.map(e => ({ value: e.titre, label: e.titre }))]} />
            {moyenne && (
              <div style={{ background: T.greenL, borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700, color: T.green }}>
                Moyenne : {moyenne}/20
              </div>
            )}
            <Btn small onClick={onExport} color={T.navy}>📄 Export PDF</Btn>
          </div>

          {!listeAffichee.length ? <Empty msg="Aucun résultat enregistré." /> :
            listeAffichee.map((r, i) => (
              <Card key={i} style={{ borderLeft: `4px solid ${parseFloat(r.noteGlobale) >= 10 ? T.green : T.red}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{r.eleve}</div>
                    <div style={{ fontSize: 13, color: T.gray, marginTop: 2 }}>{r.evaluation}</div>
                    {r.appreciation && <div style={{ fontSize: 13, color: T.text, marginTop: 4, fontStyle: "italic" }}>« {r.appreciation} »</div>}
                    {r.criteres?.length > 0 && (
                      <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {r.criteres.map((c, ci) => c.niveau !== null && (
                          <span key={ci} style={{ fontSize: 11, background: NIV_COLORS[c.niveau] + "18", color: NIV_COLORS[c.niveau], borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>
                            {c.libelle.slice(0, 20)}{c.libelle.length > 20 ? "…" : ""} : {NIV_SHORT[c.niveau]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {r.noteGlobale !== "" && (
                      <div style={{ fontWeight: 900, fontSize: 20, color: parseFloat(r.noteGlobale) >= 10 ? T.green : T.red }}>
                        {r.noteGlobale}<span style={{ fontSize: 12, fontWeight: 400, color: T.gray }}>/20</span>
                      </div>
                    )}
                    <Btn small danger onClick={() => del(r)}>✕</Btn>
                  </div>
                </div>
              </Card>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ── CALENDRIER ADMIN ─────────────────────────────────
function CalAdmin({ cal, setCal }) {
  const [n, setN] = useState({ titre: "", date: "", type: "cours", classe: "Toutes", description: "" });
  const add = () => {
    if (!n.titre || !n.date) return;
    setCal(c => [...c, { ...n }]);
    setN({ titre: "", date: "", type: "cours", classe: "Toutes", description: "" });
  };
  return (
    <div>
      <Card>
        <Inp label="Titre *" value={n.titre} onChange={v => setN(x => ({ ...x, titre: v }))} />
        <Inp label="Date *" type="date" value={n.date} onChange={v => setN(x => ({ ...x, date: v }))} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Sel label="Type" value={n.type} onChange={v => setN(x => ({ ...x, type: v }))} options={[{ value: "cours", label: "📘 Cours" }, { value: "évaluation", label: "🎯 Évaluation" }, { value: "sortie", label: "🚌 Sortie/Tournoi" }, { value: "AS", label: "🏆 AS" }, { value: "info", label: "ℹ️ Info" }]} />
          <Sel label="Classe" value={n.classe} onChange={v => setN(x => ({ ...x, classe: v }))} options={["Toutes", ...CLASSES]} />
        </div>
        <Inp label="Description" value={n.description} onChange={v => setN(x => ({ ...x, description: v }))} multi />
        <Btn onClick={add}>Ajouter</Btn>
      </Card>
      <Section title={`Événements (${cal.length})`}>
        {!cal.length ? <Empty msg="Aucun événement." /> : [...cal].sort((a, b) => new Date(a.date) - new Date(b.date)).map((e, i) => (
          <Card key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <b>{e.titre}</b> <span style={{ fontSize: 12, color: T.gray }}>{new Date(e.date).toLocaleDateString("fr-FR")}</span>
              {e.classe !== "Toutes" && <Tag color={T.gold} style={{ marginLeft: 6 }}>{e.classe}</Tag>}
            </div>
            <Btn small danger onClick={() => setCal(x => x.filter((_, j) => j !== i))}>✕</Btn>
          </Card>
        ))}
      </Section>
    </div>
  );
}

// ── AS ADMIN ─────────────────────────────────────────
function ASAdmin({ as, setAs }) {
  const [n, setN] = useState({ titre: "", date: "", sport: "", lieu: "", description: "" });
  const add = () => {
    if (!n.titre || !n.date) return;
    setAs(a => [...a, { ...n }]);
    setN({ titre: "", date: "", sport: "", lieu: "", description: "" });
  };
  return (
    <div>
      <Card>
        <Inp label="Titre de la compétition *" value={n.titre} onChange={v => setN(x => ({ ...x, titre: v }))} />
        <Inp label="Date *" type="date" value={n.date} onChange={v => setN(x => ({ ...x, date: v }))} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Inp label="Sport" value={n.sport} onChange={v => setN(x => ({ ...x, sport: v }))} placeholder="ex: Handball, Cross…" />
          <Inp label="Lieu" value={n.lieu} onChange={v => setN(x => ({ ...x, lieu: v }))} placeholder="ex: Gymnase de Surgères" />
        </div>
        <Inp label="Infos complémentaires" value={n.description} onChange={v => setN(x => ({ ...x, description: v }))} multi />
        <Btn onClick={add} color={T.purple}>Ajouter la compétition</Btn>
      </Card>
      <Section title={`Compétitions (${as.length})`}>
        {!as.length ? <Empty msg="Aucune compétition." /> : [...as].sort((a, b) => new Date(a.date) - new Date(b.date)).map((e, i) => (
          <Card key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><b>{e.titre}</b> <span style={{ fontSize: 12, color: T.gray }}>{new Date(e.date).toLocaleDateString("fr-FR")}</span> {e.sport && <Tag color={T.purple}>{e.sport}</Tag>}</div>
            <Btn small danger onClick={() => setAs(x => x.filter((_, j) => j !== i))}>✕</Btn>
          </Card>
        ))}
      </Section>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// CODES D'ACCÈS PAR DÉFAUT
// ═══════════════════════════════════════════════════
const DEFAULT_CODES = { "6ème": "JDA6", "5ème": "JDA5", "4ème": "JDA4", "3ème": "JDA3" };

// ═══════════════════════════════════════════════════
// ÉCRAN D'ACCUEIL — cartes sport style
// ═══════════════════════════════════════════════════
function LoginScreen({ codes, onStudentLogin, onAdminLogin }) {
  const [step, setStep]            = useState("home");
  const [classeChoisie, setClasse] = useState(null);
  const [code, setCode]            = useState("");
  const [pw, setPw]                = useState("");
  const [err, setErr]              = useState("");

  const checkCode = () => {
    if ((codes[classeChoisie] || DEFAULT_CODES[classeChoisie]) === code.trim()) {
      onStudentLogin(classeChoisie);
    } else {
      setErr("Code incorrect. Demande-le à ton prof !");
      setTimeout(() => setErr(""), 2200);
    }
  };
  const checkAdmin = () => {
    if (pw === ADMIN_PW) onAdminLogin();
    else { setErr("Mot de passe incorrect."); setTimeout(() => setErr(""), 2200); }
  };

  return (
    <div style={{
      minHeight: "100vh", background: T.navy,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px 20px", fontFamily: "'Segoe UI', system-ui, sans-serif",
      backgroundImage: "radial-gradient(ellipse at 20% 50%, #1E3A7244 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #4F8EF711 0%, transparent 50%)",
    }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ margin: "0 auto 16px", filter: `drop-shadow(0 8px 20px ${T.gold}66)` }}><LogoEPS size={72} /></div>
        <h1 style={{ color: T.white, fontWeight: 900, fontSize: 26, margin: "0 0 4px", letterSpacing: -.5 }}>Mon année en EPS</h1>
        
      </div>

      {step === "home" && (
        <div style={{ width: "100%", maxWidth: 400 }}>
          <p style={{ color: T.grayL, fontSize: 12, textAlign: "center", margin: "0 0 20px", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>Sélectionne ta classe</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {CLASSES.map((c, idx) => (
              <button key={c} onClick={() => { setClasse(c); setCode(""); setErr(""); setStep("classe"); }}
                style={{ background: CLASS_GRAD[c], border: "none", borderRadius: 20, padding: "24px 16px", cursor: "pointer", textAlign: "center", fontFamily: "inherit", transform: idx % 2 === 0 ? "rotate(-1.5deg)" : "rotate(1deg)", transition: "transform .2s, box-shadow .2s", boxShadow: `0 8px 28px ${CLASS_COLOR[c]}44`, position: "relative", overflow: "hidden" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "rotate(0deg) scale(1.05)"; e.currentTarget.style.boxShadow = `0 14px 40px ${CLASS_COLOR[c]}66`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = idx % 2 === 0 ? "rotate(-1.5deg)" : "rotate(1deg)"; e.currentTarget.style.boxShadow = `0 8px 28px ${CLASS_COLOR[c]}44`; }}>
                <div style={{ position: "absolute", top: -12, right: -12, width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,.1)" }} />
                <div style={{ position: "absolute", bottom: -8, left: -8, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
                <div style={{ fontSize: 32, marginBottom: 8 }}>{CLASS_EMOJI[c]}</div>
                <div style={{ color: T.white, fontWeight: 900, fontSize: 24, lineHeight: 1 }}>{c}</div>
              </button>
            ))}
          </div>
          <button onClick={() => { setStep("admin"); setPw(""); setErr(""); }}
            style={{ width: "100%", background: "rgba(255,255,255,.07)", border: "1.5px solid rgba(255,255,255,.12)", borderRadius: 14, padding: "12px", cursor: "pointer", color: T.grayL, fontSize: 13, fontWeight: 700, fontFamily: "inherit", letterSpacing: .5, transition: "background .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.12)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.07)"}>
            🔑 Accès enseignant
          </button>
        </div>
      )}

      {step === "classe" && (
        <div style={{ background: T.white, borderRadius: 24, padding: 28, width: "100%", maxWidth: 360, boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
          <button onClick={() => setStep("home")} style={{ background: "none", border: "none", cursor: "pointer", color: T.gray, fontSize: 13, fontWeight: 700, marginBottom: 20, fontFamily: "inherit", padding: 0 }}>← Retour</button>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: CLASS_GRAD[classeChoisie], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 12px", boxShadow: `0 6px 20px ${CLASS_COLOR[classeChoisie]}44` }}>{CLASS_EMOJI[classeChoisie]}</div>
            <h3 style={{ margin: "0 0 4px", color: T.navy, fontSize: 20, fontWeight: 900 }}>Classe de {classeChoisie}</h3>
            <p style={{ margin: 0, color: T.gray, fontSize: 13 }}>Entre le code donné par ton prof</p>
          </div>
          <Inp label="Code d'accès" value={code} onChange={v => { setCode(v); setErr(""); }} placeholder="ex : JDA6" />
          {err && <p style={{ color: T.coral, fontSize: 13, fontWeight: 700, margin: "-6px 0 10px" }}>⚠️ {err}</p>}
          <Btn onClick={checkCode} color={CLASS_COLOR[classeChoisie]} style={{ width: "100%", justifyContent: "center", fontSize: 15, padding: "12px" }}>Entrer dans mon espace →</Btn>
        </div>
      )}

      {step === "admin" && (
        <div style={{ background: T.white, borderRadius: 24, padding: 28, width: "100%", maxWidth: 360, boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
          <button onClick={() => setStep("home")} style={{ background: "none", border: "none", cursor: "pointer", color: T.gray, fontSize: 13, fontWeight: 700, marginBottom: 20, fontFamily: "inherit", padding: 0 }}>← Retour</button>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>🔐</div>
            <h3 style={{ margin: "0 0 4px", color: T.navy, fontWeight: 900 }}>Accès enseignant</h3>
            <p style={{ margin: 0, color: T.gray, fontSize: 13 }}>Panneau d'administration</p>
          </div>
          <Inp label="Mot de passe" type="password" value={pw} onChange={v => { setPw(v); setErr(""); }} />
          {err && <p style={{ color: T.coral, fontSize: 13, fontWeight: 700, margin: "-6px 0 10px" }}>⚠️ {err}</p>}
          <Btn onClick={checkAdmin} style={{ width: "100%", justifyContent: "center", fontSize: 15, padding: "12px" }}>Accéder au panneau →</Btn>
        </div>
      )}

      <p style={{ color: "rgba(255,255,255,.2)", fontSize: 11, marginTop: 32, textAlign: "center", letterSpacing: 1 }}>MON ANNÉE EN EPS</p>
    </div>
  );
}

// ── GESTION DES CODES — section admin ────────────────
function CodesAdmin({ codes, setCodes }) {
  const [edit, setEdit] = useState({ ...codes });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setCodes({ ...edit });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <Card style={{ borderLeft: `4px solid ${T.gold}` }}>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: T.gray, lineHeight: 1.6 }}>
          Ces codes sont à distribuer à chaque classe. Un élève qui saisit le code de sa classe accède <strong>uniquement</strong> à son espace. Tu peux les modifier à tout moment.
        </p>
        {CLASSES.map(c => (
          <div key={c} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 60, fontWeight: 700, color: T.navy, fontSize: 15, flexShrink: 0 }}>{c}</div>
            <input
              value={edit[c] || ""}
              onChange={e => setEdit(x => ({ ...x, [c]: e.target.value }))}
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${T.border}`, fontSize: 15, fontFamily: "monospace", fontWeight: 700, letterSpacing: 2, background: T.light, outline: "none" }}
              onFocus={e => e.target.style.borderColor = T.navy}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, marginTop: 16, alignItems: "center" }}>
          <Btn onClick={handleSave} color={T.green}>💾 Enregistrer les codes</Btn>
          {saved && <span style={{ color: T.green, fontSize: 13, fontWeight: 600 }}>✅ Codes mis à jour !</span>}
        </div>
      </Card>

      <Card style={{ background: T.goldL }}>
        <div style={{ fontWeight: 700, color: T.navy, marginBottom: 8 }}>📋 Codes actuels à distribuer</div>
        {CLASSES.map(c => (
          <div key={c} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 14, color: T.text }}>Classe de <strong>{c}</strong></span>
            <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 15, color: T.navy, letterSpacing: 2 }}>{codes[c] || DEFAULT_CODES[c]}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 1. QR CODE — génération via api.qrserver.com
// ═══════════════════════════════════════════════════
function QRCodeModal({ url, onClose }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,33,71,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}
      onClick={onClose}>
      <div style={{ background: T.white, borderRadius: 24, padding: 32, textAlign: "center", maxWidth: 320, boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight: 900, fontSize: 18, color: T.navy, marginBottom: 4 }}>📲 QR Code séance</div>
        <p style={{ fontSize: 13, color: T.gray, margin: "0 0 16px" }}>À projeter au tableau — les élèves scannent pour accéder directement à la séance.</p>
        <img src={qrUrl} alt="QR Code" width={220} height={220} style={{ borderRadius: 12, border: `2px solid ${T.border}` }} />
        <p style={{ fontSize: 11, color: T.grayL, margin: "12px 0 16px", wordBreak: "break-all" }}>{url}</p>
        <Btn outline onClick={onClose} style={{ width: "100%", justifyContent: "center" }}>Fermer</Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 2. EXPORT PDF NOTES — génération HTML → fenêtre impression
// ═══════════════════════════════════════════════════
function exportNotesPDF(notes, classe, evaluations) {
  const classeNotes = notes.filter(n => n.classe === classe);
  if (!classeNotes.length) { alert("Aucune note à exporter pour cette classe."); return; }

  const NIV = ["Insuffisant", "Fragile", "Satisfaisant", "Très bien"];
  const NIV_C = ["#FF4D6D", "#F97316", "#4F8EF7", "#10B981"];

  const rows = classeNotes.map(r => `
    <tr>
      <td style="padding:8px 12px;font-weight:700;border-bottom:1px solid #eee">${r.eleve}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${r.evaluation}</td>
      <td style="padding:8px 12px;text-align:center;border-bottom:1px solid #eee">
        <span style="font-weight:900;font-size:18px;color:${parseFloat(r.noteGlobale) >= 10 ? "#10B981" : "#FF4D6D"}">${r.noteGlobale || "—"}</span>/20
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">
        ${(r.criteres || []).map(c => c.niveau !== null ? `<div style="font-size:11px;margin-bottom:3px"><span style="color:${NIV_C[c.niveau]};font-weight:700">${NIV[c.niveau]}</span> — ${c.libelle}</div>` : "").join("")}
      </td>
      <td style="padding:8px 12px;font-style:italic;color:#666;font-size:12px;border-bottom:1px solid #eee">${r.appreciation || ""}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Notes EPS — ${classe}</title>
    <style>body{font-family:'Segoe UI',sans-serif;padding:32px;color:#111}
    h1{color:#0F2147;margin-bottom:4px}h2{color:#7A87A0;font-weight:500;margin-top:0}
    table{width:100%;border-collapse:collapse;margin-top:20px}
    th{background:#0F2147;color:white;padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.5px}
    @media print{body{padding:16px}}</style></head>
    <body>
    <h1>Mon année en EPS</h1>
    <h2>Notes — Classe de ${classe}</h2>
    <p style="font-size:12px;color:#999">Exporté le ${new Date().toLocaleDateString("fr-FR", { weekday:"long",day:"numeric",month:"long",year:"numeric" })}</p>
    <table><thead><tr>
      <th>Élève</th><th>Évaluation</th><th style="text-align:center">Note</th><th>Critères</th><th>Appréciation</th>
    </tr></thead><tbody>${rows}</tbody></table>
    </body></html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

// ═══════════════════════════════════════════════════
// 3. SONDAGES — admin crée, élèves votent
// ═══════════════════════════════════════════════════
function SondagesView({ sondages, setSondages, classe }) {
  const actifs = (sondages || []).filter(s => s.classe === classe && s.ouvert);
  if (!actifs.length) return <Empty msg="Aucun sondage en cours." />;
  return (
    <div>
      {actifs.map((s, si) => {
        const total = (s.votes || []).length;
        return (
          <Card key={si} style={{ borderLeft: `4px solid ${T.purple}` }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: T.navy, marginBottom: 12 }}>🗳 {s.question}</div>
            {s.options.map((opt, oi) => {
              const count = (s.votes || []).filter(v => v.choix === oi).length;
              const pct   = total > 0 ? Math.round(count / total * 100) : 0;
              return (
                <button key={oi} type="button"
                  onClick={() => {
                    setSondages(x => x.map((sx, xi) => xi === (sondages || []).indexOf(s)
                      ? { ...sx, votes: [...(sx.votes || []), { choix: oi, date: new Date().toISOString() }] }
                      : sx));
                  }}
                  style={{ width: "100%", background: T.lightAlt, border: `2px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 8, cursor: "pointer", fontFamily: "inherit", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "border-color .15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = T.purple}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{opt}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 80, height: 6, background: T.border, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: T.purple, borderRadius: 3, transition: "width .4s" }} />
                    </div>
                    <span style={{ fontSize: 12, color: T.gray, minWidth: 32 }}>{count} vote{count > 1 ? "s" : ""}</span>
                  </div>
                </button>
              );
            })}
            <div style={{ fontSize: 12, color: T.gray, marginTop: 4 }}>{total} vote{total > 1 ? "s" : ""} au total</div>
          </Card>
        );
      })}
    </div>
  );
}

function SondagesAdmin({ sondages, setSondages, classe }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions]   = useState(["", ""]);

  const addOption = () => setOptions(o => [...o, ""]);
  const updOption = (i, v) => setOptions(o => o.map((x, j) => j === i ? v : x));
  const delOption = (i) => setOptions(o => o.filter((_, j) => j !== i));

  const create = () => {
    if (!question.trim() || options.filter(Boolean).length < 2) return;
    setSondages(x => [...(x || []), { question: question.trim(), options: options.filter(Boolean), classe, votes: [], ouvert: true, date: new Date().toISOString() }]);
    setQuestion(""); setOptions(["", ""]);
  };

  const classeSondages = (sondages || []).filter(s => s.classe === classe);

  return (
    <div>
      <Card>
        <h3 style={{ margin: "0 0 14px", color: T.navy }}>🗳 Créer un sondage</h3>
        <Inp label="Question *" value={question} onChange={setQuestion} placeholder="ex : Quel sport pour la prochaine séquence ?" />
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 11, fontWeight: 800, color: T.gray, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: .8 }}>Options (min. 2)</label>
          {options.map((o, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input value={o} onChange={e => updOption(i, e.target.value)} placeholder={`Option ${i + 1}`}
                style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: `2px solid ${T.border}`, fontSize: 14, fontFamily: "inherit", outline: "none", background: T.lightAlt }} />
              {options.length > 2 && <Btn small danger onClick={() => delOption(i)}>✕</Btn>}
            </div>
          ))}
          <Btn small outline onClick={addOption}>+ Option</Btn>
        </div>
        <Btn onClick={create} color={T.purple}>Publier le sondage</Btn>
      </Card>

      <Section title={`Sondages — ${classe} (${classeSondages.length})`}>
        {!classeSondages.length ? <Empty msg="Aucun sondage." /> : classeSondages.map((s, i) => {
          const idx   = (sondages || []).indexOf(s);
          const total = (s.votes || []).length;
          return (
            <Card key={i} style={{ borderLeft: `4px solid ${s.ouvert ? T.purple : T.gray}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                <div style={{ fontWeight: 700, flex: 1 }}>{s.question}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn small onClick={() => setSondages(x => x.map((sx, xi) => xi === idx ? { ...sx, ouvert: !sx.ouvert } : sx))}
                    color={s.ouvert ? T.gray : T.green}>
                    {s.ouvert ? "Fermer" : "Rouvrir"}
                  </Btn>
                  <Btn small danger onClick={() => setSondages(x => x.filter((_, xi) => xi !== idx))}>✕</Btn>
                </div>
              </div>
              {s.options.map((opt, oi) => {
                const count = (s.votes || []).filter(v => v.choix === oi).length;
                const pct   = total > 0 ? Math.round(count / total * 100) : 0;
                return (
                  <div key={oi} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ flex: 1, fontSize: 13 }}>{opt}</div>
                    <div style={{ width: 100, height: 8, background: T.border, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: T.purple, borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 12, color: T.gray, minWidth: 60 }}>{count} ({pct}%)</div>
                  </div>
                );
              })}
              <div style={{ fontSize: 12, color: T.gray, marginTop: 4 }}>{total} vote{total > 1 ? "s" : ""} · {s.ouvert ? "🟢 Ouvert" : "🔴 Fermé"}</div>
            </Card>
          );
        })}
      </Section>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 4. RÉPONSE PROF AUX DÉPÔTS — intégré dans DepotsAdmin
// ═══════════════════════════════════════════════════
// (handled inline in DepotsAdmin below)

// ═══════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════
export default function App() {
  // Session : null = écran accueil | "admin" | "6ème" | "5ème" etc.
  const [session, setSession]       = useState(null);
  const [activeClass, setActiveClass] = useState("6ème");
  const [activeTab, setActiveTab]   = useState("seance");
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState("");

  // Per-class data
  const [store, setStore]           = useState(seedStore());
  // Global data
  const [globalCal, setGlobalCal]   = useState([]);
  const [globalAS, setGlobalAS]     = useState([]);
  const [globalRes, setGlobalRes]   = useState([]);
  const [allNotes, setAllNotes]     = useState([]);
  const [allDepots, setAllDepots]   = useState([]);
  const [allHisto, setAllHisto]     = useState([]);
  const [allSondages, setAllSondages] = useState([]);
  // Codes d'accès
  const [codes, setCodes]           = useState({ ...DEFAULT_CODES });
  // QR code modal
  const [showQR, setShowQR]         = useState(false);

  const isAdmin = session === "admin";

  // Rafraîchissement automatique toutes les 60s pour débloquer les séances programmées
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 60000);
    return () => clearInterval(t);
  }, []);

  // Load from storage
  useEffect(() => {
    (async () => {
      const s  = await load("eps2_store");
      const c  = await load("eps2_cal");
      const as = await load("eps2_as");
      const rs = await load("eps2_res");
      const n  = await load("eps2_notes");
      const d  = await load("eps2_depots");
      const h  = await load("eps2_histo");
      const so = await load("eps2_sondages");
      const cd = await load("eps2_codes");
      if (s)  setStore(x => ({ ...seedStore(), ...s }));
      if (c)  setGlobalCal(c);
      if (as) setGlobalAS(as);
      if (rs) setGlobalRes(rs);
      if (n)  setAllNotes(n);
      if (d)  setAllDepots(d);
      if (h)  setAllHisto(h);
      if (so) setAllSondages(so);
      if (cd) setCodes(x => ({ ...DEFAULT_CODES, ...cd }));
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    await Promise.all([
      save("eps2_store", store),
      save("eps2_cal", globalCal),
      save("eps2_as", globalAS),
      save("eps2_res", globalRes),
      save("eps2_notes", allNotes),
      save("eps2_depots", allDepots),
      save("eps2_histo", allHisto),
      save("eps2_sondages", allSondages),
      save("eps2_codes", codes),
    ]);
    setToast("✅ Sauvegardé !"); setTimeout(() => setToast(""), 2500);
  };

  // Helpers to read/write per-class fields
  const cls = store[activeClass] || mkClassData();
  const updateCls = (field, val, targetClass) => {
    const c = targetClass || activeClass;
    setStore(s => ({ ...s, [c]: { ...s[c], [field]: val } }));
  };

  // QR Code URL (pointe sur la séance du jour)
  const qrUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleStudentLogin = (classe) => {
    setActiveClass(classe);
    setActiveTab("seance");
    setSession(classe);
  };
  const handleAdminLogin = () => {
    setActiveClass("6ème");
    setActiveTab("dashboard");
    setSession("admin");
  };
  const handleLogout = () => {
    setSession(null);
    setActiveTab("seance");
  };

  const nav = isAdmin ? NAV_ADMIN : NAV_STUDENT;
  const tabLabel = nav.find(n => n.id === activeTab);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "system-ui", color: T.gray, fontSize: 16 }}>
      Chargement du portail…
    </div>
  );

  // ── Pas connecté → écran d'accueil ──
  if (!session) return <LoginScreen codes={codes} onStudentLogin={handleStudentLogin} onAdminLogin={handleAdminLogin} />;

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: T.light, minHeight: "100vh", color: T.text, display: "flex", flexDirection: "column" }}>

      {/* ── TOP HEADER ── */}
      <header style={{
        background: T.gradNav, height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 4px 20px rgba(15,33,71,.25)", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flexShrink: 0, filter: `drop-shadow(0 3px 8px ${T.gold}55)` }}><LogoEPSSmall /></div>
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ color: T.white, fontWeight: 800, fontSize: 15, letterSpacing: -.2 }}>Mon année en EPS</div>
            <div style={{ color: T.gold, fontSize: 11, fontWeight: 600 }}>
              {isAdmin ? "👨‍🏫 Administration" : `${CLASS_EMOJI[activeClass]} ${activeClass}`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {isAdmin && (
            <Btn small onClick={handleSave} color={T.green} style={{ boxShadow: `0 3px 10px ${T.green}44` }}>
              💾 Sauvegarder
            </Btn>
          )}
          {isAdmin && (
            <Btn small onClick={() => setShowQR(true)} color={T.purple} style={{ boxShadow: `0 3px 10px ${T.purple}44` }}>
              📲 QR Séance
            </Btn>
          )}
          <button onClick={handleLogout} style={{ background: "rgba(255,255,255,.1)", border: "1.5px solid rgba(255,255,255,.2)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: T.white, fontSize: 12, fontWeight: 700, fontFamily: "inherit", transition: "background .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.18)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.1)"}>
            {isAdmin ? "← Quitter" : "🚪 Quitter"}
          </button>
        </div>
      </header>

      {/* ── SÉLECTEUR DE CLASSE (admin seulement) ── */}
      {isAdmin && (
        <div style={{ background: T.navyM, display: "flex", gap: 0, overflowX: "auto", flexShrink: 0, padding: "0 8px" }}>
          {CLASSES.map(c => (
            <button key={c} onClick={() => setActiveClass(c)} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "10px 18px", fontWeight: 800, fontSize: 13,
              color: activeClass === c ? T.gold : "rgba(255,255,255,.45)",
              borderBottom: activeClass === c ? `3px solid ${T.gold}` : "3px solid transparent",
              transition: "all .15s", whiteSpace: "nowrap", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span>{CLASS_EMOJI[c]}</span> {c}
            </button>
          ))}
        </div>
      )}

      {/* ── MAIN LAYOUT ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar nav — redesignée */}
        <nav style={{
          width: 192, background: T.white,
          borderRight: `1.5px solid ${T.border}`,
          overflowY: "auto", flexShrink: 0,
          display: "flex", flexDirection: "column", gap: 2,
          padding: "16px 10px",
        }}>
          {/* Badge classe élève */}
          {!isAdmin && (
            <div style={{ margin: "0 0 14px 0", background: CLASS_GRAD[activeClass], borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{CLASS_EMOJI[activeClass]}</span>
              <div>
                <div style={{ color: T.white, fontWeight: 800, fontSize: 13 }}>{activeClass}</div>
                
              </div>
            </div>
          )}
          {nav.map(n => {
            const active = activeTab === n.id;
            return (
              <button key={n.id} onClick={() => setActiveTab(n.id)} style={{
                background: active ? T.light : "none",
                border: "none", cursor: "pointer", borderRadius: 10,
                padding: "9px 11px",
                fontWeight: active ? 800 : 500, fontSize: 13,
                color: active ? T.navy : T.gray,
                textAlign: "left", display: "flex", alignItems: "center", gap: 9,
                transition: "all .12s",
                borderLeft: active ? `3px solid ${T.gold}` : "3px solid transparent",
                boxShadow: active ? "inset 0 0 0 1px rgba(15,33,71,.08)" : "none",
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.light; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "none"; }}>
                <span style={{ fontSize: 16, minWidth: 20, textAlign: "center" }}>{n.emoji}</span>
                <span style={{ lineHeight: 1.3 }}>{n.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px 24px 80px", background: T.light }}>
          {tabLabel && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, color: T.navy, fontWeight: 900, letterSpacing: -.3 }}>
                  {tabLabel.emoji} {tabLabel.label}
                </h2>
                {activeTab !== "dashboard" && activeTab !== "AS" && activeTab !== "ressources" && activeTab !== "calendrier" && activeTab !== "codes" && (
                  <div style={{ fontSize: 12, color: T.gray, marginTop: 2, fontWeight: 600 }}>Classe de {activeClass}</div>
                )}
              </div>
              {isAdmin && activeTab !== "dashboard" && (
                <Pill color={T.orange}>✏️ Mode édition</Pill>
              )}
            </div>
          )}

          {/* ── STUDENT VIEWS ── */}
          {!isAdmin && activeTab === "seance"      && <SeanceView seance={cls.seance} />}
          {!isAdmin && activeTab === "regles"      && <ReglesView regles={store[activeClass]?.regles || []} />}
          {!isAdmin && activeTab === "sequence"    && <SequenceView seq={cls.sequence} />}
          {!isAdmin && activeTab === "annonces"    && <AnnoncesView annonces={cls.annonces} />}
          {!isAdmin && activeTab === "calendrier"  && <CalendrierView calendrier={globalCal.filter(e => e.classe === "Toutes" || e.classe === activeClass)} />}
          {!isAdmin && activeTab === "evaluations" && <EvalsView evaluations={store[activeClass]?.evaluations || []} />}
          {!isAdmin && activeTab === "mesnotes"    && <MesNotes allNotes={allNotes} classe={activeClass} />}
          {!isAdmin && activeTab === "exercices"   && <ExosView exercices={store[activeClass]?.exercices || []} />}
          {!isAdmin && activeTab === "sondages"    && <SondagesView sondages={allSondages} setSondages={setAllSondages} classe={activeClass} />}
          {!isAdmin && activeTab === "ressources"  && <RessourcesView ressources={globalRes} />}
          {!isAdmin && activeTab === "depot"       && <DepotView depots={allDepots} setDepots={setAllDepots} classe={activeClass} evaluations={store[activeClass]?.evaluations || []} />}
          {!isAdmin && activeTab === "AS"          && <ASView as={globalAS} />}

          {/* ── ADMIN VIEWS ── */}
          {isAdmin && activeTab === "dashboard"    && <Dashboard store={store} globalCal={globalCal} globalAS={globalAS} allDepots={allDepots} />}
          {isAdmin && activeTab === "seance"       && <SeanceAdmin seance={cls.seance} setSeance={v => updateCls("seance", v)} store={store} activeClass={activeClass} updateCls={updateCls} allHisto={allHisto} setAllHisto={setAllHisto} />}
          {isAdmin && activeTab === "regles"       && <ReglesAdmin regles={store[activeClass]?.regles || []} setRegles={v => updateCls("regles", v)} />}
          {isAdmin && activeTab === "sequence"     && <SequenceAdmin seq={cls.sequence} setSeq={v => updateCls("sequence", v)} />}
          {isAdmin && activeTab === "annonces"     && <AnnoncesAdmin annonces={cls.annonces} setAnnonces={v => updateCls("annonces", v)} />}
          {isAdmin && activeTab === "calendrier"   && <CalAdmin cal={globalCal} setCal={setGlobalCal} />}
          {isAdmin && activeTab === "evaluations"  && <EvalsAdmin evaluations={store[activeClass]?.evaluations || []} setEvaluations={v => updateCls("evaluations", v)} />}
          {isAdmin && activeTab === "exercices"    && <ExosAdmin exercices={store[activeClass]?.exercices || []} setExercices={v => updateCls("exercices", v)} />}
          {isAdmin && activeTab === "sondages"     && <SondagesAdmin sondages={allSondages} setSondages={setAllSondages} classe={activeClass} />}
          {isAdmin && activeTab === "ressources"   && <RessourcesAdmin ressources={globalRes} setRessources={setGlobalRes} />}
          {isAdmin && activeTab === "notes"        && <NotesAdmin allNotes={allNotes} setAllNotes={setAllNotes} classe={activeClass} evaluations={store[activeClass]?.evaluations || []} onExport={() => exportNotesPDF(allNotes, activeClass)} />}
          {isAdmin && activeTab === "depots"       && <DepotsAdmin depots={allDepots} setDepots={setAllDepots} classe={activeClass} />}
          {isAdmin && activeTab === "historique"   && <HistoriqueAdmin historique={allHisto} setHistorique={setAllHisto} classe={activeClass} />}
          {isAdmin && activeTab === "AS"           && <ASAdmin as={globalAS} setAs={setGlobalAS} />}
          {isAdmin && activeTab === "codes"        && <CodesAdmin codes={codes} setCodes={v => { setCodes(v); save("eps2_codes", v); }} />}
        </main>
      </div>

      {showQR && <QRCodeModal url={qrUrl} onClose={() => setShowQR(false)} />}
      <Toast msg={toast} />
    </div>
  );
}
