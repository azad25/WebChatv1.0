from ollama import Client
from web_service import fetch_web_data  # Ensure this import is available
from context import chat_context  # Import chat_context
import re
# import google.generativeai as genai
# import typing_extensions as typing
# import json
# genai.configure(api_key="AIzaSyAE39ga4oxiBzJQsWMrXWgqPB7SAmxBwmw")
# genai_model = genai.GenerativeModel("gemini-1.5-flash")

# Initialize the Llama model
client = Client()

# Initialize conversation history
conversation_history = chat_context


async def process_with_llm(query, genai_model):
    global conversation_history  # Use the global conversation history
    conversation_history = chat_context  # Use the global chat_context

    try:
        # Fetch data if URL is provided
        content = None
         # Regular expression to find URLs in the prompt
        url_pattern = r'(http?://[^\s]+)'
        urls = re.findall(url_pattern, query)
        for url in urls:
            # print(url)
            content = await fetch_web_data(url)

            if not content:
                return {"response": "Failed to fetch webpage content.", "actions": []}
        # if url:
        #     content = fetch_web_data(url)
        #     if not content:
        #         return {"response": "Failed to fetch webpage content.", "actions": []}

        # Combine user query with fetched content if available
        prompt = query
        if content:
            prompt += f"\n{content}"

        # Customize prompt for specific actions
        # if action == "summarize":
        #     prompt = f"Summarize :\n{prompt}"
        # elif action == "search":
        #     prompt = f"Search for specific keywords in the content and give me the answer:\n{prompt}"

        # Add the current user query to the conversation history
        conversation_history.append({"role": "user", "content": prompt})

        # Use the correct model name here
        # model = "llama3.2"  # Update with the model you're using
        # print(f"Using model: {model}")  # Log the model name

        # Prepare the full conversation history as a prompt string
        full_prompt = ""
        for msg in conversation_history:
            role = msg["role"]
            content = msg["content"]
            full_prompt += f"{role.capitalize()}: {content}\n\n"

        # Generate response with the full conversation history as context
        # response = client.generate(model=model, prompt=full_prompt)
        chat = genai_model.start_chat()
        response = chat.send_message("Respond in a short article with a headings and key points with related links if any based on the following context: "+full_prompt)
        response_content = response.text
        # response = genai_model.generate_content(full_prompt, stream=True)
        # print(response.text)
        # Extract the response content from the GenerateResponse object
        # response_content = response.text  # Access the response attribute directly

        # Filter out unwanted information (like context numbers)
        # if response.text and isinstance(response_content, str):
        #     # You can also add more sophisticated filtering if needed
        #     response_content = response_content.split("context=")[
        #         0
        #     ].strip()  # Remove everything after 'context='


        # Limit the number of refinement iterations
#         MAX_REFINEMENTS = 1
#         refined_prompt = f"""
#                         Based on the new latest query, rewrite your response in a short article format with a title and then with multiple key headings and the content and key points in the paragraphs,
#                         And here is the content that needs regenration also list some related links:
#                         {response_content}
# Respond to me as "Sir, I have regenrated the response for you" when giving me the response.
#                         """
        
#         for _ in range(MAX_REFINEMENTS):
#             # refined_response = client.generate(model=model, prompt=refined_prompt)
#             chat = genai_model.start_chat()
#             refined_response = chat.send_message(refined_prompt)
#             # refined_response = genai_model.generate_content(refined_prompt, stream=True)
#             # Log the refined response for debugging
#             # print(f"{refined_response}")  # Debugging line

#             # Check if the refined response is valid
#             # if not refined_response or not hasattr(refined_response, "response"):
#             #     print("Error: Unable to access the refined response attribute.")
#             #     return {"response": "No valid response from the model.", "actions": []}

#             # Extract the refined response content
#             refined_response_content = refined_response.text # Access the response attribute directly
        # Add the model's response to the conversation history

#             if is_satisfactory(refined_response_content):
#                 return (
#                     refined_response_content  # Return the satisfactory refined response
#                 )

        conversation_history.append({"role": "assistant", "content": response_content})
        return response_content

    except Exception as e:
        print(f"Error processing with Llama: {e}")
        return {"error": str(e)}


def is_satisfactory(response):
    # Implement your logic to determine if the response is satisfactory
    if len(response) < 50:
        return False  # Response is too short to be satisfactory
    return True  # Placeholder for actual satisfaction logic
