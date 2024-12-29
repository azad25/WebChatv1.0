import asyncio
import threading
import time
# import uuid  # Import UUID for generating unique session IDs
from flask import Flask, request, jsonify
from flask_cors import CORS
from llm_service import process_with_llm
from context import chat_context
from genaimodel import geminiModel,clear_history, get_recent_logs, log_event
from flask_socketio import SocketIO, emit
from weather_service import weather_service
from cache_service import get_cached_response,cache_response
import signal
import sys

   

app = Flask(__name__)
CORS(app)
# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")  # Allow CORS for all origins

# Track connected clients
connected_clients = set()
@socketio.on('connect')
def handle_connect():
    images = [
            
      { "url": "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDF8fG5hdHVyZXxlbnwwfHx8fDE2MjY0MjY0MjM&q=80&w=400" }
    ,
    
      { "url": "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDF8fGFuaW1hbHxlbnwwfHx8fDE2MjY0MjY0MjM&q=80&w=400" }
    ,
    
      { "url": "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDF8fGNpdHklMjBpbWFnZXxlbnwwfHx8fDE2MjY0MjY0MjM&q=80&w=400" }
    ,
    
      { "url": "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDF8fGZvb2QlMjBpbWFnZXxlbnwwfHx8fDE2MjY0MjY0MjM&q=80&w=400" }
            
        ]
    
    connected_clients.add(request.sid)
    log_event(
        event_type="CONNECTION",
        message=f"Client {request.sid} connected",
        status="success"
    )
    emit('response', {'message': 'Connected to server', 'history': chat_context})
    # Send initial logs upon connection
    send_logs_update()
    cache_response('images', images)
    socketio.emit('images', get_cached_response('images'))
    print(f"Client {request.sid} connected. Total clients: {len(connected_clients)}")

@socketio.on('disconnect')
def handle_disconnect():
    try:
        if request.sid in connected_clients:
            connected_clients.remove(request.sid)
            log_event(
                event_type="CONNECTION",
                message=f"Client {request.sid} disconnected",
                status="info"
            )
            print(f"Client {request.sid} disconnected. Total clients: {len(connected_clients)}")
    except Exception as e:
        log_event(
            event_type="ERROR",
            message=f"Error during disconnect: {str(e)}",
            status="error"
        )
        print(f"Error during disconnect: {e}")

def send_logs_update():
    """Send latest 5 logs to all connected clients"""
    try:
        logs = get_recent_logs(5)  # Changed from 10 to 5
        formatted_logs = [{
            'id': log.id,
            'event_type': log.event_type,
            'message': log.message,
            'timestamp': log.timestamp.isoformat(),
            'status': log.status,
            'model_name': log.model_name
        } for log in logs]
        
        socketio.emit('logs_update', {
            'status': 'success',
            'logs': formatted_logs
        })
    except Exception as e:
        log_event(
            event_type="ERROR",
            message=f"Error sending logs update: {str(e)}",
            status="error"
        )
        socketio.emit('logs_update', {
            'status': 'error',
            'message': str(e)
        })

# Request logs manually
@socketio.on('request_logs')
def handle_logs_request():
    log_event(
        event_type="REQUEST",
        message="Client requested logs",
        status="info"
    )
    send_logs_update()  # Will now send only 5 logs

def handle_get_weather():
    weather_data = asyncio.run(weather_service())
    if weather_data is None:
        weather_data = asyncio.run(weather_service())
    return weather_data


# Start a background thread to periodically send log updates
def background_logs_update():
    while True:
        if connected_clients:  # Only send if there are connected clients
            send_logs_update()
        time.sleep(5)  # Update every 2 seconds


def ping_clients():
    while True:
        weather_data = handle_get_weather()
        socketio.emit('ping', {'message': 'ping', 'weather': weather_data})
        socketio.sleep(5)

@socketio.on('message')
def handle_message(data):
    try:
        # Log the incoming prompt
        log_event(
            event_type="PROMPT",
            message=f"User: {data}",  # Log full prompt
            status="info",
            model_name="gemini-1.5-pro"
        )
        response = geminiModel.send_message(data)
        emit('response', {'message': str(response)})
        
        # Update logs for all clients
        send_logs_update()
    except Exception as e:
        error_msg = f"Error processing message: {str(e)}"
        log_event(
            event_type="ERROR",
            message=error_msg,
            status="error"
        )
        emit('error', {'message': error_msg})

@socketio.on('send_message')
def handle_send_message(data):
    user_query = data
    
    if not user_query:
        socketio.emit('response', {'message': f"Query required:"})

    try:
        final_response = asyncio.run(process_with_llm(user_query, geminiModel))
        
        emit('response', {'message': str(final_response)})
            
            # Update logs for all clients
        send_logs_update()

        socketio.emit('response', final_response)
    except Exception as e:
        print(f"Error in handle_send_message: {e}")  # Debug print
        error_msg = f"Error processing message: {str(e)}"
        log_event(
            event_type="ERROR",
            message=error_msg,
            status="error",
            model_name="gemini-1.5-pro"
        )
        emit('error', {'message': error_msg})

# @socketio.on('disconnect')
# def handle_disconnect():
#     print("Client disconnected")

# Load environment variables from .env file
@app.route("/api/process", methods=["POST"])
async def process_request():
    
    data = request.get_json()
    user_query = data.get("query", "")
    # session_id = data.get("session_id")  # Get session ID from request

    if not user_query:
        return jsonify({"error": "Query is required"}), 400

    try:
        final_response = await process_with_llm(user_query, geminiModel)

        return jsonify(final_response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/clear_context", methods=["POST"])
def clear_context():
    global chat_context
    clear_history()
    chat_context.clear()  # Clear the chat context
    return jsonify({"message": "Chat context cleared successfully."}), 200

@app.route("/api/get_conversation_history", methods=["GET"])
def get_conversation_history():
    return jsonify(chat_context), 200

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
    
shutdown_in_progress = False

async def cleanup():
    # Wait for any ongoing tasks to finish
    pending = asyncio.all_tasks()
    for task in pending:
        if not task.done():
            await task

# In your signal handler, call the cleanup function
async def signal_handler(sig, frame):
    global shutdown_in_progress
    if not shutdown_in_progress:
        shutdown_in_progress = True
        print('Gracefully shutting down...')
        await cleanup()  # Wait for ongoing tasks to finish
        sys.exit(0)


#Graceful Shutdown
# signal.signal(signal.SIGINT, signal_handler)

# Start the background thread when the server starts
threading.Thread(target=background_logs_update, daemon=True).start()

if __name__ == "__main__":
    threading.Thread(target=ping_clients).start()
    socketio.run(app, host='0.0.0.0', debug=True, port=5002)
