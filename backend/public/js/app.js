// ================= CONFIG =================
// Replace with your teammate's deployed backend URL.
const API_BASE = "";
const LOGO = "assets/logo.jpg";
const STORE_KEY = "manzil_saved_v1";
const USERS_KEY = "manzil_users_v1";
const SESSION_KEY = "manzil_session_v1";

// ================= HELPERS =================
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const ICONS = {
  arrow: '<path d="M5 12h14M13 5l7 7-7 7"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/>',
  route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>',
  file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  printer: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
  play: '<path d="M8 5v14l11-7z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'
};
function icon(name, cls = "w-5 h-5") {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}
function paintIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach(el => { el.innerHTML = icon(el.dataset.icon, el.dataset.cls || "w-5 h-5"); });
}

const PRIORITY_CLASS = { "Critical": "p-critical", "Important": "p-important", "Nice-to-have": "p-nice" };
const ytUrl = q => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q + " tutorial for beginners");
const googleUrl = q => "https://www.google.com/search?q=" + encodeURIComponent(q + " free course");
const resourceUrl = r => r.type === "video" ? ytUrl(r.name) : googleUrl(r.name);

const SKILL_DICTIONARY = ["Excel","SQL","Python","Power BI","Tableau","Statistics","Communication","Data Visualization",
  "Pandas","Machine Learning","JavaScript","HTML","CSS","React","Node.js","Git","Java","C++","Figma","Photoshop","Canva",
  "Marketing","SEO","Social Media","Content Writing","Accounting","Customer Service","Teamwork","Public Speaking",
  "Leadership","Project Management","Problem Solving","Research","Linux","Networking","Cybersecurity","Word","PowerPoint",
  "Sales","Negotiation","Time Management","Translation","Data Entry","Google Sheets","Teaching","Agriculture","Soil Science"];
function extractSkills(text) {
  return SKILL_DICTIONARY.filter(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp("(^|[^A-Za-z0-9])" + escaped + "($|[^A-Za-z0-9])", "i").test(text);
  });
}

const SKILLS = [
  { name: "SQL", area: "Data", hint: "Start with SELECT, WHERE, GROUP BY and JOIN." },
  { name: "Excel", area: "Data", hint: "Learn formulas, pivot tables and lookups." },
  { name: "Python", area: "Tech", hint: "Variables, loops, then pandas for data." },
  { name: "Data Visualization", area: "Data", hint: "Pick the right chart and tell one clear story per chart." },
  { name: "Statistics", area: "Data", hint: "Mean, median, spread and correlation first." },
  { name: "HTML & CSS", area: "Tech", hint: "Build one page from scratch before frameworks." },
  { name: "JavaScript", area: "Tech", hint: "Functions, arrays, and fetching data from an API." },
  { name: "Digital Marketing", area: "Business", hint: "Social media, SEO basics and one small test campaign." },
  { name: "Communication", area: "Career", hint: "Write clear emails and explain one idea in two minutes." },
  { name: "Resume Writing", area: "Career", hint: "Use measurable results: numbers, time saved, money earned." },
  { name: "Graphic Design", area: "Design", hint: "Colour, spacing and typography, then try Canva or Figma." },
  { name: "Agriculture Basics", area: "Agriculture", hint: "Soil health, irrigation and crop calendars." }
];
const PLATFORMS = [
  { name: "freeCodeCamp", url: "https://www.freecodecamp.org", desc: "Coding courses for web development, data and more." },
  { name: "Kaggle Learn", url: "https://www.kaggle.com/learn", desc: "Short hands-on courses for Python, SQL and data." },
  { name: "Khan Academy", url: "https://www.khanacademy.org", desc: "Maths, science and computing lessons for every level." },
  { name: "Microsoft Learn", url: "https://learn.microsoft.com", desc: "Free paths for Power BI, Office and cloud skills." },
  { name: "Google Digital Garage", url: "https://learndigital.withgoogle.com/digitalgarage", desc: "Free courses in digital marketing and online business." }
];

