import requests
from bs4 import BeautifulSoup

def summarize_webpage(url):
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return f"Failed to fetch webpage. Status code: {response.status_code}"

        soup = BeautifulSoup(response.text, "html.parser")
        title = soup.title.string if soup.title else "No Title"
        paragraphs = soup.find_all("p")
        content = " ".join(p.get_text() for p in paragraphs[:5])  # Limit summary to first 5 paragraphs
        return f"Title: {title}\n\nSummary: {content[:1000]}..."
    except Exception as e:
        return str(e)
