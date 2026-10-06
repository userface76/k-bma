# 대한미용경영자협회 홈페이지

https://kbbma.org — Cloudflare Pages에 배포되는 사이트입니다. 빌드 과정은 없습니다.

## 구성
- `index.html` 첫 화면, `greeting.html` 인사말, `about.html` 협회소개, `support.html` 경영지원·교육, `news.html` 협회소식, `join.html` 회원안내
- `academy.html` 아카데미 수강 신청, `mypage.html` 로그인·회원 정보·신청 내역, `admin.html` 관리자, `privacy.html` 개인정보처리방침
- `assets/site.js` 메뉴, 연락처(`SITE`), 게시글(`POSTS`), 갤러리(`GALLERY`), 광고 배너(`WING_ADS`)
- `assets/member.js` 수강 신청·마이페이지·관리자 화면
- `functions/api/[[path]].js` 회원·수강 신청 서버 (Pages Functions + D1)

## Cloudflare Pages 설정
- Framework preset: None / Build command: 비움 / Build output directory: `/`

## 가입·문의 접수와 관리자 페이지를 켜려면 (한 번만)
1. **D1 데이터베이스**: Cloudflare > Storage & databases > D1 에서 `kbbma-db` 생성.
   표는 사이트가 처음 열릴 때 자동으로 만들어집니다.
2. **바인딩**: Pages 프로젝트 `k-bma` > Settings > Bindings > Add > D1 database,
   Variable name은 반드시 `DB`, 데이터베이스는 `kbbma-db`.
3. **관리자 비밀번호**: Pages 프로젝트 > Settings > Variables and Secrets 에
   `ADMIN_PASSWORD` 를 Secret 유형으로 등록 (8자 이상).
4. Deployments에서 **Retry deployment**로 다시 배포.

이후 `join.html`의 가입·문의 신청이 DB에 저장되고, `https://kbbma.org/admin.html` 에서
비밀번호로 로그인해 신청 내역을 확인·처리·엑셀(CSV) 저장할 수 있습니다.
비밀번호를 5번 틀리면 15분 동안 로그인이 잠깁니다.

## 카카오 로그인·아카데미 수강 신청 (보류, 나중에 켤 때)
코드는 들어 있지만 `KAKAO_REST_KEY`가 없으면 메뉴에 나타나지 않습니다. 켜려면
`assets/site.js`의 메뉴(`MENU`)에 `academy.html`, `mypage.html` 링크를 다시 넣고,
`privacy.html`에 카카오 로그인·회원 정보 수집 항목을 추가해야 합니다.
1. (위 1~2번 D1 설정은 공통)
3. **카카오 로그인**: developers.kakao.com 에서 애플리케이션 생성 후
   - 플랫폼 > Web 사이트 도메인: `https://kbbma.org`
   - 카카오 로그인 활성화, Redirect URI: `https://kbbma.org/api/auth/kakao/callback`
   - 동의 항목: 닉네임
4. **환경 변수**: Pages 프로젝트 > Settings > Variables and Secrets
   - `KAKAO_REST_KEY` : 카카오 REST API 키
   - `KAKAO_CLIENT_SECRET` : 카카오에서 Client Secret을 켠 경우에만
   - `ADMIN_KAKAO_IDS` : 관리자의 회원번호(마이페이지 하단에 표시), 여러 명이면 쉼표로 구분
5. 설정을 바꾼 뒤에는 Deployments에서 **Retry deployment**로 다시 배포해야 적용됩니다.

## 내용 수정
연락처, 입금 계좌, 게시글 등은 `assets/site.js` 맨 위 항목만 고치면 전 페이지에 반영됩니다.
수강 과정은 관리자 페이지의 "과정 관리"에서 등록·수정합니다.
