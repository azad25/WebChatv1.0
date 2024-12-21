from ollama import Client
from web_service import fetch_web_data  # Ensure this import is available
import re
import asyncio
from action_service import parse_keywords
from context import chat_context
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
        contents = ""

         # Use a compiled regular expression for better performance
        # url_pattern = re.compile(r'(http?://[^\s]+)')
        # urls = url_pattern.findall(query)

        # Fetch data concurrently for all URLs
        # if urls:
        #     fetch_tasks = [fetch_web_data(url) for url in urls]
        #     contents = await asyncio.gather(*fetch_tasks)
        #     # Check if any content was fetched successfully
        #     if not any(contents):
        #         return {"response": "Failed to fetch webpage content.", "actions": []
        #     }



        # Combine user query with fetched content
        prompt = query + "\n" + "\n".join(filter(None, contents))

        # Add the current user query to the conversation history
        conversation_history.append({"role": "user", "content": prompt})

        # Prepare the full conversation history as a prompt string
        full_prompt = "\n\n".join(f"{msg['role'].capitalize()}: {msg['content']}" for msg in conversation_history)


        prompt = """"
        Respond promptly as Sir and then Include relevant details with a title based on the topic. Conclude with a list of references and 
        related links for further exploration based on the latest prompt and the chat history:
        """+full_prompt+" and then Extract minimum 5 or more, only numbered list of concise keywords (1-2 words) relevant to your response"
        response = genai_model.send_message(prompt)
        response_content = remove_keywords_section(response.text)

        keywords = parse_keywords(response_content)
        # Loop through keywords and create actions
        output_response = {}
        output_response["response"] = response_content
        output_response["actions"] = []
        for keyword in keywords:
            output_response["actions"].append({
                "label": f"'{keyword.strip()}'",
                "type": "search",
                "data": "search for:" + keyword.strip()
            })
        
        output_response["actions"].append({
            "label": "Summarize",
            "type": "ask",
            "data": "Summarize your response in a short and concise manner"
        })

        output_response["actions"].append({
            "label": "Analyse",
            "type": "help",
            "data": "Extract the key points and the content and give your analysis on the topic"
        })

        output_response["actions"].append({
            "label": "News Update Today",
            "type": "card",
            "data": "List top headlines from BBC, CNN, Reuters,Bdnews24.com"
        })

        output_response["actions"].append({
            "label": "Clear Chat",
            "type": "tools",
            "data": "Clear the chat history"
        })


        # Limit the number of refinement iterations
#         MAX_REFINEMENTS = 1
#         refined_prompt = f"""
#                         Based on the new latest query, rewrite your response in a short article format with a title and then with multiple key headings and the content and key points in the paragraphs,
#                         And here is the content that needs regenration also list some related links:
#                         {response_content}
# Respond to me as "Sir, I have regenrated the response for you" when giving me the response.
#                         """
        
#         for _ in range(MAX_REFINEMENTS):
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

        conversation_history.append({"role": "assistant", "content": output_response})
        return output_response

    except Exception as e:
        print(f"Error processing with llm: {e}")
        return {"error": str(e)}


def is_satisfactory(response):
    # Implement your logic to determine if the response is satisfactory
    if len(response) < 50:
        return False  # Response is too short to be satisfactory
    return True  # Placeholder for actual satisfaction logic

def remove_keywords_section(response):
    # Find the index where the "Keywords:" section starts
    keywords_index = response.find("Keywords:")
    
    # If the "Keywords:" section is found, remove it
    if keywords_index != -1:
        # Find the end of the keywords section
        end_of_keywords = response.find("\n\n", keywords_index)
        if end_of_keywords == -1:
            end_of_keywords = len(response)
        # Remove the keywords section
        response = response[:keywords_index].strip() + response[end_of_keywords:].strip()
    
    return response
