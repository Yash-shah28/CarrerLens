from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from dotenv import load_dotenv
from schemas.resume import ResumeData

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
)

parser = PydanticOutputParser(pydantic_object=ResumeData)

prompt = PromptTemplate(
    input_variables=["resume_text", "links"],
    template="""
    You are an expert AI resume parser specializing in extracting and organizing professional information.
    Your task is to analyze the resume text and intelligently map the provided links to create a comprehensive structured output.

    RESUME TEXT:
    {resume_text}

    EXTRACTED LINKS:
    {links}

    PARSING INSTRUCTIONS:

    1. Information Extraction
    - Extract all relevant details from the resume text
    - Maintain accuracy and preserve original wording where appropriate
    - Handle variations in formatting and structure gracefully

    2. Intelligent Link Assignment
    - Personal Information Links:
     * GitHub: URLs containing 'github.com' → personal_info.github
     * LinkedIn: URLs containing 'linkedin.com' → personal_info.linkedin
     * Portfolio/Personal Website: Other domain URLs → personal_info.website
     * Email: mailto links → personal_info.email
   
    - Project Links:
     * Repository links (GitHub, GitLab, Bitbucket) → projects[].repository_url
     * Live demos/deployed projects → projects[].demo_url
     * Documentation links → projects[].documentation_url
   
    - Context-Based Assignment:
     * Use surrounding text to determine which project or experience a link belongs to
     * Match links to entries based on proximity and semantic relevance
     * If a link's purpose is ambiguous, assign it to the most logical section

    3. Output Requirements
    - Produce valid JSON that strictly conforms to the provided schema
    - Include all extracted information, even if some fields are empty
    - Use null for missing optional fields rather than omitting them
    - Ensure consistent formatting (dates, phone numbers, etc.)

    4. Quality Checks
    - Verify all links are properly associated with their context
    - Ensure no information from the resume is lost or misattributed
    - Validate that the JSON structure is complete and properly nested

    OUTPUT FORMAT:
    {format_instructions}

    Generate the structured JSON output now.
    """
)

def analyze_resume(resume_text: str, links: list[str]):
    chain = prompt | llm | parser
    response = chain.invoke({
        "resume_text": resume_text,
        "links": str(links),
        "format_instructions": parser.get_format_instructions()
    })
    return response
