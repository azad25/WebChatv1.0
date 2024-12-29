from web_service import fetch_web_data  # Ensure this import is available
import re
import asyncio
from action_service import parse_keywords
from context import chat_context
import json
from genaimodel import log_event
import html

# Initialize conversation history
conversation_history = chat_context


async def process_with_llm(query, genai_model):
    # global conversation_history  # Use the global conversation history
    # conversation_history = chat_context  # Use the global chat_context

    # try:
    #     output_response = await asyncio.gather(send_to_llm(genai_model, query))
    #     return output_response

    # except Exception as e:
    #     print(f"Error processing with llm: {e}")
    #     return {"error": str(e)}

    global conversation_history
    conversation_history = chat_context

    try:
        # Get the model response
        response = await asyncio.gather(send_to_llm(genai_model, query))
        
        # Check if we received a citation metadata error
        if isinstance(response, dict) and 'finish_reason' in response and response['finish_reason'] == 'RECITATION':
            # Extract the actual response content, ignoring the citation metadata
            actual_response = response.get('text', '')
            if not actual_response:
                # If no text is available, try to get the response before the citation
                citation_start = response.get('citation_metadata', {}).get('citation_sources', [{}])[0].get('start_index', 0)
                actual_response = response.get('candidates', [{}])[0].get('content', '')[:citation_start]
            
            # Format the response properly
            return {
                "response": actual_response or "I apologize, but I couldn't generate a complete response. Please try rephrasing your question.",
                "actions": []
            }
            
        return response

    except Exception as e:
        print(f"Error processing with llm: {e}")
        # Return a more user-friendly error message
        return {
            "response": "I encountered an error processing your request. Please try again.",
            "actions": []
        }


async def send_to_llm(genai_model, query):
    from cache_service import cache_response, get_cached_response

    search = 0
    contents = ""
    # Retrieve cached images
    images = get_cached_response("images")
    url_links = []
    # Use a compiled regular expression for better performance
    url_pattern = re.compile(r"(https?://[^\s]+)")
    urls = url_pattern.findall(query)
    # Fetch data concurrently for all URLs
    prompt = ""
    if urls:
        search = 1
        # fetch_tasks = [fetch_web_data(url).text for url in urls]
        fetch_results = await asyncio.gather(*[fetch_web_data(url) for url in urls])
        # contents = await asyncio.gather(*fetch_tasks)
        # images = await asyncio.gather(*fetch_images)
        # Separate the results into contents and images
        contents = []
        for result in fetch_results:
            if result and isinstance(result, dict):
                if result.get("text"):
                    contents.append(result["text"])
                if result.get("images"):
                    images = result["images"]
                if result.get("images"):
                    url_links = result["links"]

        # Cache the images list
        cache_response("images", images)  # Serialize once

        # cache_response(images, json.dumps(json.dumps(images)))
        # cached_images = get_cached_response(images)
        # print(cached_images)

        # contents = [result.text for result in fetch_results if result and hasattr(result, 'text')]
        # images = [result.images for result in fetch_results if result and hasattr(result, 'images')]

        # Combine user query with fetched content
        # prompt = query + "\n" + "\n".join(filter(None, contents))
        prompt = query + "\n" + str(contents)
        # Check if any content was fetched successfully
        if not any(contents):
            return {"response": "Failed to fetch webpage content.", "actions": []}

    # Add the current user query to the conversation history
    conversation_history.append({"role": "user", "content": prompt})

    # Prepare the full conversation history as a prompt string
    full_prompt = "\n\n".join(
        f"{msg['role'].capitalize()}: {msg['content']}" for msg in conversation_history
    )

    # prompt = (
    #     """
    #     FORGET PREVIOUS CHAT and then response with details with a title based on the user query and perform any action if needed.
    #     If given any html source,extract headlines[in bold text] and details from the html.
    #     Conclude with a big list of related and reference valid links both from the response and the html source[if given], modify and create the full links based on the url and then 
    #     MUST Extract a numbered list of keywords about your response also add keywords about previous chat history with keyword heading. 
    #     MUST GIVE PROPER AI LIKE RESPONSE based on this chat history:
    #     """
    #     + full_prompt
    # )

    optimized_prompt = create_optimized_prompt(query, full_prompt)

    response = genai_model.send_message(optimized_prompt)
    links = parse_links(response.text)
    response_content = remove_keywords_section(response.text)
    keywords = parse_keywords(response.text)
    # Loop through keywords and create actions
    output_response = {}
    cached_images = get_cached_response("images")

    output_response["response"] = response_content
    output_response["actions"] = []
    output_response["links"] = []
    for link in links:
        # Remove any unwanted characters or formatting issues
        # clean_link = link.strip().replace('@', '').replace(';', '').replace(')', '')
        clean_link = re.sub(r"[@;)]", "", link.strip())
        # Ensure the link is not wrapped in markdown-like syntax
        if "(" in clean_link and ")" in clean_link:
            clean_link = clean_link.split("(")("`")[-1].split(")")[0]
        output_response["links"].append(clean_link)

    cache_response("links", output_response["links"])
    cached_links = get_cached_response("links")
    cached_links.append(url_links)

    for keyword in keywords:
        output_response["actions"].append(
            {
                "label": f"'{keyword.strip()}'",
                "type": "search",
                "data": "Search for: " + keyword.strip(),
            }
        )

    output_response["actions"].append(
        {
            "label": "Summarize",
            "type": "ask",
            "data": "Summarize your response in a short and concise manner",
        }
    )

    output_response["actions"].append(
        {
            "label": "Analyse",
            "type": "help",
            "data": "Extract the key points and the content and give your analysis on the topic",
        }
    )

    output_response["actions"].append(
        {
            "label": "News Update Today",
            "type": "card",
            "data": "List Headlines from https://aljazeera.com",
        }
    )

    output_response["actions"].append(
        {
            "label": "WikiPedia",
            "type": "help",
            "data": "Get latest articles from https://en.wikipedia.org/wiki/Main_Page",
        }
    )

    cache_response("keywords", output_response["actions"])
    cached_keywords = get_cached_response("keywords")

    output_response["actions"].append(
        {"label": "Clear Chat", "type": "tools", "data": "Clear the chat history"}
    )

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
    # Update logs for all clients
    log_event(
        event_type="WEB_SEARCH" if search else "PROMPT",
        message=f"User: {urls}" if search else f"User: {query}",  # Log full prompt
        status="info",
        model_name="gemini-1.5-pro",
    )

    conversation_history.append(
        {"role": "assistant", "content": output_response},
    )

    trim_conversation_history(conversation_history)

    return output_response


