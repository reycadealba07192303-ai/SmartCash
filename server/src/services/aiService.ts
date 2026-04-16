import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export const generateLessonContent = async (topic: string, description: string) => {
    if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

    // Use gemini-2.5-flash as default lightweight model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a helpful educational assistant for a platform called SmartCash (focusing on financial literacy for senior high school students). 
Generate a comprehensive, engaging lesson content in markdown format about the following topic:
Title: ${topic}
Additional context: ${description}

The lesson should include:
- An engaging introduction
- 3 to 4 main sections explaining the core concepts clearly with examples
- A summary or conclusion at the end
Return ONLY the markdown text for the lesson content.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
};

export const generateQuizQuestions = async (lessonContent: string, numberOfQuestions: number = 5) => {
    if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an educational quiz creator for Senior High School ABM students in the Philippines using the SmartCash financial literacy app.

Based on the following content, create ${numberOfQuestions} multiple-choice quiz questions.

CONTENT:
---
${lessonContent}
---

STRICT OUTPUT RULES:
- Return ONLY a valid JSON array. Nothing else before or after it.
- Each element must have exactly these keys:
  "question" (string), "options" (array of 4 strings), "correctAnswer" (0-based index integer)
- Do NOT wrap in markdown code blocks.
- Example format:
[{"question":"...","options":["A","B","C","D"],"correctAnswer":0}]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Strip any markdown wrapper
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    // Try direct parse first
    try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) return parsed;
    } catch (_) { }

    // Fallback: extract the JSON array using regex
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
        try {
            const parsed = JSON.parse(match[0]);
            if (Array.isArray(parsed)) return parsed;
        } catch (_) { }
    }

    throw new Error('Failed to parse AI quiz response as JSON');
};

export const generateBlogPostsAI = async () => {
    if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a financial literacy educator for senior high school students in the Philippines using the SmartCash app.
Generate 6 unique, randomly selected blog articles about different financial literacy topics (e.g., Budgeting, Savings, Banking, Investing, Scams, Allowances, etc.). Each article should be concise and engaging. Do not use the exact same topics every time.

Return ONLY a valid JSON array with 6 objects. Each object must have exactly these fields:
- "title": the article title (string)
- "category": the category (string)
- "excerpt": a 1-sentence summary of the article (string)
- "content": the full article body in plain text, 3-4 paragraphs (string)
- "author_name": "SmartCash AI"

Return ONLY valid JSON. No markdown code blocks.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        return JSON.parse(text);
    } catch (e) {
        throw new Error('Failed to parse blog posts AI response as JSON');
    }
};

/**
 * Generates 3 lesson outlines for a given module category,
 * then generates full lesson content for each one.
 * All lessons are tailored for Senior High School ABM students in the Philippines.
 */
export const generateLessonsForModule = async (moduleTitle: string, category: string): Promise<{ title: string; description: string; content: string }[]> => {
    if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Step 1: Generate lesson outlines
    const outlinePrompt = `You are a curriculum designer for the SmartCash financial literacy app, used by Senior High School (SHS) ABM students in the Philippines.

Create 3 lesson outlines for a module titled "${moduleTitle}" under the "${category}" category.

Return ONLY a valid JSON array with 3 objects. Each object must have exactly:
- "title": a short, specific lesson title (string)
- "description": a one-sentence description of what the lesson covers (string)

These lessons should be appropriate for Grade 11-12 SHS students in the Philippines.
Return ONLY valid JSON. No markdown.`;

    const outlineResult = await model.generateContent(outlinePrompt);
    let outlineText = outlineResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    let outlines: { title: string; description: string }[];
    try {
        outlines = JSON.parse(outlineText);
    } catch (e) {
        throw new Error('Failed to parse lesson outlines from AI');
    }

    // Step 2: Generate full content for each outline in parallel
    const lessons = await Promise.all(
        outlines.map(async (outline) => {
            const content = await generateLessonContent(outline.title, outline.description + ` (Module: ${moduleTitle}, Category: ${category}, Target: SHS ABM students Philippines)`);
            return { title: outline.title, description: outline.description, content };
        })
    );

    return lessons;
};

export interface ReceiptVerificationResult {
    isValid: boolean;
    amount?: number;
    referenceNumber?: string;
    senderNumber?: string;
}

/**
 * Visually analyzes a base64 image using Gemini multimodal to determine if it is a valid receipt
 * and extracts data from it.
 */
export const verifyReceiptImage = async (base64Image: string): Promise<ReceiptVerificationResult> => {
    if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Extract base64 and mimetype
    const parts = base64Image.split(',');
    let data = base64Image;
    let mimeType = 'image/png';

    if (parts.length === 2) {
        data = parts[1];
        const match = parts[0].match(/:(.*?);/);
        if (match) mimeType = match[1];
    }

    const prompt = `Look at the attached image. Is this a valid payment receipt, transaction screenshot, or proof of payment (like a GCash/Maya transaction slip, bank transfer confirmation)?
If it is a receipt, carefully extract the following details from the image:
- "amount": the amount paid as a number (e.g., 49.00)
- "referenceNumber": the transaction reference number (or Ref No.)
- "senderNumber": the mobile number or account number of the sender who made the payment.

Return your response ONLY as a valid JSON object matching this structure:
{
  "isValid": boolean (true if it's a receipt, false if it's entirely unrelated like a selfie or dog),
  "amount": number or null (if not found),
  "referenceNumber": string or null (if not found),
  "senderNumber": string or null (if not found)
}
No extra characters, no markdown formatting.`;

    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: data,
                    mimeType: mimeType
                }
            }
        ]);
        
        let text = result.response.text();
        text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

        // Parse JSON
        const parsed = JSON.parse(text);
        return {
            isValid: parsed.isValid === true,
            amount: typeof parsed.amount === 'number' ? parsed.amount : undefined,
            referenceNumber: typeof parsed.referenceNumber === 'string' ? parsed.referenceNumber : undefined,
            senderNumber: typeof parsed.senderNumber === 'string' ? parsed.senderNumber : undefined
        };

    } catch (error) {
        console.error("AI Receipt Verification Error:", error);
        // Fail-safe
        return { isValid: true };
    }
};
