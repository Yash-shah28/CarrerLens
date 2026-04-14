import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateRoadmap = asyncHandler(async (req, res) => {
  const { skill } = req.body;

  if (!skill) {
    throw new ApiError(400, "Skill is required");
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("CRITICAL: OPENROUTER_API_KEY is missing from process.env");
    throw new ApiError(500, "Server configuration error: OPENROUTER_API_KEY missing. Please check your .env file.");
  }

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
    console.log(`Generating roadmap for skill: ${skill} via OpenRouter...`);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "CareerLens Roadmap Generator",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-001",
        "messages": [
          { "role": "user", "content": prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API Error:", errorData);
      throw new ApiError(response.status, `AI Provider Error: ${errorData.error?.message || "Failed to generate roadmap"}`);
    }

    const data = await response.json();
    let text = data.choices[0].message.content;

    console.log("Raw AI Response received from OpenRouter. Attempting to parse...");

    // 1. Clean the text (remove markdown blocks etc)
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let roadmapData;
    try {
      roadmapData = JSON.parse(text);
    } catch (parseErr) {
      console.error("JSON Parse Error. Raw Text:", text);
      throw new ApiError(500, "Failed to parse AI response. Please try again.");
    }

    // 2. Resilience: Handle common AI wrapper patterns
    // Sometimes AI returns { "roadmap": { ... } } instead of { ... }
    if (roadmapData.roadmap && Array.isArray(roadmapData.roadmap.steps)) {
      roadmapData = roadmapData.roadmap;
    } else if (roadmapData.data && Array.isArray(roadmapData.data.steps)) {
      roadmapData = roadmapData.data;
    }

    // 3. Validation: Ensure steps is an array
    if (!roadmapData.steps || !Array.isArray(roadmapData.steps)) {
      console.error("AI Response invalid structure (Steps missing or not array):", roadmapData);
      throw new ApiError(500, "The AI generated an invalid roadmap format. Please try again.");
    }

    // Ensure steps have required structure to prevent frontend crashes
    roadmapData.steps = roadmapData.steps.map(step => ({
        ...step,
        topics: Array.isArray(step.topics) ? step.topics : ["General Overview"],
        resources: step.resources || { youtube: [], books: [] }
    }));

    return res.status(200).json(
      new ApiResponse(200, roadmapData, "Roadmap generated successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Roadmap Generation Error:", error);
    throw new ApiError(500, `Internal Error: ${error.message || "Failed to generate roadmap"}`);
  }
});

export { generateRoadmap };
