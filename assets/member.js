/* 회원 기능 화면: 아카데미 수강 신청(academy.html), 마이페이지(mypage.html), 관리자(admin.html)
   공통 도구(api, ME, esc, $, SITE, loginUrl)는 site.js에 있습니다. */

const won = (n) => (n > 0 ? Number(n).toLocaleString("ko-KR") + "원" : "무료");
const when = (iso) => (iso ? new Date(iso).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }) : "-");
const COURSE_KO = { preparing: "모집 준비", open: "신청 접수 중", closed: "마감" };
const ENROLL_KO = { applied: "신청 접수", confirmed: "수강 확정", cancelled: "취소" };
const kakaoBtn = (next) => `<a class="btn kakao" href="${loginUrl(next)}">카카오 로그인</a>`;
const notice = (el, msg, ok) => { el.textContent = msg; el.className = "form-msg " + (ok ? "ok" : "bad"); el.hidden = false; };

// ───────── 아카데미 수강 신청 ─────────
async function renderAcademy() {
  const box = $("#courseList"), me = await ME;
  if (!me) { box.innerHTML = `<p class="note">수강 신청 서비스를 준비하고 있습니다. 문의는 협회 사무국으로 연락해 주세요.</p>`; return; }
  const user = me.user;
  const draw = async () => {
    const { courses } = await api("courses");
    if (!courses.length) { box.innerHTML = `<p class="note">등록된 과정이 없습니다.</p>`; return; }
    box.innerHTML = courses.map((c) => {
      const full = c.capacity > 0 && c.applied >= c.capacity;
      let action;
      if (c.my && c.my !== "cancelled") action = `<span class="badge done">${ENROLL_KO[c.my]}</span> <a href="mypage.html#my">신청 내역 보기</a>`;
      else if (c.status !== "open") action = `<span class="muted">${c.status === "closed" ? "신청이 마감되었습니다." : "모집 일정이 확정되면 공지합니다."}</span>`;
      else if (full) action = `<span class="muted">정원이 마감되었습니다.</span>`;
      else if (!user) action = me.loginReady ? kakaoBtn("/academy.html") : `<span class="muted">로그인 기능을 준비하고 있습니다.</span>`;
      else if (!user.profileDone) action = `<a class="btn line" href="mypage.html?welcome=1">회원 정보 입력 후 신청</a>`;
      else action = `<button type="button" class="btn" data-open="${c.id}">수강 신청</button>`;
      return `<article class="course" id="course-${c.id}">
        <header><span class="badge ${c.status}">${COURSE_KO[c.status]}</span><h3>${esc(c.title)}</h3></header>
        <p>${esc(c.summary)}</p>
        <dl><dt>일정</dt><dd>${esc(c.schedule || "-")}</dd><dt>장소</dt><dd>${esc(c.place || "-")}</dd>
            <dt>수강료</dt><dd>${c.status === "preparing" && !c.fee ? "추후 공지" : won(c.fee)}</dd>
            <dt>정원</dt><dd>${c.capacity > 0 ? `${c.applied} / ${c.capacity}명` : "제한 없음"}</dd></dl>
        <div class="course-act">${action}</div>
        <form class="apply" hidden data-course="${c.id}">
          <label>남기실 말씀 (선택)<textarea name="memo" rows="2" maxlength="300" placeholder="문의 사항이나 참고할 내용을 적어 주세요."></textarea></label>
          <p class="muted">신청 후 수강료 입금이 확인되면 수강이 확정됩니다.${c.fee > 0 ? ` 입금 계좌: ${esc(SITE.bank)}` : ""}</p>
          <button class="btn" type="submit">신청하기</button> <button class="btn line" type="button" data-close>닫기</button>
          <p class="form-msg" hidden></p>
        </form>
      </article>`;
    }).join("");
  };
  box.onclick = (e) => {
    const open = e.target.closest("[data-open]");
    if (open) $(`#course-${open.dataset.open} form`).hidden = false;
    if (e.target.closest("[data-close]")) e.target.closest("form").hidden = true;
  };
  box.onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target;
    try { await api("enrollments", { method: "POST", body: { courseId: f.dataset.course, memo: f.memo.value } }); await draw(); }
    catch (err) { notice($(".form-msg", f), err.message); }
  };
  await draw().catch((err) => (box.innerHTML = `<p class="note">${esc(err.message)}</p>`));
}

