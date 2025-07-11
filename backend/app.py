from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder
import os

app = Flask(__name__)
CORS(app)

# Global variables for model and encoder
model = None
label_encoder = None

def create_and_train_model():
    """Create synthetic health data and train Isolation Forest model"""
    np.random.seed(42)
    
    # Generate synthetic health data
    n_samples = 100
    
    # Generate realistic health metrics
    heart_rate = np.random.normal(75, 12, n_samples)  # Normal resting HR 60-100
    heart_rate = np.clip(heart_rate, 40, 120)  # Clip to reasonable range
    
    blood_oxygen = np.random.normal(98, 2, n_samples)  # Normal SpO2 95-100%
    blood_oxygen = np.clip(blood_oxygen, 85, 100)
    
    activity_levels = np.random.choice(['low', 'moderate', 'high'], n_samples, p=[0.3, 0.5, 0.2])
    
    # Create DataFrame
    df = pd.DataFrame({
        'heart_rate': heart_rate,
        'blood_oxygen': blood_oxygen,
        'activity_level': activity_levels
    })
    
    # Encode categorical variable
    le = LabelEncoder()
    df['activity_level_encoded'] = le.fit_transform(df['activity_level'])
    
    # Prepare features for training
    X = df[['heart_rate', 'blood_oxygen', 'activity_level_encoded']].values
    
    # Train Isolation Forest
    iso_forest = IsolationForest(contamination=0.1, random_state=42)
    iso_forest.fit(X)
    
    # Save model and encoder
    joblib.dump(iso_forest, 'model.pkl')
    joblib.dump(le, 'label_encoder.pkl')
    
    return iso_forest, le

def load_model():
    """Load the trained model and label encoder"""
    global model, label_encoder
    
    if not os.path.exists('model.pkl'):
        print("Model not found. Training new model...")
        model, label_encoder = create_and_train_model()
    else:
        model = joblib.load('model.pkl')
        label_encoder = joblib.load('label_encoder.pkl')
    
    print("Model loaded successfully!")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract features
        heart_rate = float(data.get('heart_rate', 0))
        blood_oxygen = float(data.get('blood_oxygen', 0))
        activity_level = data.get('activity_level', 'low').lower()
        
        # Validate inputs
        if not (40 <= heart_rate <= 200):
            return jsonify({'error': 'Heart rate must be between 40 and 200 bpm'}), 400
        
        if not (70 <= blood_oxygen <= 100):
            return jsonify({'error': 'Blood oxygen must be between 70 and 100%'}), 400
        
        if activity_level not in ['low', 'moderate', 'high']:
            return jsonify({'error': 'Activity level must be low, moderate, or high'}), 400
        
        # Encode activity level
        activity_level_encoded = label_encoder.transform([activity_level])[0]
        
        # Prepare input for prediction
        input_data = np.array([[heart_rate, blood_oxygen, activity_level_encoded]])
        
        # Make prediction
        prediction = model.predict(input_data)[0]
        anomaly_score = model.decision_function(input_data)[0]
        
        # Convert to risk score (0-100)
        risk_score = max(0, min(100, int((1 - anomaly_score) * 50)))
        
        # Determine result
        if prediction == -1:
            result = "Anomaly Detected"
            status = "warning"
        else:
            result = "Normal"
            status = "normal"
        
        return jsonify({
            'result': result,
            'status': status,
            'risk_score': risk_score,
            'input_data': {
                'heart_rate': heart_rate,
                'blood_oxygen': blood_oxygen,
                'activity_level': activity_level
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'model_loaded': model is not None})

@app.route('/')
def home():
    return "✅ AI Health Monitor Backend is running!"



if __name__ == '__main__':
    print("Starting AI Health Monitoring Backend...")
    load_model()
    app.run(debug=True, host='0.0.0.0', port=5000)