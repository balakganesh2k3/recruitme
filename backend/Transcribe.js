const express = require('express');
const { exec } = require('child_process');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/transcribe', upload.single('audio'), (req, res) => {
    const audioPath = req.file.path;

    // Run the Python transcription script
    exec(`python transcription.py "${audioPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${error}`);
            return res.status(500).send('Transcription error');
        }

        // Send the transcription result back to the frontend
        res.json({ transcription: stdout.trim() });

        // Optionally, delete the temporary audio file after processing
        fs.unlink(audioPath, (err) => {
            if (err) console.error("Error deleting temp file:", err);
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
