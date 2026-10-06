/* 대한미용경영자협회 회원·수강신청 API
   Cloudflare Pages Functions + D1

   필요한 설정 (Cloudflare Pages > k-bma > Settings)
   - D1 바인딩:  변수 이름 DB
   - 환경 변수:  ADMIN_PASSWORD        관리자 페이지 비밀번호 (8자 이상, Secret으로 등록)
                 KAKAO_REST_KEY        카카오 REST API 키 (카카오 로그인을 쓸 때만)
                 KAKAO_CLIENT_SECRET   카카오 Client Secret (사용 설정한 경우에만)
                 ADMIN_KAKAO_IDS       관리자 카카오 회원번호, 쉼표로 구분 (마이페이지에서 확인) */

const COOKIE = "kbbma_sid";
const ADMIN_COOKIE = "kbbma_admin";
const STATE_COOKIE = "kbbma_state";
const SESSION_DAYS = 30;
const ADMIN_HOURS = 12;
const APP_TYPES = ["정회원 가입", "일반회원 가입", "단체회원 가입", "경영 상담 신청", "제휴·기타 문의"];
const APP_FIELDS = ["경영자 아카데미", "자격증 과정", "세미나·워크숍", "경영 상담(세무·노무·법률)", "창업 지원", "제휴·광고", "기타"];   // join.html의 관심 분야와 같게 유지
const APP_STATUS = ["new", "progress", "done"];
const POSITIONS = ["원장(대표)", "점장·매니저", "디자이너", "스태프·인턴", "예비 창업자", "기타"];
const COURSE_STATUS = ["preparing", "open", "closed"];
const ENROLL_STATUS = ["applied", "confirmed", "cancelled"];

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     kakao_id TEXT NOT NULL UNIQUE,
     nickname TEXT, name TEXT, phone TEXT, email TEXT,
     shop TEXT, region TEXT, birth TEXT, position TEXT, career_years INTEGER,
     agreed_at TEXT, created_at TEXT NOT NULL, updated_at TEXT, last_login_at TEXT)`,
  `CREATE TABLE IF NOT EXISTS sessions (
     token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS courses (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     title TEXT NOT NULL, summary TEXT, schedule TEXT, place TEXT,
     fee INTEGER NOT NULL DEFAULT 0, capacity INTEGER NOT NULL DEFAULT 0,
     status TEXT NOT NULL DEFAULT 'preparing', sort INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS enrollments (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     user_id INTEGER NOT NULL, course_id INTEGER NOT NULL,
     status TEXT NOT NULL DEFAULT 'applied', paid INTEGER NOT NULL DEFAULT 0,
     memo TEXT, created_at TEXT NOT NULL, updated_at TEXT,
     UNIQUE(user_id, course_id))`,
  `CREATE TABLE IF NOT EXISTS applications (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     type TEXT NOT NULL, name TEXT NOT NULL, phone TEXT NOT NULL,
     shop TEXT, region TEXT, message TEXT,
     status TEXT NOT NULL DEFAULT 'new', note TEXT,
     ip_hash TEXT, created_at TEXT NOT NULL, updated_at TEXT)`,
  `CREATE TABLE IF NOT EXISTS login_attempts (ip_hash TEXT NOT NULL, at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_app_ip ON applications(ip_hash, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_enroll_course ON enrollments(course_id)`,
];

// 처음 열었을 때 보이는 예시 과정 (모집 준비 상태). 관리자 페이지에서 수정·삭제합니다.
const SEED_COURSES = [
  ["숫자로 보는 미용실 경영", "손익 구조, 원가 관리, 가격 책정"],
  ["사람이 남는 매장 만들기", "채용, 교육, 보상 체계, 노무 기초"],
  ["고객이 다시 찾는 매장", "고객 경험 설계, 상담, 재방문 관리"],
  ["우리 매장 알리기", "지역 검색, SNS, 리뷰 관리"],
];

let ready = null;
function init(db) {
  ready ??= (async () => {
    await db.batch(SCHEMA.map((s) => db.prepare(s)));
    // 나중에 추가된 열. 이미 있으면 오류가 나므로 무시합니다.
    await db.prepare("ALTER TABLE applications ADD COLUMN interests TEXT").run().catch(() => {});
    const { n } = await db.prepare("SELECT COUNT(*) AS n FROM courses").first();
    if (!n) {
      const ins = db.prepare("INSERT INTO courses (title, summary, schedule, place, status, sort, created_at) VALUES (?, ?, '일정 추후 공지', '장소 추후 공지', 'preparing', ?, ?)");
      await db.batch(SEED_COURSES.map(([t, s], i) => ins.bind(t, s, i + 1, now())));
    }
  })().catch((e) => { ready = null; throw e; });
  return ready;
}

// ───────── 공통 도우미 ─────────
const now = () => new Date().toISOString();
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });
const fail = (status, message) => json({ error: message }, status);
const redirect = (location, cookies = []) => {
  const h = new Headers({ location, "cache-control": "no-store" });
  cookies.forEach((c) => h.append("set-cookie", c));
  return new Response(null, { status: 302, headers: h });
};
const cookie = (name, value, maxAge) => `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
const readCookies = (req) => Object.fromEntries((req.headers.get("cookie") || "").split(";").map((c) => c.trim().split("=")).filter((p) => p[0]).map(([k, ...v]) => [k, v.join("=")]));
const token = () => [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, "0")).join("");
async function sha256(text) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const clean = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const int = (v, min, max, d = 0) => { const n = Math.trunc(Number(v)); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d; };
const safeNext = (p) => (typeof p === "string" && /^\/[A-Za-z0-9_\-./?=&%#]*$/.test(p) && !p.startsWith("//") ? p : "/mypage.html");
const isAdmin = (user, env) => !!user && (env.ADMIN_KAKAO_IDS || "").split(",").map((s) => s.trim()).filter(Boolean).includes(String(user.kakao_id));
const profileDone = (u) => !!(u && u.agreed_at && u.name && u.phone);
const publicUser = (u, env) => u && {
  id: u.id, kakaoId: u.kakao_id, nickname: u.nickname, name: u.name, phone: u.phone, email: u.email, shop: u.shop, region: u.region,
  birth: u.birth, position: u.position, careerYears: u.career_years, agreed: !!u.agreed_at, profileDone: profileDone(u), admin: isAdmin(u, env),
};

async function currentUser(req, db) {
  const sid = readCookies(req)[COOKIE];
  if (!sid) return null;
  return db.prepare("SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?").bind(await sha256(sid), now()).first();
}

const ipHash = (req) => sha256((req.headers.get("cf-connecting-ip") || "local") + "|kbbma");
const ago = (minutes) => new Date(Date.now() - minutes * 6e4).toISOString();

// ───────── 가입·문의 신청 (로그인 없이 접수) ─────────
async function submitApplication(req, db) {
  const b = await req.json().catch(() => ({}));
  if (b.website) return json({ ok: true });                     // 자동 등록 프로그램용 함정 칸
  const type = APP_TYPES.includes(b.type) ? b.type : "";
  const name = clean(b.name, 30), phone = clean(b.phone, 20).replace(/[^0-9]/g, "");
  if (!type) return fail(400, "신청 구분을 선택해 주세요.");
  if (!name) return fail(400, "성명을 입력해 주세요.");
  if (!/^0\d{8,10}$/.test(phone)) return fail(400, "연락처를 정확히 입력해 주세요.");
  if (b.agree !== true) return fail(400, "개인정보 수집·이용에 동의해 주세요.");
  const ip = await ipHash(req);
  const { n } = await db.prepare("SELECT COUNT(*) AS n FROM applications WHERE ip_hash = ? AND created_at > ?").bind(ip, ago(60)).first();
  if (n >= 5) return fail(429, "신청이 너무 많습니다. 잠시 후 다시 시도해 주세요.");
  const interests = APP_FIELDS.filter((x) => Array.isArray(b.interests) && b.interests.includes(x)).join(", ");
  await db.prepare("INSERT INTO applications (type, name, phone, shop, region, interests, message, ip_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(type, name, phone, clean(b.shop, 60), clean(b.region, 60), interests, clean(b.message, 1000), ip, now()).run();
  return json({ ok: true });
}

// ───────── 관리자 비밀번호 로그인 ─────────
const adminPasswordReady = (env) => typeof env.ADMIN_PASSWORD === "string" && env.ADMIN_PASSWORD.length >= 8;

async function adminLogin(req, env, db) {
  if (!adminPasswordReady(env)) return fail(503, "관리자 비밀번호가 아직 설정되지 않았습니다.");
  const ip = await ipHash(req);
  const { n } = await db.prepare("SELECT COUNT(*) AS n FROM login_attempts WHERE ip_hash = ? AND at > ?").bind(ip, ago(15)).first();
  if (n >= 5) return fail(429, "로그인 시도가 너무 많습니다. 15분 뒤에 다시 시도해 주세요.");
  const b = await req.json().catch(() => ({}));
  if ((await sha256(String(b.password ?? ""))) !== (await sha256(env.ADMIN_PASSWORD))) {
    await db.prepare("INSERT INTO login_attempts (ip_hash, at) VALUES (?, ?)").bind(ip, now()).run();
    return fail(401, "비밀번호가 올바르지 않습니다.");
  }
  const sid = token(), t = now();
  await db.batch([
    db.prepare("DELETE FROM login_attempts WHERE at < ?").bind(ago(60)),
    db.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(t),
    db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, 0, ?)").bind(await sha256(sid), new Date(Date.now() + ADMIN_HOURS * 36e5).toISOString()),
  ]);
  return json({ ok: true }, 200, { "set-cookie": cookie(ADMIN_COOKIE, sid, ADMIN_HOURS * 3600) });
}

async function adminSession(req, db) {
  const sid = readCookies(req)[ADMIN_COOKIE];
  if (!sid) return false;
  return !!(await db.prepare("SELECT 1 AS ok FROM sessions WHERE token_hash = ? AND user_id = 0 AND expires_at > ?").bind(await sha256(sid), now()).first());
}

// ───────── 카카오 로그인 ─────────
async function kakaoLogin(url, env) {
  if (!env.KAKAO_REST_KEY) return redirect("/mypage.html?error=config");
  const state = token();
  const next = safeNext(url.searchParams.get("next"));
  const q = new URLSearchParams({ response_type: "code", client_id: env.KAKAO_REST_KEY, redirect_uri: `${url.origin}/api/auth/kakao/callback`, state });
  return redirect(`https://kauth.kakao.com/oauth/authorize?${q}`, [cookie(STATE_COOKIE, `${state}.${encodeURIComponent(next)}`, 600)]);
}

async function kakaoCallback(req, url, env, db) {
  const [state, nextEnc] = (readCookies(req)[STATE_COOKIE] || "").split(".");
  const code = url.searchParams.get("code");
  const clear = cookie(STATE_COOKIE, "", 0);
  if (!code || !state || state !== url.searchParams.get("state")) return redirect("/mypage.html?error=login", [clear]);

  const body = new URLSearchParams({ grant_type: "authorization_code", client_id: env.KAKAO_REST_KEY, redirect_uri: `${url.origin}/api/auth/kakao/callback`, code });
  if (env.KAKAO_CLIENT_SECRET) body.set("client_secret", env.KAKAO_CLIENT_SECRET);
  const tk = await fetch("https://kauth.kakao.com/oauth/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded;charset=utf-8" }, body }).then((r) => r.json()).catch(() => null);
  if (!tk?.access_token) return redirect("/mypage.html?error=login", [clear]);
  const me = await fetch("https://kapi.kakao.com/v2/user/me", { headers: { authorization: `Bearer ${tk.access_token}` } }).then((r) => r.json()).catch(() => null);
  if (!me?.id) return redirect("/mypage.html?error=login", [clear]);

  const kakaoId = String(me.id);
  const nickname = clean(me.kakao_account?.profile?.nickname || me.properties?.nickname || "", 50);
  const t = now();
  await db.prepare("INSERT INTO users (kakao_id, nickname, created_at, last_login_at) VALUES (?, ?, ?, ?) ON CONFLICT(kakao_id) DO UPDATE SET nickname = excluded.nickname, last_login_at = excluded.last_login_at").bind(kakaoId, nickname, t, t).run();
  const user = await db.prepare("SELECT * FROM users WHERE kakao_id = ?").bind(kakaoId).first();

  const sid = token();
  const exp = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  await db.batch([
    db.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(t),
    db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").bind(await sha256(sid), user.id, exp),
  ]);
  const next = profileDone(user) ? safeNext(decodeURIComponent(nextEnc || "")) : "/mypage.html?welcome=1";
  return redirect(next, [clear, cookie(COOKIE, sid, SESSION_DAYS * 86400)]);
}

// ───────── 회원 ─────────
async function saveProfile(req, user, db) {
  const b = await req.json().catch(() => ({}));
  const name = clean(b.name, 30), phone = clean(b.phone, 20).replace(/[^0-9]/g, "");
  if (!name) return fail(400, "성명을 입력해 주세요.");
  if (!/^0\d{8,10}$/.test(phone)) return fail(400, "휴대폰 번호를 정확히 입력해 주세요.");
  const email = clean(b.email, 100);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(400, "이메일 형식이 올바르지 않습니다.");
  const birth = clean(b.birth, 10);
  if (birth && !(/^\d{4}-\d{2}-\d{2}$/.test(birth) && !Number.isNaN(Date.parse(birth)) && birth < now().slice(0, 10))) return fail(400, "생년월일을 정확히 입력해 주세요.");
  const position = POSITIONS.includes(b.position) ? b.position : "";
  if (!user.agreed_at && b.agree !== true) return fail(400, "개인정보 수집·이용에 동의해 주세요.");
  const t = now();
  await db.prepare("UPDATE users SET name = ?, phone = ?, email = ?, shop = ?, region = ?, birth = ?, position = ?, career_years = ?, agreed_at = COALESCE(agreed_at, ?), updated_at = ? WHERE id = ?")
    .bind(name, phone, email, clean(b.shop, 60), clean(b.region, 60), birth, position, b.careerYears === "" || b.careerYears == null ? null : int(b.careerYears, 0, 70), t, t, user.id).run();
  return json({ ok: true });
}

async function deleteMe(user, db) {
  await db.batch([
    db.prepare("DELETE FROM enrollments WHERE user_id = ?").bind(user.id),
    db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(user.id),
    db.prepare("DELETE FROM users WHERE id = ?").bind(user.id),
  ]);
  return json({ ok: true }, 200, { "set-cookie": cookie(COOKIE, "", 0) });
}

// ───────── 과정 · 수강 신청 ─────────
const COURSE_SELECT = "SELECT c.*, (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status != 'cancelled') AS applied FROM courses c";

async function listCourses(user, db) {
  const { results } = await db.prepare(`${COURSE_SELECT} ORDER BY c.sort, c.id`).all();
  const mine = {};
  if (user) (await db.prepare("SELECT course_id, status FROM enrollments WHERE user_id = ?").bind(user.id).all()).results.forEach((e) => (mine[e.course_id] = e.status));
  return json({ courses: results.map((c) => ({ ...c, my: mine[c.id] || null })) });
}

async function enroll(req, user, db) {
  if (!profileDone(user)) return fail(403, "수강 신청 전에 마이페이지에서 회원 정보를 먼저 입력해 주세요.");
  const b = await req.json().catch(() => ({}));
  const course = await db.prepare(`${COURSE_SELECT} WHERE c.id = ?`).bind(int(b.courseId, 0, 1e9)).first();
  if (!course) return fail(404, "과정을 찾을 수 없습니다.");
  if (course.status !== "open") return fail(409, "지금은 신청을 받지 않는 과정입니다.");
  const prev = await db.prepare("SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?").bind(user.id, course.id).first();
  if (prev && prev.status !== "cancelled") return fail(409, "이미 신청한 과정입니다.");
  if (course.capacity > 0 && course.applied >= course.capacity) return fail(409, "정원이 마감되었습니다.");
  const t = now(), memo = clean(b.memo, 300);
  if (prev) await db.prepare("UPDATE enrollments SET status = 'applied', paid = 0, memo = ?, updated_at = ? WHERE id = ?").bind(memo, t, prev.id).run();
  else await db.prepare("INSERT INTO enrollments (user_id, course_id, memo, created_at) VALUES (?, ?, ?, ?)").bind(user.id, course.id, memo, t).run();
  return json({ ok: true });
}

async function myEnrollments(user, db) {
  const { results } = await db.prepare("SELECT e.id, e.status, e.paid, e.memo, e.created_at, c.title, c.schedule, c.place, c.fee FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE e.user_id = ? ORDER BY e.id DESC").bind(user.id).all();
  return json({ enrollments: results });
}

async function cancelEnrollment(id, user, db) {
  const r = await db.prepare("UPDATE enrollments SET status = 'cancelled', updated_at = ? WHERE id = ? AND user_id = ? AND status != 'cancelled'").bind(now(), id, user.id).run();
  return r.meta.changes ? json({ ok: true }) : fail(404, "신청 내역을 찾을 수 없습니다.");
}

// ───────── 관리자 ─────────
const MEMBER_SQL = "SELECT id, kakao_id, nickname, name, phone, email, shop, region, birth, position, career_years, agreed_at, created_at, last_login_at FROM users ORDER BY id DESC";
const ENROLL_SQL = "SELECT e.id, e.status, e.paid, e.memo, e.created_at, c.id AS course_id, c.title, c.fee, u.name, u.nickname, u.phone, u.shop, u.region, u.position FROM enrollments e JOIN courses c ON c.id = e.course_id JOIN users u ON u.id = e.user_id ORDER BY e.id DESC";

function courseInput(b) {
  const title = clean(b.title, 80);
  if (!title) return null;
  return [title, clean(b.summary, 300), clean(b.schedule, 100), clean(b.place, 100), int(b.fee, 0, 1e8), int(b.capacity, 0, 100000), COURSE_STATUS.includes(b.status) ? b.status : "preparing", int(b.sort, 0, 9999)];
}

function csv(rows, columns) {
  const cell = (v) => {
    let s = v == null ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;   // 엑셀 수식 실행 방지
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [columns.map((c) => cell(c[1])).join(","), ...rows.map((r) => columns.map((c) => cell(typeof c[0] === "function" ? c[0](r) : r[c[0]])).join(","))];
  return "﻿" + lines.join("\r\n");
}
const STATUS_KO = { applied: "신청", confirmed: "확정", cancelled: "취소" };
const APP_KO = { new: "신규", progress: "처리 중", done: "완료" };
const APP_SQL = "SELECT id, type, name, phone, shop, region, interests, message, status, note, created_at, updated_at FROM applications ORDER BY id DESC";

async function admin(req, url, parts, db) {
  const [res, id] = parts, method = req.method;
  if (res === "applications" && !id && method === "GET") return json({ applications: (await db.prepare(APP_SQL).all()).results });
  if (res === "applications" && id && method === "POST") {
    const b = await req.json().catch(() => ({}));
    if (!APP_STATUS.includes(b.status)) return fail(400, "상태 값이 올바르지 않습니다.");
    const r = await db.prepare("UPDATE applications SET status = ?, note = ?, updated_at = ? WHERE id = ?").bind(b.status, clean(b.note, 300), now(), int(id, 0, 1e9)).run();
    return r.meta.changes ? json({ ok: true }) : fail(404, "신청 내역을 찾을 수 없습니다.");
  }
  if (res === "applications" && id && method === "DELETE") {
    const r = await db.prepare("DELETE FROM applications WHERE id = ?").bind(int(id, 0, 1e9)).run();
    return r.meta.changes ? json({ ok: true }) : fail(404, "신청 내역을 찾을 수 없습니다.");
  }
  if (res === "members" && method === "GET") return json({ members: (await db.prepare(MEMBER_SQL).all()).results });
  if (res === "enrollments" && method === "GET") return json({ enrollments: (await db.prepare(ENROLL_SQL).all()).results });
  if (res === "enrollments" && id && method === "POST") {
    const b = await req.json().catch(() => ({}));
    if (!ENROLL_STATUS.includes(b.status)) return fail(400, "상태 값이 올바르지 않습니다.");
    const r = await db.prepare("UPDATE enrollments SET status = ?, paid = ?, updated_at = ? WHERE id = ?").bind(b.status, b.paid ? 1 : 0, now(), int(id, 0, 1e9)).run();
    return r.meta.changes ? json({ ok: true }) : fail(404, "신청 내역을 찾을 수 없습니다.");
  }
  if (res === "courses" && !id && method === "POST") {
    const v = courseInput(await req.json().catch(() => ({})));
    if (!v) return fail(400, "과정명을 입력해 주세요.");
    await db.prepare("INSERT INTO courses (title, summary, schedule, place, fee, capacity, status, sort, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(...v, now()).run();
    return json({ ok: true });
  }
  if (res === "courses" && id && method === "PUT") {
    const v = courseInput(await req.json().catch(() => ({})));
    if (!v) return fail(400, "과정명을 입력해 주세요.");
    const r = await db.prepare("UPDATE courses SET title = ?, summary = ?, schedule = ?, place = ?, fee = ?, capacity = ?, status = ?, sort = ? WHERE id = ?").bind(...v, int(id, 0, 1e9)).run();
    return r.meta.changes ? json({ ok: true }) : fail(404, "과정을 찾을 수 없습니다.");
  }
  if (res === "courses" && id && method === "DELETE") {
    const { n } = await db.prepare("SELECT COUNT(*) AS n FROM enrollments WHERE course_id = ?").bind(int(id, 0, 1e9)).first();
    if (n) return fail(409, "신청 내역이 있는 과정은 삭제할 수 없습니다. 상태를 '마감'으로 바꿔 주세요.");
    await db.prepare("DELETE FROM courses WHERE id = ?").bind(int(id, 0, 1e9)).run();
    return json({ ok: true });
  }
  if (res === "export" && method === "GET") {
    const type = url.searchParams.get("type");
    let text, name;
    if (type === "members") {
      name = "members";
      text = csv((await db.prepare(MEMBER_SQL).all()).results, [["id", "번호"], ["name", "성명"], ["nickname", "카카오 닉네임"], ["phone", "휴대폰"], ["email", "이메일"], ["shop", "매장명"], ["region", "지역"], ["birth", "생년월일"], ["position", "직책"], ["career_years", "경력(년)"], ["created_at", "가입일시(UTC)"], ["last_login_at", "최근 로그인(UTC)"]]);
    } else if (type === "applications") {
      name = "applications";
      text = csv((await db.prepare(APP_SQL).all()).results, [["id", "번호"], ["type", "구분"], ["name", "성명"], ["phone", "연락처"], ["shop", "매장명"], ["region", "지역"], ["interests", "관심 분야"], ["message", "내용"], [(r) => APP_KO[r.status], "상태"], ["note", "관리자 메모"], ["created_at", "접수일시(UTC)"]]);
    } else if (type === "enrollments") {
      name = "enrollments";
      text = csv((await db.prepare(ENROLL_SQL).all()).results, [["id", "번호"], ["title", "과정"], ["name", "성명"], ["phone", "휴대폰"], ["shop", "매장명"], ["region", "지역"], ["position", "직책"], [(r) => STATUS_KO[r.status], "상태"], [(r) => (r.paid ? "확인" : "미확인"), "입금"], ["fee", "수강료"], ["memo", "메모"], ["created_at", "신청일시(UTC)"]]);
    } else return fail(400, "type 값이 올바르지 않습니다.");
    return new Response(text, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="kbbma-${name}-${now().slice(0, 10)}.csv"`, "cache-control": "no-store" } });
  }
  return fail(404, "없는 주소입니다.");
}

// ───────── 라우터 ─────────
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const parts = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  const route = parts.join("/"), method = request.method;
  try {
    if (!env.DB) return fail(503, "데이터베이스가 아직 연결되지 않았습니다.");
    // 다른 사이트에서 보낸 변경 요청 차단
    if (method !== "GET" && method !== "HEAD" && request.headers.get("origin") !== url.origin) return fail(403, "허용되지 않은 요청입니다.");
    const db = env.DB;
    await init(db);

    if (route === "auth/kakao/login" && method === "GET") return kakaoLogin(url, env);
    if (route === "auth/kakao/callback" && method === "GET") return kakaoCallback(request, url, env, db);

    if (route === "applications" && method === "POST") return submitApplication(request, db);
    if (route === "admin/login" && method === "POST") return adminLogin(request, env, db);
    if (route === "admin/logout" && method === "POST") {
      const sid = readCookies(request)[ADMIN_COOKIE];
      if (sid) await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(sid)).run();
      return json({ ok: true }, 200, { "set-cookie": cookie(ADMIN_COOKIE, "", 0) });
    }

    const user = await currentUser(request, db);
    const isAdminNow = isAdmin(user, env) || (await adminSession(request, db));
    if (route === "me" && method === "GET") return json({ user: publicUser(user, env), admin: isAdminNow, adminLoginReady: adminPasswordReady(env), loginReady: !!env.KAKAO_REST_KEY, positions: POSITIONS, appTypes: APP_TYPES });
    if (parts[0] === "admin") {
      if (!isAdminNow) return fail(user ? 403 : 401, "관리자만 사용할 수 있습니다.");
      return admin(request, url, parts.slice(1), db);
    }
    if (route === "courses" && method === "GET") return listCourses(user, db);
    if (route === "logout" && method === "POST") {
      const sid = readCookies(request)[COOKIE];
      if (sid) await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(sid)).run();
      return json({ ok: true }, 200, { "set-cookie": cookie(COOKIE, "", 0) });
    }

    if (!user) return fail(401, "로그인이 필요합니다.");
    if (route === "profile" && method === "PUT") return saveProfile(request, user, db);
    if (route === "me" && method === "DELETE") return deleteMe(user, db);
    if (route === "enrollments" && method === "GET") return myEnrollments(user, db);
    if (route === "enrollments" && method === "POST") return enroll(request, user, db);
    if (parts[0] === "enrollments" && parts[2] === "cancel" && method === "POST") return cancelEnrollment(int(parts[1], 0, 1e9), user, db);

    return fail(404, "없는 주소입니다.");
  } catch (e) {
    console.error(e);
    return fail(500, "처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
  }
}
