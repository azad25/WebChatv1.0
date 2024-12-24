import os
from dotenv import load_dotenv
from google.generativeai import GenerativeModel, configure

load_dotenv()

# Configure the API key separately
gemini_key = os.getenv("GEMINI_API_KEY")
configure(api_key=str(gemini_key))
gemini = GenerativeModel(
        model_name='gemini-1.5-flash'
        # model_name='gemini-2.0-flash-exp'
        # Use the correct model name
        # Roleback to this model if gemini-2.0-flash-exp is not available
)
geminiModel = gemini.start_chat()

def clear_history():
    gemini = GenerativeModel(
        model_name='gemini-1.5-flash'
        # model_name='gemini-2.0-flash-exp'
        # Use the correct model name
        # Roleback to this model if gemini-2.0-flash-exp is not available
)
    gemini.start_chat()
    return 1


    