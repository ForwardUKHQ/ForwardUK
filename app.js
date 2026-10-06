(() => {
  const store = window.ForwardStore;
  let data = store.get();

  const iconSvg = (name) => {
    const common = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
    const paths = {
      document: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5"/><path d="M10 12h5M10 16h5"/>',
      news: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h6M7 13h4M15 9h2v4h-2zM7 17h10"/>',
      calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="M8 14h2M14 14h2M8 18h2"/>',
      people: '<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M17 11a4 4 0 0 1 4 4v2M16 3.5a4 4 0 0 1 0 7.5"/>',
      badge: '<rect x="4" y="5" width="16" height="14" rx="3"/><circle cx="9" cy="11" r="2"/><path d="M7 16c.8-2 3.2-2 4 0M14 10h3M14 14h3"/>',
      pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2.5"/>',
      heart: '<path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6z"/>',
      shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
      chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
      home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v11h14V10M9 21v-7h6v7"/>',
      arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      megaphone: '<path d="M3 11v2c0 1 .8 2 2 2h2l8 4V5l-8 4H5c-1.2 0-2 1-2 2z"/><path d="M7 15l1 5h3"/>',
      user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
    };
    return `<svg ${common}>${paths[name] || paths.arrow}</svg>`;
  };
  window.ForwardIcons = iconSvg;

  const escapeHtml = (value='') => String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[ch]));
  const fmt = new Intl.NumberFormat('en-GB');
  const niceDate = (value) => {
    if (!value) return '';
    const d = new Date(value + (value.length === 10 ? 'T12:00:00' : ''));
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  };

  function activeClass(file) {
    const current = location.pathname.split('/').pop() || 'index.html';
    return current === file ? 'is-active' : '';
  }

  function injectChrome() {
    const header = document.querySelector('#siteHeader');
    const footer = document.querySelector('#siteFooter');
    if (header) header.innerHTML = `
      <header class="site-header">
        <div class="shell nav-shell">
          <a class="brand" href="index.html" aria-label="Forward UK home"><img src="forward-uk-logo.png" alt="Forward UK"></a>
          <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Open navigation">☰</button>
          <nav class="main-nav" id="mainNav">
            <a class="${activeClass('index.html')}" href="index.html">Home</a>
            <a class="${activeClass('policies.html')}" href="policies.html">Policies</a>
            <a class="${activeClass('manifesto.html')}" href="manifesto.html">Manifestos</a>
            <a class="${activeClass('news.html')}" href="news.html">News</a>
            <a class="${activeClass('events.html')}" href="events.html">Events</a>
            <a class="${activeClass('representatives.html')}" href="representatives.html">Representatives</a>
            <a class="${activeClass('branches.html')}" href="branches.html">Branches</a>
            <a class="${activeClass('campaign.html')}" href="campaign.html">2029</a>
          </nav>
          <a class="button button-primary nav-join" href="membership.html">Join Free ${iconSvg('arrow')}</a>
        </div>
      </header>`;
    if (footer) footer.innerHTML = `
      <footer class="site-footer">
        <div class="shell footer-grid">
          <div><img class="footer-logo" src="forward-uk-logo.png" alt="Forward UK"><p>${escapeHtml(data.settings.footerText)}</p></div>
          <div><h4>Explore</h4><a href="policies.html">Policies</a><a href="manifesto.html">Manifestos</a><a href="news.html">News</a><a href="events.html">Events</a></div>
          <div><h4>Party</h4><a href="leadership.html">Leadership</a><a href="representatives.html">Representatives</a><a href="branches.html">Local Branches</a><a href="membership.html">Free Membership</a></div>
          <div><h4>Contact</h4><a href="mailto:${escapeHtml(data.settings.contactEmail)}">${escapeHtml(data.settings.contactEmail)}</a><span>${escapeHtml(data.settings.xHandle)}</span><a href="control-room.html">Control Room</a></div>
        </div>
        <div class="shell footer-bottom"><span>© ${new Date().getFullYear()} ${escapeHtml(data.settings.partyName)}.</span><span>${escapeHtml(data.settings.slogan)}.</span></div>
      </footer>`;
    document.querySelector('#mobileMenuBtn')?.addEventListener('click', () => document.querySelector('#mainNav')?.classList.toggle('open'));
  }

  function cardVisual(item, fallbackIcon='document') {
    if (item.image) return `<div class="card-photo" style="background-image:url('${escapeHtml(item.image)}')"></div>`;
    return `<div class="icon-bubble">${iconSvg(item.icon || fallbackIcon)}</div>`;
  }

  function renderHome() {
    const root = document.querySelector('#homePage');
    if (!root) return;
    const policies = data.policies.filter(p => p.status === 'Published' && p.featured).slice(0, 4);
    const news = data.news.filter(n => n.status === 'Published').sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
    const events = data.events.filter(e => e.status !== 'Cancelled').sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);
    const manifesto = data.manifestos.find(m => m.featured) || data.manifestos[0];
    root.innerHTML = `
      <section class="hero">
        <div class="hero-art" aria-hidden="true"></div>
        <div class="shell hero-grid">
          <div class="hero-copy">
            <div class="eyebrow">${escapeHtml(data.hero.eyebrow)}</div>
            <h1><span>FORWARD</span><span class="teal">FOR BRITAIN</span><strong>${escapeHtml(data.hero.year)}</strong></h1>
            <p>${escapeHtml(data.hero.copy)}</p>
            <div class="hero-actions"><a class="button button-primary" href="${escapeHtml(data.hero.primaryHref)}">${escapeHtml(data.hero.primaryLabel)} ${iconSvg('arrow')}</a><a class="button button-outline" href="${escapeHtml(data.hero.secondaryHref)}">${escapeHtml(data.hero.secondaryLabel)} ${iconSvg('arrow')}</a></div>
          </div>
          <div class="hero-visual"><img src="forward-uk-campaign-banner.png" alt="Forward UK — Forward for Britain 2029"><div class="hero-visual-overlay">A Britain<br>that moves<br><b>Forward.</b></div></div>
        </div>
      </section>

      <section class="section cards-section"><div class="shell"><div class="quick-grid">${data.homepageCards.map(c => `<a class="quick-card" href="${escapeHtml(c.href)}">${cardVisual(c)}<h3>${escapeHtml(c.title)}</h3><p>${escapeHtml(c.copy)}</p><span class="mini-arrow">${iconSvg('arrow')}</span></a>`).join('')}</div></div></section>

      <section class="section soft"><div class="shell">
        <div class="section-heading split"><div><div class="eyebrow">OUR PLAN</div><h2>A stronger, fairer<br><span>Britain by ${escapeHtml(data.settings.campaignYear)}</span></h2></div><p>Practical policies designed around communities, public services, security and opportunity — with space to add and update every priority from the Control Room.</p></div>
        <div class="policy-grid">${policies.map(p => `<a class="policy-card" href="policies.html#${p.id}">${cardVisual(p,'document')}<h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.summary)}</p><span>${iconSvg('arrow')}</span></a>`).join('')}</div>
      </div></section>

      <section class="section"><div class="shell">
        <div class="stats-grid">${Object.entries({members:'Members',mps:'MPs',councillors:'Councillors',branches:'Local branches'}).map(([k,l]) => `<div class="stat-card"><strong data-count="${Number(data.stats[k]||0)}">0</strong><span>${l}</span></div>`).join('')}</div>
      </div></section>

      <section class="section manifesto-feature"><div class="shell feature-split">
        <div><div class="eyebrow">FEATURED MANIFESTO</div><h2>${escapeHtml(manifesto?.title || 'Forward for Britain')}</h2><p>${escapeHtml(manifesto?.intro || '')}</p><a class="button button-primary" href="manifesto.html">Explore the manifesto ${iconSvg('arrow')}</a></div>
        <div class="manifesto-cover">${manifesto?.cover ? `<img src="${escapeHtml(manifesto.cover)}" alt="${escapeHtml(manifesto.title)}">` : `<img src="forward-uk-campaign-banner.png" alt="Forward UK campaign">`}</div>
      </div></section>

      <section class="section soft"><div class="shell"><div class="section-heading split"><div><div class="eyebrow">LATEST NEWS</div><h2>From Forward UK</h2></div><a href="news.html" class="text-link">View all news ${iconSvg('arrow')}</a></div><div class="news-grid">${news.map(n=>newsCard(n)).join('')}</div></div></section>

      <section class="section"><div class="shell"><div class="section-heading split"><div><div class="eyebrow">UPCOMING</div><h2>Events across the UK</h2></div><a href="events.html" class="text-link">All events ${iconSvg('arrow')}</a></div><div class="event-grid">${events.map(eventCard).join('')}</div></div></section>

      <section class="section membership-cta"><div class="shell cta-shell"><div><div class="eyebrow light">FREE MEMBERSHIP</div><h2>Join Forward UK for free.</h2><p>Get campaign updates, local event information, member announcements and access to your Member Area.</p></div><div><a class="button button-white" href="membership.html">Join Free ${iconSvg('arrow')}</a></div></div></section>`;
    setupCountUp();
  }

  function newsCard(n) {
    return `<article class="news-card">${n.image ? `<div class="news-image" style="background-image:url('${escapeHtml(n.image)}')"></div>` : `<div class="news-image placeholder-news"></div>`}<div class="news-body"><div class="meta"><span>${escapeHtml(n.category)}</span><time>${niceDate(n.date)}</time></div><h3>${escapeHtml(n.title)}</h3><p>${escapeHtml(n.subtitle)}</p><a href="news.html#${n.id}">Read more ${iconSvg('arrow')}</a></div></article>`;
  }
  function eventCard(e) {
    return `<article class="event-card"><div class="event-date"><strong>${new Date(e.date+'T12:00:00').getDate()}</strong><span>${new Date(e.date+'T12:00:00').toLocaleDateString('en-GB',{month:'short'}).toUpperCase()}</span></div><div><span class="pill">${escapeHtml(e.type)}</span><h3>${escapeHtml(e.title)}</h3><p>${escapeHtml(e.location)} · ${escapeHtml(e.start)}</p><p>${escapeHtml(e.description)}</p></div></article>`;
  }

  function renderPolicies() {
    const root = document.querySelector('#policiesPage'); if (!root) return;
    const cats = ['All', ...new Set(data.policies.filter(p=>p.status==='Published').map(p=>p.category))];
    root.innerHTML = pageHero('Policy Hub','Plans for a stronger, fairer Britain.','Explore Forward UK policy by topic, with commitments and longer briefings.') + `<section class="section"><div class="shell"><div class="filter-row" id="policyFilters">${cats.map((c,i)=>`<button class="filter-btn ${i===0?'active':''}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}</div><div class="policy-list" id="policyList"></div></div></section>`;
    const render = (cat='All') => { document.querySelector('#policyList').innerHTML = data.policies.filter(p=>p.status==='Published' && (cat==='All'||p.category===cat)).map(p=>`<article class="policy-detail" id="${p.id}"><div>${cardVisual(p,'document')}</div><div><span class="pill">${escapeHtml(p.category)}</span><h2>${escapeHtml(p.title)}</h2><p class="lead">${escapeHtml(p.summary)}</p><p>${escapeHtml(p.body)}</p><div class="commitments">${String(p.commitments||'').split('|').filter(Boolean).map(x=>`<span>✓ ${escapeHtml(x)}</span>`).join('')}</div></div></article>`).join(''); };
    render(); document.querySelectorAll('.filter-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');render(btn.dataset.cat);}));
  }

  function renderManifestos() {
    const root = document.querySelector('#manifestoPage'); if (!root) return;
    root.innerHTML = pageHero('Manifestos','Our plans, in full.','Read current and archived Forward UK programmes, policy sections and campaign plans.') + `<section class="section"><div class="shell manifesto-list">${data.manifestos.map(m=>`<article class="manifesto-item"><div class="manifesto-thumb">${m.cover?`<img src="${escapeHtml(m.cover)}" alt="">`:`<img src="forward-uk-campaign-banner.png" alt="">`}</div><div><div class="meta"><span class="pill">${escapeHtml(m.status)}</span><span>${escapeHtml(m.year)}</span></div><h2>${escapeHtml(m.title)}</h2><h3>${escapeHtml(m.subtitle)}</h3><p>${escapeHtml(m.intro)}</p><div class="tag-row">${String(m.sections||'').split('|').filter(Boolean).map(s=>`<span>${escapeHtml(s)}</span>`).join('')}</div>${m.pdf?`<a class="button button-outline" href="${escapeHtml(m.pdf)}">Open PDF ${iconSvg('arrow')}</a>`:''}</div></article>`).join('')}</div></section>`;
  }

  function renderNews() {
    const root = document.querySelector('#newsPage'); if (!root) return;
    root.innerHTML = pageHero('News & Statements','Latest from Forward UK.','Campaign updates, policy announcements, community news and official statements.') + `<section class="section"><div class="shell news-grid">${data.news.filter(n=>n.status==='Published').sort((a,b)=>b.date.localeCompare(a.date)).map(newsCard).join('')}</div></section>`;
  }

  function renderEvents() {
    const root = document.querySelector('#eventsPage'); if (!root) return;
    root.innerHTML = pageHero('Events','Meet Forward UK.','National launches, local meetings, policy events and member briefings.') + `<section class="section"><div class="shell event-list">${data.events.sort((a,b)=>a.date.localeCompare(b.date)).map(eventCard).join('')}</div></section>`;
  }

  function renderRepresentatives() {
    const root = document.querySelector('#representativesPage'); if (!root) return;
    root.innerHTML = pageHero('Our Representatives','Forward UK in public office.','MPs, councillors and other elected representatives can be managed from the Control Room.') + `<section class="section"><div class="shell people-grid">${data.representatives.filter(r=>r.status==='Active').map(personCard).join('')}</div></section>`;
  }
  function renderLeadership() {
    const root = document.querySelector('#leadershipPage'); if (!root) return;
    root.innerHTML = pageHero('Leadership','The team leading Forward UK.','National leadership profiles, biographies and roles.') + `<section class="section"><div class="shell people-grid">${data.leadership.map(l=>personCard({...l, area:l.constituency, type:l.role, status:'Active'})).join('')}</div></section>`;
  }
  function personCard(p) {
    return `<article class="person-card"><div class="person-photo">${p.photo?`<img src="${escapeHtml(p.photo)}" alt="${escapeHtml(p.name)}">`:`${iconSvg('user')}`}</div><div><span class="pill">${escapeHtml(p.type||p.role)}</span><h3>${escapeHtml(p.name)}</h3><h4>${escapeHtml(p.role||'')}</h4><p>${escapeHtml(p.area||p.region||'')}</p><p>${escapeHtml(p.bio||'')}</p>${p.email?`<a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a>`:''}</div></article>`;
  }

  function renderBranches() {
    const root = document.querySelector('#branchesPage'); if (!root) return;
    root.innerHTML = pageHero('Local Branches','A national movement built locally.','Search by constituency, region, nation or branch name.') + `<section class="section"><div class="shell"><div class="branch-search"><input id="branchSearch" placeholder="Search branches, regions or constituencies"><button class="button button-primary">Search</button></div><div class="branch-grid" id="branchGrid"></div></div></section>`;
    const draw=(q='')=>{q=q.toLowerCase();document.querySelector('#branchGrid').innerHTML=data.branches.filter(b=>b.status==='Active' && [b.name,b.constituency,b.region,b.nation].join(' ').toLowerCase().includes(q)).map(b=>`<article class="branch-card"><div class="icon-bubble">${iconSvg('pin')}</div><h3>${escapeHtml(b.name)}</h3><p><strong>${escapeHtml(b.constituency)}</strong><br>${escapeHtml(b.region)} · ${escapeHtml(b.nation)}</p><p>${escapeHtml(b.description)}</p><p>${escapeHtml(b.meetings)}</p><a href="mailto:${escapeHtml(b.email)}">${escapeHtml(b.email)}</a></article>`).join('')};
    draw(); document.querySelector('#branchSearch').addEventListener('input',e=>draw(e.target.value));
  }

  function renderCampaign() {
    const root = document.querySelector('#campaignPage'); if (!root) return;
    const candidates = Number(data.stats.candidates || 0); const constituencies = Number(data.stats.constituencies || 0);
    root.innerHTML = `<section class="campaign-hero"><div class="shell"><img src="forward-uk-emblem.png" alt=""><div><div class="eyebrow light">GENERAL ELECTION</div><h1>Forward for Britain<br><span>${escapeHtml(data.settings.campaignYear)}</span></h1><p>${escapeHtml(data.hero.copy)}</p><div class="hero-actions"><a class="button button-white" href="membership.html">Join Free ${iconSvg('arrow')}</a><a class="button button-ghost" href="manifesto.html">Manifesto ${iconSvg('arrow')}</a></div></div></div></section><section class="section"><div class="shell stats-grid"><div class="stat-card"><strong>${fmt.format(candidates)}</strong><span>Candidates</span></div><div class="stat-card"><strong>${fmt.format(constituencies)}</strong><span>Constituencies</span></div><div class="stat-card"><strong>${fmt.format(data.stats.volunteers||0)}</strong><span>Volunteers</span></div><div class="stat-card"><strong>${fmt.format(data.stats.members||0)}</strong><span>Members</span></div></div></section><section class="section soft"><div class="shell"><div class="section-heading"><div class="eyebrow">CAMPAIGN PRIORITIES</div><h2>Our priorities for 2029</h2></div><div class="policy-grid">${data.policies.filter(p=>p.featured&&p.status==='Published').slice(0,4).map(p=>`<a class="policy-card" href="policies.html#${p.id}">${cardVisual(p)}<h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.summary)}</p><span>${iconSvg('arrow')}</span></a>`).join('')}</div></div></section>`;
  }

  function renderMembership() {
    const root = document.querySelector('#membershipPage'); if (!root) return;
    const session = localStorage.getItem('forwardUKMemberSession');
    root.innerHTML = pageHero('Free Membership','Join Forward UK for free.','Membership is free. Create your member profile, receive your member number and use the Member Area for updates, events and local information.') + `<section class="section"><div class="shell membership-layout"><div class="membership-form-panel"><div class="tabs"><button class="tab active" data-tab="join">Join Free</button><button class="tab" data-tab="signin">Member Sign In</button></div><div id="memberFormArea"></div></div><div><div class="membership-benefits"><div class="eyebrow">MEMBER AREA</div><h2>Everything in one place.</h2>${['Campaign updates','Local & national events','Member announcements','Latest manifesto','Policy briefings','Volunteer opportunities','Your local branch','Membership card'].map((x,i)=>`<div class="benefit"><span class="icon-bubble small">${iconSvg(i%2?'calendar':'badge')}</span><span>${x}</span></div>`).join('')}</div></div></div></section><section class="section soft" id="memberAreaSection"><div class="shell" id="memberPortal"></div></section>`;
    const showJoin=()=>{document.querySelector('#memberFormArea').innerHTML=`<form id="joinForm" class="stack-form"><div class="two-col"><label>First name<input required name="firstName"></label><label>Last name<input required name="lastName"></label></div><label>Email<input required type="email" name="email"></label><div class="two-col"><label>Date of birth<input required type="date" name="dob"></label><label>Postcode<input required name="postcode"></label></div><div class="two-col"><label>Town / City<input required name="city"></label><label>Nation<select name="nation"><option>England</option><option>Scotland</option><option>Wales</option><option>Northern Ireland</option></select></label></div><label>Constituency<input required name="constituency"></label><label>Phone (optional)<input name="phone"></label><label class="check"><input type="checkbox" name="volunteer"> I would like to hear about volunteering opportunities.</label><label class="check"><input type="checkbox" name="comms" checked> I would like campaign and member updates.</label><label class="check"><input required type="checkbox"> I agree to the membership rules and privacy notice.</label><button class="button button-primary" type="submit">Create Free Membership ${iconSvg('arrow')}</button></form>`;document.querySelector('#joinForm').addEventListener('submit',joinMember)};
    const showSignIn=()=>{document.querySelector('#memberFormArea').innerHTML=`<form id="signinForm" class="stack-form"><label>Email<input required type="email" name="email"></label><label>Member number<input required name="memberNumber" placeholder="FWUK-2029-000001"></label><button class="button button-primary">Sign in ${iconSvg('arrow')}</button><p class="form-note">Demo: member@example.com / FWUK-2029-000001</p></form>`;document.querySelector('#signinForm').addEventListener('submit',signInMember)};
    showJoin();
    document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');btn.dataset.tab==='join'?showJoin():showSignIn();}));
    if (session) renderMemberPortal(session);
  }

  function nextMemberNumber() {
    const year = data.settings.campaignYear || new Date().getFullYear();
    const number = String(data.members.length + 1).padStart(6,'0');
    return `FWUK-${year}-${number}`;
  }
  function joinMember(e) {
    e.preventDefault(); const fd = new FormData(e.currentTarget); const email = fd.get('email').trim().toLowerCase();
    if (data.members.some(m=>m.email.toLowerCase()===email)) return alert('A member with that email already exists.');
    const postcode=fd.get('postcode').trim(); const branch = data.branches.find(b=>postcode && b.status==='Active')?.name || data.branches[0]?.name || 'National Member Network';
    const member={id:'mem-'+Date.now(),memberNumber:nextMemberNumber(),firstName:fd.get('firstName').trim(),lastName:fd.get('lastName').trim(),email,dob:fd.get('dob'),postcode,city:fd.get('city').trim(),nation:fd.get('nation'),constituency:fd.get('constituency').trim(),phone:fd.get('phone').trim(),branch,joinDate:new Date().toISOString().slice(0,10),status:'Active',volunteer:fd.get('volunteer')==='on',comms:fd.get('comms')==='on',notes:''};
    data.members.push(member); data.stats.members=Number(data.stats.members||0)+1; store.save(data); localStorage.setItem('forwardUKMemberSession',member.id); alert(`Welcome to Forward UK. Your member number is ${member.memberNumber}`); renderMemberPortal(member.id); e.currentTarget.reset();
  }
  function signInMember(e) {
    e.preventDefault(); const fd=new FormData(e.currentTarget); const m=data.members.find(x=>x.email.toLowerCase()===fd.get('email').trim().toLowerCase() && x.memberNumber.toUpperCase()===fd.get('memberNumber').trim().toUpperCase());
    if(!m) return alert('Member details not found.'); localStorage.setItem('forwardUKMemberSession',m.id); renderMemberPortal(m.id);
  }
  function renderMemberPortal(id) {
    const m=data.members.find(x=>x.id===id); const portal=document.querySelector('#memberPortal'); if(!portal || !m) return;
    const branch=data.branches.find(b=>b.name===m.branch)||data.branches[0]; const memberAnnouncements=data.announcements.filter(a=>a.audience==='Members'||a.audience==='Public').slice(0,3);
    portal.innerHTML=`<div class="section-heading split"><div><div class="eyebrow">MEMBER AREA</div><h2>Welcome, ${escapeHtml(m.firstName)}.</h2></div><button id="memberSignOut" class="button button-outline">Sign out</button></div><div class="member-dashboard"><div class="digital-card"><div class="digital-card-top"><img src="forward-uk-logo.png" alt="Forward UK"><span>${escapeHtml(m.status)}</span></div><div><small>MEMBER</small><h3>${escapeHtml(m.firstName)} ${escapeHtml(m.lastName)}</h3><p>${escapeHtml(m.memberNumber)}</p></div><div class="digital-card-foot"><span>Joined ${niceDate(m.joinDate)}</span><span>${escapeHtml(m.constituency)}</span></div></div><div class="member-info-grid"><div><span>Local branch</span><strong>${escapeHtml(branch?.name||m.branch)}</strong></div><div><span>Constituency</span><strong>${escapeHtml(m.constituency)}</strong></div><div><span>Membership</span><strong>${escapeHtml(m.status)}</strong></div><div><span>Updates</span><strong>${m.comms?'On':'Off'}</strong></div></div></div><div class="member-content-grid"><div class="member-box"><h3>Member announcements</h3>${memberAnnouncements.map(a=>`<article><span class="pill">${escapeHtml(a.importance)}</span><h4>${escapeHtml(a.title)}</h4><p>${escapeHtml(a.body)}</p></article>`).join('')}</div><div class="member-box"><h3>Upcoming events</h3>${data.events.slice(0,3).map(e=>`<article><h4>${escapeHtml(e.title)}</h4><p>${niceDate(e.date)} · ${escapeHtml(e.location)}</p></article>`).join('')}</div><div class="member-box"><h3>Latest manifesto</h3><p>${escapeHtml((data.manifestos.find(x=>x.featured)||data.manifestos[0])?.title||'')}</p><a href="manifesto.html">Open manifesto ${iconSvg('arrow')}</a></div><div class="member-box" id="volunteer"><h3>Get involved</h3><p>${m.volunteer?'You are opted in for volunteering opportunities.':'You can update your volunteering preference through the Control Room in this demo.'}</p><a href="events.html">Find events ${iconSvg('arrow')}</a></div></div>`;
    document.querySelector('#memberSignOut').addEventListener('click',()=>{localStorage.removeItem('forwardUKMemberSession');portal.innerHTML='<div class="empty-state">You have signed out. Use the form above to sign in again.</div>';});
  }

  function pageHero(title, subtitle, copy) {
    return `<section class="page-hero"><div class="shell"><div class="eyebrow">FORWARD UK</div><h1>${escapeHtml(title)}</h1><h2>${escapeHtml(subtitle)}</h2><p>${escapeHtml(copy)}</p></div></section>`;
  }

  function setupCountUp() {
    const els=[...document.querySelectorAll('[data-count]')]; if(!els.length) return;
    const obs=new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting){const el=en.target,target=Number(el.dataset.count||0),start=performance.now(),dur=900;const tick=(now)=>{const p=Math.min(1,(now-start)/dur);el.textContent=fmt.format(Math.floor(target*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(tick);};requestAnimationFrame(tick);obs.unobserve(el);}}),{threshold:.4});els.forEach(el=>obs.observe(el));
  }

  function init() {
    data = store.get(); injectChrome(); renderHome(); renderPolicies(); renderManifestos(); renderNews(); renderEvents(); renderRepresentatives(); renderLeadership(); renderBranches(); renderCampaign(); renderMembership();
  }
  window.addEventListener('forwarduk:data', e=>{data=e.detail; init();});
  document.addEventListener('DOMContentLoaded', init);
})();
