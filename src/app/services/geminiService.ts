import { GoogleGenerativeAI } from "@google/generative-ai";
import { Question } from "../data/quizData";

// NOTE: In a production app, the API key should be in an environment variable.
// For this prototype, we'll ask the user to input it or use a placeholder that they can replace.

export const generateQuizQuestions = async (topic: string, apiKey: string): Promise<Question[]> => {
    if (!apiKey) {
        throw new Error("API Key is required");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Generate 5 multiple-choice questions about "${topic}" for a financial literacy and entrepreneurship quiz.
    Return ONLY a raw JSON array (no markdown code blocks) with the following structure for each question:
    {
      "id": number (1-5),
      "text": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": number (index 0-3),
      "explanation": "Brief explanation of why the answer is correct"
    }
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown formatting if Gemini includes it
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const questions: Question[] = JSON.parse(cleanText);
        return questions;
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw new Error("Failed to generate quiz. Please check your API key and try again.");
    }
};
