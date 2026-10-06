/* 대한미용경영자협회 홈페이지 공통 스크립트
   - 협회 기본 정보(SITE)와 게시글(POSTS)만 고치면 전 페이지에 반영됩니다. */

const SITE = {
  name: "대한미용경영자협회",
  en: "KOREA BEAUTY BUSINESS MANAGEMENT ASSOCIATION",
  chair: "조혜연",
  address: "주소 입력 예정",
  tel: "대표전화 입력 예정",
  fax: "팩스 입력 예정",
  email: "이메일 입력 예정",
  bank: "입금 계좌 입력 예정",   // 수강료 입금 계좌 (예: ○○은행 000-000-000000 대한미용경영자협회)
};

const MENU = [
  { t: "협회소개", h: "about.html", s: [["이사장 인사말", "greeting.html"], ["설립목적·비전", "about.html#vision"], ["주요사업", "about.html#business"], ["조직도", "about.html#org"], ["오시는 길", "about.html#location"]] },
  { t: "경영지원", h: "support.html", s: [["경영 컨설팅", "support.html#consult"], ["세무·노무 상담", "support.html#tax"], ["법률·분쟁 자문", "support.html#law"], ["창업·점포 지원", "support.html#startup"]] },
  { t: "교육·세미나", h: "support.html#edu", s: [["경영자 아카데미", "support.html#edu"], ["세미나 일정", "support.html#schedule"]] },
  { t: "협회소식", h: "news.html", s: [["공지사항", "news.html?c=공지사항"], ["협회뉴스", "news.html?c=협회뉴스"], ["경영칼럼", "news.html?c=경영칼럼"], ["자료실", "news.html?c=자료실"]] },
  { t: "회원안내", h: "join.html", s: [["가입안내", "join.html#guide"], ["회원혜택", "join.html#benefit"], ["가입·문의 신청", "join.html#apply"]] },
];

/* 게시글: 아래는 화면 구성을 위한 예시 문안입니다. 실제 소식으로 교체하세요. */
const POSTS = [
  { c: "공지사항", t: "대한미용경영자협회 홈페이지를 열었습니다", d: "2026-10-03", s: "미용 경영자 여러분과 더 가까이 소통하기 위해 협회 공식 홈페이지를 열었습니다. 협회 소식과 교육 일정, 경영 자료를 이곳에서 안내해 드립니다." },
  { c: "공지사항", t: "정회원·일반회원 모집 안내", d: "2026-10-03", s: "미용실을 운영하시거나 창업을 준비 중인 분이라면 누구나 가입하실 수 있습니다. 가입 절차와 회원 혜택은 회원안내 메뉴에서 확인해 주세요." },
  { c: "협회뉴스", t: "조혜연 이사장 “경영을 아는 미용인이 오래 갑니다”", d: "2026-10-03", s: "20년 넘게 미용 현장을 지켜 온 조혜연 이사장이 협회의 방향과 미용 경영자에게 전하는 메시지를 밝혔습니다." },
  { c: "협회뉴스", t: "미용 경영자 아카데미 과정 개설 준비", d: "2026-10-03", s: "매출·원가 관리, 직원 채용과 노무, 고객 관리, 마케팅까지 미용실 운영에 꼭 필요한 주제로 교육 과정을 준비하고 있습니다." },
  { c: "경영칼럼", t: "미용실 손익, 한 장으로 정리하는 법", d: "2026-10-03", s: "매출만 보고 있으면 남는 돈이 보이지 않습니다. 재료비·인건비·임대료를 한 장의 표로 정리해 매달 점검하는 방법을 소개합니다." },
  { c: "경영칼럼", t: "직원이 오래 일하는 매장의 공통점", d: "2026-10-03", s: "근로계약서 작성부터 교육, 성과 보상까지. 이직률을 낮추는 매장 운영의 기본을 짚어 봅니다." },
  { c: "자료실", t: "회원가입 신청서 양식", d: "2026-10-03", s: "협회 회원가입 신청서 양식입니다. 작성 후 사무국으로 제출해 주세요." },
  { c: "자료실", t: "미용업 표준 근로계약서 작성 안내", d: "2026-10-03", s: "미용실에서 자주 쓰는 근로계약 형태별 작성 요령을 정리했습니다." },
];

/* 좌우 날개 광고 배너 (화면 폭 1500px 이상에서만 보임)
   img: 배너 이미지 경로(권장 140×360). 비워 두면 "광고 문의" 자리 표시가 나옵니다.
   link: 눌렀을 때 이동할 주소,  title: 이미지 설명 */
const WING_ADS = {
  left: [{ img: "", link: "join.html#apply", title: "광고·제휴 문의" }],
  right: [{ img: "", link: "join.html#apply", title: "광고·제휴 문의" }],
};

