import google.generativeai as genai
import typing_extensions as typing

async def genai_model():
    genaimodel = genai.configure(api_key="AIzaSyBnVkT9wiLnMv_RQmVIEkb-meUgPL2qXKs")
    # genai_model = genaimodel.GenerativeModel("gemini-1.5-flash")
    return genai_model