const memStore = {};
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return memStore[k] ?? null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { memStore[k] = v; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { delete memStore[k]; } }
};
function loadSaved() { try { return JSON.parse(store.get(STORE_KEY)) || []; } catch (e) { return []; } }
function saveAll(list) { try { store.set(STORE_KEY, JSON.stringify(list)); } catch (e) {} }
function countItems(d) { return (d.roadmap || []).reduce((n, w) => n + (w.tasks || []).length + 1, 0); }

// ================= ACCOUNTS =================
// PRODUCTION NOTE: these functions store accounts in the browser only.
// Before real users sign up, replace them with calls to your backend
// (e.g. POST /api/signup and POST /api/login) so passwords are stored securely on the server.
function loadUsers() { try { return JSON.parse(store.get(USERS_KEY)) || {}; } catch (e) { return {}; } }
function saveUsers(u) { try { store.set(USERS_KEY, JSON.stringify(u)); } catch (e) {} }
function getSession() { try { return JSON.parse(store.get(SESSION_KEY)); } catch (e) { return null; } }
function hashPw(pw) { let h = 5381; for (const c of pw) h = ((h << 5) + h + c.charCodeAt(0)) | 0; return "h" + (h >>> 0).toString(36); }

// ================= ROUTER =================
const PRIVATE = ["dashboard", "build", "progress", "resources"];
let current = null;
let pendingJob = null, pendingSaved = null, pendingNext = null, authMode = "login";

function go(page, opts = {}) {
  const session = getSession();
  if (!session) {
    if (PRIVATE.includes(page)) pendingNext = page;
    return showPage("login");
  }
  if (page === "login") return go(opts.next || pendingNext || "dashboard");
  pendingNext = null;
  if (page === "build") {
    pendingJob = opts.job || null;
    pendingSaved = opts.saved || null;
  }
  showPage(page);
}

function showPage(name) {
  document.querySelectorAll(".page").forEach(s => s.classList.toggle("hidden", s.id !== "page-" + name));
  renderNav(name);
  window.scrollTo(0, 0);
  if (name === "login") setAuthTab("login");
  if (name === "dashboard") renderDashboard();
  if (name === "build") openBuild();
  if (name === "progress") renderProgress();
  if (name === "resources") renderResources();
  paintIcons();
}

document.addEventListener("click", e => {
  const el = e.target.closest("[data-go],[data-action],[data-quick],[data-new],[data-step-dot],[data-auth-tab]");
  if (!el) return;
  if (el.dataset.action === "logout") { store.del(SESSION_KEY); go("login"); return; }
  if (el.dataset.go) { go(el.dataset.go, { job: el.dataset.job, saved: el.dataset.saved }); return; }
  if (el.dataset.quick) { $("job").value = el.dataset.quick; $("formError").textContent = ""; return; }
  if (el.dataset.new !== undefined) { startNewBuild(); return; }
  if (el.dataset.stepDot) { setStep(Number(el.dataset.stepDot)); return; }
  if (el.dataset.authTab) { setAuthTab(el.dataset.authTab); return; }
});

function renderNav(active) {
  const s = getSession();
  if (!s) {
    $("nav").innerHTML = `
      <div class="max-w-7xl mx-auto px-6 h-[4.25rem] flex items-center">
        <span class="flex items-center gap-3">
          <img src="${LOGO}" alt="" class="h-9 w-9 rounded-lg object-cover ring-1 ring-white/20">
          <span class="text-white font-extrabold text-xl">Manzil</span>
        </span>
      </div>`;
    return;
  }
  const links = [["dashboard", "Dashboard"], ["build", "Build roadmap"], ["progress", "My progress"], ["resources", "Resources"]];
  $("nav").innerHTML = `
    <div class="max-w-7xl mx-auto px-5 h-[4.25rem] flex items-center justify-between gap-4">
      <button data-go="dashboard" class="flex items-center gap-3 shrink-0">
        <img src="${LOGO}" alt="" class="h-9 w-9 rounded-lg object-cover ring-1 ring-white/20">
        <span class="text-white font-extrabold text-xl">Manzil</span>
      </button>
      <nav class="flex flex-wrap gap-1 justify-center">
        ${links.map(([p, l]) => `<button data-go="${p}" class="nav-link ${p === active ? "nav-active" : ""}">${l}</button>`).join("")}
      </nav>
      <div class="flex items-center gap-3 shrink-0">
        <span class="hidden sm:flex h-9 w-9 rounded-full bg-sky-300 text-navy-900 font-extrabold items-center justify-center" style="color:#0a1a33">${esc((s.name || "?")[0].toUpperCase())}</span>
        <button data-action="logout" class="nav-link flex items-center gap-2">${icon("logout", "w-4 h-4")} Log out</button>
      </div>
    </div>`;
}

