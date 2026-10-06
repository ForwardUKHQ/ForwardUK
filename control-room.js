(() => {
  const store = window.ForwardStore;
  let data = store.get();
  let currentView = 'dashboard';

  const schemas = {
    homepageCards: { label:'Homepage Cards', fields:[['title','text'],['icon','text'],['copy','textarea'],['href','text'],['image','text']] },
    policies: { label:'Policies', fields:[['title','text'],['category','text'],['summary','textarea'],['body','textarea'],['commitments','textarea'],['featured','checkbox'],['status','select:Draft|Published|Archived'],['icon','text'],['image','text']] },
    manifestos: { label:'Manifestos', fields:[['title','text'],['year','text'],['subtitle','text'],['intro','textarea'],['published','date'],['status','select:Draft|Coming Soon|Published|Archived'],['featured','checkbox'],['pdf','text'],['cover','text'],['sections','textarea']] },
    news: { label:'News', fields:[['title','text'],['subtitle','text'],['body','textarea'],['category','text'],['author','text'],['date','date'],['status','select:Draft|Published|Scheduled'],['featured','checkbox'],['image','text']] },
    events: { label:'Events', fields:[['title','text'],['type','text'],['date','date'],['start','time'],['end','time'],['location','text'],['address','text'],['constituency','text'],['region','text'],['description','textarea'],['audience','select:Public|Members Only'],['status','select:Upcoming|Live|Completed|Postponed|Cancelled'],['image','text']] },
    representatives: { label:'Representatives', fields:[['name','text'],['role','text'],['type','select:MP|Councillor|Mayor|PCC|Devolved Representative'],['area','text'],['region','text'],['bio','textarea'],['email','email'],['status','select:Active|Former'],['photo','text']] },
    leadership: { label:'Leadership', fields:[['name','text'],['role','text'],['constituency','text'],['bio','textarea'],['quote','text'],['photo','text']] },
    branches: { label:'Local Branches', fields:[['name','text'],['constituency','text'],['region','text'],['nation','select:England|Scotland|Wales|Northern Ireland'],['chair','text'],['email','email'],['meetings','text'],['description','textarea'],['status','select:Active|Inactive'],['image','text']] },
    announcements: { label:'Announcements', fields:[['title','text'],['audience','select:Public|Members|Branch|National'],['importance','select:Normal|High|Urgent'],['start','date'],['end','date'],['body','textarea'],['pinned','checkbox']] },
    members: { label:'Members', fields:[['memberNumber','text'],['firstName','text'],['lastName','text'],['email','email'],['dob','date'],['postcode','text'],['city','text'],['nation','text'],['constituency','text'],['phone','text'],['branch','text'],['joinDate','date'],['status','select:Active|Pending|Suspended|Former Member'],['volunteer','checkbox'],['comms','checkbox'],['notes','textarea']] }
  };

  const esc=(v='')=>String(v).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[ch]));
  const uid=(prefix)=>prefix+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);
  const save=()=>{store.save(data); showToast('Saved');};
  function showToast(t){const el=document.querySelector('#adminToast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1300);}

  function checkAuth(){
    const auth=sessionStorage.getItem('forwardUKAdminAuth');
    if(auth==='yes') return renderShell();
    document.querySelector('#adminRoot').innerHTML=`<div class="admin-login"><div class="login-card"><img src="forward-uk-logo.png" alt="Forward UK"><div class="eyebrow">CONTROL ROOM</div><h1>Sign in</h1><p>This static demo uses a local browser PIN. It is not production security.</p><form id="pinForm"><label>Control Room PIN<input type="password" name="pin" required autofocus></label><button class="button button-primary">Enter Control Room</button><p class="form-note">Default demo PIN: 2029</p></form></div></div>`;
    document.querySelector('#pinForm').addEventListener('submit',e=>{e.preventDefault();if(new FormData(e.currentTarget).get('pin')===data.settings.adminPin){sessionStorage.setItem('forwardUKAdminAuth','yes');renderShell();}else alert('Incorrect PIN.');});
  }

  function renderShell(){
    document.querySelector('#adminRoot').innerHTML=`<div class="admin-app"><aside class="admin-sidebar"><div class="admin-brand"><img src="forward-uk-logo.png" alt="Forward UK"><span>Control Room</span></div><nav id="adminNav"></nav><div class="admin-side-bottom"><a href="index.html" target="_blank">↗ Open public site</a><button id="adminLogout">Sign out</button></div></aside><main class="admin-main"><header class="admin-top"><div><div class="eyebrow">FORWARD UK</div><h1 id="adminTitle">Dashboard</h1></div><div class="admin-actions"><button class="button button-outline" id="exportData">Export data</button><label class="button button-outline file-button">Import data<input id="importData" type="file" accept="application/json"></label></div></header><div id="adminContent"></div></main></div><div id="adminToast" class="admin-toast">Saved</div>`;
    const items=[['dashboard','Dashboard'],['homepage','Homepage'],['manifestos','Manifestos'],['policies','Policies'],['news','News'],['events','Events'],['members','Members'],['representatives','Representatives'],['leadership','Leadership'],['branches','Local Branches'],['announcements','Announcements'],['statistics','Party Statistics'],['settings','Site Settings']];
    document.querySelector('#adminNav').innerHTML=items.map(([k,l])=>`<button data-view="${k}">${l}</button>`).join('');
    document.querySelector('#adminNav').addEventListener('click',e=>{const b=e.target.closest('button[data-view]');if(b){currentView=b.dataset.view;renderView();}});
    document.querySelector('#adminLogout').addEventListener('click',()=>{sessionStorage.removeItem('forwardUKAdminAuth');location.reload();});
    document.querySelector('#exportData').addEventListener('click',exportData);
    document.querySelector('#importData').addEventListener('change',importData);
    renderView();
  }

  function renderView(){
    document.querySelectorAll('#adminNav button').forEach(b=>b.classList.toggle('active',b.dataset.view===currentView));
    if(currentView==='dashboard') return renderDashboard();
    if(currentView==='settings') return renderSettings();
    if(currentView==='statistics') return renderStats();
    if(currentView==='homepage') return renderHomepage();
    if(schemas[currentView]) return renderCollection(currentView);
  }

  function renderDashboard(){
    document.querySelector('#adminTitle').textContent='Dashboard';
    const cards=[['Members',data.members.length],['MPs',data.representatives.filter(r=>r.type==='MP'&&r.status==='Active').length],['Councillors',data.representatives.filter(r=>r.type==='Councillor'&&r.status==='Active').length],['Branches',data.branches.filter(b=>b.status==='Active').length],['Published news',data.news.filter(n=>n.status==='Published').length],['Upcoming events',data.events.filter(e=>e.status==='Upcoming').length],['Policies',data.policies.filter(p=>p.status==='Published').length],['Manifestos',data.manifestos.length]];
    document.querySelector('#adminContent').innerHTML=`<section class="admin-stat-grid">${cards.map(([l,v])=>`<div><span>${esc(l)}</span><strong>${v}</strong></div>`).join('')}</section><section class="admin-panel"><div class="admin-panel-head"><div><h2>Quick actions</h2><p>Manage the main areas of the Forward UK website.</p></div></div><div class="quick-admin-grid">${[['news','Add news'],['events','Add event'],['manifestos','Add manifesto'],['members','View members'],['statistics','Update statistics'],['homepage','Edit homepage']].map(([k,l])=>`<button data-jump="${k}">${l}</button>`).join('')}</div></section><section class="admin-panel"><div class="admin-panel-head"><div><h2>Recent data</h2><p>Everything in this demo is stored in this browser through localStorage.</p></div></div><div class="admin-note">For a real public CMS, replace the browser store with a database/API and server-side authentication. The page components are already separated from the data model so that upgrade is straightforward.</div></section>`;
    document.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>{currentView=b.dataset.jump;renderView();}));
  }

  function renderHomepage(){
    document.querySelector('#adminTitle').textContent='Homepage';
    document.querySelector('#adminContent').innerHTML=`<section class="admin-panel"><div class="admin-panel-head"><div><h2>Hero</h2><p>Edit the main campaign message and buttons.</p></div></div><form id="heroForm" class="admin-form"><label>Eyebrow<input name="eyebrow" value="${esc(data.hero.eyebrow)}"></label><label>Title<input name="title" value="${esc(data.hero.title)}"></label><label>Year<input name="year" value="${esc(data.hero.year)}"></label><label class="full">Copy<textarea name="copy">${esc(data.hero.copy)}</textarea></label><label>Primary label<input name="primaryLabel" value="${esc(data.hero.primaryLabel)}"></label><label>Primary link<input name="primaryHref" value="${esc(data.hero.primaryHref)}"></label><label>Secondary label<input name="secondaryLabel" value="${esc(data.hero.secondaryLabel)}"></label><label>Secondary link<input name="secondaryHref" value="${esc(data.hero.secondaryHref)}"></label><div class="full"><button class="button button-primary">Save homepage hero</button></div></form></section><section class="admin-panel"><div class="admin-panel-head"><div><h2>Homepage cards</h2><p>Add, edit or remove the main icon/image cards.</p></div><button class="button button-primary" id="editHomeCards">Manage cards</button></div></section>`;
    document.querySelector('#heroForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);Object.keys(data.hero).forEach(k=>data.hero[k]=fd.get(k)||'');save();});
    document.querySelector('#editHomeCards').addEventListener('click',()=>{currentView='homepageCards';renderCollection('homepageCards',true);});
  }

  function renderStats(){
    document.querySelector('#adminTitle').textContent='Party Statistics';
    const labels={members:'Members',mps:'MPs',councillors:'Councillors',mayors:'Mayors',branches:'Local branches',candidates:'Candidates',volunteers:'Volunteers',constituencies:'Constituencies contested'};
    document.querySelector('#adminContent').innerHTML=`<section class="admin-panel"><div class="admin-panel-head"><div><h2>Published statistics</h2><p>These figures are used throughout the public website.</p></div></div><form id="statsForm" class="admin-form">${Object.keys(labels).map(k=>`<label>${labels[k]}<input type="number" min="0" name="${k}" value="${Number(data.stats[k]||0)}"></label>`).join('')}<div class="full"><button class="button button-primary">Save statistics</button></div></form></section>`;
    document.querySelector('#statsForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);Object.keys(labels).forEach(k=>data.stats[k]=Number(fd.get(k)||0));save();});
  }

  function renderSettings(){
    document.querySelector('#adminTitle').textContent='Site Settings';
    const fields=[['partyName','Party name'],['slogan','Slogan'],['campaignYear','Campaign year'],['contactEmail','Contact email'],['address','Address'],['xHandle','X handle'],['instagram','Instagram'],['facebook','Facebook'],['youtube','YouTube'],['tiktok','TikTok'],['footerText','Footer text'],['adminPin','Control Room PIN']];
    document.querySelector('#adminContent').innerHTML=`<section class="admin-panel"><div class="admin-panel-head"><div><h2>Global settings</h2><p>Update party identity and public contact information.</p></div></div><form id="settingsForm" class="admin-form">${fields.map(([k,l])=>`<label>${l}<input name="${k}" value="${esc(data.settings[k]||'')}"></label>`).join('')}<div class="full"><button class="button button-primary">Save settings</button></div></form></section><section class="admin-panel danger-zone"><div><h2>Demo data</h2><p>Reset this browser back to the original sample content.</p></div><button class="button button-outline" id="resetData">Reset demo data</button></section>`;
    document.querySelector('#settingsForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);fields.forEach(([k])=>data.settings[k]=fd.get(k)||'');save();});
    document.querySelector('#resetData').addEventListener('click',()=>{if(confirm('Reset all website data in this browser?')){data=store.reset();renderView();showToast('Reset');}});
  }

  function renderCollection(key,force=false){
    currentView=key;
    const schema=schemas[key]; if(!schema) return;
    document.querySelector('#adminTitle').textContent=schema.label;
    const rows=data[key]||[];
    document.querySelector('#adminContent').innerHTML=`<section class="admin-panel"><div class="admin-panel-head"><div><h2>${schema.label}</h2><p>${rows.length} record${rows.length===1?'':'s'} in this browser.</p></div><button class="button button-primary" id="addRecord">Add new</button></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Title / Name</th><th>Status / Type</th><th>Details</th><th></th></tr></thead><tbody>${rows.map((item,i)=>`<tr><td><strong>${esc(item.title||item.name||[item.firstName,item.lastName].filter(Boolean).join(' ')||item.memberNumber||'Untitled')}</strong><small>${esc(item.subtitle||item.email||item.category||'')}</small></td><td>${esc(item.status||item.type||item.audience||'')}</td><td>${esc(item.date||item.year||item.constituency||item.region||item.joinDate||'')}</td><td class="row-actions"><button data-edit="${i}">Edit</button><button class="danger" data-delete="${i}">Delete</button></td></tr>`).join('')}</tbody></table></div></section><dialog id="recordDialog" class="admin-dialog"><form method="dialog" id="recordForm"></form></dialog>`;
    document.querySelector('#addRecord').addEventListener('click',()=>openRecord(key,-1));
    document.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>openRecord(key,Number(b.dataset.edit))));
    document.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>{if(confirm('Delete this record?')){data[key].splice(Number(b.dataset.delete),1);save();renderCollection(key);}}));
  }

  function openRecord(key,index){
    const schema=schemas[key]; const item=index>=0?data[key][index]:{id:uid(key.slice(0,3))}; const dlg=document.querySelector('#recordDialog'); const form=document.querySelector('#recordForm');
    form.innerHTML=`<div class="dialog-head"><div><div class="eyebrow">${index>=0?'EDIT':'NEW'}</div><h2>${esc(schema.label)}</h2></div><button value="cancel" class="dialog-x">×</button></div><div class="dialog-body">${schema.fields.map(([name,type])=>fieldHtml(name,type,item[name])).join('')}</div><div class="dialog-foot"><button value="cancel" class="button button-outline">Cancel</button><button value="default" id="saveRecord" class="button button-primary">Save</button></div>`;
    form.querySelector('#saveRecord').addEventListener('click',e=>{e.preventDefault();const fd=new FormData(form);schema.fields.forEach(([name,type])=>{item[name]=type==='checkbox'?form.elements[name].checked:(fd.get(name)||'');});if(index>=0)data[key][index]=item;else data[key].push(item);save();dlg.close();renderCollection(key);});
    dlg.showModal();
  }

  function fieldHtml(name,type,value){
    const label=name.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
    if(type==='textarea') return `<label class="full">${label}<textarea name="${name}">${esc(value||'')}</textarea></label>`;
    if(type==='checkbox') return `<label class="check full"><input type="checkbox" name="${name}" ${value?'checked':''}> ${label}</label>`;
    if(type.startsWith('select:')) return `<label>${label}<select name="${name}">${type.split(':')[1].split('|').map(x=>`<option ${String(value)===x?'selected':''}>${esc(x)}</option>`).join('')}</select></label>`;
    return `<label>${label}<input type="${type}" name="${name}" value="${esc(value||'')}"></label>`;
  }

  function exportData(){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='forward-uk-data.json';a.click();URL.revokeObjectURL(a.href);}
  function importData(e){const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const parsed=JSON.parse(r.result);data=parsed;store.save(data);renderView();showToast('Imported');}catch(err){alert('That file is not valid Forward UK JSON.');}};r.readAsText(file);}

  document.addEventListener('DOMContentLoaded',()=>{data=store.get();checkAuth();});
})();
