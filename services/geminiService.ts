
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, FitLevel } from "../types";

export const analyzeResumeMatch = async (resume: string, jobDescription: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const prompt = `
    Analyze the following Resume and Job Description for semantic alignment.
    Evaluate the candidate's fit based on skills, responsibilities, tools, and experience.
    
    RESUME:
    ${resume}
    
    JOB DESCRIPTION:
    ${jobDescription}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: `You are an expert AI Resume–Job Description Matching Engine.
      Your task is to provide a highly detailed, semantic comparison between a resume and a job description.
      You do not use exact keyword matching; instead, focus on the deeper meaning of experiences and technical skills.
      
      SCORING LOGIC (Total 100%):
      - Skills match: 40%
      - Responsibilities match: 30%
      - Tools & technologies: 20%
      - Experience level: 10%
      
      FIT LEVELS:
      - Excellent: 85-100%
      - Strong: 70-84%
      - Moderate: 50-69%
      - Weak: Below 50%
      
      Output ONLY valid JSON according to the schema.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.NUMBER, description: "Match score from 0 to 100" },
          fitLevel: { type: Type.STRING, enum: ["Excellent", "Strong", "Moderate", "Weak"] },
          skillAlignment: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                jobRequires: { type: Type.STRING },
                foundInResume: { type: Type.STRING },
                match: { type: Type.STRING }
              },
              required: ["category", "jobRequires", "foundInResume", "match"]
            }
          },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingOrWeak: { type: Type.ARRAY, items: { type: Type.STRING } },
          keywordGaps: {
            type: Type.OBJECT,
            properties: {
              critical: { type: Type.ARRAY, items: { type: Type.STRING } },
              niceToHave: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["critical", "niceToHave"]
          },
          suggestions: {
            type: Type.OBJECT,
            properties: {
              bulletRewrites: { type: Type.ARRAY, items: { type: Type.STRING } },
              skillsToHighlight: { type: Type.ARRAY, items: { type: Type.STRING } },
              experienceFraming: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["bulletRewrites", "skillsToHighlight", "experienceFraming"]
          },
          verdict: { type: Type.STRING, description: "1-2 sentence final recruiter verdict" }
        },
        required: ["matchScore", "fitLevel", "skillAlignment", "strengths", "missingOrWeak", "keywordGaps", "suggestions", "verdict"]
      }
    }
  });

  try {
    const result = JSON.parse(response.text || '{}');
    return result as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("AI generated an invalid response format.");
  }
};