// ================= AUTH =================
function setAuthTab(tab) {
  authMode = tab === "signup" ? "signup" : "login";
  document.querySelectorAll("[data-auth-tab]").forEach(b => b.classList.toggle("active", b.dataset.authTab === authMode));
  $("nameRow").classList.toggle("hidden", authMode === "login");
  $("authTitle").textContent = authMode === "login" ? "Log in" : "Create account";
  $("authSubmit").textContent = authMode === "login" ? "Log in" : "Create account";
  $("authPw").setAttribute("autocomplete", authMode === "login" ? "current-password" : "new-password");
  $("authError").textContent = "";
}

$("authForm").addEventListener("submit", e => {
  e.preventDefault();
  try {
  const email = $("authEmail").value.trim().toLowerCase();
  const pw = $("authPw").value;
  const name = $("authName").value.trim();
  const users = loadUsers();
  let err = "";
  if (!email.includes("@")) err = "Enter a valid email address.";
  else if (pw.length < 6) err = "Password must be at least 6 characters.";
  else if (authMode === "signup") {
    if (!name) err = "Enter your full name.";
    else if (users[email]) err = "An account with this email already exists. Please log in.";
    else { users[email] = { name, hash: hashPw(pw) }; saveUsers(users); signIn(email, name); }
  } else {
    const u = users[email];
    if (!u || u.hash !== hashPw(pw)) err = "Email or password is incorrect.";
    else signIn(email, u.name);
  }
  $("authError").textContent = err;
  } catch (ex) {
    $("authError").textContent = "Something went wrong. Please try again.";
  }
});

function signIn(email, name) {
  store.set(SESSION_KEY, JSON.stringify({ email, name }));
  const next = pendingNext || "dashboard";
  pendingNext = null;
  $("authForm").reset();
  go(next);
}

// ================= DASHBOARD =================
function pctOf(item) {
  const total = countItems(item.data);
  const done = Object.values(item.checked || {}).filter(Boolean).length;
  return { total, done, pct: total ? Math.round(done / total * 100) : 0 };
}
function statCard(icName, value, label) {
  return `<div class="surface lift p-6 flex items-center gap-5">
    <span class="h-12 w-12 rounded-xl bg-blue-700 text-white flex items-center justify-center">${icon(icName, "w-6 h-6")}</span>
    <div><div class="text-3xl font-extrabold page-title">${value}</div><div class="text-base font-bold text-slate-800">${label}</div></div>
  </div>`;
}
function renderDashboard() {
  const s = getSession();
  $("greet").textContent = `Welcome, ${(s && s.name ? s.name : "").split(" ")[0]}`;
  const list = loadSaved();
  $("dashEmpty").classList.toggle("hidden", list.length > 0);
  $("dashFull").classList.toggle("hidden", list.length === 0);
  if (!list.length) return;

  const stats = list.map(pctOf);
  const totalDone = stats.reduce((n, x) => n + x.done, 0);
  const avg = Math.round(stats.reduce((n, x) => n + x.pct, 0) / list.length);
  $("dashStats").innerHTML = statCard("route", list.length, "Saved roadmaps")
    + statCard("check-circle", totalDone, "Items completed")
    + statCard("chart", avg + "%", "Average progress");

  const latest = list[0];
  const p = pctOf(latest);
  $("activeCard").innerHTML = `
    <div class="font-extrabold text-2xl page-title">${esc(latest.data.job_title)}</div>
    <p class="text-slate-800 mt-1 text-base">${esc(latest.data.roadmap.length)} weeks · ${esc(latest.data.match_score)}% match at start</p>
    <div class="h-3 bg-slate-200 rounded-full mt-6 overflow-hidden"><div class="h-3 rounded-full bg-blue-700" style="width:${p.pct}%"></div></div>
    <div class="flex justify-between text-base font-bold mt-2"><span class="text-slate-900">${p.done} of ${p.total} items</span><span class="text-blue-800">${p.pct}%</span></div>
    <button data-go="build" data-saved="${esc(latest.id)}" class="btn btn-primary mt-7">Continue roadmap <span data-icon="arrow" data-cls="w-4 h-4"></span></button>`;

  const next = [];
  for (const w of latest.data.roadmap) {
    (w.tasks || []).forEach((t, i) => {
      if (!latest.checked[`t-${w.week}-${i}`] && next.length < 4) next.push({ week: w.week, text: t });
    });
  }
  $("nextUp").innerHTML = next.length
    ? next.map(n => `<li class="flex gap-3 items-start"><span class="pill p-info shrink-0">Week ${n.week}</span><span class="font-semibold text-base">${esc(n.text)}</span></li>`).join("")
    : `<li class="font-bold text-green-800 text-base">All tasks in this roadmap are complete.</li>`;
}

