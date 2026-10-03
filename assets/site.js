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

const REGIONS = ["인천", "서울", "경기", "강원", "충남", "세종", "충북", "경북", "전북", "대전", "대구", "울산", "광주", "전남", "경남", "부산", "제주"];

const LOGO = `<img src="assets/logo.webp" width="2000" height="667" alt="${SITE.name} ${SITE.en}">`;

// Cloudflare Pages는 주소에서 .html을 떼므로 다시 붙여서 비교
const here = (location.pathname.split("/").pop() || "index").replace(/\.html$/, "") + ".html";
const $ = (s, p = document) => p.querySelector(s);
const esc = (s) => s.replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));

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
    <ul><li><a href="join.html#apply">회원가입</a></li><li><a href="news.html">공지사항</a></li><li><a href="about.html#location">오시는 길</a></li></ul>
  </div></div>
  <nav class="gnb"><div class="wrap">
    <ul class="gnb-list">${MENU.map((m) => `<li class="${m.h.split("#")[0] === here || m.s.some((x) => x[1] === here) ? "on" : ""}"><a href="${m.h}">${m.t}</a><div class="sub">${m.s.map((x) => `<a href="${x[1]}">${x[0]}</a>`).join("")}</div></li>`).join("")}</ul>
    <a class="gnb-cta" href="join.html#apply">가입·문의</a>
    <button class="menu-btn" aria-label="메뉴 열기">☰</button>
  </div></nav>`;
  $(".menu-btn").onclick = () => $(".gnb").classList.toggle("open");
}

function renderFooter() {
  $("#footer").innerHTML = `
  <div class="foot-links"><div class="wrap"><ul>
    <li><a href="about.html">협회소개</a></li><li><a href="join.html">회원안내</a></li><li><a href="news.html">공지사항</a></li><li><a href="join.html#apply">제휴·문의</a></li><li><a href="about.html#location">오시는 길</a></li>
  </ul></div></div>
  <div class="wrap foot-info"><strong>${SITE.name}</strong><div>
    <p>이사장 : ${SITE.chair} &nbsp;|&nbsp; ${SITE.address}<br>${SITE.tel} &nbsp;|&nbsp; ${SITE.fax} &nbsp;|&nbsp; ${SITE.email}</p>
    <p class="copy">Copyright © ${new Date().getFullYear()} ${SITE.name}. All rights reserved.</p>
  </div></div>
  <button class="top-btn" aria-label="맨 위로">↑</button>`;
  $(".top-btn").onclick = () => scrollTo({ top: 0, behavior: "smooth" });
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
  $("#applyForm").onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const text = [`[${SITE.name} 가입·문의 신청]`, `구분: ${f.get("type")}`, `성명: ${f.get("name")}`, `연락처: ${f.get("phone")}`, `매장명: ${f.get("shop") || "-"}`, `지역: ${f.get("region") || "-"}`, `내용: ${f.get("msg") || "-"}`].join("\n");
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
  document.querySelectorAll("[data-site]").forEach((el) => (el.textContent = SITE[el.dataset.site]));
  if ($("#hlStage")) renderHome();
  if ($("#newsBody")) renderNews();
  if ($("#applyForm")) renderJoin();
  // 머리말이 그려진 뒤 #위치로 다시 이동
  if (location.hash.length > 1) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: "instant" });
});
