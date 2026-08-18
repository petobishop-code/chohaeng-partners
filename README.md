# 초행파트너스 웹사이트

## 포함 파일
- 메인, 회사소개, 서비스, 투자정보, 무료교육, 상담신청, FAQ, 개인정보처리방침
- SEO 내부 페이지 5개
- 반응형 CSS / 모바일 메뉴
- 상담 폼 + Vercel API
- sitemap.xml / robots.txt

## DB 연결
Vercel 프로젝트 환경변수 `DB_WEBHOOK_URL`에 실제 DB 수집용 webhook URL을 등록하면 `/api/inquiry`가 상담 신청 데이터를 전달합니다. 미설정 상태에서는 개인정보가 외부로 전송되지 않습니다.

## 배포 전 확인
1. 실제 배포 URL이 `https://chohaeng-partners.vercel.app`과 다르면 sitemap.xml / robots.txt의 주소 변경
2. 개인정보처리방침의 실제 운영자·보유기간·제3자 제공 정보 확정
3. 실제 회사 사업자/연락처 정보가 있으면 footer 반영