// ================= BUILD ROADMAP =================
let step = 1;
let chart = null;
const RING_LEN = 326.7;

function openBuild() {
  if (pendingSaved) {
    const found = loadSaved().find(x => x.id === pendingSaved);
    pendingSaved = null;
    if (found) {
      current = found;
      $("wizard").classList.add("hidden");
      $("results").classList.remove("hidden");
      showResults(found.data);
      return;
    }
  }
  if (pendingJob) { $("job").value = pendingJob; pendingJob = null; }
  startNewBuild();
}

function startNewBuild() {
  $("results").classList.add("hidden");
  $("notice").classList.add("hidden");
  $("wizard").classList.remove("hidden");
  $("formError").textContent = "";
  setStep(1);
}

function setStep(n) {
  step = Math.min(3, Math.max(1, n));
  [1, 2, 3].forEach(i => $("step" + i).classList.toggle("hidden", i !== step));
  document.querySelectorAll("[data-step-dot]").forEach(d => {
    const i = Number(d.dataset.stepDot);
    d.className = "step-dot " + (i === step ? "active" : i < step ? "done" : "");
    d.innerHTML = i < step ? "✓" : String(i);
  });
  $("backBtn").classList.toggle("invisible", step === 1);
  $("nextBtn").innerHTML = step === 3 ? `Generate roadmap ${icon("arrow", "w-4 h-4")}` : `Next ${icon("arrow", "w-4 h-4")}`;
  $("formError").textContent = "";
}

function validateStep(n) {
  if (n === 1 && !$("job").value.trim()) return "Enter a target job to continue.";
  if (n === 3) {
    const h = parseInt($("hours").value, 10), w = parseInt($("weeks").value, 10);
    if (!(h >= 1 && h <= 40)) return "Hours per week must be between 1 and 40.";
    if (!(w >= 1 && w <= 16)) return "Weeks must be between 1 and 16.";
  }
  return "";
}

$("nextBtn").addEventListener("click", () => {
  const err = validateStep(step);
  $("formError").textContent = err;
  if (err) return;
  if (step < 3) setStep(step + 1);
  else generate();
});
$("backBtn").addEventListener("click", () => setStep(step - 1));

function buildPayload() {
  const skills = $("skills").value.split(",").map(s => s.trim()).filter(Boolean);
  return {
    job: $("job").value.trim(),
    skills: skills.length ? skills : ["None"],
    level: $("level").value,
    hours_per_week: parseInt($("hours").value, 10),
    weeks: parseInt($("weeks").value, 10),
    language: $("language").value
  };
}

