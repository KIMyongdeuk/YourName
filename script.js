let openai;

// OpenAI 초기화 함수
async function initializeOpenAI(apiKey) {
    console.log('Starting OpenAI initialization...');
    console.log('window.OpenAI:', window.OpenAI);
    
    if (typeof window.OpenAI === 'undefined') {
        console.error('OpenAI library not found in window object');
        throw new Error('OpenAI library not loaded');
    }

    try {
        console.log('Creating OpenAI instance...');
        openai = new window.OpenAI({
            apiKey: apiKey
        });
        console.log('OpenAI instance created successfully');
        return openai;
    } catch (error) {
        console.error('Detailed error during OpenAI initialization:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        throw error;
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, setting up event listeners...');
    
    // 폰트 로딩 확인
    await checkFontLoading();
    
    setupEventListeners();
});

// 폰트 로딩 확인 함수
async function checkFontLoading() {
    try {
        // FontFace API를 사용하여 폰트 로딩 확인
        if ('fonts' in document) {
            const font = new FontFace('SSFlowerRoadRegular', 'url(./SSFlowerRoadRegular.ttf)');
            await font.load();
            document.fonts.add(font);
            console.log('SSFlowerRoadRegular 폰트 로딩 성공');
            
            const faithfulnessFont = new FontFace('SSFaithfulness', 'url(./SSFaithfulness.ttf)');
            await faithfulnessFont.load();
            document.fonts.add(faithfulnessFont);
            console.log('SSFaithfulness 폰트 로딩 성공');
            
            const samulnoriFont = new FontFace('CallifontSamulnori-Medium', 'url(./CallifontSamulnori-Medium.ttf)');
            await samulnoriFont.load();
            document.fonts.add(samulnoriFont);
            console.log('CallifontSamulnori-Medium 폰트 로딩 성공');
            
            const rockFont = new FontFace('SSRockRegular', 'url(./SSRockRegular.ttf)');
            await rockFont.load();
            document.fonts.add(rockFont);
            console.log('SSRockRegular 폰트 로딩 성공');
        }
    } catch (error) {
        console.warn('폰트 로딩 실패, 대체 폰트 사용:', error);
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    const apiKeyForm = document.getElementById('apiKeyForm');
    const nameForm = document.getElementById('nameForm');
    const createBtn = document.getElementById('createBtn');
    const resultsSection = document.querySelector('.results-section');
    const calligraphySection = document.querySelector('.calligraphy-section');
    const resultsGrid = document.getElementById('resultsGrid');
    const calligraphyContainer = document.getElementById('calligraphyContainer');
    const customTextBtn = document.getElementById('customTextBtn');
    const customTextModal = document.getElementById('customTextModal');
    const customTextForm = document.getElementById('customTextForm');
    const closeCustomModal = document.getElementById('closeCustomModal');
    const cancelCustomText = document.getElementById('cancelCustomText');

    // 1단계: API 키 입력 폼 제출
    apiKeyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('API Key form submitted');

        const apiKey = document.getElementById('apiKey').value;
        
        if (!apiKey) {
            alert('OpenAI API 키를 입력해주세요.');
            return;
        }

        // API 키 유효성 검사 및 OpenAI 초기화
        const apiKeyBtn = document.getElementById('apiKeyBtn');
        apiKeyBtn.disabled = true;
        apiKeyBtn.textContent = '확인 중...';

        try {
            await initializeOpenAI(apiKey);
            console.log('OpenAI initialized successfully');
            
            // 성공 시 2단계로 이동
            showStep2();
            
        } catch (error) {
            console.error('Failed to initialize OpenAI:', error);
            alert('OpenAI 초기화에 실패했습니다. API 키를 확인해주세요.');
        } finally {
            apiKeyBtn.disabled = false;
            apiKeyBtn.textContent = 'API 키 입력';
        }
    });

    // 2단계: 이름 및 설정 폼 제출
    nameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Name form submitted');

        const name = document.getElementById('name').value;
        const mood = document.getElementById('mood').value;
        const language = document.getElementById('language').value;

        if (!name) {
            alert('이름을 입력해주세요.');
            return;
        }

        if (!openai) {
            alert('OpenAI가 초기화되지 않았습니다. 이전 단계로 돌아가서 다시 시도해주세요.');
            return;
        }

        console.log('Input values:', { name, mood, language });

        // 버튼 비활성화 및 로딩 상태 표시
        createBtn.disabled = true;
        createBtn.textContent = '생성 중...';
        resultsGrid.innerHTML = '<div class="loading">문구 생성 중...</div>';
        resultsSection.style.display = 'block';
        calligraphySection.style.display = 'none';

        // 게이지바 시작
        const progressBarContainer = document.getElementById('progressBarContainer');
        const progressBar = document.getElementById('progressBar');
        let progress = 0;
        let progressInterval;

        function startProgressBar() {
            progress = 0;
            progressBar.style.width = '0%';
            progressBarContainer.style.display = 'block';
            const duration = 12000; // 12초 동안 진행 (기존 5초에서 7초 추가)
            const startTime = Date.now();
            progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                progress = Math.min(95, (elapsed / duration) * 100);
                progressBar.style.width = progress + '%';
                if (progress >= 95) {
                    clearInterval(progressInterval);
                }
            }, 50);
        }

        function stopProgressBar() {
            clearInterval(progressInterval);
            progressBar.style.width = '100%';
            setTimeout(() => {
                progressBarContainer.style.display = 'none';
                progressBar.style.width = '0%';
            }, 400);
        }

        startProgressBar();

        try {
            const phrases = await generatePhrases(name, mood, language);
            displayPhrases(phrases);
        } catch (error) {
            console.error('Error:', error);
            resultsGrid.innerHTML = '<div class="error">생성 중 오류가 발생했습니다.</div>';
        } finally {
            stopProgressBar();
            // 버튼 상태 복원
            createBtn.disabled = false;
            createBtn.textContent = '추천문구 생성하기';
        }
    });

    // 캘리그라피 이미지 클릭 이벤트
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('calligraphy-image')) {
            showPreview(e.target.src);
        }
    });
    
    // 미리보기 모달 설정
    setupPreviewModal();

    // 커스텀 텍스트 버튼 클릭 이벤트
    customTextBtn.addEventListener('click', () => {
        customTextModal.classList.add('show');
    });

    // 커스텀 텍스트 모달 닫기
    closeCustomModal.onclick = function() {
        customTextModal.classList.remove('show');
    }

    // 커스텀 텍스트 모달 외부 클릭시 닫기
    window.onclick = function(event) {
        if (event.target === customTextModal) {
            customTextModal.classList.remove('show');
        }
    }

    // 커스텀 텍스트 취소 버튼
    cancelCustomText.addEventListener('click', () => {
        customTextModal.classList.remove('show');
        document.getElementById('customText').value = '';
    });

    // 커스텀 텍스트 폼 제출
    customTextForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const customText = document.getElementById('customText').value.trim();
        if (!customText) {
            alert('텍스트를 입력해주세요.');
            return;
        }

        // 모달 닫기
        customTextModal.classList.remove('show');
        
        // 커스텀 텍스트로 캘리그라피 생성
        await generateCustomCalligraphy(customText);
    });
}

