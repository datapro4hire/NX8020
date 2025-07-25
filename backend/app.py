from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import pickle
import pandas as pd
from process_mining import analyze_process
from llm_integration import generate_llm_response
from auth import init_auth
from functools import wraps
import os

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY')
CORS(app)

# Load ML model
with open('models/process_model.pkl', 'rb') as f:
    ml_model = pickle.load(f)

google = init_auth(app)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/auth/google')
def google_login():
    redirect_uri = url_for('google_authorize', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/api/auth/google/callback')
def google_authorize():
    token = google.authorize_access_token()
    user_info = google.get('userinfo').json()
    session['user'] = user_info
    return redirect(os.getenv('FRONTEND_URL'))

@app.route('/api/auth/logout')
def logout():
    session.pop('user', None)
    return jsonify({'status': 'success'})

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

@app.route('/api/auth/microsoft')
def microsoft_login():
    redirect_uri = url_for('microsoft_authorize', _external=True)
    return microsoft.authorize_redirect(redirect_uri)

@app.route('/api/auth/microsoft/callback')
def microsoft_authorize():
    token = microsoft.authorize_access_token()
    user_info = microsoft.get('me').json()
    session['user'] = {
        'email': user_info.get('mail') or user_info.get('userPrincipalName'),
        'name': user_info.get('displayName'),
        'provider': 'microsoft'
    }
    return redirect(os.getenv('FRONTEND_URL'))

@app.route('/api/auth/github')
def github_login():
    redirect_uri = url_for('github_authorize', _external=True)
    return github.authorize_redirect(redirect_uri)

@app.route('/api/auth/github/callback')
def github_authorize():
    token = github.authorize_access_token()
    user_info = github.get('user').json()
    emails = github.get('user/emails').json()
    primary_email = next(e['email'] for e in emails if e['primary'])
    
    session['user'] = {
        'email': primary_email,
        'name': user_info.get('name'),
        'provider': 'github'
    }
    return redirect(os.getenv('FRONTEND_URL'))

if __name__ == '__main__':
    app.run(port=5000)
