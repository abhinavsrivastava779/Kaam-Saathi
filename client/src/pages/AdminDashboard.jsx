import React, { useEffect, useState } from 'react';
import { Users, Shield, Trash2, Search, ToggleLeft, ToggleRight, Plus, LogOut, MapPin, Save, X, FileCheck, Clock3 } from 'lucide-react';
import { getAdminStats, adminCreateWorker, adminDeleteWorker, adminUpdateAvailability, adminLogout, isAdminLoggedIn, getAdminKyc, updateAdminKyc, getAdminUsers, getAdminUserDetails, getAdminKycSubmissions } from '../api/admin';
import { getWorkers } from '../api/worker';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { getSkillInfo, formatCurrency, SKILLS_LIST } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

const blankWorker = () => ({
  name: '', phone: '', skill: 'mistri', dailyRate: 700, area: '', city: '', state: 'उत्तर प्रदेश',
  lat: '', long: '', availability: true, registrationSource: 'app'
});

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [rows, setRows] = useState([blankWorker()]);
  const [kycWorker,setKycWorker]=useState(null);
  const [users, setUsers] = useState({ workers: [], employers: [] });
  const [userTab, setUserTab] = useState('workers');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [kycSubmissions, setKycSubmissions] = useState([]);
  const [kycCounts, setKycCounts] = useState({ pending: 0, verified: 0, rejected: 0 });
  const [showKycSubmissions, setShowKycSubmissions] = useState(false);
  const [kycFilter, setKycFilter] = useState('all');

  const loadData = async () => {
    setLoading(true); setError('');
    try {
      const [statsRes, workersRes] = await Promise.all([
        getAdminStats(), getWorkers({ search: searchTerm })
      ]);
      setStats(statsRes.stats); setWorkers(workersRes.workers || []);
      const [usersRes, kycRes] = await Promise.all([getAdminUsers(), getAdminKycSubmissions()]);
      setUsers({ workers: usersRes.workers || [], employers: usersRes.employers || [] });
      setKycSubmissions(kycRes.submissions || []);
      setKycCounts(kycRes.counts || { pending: 0, verified: 0, rejected: 0 });
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        adminLogout(); navigate('/admin/login', { replace: true }); return;
      }
      setError('एडमिन डेटा लोड करने में समस्या आई।');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (!isAdminLoggedIn()) navigate('/admin/login', { replace: true }); else loadData(); }, [searchTerm]);

  const updateRow = (i, key, value) => setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [key]: value } : r));
  const addRow = () => setRows(prev => [...prev, blankWorker()]);
  const removeRow = (i) => setRows(prev => prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i));

  const saveWorkers = async () => {
    const valid = rows.filter(r => r.name.trim() && r.phone.trim() && r.area.trim());
    if (!valid.length) { setError('कम से कम एक मजदूर का नाम, मोबाइल और इलाका भरें।'); return; }
    setSaving(true); setError('');
    try {
      for (const r of valid) {
        await adminCreateWorker({
          name: r.name.trim(), phone: r.phone.trim(), skill: r.skill,
          dailyRate: Number(r.dailyRate) || 700, area: r.area.trim(),
          city: r.city.trim(), state: r.state.trim(),
          location: { lat: Number(r.lat) || 27.15, long: Number(r.long) || 78.39 },
          availability: Boolean(r.availability), registrationSource: r.registrationSource || 'app'
        });
      }
      setRows([blankWorker()]); setShowAdd(false); await loadData();
    } catch (err) { setError(err.response?.data?.message || 'मजदूर जोड़ने में समस्या आई।'); }
    finally { setSaving(false); }
  };

  const toggle = async (id, val) => { try { await adminUpdateAvailability(id, !val); loadData(); } catch { setError('स्थिति बदलने में समस्या आई।'); } };
  const remove = async (id) => {
    if (!window.confirm('क्या आप वाकई यह प्रोफाइल हटाना चाहते हैं?')) return;
    try { await adminDeleteWorker(id); loadData(); } catch { setError('हटाने में समस्या आई।'); }
  };
  const openKyc=async(id)=>{try{const r=await getAdminKyc(id);setKycWorker(r.worker)}catch{setError('KYC load नहीं हुई।')}}; const verifyKyc=async(status)=>{if(!kycWorker)return;let reason='';if(status==='rejected'){reason=window.prompt('Reject reason','Documents clear नहीं हैं।');if(reason===null)return}try{const r=await updateAdminKyc(kycWorker._id,status,reason);setKycWorker(r.worker);loadData()}catch{setError('KYC update नहीं हुई।')}};
  const openUser = async (type, id) => {
    setUserLoading(true);
    try {
      const r = await getAdminUserDetails(type, id);
      setSelectedUser({ ...r.user, __type: type });
    } catch {
      setError('User details load नहीं हुई।');
    } finally { setUserLoading(false); }
  };
  const logout = () => { adminLogout(); navigate('/admin/login', { replace: true }); };

  if (loading && !stats) return <Loading message="एडमिन डैशबोर्ड लोड हो रहा है..." />;

  return (
    <div className="max-w-4xl mx-auto py-2 space-y-5">
      <div className="rounded-3xl p-5 border border-blue-500/30 bg-gradient-to-br from-slate-900 to-blue-950/40 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-blue-400 font-black">KAAM SAATHI ADMIN</p>
            <h2 className="text-2xl font-black text-white flex items-center gap-2"><Shield className="w-6 h-6 text-blue-400"/>Control Center</h2>
            <p className="text-xs text-slate-400 mt-1">मजदूर, लोकेशन और प्लेटफॉर्म analytics प्रबंधित करें</p>
          </div>
          <button onClick={logout} className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300" title="Logout"><LogOut className="w-5 h-5"/></button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {stats && <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ['कुल मजदूर', stats.totalWorkers, 'text-white'],
          ['आज उपलब्ध', stats.availableWorkers, 'text-emerald-400'],
          ['अनुपलब्ध', stats.unavailableWorkers, 'text-rose-400'],
          ['कुल प्रोफाइल', stats.totalWorkers, 'text-blue-400']
        ].map(([label,value,color]) => <div key={label} className="glass-card rounded-2xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 font-bold">{label}</p><p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
        </div>)}
      </div>}

      {stats && <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-700">
          <h3 className="font-black text-white mb-3">काम के हिसाब से</h3>
          <div className="flex flex-wrap gap-2">{stats.skillStats?.map(s => <span key={s._id} className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-200">{getSkillInfo(s._id).emoji} {getSkillInfo(s._id).title}: {s.count}</span>)}</div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-slate-700">
          <h3 className="font-black text-white mb-3">इलाके/शहर</h3>
          <div className="flex flex-wrap gap-2">{stats.cityStats?.length ? stats.cityStats.map(s => <span key={s._id} className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-200">📍 {s._id}: {s.count}</span>) : <span className="text-xs text-slate-500">अभी city data नहीं है</span>}</div>
        </div>
      </div>}

      <div className="glass-card rounded-2xl p-4 border border-amber-500/30 space-y-4">
        <button type="button" onClick={()=>setShowKycSubmissions(v=>!v)} className="w-full flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-amber-400"/>
            </div>
            <div>
              <h3 className="font-black text-white text-lg">📋 KYC Submissions</h3>
              <p className="text-xs text-slate-400">जिन workers ने KYC submit की है, उनकी अलग सूची</p>
            </div>
          </div>
          <span className="px-3 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-sm">{kycCounts.pending} Pending</span>
        </button>
        {showKycSubmissions && <>
          <div className="grid grid-cols-4 gap-2">
            {[['all','सभी',kycSubmissions.length],['pending','Pending',kycCounts.pending],['verified','Verified',kycCounts.verified],['rejected','Rejected',kycCounts.rejected]].map(([key,label,count])=><button key={key} onClick={()=>setKycFilter(key)} className={`py-2 rounded-xl text-[11px] font-black ${kycFilter===key?'bg-amber-500 text-slate-950':'bg-slate-800 text-slate-400'}`}>{label} ({count})</button>)}
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {kycSubmissions.filter(w=>kycFilter==='all'||(w.kyc?.status||'pending')===kycFilter).map(w=><div key={w._id} className="bg-slate-900 border border-slate-700 rounded-2xl p-3 flex items-center gap-3">
              <img src={w.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name||'Worker')}&size=96`} className="w-12 h-12 rounded-xl object-cover bg-slate-800" alt=""/>
              <div className="flex-1 min-w-0">
                <p className="font-black text-white truncate">{w.name || 'Unnamed Worker'}</p>
                <p className="text-xs text-slate-400">+91 {w.phone}</p>
                <p className="text-[11px] text-slate-500 mt-1"><Clock3 className="inline w-3 h-3 mr-1"/>{w.kyc?.submittedAt ? new Date(w.kyc.submittedAt).toLocaleString() : '—'}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded-lg text-[10px] font-black ${w.kyc?.status==='verified'?'bg-emerald-950 text-emerald-300':w.kyc?.status==='rejected'?'bg-rose-950 text-rose-300':'bg-amber-950 text-amber-300'}`}>{w.kyc?.status==='verified'?'✓ VERIFIED':w.kyc?.status==='rejected'?'REJECTED':'PENDING'}</span>
                <button onClick={()=>openKyc(w._id)} className="block mt-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-black">Open KYC →</button>
              </div>
            </div>)}
            {!kycSubmissions.filter(w=>kycFilter==='all'||(w.kyc?.status||'pending')===kycFilter).length && <p className="text-xs text-slate-500 text-center py-5">इस category में कोई KYC submission नहीं है।</p>}
          </div>
        </>}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500"/>
          <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="नाम, काम या इलाके से खोजें..." className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-3 text-white min-h-[48px]"/>
        </div>
        <button onClick={()=>setShowAdd(v=>!v)} className="bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl px-5 min-h-[48px] flex items-center justify-center gap-2"><Plus className="w-5 h-5"/> मजदूर जोड़ें</button>
      </div>

      {showAdd && <div className="glass-card rounded-2xl p-4 border border-blue-500/30 space-y-4">
        <div className="flex justify-between items-center"><h3 className="font-black text-white">➕ कई मजदूर एक साथ जोड़ें</h3><button onClick={()=>setShowAdd(false)}><X className="w-5 h-5 text-slate-400"/></button></div>
        <div className="space-y-3">
          {rows.map((r,i)=><div key={i} className="rounded-2xl bg-slate-900 border border-slate-700 p-3 space-y-3">
            <div className="flex justify-between"><span className="text-xs font-black text-blue-400">मजदूर #{i+1}</span>{rows.length>1&&<button onClick={()=>removeRow(i)}><X className="w-4 h-4 text-rose-400"/></button>}</div>
            <div className="grid md:grid-cols-2 gap-2">
              <input placeholder="नाम" value={r.name} onChange={e=>updateRow(i,'name',e.target.value)} className="input"/>
              <input placeholder="मोबाइल नंबर" value={r.phone} onChange={e=>updateRow(i,'phone',e.target.value)} className="input"/>
              <select value={r.skill} onChange={e=>updateRow(i,'skill',e.target.value)} className="input">{SKILLS_LIST.map(s=><option key={s.id} value={s.id}>{s.emoji} {s.title}</option>)}</select>
              <input type="number" placeholder="दिहाड़ी" value={r.dailyRate} onChange={e=>updateRow(i,'dailyRate',e.target.value)} className="input"/>
              <input placeholder="इलाका / मोहल्ला" value={r.area} onChange={e=>updateRow(i,'area',e.target.value)} className="input"/>
              <input placeholder="शहर" value={r.city} onChange={e=>updateRow(i,'city',e.target.value)} className="input"/>
              <input placeholder="राज्य" value={r.state} onChange={e=>updateRow(i,'state',e.target.value)} className="input"/>
              <input placeholder="Latitude" value={r.lat} onChange={e=>updateRow(i,'lat',e.target.value)} className="input"/>
              <input placeholder="Longitude" value={r.long} onChange={e=>updateRow(i,'long',e.target.value)} className="input"/>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300"><input type="checkbox" checked={r.availability} onChange={e=>updateRow(i,'availability',e.target.checked)} /> 🟢 आज उपलब्ध</label>
          </div>)}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={addRow} className="flex-1 bg-slate-800 border border-slate-700 text-white font-black rounded-xl min-h-[48px]">＋ और मजदूर</button>
          <button onClick={saveWorkers} disabled={saving} className="flex-1 bg-emerald-600 text-white font-black rounded-xl min-h-[48px] flex items-center justify-center gap-2"><Save className="w-4 h-4"/>{saving?'सेव हो रहा है...':'सभी सेव करें'}</button>
        </div>
      </div>}

      <div className="glass-card rounded-2xl p-4 border border-blue-500/30 space-y-4">
        <div>
          <h3 className="font-black text-white text-lg">👥 सभी Users का Complete Dashboard</h3>
          <p className="text-xs text-slate-400 mt-1">Worker और Employer की पूरी profile admin यहाँ खोल सकता है। Worker की KYC details भी केवल admin को दिखाई जाती हैं।</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setUserTab('workers')} className={`py-2.5 rounded-xl font-black text-sm ${userTab === 'workers' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Workers ({users.workers.length})</button>
          <button onClick={() => setUserTab('employers')} className={`py-2.5 rounded-xl font-black text-sm ${userTab === 'employers' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Employers ({users.employers.length})</button>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {(userTab === 'workers' ? users.workers : users.employers).map(u => (
            <button key={u._id} onClick={() => openUser(userTab === 'workers' ? 'worker' : 'employer', u._id)}
              className="w-full text-left bg-slate-900 border border-slate-700 rounded-xl p-3 flex items-center gap-3 hover:border-blue-500/50">
              <img src={u.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&size=96`}
                className="w-12 h-12 rounded-xl object-cover bg-slate-800" alt="" />
              <div className="flex-1 min-w-0">
                <p className="font-black text-white truncate">{u.name || 'Unnamed User'}</p>
                <p className="text-xs text-slate-400">+91 {u.phone}</p>
                {userTab === 'workers' && <p className="text-[11px] text-amber-300 mt-1">KYC: {u.kyc?.status || 'pending'} • {u.availability ? '🟢 आज उपलब्ध' : '🔴 unavailable'}</p>}
              </div>
              <span className="text-blue-400 font-black">Open →</span>
            </button>
          ))}
          {!(userTab === 'workers' ? users.workers : users.employers).length && <p className="text-xs text-slate-500 text-center py-4">अभी कोई user नहीं है।</p>}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-black text-white">मजदूर सूची ({workers.length})</h3>
        {workers.map(w => { const si=getSkillInfo(w.skill); return <div key={w._id} className="glass-card rounded-2xl p-3 border border-slate-700 flex items-center gap-3">
          <img src={w.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name)}&background=2563EB&color=fff&size=128`} className="w-12 h-12 rounded-xl object-cover" alt={w.name}/>
          <div className="min-w-0 flex-1"><p className="font-black text-white truncate">{w.name}</p><p className="text-xs text-amber-400 font-bold">{si.emoji} {si.title} • ₹{w.dailyRate}/दिन</p><p className="text-[11px] text-slate-400 truncate">📍 {w.area}{w.city ? `, ${w.city}` : ''} • {w.phone}</p></div>
          <div className="flex gap-1"><button onClick={()=>toggle(w._id,w.availability)} className={`p-2 rounded-xl border ${w.availability?'text-emerald-400 border-emerald-700 bg-emerald-950/50':'text-rose-400 border-rose-700 bg-rose-950/50'}`}>{w.availability?<ToggleRight/>:<ToggleLeft/>}</button><button onClick={()=>openKyc(w._id)} className={`px-2 rounded-xl border text-[10px] font-black ${w.kyc?.status==='verified'?'text-emerald-300 border-emerald-700':'text-amber-300 border-amber-700'}`}>{w.kyc?.status==='verified'?'✓ KYC':'KYC'}</button><button onClick={()=>remove(w._id)} className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-rose-400"><Trash2 className="w-5 h-5"/></button></div>
        </div>})}
      </div>
{selectedUser&&<div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={()=>setSelectedUser(null)}>
  <div onClick={e=>e.stopPropagation()} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-blue-500/40 rounded-3xl p-5 space-y-4">
    <div className="flex justify-between items-start">
      <div><p className="text-[10px] uppercase tracking-widest text-blue-400 font-black">{selectedUser.__type === 'worker' ? 'WORKER' : 'EMPLOYER'} PROFILE</p>
      <h3 className="text-2xl font-black text-white">{selectedUser.name || 'Unnamed User'}</h3>
      <p className="text-xs text-slate-400">+91 {selectedUser.phone}</p></div>
      <button onClick={()=>setSelectedUser(null)} className="text-slate-400 text-xl">✕</button>
    </div>
    <div className="grid md:grid-cols-2 gap-3">
      <div className="bg-slate-800 rounded-2xl p-4"><p className="text-xs text-slate-400">Profile Photo</p><img src={selectedUser.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name || 'User')}&size=160`} className="w-32 h-32 rounded-2xl object-cover mt-2" alt="" /></div>
      <div className="bg-slate-800 rounded-2xl p-4 text-sm text-slate-200 space-y-2">
        {selectedUser.__type === 'worker' ? <>
          <p>🧰 <b>काम:</b> {getSkillInfo(selectedUser.skill).title}</p>
          <p>💰 <b>दिहाड़ी:</b> ₹{selectedUser.dailyRate}/दिन</p>
          <p>📍 <b>इलाका:</b> {selectedUser.area}{selectedUser.city ? `, ${selectedUser.city}` : ''}</p>
          <p>🟢 <b>आज उपलब्ध:</b> {selectedUser.availability ? 'हाँ' : 'नहीं'}</p>
          <p>🛡️ <b>KYC:</b> {selectedUser.kyc?.status || 'pending'}</p>
          <p>🪪 <b>Aadhaar:</b> {selectedUser.kyc?.aadhaarNumber || 'Not submitted'}</p>
        </> : <>
          <p>📱 <b>Mobile:</b> +91 {selectedUser.phone}</p>
          <p>⭐ <b>Ratings given:</b> {selectedUser.stats?.ratingsGiven ?? 0}</p>
          <p>📅 <b>Registered:</b> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : '—'}</p>
        </>}
      </div>
    </div>
    {selectedUser.__type === 'worker' && selectedUser.kyc?.aadhaarPhoto && <div className="grid md:grid-cols-2 gap-3">
      <div><p className="text-xs text-slate-400 mb-1">Aadhaar Photo</p><img src={selectedUser.kyc.aadhaarPhoto} className="w-full max-h-80 object-contain bg-black rounded-xl" alt="Aadhaar" /></div>
      <div><p className="text-xs text-slate-400 mb-1">Current Photo</p><img src={selectedUser.kyc.personalPhoto} className="w-full max-h-80 object-contain bg-black rounded-xl" alt="Current" /></div>
    </div>}
    {selectedUser.__type === 'worker' && <div className="flex gap-2">
      <button onClick={()=>{setSelectedUser(null);openKyc(selectedUser._id)}} className="flex-1 bg-emerald-600 text-white font-black rounded-xl py-3">Open KYC Review</button>
      <button onClick={()=>setSelectedUser(null)} className="flex-1 bg-slate-800 text-slate-200 font-black rounded-xl py-3">Close</button>
    </div>}
  </div>
</div>}
{kycWorker&&<div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={()=>setKycWorker(null)}><div onClick={e=>e.stopPropagation()} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-4"><div className="flex justify-between"><div><h3 className="text-xl font-black text-white">KYC Review</h3><p className="text-xs text-slate-400">{kycWorker.name} • {kycWorker.phone}</p></div><button onClick={()=>setKycWorker(null)}>✕</button></div><div className="bg-slate-800 rounded-xl p-3 text-white font-black">Aadhaar: {kycWorker.kyc?.aadhaarNumber||'—'}<br/><span className="text-xs text-amber-300">Status: {kycWorker.kyc?.status||'pending'}</span></div><div className="grid md:grid-cols-2 gap-3"><img src={kycWorker.kyc?.aadhaarPhoto} className="w-full max-h-72 object-contain bg-black rounded-xl"/><img src={kycWorker.kyc?.personalPhoto} className="w-full max-h-72 object-contain bg-black rounded-xl"/></div><div className="flex gap-2"><button onClick={()=>verifyKyc('verified')} className="flex-1 bg-emerald-600 text-white font-black rounded-xl py-3">✓ Verify</button><button onClick={()=>verifyKyc('rejected')} className="flex-1 bg-rose-600 text-white font-black rounded-xl py-3">Reject</button></div></div></div>}
    </div>
  );
}
