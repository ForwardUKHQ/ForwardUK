(() => {
  const VERSION = 'forwarduk-v3-data';
  const now = new Date().toISOString();
  const DEFAULT_FORWARD_UK_DATA = {
    meta: { version: 3, createdAt: now, updatedAt: now, remote:false },
    settings: {
      partyName: 'Forward UK', slogan: 'Forward for Britain', campaignYear: '2029',
      contactEmail: '', contactPhone: '', address: 'United Kingdom',
      xHandle: '', instagram: '', facebook: '', youtube: '', tiktok: '',
      footerText: 'Forward for Britain.', adminPin: '2029', maintenanceMode: false,
      maintenanceMessage: 'Forward UK is making improvements. Please check back shortly.',
      publicMembership: true, memberPrefix: 'FWUK',
      brand: { azure:'#3454D1', turquoise:'#34D1BF', platinum:'#EFEFEF', black:'#070707' }
    },
    hero: {
      eyebrow: 'FORWARD UK', title: 'FORWARD FOR BRITAIN', year: '2029',
      copy: 'Stronger communities. Better public services. Secure borders. Opportunity across Britain.',
      primaryLabel: 'Join Free', primaryHref: 'membership.html',
      secondaryLabel: 'Explore our policies', secondaryHref: 'policies.html'
    },
    homepage: {
      introTitle: 'A stronger, fairer Britain.',
      introCopy: 'Forward UK is building a modern political movement around practical policy, strong communities and public services that work.',
      showStats: true, showPolicies: true, showNews: true, showEvents: true, showMembership: true, showPledge: true,
      cards: [
        {id:'hc1',title:'Policy Hub',copy:'Explore Forward UK policy as it is published.',icon:'document',href:'policies.html',image:''},
        {id:'hc2',title:'Newsroom',copy:'Statements, updates and party news.',icon:'news',href:'news.html',image:''},
        {id:'hc3',title:'Events',copy:'See public and member events.',icon:'calendar',href:'events.html',image:''},
        {id:'hc4',title:'Free Membership',copy:'Join Forward UK for free.',icon:'badge',href:'membership.html',image:''},
        {id:'hc5',title:'Local Branches',copy:'Find Forward UK activity near you.',icon:'pin',href:'branches.html',image:''},
        {id:'hc6',title:'Documents',copy:'Read party documents and publications.',icon:'folder',href:'documents.html',image:''}
      ]
    },
    navigation: [
      {label:'About',href:'about.html'}, {label:'Policies',href:'policies.html'}, {label:'News',href:'news.html'},
      {label:'Events',href:'events.html'}, {label:'Membership',href:'membership.html'}, {label:'Local',href:'branches.html'}
    ],
    policies: [], manifestos: [], news: [], events: [], members: [], representatives: [], leadership: [],
    branches: [], announcements: [], documents: [], faqs: [], history: [], media: [], contactMessages: [],
    candidates: [], constituencies: [], activityLog: [], versions: [], remoteStats:null
  };

  const clone = o => JSON.parse(JSON.stringify(o));
  let syncing = false;
  let remoteTimer = null;
  function merge(base, saved){
    if (!saved || typeof saved !== 'object') return clone(base);
    const out = clone(base);
    for (const [k,v] of Object.entries(saved)) {
      if (v && typeof v==='object' && !Array.isArray(v) && out[k] && typeof out[k]==='object' && !Array.isArray(out[k])) out[k] = {...out[k],...v};
      else out[k]=v;
    }
    return out;
  }
  function get(){
    try { const raw=localStorage.getItem(VERSION); return raw?merge(DEFAULT_FORWARD_UK_DATA,JSON.parse(raw)):clone(DEFAULT_FORWARD_UK_DATA); }
    catch(e){ return clone(DEFAULT_FORWARD_UK_DATA); }
  }
  function dispatch(data,source='local'){
    window.dispatchEvent(new CustomEvent('forwarduk:data',{detail:{data,source}}));
  }
  function save(data, reason='Update', options={}){
    data.meta = data.meta || {}; data.meta.version=3; data.meta.updatedAt=new Date().toISOString();
    localStorage.setItem(VERSION,JSON.stringify(data));
    dispatch(data,options.source||'local');
    if (!options.skipRemote && window.ForwardRemote?.configured?.()) {
      window.ForwardRemote.authSession().then(session=>{ if(session) window.ForwardRemote.pushAdmin(data); }).catch(()=>{});
    }
  }
  function reset(){ localStorage.removeItem(VERSION); return get(); }
  function computedStats(data){
    if (data?.remoteStats && data?.meta?.remote && !data?.meta?.adminRemote) {
      const r=data.remoteStats; return {
        members:Number(r.members||0),mps:Number(r.mps||0),councillors:Number(r.councillors||0),mayors:Number(r.mayors||0),branches:Number(r.branches||0),
        candidates:Number(r.candidates||0),constituencies:Number(r.constituencies||0),volunteers:Number(r.volunteers||0),representatives:Number(r.representatives||0),
        leadership:Number(r.leadership||0),documents:Number(r.documents||0)
      };
    }
    const active = x => !x.status || ['Active','Published','Current'].includes(x.status);
    const reps = (data.representatives||[]).filter(active);
    const members = (data.members||[]).filter(m=>m.status==='Active');
    const branches = (data.branches||[]).filter(active);
    const candidates = (data.candidates||[]).filter(active);
    const constituencies = new Set((data.constituencies||[]).filter(active).map(c=>c.name).filter(Boolean));
    return {
      members: members.length,
      mps: reps.filter(r=>r.type==='MP').length,
      councillors: reps.filter(r=>r.type==='Councillor').length,
      mayors: reps.filter(r=>r.type==='Mayor').length,
      branches: branches.length,
      candidates: candidates.length,
      constituencies: constituencies.size,
      volunteers: members.filter(m=>m.volunteer).length,
      representatives: reps.length,
      leadership: (data.leadership||[]).filter(active).length,
      documents: (data.documents||[]).filter(d=>d.status==='Published').length
    };
  }
  function log(data,action,detail=''){
    data.activityLog = data.activityLog || [];
    data.activityLog.unshift({id:'log-'+Date.now(),at:new Date().toISOString(),action,detail});
    data.activityLog=data.activityLog.slice(0,100);
  }
  function snapshot(data,label='Snapshot'){
    data.versions=data.versions||[];
    const safe=clone(data); delete safe.versions;
    data.versions.unshift({id:'ver-'+Date.now(),at:new Date().toISOString(),label,data:safe});
    data.versions=data.versions.slice(0,15);
  }
  async function syncRemote(admin=false){
    if(syncing || !window.ForwardRemote?.configured?.()) return false;
    syncing=true;
    try{
      const base=get();
      const remote=admin ? await window.ForwardRemote.pullAdmin(base) : await window.ForwardRemote.pullPublic(base);
      if(!remote)return false;
      remote.meta={...(remote.meta||{}),version:3,remote:true,adminRemote:!!admin,updatedAt:new Date().toISOString()};
      localStorage.setItem(VERSION,JSON.stringify(remote));
      dispatch(remote,'remote');
      return true;
    }catch(err){ console.warn('Forward UK SQL sync:',err); return false; }
    finally{syncing=false;}
  }
  function startRemoteWatch(admin=false){
    if(!window.ForwardRemote?.configured?.())return;
    window.ForwardRemote.watch?.(()=>syncRemote(admin));
    if(remoteTimer)clearInterval(remoteTimer);
    const ms=Math.max(10000,Number(window.FORWARD_UK_BACKEND?.pollMs||20000));
    remoteTimer=setInterval(()=>syncRemote(admin),ms);
  }
  function backendMode(){ return window.ForwardRemote?.configured?.() ? 'supabase' : 'local'; }
  window.ForwardStore={get,save,reset,computedStats,log,snapshot,syncRemote,startRemoteWatch,backendMode,defaults:()=>clone(DEFAULT_FORWARD_UK_DATA),key:VERSION};
})();
