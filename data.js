(() => {
  const DEFAULT_FORWARD_UK_DATA = {
    settings: {
      partyName: "Forward UK",
      slogan: "Forward for Britain",
      campaignYear: "2029",
      contactEmail: "hello@forwarduk.org",
      address: "United Kingdom",
      xHandle: "@ForwardUKHQ",
      instagram: "",
      facebook: "",
      youtube: "",
      tiktok: "",
      footerText: "Forward for Britain.",
      adminPin: "2029"
    },
    hero: {
      eyebrow: "GENERAL ELECTION CAMPAIGN",
      title: "FORWARD FOR BRITAIN",
      year: "2029",
      copy: "Stronger communities. Better public services. Secure borders. A brighter, fairer Britain with opportunity for everyone.",
      primaryLabel: "Join Free",
      primaryHref: "membership.html",
      secondaryLabel: "Read the Plan",
      secondaryHref: "manifesto.html"
    },
    stats: {
      members: 18420,
      mps: 8,
      councillors: 146,
      mayors: 1,
      branches: 92,
      candidates: 183,
      volunteers: 4260,
      constituencies: 183
    },
    homepageCards: [
      { id: "hc1", title: "Policies", icon: "document", copy: "Explore our plans for a stronger Britain.", href: "policies.html", image: "" },
      { id: "hc2", title: "Latest News", icon: "news", copy: "Keep up with our latest updates.", href: "news.html", image: "" },
      { id: "hc3", title: "Events", icon: "calendar", copy: "Join us across the country.", href: "events.html", image: "" },
      { id: "hc4", title: "Volunteer", icon: "people", copy: "Be part of the change in your community.", href: "membership.html#volunteer", image: "" },
      { id: "hc5", title: "Free Membership", icon: "badge", copy: "Join Forward UK for free and be part of the movement.", href: "membership.html", image: "" },
      { id: "hc6", title: "Local Branches", icon: "pin", copy: "Find your nearest Forward UK branch.", href: "branches.html", image: "" }
    ],
    policies: [
      { id: "p1", title: "Stronger Communities", category: "Communities", summary: "Safer streets, thriving local economies and a stronger sense of belonging.", body: "Forward UK backs visible neighbourhood policing, stronger town centres, local decision-making and practical support for community organisations.", commitments: "Neighbourhood policing|Town-centre renewal|More local decision-making", featured: true, status: "Published", icon: "people", image: "" },
      { id: "p2", title: "Better Public Services", category: "Public Services", summary: "A modern NHS, excellent schools and public services that work for people.", body: "Our approach focuses on access, standards, workforce planning and making everyday public services easier to use.", commitments: "Improve NHS access|Raise school standards|Cut avoidable bureaucracy", featured: true, status: "Published", icon: "heart", image: "" },
      { id: "p3", title: "Secure Borders", category: "Immigration", summary: "A controlled immigration system with clear rules, enforcement and integration.", body: "Forward UK supports a rules-based immigration system, effective border administration, enforcement against illegal working and stronger integration support.", commitments: "Clear migration rules|Effective enforcement|Stronger integration", featured: true, status: "Published", icon: "shield", image: "" },
      { id: "p4", title: "Opportunity for Everyone", category: "Economy", summary: "A growing economy, higher productivity and real opportunities across the UK.", body: "We want a pro-growth economy that backs businesses, rewards work, improves skills and spreads opportunity beyond the biggest cities.", commitments: "Back small businesses|Expand skills routes|Support regional growth", featured: true, status: "Published", icon: "chart", image: "" },
      { id: "p5", title: "Homes People Can Afford", category: "Housing", summary: "More homes, better planning and stronger protections for local communities.", body: "A housing programme should increase supply, prioritise good design and infrastructure, and make renting and buying more secure.", commitments: "Build more homes|Infrastructure first|Improve renting standards", featured: false, status: "Published", icon: "home", image: "" }
    ],
    manifestos: [
      { id: "m1", title: "Forward for Britain", year: "2029", subtitle: "A stronger country. A fairer future.", intro: "Our 2029 programme brings together practical plans for public services, communities, economic opportunity, secure borders and political renewal.", published: "2029-03-18", status: "Published", featured: true, pdf: "", cover: "forward-uk-campaign-banner.png", sections: "Economy|NHS & Care|Education|Immigration|Housing|Transport|Crime|Defence|Environment|Political Reform" },
      { id: "m2", title: "Local Government Programme", year: "2028", subtitle: "Power closer to people.", intro: "A programme for councils, local transport, high streets and community services.", published: "2028-11-02", status: "Published", featured: false, pdf: "", cover: "", sections: "Local Growth|Transport|Planning|Community Safety" }
    ],
    news: [
      { id: "n1", title: "Forward UK launches national campaign for 2029", subtitle: "A new chapter for a stronger, fairer Britain.", body: "Forward UK has launched its 2029 national campaign, setting out an initial programme focused on stronger communities, public services, border administration and opportunity.", category: "Campaign", author: "Forward UK", date: "2029-03-20", status: "Published", featured: true, image: "forward-uk-campaign-banner.png" },
      { id: "n2", title: "Thousands join Forward UK across the country", subtitle: "Membership continues to grow ahead of the campaign.", body: "New members have joined local branches and national online events as Forward UK expands its organisation.", category: "Party News", author: "Membership Team", date: "2029-03-12", status: "Published", featured: true, image: "" },
      { id: "n3", title: "New public services policy briefing published", subtitle: "A focus on access, standards and delivery.", body: "The party has published a new briefing outlining proposals for NHS access, school standards and simpler public services.", category: "Policy", author: "Policy Unit", date: "2029-03-05", status: "Published", featured: true, image: "" }
    ],
    events: [
      { id: "e1", title: "Forward for Britain Campaign Launch", type: "National", date: "2029-04-07", start: "18:30", end: "20:00", location: "Birmingham", address: "Central Birmingham", constituency: "Birmingham", region: "West Midlands", description: "National campaign launch with speeches, policy presentations and member briefings.", audience: "Public", status: "Upcoming", image: "" },
      { id: "e2", title: "South West Members Forum", type: "Member Meeting", date: "2029-04-13", start: "14:00", end: "16:00", location: "Exeter", address: "Exeter City Centre", constituency: "Exeter", region: "South West", description: "A regional forum for members, local branches and campaign teams.", audience: "Members Only", status: "Upcoming", image: "" },
      { id: "e3", title: "Public Services Policy Launch", type: "Policy Launch", date: "2029-04-21", start: "10:30", end: "12:00", location: "Manchester", address: "Manchester City Centre", constituency: "Manchester", region: "North West", description: "Launch of Forward UK's public services policy package.", audience: "Public", status: "Upcoming", image: "" }
    ],
    representatives: [
      { id: "r1", name: "Mason Sanders", role: "Leader", type: "MP", area: "West Somerset", region: "South West", bio: "Leader of Forward UK and Member of Parliament for West Somerset.", email: "leader@forwarduk.org", status: "Active", photo: "" },
      { id: "r2", name: "Amelia Hart", role: "Deputy Leader", type: "MP", area: "Northbridge", region: "North West", bio: "Deputy Leader with a focus on public services and local government.", email: "amelia.hart@forwarduk.org", status: "Active", photo: "" },
      { id: "r3", name: "Daniel Mercer", role: "Local Government Spokesperson", type: "Councillor", area: "Riverside Ward", region: "West Midlands", bio: "Councillor and spokesperson for local government and communities.", email: "daniel.mercer@forwarduk.org", status: "Active", photo: "" }
    ],
    leadership: [
      { id: "l1", name: "Mason Sanders", role: "Leader", constituency: "West Somerset", bio: "Leading Forward UK's 2029 campaign around public services, opportunity, communities and political reform.", quote: "Forward for Britain.", photo: "" },
      { id: "l2", name: "Amelia Hart", role: "Deputy Leader", constituency: "Northbridge", bio: "Responsible for organisation, public services and local government strategy.", quote: "Strong communities need public services that work.", photo: "" },
      { id: "l3", name: "Noah Bennett", role: "Party Chair", constituency: "", bio: "Oversees party organisation, membership and local branches.", quote: "A national movement built locally.", photo: "" }
    ],
    branches: [
      { id: "b1", name: "Somerset Forward", constituency: "West Somerset", region: "South West", nation: "England", chair: "Alex Morgan", email: "somerset@forwarduk.org", meetings: "First Thursday of each month", description: "Local branch covering communities across West Somerset.", status: "Active", image: "" },
      { id: "b2", name: "Birmingham Central Forward", constituency: "Birmingham", region: "West Midlands", nation: "England", chair: "Priya Shah", email: "birmingham@forwarduk.org", meetings: "Second Tuesday of each month", description: "Campaigning and policy events across central Birmingham.", status: "Active", image: "" },
      { id: "b3", name: "Glasgow Forward", constituency: "Glasgow", region: "Scotland", nation: "Scotland", chair: "Ewan Fraser", email: "glasgow@forwarduk.org", meetings: "Last Wednesday of each month", description: "Forward UK members and supporters across Glasgow.", status: "Active", image: "" }
    ],
    announcements: [
      { id: "a1", title: "2029 Manifesto now published", audience: "Public", importance: "High", start: "2029-03-18", end: "2029-05-03", body: "Read Forward UK's 2029 manifesto: Forward for Britain.", pinned: true },
      { id: "a2", title: "Member briefing this Sunday", audience: "Members", importance: "Normal", start: "2029-04-01", end: "2029-04-08", body: "Members can join the national online campaign briefing from the Member Area.", pinned: false }
    ],
    members: [
      { id: "mem-demo", memberNumber: "FWUK-2029-000001", firstName: "Demo", lastName: "Member", email: "member@example.com", dob: "2000-01-01", postcode: "SW1A 1AA", city: "London", nation: "England", constituency: "Westminster", phone: "", branch: "Birmingham Central Forward", joinDate: "2029-01-10", status: "Active", volunteer: true, comms: true, notes: "Demo account" }
    ]
  };

  window.DEFAULT_FORWARD_UK_DATA = DEFAULT_FORWARD_UK_DATA;
  window.ForwardStore = {
    key: "forwardUKDataV1",
    clone(value) { return JSON.parse(JSON.stringify(value)); },
    get() {
      const raw = localStorage.getItem(this.key);
      if (!raw) {
        const fresh = this.clone(DEFAULT_FORWARD_UK_DATA);
        localStorage.setItem(this.key, JSON.stringify(fresh));
        return fresh;
      }
      try { return JSON.parse(raw); }
      catch (e) {
        const fresh = this.clone(DEFAULT_FORWARD_UK_DATA);
        localStorage.setItem(this.key, JSON.stringify(fresh));
        return fresh;
      }
    },
    save(data) {
      localStorage.setItem(this.key, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent("forwarduk:data", { detail: data }));
    },
    reset() {
      const fresh = this.clone(DEFAULT_FORWARD_UK_DATA);
      this.save(fresh);
      return fresh;
    }
  };
})();
