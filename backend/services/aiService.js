const Groq = require('groq-sdk');

class AiService {
    constructor() {
        this.ai = null;
    }

    _getAiClient() {
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_api_key_here') {
            throw new Error('GROQ_API_KEY is missing or invalid. Please check your .env file.');
        }
        if (!this.ai) {
            this.ai = new Groq({ apiKey: process.env.GROQ_API_KEY });
        }
        return this.ai;
    }

    async getDashboardInsights(statsData) {
        const systemInstruction = `You are an expert business consultant analyzing an automotive spare parts and billing system.
You are given a snapshot of the day's dashboard metrics.
Provide 3 to 4 detailed sentences of actionable business advice.
Break down your insights into multiple points, analyzing sales trends, stock levels, and revenue/profit margins.
Be encouraging but highlight areas of concern (like low stock or high purchases vs sales).
Do not use markdown formatting, just plain text with normal punctuation.
IMPORTANT: When mentioning any monetary amounts, ALWAYS use Indian Rupees (₹) and NEVER use Dollars ($).`;
        
        const prompt = `Here are the dashboard metrics: ${JSON.stringify(statsData)}. 
CRITICAL RULES:
1. Provide a detailed paragraph with exactly 3 to 4 sentences.
2. DO NOT use any markdown formatting whatsoever (no *, #, -, \`, or URLs).
3. Analyze the metrics deeply and provide actionable recommendations.`;

        try {
            const ai = this._getAiClient();
            const completion = await ai.chat.completions.create({
                messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: prompt }
                ],
                model: 'llama-3.1-8b-instant',
            });
            let text = completion.choices[0]?.message?.content || '';
            // Force replace any stubborn dollar signs to rupees
            text = text.replace(/\$/g, '₹');
            return text;
        } catch (error) {
            console.error('AI Generation Error:', error);
            const errMsg = error?.message || error?.toString() || '';
            if (errMsg.includes('GROQ_API_KEY')) {
                 return "AI Insights are unavailable. Please configure your GROQ_API_KEY in the backend .env file.";
            }
            return "AI Insights are currently unavailable. Please try again later.";
        }
    }

    async extractSearchKeywords(searchQuery) {
        const systemInstruction = `You are an AI assistant for an automotive spare parts store.
Your job is to translate natural language queries from customers or cashiers into the exact technical keyword they are likely looking for in our inventory.
Examples:
"something to stop the car" -> "Brake Pad"
"lubricant for the engine" -> "Engine Oil"
"keeps the car cool" -> "Radiator" or "Coolant"

CRITICAL RULES:
1. Return EXACTLY ONE keyword or short phrase (max 3 words).
2. DO NOT return conversational text, punctuation, or explanations. Just the core keyword.
3. If the query is already a clear part name (e.g., "Air Filter"), just return it back.`;
        
        const prompt = `Convert this search query into a technical automotive inventory keyword: "${searchQuery}"`;

        try {
            const ai = this._getAiClient();
            const completion = await ai.chat.completions.create({
                messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: prompt }
                ],
                model: 'llama-3.1-8b-instant',
            });
            return (completion.choices[0]?.message?.content || '').trim();
        } catch (error) {
            console.error('AI Search Translation Error:', error);
            // Fallback: If AI fails, just return the original query
            return searchQuery;
        }
    }
}

module.exports = new AiService();
