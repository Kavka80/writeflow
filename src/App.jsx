import { useState } from "react";

const TYPES = [
  { id: "email", label: "📧 Email", desc: "Profesionalno sporočilo" },
  { id: "report", label: "📄 Poročilo", desc: "Kratko poročilo / povzetek" },
  { id: "offer", label: "💼 Ponudba", desc: "Poslovna ponudba" },
  { id: "reminder", label: "🔔 Opomnik", desc: "Sporočilo / opomnik" },
  { id: "decline", label: "🚫 Zavrnitev", desc: "Vljudna zavrnitev" },
  { id: "meeting", label: "📅 Sestanek", desc: "Povabilo / povzetek sestanka" },
];

const TONES = [
  { id: "formal", label: "Formalno" },
  { id: "friendly", label: "Prijazno" },
  { id: "direct", label: "Jedrnato" },
  { id: "persuasive", label: "Prepričljivo" },
];

const LENGTHS = [
  { id: "short", label: "Kratko" },
  { id: "medium", label: "Srednje" },
  { id: "long", label: "Podrobno" },
];

function buildPrompt({ type, tone, length, context, recipient, sender }) {
  const typeNames = { email: "email", report: "poročilo", offer: "poslovno ponudbo", reminder: "opomnik", decline: "vljudno zavrnitev", meeting: "sporočilo o sestanku" };
  const toneNames = { formal: "formalen in profesionalen", friendly: "prijazen in topel", direct: "jedrnat in direkten", persuasive: "prepričljiv in motivacijski" };
  const lengthNames = { short: "kratek (3-5 stavkov)", medium: "srednje dolg (2-3 odstavki)", long: "podroben (4-5 odstavkov)" };

  return `Napiši profesionalen ${typeNames[type]} v slovenščini.

Ton: ${toneNames[tone]}
Dolžina: ${lengthNames[length]}
${recipient ? `Prejemnik: ${recipient}` : ""}
${sender ? `Pošiljatelj / podpis: ${sender}` : ""}

Vsebina / kontekst:
${context}

Napiši samo besedilo dokumenta, brez kakršnih koli pojasnil. Vključi primeren pozdrav in zaključek. Besedilo naj bo takoj pripravljeno za pošiljanje ali vstavitev.`;
}