// ChatGPT를 사용한 문구 생성 함수
async function generatePhrases(name, mood, language) {
    console.log('Generating phrases with parameters:', { name, mood, language });
    try {
        if (!openai) {
            throw new Error('OpenAI client is not initialized');
        }

        // 이름의 글자 수 계산
        const nameLength = name.length;
        console.log('Name length:', nameLength);

        let systemPrompt;
        if (language === 'ko') {
            systemPrompt = `You are a creative poet specializing in 삼행시 (Korean word play poetry).
            Create exactly 4 different 삼행시 using the given name where each line MUST start with the exact letter from the name.
            
            Rules for Korean (ko):
            1. Each line MUST start with the EXACT letter from the name
            2. The first letter of each line MUST match the corresponding letter in the name
            3. Each line should be a natural Korean sentence
            4. The overall mood should be ${mood}
            5. Each version should express the mood in a DIFFERENT way
            6. Create EXACTLY 4 different versions
            7. Number each version (1, 2, 3, 4)
            8. Separate each version with a blank line
            9. Each version MUST start with a number (1, 2, 3, or 4)
            10. Each line MUST start with the letter followed by a colon (:)
            
            Example for Korean (if name is "김철수" and mood is "감동적인"):
            1
            김: 김밥처럼 맛있는 우리의 추억
            철: 철새처럼 자유롭게 날아가는 꿈
            수: 수영장에서 즐거운 여름날의 기억

            2
            김: 김치찌개처럼 따뜻한 마음
            철: 철도처럼 멀리 달려가는 희망
            수: 수박처럼 달콤한 우리의 사랑

            3
            김: 김밥처럼 쌓아가는 우리의 미래
            철: 철새처럼 높이 날아가는 꿈
            수: 수영장처럼 넓은 우리의 세계

            4
            김: 김밥처럼 감싸주는 따뜻한 마음
            철: 철새처럼 자유로운 영혼
            수: 수박처럼 달콤한 인생의 순간`;
        } else {
            systemPrompt = `You are a creative poet specializing in acrostic poems.
            Create exactly 4 different acrostic poems using the given name where each line MUST start with the corresponding letter of the name.
            
            Rules for ${language === 'en' ? 'English' : 'Spanish'}:
            1. Each line must start with the corresponding letter of the name
            2. Each line must be a natural sentence in ${language === 'en' ? 'English' : 'Spanish'}
            3. The overall mood should be ${mood}
            4. Each version should express the mood differently
            5. Create EXACTLY 4 different versions
            6. Number each version (1, 2, 3, 4)
            7. Separate each version with a blank line
            8. Each version MUST start with a number (1, 2, 3, or 4)
            9. Each line MUST start with the letter followed by a colon (:)
            
            Example for English (if name is "John" and mood is "romantic"):
            1
            J: Joy fills my heart when I see you
            O: Our love story is like a beautiful dream
            H: Happiness surrounds us every day
            N: Never-ending love is what we share

            2
            J: Journey of love begins with you
            O: Only you make my heart skip a beat
            H: Holding hands under the moonlight
            N: Never want to let you go

            3
            J: Just the thought of you makes me smile
            O: Our hearts beat as one
            H: Heaven is being with you
            N: Nothing compares to your love

            4
            J: Joyful moments we share together
            O: Our love grows stronger each day
            H: Happiness is being with you
            N: Never-ending love story we write`;
        }

        const response = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `Create 4 different poems for the name: ${name} (${nameLength} letters) in ${language === 'ko' ? 'Korean' : language === 'en' ? 'English' : 'Spanish'}`
                }
            ],
            temperature: 0.9,
            max_tokens: 2000
        });

        console.log('API Response:', response);

        if (!response.choices || !response.choices[0] || !response.choices[0].message) {
            throw new Error('Invalid response from OpenAI API');
        }

        const content = response.choices[0].message.content;
        console.log('Generated content:', content);

        // 번호로 시작하는 줄을 기준으로 4개 블록 추출
        const phrases = [];
        const regex = /\n?([1-4])\n([\s\S]*?)(?=\n[1-4]\n|$)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            // match[2]는 각 삼행시 본문
            const phrase = match[1] + '\n' + match[2].trim();
            phrases.push(phrase);
        }
        console.log('Processed phrases:', phrases);

        if (phrases.length !== 4) {
            console.error('Invalid number of phrases:', phrases);
            console.error('Raw content:', content);
            throw new Error(`Expected 4 phrases, but got ${phrases.length}`);
        }

        // 각 문구의 줄 수 확인
        phrases.forEach((phrase, index) => {
            const lines = phrase.split('\n').filter(line => line.trim());
            if (lines.length !== nameLength + 1) { // +1 for the number line
                throw new Error(`Phrase ${index + 1} has ${lines.length - 1} lines, but should have ${nameLength} lines`);
            }
        });

        return phrases.map((phrase, index) => ({
            text: `${name}님의 ${mood} ${language === 'ko' ? '삼행시' : language === 'en' ? 'poem' : 'poema'}`,
            content: phrase,
            id: index + 1
        }));
    } catch (error) {
        console.error('Detailed error in generatePhrases:', {
            error: error,
            message: error.message,
            stack: error.stack
        });
        throw new Error(`문구 생성 중 오류가 발생했습니다: ${error.message}`);
    }
}

