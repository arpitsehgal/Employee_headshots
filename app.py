from flask import Flask, render_template, request, send_file, jsonify
import requests
import os

app = Flask(__name__)

REMOVE_BG_API_KEY = "hG6CDmJHXf24uGzW2DzDDCTw"
UPLOAD_FOLDER = "static/uploads"
PROCESSED_FOLDER = "static/processed"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'image' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    return jsonify({"url": filepath})

@app.route('/remove_bg', methods=['POST'])
def remove_bg():
    data = request.json
    image_url = data.get("image_url")

    if not image_url:
        return jsonify({"error": "No image provided"}), 400

    # Send the original image to remove.bg
    with open(image_url, 'rb') as file:
        response = requests.post(
            'https://api.remove.bg/v1.0/removebg',
            files={'image_file': file},
            data={'size': 'auto'},
            headers={'X-Api-Key': REMOVE_BG_API_KEY}
        )

    if response.status_code != 200:
        return jsonify({"error": "Failed to process image"}), 500

    # Save the processed image
    output_filename = os.path.join(PROCESSED_FOLDER, os.path.basename(image_url))
    with open(output_filename, 'wb') as out_file:
        out_file.write(response.content)

    return jsonify({"url": output_filename})

@app.route('/download/<filename>')
def download(filename):
    filepath = os.path.join(PROCESSED_FOLDER, filename)
    return send_file(filepath, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
