import requests

session = requests.Session()

def process_prompt(prompt):
    try:
        actions = []
        if "http://" in prompt or "https://" in prompt:
            words = prompt.split()
            url = next((word for word in words if word.startswith("http")), None)
            if url:
                actions.append({"label": "Visit URL", "action": "open_url", "data": url})
                actions.append({"label": "Summarize Webpage", "action": "summarize", "data": {"url": url}})
        
        ollama_endpoint = "http://127.0.0.1:11434/api/chat"
        response = session.post(
            ollama_endpoint,
            json={
                "model": "llama3.2",
                "messages": [{"role": "user", "content": prompt}]
            },
            timeout=30
        )
        
        if response.status_code == 200:
            response_data = response.json()
            message = response_data.get('message', {}).get('content', '')
            return {"response": message or "No response from the model.", "actions": actions}
        else:
            print(f"Error: Server returned status code {response.status_code}")
            return {"response": f"Error: Server returned status code {response.status_code}", "actions": []}

    except Exception as e:
        print(f"Error processing prompt: {e}")
        return {"response": str(e), "actions": []}