function displayPhrases(phrases) {
    console.log('Displaying phrases:', phrases);
    resultsGrid.innerHTML = '';
    
    phrases.forEach((phrase) => {
        const phraseCard = document.createElement('div');
        phraseCard.className = 'phrase-card';
        
        // 문구를 줄바꿈으로 분리하고 각 줄을 p 태그로 감싸기
        const formattedContent = phrase.content
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.replace(/^\d+\s*/, '').trim()) // 숫자 제거
            .map(line => line.replace(/^(.)(:|：)\s*/, '')) // 첫 글자와 : 제거
            .filter(line => line.length > 0) // 빈 줄 제거
            .map(line => {
                // 20글자가 넘는 경우 두 줄로 나누기
                if (line.length > 20) {
                    const halfLength = Math.ceil(line.length / 2);
                    const firstLine = line.slice(0, halfLength);
                    const secondLine = line.slice(halfLength);
                    return `<p>${firstLine}</p><p>${secondLine}</p>`;
                }
                return `<p>${line}</p>`;
            })
            .join('');
        
        phraseCard.innerHTML = `
            <div class="phrase-content">
                ${formattedContent}
            </div>
            <button class="select-btn" data-id="${phrase.id}">이 문구로 캘리그라피 만들기</button>
        `;
        
        phraseCard.querySelector('.select-btn').addEventListener('click', () => {
            generateCalligraphy(phrase);
        });
        
        resultsGrid.appendChild(phraseCard);
    });
}

