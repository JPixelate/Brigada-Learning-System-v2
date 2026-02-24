import { GoogleGenAI } from "@google/genai";

// Initialize the client securely
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const MAX_RETRIES = 3;

if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY is not set globally. AI features may be disabled.");
}

const client = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' }); // dummy key prevents immediate crash on init, fails on call

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const callWithRetry = async (params: any, retries = MAX_RETRIES): Promise<any> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await client.models.generateContent(params);
    } catch (error: any) {
      const status = error?.status ?? error?.httpErrorCode;
      if (status === 429 && attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.warn(`Rate limited. Retrying in ${delay / 1000}s... (attempt ${attempt + 1}/${retries})`);
        await new Promise(res => setTimeout(res, delay));
        continue;
      }
      throw error;
    }
  }
};

export const generateModuleContent = async (topic: string, type: 'outline' | 'description' = 'description'): Promise<string> => {
  try {
    const prompt = type === 'outline' 
      ? `Create a detailed 5-module course outline for a learning module about "${topic}". Return the response as a clean Markdown list.`
      : `Write a compelling and professional course description (approx 100 words) for a learning module about "${topic}". The tone should be educational and encouraging.`;

    const response = await callWithRetry({
      model: 'gemini-2.0-flash',
      contents: [{ parts: [{ text: prompt }] }],
    });

    return response.text || "Failed to generate content.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating content. Please check your API key and try again.";
  }
};

export const analyzeStudentPerformance = async (studentData: string): Promise<string> => {
   try {
    const response = await callWithRetry({
      model: 'gemini-2.0-flash',
      contents: [{ parts: [{ text: `Analyze the following student performance data and provide a brief, constructive summary for the instructor: ${studentData}` }] }],
    });
    return response.text || "No analysis available.";
   } catch (error) {
     console.error("Gemini API Error", error);
     return "Unable to analyze data at this time.";
   }
};

export const evaluateStudentSubmission = async (
  moduleTitle: string,
  moduleDescription: string,
  mcqResults: { correct: number; total: number },
  narrativeAnswers: { question: string; answer: string }[],
  minWords?: number
) => {
  try {
    const prompt = `
      You are a senior instructor evaluating a student's submission for the module: "${moduleTitle}".
      Module Description: "${moduleDescription}"
      
      Here is the data:
      1. Multiple Choice Quiz Score: ${mcqResults.correct}/${mcqResults.total}
      
      2. Narrative/Written Answers:
      ${narrativeAnswers.map((a, i) => {
        const wordCount = a.answer.trim().split(/\s+/).length;
        return `   Q${i+1}: ${a.question}\n   A${i+1}: ${a.answer}\n   (Word count: ${wordCount}${minWords ? `, Required: ${minWords}` : ""})`;
      }).join('\n')}

      Please analyze the narrative answers for depth, accuracy, and clarity, specifically in the context of the module topic and description provided. 
      ${minWords ? `IMPORTANT: The instructor has set a minimum requirement of ${minWords} words per answer. Penalize if answers are significantly shorter than this.` : ""}
      Combine this with the MCQ score to determine an overall grade.
      
      Return the response strictly in the following JSON format:
      {
        "summary": "A brief 2-3 sentence summary of the student's performance.",
        "narrativeFeedback": "Specific feedback on the written answers, highlighting strengths and weaknesses.",
        "narrativeScore": number, // Score out of 100 for just the written part
        "overallScore": number // Final calculated score out of 100 weighting MCQ and Narrative roughly 50/50 (or appropriate judgment)
      }
    `;

    const response = await callWithRetry({
      model: 'gemini-2.0-flash',
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Evaluation Error:", error);
    return null;
  }
};

export const generateFullModuleStructure = async (
  title: string,
  description: string,
  providedContent: string
) => {
  try {
    const prompt = `
      You are an expert instructional designer. Create a comprehensive module structure for a course titled "${title}".
      
      Module Description: ${description}
      Provided Content Reference: ${providedContent}
      
      Generate a curriculum consisting of 3-5 sections. Each section must contain 2-4 components.
      Components can be of types: 'reading', 'video', 'lecture', 'podcast', 'narrative', 'quiz'.
      
      For 'reading', 'video', 'lecture', 'podcast', 'narrative': provide a descriptive 'title' and some placeholder content or a summary of what should be in there.
      For 'quiz': provide a 'title' and a list of 3-5 'questions'. Each question needs 'text' and 3-4 'options', with one 'isCorrect' set to true.
      
      Return the response strictly in the following JSON format:
      {
        "sections": [
          {
            "id": "string (unique)",
            "title": "string",
            "isExpanded": true,
            "components": [
              {
                "id": "string (unique)",
                "type": "reading | video | lecture | podcast | narrative | quiz",
                "category": "learning | assessment",
                "title": "string",
                "content": "string (for non-quiz) OR Question[] (for quiz)",
                "minWords": number (only for narrative, optional)
              }
            ]
          }
        ]
      }
      
      Ensure IDs are unique and the structure is ready to be parsed into the application's state.
    `;

    const response = await callWithRetry({
      model: 'gemini-2.0-flash',
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Structure Generation Error:", error);
    return null;
  }
};
