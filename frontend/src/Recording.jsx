import React, { useEffect, useState } from "react";

const AudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);

    useEffect(() => {
        if (isRecording && mediaRecorder) {
            const interval = setInterval(() => {
                if (audioChunks.length > 0) {
                    const chunk = audioChunks.shift(); // Get the first chunk
                    sendAudioChunk(chunk); // Send the chunk to the backend
                }
            }, 5000); // Process every 5 seconds

            return () => clearInterval(interval); // Cleanup interval on unmount
        }
    }, [isRecording, mediaRecorder, audioChunks]);

    const handleStartRecording = async () => {
        if (navigator.mediaDevices) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    setAudioChunks(prev => [...prev, event.data]); // Store chunks in state
                }
            };

            recorder.start(); // Start recording
            setIsRecording(true);
        } else {
            console.error("Media devices not supported");
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop(); // Stop recording
            setIsRecording(false);
        }
    };

    const sendAudioChunk = (audioChunk) => {
        const formData = new FormData();
        formData.append("audio", audioChunk, "audio_chunk.webm"); // Send chunk as a .webm file

        fetch("http://localhost:5000/transcribe", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Transcription:", data.transcription); // Display transcription
            })
            .catch((error) => console.error("Error sending audio chunk:", error));
    };

    return (
        <div>
            <button onClick={handleStartRecording} disabled={isRecording}>
                Start Recording
            </button>
            <button onClick={handleStopRecording} disabled={!isRecording}>
                Stop Recording
            </button>
        </div>
    );
};

export default AudioRecorder;
