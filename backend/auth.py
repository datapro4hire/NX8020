from flask import redirect, request, session
from authlib.integrations.flask_client import OAuth
import os

oauth = OAuth()

def init_auth(app):
    oauth.init_app(app)
    
    # Google OAuth setup
    google = oauth.register(
        name='google',
        client_id=os.getenv('GOOGLE_CLIENT_ID'),
        client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
        access_token_url='https://accounts.google.com/o/oauth2/token',
        access_token_params=None,
        authorize_url='https://accounts.google.com/o/oauth2/auth',
        authorize_params=None,
        api_base_url='https://www.googleapis.com/oauth2/v1/',
        client_kwargs={'scope': 'openid email profile'}
    )
    
    # Microsoft OAuth setup
    microsoft = oauth.register(
        name='microsoft',
        client_id=os.getenv('MICROSOFT_CLIENT_ID'),
        client_secret=os.getenv('MICROSOFT_CLIENT_SECRET'),
        access_token_url='https://login.microsoftonline.com/common/oauth2/v2.0/token',
        authorize_url='https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        api_base_url='https://graph.microsoft.com/v1.0/',
        client_kwargs={'scope': 'openid email profile User.Read'}
    )
    
    # GitHub OAuth setup
    github = oauth.register(
        name='github',
        client_id=os.getenv('GITHUB_CLIENT_ID'),
        client_secret=os.getenv('GITHUB_CLIENT_SECRET'),
        access_token_url='https://github.com/login/oauth/access_token',
        authorize_url='https://github.com/login/oauth/authorize',
        api_base_url='https://api.github.com/',
        client_kwargs={'scope': 'user:email'}
    )
    
    return google, microsoft, github
