import aiohttp
import json
import os
from dotenv import load_dotenv
from cache_service import cache_response, get_cached_response,redis_client

load_dotenv()

async def fetch_weather_data():
        """
        Fetch weather data for a given city
        :param city: City name
        :param units: metric (Celsius) or imperial (Fahrenheit)
        :return: Formatted weather data
        """
        try:
            params = {"q": "Dhaka", "appid": os.getenv("OPENWEATHERMAP_API_KEY"), "units": "metric"}

            async with aiohttp.ClientSession() as session:
                async with session.get(os.getenv("OPENWEATHERMAP_BASE_URL"), params=params) as response:
                    if response.status == 404:
                        return None
                    elif response.status != 200:
                        return None

                    data = await response.json()

                    return {
                        "city": data["name"],
                        "country": data["sys"]["country"],
                        "temperature": round(data["main"]["temp"]),
                        "feels_like": round(data["main"]["feels_like"]),
                        "humidity": data["main"]["humidity"],
                        "wind_speed": data["wind"]["speed"],
                        "description": data["weather"][0]["description"],
                        "icon": data["weather"][0]["icon"],
                    }

        except Exception as e:
            return None

def cache_response(key, data, expiration=300):
    """Cache the response in Redis with an expiration time."""
    # Serialize the data to JSON before caching
    redis_client.setex(key, expiration, json.dumps(data))

async def weather_service():
    weather_data = await fetch_weather_data()
    if weather_data:
        cache_response('weather', weather_data)
        return weather_data
  