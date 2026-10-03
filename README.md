# 대한미용경영자협회 홈페이지

정적 HTML 사이트입니다. 빌드 과정 없이 그대로 배포합니다.

## 구성
- `index.html` 첫 화면
- `greeting.html` 이사장 인사말
- `about.html` 협회소개
- `support.html` 경영지원·교육
- `news.html` 협회소식
- `join.html` 회원안내
- `assets/style.css` 디자인
- `assets/site.js` 메뉴, 연락처(`SITE`), 게시글(`POSTS`)

## Cloudflare Pages 설정
- Framework preset: None
- Build command: (비워 둠)
- Build output directory: `/`

## 내용 수정
연락처와 게시글은 `assets/site.js` 맨 위의 `SITE`, `POSTS`만 고치면 전 페이지에 반영됩니다.