// ───────── 마이페이지 ─────────
async function renderMypage() {
  const box = $("#mypage"), me = await ME, q = new URLSearchParams(location.search);
  if (!me) { box.innerHTML = `<p class="note">회원 서비스를 준비하고 있습니다.</p>`; return; }
  if (!me.user) {
    const err = q.get("error");
    box.innerHTML = `<div class="login-box">
      <h2>로그인</h2>
      <p>카카오 계정으로 간편하게 로그인하고<br>미용 경영자 아카데미 수강을 신청하세요.</p>
      ${err === "login" ? `<p class="form-msg bad">로그인에 실패했습니다. 다시 시도해 주세요.</p>` : ""}
      ${me.loginReady && err !== "config" ? kakaoBtn("/mypage.html") : `<p class="form-msg bad">카카오 로그인 설정이 아직 완료되지 않았습니다.</p>`}
      <p class="muted">처음 로그인하시면 회원 정보 입력 화면으로 이동합니다.<br>로그인 시 <a href="privacy.html">개인정보처리방침</a>이 적용됩니다.</p>
    </div>`;
    return;
  }
  const u = me.user;
  box.innerHTML = `
    <section>
      <h2>회원 정보</h2>
      ${q.get("welcome") || !u.profileDone ? `<p class="note">환영합니다. 수강 신청을 위해 아래 회원 정보를 입력해 주세요. <b>*</b> 표시는 필수입니다.</p>` : ""}
      <form class="form" id="profileForm">
        <label>성명 <b>*</b><input name="name" required maxlength="30" value="${esc(u.name)}"></label>
        <label>휴대폰 번호 <b>*</b><input name="phone" required inputmode="tel" maxlength="13" placeholder="01012345678" value="${esc(u.phone)}"></label>
        <label>이메일<input name="email" type="email" maxlength="100" value="${esc(u.email)}"></label>
        <label>생년월일<input name="birth" type="date" max="${new Date().toISOString().slice(0, 10)}" value="${esc(u.birth)}"></label>
        <label>매장명<input name="shop" maxlength="60" value="${esc(u.shop)}"></label>
        <label>지역<input name="region" maxlength="60" placeholder="예: 서울 강남구" value="${esc(u.region)}"></label>
        <label>직책<select name="position"><option value="">선택</option>${me.positions.map((p) => `<option ${p === u.position ? "selected" : ""}>${esc(p)}</option>`).join("")}</select></label>
        <label>미용 경력(년)<input name="careerYears" type="number" min="0" max="70" value="${u.careerYears ?? ""}"></label>
        ${u.agreed ? "" : `<div class="full agree"><label><input type="checkbox" name="agree" required> <span>[필수] 개인정보 수집·이용에 동의합니다.</span></label>
          <p class="muted">수집 항목: 성명, 휴대폰 번호, 이메일, 생년월일, 매장명, 지역, 직책, 경력, 카카오 회원번호·닉네임 / 이용 목적: 회원 관리, 아카데미 수강 신청 접수 및 안내 / 보유 기간: 회원 탈퇴 시까지. 동의하지 않을 수 있으며, 이 경우 수강 신청이 제한됩니다. 자세한 내용은 <a href="privacy.html" target="_blank">개인정보처리방침</a>을 확인해 주세요.</p></div>`}
        <div class="full"><button class="btn" type="submit">저장</button> <p class="form-msg" hidden></p></div>
      </form>
      <p class="muted" style="margin-top:14px">카카오 닉네임: ${esc(u.nickname || "-")} · 회원번호: ${esc(u.kakaoId)}</p>
    </section>
    <section id="my">
      <h2>수강 신청 내역</h2>
      <div id="myEnroll"></div>
      <p style="margin-top:14px"><a class="btn line" href="academy.html">과정 보러 가기</a></p>
    </section>
    <section>
      <h2>회원 탈퇴</h2>
      <p class="muted">탈퇴하면 회원 정보와 수강 신청 내역이 모두 삭제되며 되돌릴 수 없습니다.</p>
      <button type="button" class="btn line danger" id="leaveBtn">회원 탈퇴</button>
    </section>`;

  $("#profileForm").onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target, msg = $(".form-msg", f);
    const body = Object.fromEntries(new FormData(f));
    body.agree = !!f.agree?.checked;
    try { await api("profile", { method: "PUT", body }); notice(msg, "저장되었습니다.", true); setTimeout(() => (location.href = "mypage.html"), 700); }
    catch (err) { notice(msg, err.message); }
  };

  const list = $("#myEnroll");
  const draw = async () => {
    const { enrollments } = await api("enrollments");
    list.innerHTML = enrollments.length ? `<table class="tbl board"><thead><tr><th>과정</th><th>일정·장소</th><th>수강료</th><th>상태</th><th>신청일</th><th></th></tr></thead><tbody>${enrollments.map((e) => `<tr>
      <td class="t">${esc(e.title)}</td><td>${esc(e.schedule || "-")}<br>${esc(e.place || "-")}</td><td>${won(e.fee)}${e.fee > 0 ? `<br><small>${e.paid ? "입금 확인" : "입금 대기"}</small>` : ""}</td>
      <td><span class="badge ${e.status}">${ENROLL_KO[e.status]}</span></td><td>${when(e.created_at)}</td>
      <td>${e.status === "cancelled" ? "" : `<button type="button" class="btn line sm" data-cancel="${e.id}">신청 취소</button>`}</td></tr>`).join("")}</tbody></table>
      <p class="muted" style="margin-top:10px">수강료 입금 계좌: ${esc(SITE.bank)}</p>` : `<p class="note">신청한 과정이 없습니다.</p>`;
  };
  list.onclick = async (e) => {
    const b = e.target.closest("[data-cancel]");
    if (!b) return;
    if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = "한 번 더 누르면 취소"; return; }
    await api(`enrollments/${b.dataset.cancel}/cancel`, { method: "POST" }).catch((err) => (b.textContent = err.message));
    draw();
  };
  draw();

  $("#leaveBtn").onclick = async (e) => {
    const b = e.target;
    if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = "정말 탈퇴하시려면 한 번 더 누르세요"; return; }
    await api("me", { method: "DELETE" }).then(() => (location.href = "index.html")).catch((err) => (b.textContent = err.message));
  };
}

