// app.js
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const recordButton = document.getElementById('recordButton');
    const stopButton = document.getElementById('stopButton');
    const videoElement = document.getElementById('videoElement');
    const recordingsList = document.getElementById('recordingsList');
    
    // Variables
    let mediaRecorder;
    let recordedChunks = [];
    let stream;
    
    // Check if screen capture is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert('Screen capture is not supported in your browser. Please use Chrome, Edge, or Firefox.');
        recordButton.disabled = true;
        return;
    }
    
    // Start recording function
    async function startRecording() {
        try {
            // Request screen sharing - this allows capturing the entire screen, not just the browser
            stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always"
                },
                audio: false // Set to true if you want to capture system audio (not supported in all browsers)
            });
            
            // Create media recorder instance
            mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            });
            
            // Event handlers
            mediaRecorder.ondataavailable = handleDataAvailable;
            mediaRecorder.onstop = handleStop;
            
            // UI updates
            recordButton.style.display = 'none';
            stopButton.style.display = 'inline-block';
            
            // Start recording
            mediaRecorder.start();
            console.log('Recording started');
        } catch (err) {
            console.error('Error starting screen capture:', err);
            alert('Error starting screen capture: ' + err.message);
        }
    }
    
    // Stop recording function
    function stopRecording() {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
        
        // UI updates
        recordButton.style.display = 'inline-block';
        stopButton.style.display = 'none';
        
        console.log('Recording stopped');
    }
    
    // Handle recorded data
    function handleDataAvailable(event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    }
    
    // Handle recording stop
    function handleStop() {
        // Create a blob from the recorded chunks
        const blob = new Blob(recordedChunks, {
            type: 'video/webm'
        });
        
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);
        
        // Set video source to the recording
        videoElement.src = url;
        
        // Save the recording
        saveRecording(blob);
        
        // Reset recorded chunks
        recordedChunks = [];
    }
    
    // Save recording function
    function saveRecording(blob) {
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `screen-recording-${timestamp}.webm`;
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename;
        downloadLink.textContent = filename;
        
        // Create list item for the recording
        const listItem = document.createElement('li');
        listItem.appendChild(downloadLink);
        
        // Create play button
        const playButton = document.createElement('button');
        playButton.textContent = 'Play';
        playButton.style.marginLeft = '10px';
        playButton.onclick = () => {
            videoElement.src = downloadLink.href;
            videoElement.play();
        };
        listItem.appendChild(playButton);
        
        // Add to recordings list
        recordingsList.appendChild(listItem);
        
        // Save to local storage (optional)
        saveToLocalStorage(filename, blob);
    }
    
    // Save to local storage (limited by browser storage size)
    function saveToLocalStorage(filename, blob) {
        // Get existing recordings or initialize empty array
        const recordings = JSON.parse(localStorage.getItem('screenRecordings') || '[]');
        
        // Add new recording info
        recordings.push({
            filename,
            timestamp: new Date().toISOString(),
            // We can't store the blob directly in localStorage, so we just store metadata
            // For a full solution, you'd need to use IndexedDB for larger data
        });
        
        // Save back to localStorage
        localStorage.setItem('screenRecordings', JSON.stringify(recordings));
    }
    
    // Load existing recordings from localStorage (if any)
    function loadRecordings() {
        const recordings = JSON.parse(localStorage.getItem('screenRecordings') || '[]');
        // In a real app, you'd load the actual video files from IndexedDB or a server
        // This simple example only stores metadata, not the actual recordings
    }
    
    // Event listeners
    recordButton.addEventListener('click', startRecording);
    stopButton.addEventListener('click', stopRecording);
    
    // Initialize
    loadRecordings();
});