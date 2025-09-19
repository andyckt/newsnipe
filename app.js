// Function to detect if the device is mobile
function isMobileDevice() {
    // Method 1: Check user agent
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
    const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
    
    // Method 2: Check screen width
    const isMobileScreenSize = window.innerWidth <= 1024;
    
    // Method 3: Check touch capability
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Method 4: Check if orientation is available (mostly on mobile devices)
    const hasOrientation = typeof window.orientation !== 'undefined' || 
                          window.matchMedia("(orientation: portrait)").matches !== undefined;
    
    // Consider it a mobile device if it meets at least 2 of the criteria
    let mobileScore = 0;
    if (isMobileUserAgent) mobileScore++;
    if (isMobileScreenSize) mobileScore++;
    if (isTouchDevice) mobileScore++;
    if (hasOrientation) mobileScore++;
    
    console.log('Mobile detection scores:', {
        userAgent: isMobileUserAgent,
        screenSize: isMobileScreenSize,
        touchDevice: isTouchDevice,
        orientation: hasOrientation,
        totalScore: mobileScore
    });
    
    return mobileScore >= 2;
}

// Recording functionality
function initRecording() {
    let mediaRecorder;
    let audioChunks = [];
    const recordButton = document.getElementById('recordButton');
    const submitButton = document.getElementById('submitButton');
    const statusElement = document.getElementById('status');
    const audioPlayback = document.getElementById('audioPlayback');

    recordButton.addEventListener('click', function() {
        if (recordButton.textContent === 'Start Recording') {
            // Request microphone access
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    mediaRecorder = new MediaRecorder(stream);
                    mediaRecorder.start();
                    
                    audioChunks = [];
                    mediaRecorder.addEventListener("dataavailable", event => {
                        audioChunks.push(event.data);
                    });
                    
                    recordButton.textContent = 'Stop Recording';
                    recordButton.classList.add('recording');
                    statusElement.textContent = 'Recording...';
                    
                    mediaRecorder.addEventListener("stop", () => {
                        // Stop all audio tracks
                        stream.getTracks().forEach(track => track.stop());
                        
                        submitButton.style.display = 'inline-block';
                        recordButton.classList.remove('recording');
                        statusElement.textContent = 'Recording stopped. Ready to submit.';
                    });
                })
                .catch(error => {
                    console.error('Error accessing microphone:', error);
                    statusElement.textContent = 'Error: Could not access microphone';
                });
        } else {
            // Stop recording
            mediaRecorder.stop();
            recordButton.textContent = 'Start Recording';
        }
    });
    
    submitButton.addEventListener('click', function() {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Create a FormData object to send the recording
        const formData = new FormData();
        formData.append('audio', audioBlob);
        
        // Here you would send the formData to your server
        // Example:
        // fetch('/upload-recording', {
        //     method: 'POST',
        //     body: formData
        // })
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log('Success:', data);
        //         statusElement.textContent = 'Recording submitted successfully!';
        //     })
        //     .catch(error => {
        //         console.error('Error:', error);
        //         statusElement.textContent = 'Error submitting recording.';
        //     });
        
        // For demo purposes, show a success message and create an audio playback
        statusElement.textContent = 'Recording submitted!';
        
        // Create audio element for playback
        const audioURL = window.URL.createObjectURL(audioBlob);
        audioPlayback.innerHTML = ''; // Clear previous audio
        const audio = document.createElement('audio');
        audio.src = audioURL;
        audio.controls = true;
        audioPlayback.appendChild(audio);
    });
}

// Check if mobile and show appropriate content
window.addEventListener('load', function() {
    const isMobile = isMobileDevice();
    console.log('Is mobile device:', isMobile);
    
    if (isMobile) {
        document.getElementById('mobileOnly').style.display = 'block';
        document.getElementById('desktopWarning').style.display = 'none';
        
        // Initialize recording functionality
        initRecording();
    } else {
        document.getElementById('mobileOnly').style.display = 'none';
        document.getElementById('desktopWarning').style.display = 'block';
    }
});

// Re-check on resize (in case of device rotation or browser window resizing)
window.addEventListener('resize', function() {
    const isMobile = isMobileDevice();
    
    if (isMobile) {
        document.getElementById('mobileOnly').style.display = 'block';
        document.getElementById('desktopWarning').style.display = 'none';
    } else {
        document.getElementById('mobileOnly').style.display = 'none';
        document.getElementById('desktopWarning').style.display = 'block';
    }
});
