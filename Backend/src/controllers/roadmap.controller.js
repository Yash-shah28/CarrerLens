import { GoogleGenerativeAI } from "@google/generative-ai";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateRoadmap = asyncHandler(async (req, res) => {
  const { skill } = req.body;

  if (!skill) {
    throw new ApiError(400, "Skill is required");
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("CRITICAL: GEMINI_API_KEY is missing from process.env");
    throw new ApiError(500, "Server configuration error: Gemini API Key missing");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Create a detailed learning roadmap for mastering "${skill}". 
    The response must be a structured JSON object exactly matching this format:
    {
      "title": "Skill Name Mastery",
      "description": "Brief overview of the skill and roadmap goals.",
      "steps": [
        {
          "title": "Phase Title",
          "topics": ["Specific Topic 1", "Specific Topic 2"],
          "description": "Short explanation of what will be learned in this phase.",
          "resources": {
            "books": ["Book Title 1 (Author)", "Book Title 2 (Author)"],
            "youtube": ["Search Query for specific YouTube video 1", "Search Query for specific YouTube video 2"]
          }
        }
      ]
    }
    
    Ensure:
    1. Steps are sequential and logically ordered.
    2. Books are top-rated and industry-standard.
    3. YouTube entries are specific search terms likely to yield the best tutorials.
    4. Provide 4-6 phases.
    5. ONLY return the JSON object, no other text.
    `;

  try {
    console.log(`Generating roadmap for skill: ${skill}...`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log("Raw AI Response received");

    // Clean the text in case it includes markdown code blocks
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const roadmapData = JSON.parse(text);

    return res.status(200).json(
      new ApiResponse(200, roadmapData, "Roadmap generated successfully")
    );
  } catch (error) {
    console.error("Gemini API Full Error:", error);
    throw new ApiError(500, `AI Error: ${error.message || "Failed to generate roadmap"}`);
  }
});

export { generateRoadmap };