async function getRoadmap(payload) {
  const res = await fetch(API_BASE + "/api/roadmap", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Server responded with " + res.status);
  const data = await res.json();
  if (!data.skills || !data.roadmap) throw new Error("Unexpected response format");
  return data;
}

async function generate() {
  const payload = buildPayload();
  $("wizard").classList.add("hidden");
  $("results").classList.add("hidden");
  $("notice").classList.add("hidden");
  $("loading").classList.remove("hidden");
  let data;
  try {
    data = await getRoadmap(payload);
  } catch (err) {
    $("loading").classList.add("hidden");
    $("notice").textContent = "We could not create your roadmap right now. Please try again in a moment.";
    $("notice").classList.remove("hidden");
    $("wizard").classList.remove("hidden");
    return;
  }
  $("loading").classList.add("hidden");
  current = { id: Date.now().toString(36), data, checked: {}, createdAt: new Date().toISOString() };
  const list = loadSaved();
  list.unshift(current);
  saveAll(list.slice(0, 10));
  $("results").classList.remove("hidden");
  showResults(data);
}

$("extractBtn").addEventListener("click", () => {
  const text = $("cv").value.trim();
  if (!text) { $("cvMsg").textContent = "Paste your CV text first."; return; }
  const found = extractSkills(text);
  $("cvMsg").textContent = found.length ? `Detected ${found.length} skills.` : "No known skills detected.";
  if (found.length) $("skills").value = found.join(", ");
});

$("printBtn").addEventListener("click", () => window.print());

function gapRow(s) {
  const gap = Math.max(0, s.required_level - s.current_level);
  const pct = Math.round(s.current_level / s.required_level * 100);
  return `<div class="rounded-xl border border-slate-300 p-4 bg-white">
    <div class="flex justify-between items-center gap-3">
      <div class="font-extrabold text-base page-title">${esc(s.name)}</div>
      <span class="pill ${PRIORITY_CLASS[s.priority] || ""}">${esc(s.priority)}</span>
    </div>
    <div class="h-2 bg-slate-200 rounded-full mt-3 overflow-hidden"><div class="h-2 rounded-full bg-blue-700" style="width:${pct}%"></div></div>
    <div class="text-sm font-bold text-slate-800 mt-2">Level ${esc(s.current_level)} of ${esc(s.required_level)}${gap ? " · gap of " + gap : " · covered"}</div>
  </div>`;
}

function weekItem(w) {
  const tasks = (w.tasks || []).map((t, i) => `
    <label class="flex gap-3 items-start text-base text-slate-900 cursor-pointer">
      <input type="checkbox" data-key="t-${w.week}-${i}" class="mt-1 h-4 w-4 accent-blue-700">
      <span>${esc(t)}</span>
    </label>`).join("");
  const links = (w.resources || []).map(r =>
    `<a href="${resourceUrl(r)}" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-300">${r.type === "video" ? icon("play", "w-3 h-3") : icon("book", "w-3 h-3")}${esc(r.name)}</a>`
  ).join("");
  return `<div class="relative">
    <span class="absolute -left-12 top-5 h-9 w-9 rounded-full bg-blue-700 text-white text-sm font-extrabold flex items-center justify-center ring-4 ring-slate-100">${esc(w.week)}</span>
    <div class="surface lift p-6">
      <h4 class="font-extrabold text-lg page-title">${esc(w.focus)}</h4>
      <div class="mt-4 space-y-3">${tasks}</div>
      <div class="mt-5 flex flex-wrap gap-2">${links}</div>
      <label class="mt-5 flex gap-3 items-start rounded-xl bg-blue-50 border border-blue-300 p-4 text-base cursor-pointer">
        <input type="checkbox" data-key="m-${w.week}" class="mt-1 h-4 w-4 accent-blue-700">
        <span><span class="font-extrabold text-blue-950">Milestone:</span> <span class="text-slate-900">${esc(w.milestone)}</span></span>
      </label>
    </div>
  </div>`;
}

function drawRadar(skills) {
  if (typeof Chart === "undefined") return;
  if (chart) chart.destroy();
  chart = new Chart($("radar"), {
    type: "radar",
    data: {
      labels: skills.map(s => s.name),
      datasets: [
        { label: "Required", data: skills.map(s => s.required_level), borderColor: "#1d4ed8", backgroundColor: "rgba(29,78,216,0.14)", borderWidth: 2 },
        { label: "Your level", data: skills.map(s => s.current_level), borderColor: "#0284c7", backgroundColor: "rgba(2,132,199,0.25)", borderWidth: 2 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { r: { min: 0, max: 5, ticks: { stepSize: 1, display: false, color: "#0b1224" }, grid: { color: "#94a3b8" }, angleLines: { color: "#94a3b8" }, pointLabels: { font: { size: 13, weight: "700" }, color: "#0b1224" } } },
      plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8, color: "#0b1224", font: { weight: "700", size: 13 } } } }
    }
  });
}

