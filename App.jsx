import { useState, useMemo, useEffect, useRef } from "react";

// ─── UTILS ────────────────────────────────────────────────────────────────────
const Rs = (n) => "Rs " + new Intl.NumberFormat("fr-MU",{maximumFractionDigits:0}).format(Math.abs(n??0));
const pct = (u,t) => t>0?Math.min(Math.round((u/t)*100),100):0;
const MS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
const now = new Date(), TM = now.getMonth(), TY = now.getFullYear();

// ─── THEMES ───────────────────────────────────────────────────────────────────
const THEMES = [
  {id:"violet", label:"Violet",  main:"#7c3aed", gA:"#7c3aed", gB:"#c026d3", light:"#f5f3ff", text:"#4c1d95"},
  {id:"indigo", label:"Indigo",  main:"#4f46e5", gA:"#4f46e5", gB:"#7c3aed", light:"#eef2ff", text:"#3730a3"},
  {id:"rose",   label:"Rose",    main:"#e11d48", gA:"#e11d48", gB:"#f43f5e", light:"#fff1f2", text:"#9f1239"},
  {id:"emerald",label:"Vert",    main:"#059669", gA:"#059669", gB:"#0d9488", light:"#ecfdf5", text:"#065f46"},
  {id:"amber",  label:"Ambre",   main:"#d97706", gA:"#d97706", gB:"#ea580c", light:"#fffbeb", text:"#92400e"},
  {id:"sky",    label:"Bleu",    main:"#0284c7", gA:"#0284c7", gB:"#4f46e5", light:"#f0f9ff", text:"#0c4a6e"},
];

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
const CATS = [
  {id:"groceries", e:"🛒", l:"Courses",    c:"#f97316", bucket:"spending"},
  {id:"restaurant",e:"🍽️",l:"Restaurant", c:"#ef4444", bucket:"spending"},
  {id:"transport", e:"⛽", l:"Transport",  c:"#6366f1", bucket:"spending"},
  {id:"sport",     e:"🏃", l:"Sport",      c:"#10b981", bucket:"spending"},
  {id:"health",    e:"💊", l:"Santé",      c:"#ec4899", bucket:"spending"},
  {id:"beauty",    e:"💇", l:"Beauté",     c:"#a855f7", bucket:"spending"},
  {id:"clothes",   e:"👗", l:"Vêtements",  c:"#8b5cf6", bucket:"spending"},
  {id:"kids",      e:"🧒", l:"Enfants",    c:"#f59e0b", bucket:"spending"},
  {id:"leisure",   e:"🎮", l:"Loisirs",    c:"#14b8a6", bucket:"spending"},
  {id:"home",      e:"🏡", l:"Maison",     c:"#78716c", bucket:"spending"},
  {id:"travel",    e:"✈️", l:"Vacances",   c:"#3b82f6", bucket:"spending"},
  {id:"tech",      e:"📱", l:"Tech/Abos",  c:"#475569", bucket:"spending"},
  {id:"other",     e:"📝", l:"Autre",      c:"#94a3b8", bucket:"spending"},
  {id:"income2",   e:"💰", l:"Bonus",      c:"#10b981", bucket:"extra"},
  {id:"freelance", e:"💻", l:"Freelance",  c:"#3b82f6", bucket:"extra"},
  {id:"rental",    e:"🔑", l:"Loyer reçu", c:"#14b8a6", bucket:"extra"},
];

const PLACES = {
  groceries:["Super U","Jumbo","Winner's","Intermart"],
  restaurant:["KFC","Pizza Hut","Snack local","McDonalds"],
  transport:["Esso","Total","Bus","Taxi"],
  sport:["Padel","Gym","Yoga","Football","Tennis"],
  health:["Pharmacie","Médecin","Dentiste"],
};

const AVATARS = ["💼","💰","🌴","🏆","🎯","⚡","🚀","🦁","🐬","🌺","👑","🔥"];

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const KEY = "mb_v2";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)||"null"); } catch { return null; } };
const save = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} };