// 캘리그라피 생성 함수
async function generateCalligraphy(phrase) {
    try {
        // 로딩 상태 표시
        const calligraphyContainer = document.getElementById('calligraphyContainer');
        calligraphyContainer.innerHTML = `
            <div class="loading-container">
                <h2 class="loading-title">붓글씨 생성 중...</h2>
                <div class="loading-progress">
                    <div class="loading-bar"></div>
                </div>
                <div class="loading-steps">
                    <div class="loading-step active">붓글씨 생성 준비</div>
                    <div class="loading-step">전통 스타일 생성</div>
                    <div class="loading-step">현대 스타일 생성</div>
                    <div class="loading-step">세련된 스타일 생성</div>
                    <div class="loading-step">고전 스타일 생성</div>
                    <div class="loading-step">완료</div>
                </div>
                <div class="loading-time">
                    <span class="estimated-time">예상 소요 시간: 약 5초</span>
                    <span class="elapsed-time">경과 시간: 0초</span>
                </div>
            </div>
        `;

        // 경과 시간 표시 시작
        const startTime = Date.now();
        const elapsedTimeElement = calligraphyContainer.querySelector('.elapsed-time');
        const timeInterval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            elapsedTimeElement.textContent = `경과 시간: ${elapsedSeconds}초`;
        }, 1000);

        // 섹션 전환
        document.querySelector('.results-section').style.display = 'none';
        document.querySelector('.calligraphy-section').style.display = 'block';

        try {
            // 각 스타일별 캘리그라피 생성
            updateLoadingStep(1);
            const traditionalCanvas = await createCalligraphyCanvas(phrase.content, 'traditional');
            
            updateLoadingStep(2);
            const modernCanvas = await createCalligraphyCanvas(phrase.content, 'modern');
            
            updateLoadingStep(3);
            const elegantCanvas = await createCalligraphyCanvas(phrase.content, 'elegant');
            
            updateLoadingStep(4);
            const classicCanvas = await createCalligraphyCanvas(phrase.content, 'classic');

            // 완료 단계 표시
            updateLoadingStep(5);
            clearInterval(timeInterval);

            // 결과 표시
            calligraphyContainer.innerHTML = `
                <div class="calligraphy-grid">
                    <div class="calligraphy-item">
                        <div class="calligraphy-image-container">
                            <img src="${traditionalCanvas.toDataURL()}" alt="전통 붓글씨" class="calligraphy-image">
                        </div>
                        <p class="calligraphy-text">전통 스타일</p>
                        <button class="download-btn" onclick="downloadCanvas('${traditionalCanvas.toDataURL()}', 'traditional-calligraphy')">이미지 저장하기</button>
                    </div>
                    <div class="calligraphy-item">
                        <div class="calligraphy-image-container">
                            <img src="${modernCanvas.toDataURL()}" alt="현대 붓글씨" class="calligraphy-image">
                        </div>
                        <p class="calligraphy-text">현대 스타일</p>
                        <button class="download-btn" onclick="downloadCanvas('${modernCanvas.toDataURL()}', 'modern-calligraphy')">이미지 저장하기</button>
                    </div>
                    <div class="calligraphy-item">
                        <div class="calligraphy-image-container">
                            <img src="${elegantCanvas.toDataURL()}" alt="세련된 붓글씨" class="calligraphy-image">
                        </div>
                        <p class="calligraphy-text">세련된 스타일</p>
                        <button class="download-btn" onclick="downloadCanvas('${elegantCanvas.toDataURL()}', 'elegant-calligraphy')">이미지 저장하기</button>
                    </div>
                    <div class="calligraphy-item">
                        <div class="calligraphy-image-container">
                            <img src="${classicCanvas.toDataURL()}" alt="고전 붓글씨" class="calligraphy-image">
                        </div>
                        <p class="calligraphy-text">고전 스타일</p>
                        <button class="download-btn" onclick="downloadCanvas('${classicCanvas.toDataURL()}', 'classic-calligraphy')">이미지 저장하기</button>
                    </div>
                </div>
                <p class="calligraphy-text">${phrase.content.split('\n').filter(line => line.trim()).map(line => line.replace(/^\d+\s*/, '').trim()).join('<br>')}</p>
            `;

        } catch (error) {
            clearInterval(timeInterval);
            console.error('Error generating calligraphy:', error);
            calligraphyContainer.innerHTML = `
                <div class="error">
                    붓글씨 생성 중 오류가 발생했습니다.
                    <button class="back-btn" onclick="document.querySelector('.results-section').style.display = 'block'; document.querySelector('.calligraphy-section').style.display = 'none';">다시 시도하기</button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 로딩 단계 업데이트 함수
function updateLoadingStep(step) {
    const steps = document.querySelectorAll('.loading-step');
    steps.forEach((s, index) => {
        if (index < step) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });
}

// 캔버스 기반 붓글씨 생성 함수
async function createCalligraphyCanvas(text, style) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1200;
        canvas.height = 600;

        // 폰트 로딩 상태 확인
        console.log('Available fonts:', Array.from(document.fonts.values()).map(f => f.family));
        
        // 항상 패턴 배경만 사용
        const bgPattern = createBackgroundPattern(style);
        ctx.fillStyle = bgPattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (style === 'freehand') {
            drawFreehandCalligraphy();
        } else {
            drawCalligraphyText();
        }
        resolve(canvas);

        // 자유로운 손글씨 스타일 함수
        function drawFreehandCalligraphy() {
            drawText();

            function drawText() {
                const lines = text.split('\n')
                    .filter(line => line.trim())
                    .map(line => line.replace(/^\d+\s*/, '').trim())
                    .map(line => line.replace(/^(.)(:|：)\s*/, ''));
                // 자유로운 줄 간격, 폰트 크기, 위치 랜덤
                let y = 180;
                lines.forEach((line, i) => {
                    const fontSize = 50 + Math.floor(Math.random() * 15) - 7;
                    ctx.font = `bold ${fontSize}px 'SSFlowerRoadRegular', 'UhBeeSeulvely', 'Nanum Brush Script', '나눔손글씨 붓', 'KoPub Batang', 'Noto Serif KR', serif`;
                    ctx.fillStyle = '#222';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    // 20글자가 넘으면 두 줄로 나누기
                    if (line.length > 20) {
                        const halfLength = Math.ceil(line.length / 2);
                        const firstLine = line.slice(0, halfLength);
                        const secondLine = line.slice(halfLength);
                        
                        // 첫 번째 줄
                        const x1 = canvas.width/2 + (Math.random() - 0.5) * 50;
                        ctx.save();
                        ctx.rotate((Math.random() - 0.5) * 0.04);
                        ctx.fillText(firstLine, x1, y);
                        ctx.restore();
                        
                        // 두 번째 줄
                        const x2 = canvas.width/2 + (Math.random() - 0.5) * 50;
                        y += fontSize + 10;
                        ctx.save();
                        ctx.rotate((Math.random() - 0.5) * 0.04);
                        ctx.fillText(secondLine, x2, y);
                        ctx.restore();
                        
                        y += fontSize + 15 + Math.random() * 8;
                    } else {
                        // 한 줄로 표시
                        const x = canvas.width/2 + (Math.random() - 0.5) * 50;
                        ctx.save();
                        ctx.rotate((Math.random() - 0.5) * 0.04);
                        ctx.fillText(line, x, y);
                        ctx.restore();
                        y += fontSize + 15 + Math.random() * 8;
                    }
                });
            }
        }

        function drawCalligraphyText() {
            const fontSize = 53;
            // 스타일에 따른 폰트 설정
            switch(style) {
                case 'traditional':
                    ctx.font = `${fontSize}px 'SSFlowerRoadRegular', 'UhBeeSeulvely', 'Nanum Brush Script', '나눔손글씨 붓', 'KoPub Batang', 'Noto Serif KR', serif`;
                    break;
                case 'modern':
                    ctx.font = `${fontSize}px 'CallifontSamulnori-Medium', 'Noto Serif KR', serif`;
                    break;
                case 'elegant':
                    ctx.font = `${fontSize}px 'SSRockRegular', 'Nanum Brush Script', cursive`;
                    break;
                case 'classic':
                    ctx.font = `${fontSize}px 'SSFaithfulness', 'Noto Serif KR', serif`;
                    break;
            }
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // 스타일에 따른 색상 설정
            switch(style) {
                case 'traditional':
                    ctx.fillStyle = '#000000';
                    ctx.strokeStyle = '#000000';
                    break;
                case 'modern':
                    ctx.fillStyle = '#333333';
                    ctx.strokeStyle = '#333333';
                    break;
                case 'elegant':
                    ctx.fillStyle = '#2c3e50';
                    ctx.strokeStyle = '#2c3e50';
                    break;
                case 'classic':
                    ctx.fillStyle = '#1a1a1a';
                    ctx.strokeStyle = '#1a1a1a';
                    break;
            }
            // 텍스트를 줄바꿈으로 분리하고 숫자/첫글자/콜론 제거
            const lines = text.split('\n')
                .filter(line => line.trim())
                .map(line => line.replace(/^\d+\s*/, '').trim())
                .map(line => line.replace(/^(.)(:|：)\s*/, ''));

            // 20글자가 넘는 줄을 분리하여 새로운 배열 생성
            const processedLines = [];
            lines.forEach(line => {
                if (line.length > 20) {
                    const halfLength = Math.ceil(line.length / 2);
                    processedLines.push(line.slice(0, halfLength));
                    processedLines.push(line.slice(halfLength));
                } else {
                    processedLines.push(line);
                }
            });

            // 중앙 정렬을 위해 전체 텍스트 블록 높이 계산
            const lineHeight = fontSize * 1.3;
            const totalTextHeight = processedLines.length * lineHeight;
            const startY = (canvas.height - totalTextHeight) / 2;

            processedLines.forEach((line, index) => {
                const y = startY + index * lineHeight + lineHeight / 2;
                switch(style) {
                    case 'traditional':
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                        ctx.fillText(line, canvas.width/2 + 4, y + 4);
                        ctx.fillStyle = '#000000';
                        ctx.fillText(line, canvas.width/2, y);
                        addBrushEffect(ctx, line, canvas.width/2, y, fontSize);
                        break;
                    case 'modern':
                        const gradient = ctx.createLinearGradient(0, y - fontSize/2, 0, y + fontSize/2);
                        gradient.addColorStop(0, '#333333');
                        gradient.addColorStop(1, '#666666');
                        ctx.fillStyle = gradient;
                        ctx.fillText(line, canvas.width/2, y);
                        break;
                    case 'elegant':
                        ctx.fillStyle = 'rgba(44, 62, 80, 0.1)';
                        ctx.fillText(line, canvas.width/2 + 3, y + 3);
                        ctx.fillStyle = '#2c3e50';
                        ctx.fillText(line, canvas.width/2, y);
                        addSmoothBrushEffect(ctx, line, canvas.width/2, y, fontSize);
                        break;
                    case 'classic':
                        ctx.fillStyle = '#1a1a1a';
                        ctx.fillText(line, canvas.width/2, y);
                        break;
                }
            });
        }
    });
}

// 붓 터치 효과 추가 함수
function addBrushEffect(ctx, text, x, y, fontSize) {
    const metrics = ctx.measureText(text);
    const width = metrics.width;
    const height = fontSize;
    
    // 랜덤한 붓 터치 추가
    for (let i = 0; i < 5; i++) {
        const offsetX = (Math.random() - 0.5) * width * 0.1;
        const offsetY = (Math.random() - 0.5) * height * 0.1;
        const size = Math.random() * 3 + 1;
        
        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fill();
    }
}

// 부드러운 붓 터치 효과 추가 함수
function addSmoothBrushEffect(ctx, text, x, y, fontSize) {
    const metrics = ctx.measureText(text);
    const width = metrics.width;
    
    // 부드러운 그라데이션 효과
    const gradient = ctx.createLinearGradient(x - width/2, y - fontSize/2, x + width/2, y + fontSize/2);
    gradient.addColorStop(0, 'rgba(44, 62, 80, 0.1)');
    gradient.addColorStop(0.5, 'rgba(44, 62, 80, 0.2)');
    gradient.addColorStop(1, 'rgba(44, 62, 80, 0.1)');
    
    ctx.fillStyle = gradient;
    ctx.fillText(text, x, y);
}

// 배경 패턴 생성 함수
function createBackgroundPattern(style) {
    const patternCanvas = document.createElement('canvas');
    const patternCtx = patternCanvas.getContext('2d');
    
    patternCanvas.width = 200;
    patternCanvas.height = 200;
    
    switch(style) {
        case 'traditional':
            // 전통 스타일 배경: 자연스러운 한지 텍스처
            patternCtx.fillStyle = '#f9f6f0';
            patternCtx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
            
            // 한지 섬유질 효과
            for (let i = 0; i < 2000; i++) {
                const x = Math.random() * patternCanvas.width;
                const y = Math.random() * patternCanvas.height;
                const length = Math.random() * 8 + 2;
                const angle = Math.random() * Math.PI * 2;
                
                patternCtx.strokeStyle = `rgba(220, 200, 180, ${Math.random() * 0.3})`;
                patternCtx.lineWidth = Math.random() * 0.5 + 0.2;
                patternCtx.beginPath();
                patternCtx.moveTo(x, y);
                patternCtx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
                patternCtx.stroke();
            }
            
            // 한지 얼룩 효과
            for (let i = 0; i < 50; i++) {
                const x = Math.random() * patternCanvas.width;
                const y = Math.random() * patternCanvas.height;
                const size = Math.random() * 15 + 5;
                
                patternCtx.fillStyle = `rgba(230, 210, 190, ${Math.random() * 0.2})`;
                patternCtx.beginPath();
                patternCtx.arc(x, y, size, 0, Math.PI * 2);
                patternCtx.fill();
            }
            break;
            
        case 'modern':
            // 현대 스타일 배경: 깔끔한 단색 (순백색)
            patternCtx.fillStyle = '#ffffff';
            patternCtx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
            
            // 매우 미세한 노이즈만 추가 (거의 보이지 않음)
            for (let i = 0; i < 100; i++) {
                const x = Math.random() * patternCanvas.width;
                const y = Math.random() * patternCanvas.height;
                patternCtx.fillStyle = `rgba(245, 245, 245, ${Math.random() * 0.3})`;
                patternCtx.fillRect(x, y, 1, 1);
            }
            break;
            
        case 'elegant':
            // 세련된 스타일 배경: 대리석 패턴
            patternCtx.fillStyle = '#f8f8f8';
            patternCtx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
            
            // 대리석 베인 (정맥) 효과
            for (let i = 0; i < 8; i++) {
                const startX = Math.random() * patternCanvas.width;
                const startY = Math.random() * patternCanvas.height;
                
                patternCtx.strokeStyle = `rgba(200, 200, 200, ${Math.random() * 0.4 + 0.1})`;
                patternCtx.lineWidth = Math.random() * 3 + 1;
                patternCtx.beginPath();
                patternCtx.moveTo(startX, startY);
                
                // 곡선 베인 그리기
                for (let j = 0; j < 20; j++) {
                    const x = startX + (Math.random() - 0.5) * 200;
                    const y = startY + j * 10 + (Math.random() - 0.5) * 20;
                    patternCtx.lineTo(x, y);
                }
                patternCtx.stroke();
            }
            
            // 대리석 점들
            for (let i = 0; i < 200; i++) {
                const x = Math.random() * patternCanvas.width;
                const y = Math.random() * patternCanvas.height;
                const size = Math.random() * 2;
                
                patternCtx.fillStyle = `rgba(180, 180, 180, ${Math.random() * 0.3})`;
                patternCtx.beginPath();
                patternCtx.arc(x, y, size, 0, Math.PI * 2);
                patternCtx.fill();
            }
            break;
            
        case 'classic':
            // 고전 스타일 배경: 오래된 양피지
            patternCtx.fillStyle = '#f5f1e8';
            patternCtx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
            
            // 양피지 나이 얼룩
            for (let i = 0; i < 30; i++) {
                const x = Math.random() * patternCanvas.width;
                const y = Math.random() * patternCanvas.height;
                const size = Math.random() * 25 + 10;
                
                const gradient = patternCtx.createRadialGradient(x, y, 0, x, y, size);
                gradient.addColorStop(0, `rgba(210, 180, 140, ${Math.random() * 0.2})`);
                gradient.addColorStop(1, 'rgba(210, 180, 140, 0)');
                
                patternCtx.fillStyle = gradient;
                patternCtx.beginPath();
                patternCtx.arc(x, y, size, 0, Math.PI * 2);
                patternCtx.fill();
            }
            
            // 양피지 주름 효과
            for (let i = 0; i < 15; i++) {
                const startX = Math.random() * patternCanvas.width;
                const startY = Math.random() * patternCanvas.height;
                const endX = startX + (Math.random() - 0.5) * 100;
                const endY = startY + (Math.random() - 0.5) * 100;
                
                patternCtx.strokeStyle = `rgba(200, 170, 130, ${Math.random() * 0.2})`;
                patternCtx.lineWidth = Math.random() * 1.5 + 0.5;
                patternCtx.beginPath();
                patternCtx.moveTo(startX, startY);
                patternCtx.quadraticCurveTo(
                    startX + (Math.random() - 0.5) * 50,
                    startY + (Math.random() - 0.5) * 50,
                    endX,
                    endY
                );
                patternCtx.stroke();
            }
            
            // 테두리 에이징 효과
            patternCtx.strokeStyle = 'rgba(180, 150, 110, 0.3)';
            patternCtx.lineWidth = 2;
            patternCtx.strokeRect(5, 5, patternCanvas.width - 10, patternCanvas.height - 10);
            break;
    }
    
    return patternCtx.createPattern(patternCanvas, 'repeat');
}

// 커스텀 텍스트로 캘리그라피 생성 함수
async function generateCustomCalligraphy(inputText) {
    try {
        // 텍스트 전처리: 쉼표나 줄바꿈으로 분리
        let lines = [];
        if (inputText.includes(',')) {
            lines = inputText.split(',').map(line => line.trim()).filter(line => line.length > 0);
        } else if (inputText.includes('\n')) {
            lines = inputText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        } else {
            lines = [inputText];
        }

        // 텍스트 포맷팅 (번호 추가)
        const formattedText = lines.map((line, index) => `${index + 1}\n${line}`).join('\n\n');

        // 로딩 상태 표시
        const calligraphyContainer = document.getElementById('calligraphyContainer');
        calligraphyContainer.innerHTML = `
            <div class="loading-container">
                <h2 class="loading-title">커스텀 캘리그라피 생성 중...</h2>
                <div class="loading-progress">
                    <div class="loading-bar"></div>
                </div>
                <div class="loading-steps">
                    <div class="loading-step active">캘리그라피 준비</div>
                    <div class="loading-step">전통 스타일 생성</div>
                    <div class="loading-step">현대 스타일 생성</div>
                    <div class="loading-step">세련된 스타일 생성</div>
                    <div class="loading-step">고전 스타일 생성</div>
                    <div class="loading-step">완료</div>
                </div>
                <div class="loading-time">
                    <span class="estimated-time">예상 소요 시간: 약 5초</span>
                    <span class="elapsed-time">경과 시간: 0초</span>
                </div>
            </div>
        `;

        // 경과 시간 표시 시작
        const startTime = Date.now();
        const elapsedTimeElement = calligraphyContainer.querySelector('.elapsed-time');
        const timeInterval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            elapsedTimeElement.textContent = `경과 시간: ${elapsedSeconds}초`;
        }, 1000);

        // 섹션 전환
        document.querySelector('.results-section').style.display = 'none';
        document.querySelector('.calligraphy-section').style.display = 'block';

        try {
            // 각 스타일별 캘리그라피 생성
            updateLoadingStep(1);
            const traditionalCanvas = await createCalligraphyCanvas(formattedText, 'traditional');
            
            updateLoadingStep(2);
            const modernCanvas = await createCalligraphyCanvas(formattedText, 'modern');
            
            updateLoadingStep(3);
            const elegantCanvas = await createCalligraphyCanvas(formattedText, 'elegant');
            
            updateLoadingStep(4);
            const classicCanvas = await createCalligraphyCanvas(formattedText, 'classic');

            // 완료 단계 표시
            updateLoadingStep(5);
            clearInterval(timeInterval);

            // 결과 표시
            calligraphyContainer.innerHTML = `
                <div class="calligraphy-grid">
                    <div class="calligraphy-item">
                        <div class="calligraphy-image-container">
                            <img src="${traditionalCanvas.toDataURL()}" alt="전통 붓글씨" class="calligraphy-image">
                        </div>
                        <p class="calligraphy-text">전통 스타일</p>
                        <button class="download-btn" onclick="downloadCanvas('${traditionalCanvas.toDataURL()}', 'custom-traditional-calligraphy')">이미지 저장하기</button>
                    </div>
                    <div class="calligraphy-item">
                        <div class="calligraphy-image-container">
                            <img src="${modernCanvas.toDataURL()}" alt="현대 붓글씨" class="calligraphy-image">
                        </div>
                        <p class="calligraphy-text">현대 스타일</p>
                        <button class="download-btn" onclick="downloadCanvas('${modernCanvas.toDataURL()}', 'custom-modern-calligraphy')">이미지 저장하기</button>
                    </div>
                    <div class="calligraphy-item">
                        <div class="calligraphy-image-container">
                            <img src="${elegantCanvas.toDataURL()}" alt="세련된 붓글씨" class="calligraphy-image">
                        </div>
                        <p class="calligraphy-text">세련된 스타일</p>
                        <button class="download-btn" onclick="downloadCanvas('${elegantCanvas.toDataURL()}', 'custom-elegant-calligraphy')">이미지 저장하기</button>
                    </div>
                    <div class="calligraphy-item">
                        <div class="calligraphy-image-container">
                            <img src="${classicCanvas.toDataURL()}" alt="고전 붓글씨" class="calligraphy-image">
                        </div>
                        <p class="calligraphy-text">고전 스타일</p>
                        <button class="download-btn" onclick="downloadCanvas('${classicCanvas.toDataURL()}', 'custom-classic-calligraphy')">이미지 저장하기</button>
                    </div>
                </div>
                <p class="calligraphy-text">${lines.join('<br>')}</p>
            `;

        } catch (error) {
            clearInterval(timeInterval);
            console.error('Error generating custom calligraphy:', error);
            calligraphyContainer.innerHTML = `
                <div class="error">
                    커스텀 캘리그라피 생성 중 오류가 발생했습니다.
                    <button class="back-btn" onclick="document.querySelector('.results-section').style.display = 'block'; document.querySelector('.calligraphy-section').style.display = 'none';">다시 시도하기</button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 캔버스 이미지 다운로드 함수
function downloadCanvas(dataUrl, prefix) {
    const link = document.createElement('a');
    link.download = `${prefix}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
}

// 미리보기 모달 관련 함수들
function setupPreviewModal() {
    const modal = document.getElementById('previewModal');
    const closeBtn = modal.querySelector('.close-modal');
    
    // 모달 닫기
    closeBtn.onclick = function() {
        modal.classList.remove('show');
    }
    
    // 모달 외부 클릭시 닫기
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    }
}

// 이미지 미리보기 함수
function showPreview(imageUrl) {
    const modal = document.getElementById('previewModal');
    const previewImage = document.getElementById('previewImage');
    
    previewImage.src = imageUrl;
    modal.classList.add('show');
}

// 단계 전환 함수들
function showStep1() {
    document.getElementById('step1').style.display = 'block';
    document.getElementById('step2').style.display = 'none';
    document.querySelector('.results-section').style.display = 'none';
    document.querySelector('.calligraphy-section').style.display = 'none';
    
    // OpenAI 인스턴스 초기화
    openai = null;
}

function showStep2() {
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
    
    // 포커스를 이름 입력 필드로 이동
    setTimeout(() => {
        document.getElementById('name').focus();
    }, 300);
}