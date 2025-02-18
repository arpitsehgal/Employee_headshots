let scale = 1;
let position = { x: 0, y: 0 };
let isDragging = false;
let startX, startY;

const preview = document.getElementById('preview');
const scaleRange = document.getElementById('scaleRange');
const previewContainer = document.getElementById('preview-container');

document.getElementById('uploadInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            scale = 1;
            position = { x: 0, y: 0 };
            applyTransform();
        };
        reader.readAsDataURL(file);
    }
});

scaleRange.addEventListener('input', function() {
    scale = parseFloat(this.value);
    applyTransform();
});

preview.addEventListener('mousedown', function(event) {
    isDragging = true;
    startX = event.clientX - position.x;
    startY = event.clientY - position.y;
});

document.addEventListener('mousemove', function(event) {
    if (!isDragging) return;
    position.x = event.clientX - startX;
    position.y = event.clientY - startY;
    applyTransform();
});

document.addEventListener('mouseup', function() {
    isDragging = false;
});

function applyTransform() {
    preview.style.transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`;
}

document.getElementById('removeBgButton').addEventListener('click', function() {
    const fileInput = document.getElementById('uploadInput');
    if (fileInput.files.length === 0) {
        alert("Please upload an image first.");
        return;
    }
    
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.url) {
            return fetch('/remove_bg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_url: data.url })
            });
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.url) {
            preview.src = data.url;
            applyTransform();

            // Ensure background stays in processed image
            previewContainer.style.backgroundImage = "url('static/Template.jpg')";

            document.getElementById('downloadLink').onclick = function () {
                downloadProcessedImage(data.url);
            };
            document.getElementById('downloadLink').style.display = 'block';
            document.getElementById('downloadLink').innerText = 'Download Processed Image';
        }
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById("uploadInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("preview").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById("removeBgButton").addEventListener("click", function () {
    const fileInput = document.getElementById("uploadInput");
    if (fileInput.files.length === 0) {
        alert("Please upload an image first.");
        return;
    }

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);
    

    fetch("/upload", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.url) {
            return fetch("/remove_bg", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image_url: data.url })
            });
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.url) {
            const previewContainer = document.getElementById("preview-container");
            const preview = document.getElementById("preview");

            preview.src = data.url;

            // Remove the border once processing is done
            previewContainer.style.border = "0px";

            // Ensure background remains after processing
            previewContainer.style.backgroundImage = "url('static/Template.jpg')";

            // Show download button
            const downloadLink = document.getElementById("downloadLink");
            downloadLink.style.display = "block";
            downloadLink.onclick = function (event) {
                event.preventDefault();
                downloadProcessedImage();
            };
        }
    })
    .catch(error => console.error("Error:", error));
});


function downloadProcessedImage() {
    const previewContainer = document.getElementById("preview-container");

    html2canvas(previewContainer, {
        backgroundColor: null,
        scale: 1,  // Prevents auto-scaling
        width: 500, // Ensures fixed width
        height: 500 // Ensures fixed height
    }).then((canvas) => {
        // Ensure the downloaded image is exactly 500x500
        const resizedCanvas = document.createElement("canvas");
        resizedCanvas.width = 500;
        resizedCanvas.height = 500;
        const ctx = resizedCanvas.getContext("2d");

        // Draw the captured image onto a new 500x500 canvas for accuracy
        ctx.drawImage(canvas, 0, 0, 500, 500);

        // Convert canvas to a high-quality JPG
        resizedCanvas.toBlob((blob) => {
            const link = document.createElement("a");
            link.download = "processed_image.jpg";
            link.href = URL.createObjectURL(blob);
            link.click();
        }, "image/jpeg", 1.0);  // Maximum quality JPG (1.0 = highest quality)
    });
}




