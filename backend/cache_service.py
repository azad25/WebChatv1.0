import redis
import json

def redis_init():
    redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)
    return redis_client

def cache_response(key, data, expiration=300):
    redis_client.setex(key, expiration, json.dumps(data))

def get_cached_response(key):
    cached_data = redis_client.get(key)
    if cached_data:
        return json.loads(cached_data)
    return None

# Initialize Redis client
redis_client = redis_init()