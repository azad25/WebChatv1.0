from ollama import Client
from web_service import fetch_web_data  # Ensure this import is available

# Initialize the Llama model
client = Client()

def generate_response(llm_response):
    try:
        # Ensure llm_response is valid
        if not llm_response or not isinstance(llm_response, str):
            print("Error: Invalid llm_response provided.")
            return {"response": "Invalid response from the model.", "actions": []}

        # Prompt the LLM to format the response in Markdown
        formatted_response = format_response(llm_response)
        response = {"response": formatted_response, "actions": []}

        # Prompt the LLM to generate keywords
        keyword_prompt = f"Extract minimum 5 or more numbered list of concise keywords (1-2 words) related to the following text:\n\n{llm_response}"
        keyword_response = request_keywords_from_llm(keyword_prompt)
        print(f"Keyword response from LLM: {keyword_response}")  # Debugging line
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
        if "visit" in llm_response.lower():
            response["actions"].append({
                "label": "Visit URL",
                "type": "open_url",
                "data": ""  # Replace with actual URL extraction logic
            })

        if "summarize" in llm_response.lower():
            response["actions"].append({
                "label": "Summarize Content",
                "type": "summarize",
                "data": {"url": ""}  # Replace with actual URL extraction logic
            })

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

def request_keywords_from_llm(prompt):
    # This function should send the prompt to the LLM and return the response
    # Replace with actual API call to your LLM
    try:
        # Example API call to LLM
        response = client.generate(model="llama3.2", prompt=prompt)
        if response and hasattr(response, 'response'):
            return response.response
        else:
            print("Error: LLM did not return a valid response.")
            return ""
    except Exception as e:
        print(f"Error requesting keywords from LLM: {e}")
        return ""

def parse_keywords(keyword_response):
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