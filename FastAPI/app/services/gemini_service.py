from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from app.core.config import GOOGLE_API_KEY

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GOOGLE_API_KEY
)

prompt = PromptTemplate(
    input_variables=["resume_text"],
    template="""
    You are an AI resume parser.
    Extract structured information from the resume text below:

    Resume Text:
    {resume_text}

    Return JSON with:
    - name
    - email
    - phone
    - skills
    - experience_summary
    """
)

def analyze_resume(resume_text: str):
    chain = prompt | llm
    response = chain.invoke({"resume_text": resume_text})
    return response.content