/* 메인 화면 포토 갤러리
   img: 사진 경로(예: "assets/gallery/01.jpg", 가로 4:3 권장). 비워 두면 "사진 준비 중" 칸으로 나옵니다.
   title: 사진 아래와 확대 화면에 나오는 설명 */
const GALLERY = [
  { img: "", title: "창립총회" },
  { img: "", title: "경영자 아카데미" },
  { img: "", title: "세미나" },
  { img: "", title: "업무협약" },
  { img: "", title: "회원 워크숍" },
  { img: "", title: "지회 활동" },
  { img: "", title: "봉사 활동" },
  { img: "", title: "협회 행사" },
];

const REGIONS = ["인천", "서울", "경기", "강원", "충남", "세종", "충북", "경북", "전북", "대전", "대구", "울산", "광주", "전남", "경남", "부산", "제주"];

const LOGO = `<img src="assets/logo.webp" width="2000" height="667" alt="${SITE.name} ${SITE.en}">`;

// Cloudflare Pages는 주소에서 .html을 떼므로 다시 붙여서 비교
const here = (location.pathname.split("/").pop() || "index").replace(/\.html$/, "") + ".html";
const $ = (s, p = document) => p.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

// 회원·수강신청 서버(/api) 호출. 서버가 없는 환경에서는 오류를 던집니다.
async function api(path, opt = {}) {
  const r = await fetch("/api/" + path, { method: opt.method || "GET", credentials: "same-origin", headers: opt.body ? { "content-type": "application/json" } : undefined, body: opt.body ? JSON.stringify(opt.body) : undefined });
  if (!(r.headers.get("content-type") || "").includes("json")) throw new Error("회원 서비스를 준비하고 있습니다.");
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || "처리 중 오류가 발생했습니다.");
  return d;
}
const ME = api("me").catch(() => null);   // { user, loginReady, positions } 또는 null(서버 없음)
const loginUrl = (next = location.pathname + location.search) => "/api/auth/kakao/login?next=" + encodeURIComponent(next);

async function renderAuth() {
  const slot = $("#authSlot");
  const me = await ME;
  // 카카오 로그인(아카데미 수강 신청)은 아직 열지 않았습니다. KAKAO_REST_KEY를 설정하면 로그인 메뉴가 나타납니다.
  if (!me || (!me.user && !me.loginReady)) { slot.innerHTML = `<a href="join.html#apply">회원가입</a>`; return; }
  if (!me.user) { slot.innerHTML = `<a href="mypage.html">로그인</a>`; return; }
  const u = me.user;
  slot.innerHTML = `<a href="mypage.html"><b>${esc(u.name || u.nickname || "회원")}</b>님</a>${u.admin ? ` · <a href="admin.html">관리자</a>` : ""} · <button type="button" id="logoutBtn">로그아웃</button>`;
  $("#logoutBtn").onclick = async () => { await api("logout", { method: "POST" }).catch(() => {}); location.href = "index.html"; };
}

