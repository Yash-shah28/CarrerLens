from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import json
import re

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
)


def build_prompt(message: str, resume_data: dict, jd_text: str, chat_history: list[dict]) -> str:
    """Build the prompt string safely without using .format() on user data."""

    # Format chat history (last 10 messages only)
    history_lines = ""
    for entry in chat_history[-10:]:
        role = "User" if entry.get("sender") == "user" else "Assistant"
        history_lines += f"{role}: {entry.get('text', '')}\n"
    if not history_lines:
        history_lines = "No previous conversation."

    resume_json = json.dumps(resume_data, indent=2)
    jd = jd_text or "No job description provided."

    # Use concatenation — safe against any JSON braces in resume_data
    prompt = (
        "You are CareerLens AI, an intelligent, professional resume coach and editor.\n\n"
        "You have access to the user's current resume data and the job description (JD) they are targeting.\n"
        "Your role is to:\n"
        "1. Answer questions about the resume and JD\n"
        "2. Suggest and apply improvements to resume sections based on the JD\n"
        "3. Rewrite summaries, bullet points, skill sections, etc. when asked\n"
        "4. Give ATS optimization advice\n\n"
        "--- RESUME DATA (JSON) ---\n"
        + resume_json + "\n\n"
        "--- JOB DESCRIPTION ---\n"
        + jd + "\n\n"
        "--- CONVERSATION HISTORY ---\n"
        + history_lines + "\n"
        "--- USER MESSAGE ---\n"
        + message + "\n\n"
        "--- INSTRUCTIONS ---\n"
        "Always respond with a raw JSON object (NO markdown code fences, NO extra text) in this EXACT format:\n"
        '{"reply": "Your conversational response here.", "resume_updates": null}\n\n'
        "Rules:\n"
        "- If only answering a question (no edits), set resume_updates to null.\n"
        "- If editing the resume, set resume_updates to a PARTIAL resume object with ONLY the changed sections.\n"
        "- resume_updates keys match the resume JSON structure: personalInfo, summary, workExperience, "
        "education, skills, projects, certifications, achievements, references.\n"
        "- For array sections you modify (e.g. workExperience), include the FULL updated array.\n"
        "- Keep reply concise and natural. Mention what you changed.\n"
        "- Tailor all suggestions to the job description.\n"
        "- Return RAW JSON ONLY — no markdown, no explanation outside the JSON."
    )
    return prompt


def run_chat_agent(message: str, resume_data: dict, jd_text: str, chat_history: list[dict]) -> dict:
    """
    Run the chat agent with the given message, resume data, JD, and chat history.
    Returns a dict: { reply: str, resume_updates: dict | None }
    """
    prompt_text = build_prompt(message, resume_data, jd_text, chat_history)

    try:
        response = llm.invoke(prompt_text)
        raw_text = response.content.strip()

        # Strip markdown code fences if the model adds them anyway
        raw_text = re.sub(r'^```(?:json)?\s*', '', raw_text, flags=re.MULTILINE)
        raw_text = re.sub(r'\s*```\s*$', '', raw_text, flags=re.MULTILINE)
        raw_text = raw_text.strip()

        parsed = json.loads(raw_text)
        return {
            "reply": parsed.get("reply", "I've processed your request."),
            "resume_updates": parsed.get("resume_updates", None)
        }
    except json.JSONDecodeError as e:
        # If the model didn't return valid JSON, treat entire response as a text reply
        return {
            "reply": raw_text if 'raw_text' in dir() else "I processed your request but couldn't format the response.",
            "resume_updates": None
        }
    except Exception as e:
        raise RuntimeError(f"LLM call failed: {str(e)}")
