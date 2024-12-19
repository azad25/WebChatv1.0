import os
from dotenv import load_dotenv
from google.generativeai import GenerativeModel, configure
# Configure the API key separately
load_dotenv()

gemini_key = os.getenv("GEMINI_API_KEY")
configure(api_key=str(gemini_key))

geminiModel = GenerativeModel(
        model_name='gemini-2.0-flash-exp',  # Use the correct model name
    )
# genai_model = genai.GenerativeModel("gemini-1.5-flash")
