import uuid  # Import UUID for generating unique session IDs
from flask import Flask, request, jsonify
from flask_cors import CORS
from llm_service import process_with_llm
from web_service import fetch_web_data
from action_service import generate_response
from context import chat_context
from genaimodel import genai_model
from google.generativeai import GenerativeModel, configure  # Ensure correct imports

# Configure the API key separately
configure(api_key="AIzaSyBnVkT9wiLnMv_RQmVIEkb-meUgPL2qXKs")

app = Flask(__name__)
CORS(app)

@app.route("/api/process", methods=["POST"])
async def process_request():
    genaimodel = GenerativeModel(
        model_name='gemini-2.0-flash-exp',  # Use the correct model name
    )
    data = request.get_json()
    user_query = data.get("query", "")
    # session_id = data.get("session_id")  # Get session ID from request

    if not user_query:
        return jsonify({"error": "Query is required"}), 400

    try:
        # Step 1: Process with Llama"
        llm_response = await process_with_llm(user_query, genaimodel)
        # Step 3: Generate final response
        final_response = await generate_response(llm_response, genaimodel)

        return jsonify(final_response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/clear_context", methods=["POST"])
def clear_context():
    global chat_context
    chat_context.clear()  # Clear the chat context
    return jsonify({"message": "Chat context cleared successfully."}), 200

@app.route("/api/action", methods=["POST"])
def handle_action():
    data = request.get_json()
    action_type = data.get("action_type", "")
    user_query = data.get("query", "")

    if action_type == "details":
        # Implement logic to provide more details
        return jsonify({"response": "Here are more details about your query."}), 200
    elif action_type == "visit":
        # Logic to handle visiting a URL
        return jsonify({"response": "Opening the URL."}), 200
    elif action_type == "refine":
        # Logic to refine search
        return jsonify({"response": "Refining your search."}), 200
    elif action_type == "download":
        # Logic to download results
        return jsonify({"response": "Downloading results."}), 200
    else:
        return jsonify({"error": "Invalid action type."}), 400

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=5002)