// ═════════════════════════════════════════════════════════════════════════════
// APP
// ═════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [profile,     setProfile]     = useState(null);
  const [setup,       setSetup]       = useState(0);   // 0=welcome 1=name 2=money null=done
  const [obName,      setObName]      = useState("");
  const [obAvatar,    setObAvatar]    = useState("💼");
  const [obTheme,     setObTheme]     = useState("violet");
  const [obSalary,    setObSalary]    = useState("");
  const [obCharges,   setObCharges]   = useState("");
  const [obSavings,   setObSavings]   = useState("");
  const [entries,     setEntries]     = useState([]);
  const [customCats,  setCustomCats]  = useState([]);
  const [hiddenCats,  setHiddenCats]  = useState([]);
  const [tab,         setTab]         = useState("add");
  const [month,       setMonth]       = useState(TM);
  const [year,        setYear]        = useState(TY);
  const [toast,       setToast]       = useState(null);
  const [profOpen,    setProfOpen]    = useState(false);
  const [setupOpen,   setSetupOpen]   = useState(false);
  const [catOpen,     setCatOpen]     = useState(false);
  const [editProf,    setEditProf]    = useState({name:"",avatar:"💼",themeId:"violet"});

  // Load saved data
  useEffect(() => {
    const d = load();
    if (d) {
      if (d.profile)    setProfile(d.profile);
      if (d.setup!==undefined) setSetup(d.setup);
      if (d.entries)    setEntries(d.entries);
      if (d.customCats) setCustomCats(d.customCats);
      if (d.hiddenCats) setHiddenCats(d.hiddenCats);
    }
  }, []);

  useEffect(() => {
    save({ profile, setup, entries, customCats, hiddenCats });
  }, [profile, setup, entries, customCats, hiddenCats]);

  const T = THEMES.find(t=>t.id===profile?.themeId) || THEMES[0];
  const inOb = setup !== null;

  // Computed
  const mE = useMemo(() => entries.filter(e=>e.month===month&&e.year===year), [entries,month,year]);
  const totalCharges = (profile?.chargesList||[]).reduce((s,c)=>s+c.amount,0) || (profile?.charges||0);
  const income   = (profile?.salary||0) + mE.filter(e=>e.bucket==="extra").reduce((s,e)=>s+e.amount,0);
  const expenses = totalCharges + mE.filter(e=>e.bucket==="spending").reduce((s,e)=>s+e.amount,0);
  const savings  = profile?.savings||0;
  const left     = (profile?.salary||0) - totalCharges - savings - mE.filter(e=>e.bucket==="spending").reduce((s,e)=>s+e.amount,0);

  const prevME = useMemo(() => {
    const pm=month===0?11:month-1, py=month===0?year-1:year;
    return entries.filter(e=>e.month===pm&&e.year===py);
  }, [entries,month,year]);
  const prevExp = prevME.filter(e=>e.bucket==="spending").reduce((s,e)=>s+e.amount,0) + (profile?.charges||0);

  const history = useMemo(() => {
    return Array.from({length:6},(_,i)=>{
      let m=month-5+i, y=year; if(m<0){m+=12;y--;}
      const me=entries.filter(e=>e.month===m&&e.year===y);
      const sp=me.filter(e=>e.bucket==="spending").reduce((s,e)=>s+e.amount,0)+(profile?.charges||0);
      return {m, y, label:MS[m], spent:sp};
    });
  }, [entries,month,year,profile]);

  const showToast = (msg,c="#10b981") => { setToast({msg,c}); setTimeout(()=>setToast(null),2000); };
  const addEntry  = (e) => { setEntries(p=>[...p,{...e,id:Date.now(),month,year}]); showToast("✓ Noté !"); };
  const delEntry  = (id) => setEntries(p=>p.filter(x=>x.id!==id));
  const resetApp  = () => { setProfile(null);setSetup(0);setEntries([]);setCustomCats([]);setHiddenCats([]);setProfOpen(false); };
  const prevMonth = () => { if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const nextMonth = () => { if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };

  const allCats = [...CATS, ...customCats];
  const visCats = allCats.filter(c=>!hiddenCats.includes(c.id));

  // ── CSS ──────────────────────────────────────────────────────────────────────
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Sora',sans-serif;background:#f4f3f8;-webkit-font-smoothing:antialiased;}
    ::-webkit-scrollbar{width:0;}
    button{font-family:'Sora',sans-serif;cursor:pointer;transition:all .15s;}
    input{font-family:'Sora',sans-serif;outline:none;}
    .page{animation:fadeUp .22s ease forwards;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    .tap:active{transform:scale(.95);}
    .card{background:#fff;border-radius:22px;box-shadow:0 2px 12px rgba(0,0,0,.06);}
    .inp{background:#f4f3f8;border:2px solid transparent;border-radius:14px;padding:14px 16px;font-size:16px;width:100%;color:#1a1a2e;font-family:'Sora',sans-serif;}
    .inp:focus{background:#fff;border-color:${T.main};}
    .btn{border-radius:18px;padding:16px;font-weight:700;font-size:15px;width:100%;border:none;font-family:'Sora',sans-serif;letter-spacing:.2px;transition:all .18s;}
    .btn-p{background:linear-gradient(135deg,${T.gA},${T.gB});color:#fff;box-shadow:0 8px 24px ${T.main}40;}
    .btn-p:active{transform:scale(.97);box-shadow:0 4px 12px ${T.main}30;}
    .btn-s{background:#f4f3f8;color:#64748b;box-shadow:none;}
    .btn-s:active{transform:scale(.97);background:#ede9f5;}
    .btn-danger{background:linear-gradient(135deg,#ef4444,#f97316);color:#fff;box-shadow:0 6px 18px rgba(239,68,68,.35);}
    .cat-btn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px;border-radius:20px;background:#f8f7fc;border:2.5px solid transparent;cursor:pointer;transition:all .18s;font-family:'Sora',sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.04);}
    .cat-btn:active{transform:scale(.9);}
    .cat-btn.active{background:${T.light};border-color:${T.main};box-shadow:0 4px 14px ${T.main}25;}
    .kbd{height:64px;border-radius:18px;font-size:22px;font-weight:700;background:#fff;border:2px solid #f0eef8;color:#1a1a2e;font-family:'Sora',sans-serif;transition:all .12s;box-shadow:0 2px 6px rgba(0,0,0,.04);}
    .kbd:active{transform:scale(.88);background:#f4f3f8;box-shadow:none;}
    .overlay{position:fixed;inset:0;background:rgba(10,8,20,.6);backdrop-filter:blur(12px);z-index:200;display:flex;align-items:flex-end;justify-content:center;}
    .sheet{background:#fff;border-radius:28px 28px 0 0;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;padding-bottom:40px;}
    .handle{width:40px;height:4px;background:#e2e0ea;border-radius:2px;margin:14px auto 0;}
    .toast{position:fixed;top:80px;left:50%;transform:translateX(-50%);padding:11px 22px;border-radius:50px;font-weight:700;font-size:13px;z-index:500;white-space:nowrap;box-shadow:0 8px 28px rgba(0,0,0,.2);animation:fadeUp .28s ease;}
    .toggle{width:50px;height:28px;border-radius:20px;border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;}
    .toggle-knob{position:absolute;top:4px;width:20px;height:20px;border-radius:50%;background:#fff;transition:left .2s;box-shadow:0 1px 4px rgba(0,0,0,.2);}
    .row{display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid #f4f3f8;}
    .row:last-child{border-bottom:none;}
  `;

  // ══════════════════════════════════════════════════════════════════════════════
  // ONBOARDING
  // ══════════════════════════════════════════════════════════════════════════════
  if (inOb) {
    const T2 = THEMES.find(t=>t.id===obTheme)||THEMES[0];
    const finishOb = () => {
      const sal = parseFloat(obSalary)||0;
      const cha = parseFloat(obCharges)||0;
      const sav = parseFloat(obSavings)||0;
      setProfile({name:obName||"Moi",avatar:obAvatar,themeId:obTheme,salary:sal,charges:cha,savings:sav});
      setSetup(null);
      setTab("add");
    };

    return (
      <div style={{minHeight:"100vh",background:`linear-gradient(150deg,${T2.light} 0%,#fff 60%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px",fontFamily:"'Sora',sans-serif"}}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}`}</style>

        {/* STEP 0 — Welcome */}
        {setup===0&&(
          <div style={{width:"100%",maxWidth:400,textAlign:"center"}} className="page">
            <div style={{fontSize:72,marginBottom:24}}>💰</div>
            <div style={{fontWeight:900,fontSize:30,color:"#1a1a2e",letterSpacing:"-1px",marginBottom:12,lineHeight:1.2}}>MonBudget</div>
            <div style={{fontSize:16,color:"#64748b",lineHeight:1.7,marginBottom:40}}>Gérez votre argent simplement.<br/>En 2 minutes, c'est prêt.</div>
            <button className="btn btn-p tap" onClick={()=>setSetup(1)} style={{background:`linear-gradient(135deg,${T2.gA},${T2.gB})`,boxShadow:`0 8px 28px ${T2.main}45`}}>
              Commencer →
            </button>
          </div>
        )}

        {/* STEP 1 — Profile */}
        {setup===1&&(
          <div style={{width:"100%",maxWidth:400}} className="page">
            <div style={{fontWeight:900,fontSize:24,color:"#1a1a2e",marginBottom:6}}>Qui êtes-vous ? 👋</div>
            <div style={{fontSize:14,color:"#94a3b8",marginBottom:28}}>Étape 1 sur 2</div>

            <input className="inp" placeholder="Votre prénom" value={obName} onChange={e=>setObName(e.target.value)} style={{marginBottom:16,fontSize:18}}/>

            <div style={{fontSize:12,fontWeight:700,color:"#94a3b8",letterSpacing:"1px",marginBottom:10}}>AVATAR</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:20}}>
              {AVATARS.map(av=>(
                <button key={av} onClick={()=>setObAvatar(av)}
                  style={{height:48,borderRadius:14,fontSize:22,background:obAvatar===av?T2.light:"#f8f7fc",border:`2.5px solid ${obAvatar===av?T2.main:"transparent"}`,cursor:"pointer"}}>
                  {av}
                </button>
              ))}
            </div>

            <div style={{fontSize:12,fontWeight:700,color:"#94a3b8",letterSpacing:"1px",marginBottom:10}}>COULEUR</div>
            <div style={{display:"flex",gap:10,marginBottom:32}}>
              {THEMES.map(th=>(
                <button key={th.id} onClick={()=>setObTheme(th.id)}
                  style={{width:38,height:38,borderRadius:"50%",background:th.main,border:`3px solid ${obTheme===th.id?"#1a1a2e":"transparent"}`,transform:obTheme===th.id?"scale(1.2)":"scale(1)",transition:"all .15s",cursor:"pointer"}}/>
              ))}
            </div>

            <button className="btn btn-p tap" onClick={()=>setSetup(2)} style={{background:`linear-gradient(135deg,${T2.gA},${T2.gB})`}}>
              Suivant →
            </button>
          </div>
        )}

        {/* STEP 2 — Money */}
        {setup===2&&(
          <div style={{width:"100%",maxWidth:400}} className="page">
            <div style={{fontWeight:900,fontSize:24,color:"#1a1a2e",marginBottom:6}}>Vos finances 💰</div>
            <div style={{fontSize:14,color:"#94a3b8",marginBottom:28}}>Étape 2 sur 2 · Modifiable à tout moment</div>

            {[
              {label:"💼 Salaire mensuel net (Rs)",val:obSalary,set:setObSalary,hint:"ex: 50000"},
              {label:"🏠 Charges fixes mensuelles (Rs)",val:obCharges,set:setObCharges,hint:"Loyer, CEB, eau..."},
              {label:"🏦 Épargne mensuelle (Rs)",val:obSavings,set:setObSavings,hint:"ex: 5000 (optionnel)"},
            ].map(({label,val,set,hint})=>(
              <div key={label} style={{marginBottom:16}}>
                <div style={{fontSize:13,fontWeight:600,color:"#475569",marginBottom:7}}>{label}</div>
                <input className="inp" type="number" placeholder={hint} value={val} onChange={e=>set(e.target.value)}/>
              </div>
            ))}

            {obSalary&&(
              <div style={{background:T2.light,borderRadius:16,padding:"12px 16px",marginBottom:20,border:`1px solid ${T2.main}25`}}>
                <div style={{fontSize:12,color:"#64748b",marginBottom:4}}>Disponible après charges & épargne</div>
                <div style={{fontWeight:800,fontSize:20,color:T2.main}}>
                  {Rs(Math.max((parseFloat(obSalary)||0)-(parseFloat(obCharges)||0)-(parseFloat(obSavings)||0),0))} / mois
                </div>
              </div>
            )}

            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-s tap" onClick={()=>setSetup(1)} style={{flex:"0 0 100px"}}>← Retour</button>
              <button className="btn btn-p tap" onClick={finishOb} style={{flex:1,background:`linear-gradient(135deg,${T2.gA},${T2.gB})`}}>
                C'est parti ! 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MAIN APP
  // ══════════════════════════════════════════════════════════════════════════════
  const spendingThisMonth = mE.filter(e=>e.bucket==="spending").reduce((s,e)=>s+e.amount,0);

  return (
    <div style={{minHeight:"100vh",background:"#f4f3f8",fontFamily:"'Sora',sans-serif",color:"#1a1a2e"}}>
      <style>{CSS}</style>

      {toast&&<div className="toast" style={{background:toast.c,color:"#fff"}}>{toast.msg}</div>}

      {/* ── TOP BAR ── */}
      <div style={{background:"#fff",padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50,borderBottom:"1px solid #f0eef8"}}>
        <button onClick={()=>{setEditProf({name:profile?.name||"",avatar:profile?.avatar||"💼",themeId:profile?.themeId||"violet"});setProfOpen(true);}}
          style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",padding:0,cursor:"pointer"}}>
          <div style={{width:38,height:38,borderRadius:14,background:`linear-gradient(135deg,${T.gA},${T.gB})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,boxShadow:`0 4px 12px ${T.main}35`}}>
            {profile?.avatar||"💼"}
          </div>
          <div style={{textAlign:"left"}}>
            <div style={{fontWeight:800,fontSize:14,color:"#1a1a2e"}}>{profile?.name||"MonBudget"}</div>
            <div style={{fontSize:11,color:"#94a3b8"}}>{MS[month]} {year}</div>
          </div>
        </button>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <button onClick={prevMonth} style={{width:32,height:32,borderRadius:10,border:"none",background:"#f4f3f8",color:"#64748b",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
          <button onClick={nextMonth} style={{width:32,height:32,borderRadius:10,border:"none",background:"#f4f3f8",color:"#64748b",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
          <button onClick={()=>setSetupOpen(true)}
            style={{width:32,height:32,borderRadius:10,background:T.light,color:T.main,border:`1.5px solid ${T.main}30`,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>⚙</button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{maxWidth:540,margin:"0 auto",padding:"14px 14px 110px"}}>

        {/* ════ ACCUEIL ════ */}
        {tab==="home"&&(
          <div className="page">
            {/* Solde */}
            <div style={{background:`linear-gradient(135deg,${T.gA},${T.gB})`,borderRadius:24,padding:"22px 22px",marginBottom:14,color:"#fff",position:"relative",overflow:"hidden",boxShadow:`0 12px 36px ${T.main}45`}}>
              <div style={{position:"absolute",right:-40,top:-40,width:160,height:160,borderRadius:"50%",background:"rgba(255,255,255,.07)"}}/>
              <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.6)",letterSpacing:".5px",marginBottom:6}}>DISPONIBLE CE MOIS</div>
              <div style={{fontSize:38,fontWeight:900,letterSpacing:"-1.5px",lineHeight:1,marginBottom:6}}>{left<0?"−":""}{Rs(Math.abs(left))}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>{left>=0?"✓ Après charges & épargne":"⚠ Dépenses supérieures aux revenus"}</div>
              {profile?.salary>0&&(
                <div style={{marginTop:14,height:4,background:"rgba(255,255,255,.2)",borderRadius:2}}>
                  <div style={{height:"100%",width:`${pct(spendingThisMonth+(profile?.charges||0)+(profile?.savings||0),profile?.salary)}%`,background:"rgba(255,255,255,.85)",borderRadius:2,transition:"width .8s"}}/>
                </div>
              )}
            </div>

            {/* 3 chiffres rapides */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
              {[
                {l:"Salaire",   v:profile?.salary||0,  c:T.main, bg:T.light},
                {l:"Charges",   v:totalCharges,   c:"#ef4444", bg:"#fef2f2"},
                {l:"Épargne",   v:profile?.savings||0, c:"#10b981", bg:"#ecfdf5"},
              ].map(({l,v,c,bg})=>(
                <div key={l} className="card" style={{padding:"14px 10px",textAlign:"center"}}>
                  <div style={{fontWeight:800,fontSize:14,color:c}}>{Rs(v)}</div>
                  <div style={{fontSize:10,color:"#94a3b8",fontWeight:600,marginTop:3}}>{l}</div>
                </div>
              ))}
            </div>

            {/* Feu tricolore */}
            <div className="card" style={{overflow:"hidden",marginBottom:14}}>
              <div style={{padding:"14px 16px",borderBottom:"1px solid #f4f3f8",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontWeight:700,fontSize:14}}>Postes ce mois</div>
                {profile?.salary>0&&<span style={{fontSize:11,color:"#94a3b8"}}>{Rs(profile.salary)}</span>}
              </div>
              {!profile?.salary?(
                <div style={{padding:"20px",textAlign:"center",color:"#94a3b8",fontSize:13}}>
                  Configurez votre salaire via ⚙
                </div>
              ):[
                ...(profile?.chargesList||[]).filter(c=>c.name&&c.amount>0).map(charge=>({
                  e:"🔒", l:charge.name, used:charge.amount, budget:null, type:"fixed"
                })),
                {e:"🏦",l:"Épargne",used:profile?.savings||0,budget:(profile?.salary||0)*.2,type:"saving"},
                ...[...CATS.filter(c=>c.bucket==="spending"),...customCats].map(cat=>{
                  const used=mE.filter(e=>e.bucket==="spending"&&e.catId===cat.id).reduce((s,e)=>s+e.amount,0);
                  if(!used) return null;
                  return {e:cat.e,l:cat.l,used,budget:null,type:"var",color:cat.c};
                }).filter(Boolean),
              ].map((item,i)=>{
                const dot=item.type==="saving"?"#6366f1":item.type==="fixed"?"#64748b":!item.budget?"#94a3b8":item.used/item.budget>=1?"#ef4444":item.used/item.budget>=.8?"#f59e0b":"#10b981";
                const p=item.budget?pct(item.used,item.budget):null;
                return (
                  <div key={i} style={{padding:"11px 16px",borderBottom:"1px solid #f9f8fc",display:"flex",alignItems:"center",gap:10,background:i%2?"#faf9fc":"#fff"}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:dot,flexShrink:0,boxShadow:`0 0 0 3px ${dot}20`}}/>
                    <span style={{fontSize:17,flexShrink:0}}>{item.e}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:13}}>{item.l}</div>
                      {p!==null&&<div style={{height:3,background:"#f0eef8",borderRadius:2,marginTop:4,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${p}%`,background:dot,borderRadius:2,transition:"width .6s"}}/>
                      </div>}
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:700,fontSize:13,color:dot}}>{Rs(item.used)}</div>
                      {item.budget&&<div style={{fontSize:9,color:"#94a3b8"}}>/ {Rs(item.budget)}</div>}
                    </div>
                    {p!==null&&<span style={{fontSize:10,fontWeight:700,color:dot,background:dot+"15",padding:"2px 7px",borderRadius:20,flexShrink:0}}>{p}%</span>}
                  </div>
                );
              })}
              {spendingThisMonth>0&&profile?.salary>0&&(
                <div style={{padding:"11px 16px",background:"#f9f8fc",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:600,color:"#64748b"}}>Total dépensé</span>
                  <span style={{fontWeight:800,fontSize:14,color:"#ef4444"}}>{Rs(spendingThisMonth)}</span>
                </div>
              )}
            </div>

            {/* Comparaison mois */}
            {prevExp>0&&(
              <div className="card" style={{padding:"14px 16px",marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:"1px",marginBottom:10}}>VS MOIS DERNIER</div>
                {(()=>{
                  const curr=expenses, diff=curr-prevExp, ok=diff<=0;
                  const c=diff===0?"#94a3b8":ok?"#10b981":"#ef4444";
                  return (
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{fontSize:13,color:"#64748b"}}>Dépenses</span>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:12,color:"#cbd5e1"}}>{Rs(prevExp)}</span>
                        <span style={{fontSize:16,fontWeight:800,color:c}}>{diff===0?"→":diff>0?"↑":"↓"}</span>
                        <span style={{fontWeight:800,fontSize:14,color:c}}>{Rs(curr)}</span>
                        {diff!==0&&<span style={{fontSize:10,fontWeight:700,color:c,background:c+"15",padding:"2px 8px",borderRadius:20}}>{ok?"-":"+"}{Math.abs(Math.round(diff/prevExp*100))}%</span>}
                      </div>
                    </div>
                  );
                })()}
                <div style={{marginTop:10,fontSize:12,fontWeight:600,color:expenses<prevExp?"#10b981":expenses>prevExp?"#ef4444":"#94a3b8"}}>
                  {expenses<prevExp?`🎉 ${Rs(prevExp-expenses)} économisés ce mois !`:expenses>prevExp?`💡 ${Rs(expenses-prevExp)} de plus que le mois dernier`:"➡️ Stable"}
                </div>
              </div>
            )}

            {/* Dernières saisies */}
            {mE.length>0&&(
              <div className="card" style={{overflow:"hidden"}}>
                <div style={{padding:"12px 16px",borderBottom:"1px solid #f4f3f8",fontWeight:700,fontSize:13}}>Dernières saisies</div>
                {[...mE].reverse().slice(0,5).map(e=>{
                  const cat=allCats.find(c=>c.id===e.catId);
                  return (
                    <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderBottom:"1px solid #f9f8fc"}}>
                      <div style={{width:36,height:36,borderRadius:12,background:cat?cat.c+"15":"#f4f3f8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{cat?.e||"📝"}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:13}}>{e.label}</div>
                        <div style={{fontSize:10,color:"#94a3b8",marginTop:1}}>{new Date(e.id).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</div>
                      </div>
                      <div style={{fontWeight:700,fontSize:13,color:e.bucket==="extra"?"#10b981":"#ef4444"}}>{e.bucket==="extra"?"+":"−"}{Rs(e.amount)}</div>
                      <button onClick={()=>delEntry(e.id)} style={{background:"none",border:"none",color:"#cbd5e1",fontSize:16,cursor:"pointer",padding:"0 4px"}} onMouseOver={e2=>e2.currentTarget.style.color="#ef4444"} onMouseOut={e2=>e2.currentTarget.style.color="#cbd5e1"}>×</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ════ SAISIR ════ */}
        {tab==="add"&&(
          <AddTab T={T} mE={mE} entries={entries} onAdd={addEntry} visCats={visCats} customCats={customCats} setCustomCats={setCustomCats} hiddenCats={hiddenCats} setHiddenCats={setHiddenCats}/>
        )}

        {/* ════ STATS ════ */}
        {tab==="stats"&&(
          <div className="page">
            <div style={{fontWeight:900,fontSize:22,marginBottom:16}}>📊 Statistiques</div>

            {/* Graphique 6 mois */}
            <div className="card" style={{padding:"18px",marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:"1px",marginBottom:14}}>DÉPENSES SUR 6 MOIS</div>
              {(()=>{
                const max=Math.max(...history.map(m=>m.spent),1);
                return (
                  <div>
                    <div style={{display:"flex",alignItems:"flex-end",gap:6,height:100,marginBottom:8}}>
                      {history.map((m,i)=>{
                        const cur=m.m===month&&m.y===year;
                        const h=Math.max(Math.round((m.spent/max)*90),4);
                        return (
                          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                            <div style={{width:"100%",height:h,background:cur?`linear-gradient(180deg,${T.gA},${T.gB})`:"#e8e6f0",borderRadius:"6px 6px 0 0",transition:"height .6s"}}/>
                            <span style={{fontSize:9,fontWeight:cur?700:500,color:cur?T.main:"#94a3b8"}}>{m.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{textAlign:"center",fontSize:12,color:"#64748b"}}>
                      Ce mois : <strong style={{color:T.main}}>{Rs(history[5]?.spent||0)}</strong>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Répartition par catégorie */}
            <div className="card" style={{overflow:"hidden",marginBottom:14}}>
              <div style={{padding:"14px 16px",borderBottom:"1px solid #f4f3f8",fontWeight:700,fontSize:13}}>Répartition ce mois</div>
              {CATS.filter(c=>c.bucket==="spending").map(cat=>{
                const used=mE.filter(e=>e.catId===cat.id).reduce((s,e)=>s+e.amount,0);
                if(!used) return null;
                const p=spendingThisMonth>0?pct(used,spendingThisMonth):0;
                return (
                  <div key={cat.id} style={{padding:"11px 16px",borderBottom:"1px solid #f9f8fc",display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:18,flexShrink:0}}>{cat.e}</span>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontWeight:600,fontSize:12}}>{cat.l}</span>
                        <span style={{fontWeight:700,fontSize:12,color:cat.c}}>{Rs(used)}</span>
                      </div>
                      <div style={{height:4,background:"#f0eef8",borderRadius:2,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${p}%`,background:cat.c,borderRadius:2,transition:"width .6s"}}/>
                      </div>
                    </div>
                    <span style={{fontSize:10,fontWeight:700,color:cat.c,background:cat.c+"15",padding:"2px 7px",borderRadius:20,flexShrink:0}}>{p}%</span>
                  </div>
                );
              })}
              {spendingThisMonth===0&&(
                <div style={{padding:"24px",textAlign:"center",color:"#94a3b8",fontSize:13}}>Aucune dépense ce mois</div>
              )}
            </div>

            {/* Tableau historique */}
            <div className="card" style={{overflow:"hidden"}}>
              <div style={{padding:"14px 16px",borderBottom:"1px solid #f4f3f8",fontWeight:700,fontSize:13}}>Historique mensuel</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",padding:"10px 16px",background:"#f9f8fc",borderBottom:"1px solid #f4f3f8"}}>
                {["Mois","Dépenses"].map(h=><span key={h} style={{fontSize:10,fontWeight:700,color:"#94a3b8",letterSpacing:".5px"}}>{h.toUpperCase()}</span>)}
              </div>
              {[...history].reverse().map((m,i)=>{
                const cur=m.m===month&&m.y===year;
                return (
                  <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr",padding:"12px 16px",borderBottom:"1px solid #f9f8fc",background:cur?T.light+"50":"#fff",alignItems:"center"}}>
                    <span style={{fontWeight:cur?700:500,fontSize:13,color:cur?T.main:"#1a1a2e"}}>{cur?"▶ ":""}{m.label} {m.y}</span>
                    <span style={{fontWeight:700,fontSize:13,color:"#ef4444"}}>{m.spent>0?Rs(m.spent):"—"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(255,255,255,.97)",backdropFilter:"blur(20px)",borderTop:"1px solid #f0eef8",display:"flex",zIndex:100,paddingBottom:"env(safe-area-inset-bottom)"}}>
        {[{k:"home",e:"🏠",l:"Accueil"},{k:"add",e:"➕",l:"Saisir"},{k:"stats",e:"📊",l:"Stats"}].map(({k,e,l})=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"10px 0 14px",background:"none",border:"none",cursor:"pointer"}}>
            <div style={{width:46,height:46,borderRadius:15,display:"flex",alignItems:"center",justifyContent:"center",fontSize:k==="add"?24:20,background:k==="add"?tab===k?`linear-gradient(135deg,${T.gA},${T.gB})`:T.light:tab===k?T.light:"transparent",color:k==="add"?tab===k?"#fff":T.main:tab===k?T.main:"#94a3b8",boxShadow:k==="add"&&tab===k?`0 4px 16px ${T.main}45`:"none",transition:"all .18s"}}>
              {e}
            </div>
            <span style={{fontSize:10,fontWeight:tab===k?700:500,color:tab===k?T.main:"#94a3b8"}}>{l}</span>
          </button>
        ))}
      </div>

      {/* ── MODAL PROFIL ── */}
      {profOpen&&(
        <div className="overlay" onClick={()=>setProfOpen(false)}>
          <div className="sheet" onClick={ev=>ev.stopPropagation()}>
            <div className="handle"/>
            <div style={{padding:"20px 20px 0"}}>
              <div style={{fontWeight:800,fontSize:18,marginBottom:18}}>👤 Mon profil</div>
              <input className="inp" value={editProf.name} onChange={e=>setEditProf(p=>({...p,name:e.target.value}))} placeholder="Prénom" style={{marginBottom:12}}/>
              <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:14}}>
                {AVATARS.map(av=>(
                  <button key={av} onClick={()=>setEditProf(p=>({...p,avatar:av}))}
                    style={{height:44,borderRadius:12,fontSize:20,background:editProf.avatar===av?T.light:"#f8f7fc",border:`2.5px solid ${editProf.avatar===av?T.main:"transparent"}`,cursor:"pointer"}}>
                    {av}
                  </button>
                ))}
              </div>
              <div style={{display:"flex",gap:10,marginBottom:18}}>
                {THEMES.map(th=>(
                  <button key={th.id} onClick={()=>setEditProf(p=>({...p,themeId:th.id}))}
                    style={{width:34,height:34,borderRadius:"50%",background:th.main,border:`3px solid ${editProf.themeId===th.id?"#1a1a2e":"transparent"}`,transform:editProf.themeId===th.id?"scale(1.18)":"scale(1)",transition:"all .15s",cursor:"pointer"}}/>
                ))}
              </div>

              {/* Lien vers Mes catégories */}
              <button onClick={()=>{setProfOpen(false);setCatOpen(true);}}
                style={{display:"flex",alignItems:"center",gap:12,width:"100%",background:"#f9f8fc",border:"1px solid #e8e6f0",borderRadius:14,padding:"13px 16px",cursor:"pointer",marginBottom:16,textAlign:"left"}}>
                <span style={{fontSize:22}}>🗂️</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14}}>Mes catégories</div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:1}}>Ajouter, retirer, organiser</div>
                </div>
                <span style={{color:"#cbd5e1",fontSize:18}}>›</span>
              </button>

              <div style={{display:"flex",gap:10,marginBottom:12}}>
                <button className="btn btn-p tap" onClick={()=>{setProfile(p=>({...p,...editProf}));setProfOpen(false);}} style={{flex:1,background:`linear-gradient(135deg,${T.gA},${T.gB})`}}>✓ Sauvegarder</button>
                <button className="btn btn-s tap" onClick={()=>setProfOpen(false)} style={{flex:"0 0 90px"}}>Annuler</button>
              </div>
              <button onClick={resetApp} style={{width:"100%",background:"#fef2f2",color:"#ef4444",border:"none",borderRadius:14,padding:"12px",fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:8}}>🗑 Réinitialiser l'app</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PARAMÈTRES FINANCES ── */}
      {setupOpen&&(
        <div className="overlay" onClick={()=>setSetupOpen(false)}>
          <div className="sheet" onClick={ev=>ev.stopPropagation()}>
            <div className="handle"/>
            <div style={{padding:"20px 20px 0"}}>
              <div style={{fontWeight:800,fontSize:18,marginBottom:4}}>⚙️ Mes finances fixes</div>
              <div style={{fontSize:12,color:"#94a3b8",marginBottom:20}}>Mis à jour automatiquement chaque mois</div>

              {/* Salaire */}
              <div style={{background:`linear-gradient(135deg,${T.gA}12,${T.gB}08)`,border:`1.5px solid ${T.main}25`,borderRadius:18,padding:"16px",marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{width:32,height:32,borderRadius:10,background:`linear-gradient(135deg,${T.gA},${T.gB})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>💼</div>
                  <span style={{fontWeight:700,fontSize:14,color:"#1a1a2e"}}>Salaire mensuel net</span>
                </div>
                <input className="inp" type="number" placeholder="ex: 50000" value={profile?.salary||""}
                  onChange={e=>setProfile(p=>({...p,salary:parseFloat(e.target.value)||0}))}
                  style={{background:"#fff",border:`1.5px solid ${T.main}30`}}/>
              </div>

              {/* Charges fixes détaillées */}
              <div style={{background:"#fef2f2",border:"1.5px solid #fecdd3",borderRadius:18,padding:"16px",marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#ef4444,#f97316)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🏠</div>
                    <span style={{fontWeight:700,fontSize:14,color:"#1a1a2e"}}>Charges fixes</span>
                  </div>
                  <span style={{fontWeight:800,fontSize:14,color:"#ef4444"}}>
                    {Rs((profile?.chargesList||[]).reduce((s,c)=>s+c.amount,0))}
                  </span>
                </div>

                {/* Liste des charges */}
                {(profile?.chargesList||[]).map((charge,i)=>(
                  <div key={charge.id} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                    <input value={charge.name} onChange={e=>setProfile(p=>({...p,chargesList:p.chargesList.map((c,j)=>j===i?{...c,name:e.target.value}:c)}))}
                      placeholder="ex: Loyer, CEB…"
                      style={{flex:1,background:"#fff",border:"1.5px solid #fecdd3",borderRadius:12,padding:"9px 12px",fontSize:13,fontFamily:"'Sora',sans-serif",outline:"none"}}/>
                    <input type="number" value={charge.amount||""} onChange={e=>setProfile(p=>({...p,chargesList:p.chargesList.map((c,j)=>j===i?{...c,amount:parseFloat(e.target.value)||0}:c)}))}
                      placeholder="Rs"
                      style={{width:90,background:"#fff",border:"1.5px solid #fecdd3",borderRadius:12,padding:"9px 10px",fontSize:13,fontFamily:"'Sora',sans-serif",outline:"none"}}/>
                    <button onClick={()=>setProfile(p=>({...p,chargesList:p.chargesList.filter((_,j)=>j!==i)}))}
                      style={{width:32,height:32,borderRadius:10,background:"#fee2e2",color:"#ef4444",border:"none",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
                  </div>
                ))}

                <button onClick={()=>setProfile(p=>({...p,chargesList:[...(p.chargesList||[]),{id:Date.now(),name:"",amount:0}]}))}
                  style={{width:"100%",background:"#fff",border:"1.5px dashed #fca5a5",borderRadius:12,padding:"10px",fontSize:12,fontWeight:700,color:"#ef4444",cursor:"pointer",marginTop:4}}>
                  + Ajouter une charge
                </button>

                {/* Suggestions rapides */}
                <div style={{marginTop:10}}>
                  <div style={{fontSize:10,color:"#94a3b8",fontWeight:600,marginBottom:6}}>SUGGESTIONS</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {["Loyer","CEB","CWA","Internet","Téléphone","Assurance","Mutuelle","Crédit auto"].map(s=>(
                      <button key={s} onClick={()=>setProfile(p=>({...p,chargesList:[...(p.chargesList||[]),{id:Date.now(),name:s,amount:0}]}))}
                        style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:"#fff",border:"1px solid #fca5a5",color:"#ef4444",cursor:"pointer"}}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Épargne */}
              <div style={{background:"#ecfdf5",border:"1.5px solid #bbf7d0",borderRadius:18,padding:"16px",marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#10b981,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🏦</div>
                  <span style={{fontWeight:700,fontSize:14,color:"#1a1a2e"}}>Épargne mensuelle</span>
                </div>
                <input className="inp" type="number" placeholder="ex: 5000" value={profile?.savings||""}
                  onChange={e=>setProfile(p=>({...p,savings:parseFloat(e.target.value)||0}))}
                  style={{background:"#fff",border:"1.5px solid #bbf7d0"}}/>
                <div style={{fontSize:11,color:"#059669",marginTop:6}}>💡 Rs 1 000/mois = Rs 12 000 après un an</div>
              </div>

              {/* Récap */}
              {profile?.salary>0&&(
                <div style={{background:`linear-gradient(135deg,${T.gA},${T.gB})`,borderRadius:16,padding:"14px 16px",marginBottom:16,color:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,color:"rgba(255,255,255,.7)"}}>Disponible après tout</span>
                  <span style={{fontWeight:900,fontSize:18}}>
                    {Rs(Math.max((profile.salary||0)-((profile.chargesList||[]).reduce((s,c)=>s+c.amount,0))-(profile.savings||0),0))}
                  </span>
                </div>
              )}

              <button onClick={()=>{
                const totalCharges=(profile?.chargesList||[]).reduce((s,c)=>s+c.amount,0);
                setProfile(p=>({...p,charges:totalCharges}));
                setSetupOpen(false);
              }} style={{width:"100%",background:`linear-gradient(135deg,${T.gA},${T.gB})`,color:"#fff",borderRadius:16,padding:"15px",fontWeight:700,fontSize:15,border:"none",cursor:"pointer",boxShadow:`0 6px 20px ${T.main}40`,marginBottom:8}}>
                ✓ Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAGE MES CATÉGORIES ── */}
      {catOpen&&(
        <CatPage T={T} customCats={customCats} setCustomCats={setCustomCats} hiddenCats={hiddenCats} setHiddenCats={setHiddenCats} onClose={()=>setCatOpen(false)}/>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CAT PAGE — Gérer les catégories
// ═════════════════════════════════════════════════════════════════════════════
function CatPage({T, customCats, setCustomCats, hiddenCats, setHiddenCats, onClose}) {
  const [editing,   setEditing]   = useState(null); // {id, e, l, c, isCustom}
  const [newModal,  setNewModal]  = useState(false);
  const [newCat,    setNewCat]    = useState({e:"📝",l:"",c:"#94a3b8",bucket:"spending"});
  const [overrides, setOverrides] = useState(()=>{try{return JSON.parse(localStorage.getItem("mb_cat_ov")||"{}");}catch{return {};}});

  const EMOJIS = ["🛒","🍽️","⛽","🏃","💊","💇","👗","📚","🧒","🐾","🎮","✈️","🎁","🏡","📱","💰","💻","🔑","📝","🎾","⚽","🏀","🏊","🚴","🥊","🎵","🎨","🍷","🎂","🧘","🌴","🚗","🐶","🔧","⚡","🏆","💎","🌺","🎯","🎻","🍕","☕","🛍️","🎬","🎲"];
  const COLORS = ["#f97316","#ef4444","#6366f1","#10b981","#ec4899","#a855f7","#8b5cf6","#0ea5e9","#f59e0b","#14b8a6","#84cc16","#78716c","#3b82f6","#f43f5e","#475569"];

  const saveOv = (o) => { setOverrides(o); try{localStorage.setItem("mb_cat_ov",JSON.stringify(o));}catch{} };

  const getDisplay = (c) => overrides[c.id] ? {...c,...overrides[c.id]} : c;

  const toggleHide = (id) => {
    const h=hiddenCats.includes(id)?hiddenCats.filter(x=>x!==id):[...hiddenCats,id];
    setHiddenCats(h);
  };

  const saveEdit = () => {
    if(!editing) return;
    if(editing.isCustom) {
      setCustomCats(p=>p.map(c=>c.id===editing.id?{...c,e:editing.e,l:editing.l,c:editing.c}:c));
    } else {
      saveOv({...overrides,[editing.id]:{e:editing.e,l:editing.l,c:editing.c}});
    }
    setEditing(null);
  };

  const saveNew = () => {
    if(!newCat.l.trim()) return;
    setCustomCats(p=>[...p,{id:`custom_${Date.now()}`,e:newCat.e,l:newCat.l.trim(),c:newCat.c,bucket:newCat.bucket}]);
    setNewModal(false);
    setNewCat({e:"📝",l:"",c:"#94a3b8",bucket:"spending"});
  };

  return (
    <div style={{position:"fixed",inset:0,background:"#f4f3f8",zIndex:300,overflowY:"auto",fontFamily:"'Sora',sans-serif"}}>
      {/* Header */}
      <div style={{background:"#fff",padding:"12px 18px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,borderBottom:"1px solid #f0eef8",zIndex:10}}>
        <button onClick={onClose} style={{width:36,height:36,borderRadius:12,background:"#f4f3f8",border:"none",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>←</button>
        <div style={{fontWeight:800,fontSize:16}}>🗂️ Mes catégories</div>
        <div style={{flex:1}}/>
        <button onClick={()=>setNewModal(true)} style={{background:`linear-gradient(135deg,${T.gA},${T.gB})`,color:"#fff",border:"none",borderRadius:12,padding:"8px 16px",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Créer</button>
      </div>

      <div style={{padding:"16px 16px 80px"}}>
        <div style={{fontSize:12,color:"#94a3b8",marginBottom:16,lineHeight:1.6}}>
          Touchez une catégorie pour la <strong>modifier</strong>. Utilisez le toggle pour l'activer/désactiver.
        </div>

        {["spending","extra"].map(bucket=>(
          <div key={bucket} style={{marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:"1px",marginBottom:10}}>
              {bucket==="spending"?"💸 DÉPENSES":"💰 REVENUS EN PLUS"}
            </div>
            <div style={{background:"#fff",borderRadius:20,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,.06)"}}>
              {[...CATS.filter(c=>c.bucket===bucket),...customCats.filter(c=>c.bucket===bucket)].map((cat,i,arr)=>{
                const d = getDisplay(cat);
                const isOn = !hiddenCats.includes(cat.id);
                const isLast = i===arr.length-1;
                return (
                  <div key={cat.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:isLast?"none":"1px solid #f4f3f8",background:isOn?"#fff":"#faf9fc"}}>
                    {/* Tap zone — opens editor */}
                    <button onClick={()=>setEditing({...d,id:cat.id,isCustom:cat.id.startsWith("custom_")})}
                      style={{display:"flex",alignItems:"center",gap:12,flex:1,background:"none",border:"none",cursor:"pointer",padding:0,textAlign:"left"}}>
                      <div style={{width:40,height:40,borderRadius:13,background:d.c+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,opacity:isOn?1:.35,flexShrink:0}}>
                        {d.e}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:14,color:isOn?"#1a1a2e":"#94a3b8"}}>{d.l}</div>
                        <div style={{fontSize:11,color:"#cbd5e1",marginTop:1}}>Toucher pour modifier</div>
                      </div>
                    </button>
                    {/* Delete for custom */}
                    {cat.id.startsWith("custom_")&&(
                      <button onClick={()=>setCustomCats(p=>p.filter(x=>x.id!==cat.id))}
                        style={{width:32,height:32,borderRadius:10,background:"#fef2f2",color:"#ef4444",border:"none",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>🗑</button>
                    )}
                    {/* Toggle */}
                    <button onClick={()=>toggleHide(cat.id)}
                      style={{width:50,height:28,borderRadius:20,background:isOn?T.main:"#e8e6f0",border:"none",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
                      <div style={{position:"absolute",top:4,left:isOn?26:4,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── EDITOR MODAL ── */}
      {editing&&(
        <div style={{position:"fixed",inset:0,background:"rgba(10,8,20,.6)",backdropFilter:"blur(12px)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setEditing(null)}>
          <div style={{background:"#fff",borderRadius:"28px 28px 0 0",width:"100%",maxWidth:520,maxHeight:"88vh",overflowY:"auto",paddingBottom:40}} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:"#e2e0ea",borderRadius:2,margin:"14px auto 0"}}/>
            <div style={{padding:"20px 20px 0"}}>
              {/* Preview */}
              <div style={{display:"flex",alignItems:"center",gap:14,background:editing.c+"12",borderRadius:18,padding:"14px 16px",marginBottom:18,border:`1.5px solid ${editing.c}25`}}>
                <div style={{width:52,height:52,borderRadius:16,background:editing.c+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{editing.e}</div>
                <div style={{fontWeight:800,fontSize:18,color:"#1a1a2e"}}>{editing.l||"…"}</div>
              </div>

              {/* Name */}
              <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:"1px",marginBottom:8}}>NOM</div>
              <input value={editing.l} onChange={e=>setEditing(p=>({...p,l:e.target.value}))}
                style={{width:"100%",background:"#f4f3f8",border:`2px solid ${editing.c}40`,borderRadius:14,padding:"13px 16px",fontSize:15,fontFamily:"'Sora',sans-serif",outline:"none",marginBottom:16}}/>

              {/* Emoji */}
              <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:"1px",marginBottom:8}}>ICÔNE</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:7,marginBottom:16,maxHeight:140,overflowY:"auto"}}>
                {EMOJIS.map(em=>(
                  <button key={em} onClick={()=>setEditing(p=>({...p,e:em}))}
                    style={{height:42,borderRadius:12,fontSize:20,background:editing.e===em?editing.c+"20":"#f4f3f8",border:`2px solid ${editing.e===em?editing.c:"transparent"}`,cursor:"pointer",transition:"all .12s"}}>
                    {em}
                  </button>
                ))}
              </div>

              {/* Color */}
              <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:"1px",marginBottom:10}}>COULEUR</div>
              <div style={{display:"flex",gap:9,flexWrap:"wrap",marginBottom:20}}>
                {COLORS.map(col=>(
                  <button key={col} onClick={()=>setEditing(p=>({...p,c:col}))}
                    style={{width:34,height:34,borderRadius:"50%",background:col,border:`3px solid ${editing.c===col?"#1a1a2e":"transparent"}`,transform:editing.c===col?"scale(1.18)":"scale(1)",transition:"all .15s",cursor:"pointer"}}/>
                ))}
              </div>

              {/* Actions */}
              <div style={{display:"flex",gap:10,paddingBottom:10}}>
                <button onClick={saveEdit}
                  style={{flex:1,background:`linear-gradient(135deg,${T.gA},${T.gB})`,color:"#fff",borderRadius:16,padding:"15px",fontWeight:700,fontSize:15,border:"none",cursor:"pointer",boxShadow:`0 6px 20px ${T.main}40`}}>
                  ✓ Enregistrer
                </button>
                {!editing.isCustom&&overrides[editing.id]&&(
                  <button onClick={()=>{const o={...overrides};delete o[editing.id];saveOv(o);setEditing(null);}}
                    style={{background:"#fff7ed",color:"#f97316",borderRadius:16,padding:"15px 14px",fontWeight:700,fontSize:13,border:"none",cursor:"pointer"}}>
                    ↺ Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW CAT MODAL ── */}
      {newModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(10,8,20,.6)",backdropFilter:"blur(12px)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setNewModal(false)}>
          <div style={{background:"#fff",borderRadius:"28px 28px 0 0",width:"100%",maxWidth:520,maxHeight:"88vh",overflowY:"auto",paddingBottom:40}} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:"#e2e0ea",borderRadius:2,margin:"14px auto 0"}}/>
            <div style={{padding:"20px 20px 0"}}>
              <div style={{fontWeight:800,fontSize:18,marginBottom:16}}>✚ Nouvelle catégorie</div>

              {/* Type */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
                {[{v:"spending",l:"💸 Dépense"},{v:"extra",l:"💰 Revenu"}].map(({v,l})=>(
                  <button key={v} onClick={()=>setNewCat(p=>({...p,bucket:v}))}
                    style={{padding:"12px",borderRadius:14,fontWeight:700,fontSize:13,background:newCat.bucket===v?T.light:"#f4f3f8",color:newCat.bucket===v?T.text:"#64748b",border:`2px solid ${newCat.bucket===v?T.main:"transparent"}`,cursor:"pointer"}}>
                    {l}
                  </button>
                ))}
              </div>

              {/* Preview */}
              <div style={{display:"flex",alignItems:"center",gap:12,background:newCat.c+"12",borderRadius:16,padding:"12px 16px",marginBottom:16}}>
                <div style={{width:44,height:44,borderRadius:14,background:newCat.c+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{newCat.e}</div>
                <div style={{fontWeight:800,fontSize:16,color:"#1a1a2e"}}>{newCat.l||"Nom…"}</div>
              </div>

              <input value={newCat.l} onChange={e=>setNewCat(p=>({...p,l:e.target.value}))}
                placeholder="Nom de la catégorie"
                style={{width:"100%",background:"#f4f3f8",border:"2px solid #f0eef8",borderRadius:14,padding:"13px 16px",fontSize:15,fontFamily:"'Sora',sans-serif",outline:"none",marginBottom:14}}/>

              <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:7,marginBottom:14,maxHeight:130,overflowY:"auto"}}>
                {EMOJIS.map(em=>(
                  <button key={em} onClick={()=>setNewCat(p=>({...p,e:em}))}
                    style={{height:40,borderRadius:11,fontSize:19,background:newCat.e===em?newCat.c+"20":"#f4f3f8",border:`2px solid ${newCat.e===em?newCat.c:"transparent"}`,cursor:"pointer"}}>
                    {em}
                  </button>
                ))}
              </div>

              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:18}}>
                {COLORS.map(col=>(
                  <button key={col} onClick={()=>setNewCat(p=>({...p,c:col}))}
                    style={{width:32,height:32,borderRadius:"50%",background:col,border:`3px solid ${newCat.c===col?"#1a1a2e":"transparent"}`,transform:newCat.c===col?"scale(1.18)":"scale(1)",transition:"all .15s",cursor:"pointer"}}/>
                ))}
              </div>

              <div style={{display:"flex",gap:10,paddingBottom:8}}>
                <button onClick={saveNew} disabled={!newCat.l.trim()}
                  style={{flex:1,background:newCat.l.trim()?`linear-gradient(135deg,${T.gA},${T.gB})`:"#e8e6f0",color:newCat.l.trim()?"#fff":"#94a3b8",borderRadius:16,padding:"15px",fontWeight:700,fontSize:15,border:"none",cursor:"pointer",boxShadow:newCat.l.trim()?`0 6px 20px ${T.main}40`:"none"}}>
                  ✓ Créer
                </button>
                <button onClick={()=>setNewModal(false)} style={{flex:"0 0 100px",background:"#f4f3f8",color:"#64748b",borderRadius:16,padding:"15px",fontWeight:700,fontSize:14,border:"none",cursor:"pointer"}}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ADD TAB — Saisir
// ═════════════════════════════════════════════════════════════════════════════
// ─── CatTile — tuile avec appui long ─────────────────────────────────────────
function CatTile({c, T, active, onSelect, onLongPress, compact}) {
  const timer = useRef(null);
  const fired = useRef(false);

  const start = () => {
    fired.current = false;
    timer.current = setTimeout(() => {
      fired.current = true;
      if(navigator.vibrate) navigator.vibrate(40);
      onLongPress();
    }, 500);
  };
  const cancel = () => clearTimeout(timer.current);

  return (
    <button
      className={`cat-btn${active?" active":""}`}
      style={{width:"100%",padding:compact?"8px 2px":"12px 4px",borderRadius:compact?14:18,gap:compact?3:6}}
      onMouseDown={start} onMouseUp={cancel} onMouseLeave={cancel}
      onTouchStart={start} onTouchEnd={cancel} onTouchMove={cancel}
      onClick={()=>{ if(!fired.current) onSelect(); }}>
      <span style={{fontSize:compact?20:24,lineHeight:1}}>{c.e}</span>
      <span style={{fontSize:compact?8:9,fontWeight:700,color:active?T.text:"#64748b",textAlign:"center",lineHeight:1.2}}>{c.l}</span>
    </button>
  );
}

function AddTab({T, mE, entries, onAdd, visCats, customCats, setCustomCats, hiddenCats, setHiddenCats}) {
  const [cat,        setCat]       = useState(null);
  const [amt,        setAmt]       = useState("");
  const [done,       setDone]      = useState(false);
  const [editingCat, setEditingCat]= useState(null);
  const [overrides,  setOverrides] = useState(()=>{try{return JSON.parse(localStorage.getItem("mb_cat_ov")||"{}");}catch{return {};}});

  const EMOJIS = ["🛒","🍽️","⛽","🏃","💊","💇","👗","📚","🧒","🐾","🎮","✈️","🎁","🏡","📱","💰","💻","🔑","📝","🎾","⚽","🏀","🏊","🚴","🥊","🎵","🎨","🍷","🎂","🧘","🌴","🚗","🐶","🔧","⚡","🏆","💎","🌺","🎯","🎻","🍕","☕","🛍️","🎬","🎲"];
  const COLORS = ["#f97316","#ef4444","#6366f1","#10b981","#ec4899","#a855f7","#8b5cf6","#0ea5e9","#f59e0b","#14b8a6","#84cc16","#3b82f6","#f43f5e","#78716c","#475569"];
  const saveOv = (o)=>{setOverrides(o);try{localStorage.setItem("mb_cat_ov",JSON.stringify(o));}catch{}};
  const getD   = (c)=>overrides[c.id]?{...c,...overrides[c.id]}:c;

  const saveEdit = ()=>{
    if(!editingCat) return;
    if(editingCat.id.startsWith("custom_")) setCustomCats(p=>p.map(c=>c.id===editingCat.id?{...c,e:editingCat.e,l:editingCat.l,c:editingCat.c}:c));
    else saveOv({...overrides,[editingCat.id]:{e:editingCat.e,l:editingCat.l,c:editingCat.c}});
    setEditingCat(null);
  };

  const press = (v) => {
    if(v==="⌫"){setAmt(p=>p.slice(0,-1));return;}
    if(amt.length>=7) return;
    if(v==="."&&amt.includes(".")) return;
    setAmt(p=>p+v);
  };
  const confirm = () => {
    const n=parseFloat(amt); if(!cat||isNaN(n)||n<=0) return;
    onAdd({bucket:cat.bucket,catId:cat.id,label:cat.l,amount:n});
    setDone(true);
    setTimeout(()=>{setDone(false);setAmt("");setCat(null);},800);
  };

  const KP = [["1","2","3"],["4","5","6"],["7","8","9"],[".", "0","⌫"]];
  const spendCats = visCats.filter(c=>c.bucket==="spending").map(getD);
  const extraCats = visCats.filter(c=>c.bucket==="extra").map(getD);

  return (
    <div className="page">

      {/* ── DÉPENSES ── */}
      <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",letterSpacing:"1px",marginBottom:6}}>DÉPENSES</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:10}}>
        {spendCats.map(c=>(
          <button key={c.id}
            onClick={()=>{setCat(c);setAmt("");setDone(false);}}
            onContextMenu={e=>{e.preventDefault();setEditingCat({...c});}}
            onTouchStart={(e)=>{
              const t=setTimeout(()=>{setEditingCat({...c});},500);
              e.currentTarget._t=t;
            }}
            onTouchEnd={e=>clearTimeout(e.currentTarget._t)}
            onTouchMove={e=>clearTimeout(e.currentTarget._t)}
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 2px",borderRadius:14,background:cat?.id===c.id?c.c+"20":"#f8f7fc",border:`2px solid ${cat?.id===c.id?c.c:"transparent"}`,cursor:"pointer",transition:"all .15s"}}>
            <span style={{fontSize:22}}>{c.e}</span>
            <span style={{fontSize:9,fontWeight:700,color:cat?.id===c.id?c.c:"#64748b",textAlign:"center",lineHeight:1.2}}>{c.l}</span>
          </button>
        ))}
        <button onClick={()=>setCustomCats(p=>[...p,{id:`custom_${Date.now()}`,e:"📝",l:"Nouveau",c:T.main,bucket:"spending"}])}
          style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 2px",borderRadius:14,background:"#f4f3f8",border:"2px dashed #d1cde8",cursor:"pointer"}}>
          <span style={{fontSize:20,color:T.main}}>✚</span>
          <span style={{fontSize:9,fontWeight:700,color:T.main}}>Créer</span>
        </button>
      </div>

      {/* ── REVENUS ── */}
      {extraCats.length>0&&(
        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",letterSpacing:"1px",marginBottom:6}}>REVENUS</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
            {extraCats.map(c=>(
              <button key={c.id}
                onClick={()=>{setCat(c);setAmt("");setDone(false);}}
                onTouchStart={(e)=>{const t=setTimeout(()=>setEditingCat({...c}),500);e.currentTarget._t=t;}}
                onTouchEnd={e=>clearTimeout(e.currentTarget._t)}
                onTouchMove={e=>clearTimeout(e.currentTarget._t)}
                style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 2px",borderRadius:14,background:cat?.id===c.id?c.c+"20":"#f8f7fc",border:`2px solid ${cat?.id===c.id?c.c:"transparent"}`,cursor:"pointer",transition:"all .15s"}}>
                <span style={{fontSize:22}}>{c.e}</span>
                <span style={{fontSize:9,fontWeight:700,color:cat?.id===c.id?c.c:"#64748b",textAlign:"center",lineHeight:1.2}}>{c.l}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── MONTANT SÉLECTIONNÉ ── */}
      <div style={{background:cat?cat.c+"10":"#f8f7fc",borderRadius:16,padding:"10px 16px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",border:`1.5px solid ${cat?cat.c+"30":"#f0eef8"}`}}>
        {cat?(
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:11,background:cat.c+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{cat.e}</div>
            <div style={{fontWeight:700,fontSize:13,color:"#1a1a2e"}}>{cat.l}</div>
          </div>
        ):(
          <div style={{fontSize:12,color:"#94a3b8"}}>👆 Choisissez une catégorie</div>
        )}
        <div style={{fontWeight:900,fontSize:30,color:cat?cat.c:"#d1cde8",letterSpacing:"-1px"}}>
          {done?"✓":amt||"0"}<span style={{fontSize:11,color:"#94a3b8",marginLeft:4}}>Rs</span>
        </div>
      </div>

      {/* ── CLAVIER ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:8}}>
        {KP.flat().map(v=>(
          <button key={v} onClick={()=>press(v)}
            style={{height:56,borderRadius:16,fontSize:22,fontWeight:700,background:v==="⌫"?"#fee2e2":"#fff",color:v==="⌫"?"#ef4444":"#1a1a2e",border:`2px solid ${v==="⌫"?"#fecdd3":"#ece9f5"}`,fontFamily:"Sora,sans-serif",cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,.05)"}}>
            {v}
          </button>
        ))}
      </div>

      {/* ── BOUTON ENREGISTRER ── */}
      <button onClick={confirm} disabled={!cat||!amt||parseFloat(amt)<=0}
        style={{width:"100%",height:54,background:cat&&parseFloat(amt)>0?`linear-gradient(135deg,${T.gA},${T.gB})`:"#e8e6f0",color:cat&&parseFloat(amt)>0?"#fff":"#94a3b8",borderRadius:16,fontWeight:700,fontSize:15,border:"none",fontFamily:"Sora,sans-serif",cursor:cat&&parseFloat(amt)>0?"pointer":"default",boxShadow:cat&&parseFloat(amt)>0?`0 6px 20px ${T.main}40`:"none",transition:"all .2s"}}>
        {done?"✓ Enregistré !":cat&&amt?`Enregistrer ${Rs(parseFloat(amt))}`:cat?"Entrez un montant ↑":"Choisissez une catégorie ↑"}
      </button>

      <div style={{fontSize:9,color:"#d1cde8",textAlign:"center",marginTop:6}}>Appui long sur une catégorie pour modifier</div>

      {/* ── MODAL ÉDITEUR ── */}
      {editingCat&&(
        <div style={{position:"fixed",inset:0,background:"rgba(10,8,20,.55)",backdropFilter:"blur(10px)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setEditingCat(null)}>
          <div style={{background:"#fff",borderRadius:"28px 28px 0 0",width:"100%",maxWidth:520,maxHeight:"88vh",overflowY:"auto",paddingBottom:40}} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:"#e2e0ea",borderRadius:2,margin:"14px auto 0"}}/>
            <div style={{padding:"20px 20px 0"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,background:editingCat.c+"14",borderRadius:16,padding:"12px 16px",marginBottom:14}}>
                <div style={{width:44,height:44,borderRadius:13,background:editingCat.c+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{editingCat.e}</div>
                <div style={{fontWeight:800,fontSize:16}}>{editingCat.l}</div>
              </div>
              <input value={editingCat.l} onChange={e=>setEditingCat(p=>({...p,l:e.target.value}))}
                style={{width:"100%",background:"#f4f3f8",border:`2px solid ${editingCat.c}40`,borderRadius:14,padding:"12px 16px",fontSize:15,fontFamily:"Sora,sans-serif",outline:"none",marginBottom:12}}/>
              <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",marginBottom:7}}>ICÔNE</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:5,marginBottom:12,maxHeight:110,overflowY:"auto"}}>
                {EMOJIS.map(em=>(
                  <button key={em} onClick={()=>setEditingCat(p=>({...p,e:em}))}
                    style={{height:36,borderRadius:9,fontSize:17,background:editingCat.e===em?editingCat.c+"20":"#f4f3f8",border:`2px solid ${editingCat.e===em?editingCat.c:"transparent"}`,cursor:"pointer"}}>
                    {em}
                  </button>
                ))}
              </div>
              <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",marginBottom:7}}>COULEUR</div>
              <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:16}}>
                {COLORS.map(col=>(
                  <button key={col} onClick={()=>setEditingCat(p=>({...p,c:col}))}
                    style={{width:28,height:28,borderRadius:"50%",background:col,border:`3px solid ${editingCat.c===col?"#1a1a2e":"transparent"}`,transform:editingCat.c===col?"scale(1.2)":"scale(1)",transition:"all .15s",cursor:"pointer"}}/>
                ))}
              </div>
              <div style={{display:"flex",gap:8,paddingBottom:8}}>
                <button onClick={saveEdit} style={{flex:1,background:`linear-gradient(135deg,${T.gA},${T.gB})`,color:"#fff",borderRadius:14,padding:"14px",fontWeight:700,fontSize:14,border:"none",cursor:"pointer"}}>✓ Enregistrer</button>
                <button onClick={()=>{setHiddenCats(p=>[...p,editingCat.id]);setEditingCat(null);}} style={{background:"#fff7ed",color:"#f97316",borderRadius:14,padding:"14px 10px",fontWeight:700,fontSize:12,border:"none",cursor:"pointer"}}>🙈</button>
                {editingCat.id.startsWith("custom_")&&(
                  <button onClick={()=>{setCustomCats(p=>p.filter(c=>c.id!==editingCat.id));setEditingCat(null);}} style={{background:"#fef2f2",color:"#ef4444",borderRadius:14,padding:"14px 10px",fontWeight:700,fontSize:14,border:"none",cursor:"pointer"}}>🗑</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
