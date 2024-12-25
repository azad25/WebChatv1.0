from web_service import fetch_web_data  # Ensure this import is available
import re
import asyncio
from action_service import parse_keywords
from context import chat_context
import json
import redis
# Initialize conversation history
conversation_history = chat_context

# Initialize Redis client
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)

def cache_response(key, data, expiration=300):
    """Cache the response in Redis with an expiration time."""
    # Serialize the data to JSON before caching
    redis_client.setex(key, expiration, json.dumps(data))

def get_cached_response(key):
    """Retrieve cached response from Redis."""
    cached_data = redis_client.get(key)
    if cached_data:
        # Deserialize the JSON string back to a Python object
        return json.loads(cached_data)
    return None


async def process_with_llm(query, genai_model):
    global conversation_history  # Use the global conversation history
    conversation_history = chat_context  # Use the global chat_context

    try:
        output_response = await asyncio.gather(send_to_llm(genai_model, query))
        return output_response

    except Exception as e:
        print(f"Error processing with llm: {e}")
        return {"error": str(e)}

async def send_to_llm(genai_model, query):
    contents = ""
    # Retrieve cached images
    cached_images = get_cached_response('images')
    images = []
    # Use a compiled regular expression for better performance
    url_pattern = re.compile(r'(https?://[^\s]+)')
    urls = url_pattern.findall(query)
    # Fetch data concurrently for all URLs
    prompt = ''
    if urls:
        search = 1
        # fetch_tasks = [fetch_web_data(url).text for url in urls]
        fetch_results = await asyncio.gather(*[fetch_web_data(url) for url in urls])
        # contents = await asyncio.gather(*fetch_tasks)
        # images = await asyncio.gather(*fetch_images)
        # Separate the results into contents and images
        contents = []
        images = []
        for result in fetch_results:
            if result and isinstance(result, dict):
                if result.get("text"):
                    contents.append(result["text"])
                if result.get("images"):
                    images.extend(result["images"])
        
        # Cache the images list
        cache_response('images', images)  # Serialize once


        # cache_response(images, json.dumps(json.dumps(images)))
        # cached_images = get_cached_response(images)
        # print(cached_images)

        # contents = [result.text for result in fetch_results if result and hasattr(result, 'text')]
        # images = [result.images for result in fetch_results if result and hasattr(result, 'images')]
        
        # Combine user query with fetched content
        prompt = query + "\n" + "\n".join(filter(None, contents))
        # Check if any content was fetched successfully
        if not any(contents):
                return {"response": "Failed to fetch webpage content.", "actions": []
            }

    # Add the current user query to the conversation history
    conversation_history.append({"role": "user", "content": query})

        # Prepare the full conversation history as a prompt string
    full_prompt = "\n\n".join(f"{msg['role'].capitalize()}: {msg['content']}" for msg in conversation_history)
    
    prompt = """"
        Respond fast as "Sir" and then response with details with a title based on the user query and perform any action if needed.Conclude with a big list of related and reference valid links and then MUST Extract a numbered list of keywords about the topic to your response also add keywords about previous chat history. Give response like smart assistant and don't include what i asked to do in the response and add more links for further exploration based on this chat history:"""+full_prompt+""
    
    response = genai_model.send_message(prompt)
    links = parse_links(response.text)
    response_content = remove_keywords_section(response.text)
    keywords = parse_keywords(response.text)
        # Loop through keywords and create actions
    output_response = {}

    output_response["response"] = response_content
    output_response["actions"] = []
    output_response["links"] = []
    for link in links:
        # Remove any unwanted characters or formatting issues
        # clean_link = link.strip().replace('@', '').replace(';', '').replace(')', '')
        clean_link = re.sub(r'[@;)]', '', link.strip())
        # Ensure the link is not wrapped in markdown-like syntax
        if '(' in clean_link and ')' in clean_link:
            clean_link = clean_link.split('(')[-1].split(')')[0]
        output_response["links"].append(clean_link)

    cache_response('links', output_response["links"])
    cached_links = get_cached_response('links')

    for keyword in keywords:
            output_response["actions"].append({
                "label": f"'{keyword.strip()}'",
                "type": "search",
                "data": "Search for: " + keyword.strip()
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
            "data": "List Top Headlines fromhttps://aljazeera.com/news"
        })

    cache_response('keywords', output_response["actions"])
    cached_keywords = get_cached_response('keywords')

    output_response["actions"].append({
            "label": "Clear Chat",
            "type": "tools",
            "data": "Clear the chat history"
        })
    
    output_response["images"] = cached_images
    output_response["links"] = cached_links
    output_response["actions"] = cached_keywords



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

    conversation_history.append({"role": "assistant", "content": output_response},)
    return output_response

def is_satisfactory(response):
    # Implement your logic to determine if the response is satisfactory
    if len(response) < 50:
        return False  # Response is too short to be satisfactory
    return True  # Placeholder for actual satisfaction logic

def parse_links(response):
    # Use a regular expression to find all URLs in the response
    # This pattern accounts for markdown-like link syntax
    url_pattern = re.compile(r'https?://[^\s\]]+')
    links = url_pattern.findall(response)

    # Remove duplicates by converting the list to a set and back to a list
    unique_links = list(set(links))
    return unique_links
def remove_keywords_section(response):
    # Find the index where the "Keywords:" section starts
    keywords_index =  response.find("Keywords")
    
    # If the "Keywords:" section is found, remove it
    if keywords_index != -1:
        # Find the end of the keywords section
        end_of_keywords = response.find("/n/n", keywords_index)
        if end_of_keywords == -1:
            end_of_keywords = len(response)
        # Remove the keywords section
        response = response[:keywords_index].strip() + response[end_of_keywords:].strip()
    
    return response