function updateProgress() {
  const total = countItems(current.data);
  const done = Object.values(current.checked).filter(Boolean).length;
  const pct = total ? Math.round(done / total * 100) : 0;
  $("progressPct").textContent = pct + "%";
  $("progressBar").style.width = pct + "%";
  $("progressText").textContent = `${done} of ${total} items completed`;
}

function persist() {
  const list = loadSaved();
  const i = list.findIndex(x => x.id === current.id);
  if (i >= 0) { list[i] = current; saveAll(list); }
}

function setScore(score) {
  const s = Math.min(100, Math.max(0, Number(score) || 0));
  $("scoreNum").textContent = s + "%";
  $("ringArc").style.strokeDashoffset = RING_LEN * (1 - s / 100);
}

function showResults(d) {
  $("rTitle").textContent = d.job_title;
  $("summary").textContent = d.summary;
  setScore(0);
  requestAnimationFrame(() => setScore(d.match_score));
  drawRadar(d.skills);
  $("gaps").innerHTML = d.skills.map(gapRow).join("");
  $("roadmap").innerHTML = d.roadmap.map(weekItem).join("");
  document.querySelectorAll("#roadmap [data-key]").forEach(cb => { cb.checked = !!(current && current.checked[cb.dataset.key]); });
  $("project").innerHTML = `<div class="font-extrabold text-base page-title">${esc(d.project.title)}</div><p class="text-base text-slate-900 mt-1.5 leading-relaxed">${esc(d.project.description)}</p>`;
  $("tips").innerHTML = (d.interview_tips || []).map(t => `<li class="flex gap-3">${icon("check", "w-5 h-5 mt-0.5 text-blue-700 shrink-0")}<span>${esc(t)}</span></li>`).join("");
  updateProgress();
  paintIcons($("tips"));
  $("results").scrollIntoView({ behavior: "smooth", block: "start" });
}

$("roadmap").addEventListener("change", e => {
  const cb = e.target;
  if (!cb.matches("[data-key]") || !current) return;
  current.checked[cb.dataset.key] = cb.checked;
  persist();
  updateProgress();
});

