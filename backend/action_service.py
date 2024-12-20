from ollama import Client
from web_service import fetch_web_data  # Ensure this import is available
import json
# Initialize the Llama model
client = Client()

async def generate_response(llm_response, genai_model):
    try:
        response = {"response": llm_response, "actions": []}

        # Prompt the LLM to generate keywords
        keyword_prompt = f"Extract minimum 5 or more numbered list of concise keywords (1-2 words) related to the following text:\n\n{response}"
        keyword_response = await request_keywords_from_llm(keyword_prompt, genai_model)
        keywords = parse_keywords(keyword_response)
        print(f"Parsed keywords: {keywords}")  # Debugging line

        # Loop through keywords and create actions
        for keyword in keywords:
            response["actions"].append({
                "label": f"'{keyword.strip()}'",
                "type": "search",
                "data": keyword.strip()
            })

        # Example dynamic action generation based on response content
        # if "visit" in llm_response.lower():
        #     response["actions"].append({
        #         "label": "Visit URL",
        #         "type": "open_url",
        #         "data": ""  # Replace with actual URL extraction logic
        #     })

        # if "summarize" in llm_response.lower():
        #     response["actions"].append({
        #         "label": "Summarize Content",
        #         "type": "summarize",
        #         "data": {"url": ""}  # Replace with actual URL extraction logic
        #     })

        # Always include an "ask" action
        response["actions"].append({
            "label": "Summarize",
            "type": "ask",
            "data": "Summarize short and concise"
        })

        return response
    except Exception as e:
        print(f"Error generating response: {e}")
        return {"response": "An error occurred while generating the response.", "actions": []}

async def request_keywords_from_llm(prompt, genai_model):
    # This function should send the prompt to the LLM and return the response
    # Replace with actual API call to your LLM
    try:
        response = genai_model.send_message("Respond with Sir and in a detailed article(200 words) with headings and key points with related links if any based on the following context and your analysis: "+prompt)
        if response.text:
            return response.text
        else:
            print("Error: LLM did not return a valid response.")
            return ""
    except Exception as e:
        print(f"Error requesting keywords from LLM: {e}")
        return ""

def parse_keywords(keyword_response):
    # Ensure keyword_response is a string
    if isinstance(keyword_response, dict):
        keyword_response = keyword_response.get('text', '')

    # Split the response into lines
    lines = keyword_response.split("\n")
    keywords = []

    # Iterate over each line and extract keywords
    for line in lines:
        # Check if the line starts with a number followed by a period
        if line.strip() and line.strip()[0].isdigit() and line.strip()[1] == '.':
            # Extract the keyword after the number and period
            keyword = line.strip().split('.', 1)[1].strip()
            # Ensure the keyword is 1 or 2 words long
            if 1 <= len(keyword.split()) <= 2:
                keywords.append(keyword)

    return keywords
def format_response(text):
    # Simple formatting logic to convert text into a plain text format
    paragraphs = text.split('\n')
    formatted = []

    for para in paragraphs:
        if para.strip():
            # Check for headings (e.g., lines that are all caps or start with a specific character)
            if para.isupper():  # Example condition for headings
                formatted.append(f"{para.strip()}")  # Just return the heading as plain text
            elif para.startswith("*"):  # Check for bullet points
                formatted.append(f"- {para[1:].strip()}")  # Use a dash for bullet points
            else:
                formatted.append(para.strip())  # Return as plain text

    return "\n".join(formatted)  # Join paragraphs with new lines