def is_satisfactory(response):
    # Implement your logic to determine if the response is satisfactory
    if len(response) < 50:
        return False  # Response is too short to be satisfactory
    return True  # Placeholder for actual satisfaction logic


def parse_links(response):
    # Use a regular expression to find all URLs in the response
    # This pattern accounts for markdown-like link syntax
    url_pattern = re.compile(r"https?://[^\s\]]+")
    links = url_pattern.findall(response)

    # Remove duplicates by converting the list to a set and back to a list
    unique_links = list(set(links))
    return unique_links


def remove_keywords_section(response):
    # Find the index where the "Keywords:" section starts
    keywords_index = response.find("Keywords")

    # If the "Keywords:" section is found, remove it
    if keywords_index != -1:
        # Find the end of the keywords section
        end_of_keywords = response.find("/n/n", keywords_index)
        if end_of_keywords == -1:
            end_of_keywords = len(response)
        # Remove the keywords section
        response = (
            response[:keywords_index].strip() + response[end_of_keywords:].strip()
        )

    return response

def create_optimized_prompt(query, html_content=None):
    prompt = f"""
    [SYSTEM: Respond in the following structured format]
    [SYSTEM: You are a knowledgeable assistant. Provide a comprehensive and engaging response.]

    FORMAT YOUR RESPONSE AS FOLLOWS:

    #
    [Generate information about search term from your knowledgebase in context with the conversation]

    # Analysis
    [Provide a detailed analysis in well-organized paragraphs]

    {f'''# 
    - Extract and list main headlines from HTML content
    - Include relevant details under each headline''' if html_content else ''}

    # 
    - List all relevant URLs
    - Ensure links are complete and valid

    # Keywords
    1. [keyword 1]
    2. [keyword 2]
    3. [keyword 3]
    [Must Provide 5-10 total relevant keywords]

    RULES:
    1. Keep analysis clear and concise
    2. Format headlines in bold
    3. Ensure proper paragraph spacing
    4. Keywords should be 1-2 words only
    5. Maintain professional AI tone
    6. Include your Answer with research from your knowledgebase about the response topics
    7. Give info about anything if asked to search, search from the links provided in the chat history
    8. Always give response based on latest query in the tree
    9. Include key historical facts and context
    10. 4. If web content is provided, integrate relevant new information naturally


    QUERY: {query}
    {f'HTML CONTENT: {html_content}' if html_content else ''}
    """
    return prompt.strip()

def trim_conversation_history(history, max_length=5):
    if len(history) > max_length:
        return history[-max_length:]
    return history
