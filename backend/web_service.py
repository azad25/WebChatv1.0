import aiohttp
from bs4 import BeautifulSoup
import asyncio

async def fetch_web_data(url):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status != 200:
                    print(f"Failed to fetch URL: {url}, Status Code: {response.status}")
                    return url
                text = await response.text()
                soup = BeautifulSoup(text, "html.parser")
                return soup.get_text()
    except Exception as e:
        print(f"Error fetching web data: {e}")
        return None