function renderHeader() {
  const today = new Date().toISOString().slice(0, 10);
  $("#header").innerHTML = `
  <div class="top-head"><div class="wrap">
    <a class="logo" href="index.html">${LOGO}</a>
    <div class="head-banners">
      <a class="head-banner b1" href="support.html#edu"><b>미용 경영자 아카데미</b><small>수강 안내 바로가기 ›</small></a>
      <a class="head-banner b2" href="join.html"><b>회원 가입 안내</b><small>협회와 함께하세요 ›</small></a>
    </div>
  </div></div>
  <div class="util"><div class="wrap"><span>UPDATED. ${today}</span>
    <ul><li id="authSlot"></li><li><a href="news.html">공지사항</a></li><li><a href="about.html#location">오시는 길</a></li></ul>
  </div></div>
  <nav class="gnb"><div class="wrap">
    <ul class="gnb-list">${MENU.map((m) => `<li class="${m.h.split("#")[0] === here || m.s.some((x) => x[1] === here) ? "on" : ""}"><a href="${m.h}">${m.t}</a><div class="sub">${m.s.map((x) => `<a href="${x[1]}">${x[0]}</a>`).join("")}</div></li>`).join("")}</ul>
    <a class="gnb-cta" href="join.html#apply">가입·문의</a>
    <button class="menu-btn" aria-label="메뉴 열기">☰</button>
  </div></nav>`;
  $(".menu-btn").onclick = () => $(".gnb").classList.toggle("open");
  renderAuth();
}

function renderFooter() {
  $("#footer").innerHTML = `
  <div class="foot-links"><div class="wrap"><ul>
    <li><a href="about.html">협회소개</a></li><li><a href="join.html">회원안내</a></li><li><a href="news.html">공지사항</a></li><li><a href="join.html#apply">제휴·문의</a></li><li><a href="about.html#location">오시는 길</a></li><li><a href="privacy.html"><b>개인정보처리방침</b></a></li>
  </ul></div></div>
  <div class="wrap foot-info"><strong>${SITE.name}</strong><div>
    <p>이사장 : ${SITE.chair} &nbsp;|&nbsp; ${SITE.address}<br>${SITE.tel} &nbsp;|&nbsp; ${SITE.fax} &nbsp;|&nbsp; ${SITE.email}</p>
    <p class="copy">Copyright © ${new Date().getFullYear()} ${SITE.name}. All rights reserved.</p>
  </div></div>
  <button class="top-btn" aria-label="맨 위로">↑</button>`;
  $(".top-btn").onclick = () => scrollTo({ top: 0, behavior: "smooth" });
}

function renderWings() {
  let closed = {};
  try { closed = JSON.parse(sessionStorage.getItem("wingClosed") || "{}"); } catch {}
  for (const side of ["left", "right"]) {
    const ads = WING_ADS[side] || [];
    if (!ads.length || closed[side]) continue;
    const el = document.createElement("aside");
    el.className = `wing ${side}`;
    el.setAttribute("aria-label", "광고 배너");
    el.innerHTML = ads.map((a) => {
      const ext = /^https?:/.test(a.link) ? ' target="_blank" rel="noopener"' : "";
      const inner = a.img ? `<img src="${a.img}" alt="${esc(a.title)}">` : `<span class="wing-empty"><b>AD</b>${esc(a.title)}<small>140 × 360</small></span>`;
      return `<a class="wing-ad" href="${a.link}"${ext}>${inner}</a>`;
    }).join("") + `<button type="button" class="wing-close">닫기 ×</button>`;
    el.querySelector(".wing-close").onclick = () => {
      el.remove();
      closed[side] = 1;
      try { sessionStorage.setItem("wingClosed", JSON.stringify(closed)); } catch {}
    };
    document.body.appendChild(el);
  }
}

function renderGallery() {
  const grid = $("#galleryGrid");
  grid.innerHTML = GALLERY.map((g, i) => g.img
    ? `<button type="button" class="g-item" data-i="${i}"><img src="${g.img}" alt="${esc(g.title)}" loading="lazy"><span>${esc(g.title)}</span></button>`
    : `<div class="g-item empty"><i>사진 준비 중</i><span>${esc(g.title)}</span></div>`).join("");

  // 확대 보기
  const shots = GALLERY.map((g, i) => ({ ...g, i })).filter((g) => g.img);
  if (!shots.length) return;
  const box = document.createElement("div");
  box.className = "lightbox";
  box.hidden = true;
  box.innerHTML = `<button type="button" class="lb-close" aria-label="닫기">×</button><button type="button" class="lb-prev" aria-label="이전">‹</button><figure><img alt=""><figcaption></figcaption></figure><button type="button" class="lb-next" aria-label="다음">›</button>`;
  document.body.appendChild(box);
  let cur = 0;
  const show = (n) => {
    cur = (n + shots.length) % shots.length;
    $("img", box).src = shots[cur].img;
    $("img", box).alt = shots[cur].title;
    $("figcaption", box).textContent = `${shots[cur].title}  (${cur + 1} / ${shots.length})`;
    box.hidden = false;
  };
  grid.onclick = (e) => { const b = e.target.closest("button.g-item"); if (b) show(shots.findIndex((s) => s.i === +b.dataset.i)); };
  box.onclick = (e) => {
    if (e.target.closest(".lb-prev")) show(cur - 1);
    else if (e.target.closest(".lb-next")) show(cur + 1);
    else if (!e.target.closest("figure")) box.hidden = true;
  };
  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") box.hidden = true;
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });
}

const thumb = (i, c) => `<div class="thumb t${i % 4}">${esc(c)}</div>`;

function renderHome() {
  // 지역 선택
  const grid = $("#regionGrid"), info = $("#regionInfo");
  grid.innerHTML = REGIONS.map((r) => `<button type="button">${r}</button>`).join("");
  grid.onclick = (e) => {
    if (e.target.tagName !== "BUTTON") return;
    grid.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b === e.target));
    info.innerHTML = `<b>${e.target.textContent} 지회</b><br>지회 설립을 준비하고 있습니다. 지회 참여·문의는 협회 사무국으로 연락해 주세요.`;
  };

  // 헤드라인
  const top = POSTS.slice(0, 4);
  $("#hlStage").innerHTML = top.map((p, i) => `<a class="hl-slide ${i ? "" : "on"}" href="news.html?c=${p.c}"><em>${p.c}</em><h3>${esc(p.t)}</h3><p>${esc(p.s)}</p></a>`).join("");
  $("#hlList").innerHTML = `<h4>HEADLINE</h4>` + top.map((p, i) => `<button type="button" class="${i ? "" : "on"}">${esc(p.t)}</button>`).join("");
  const slides = [...document.querySelectorAll(".hl-slide")], btns = [...document.querySelectorAll("#hlList button")];
  let cur = 0;
  const show = (n) => { cur = n; slides.forEach((s, i) => s.classList.toggle("on", i === n)); btns.forEach((b, i) => b.classList.toggle("on", i === n)); };
  btns.forEach((b, i) => (b.onmouseenter = b.onclick = () => show(i)));
  setInterval(() => show((cur + 1) % slides.length), 5000);

  // 카드 · 목록 · 사이드
  $("#cards").innerHTML = POSTS.slice(0, 3).map((p, i) => `<a class="card" href="news.html?c=${p.c}">${thumb(i, p.c)}<div class="body"><span class="cat">${p.c}</span><h4>${esc(p.t)}</h4><p>${esc(p.s)}</p></div></a>`).join("");
  $("#postList").innerHTML = POSTS.slice(3).map((p, i) => `<li>${thumb(i + 3, p.c)}<a href="news.html?c=${p.c}"><h4>${esc(p.t)}</h4><p>${esc(p.s)}</p><span class="meta">${p.d} | ${p.c}</span></a></li>`).join("");
  $("#sideNotice").innerHTML = POSTS.filter((p) => p.c === "공지사항").map((p) => `<li><a href="news.html?c=공지사항">${esc(p.t)}</a></li>`).join("");
  $("#sideColumn").innerHTML = POSTS.filter((p) => p.c === "경영칼럼").map((p) => `<li><a href="news.html?c=경영칼럼">${esc(p.t)}</a></li>`).join("");
}

function renderNews() {
  const cats = ["전체", "공지사항", "협회뉴스", "경영칼럼", "자료실"];
  const want = new URLSearchParams(location.search).get("c");
  let cur = cats.includes(want) ? want : "전체";
  const tabs = $("#newsTabs"), body = $("#newsBody");
  const draw = () => {
    tabs.innerHTML = cats.map((c) => `<button type="button" class="${c === cur ? "on" : ""}">${c}</button>`).join("");
    const rows = POSTS.filter((p) => cur === "전체" || p.c === cur);
    body.innerHTML = rows.map((p, i) => `<tr><td>${rows.length - i}</td><td>${p.c}</td><td class="t">${esc(p.t)}<small>${esc(p.s)}</small></td><td>${p.d}</td></tr>`).join("");
  };
  tabs.onclick = (e) => { if (e.target.tagName === "BUTTON") { cur = e.target.textContent; draw(); } };
  draw();
}

function renderJoin() {
  const form = $("#applyForm"), msg = $("#applyMsg");
  form.onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const say = (text, ok) => { msg.textContent = text; msg.className = "form-msg " + (ok ? "ok" : "bad"); msg.hidden = false; };
    // 서버에 접수. 서버가 준비되지 않은 환경에서는 아래의 "내용 복사" 방식으로 안내합니다.
    if (await ME) {
      const btn = $("button[type=submit]", form);
      btn.disabled = true;
      try {
        await api("applications", { method: "POST", body: { ...Object.fromEntries(f), interests: f.getAll("interests"), message: f.get("msg"), agree: form.agree.checked } });
        form.reset();
        say("접수되었습니다. 사무국에서 확인 후 연락드리겠습니다.", true);
      } catch (err) { say(err.message); }
      btn.disabled = false;
      return;
    }
    const text = [`[${SITE.name} 가입·문의 신청]`, `구분: ${f.get("type")}`, `성명: ${f.get("name")}`, `연락처: ${f.get("phone")}`, `매장명: ${f.get("shop") || "-"}`, `지역: ${f.get("region") || "-"}`, `관심 분야: ${f.getAll("interests").join(", ") || "-"}`,`내용: ${f.get("msg") || "-"}`].join("\n");
    $("#applyResult").hidden = false;
    $("#applyText").value = text;
    $("#applyResult").scrollIntoView({ behavior: "smooth", block: "center" });
  };
  $("#copyBtn").onclick = async () => {
    $("#applyText").select();
    try { await navigator.clipboard.writeText($("#applyText").value); } catch { document.execCommand("copy"); }
    $("#copyBtn").textContent = "복사되었습니다";
  };
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  renderWings();
  document.querySelectorAll("[data-site]").forEach((el) => (el.textContent = SITE[el.dataset.site]));
  if ($("#hlStage")) renderHome();
  if ($("#galleryGrid")) renderGallery();
  if ($("#newsBody")) renderNews();
  if ($("#applyForm")) renderJoin();
  // 머리말이 그려진 뒤 #위치로 다시 이동
  if (location.hash.length > 1) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: "instant" });
});
