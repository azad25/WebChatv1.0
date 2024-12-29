import aiohttp
from bs4 import BeautifulSoup
import asyncio
import random
import re
from urllib.parse import urljoin

# Rotate between different User-Agents to avoid detection
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
]

async def fetch_web_data(url, max_retries=3):

    timeout = aiohttp.ClientTimeout(total=2)
    links = []

    headers = {
        'User-Agent': random.choice(USER_AGENTS),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
    }

    async def try_fetch(session, attempt=0):
        try:
            timeout = aiohttp.ClientTimeout(total=30)
            async with session.get(url, headers=headers, allow_redirects=True, timeout=timeout) as response:
                if response.status == 200:
                    content_type = response.headers.get('Content-Type', '').lower()
                    response_html = BeautifulSoup(await response.text(), "html5lib")

                    # Remove script and style elements
                    for script_or_style in response_html(['script', 'style']):
                        script_or_style.decompose()

                    content_html = response_html.get_text(separator="\n", strip=True)

                    # Extract all links
                    links = []
                    for a_tag in response_html.find_all('a', href=True):
                        href = a_tag['href']
                                                # Skip empty, javascript, and mailto links
                        if not href or href.startswith(('javascript:', 'mailto:', '#')):
                            continue
                        
                        # Clean up malformed URLs that have been concatenated
                        if 'http' in href[8:]:  # Look for additional http after the first one
                            # Split on http and keep only the first valid URL
                            href_parts = href.split('http')
                            href = 'http' + href_parts[1]
                        
                        # Only join URLs if the href is relative
                        full_url = href if href.startswith(('http://', 'https://')) else urljoin(url, href)
                        
                        # Only include http(s) URLs
                        if full_url.startswith(('http://', 'https://')):
                            links.append(full_url)
                        
                    if 'application/json' in content_type:
                        data = await response.json()
                        return {"text": str(data), "images": []}
                    else:
                        text = await response.text()
                        soup = BeautifulSoup(text, "html.parser")
                        
                        # Extract images
                        images = []
                        for img in soup.find_all('img'):
                            src = img.get('src')
                            if src:
                                # Convert relative URLs to absolute URLs
                                absolute_url = urljoin(url, src)
                                # Filter out small images, data URLs, and icons
                                if (not src.startswith('data:') and 
                                    not src.endswith(('.ico', '.svg')) and 
                                    'logo' not in src.lower()):
                                    images.append({
                                        'url': absolute_url,
                                        'alt': img.get('alt', ''),
                                        'title': img.get('title', '')
                                    })
                        
                        # Remove script and style elements
                        for script in soup(["script", "style", "meta", "noscript"]):
                            script.decompose()
                        
                        # Extract text content (keeping existing strategies)
                        content = ""
                        main_content = soup.find(['main', 'article', 'div[role="main"]'])
                        if main_content:
                            content = main_content.get_text(separator=' ', strip=True)
                        if not content:
                            paragraphs = soup.find_all('p')
                            content = ' '.join(p.get_text(strip=True) for p in paragraphs)
                        if not content:
                            content = soup.get_text(separator=' ', strip=True)
                        
                        # Clean up the text
                        content = re.sub(r'\s+', ' ', content)
                        content = re.sub(r'[\n\r\t]', ' ', content)

                        return {
                            "text": content_html,
                            "images": images[:5],  # Limit to first 5 images
                            "links": links
                        }
                
                elif response.status == 403 and attempt < max_retries:
                    await asyncio.sleep(2)
                    headers['User-Agent'] = random.choice(USER_AGENTS)
                    return await try_fetch(session, attempt + 1)
                else:
                    print(f"Failed to fetch URL: {url}, Status Code: {response.status}")
                    return {"text": url, "images": [], links: []}

        except (aiohttp.ClientError, asyncio.TimeoutError) as e:
            print(f"Network error for {url}: {str(e)}")
            if attempt < max_retries:
                await asyncio.sleep(1)
                return await try_fetch(session, attempt + 1)
            return {"text": url, "images": [], links: []}
        except Exception as e:
            print(f"Unexpected error fetching {url}: {str(e)}")
            return {"text": url, "images": [], links: []}

    try:
        connector = aiohttp.TCPConnector(ssl=False, force_close=True)
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            return await try_fetch(session)
    except Exception as e:
        print(f"Session error for {url}: {str(e)}")
        return {"text": url, "images": []}