// ───────── 관리자 ─────────
async function renderAdmin() {
  const box = $("#admin"), me = await ME;
  if (!me) { box.innerHTML = `<p class="note">관리자 기능을 준비하고 있습니다. (서버 설정이 아직 완료되지 않았습니다.)</p>`; return; }
  if (!me.admin) {
    box.innerHTML = `<div class="login-box"><h2>관리자 로그인</h2>
      ${me.adminLoginReady ? `<form id="adminLogin"><p>관리자 비밀번호를 입력해 주세요.</p>
        <div class="form" style="grid-template-columns:1fr"><label>비밀번호<input type="password" name="password" required autocomplete="current-password"></label></div>
        <button class="btn" type="submit">로그인</button><p class="form-msg" hidden></p></form>`
        : `<p class="form-msg bad">관리자 비밀번호가 아직 설정되지 않았습니다.</p><p class="muted">Cloudflare Pages 설정에서 ADMIN_PASSWORD를 등록해 주세요.</p>`}</div>`;
    const f = $("#adminLogin");
    if (f) f.onsubmit = async (e) => {
      e.preventDefault();
      try { await api("admin/login", { method: "POST", body: { password: f.password.value } }); location.reload(); }
      catch (err) { f.password.value = ""; notice($(".form-msg", f), err.message); }
    };
    return;
  }
  const APP_KO = { new: "신규", progress: "처리 중", done: "완료" };
  box.innerHTML = `<div class="bar"><div class="tabs" id="adminTabs" style="margin:0"><button class="on" data-tab="apps">가입·문의 신청</button>${me.loginReady ? `<button data-tab="enroll">수강 신청</button><button data-tab="members">회원</button><button data-tab="courses">과정 관리</button>` : ""}</div>
    <button type="button" class="btn line sm" id="adminLogout">관리자 로그아웃</button></div><div id="adminBody"></div>`;
  $("#adminLogout").onclick = async () => { await api("admin/logout", { method: "POST" }).catch(() => {}); await api("logout", { method: "POST" }).catch(() => {}); location.reload(); };
  const body = $("#adminBody");
  const tabs = {
    async apps() {
      const { applications: rows } = await api("admin/applications");
      body.innerHTML = `<p class="bar"><span>전체 ${rows.length}건 · 신규 ${rows.filter((r) => r.status === "new").length}건</span><a class="btn line sm" href="/api/admin/export?type=applications">엑셀(CSV) 내려받기</a></p>
        <div class="scroll"><table class="tbl board"><thead><tr><th>번호</th><th>구분</th><th>성명</th><th>연락처</th><th>매장·지역</th><th>관심 분야</th><th>내용</th><th>접수일</th><th>상태</th><th>관리자 메모</th><th></th></tr></thead><tbody>${rows.map((r) => `<tr data-id="${r.id}" class="${r.status === "new" ? "is-new" : ""}">
          <td>${r.id}</td><td>${esc(r.type)}</td><td class="t">${esc(r.name)}</td><td><a href="tel:${esc(r.phone)}">${esc(r.phone)}</a></td><td>${esc(r.shop)}<br>${esc(r.region)}</td><td class="memo">${esc(r.interests).replace(/, /g, "<br>")}</td><td class="memo">${esc(r.message)}</td><td>${when(r.created_at)}</td>
          <td><select data-f="status">${Object.entries(APP_KO).map(([k, v]) => `<option value="${k}" ${k === r.status ? "selected" : ""}>${v}</option>`).join("")}</select></td>
          <td><input data-f="note" maxlength="300" value="${esc(r.note)}" placeholder="메모"></td>
          <td><button type="button" class="btn line sm danger" data-del>삭제</button></td></tr>`).join("") || `<tr><td colspan="11">접수된 신청이 없습니다.</td></tr>`}</tbody></table></div>`;
      body.onchange = async (e) => {
        const tr = e.target.closest("tr[data-id]");
        if (!tr) return;
        const status = $("[data-f=status]", tr).value;
        await api(`admin/applications/${tr.dataset.id}`, { method: "POST", body: { status, note: $("[data-f=note]", tr).value } })
          .then(() => { tr.classList.toggle("is-new", status === "new"); tr.classList.add("saved"); }, (err) => alertRow(tr, err.message));
        setTimeout(() => tr.classList.remove("saved"), 900);
      };
      body.onclick = async (e) => {
        const b = e.target.closest("[data-del]");
        if (!b) return;
        if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = "한 번 더"; return; }
        await api(`admin/applications/${b.closest("tr").dataset.id}`, { method: "DELETE" }).then(() => tabs.apps(), (err) => alertRow(b.closest("tr"), err.message));
      };
    },
    async enroll() {
      const { enrollments: rows } = await api("admin/enrollments");
      body.innerHTML = `<p class="bar"><span>전체 ${rows.length}건 (취소 제외 ${rows.filter((r) => r.status !== "cancelled").length}건)</span><a class="btn line sm" href="/api/admin/export?type=enrollments">엑셀(CSV) 내려받기</a></p>
        <div class="scroll"><table class="tbl board"><thead><tr><th>번호</th><th>과정</th><th>성명</th><th>휴대폰</th><th>매장·지역</th><th>메모</th><th>신청일</th><th>상태</th><th>입금</th></tr></thead><tbody>${rows.map((r) => `<tr data-id="${r.id}">
          <td>${r.id}</td><td class="t">${esc(r.title)}</td><td>${esc(r.name || r.nickname)}</td><td>${esc(r.phone)}</td><td>${esc(r.shop)}<br>${esc(r.region)}</td><td class="memo">${esc(r.memo)}</td><td>${when(r.created_at)}</td>
          <td><select data-f="status">${Object.entries(ENROLL_KO).map(([k, v]) => `<option value="${k}" ${k === r.status ? "selected" : ""}>${v}</option>`).join("")}</select></td>
          <td><input type="checkbox" data-f="paid" ${r.paid ? "checked" : ""}></td></tr>`).join("") || `<tr><td colspan="9">신청 내역이 없습니다.</td></tr>`}</tbody></table></div>`;
      body.onchange = async (e) => {
        const tr = e.target.closest("tr[data-id]");
        if (!tr) return;
        await api(`admin/enrollments/${tr.dataset.id}`, { method: "POST", body: { status: $("[data-f=status]", tr).value, paid: $("[data-f=paid]", tr).checked } })
          .then(() => tr.classList.add("saved"), (err) => alertRow(tr, err.message));
        setTimeout(() => tr.classList.remove("saved"), 900);
      };
    },
    async members() {
      const { members: rows } = await api("admin/members");
      body.onchange = null;
      body.innerHTML = `<p class="bar"><span>전체 ${rows.length}명</span><a class="btn line sm" href="/api/admin/export?type=members">엑셀(CSV) 내려받기</a></p>
        <div class="scroll"><table class="tbl board"><thead><tr><th>번호</th><th>성명</th><th>휴대폰</th><th>이메일</th><th>매장·지역</th><th>생년월일</th><th>직책·경력</th><th>가입일</th></tr></thead><tbody>${rows.map((r) => `<tr>
          <td>${r.id}</td><td class="t">${esc(r.name || "(미입력)")}<small>${esc(r.nickname)}</small></td><td>${esc(r.phone)}</td><td>${esc(r.email)}</td><td>${esc(r.shop)}<br>${esc(r.region)}</td><td>${esc(r.birth)}</td>
          <td>${esc(r.position)}${r.career_years != null ? `<br>${r.career_years}년` : ""}</td><td>${when(r.created_at)}</td></tr>`).join("") || `<tr><td colspan="8">회원이 없습니다.</td></tr>`}</tbody></table></div>`;
    },
    async courses() {
      const { courses: rows } = await api("courses");
      body.onchange = null;
      const form = (c = {}) => `<form class="form course-edit" data-id="${c.id || ""}">
        <label class="full">과정명<input name="title" required maxlength="80" value="${esc(c.title)}"></label>
        <label class="full">소개<input name="summary" maxlength="300" value="${esc(c.summary)}"></label>
        <label>일정<input name="schedule" maxlength="100" value="${esc(c.schedule)}"></label>
        <label>장소<input name="place" maxlength="100" value="${esc(c.place)}"></label>
        <label>수강료(원, 0은 무료)<input name="fee" type="number" min="0" value="${c.fee ?? 0}"></label>
        <label>정원(0은 제한 없음)<input name="capacity" type="number" min="0" value="${c.capacity ?? 0}"></label>
        <label>상태<select name="status">${Object.entries(COURSE_KO).map(([k, v]) => `<option value="${k}" ${k === (c.status || "preparing") ? "selected" : ""}>${v}</option>`).join("")}</select></label>
        <label>표시 순서<input name="sort" type="number" min="0" value="${c.sort ?? 0}"></label>
        <div class="full"><button class="btn sm" type="submit">${c.id ? "저장" : "과정 추가"}</button>
          ${c.id ? `<button class="btn line sm danger" type="button" data-del>삭제</button> <span class="muted">신청 ${c.applied}명</span>` : ""} <span class="form-msg" hidden></span></div>
      </form>`;
      body.innerHTML = `<h3>새 과정 등록</h3>${form()}<h3>등록된 과정</h3>${rows.map(form).join("") || `<p class="note">등록된 과정이 없습니다.</p>`}`;
      body.onsubmit = async (e) => {
        e.preventDefault();
        const f = e.target, id = f.dataset.id;
        try { await api(id ? `admin/courses/${id}` : "admin/courses", { method: id ? "PUT" : "POST", body: Object.fromEntries(new FormData(f)) }); await tabs.courses(); }
        catch (err) { notice($(".form-msg", f), err.message); }
      };
      body.onclick = async (e) => {
        const b = e.target.closest("[data-del]");
        if (!b) return;
        const f = b.closest("form");
        if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = "한 번 더 누르면 삭제"; return; }
        try { await api(`admin/courses/${f.dataset.id}`, { method: "DELETE" }); await tabs.courses(); }
        catch (err) { notice($(".form-msg", f), err.message); }
      };
    },
  };
  const alertRow = (tr, msg) => { tr.classList.add("bad"); tr.title = msg; };
  $("#adminTabs").onclick = (e) => {
    const b = e.target.closest("[data-tab]");
    if (!b) return;
    document.querySelectorAll("#adminTabs button").forEach((x) => x.classList.toggle("on", x === b));
    body.onsubmit = body.onclick = body.onchange = null;
    tabs[b.dataset.tab]().catch((err) => (body.innerHTML = `<p class="note">${esc(err.message)}</p>`));
  };
  tabs.apps().catch((err) => (body.innerHTML = `<p class="note">${esc(err.message)}</p>`));
}

document.addEventListener("DOMContentLoaded", () => {
  if ($("#courseList")) renderAcademy();
  if ($("#mypage")) renderMypage();
  if ($("#admin")) renderAdmin();
});
