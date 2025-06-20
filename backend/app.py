from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
from process_mining import analyze_process
from llm_integration import generate_llm_response

app = Flask(__name__)
CORS(app)

# Load ML model
with open('models/process_model.pkl', 'rb') as f:
    ml_model = pickle.load(f)

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.json
    file_data = data.get('file_data')
    text_input = data.get('text')
    
    # Process mining analysis
    process_analysis = analyze_process(file_data) if file_data else None
    
    # ML prediction
    ml_prediction = ml_model.predict([text_input])[0] if text_input else None
    
    # LLM response
    llm_response = generate_llm_response(text_input, file_data)
    
    return jsonify({
        'process_analysis': process_analysis,
        'ml_prediction': ml_prediction,
        'llm_response': llm_response
    })

if __name__ == '__main__':
    app.run(port=5000)