// ================= PROGRESS =================
function roadmapCard(item) {
  const p = pctOf(item);
  const date = new Date(item.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  return `<div class="surface lift p-6 flex flex-col gap-5">
    <div class="flex justify-between items-start gap-4">
      <div>
        <h3 class="font-extrabold text-xl page-title">${esc(item.data.job_title)}</h3>
        <p class="text-sm font-bold text-slate-800 mt-1">Saved ${esc(date)} · ${esc(item.data.roadmap.length)} weeks</p>
      </div>
      <span class="text-2xl font-extrabold text-blue-800">${p.pct}%</span>
    </div>
    <div class="h-2.5 bg-slate-200 rounded-full overflow-hidden"><div class="h-2.5 rounded-full bg-blue-700" style="width:${p.pct}%"></div></div>
    <p class="text-base font-bold text-slate-900">${p.done} of ${p.total} items completed</p>
    <div class="flex gap-3 mt-auto">
      <button data-go="build" data-saved="${esc(item.id)}" class="btn btn-primary text-sm py-2.5">Continue <span data-icon="arrow" data-cls="w-4 h-4"></span></button>
      <button data-del="${esc(item.id)}" class="btn btn-danger text-sm py-2.5">${icon("trash", "w-4 h-4")} Delete</button>
    </div>
  </div>`;
}
function renderProgress() {
  const list = loadSaved();
  $("empty").classList.toggle("hidden", list.length > 0);
  $("dash").classList.toggle("hidden", list.length === 0);
  $("clearAll").classList.toggle("hidden", list.length === 0);
  if (!list.length) return;
  const stats = list.map(pctOf);
  const totalDone = stats.reduce((n, s) => n + s.done, 0);
  const avg = Math.round(stats.reduce((n, s) => n + s.pct, 0) / list.length);
  $("stats").innerHTML = statCard("route", list.length, "Saved roadmaps")
    + statCard("check-circle", totalDone, "Items completed")
    + statCard("chart", avg + "%", "Average progress");
  $("list").innerHTML = list.map(roadmapCard).join("");
  paintIcons($("list"));
}
$("list").addEventListener("click", e => {
  const btn = e.target.closest("[data-del]");
  if (!btn || !confirm("Delete this roadmap?")) return;
  saveAll(loadSaved().filter(x => x.id !== btn.dataset.del));
  renderProgress();
});
$("clearAll").addEventListener("click", () => {
  if (!confirm("Delete all saved roadmaps?")) return;
  saveAll([]);
  renderProgress();
});

// ================= RESOURCES =================
let activeArea = "All";
function paintChips() {
  document.querySelectorAll("#chips [data-area]").forEach(b => {
    const on = b.dataset.area === activeArea;
    b.className = "px-4 py-2 rounded-full text-sm font-bold border transition "
      + (on ? "bg-navy-900 text-white border-navy-900" : "bg-white text-slate-900 border-slate-400 hover:border-blue-700");
  });
}
function skillCard(s) {
  return `<div class="surface lift p-6 flex flex-col gap-4">
    <div class="flex justify-between items-center gap-2">
      <h3 class="font-extrabold text-xl page-title">${esc(s.name)}</h3>
      <span class="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 font-bold border border-blue-300">${esc(s.area)}</span>
    </div>
    <p class="text-base text-slate-900 leading-relaxed">${esc(s.hint)}</p>
    <div class="flex flex-wrap gap-2 mt-auto">
      <a href="${ytUrl(s.name)}" target="_blank" rel="noopener" class="text-sm font-bold px-3 py-2 rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-300">YouTube videos</a>
      <a href="${googleUrl(s.name)}" target="_blank" rel="noopener" class="text-sm font-bold px-3 py-2 rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-300">Free courses</a>
    </div>
  </div>`;
}
function renderResources() {
  const q = $("q").value.trim().toLowerCase();
  const list = SKILLS.filter(s =>
    (activeArea === "All" || s.area === activeArea) &&
    (!q || s.name.toLowerCase().includes(q) || s.hint.toLowerCase().includes(q)));
  $("grid").innerHTML = list.length ? list.map(skillCard)
    : '<p class="text-slate-900 font-bold col-span-full">No matches found.</p>';
}
const areas = ["All", ...new Set(SKILLS.map(s => s.area))];
$("chips").innerHTML = areas.map(a => `<button data-area="${esc(a)}" class="px-4 py-2 rounded-full text-sm font-bold border">${esc(a)}</button>`).join("");
$("chips").addEventListener("click", e => {
  const b = e.target.closest("[data-area]");
  if (!b) return;
  activeArea = b.dataset.area;
  paintChips();
  renderResources();
});
$("q").addEventListener("input", renderResources);
$("platforms").innerHTML = PLATFORMS.map(p => `
  <a href="${p.url}" target="_blank" rel="noopener" class="surface lift p-6 block">
    <h3 class="font-extrabold text-xl page-title">${esc(p.name)}</h3>
  </a>`).join("");

// ================= START =================
paintIcons();
paintChips();
renderResources();
setStep(1);
go(getSession() ? "dashboard" : "login");