export default function EmailGenerator() {
  const [type, setType] = useState("email");
  const [tone, setTone] = useState("formal");
  const [length, setLength] = useState("medium");
  const [context, setContext] = useState("");
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const generate = async () => {
    if (!context.trim() || loading) return;
    setLoading(true);
    setResult("");
    setCopied(false);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: buildPrompt({ type, tone, length, context, recipient, sender }) }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "Napaka pri generiranju.";
      setResult(text);
    } catch {
      setResult("⚠️ Napaka pri povezavi. Poskusite znova.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setResult("");
    setContext("");
    setRecipient("");
    setSender("");
    setCharCount(0);
    setCopied(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f13", fontFamily: "'Sora', 'Segoe UI', sans-serif", color: "#e8e8f0", padding: "0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 3px; }
        textarea, input { outline: none; }
        .pill-btn { transition: all 0.18s cubic-bezier(.4,0,.2,1); cursor: pointer; border: none; }
        .pill-btn:hover { filter: brightness(1.15); }
        .type-card { transition: all 0.18s; cursor: pointer; }
        .type-card:hover { transform: translateY(-2px); }
        .gen-btn { transition: all 0.2s; }
        .gen-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(139,92,246,0.45) !important; }
        .gen-btn:active:not(:disabled) { transform: translateY(0); }
        .copy-btn:hover { background: #2a2a3a !important; }
        .copy-btn { transition: all 0.15s; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease-out forwards; }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .shimmer-text { background: linear-gradient(90deg, #8b5cf6, #06b6d4, #8b5cf6); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 2.5s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.9s linear infinite; }
      `}</style>

      <div style={{ borderBottom: "1px solid #1e1e2e", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(15,15,20,0.95)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✍️</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700 }}>WriteFlow</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>AI pisni asistent</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#4b5563", background: "#1a1a24", borderRadius: 20, padding: "5px 12px", border: "1px solid #2a2a3a" }}>⚡ Prihrani 2h/dan</div>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 20px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 700, margin: "0 0 12px", lineHeight: 1.15, letterSpacing: "-1px" }}>
            Profesionalna besedila<br /><span className="shimmer-text">v 10 sekundah</span>
          </h1>
          <p style={{ color: "#6b7280", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>Opišite kaj potrebujete — AI napiše email, poročilo ali ponudbo, pripravljeno za pošiljanje.</p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, fontWeight: 600 }}>Vrsta besedila</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {TYPES.map(t => (
              <div key={t.id} className="type-card" onClick={() => setType(t.id)} style={{ background: type === t.id ? "rgba(139,92,246,0.15)" : "#18181f", border: `1.5px solid ${type === t.id ? "#8b5cf6" : "#2a2a3a"}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{t.label.split(" ")[0]}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: type === t.id ? "#c4b5fd" : "#d1d5db" }}>{t.label.split(" ").slice(1).join(" ")}</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, fontWeight: 600 }}>Ton</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {TONES.map(t => (
                <button key={t.id} className="pill-btn" onClick={() => setTone(t.id)} style={{ background: tone === t.id ? "#8b5cf6" : "#1e1e2e", color: tone === t.id ? "white" : "#9ca3af", border: `1px solid ${tone === t.id ? "#8b5cf6" : "#2a2a3a"}`, borderRadius: 20, padding: "6px 14px", fontSize: 13, fontFamily: "inherit", fontWeight: tone === t.id ? 600 : 400 }}>{t.label}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, fontWeight: 600 }}>Dolžina</div>
            <div style={{ display: "flex", gap: 7 }}>
              {LENGTHS.map(l => (
                <button key={l.id} className="pill-btn" onClick={() => setLength(l.id)} style={{ background: length === l.id ? "#06b6d4" : "#1e1e2e", color: length === l.id ? "white" : "#9ca3af", border: `1px solid ${length === l.id ? "#06b6d4" : "#2a2a3a"}`, borderRadius: 20, padding: "6px 14px", fontSize: 13, fontFamily: "inherit", fontWeight: length === l.id ? 600 : 400 }}>{l.label}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8, fontWeight: 600 }}>Prejemnik (neobvezno)</div>
            <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="npr. g. Novak, stranka..." style={{ width: "100%", background: "#18181f", border: "1.5px solid #2a2a3a", borderRadius: 10, padding: "10px 14px", color: "#e8e8f0", fontSize: 14, fontFamily: "inherit" }} onFocus={e => e.target.style.borderColor = "#8b5cf6"} onBlur={e => e.target.style.borderColor = "#2a2a3a"} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8, fontWeight: 600 }}>Podpis (neobvezno)</div>
            <input value={sender} onChange={e => setSender(e.target.value)} placeholder="npr. Ana Kovač, prodajni tim..." style={{ width: "100%", background: "#18181f", border: "1.5px solid #2a2a3a", borderRadius: 10, padding: "10px 14px", color: "#e8e8f0", fontSize: 14, fontFamily: "inherit" }} onFocus={e => e.target.style.borderColor = "#8b5cf6"} onBlur={e => e.target.style.borderColor = "#2a2a3a"} />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Kaj želite sporočiti? *</div>
            <div style={{ fontSize: 11, color: charCount > 400 ? "#f59e0b" : "#4b5563" }}>{charCount}/500</div>
          </div>
          <textarea value={context} onChange={e => { setContext(e.target.value); setCharCount(e.target.value.length); }} placeholder="Opišite vsebino..." maxLength={500} rows={5} style={{ width: "100%", background: "#18181f", border: "1.5px solid #2a2a3a", borderRadius: 12, padding: "14px 16px", color: "#e8e8f0", fontSize: 14, fontFamily: "inherit", lineHeight: 1.6, resize: "vertical" }} onFocus={e => e.target.style.borderColor = "#8b5cf6"} onBlur={e => e.target.style.borderColor = "#2a2a3a"} />
        </div>

        <button className="gen-btn" onClick={generate} disabled={!context.trim() || loading} style={{ width: "100%", padding: "15px", background: !context.trim() || loading ? "#2a2a3a" : "linear-gradient(135deg, #8b5cf6, #06b6d4)", border: "none", borderRadius: 12, color: !context.trim() || loading ? "#6b7280" : "white", fontSize: 15, fontWeight: 700, cursor: !context.trim() || loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          {loading ? (<><svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>Generiram...</>) : "✨ Generiraj besedilo"}
        </button>

        {result && (
          <div className="fade-up" style={{ marginTop: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#c4b5fd" }}>✅ Generirano besedilo</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="copy-btn" onClick={copy} style={{ background: "#1e1e2e", border: "1px solid #2a2a3a", borderRadius: 8, padding: "7px 14px", color: copied ? "#10b981" : "#9ca3af", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{copied ? "✓ Kopirano!" : "📋 Kopiraj"}</button>
                <button className="copy-btn" onClick={reset} style={{ background: "#1e1e2e", border: "1px solid #2a2a3a", borderRadius: 8, padding: "7px 14px", color: "#9ca3af", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>🔄 Novo</button>
              </div>
            </div>
            <div style={{ background: "#18181f", border: "1.5px solid #2a2a3a", borderRadius: 14, padding: "22px 24px", fontSize: 14.5, lineHeight: 1.8, color: "#d1d5db", whiteSpace: "pre-wrap", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #8b5cf6, #06b6d4)" }} />
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
