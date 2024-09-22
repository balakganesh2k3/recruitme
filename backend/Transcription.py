from flask import Flask, request, jsonify
import whisper
import os
from flask_cors import CORS
app = Flask(__name__)
CORS(app)


# Load Whisper model (base in this example)
model = whisper.load_model("base")

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio = request.files['audio']

    # Save the file temporarily
    audio_path = os.path.join('temp', audio.filename)
    audio.save(audio_path)

    # Transcribe the audio chunk
    result = model.transcribe(audio_path)
    transcription = result["text"]

    # Optionally remove the file after transcription to save space
    os.remove(audio_path)

    return jsonify({"transcription": transcription}), 200

if __name__ == "__main__":
    if not os.path.exists('temp'):
        os.makedirs('temp')
    app.run(host='0.0.0.0', port=5000)
