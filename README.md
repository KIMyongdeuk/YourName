# 너의이름은:예술이된다

AI를 활용하여 이름으로 삼행시와 캘리그라피를 생성하는 웹 애플리케이션입니다.

## 🎨 기능

- **이름 입력**: 한국어, 영어, 스페인어 이름 지원
- **AI 삼행시 생성**: OpenAI GPT-4를 사용한 창의적인 시 생성
- **캘리그라피 생성**: 4가지 스타일의 아름다운 붓글씨
  - 전통 스타일 (SSFlowerRoadRegular 폰트)
  - 현대 스타일
  - 세련된 스타일
  - 고전 스타일
- **이미지 다운로드**: 생성된 캘리그라피를 PNG로 저장

## 🚀 사용 방법

1. [OpenAI 플랫폼](https://platform.openai.com/api-keys)에서 API 키 발급
2. 웹사이트에서 API 키 입력
3. 이름과 분위기 선택
4. AI가 생성한 삼행시 중 하나 선택
5. 4가지 스타일의 캘리그라피 결과 확인 및 다운로드

## 🔧 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI**: OpenAI GPT-4 API
- **그래픽**: HTML5 Canvas
- **폰트**: SSFlowerRoadRegular, Google Fonts

## 📝 설치 및 실행

### GitHub Pages로 바로 사용하기
1. 이 저장소를 Fork
2. Repository Settings > Pages에서 GitHub Pages 활성화
3. 생성된 URL로 접속

### 로컬에서 실행하기
```bash
git clone https://github.com/[your-username]/yourname-art.git
cd yourname-art
# 웹 서버 실행 (예: Live Server, Python SimpleHTTPServer 등)
python -m http.server 8000
```

## ⚠️ 중요 사항

- **API 키 보안**: 개인 OpenAI API 키를 안전하게 관리하세요
- **사용량 모니터링**: OpenAI API 사용량과 비용을 주기적으로 확인하세요
- **브라우저 호환성**: 최신 브라우저에서 사용을 권장합니다

## 🔧 폰트 문제 해결

### SSFlowerRoadRegular.ttf 폰트가 적용되지 않는 경우:

**해결법 1: 폰트 변환 (권장)**
1. [CloudConvert](https://cloudconvert.com/ttf-to-woff2) 등에서 TTF → WOFF2 변환
2. 변환된 파일로 교체
3. CSS에서 `format('woff2')` 사용

**해결법 2: 대체 폰트 사용**
- 현재 설정된 폴백 폰트들이 자동으로 적용됩니다
- UhBeeSeulvely, Nanum Brush Script 등이 사용됩니다

**해결법 3: 웹 폰트 서비스 사용**
```css
@import url('https://fonts.googleapis.com/css2?family=Nanum+Brush+Script&display=swap');
```

## 📜 라이선스

MIT License

## 🤝 기여하기

이슈나 풀 리퀘스트를 통해 프로젝트 개선에 참여해주세요!

---

**주의**: 이 프로젝트는 교육 및 개인 사용 목적으로 제작되었습니다. 상업적 사용 시 OpenAI 이용약관을 확인하세요. 