(() => {
  const cfg = () => window.FORWARD_UK_BACKEND || {};
  const PUBLIC_COLLECTIONS = ['policies','manifestos','news','events','representatives','leadership','branches','announcements','documents','faqs','history','candidates','constituencies'];
  let client = null;
  let channel = null;

  function configured(){
    const c = cfg();
    return c.provider === 'supabase' && !!c.supabaseUrl && !!c.supabaseAnonKey && !!window.supabase;
  }
  function getClient(){
    if (!configured()) return null;
    if (!client) client = window.supabase.createClient(cfg().supabaseUrl, cfg().supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    return client;
  }
  function emit(status, detail=''){
    window.dispatchEvent(new CustomEvent('forwarduk:backend',{detail:{status,detail,configured:configured()}}));
  }
  function contentRows(state){
    return PUBLIC_COLLECTIONS.flatMap(collection => (state[collection] || []).map(item => ({
      client_id: String(item.id || `${collection}-${crypto.randomUUID?.() || Date.now()}`),
      collection,
      slug: item.slug || null,
      title: item.title || item.name || item.question || item.year || collection,
      status: item.status || 'Draft',
      data: item
    })));
  }
  async function loadSettings(c){
    const {data, error} = await c.from('site_settings').select('key,value');
    if (error) throw error;
    return Object.fromEntries((data||[]).map(r=>[r.key,r.value]));
  }
  async function loadContent(c){
    const {data, error} = await c.from('content_items').select('client_id,collection,data,updated_at').order('updated_at',{ascending:false});
    if (error) throw error;
    return data || [];
  }
  async function loadStats(c){
    const {data, error} = await c.rpc('public_party_stats');
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return row || null;
  }
  function applyRows(base, settingsRows, rows, stats){
    const next = JSON.parse(JSON.stringify(base));
    ['settings','hero','homepage','navigation'].forEach(k=>{ if (settingsRows[k] != null) next[k] = settingsRows[k]; });
    PUBLIC_COLLECTIONS.forEach(k=>next[k]=[]);
    rows.forEach(r=>{ if (PUBLIC_COLLECTIONS.includes(r.collection)) next[r.collection].push({...r.data,id:r.data?.id || r.client_id}); });
    if (stats) next.remoteStats = stats;
    next.meta = {...(next.meta||{}), remote:true, remoteSyncedAt:new Date().toISOString()};
    return next;
  }
  async function pullPublic(base){
    const c = getClient(); if (!c) return null;
    emit('syncing','Loading SQL data');
    try{
      const [settingsRows, rows, stats] = await Promise.all([loadSettings(c),loadContent(c),loadStats(c)]);
      emit('live','SQL connected');
      return applyRows(base,settingsRows,rows,stats);
    }catch(err){ emit('error',err.message||String(err)); throw err; }
  }
  async function pullAdmin(base){
    const c = getClient(); if (!c) return null;
    emit('syncing','Loading Control Room data');
    try{
      const [settingsRows, rows, stats, memberRes, contactRes, mediaRes, auditRes] = await Promise.all([
        loadSettings(c), loadContent(c), loadStats(c),
        c.from('members').select('*').order('created_at',{ascending:false}),
        c.from('contact_messages').select('*').order('created_at',{ascending:false}),
        c.from('media').select('*').order('created_at',{ascending:false}),
        c.from('audit_log').select('*').order('created_at',{ascending:false}).limit(100)
      ]);
      for (const r of [memberRes,contactRes,mediaRes,auditRes]) if (r.error) throw r.error;
      const next = applyRows(base,settingsRows,rows,stats);
      next.members = (memberRes.data||[]).map(m=>({
        id:m.client_id||m.id, memberNumber:m.member_number, firstName:m.first_name, lastName:m.last_name, email:m.email,
        dob:m.dob, postcode:m.postcode, city:m.city, nation:m.nation, constituency:m.constituency, branch:m.branch,
        joinDate:m.join_date, status:m.status, volunteer:m.volunteer, comms:m.comms, phone:m.phone||'', notes:m.notes||''
      }));
      next.contactMessages = (contactRes.data||[]).map(x=>({id:x.client_id||x.id,firstName:x.first_name,lastName:x.last_name,email:x.email,subject:x.subject,message:x.message,date:x.created_at,status:x.status}));
      next.media = (mediaRes.data||[]).map(x=>({id:x.client_id||x.id,name:x.name,alt:x.alt_text,dataUrl:x.data_url||'',storagePath:x.storage_path||''}));
      next.activityLog = (auditRes.data||[]).map(x=>({id:String(x.id),at:x.created_at,action:x.action,detail:typeof x.detail==='string'?x.detail:JSON.stringify(x.detail||{})}));
      emit('live','SQL connected');
      return next;
    }catch(err){ emit('error',err.message||String(err)); throw err; }
  }
  async function authSession(){ const c=getClient(); if(!c)return null; const {data}=await c.auth.getSession(); return data?.session||null; }
  async function signInAdmin(email,password){
    const c=getClient(); if(!c) throw new Error('Supabase is not configured.');
    const {data,error}=await c.auth.signInWithPassword({email,password}); if(error)throw error;
    const {data:profile,error:pe}=await c.from('profiles').select('role').eq('user_id',data.user.id).single();
    if(pe || !['admin','editor','membership'].includes(profile?.role||'')){ await c.auth.signOut(); throw new Error('This account does not have Control Room access.'); }
    return data.session;
  }
  async function signOut(){ const c=getClient(); if(c) await c.auth.signOut(); }

  async function syncSettings(c,state){
    const publicSettings={...(state.settings||{})};
    delete publicSettings.adminPin;
    const rows=[
      {key:'settings',value:publicSettings},
      {key:'hero',value:state.hero||{}},
      {key:'homepage',value:state.homepage||{}},
      {key:'navigation',value:state.navigation||[]}
    ];
    const {error}=await c.from('site_settings').upsert(rows,{onConflict:'key'}); if(error)throw error;
  }
  async function syncContent(c,state){
    for (const collection of PUBLIC_COLLECTIONS){
      const rows=contentRows(state).filter(r=>r.collection===collection);
      const {data:existing,error:ee}=await c.from('content_items').select('client_id').eq('collection',collection); if(ee)throw ee;
      const keep=new Set(rows.map(r=>r.client_id));
      const remove=(existing||[]).map(x=>x.client_id).filter(id=>!keep.has(id));
      if(remove.length){ const {error}=await c.from('content_items').delete().eq('collection',collection).in('client_id',remove); if(error)throw error; }
      if(rows.length){ const {error}=await c.from('content_items').upsert(rows,{onConflict:'collection,client_id'}); if(error)throw error; }
    }
  }
  async function syncMembers(c,state){
    const rows=(state.members||[]).map(m=>({
      client_id:String(m.id),member_number:m.memberNumber,first_name:m.firstName,last_name:m.lastName,email:m.email,dob:m.dob||null,
      postcode:m.postcode||null,city:m.city||null,nation:m.nation||null,constituency:m.constituency||null,branch:m.branch||null,
      join_date:m.joinDate||null,status:m.status||'Active',volunteer:!!m.volunteer,comms:m.comms!==false,phone:m.phone||null,notes:m.notes||null
    }));
    const {data:existing,error:ee}=await c.from('members').select('client_id'); if(ee)throw ee;
    const keep=new Set(rows.map(r=>r.client_id)); const remove=(existing||[]).map(x=>x.client_id).filter(Boolean).filter(id=>!keep.has(id));
    if(remove.length){ const {error}=await c.from('members').delete().in('client_id',remove); if(error)throw error; }
    if(rows.length){ const {error}=await c.from('members').upsert(rows,{onConflict:'client_id'}); if(error)throw error; }
  }
  async function syncContacts(c,state){
    const rows=(state.contactMessages||[]).map(x=>({client_id:String(x.id),first_name:x.firstName||'',last_name:x.lastName||'',email:x.email,subject:x.subject||'',message:x.message,status:x.status||'New',created_at:x.date||new Date().toISOString()}));
    if(rows.length){ const {error}=await c.from('contact_messages').upsert(rows,{onConflict:'client_id'}); if(error)throw error; }
  }
  async function syncMedia(c,state){
    const rows=(state.media||[]).map(x=>({client_id:String(x.id),name:x.name,alt_text:x.alt||'',data_url:x.dataUrl||null,storage_path:x.storagePath||null}));
    if(rows.length){ const {error}=await c.from('media').upsert(rows,{onConflict:'client_id'}); if(error)throw error; }
  }
  async function pushAdmin(state){
    const c=getClient(); if(!c)return false;
    const session=await authSession(); if(!session)return false;
    emit('syncing','Saving to SQL');
    try{
      await syncSettings(c,state); await syncContent(c,state); await syncMembers(c,state); await syncContacts(c,state); await syncMedia(c,state);
      emit('live','Saved to SQL'); return true;
    }catch(err){ emit('error',err.message||String(err)); console.error(err); return false; }
  }
  async function registerMember(payload){
    const c=getClient(); if(!c)return null;
    const {data,error}=await c.rpc('register_forward_member',{
      p_first_name:payload.firstName,p_last_name:payload.lastName,p_email:payload.email,p_dob:payload.dob||null,p_postcode:payload.postcode||null,
      p_city:payload.city||null,p_nation:payload.nation||null,p_constituency:payload.constituency||null,p_branch:payload.branch||null,
      p_phone:payload.phone||null,p_volunteer:!!payload.volunteer,p_comms:payload.comms!==false
    });
    if(error)throw error; return Array.isArray(data)?data[0]:data;
  }
  async function verifyMember(email,memberNumber){
    const c=getClient(); if(!c)return null;
    const {data,error}=await c.rpc('verify_forward_member',{p_email:email,p_member_number:memberNumber}); if(error)throw error;
    return Array.isArray(data)?data[0]:data;
  }
  async function submitContact(payload){
    const c=getClient(); if(!c)return false;
    const {error}=await c.rpc('submit_forward_contact',{p_first_name:payload.firstName,p_last_name:payload.lastName,p_email:payload.email,p_subject:payload.subject,p_message:payload.message});
    if(error)throw error; return true;
  }
  function watch(onChange){
    const c=getClient(); if(!c||channel)return;
    channel=c.channel('forwarduk-public-live')
      .on('postgres_changes',{event:'*',schema:'public',table:'site_settings'},()=>onChange?.())
      .on('postgres_changes',{event:'*',schema:'public',table:'content_items'},()=>onChange?.())
      .subscribe();
  }
  window.ForwardRemote={configured,getClient,pullPublic,pullAdmin,pushAdmin,registerMember,verifyMember,submitContact,signInAdmin,signOut,authSession,watch};
})();
