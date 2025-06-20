from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
import pickle
import pandas as pd

def train_and_save_model():
    # Example training data - replace with your actual data
    data = pd.DataFrame({
        'text': ['process bottleneck', 'efficient workflow', 'resource waste'],
        'label': ['bottleneck', 'efficient', 'waste']
    })
    
    # Create pipeline
    model = Pipeline([
        ('tfidf', TfidfVectorizer()),
        ('clf', RandomForestClassifier())
    ])
    
    # Train model
    model.fit(data['text'], data['label'])
    
    # Save model
    with open('models/process_model.pkl', 'wb') as f:
        pickle.dump(model, f)

if __name__ == '__main__':
    train_and_save_model()
