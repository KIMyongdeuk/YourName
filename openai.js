// OpenAI API 클라이언트
class OpenAI {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.baseURL = 'https://api.openai.com/v1';
    }

    async createChatCompletion(params) {
        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        return await response.json();
    }

    async generateImage(params) {
        const response = await fetch(`${this.baseURL}/images/generations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API request failed: ${response.statusText} - ${errorData.error?.message || ''}`);
        }

        const data = await response.json();
        return {
            data: data.data.map(item => ({
                url: item.url
            }))
        };
    }
}

// 전역 객체에 OpenAI 추가
window.OpenAI = OpenAI; 