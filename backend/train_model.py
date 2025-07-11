import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder
import joblib

def create_synthetic_health_data():
    """Generate synthetic health monitoring data"""
    np.random.seed(42)
    n_samples = 100
    
    # Generate realistic health metrics
    heart_rate = np.random.normal(75, 12, n_samples)
    heart_rate = np.clip(heart_rate, 40, 120)
    
    blood_oxygen = np.random.normal(98, 2, n_samples)
    blood_oxygen = np.clip(blood_oxygen, 85, 100)
    
    activity_levels = np.random.choice(['low', 'moderate', 'high'], n_samples, p=[0.3, 0.5, 0.2])
    
    # Add some anomalies
    n_anomalies = 10
    anomaly_indices = np.random.choice(n_samples, n_anomalies, replace=False)
    
    # Create anomalous data points
    for idx in anomaly_indices:
        if np.random.random() < 0.5:
            heart_rate[idx] = np.random.choice([35, 160])  # Very low or high HR
        else:
            blood_oxygen[idx] = np.random.uniform(80, 90)  # Low oxygen
    
    return pd.DataFrame({
        'heart_rate': heart_rate,
        'blood_oxygen': blood_oxygen,
        'activity_level': activity_levels
    })

def train_anomaly_detection_model():
    """Train and save the Isolation Forest model"""
    print("Generating synthetic health data...")
    df = create_synthetic_health_data()
    
    print(f"Dataset shape: {df.shape}")
    print(df.head())
    
    # Encode categorical variables
    le = LabelEncoder()
    df['activity_level_encoded'] = le.fit_transform(df['activity_level'])
    
    # Prepare features
    X = df[['heart_rate', 'blood_oxygen', 'activity_level_encoded']].values
    
    # Train Isolation Forest
    print("Training Isolation Forest model...")
    model = IsolationForest(
        contamination=0.1,  # Expect 10% anomalies
        random_state=42,
        n_estimators=100
    )
    
    model.fit(X)
    
    # Save model and encoder
    joblib.dump(model, 'model.pkl')
    joblib.dump(le, 'label_encoder.pkl')
    
    print("Model trained and saved successfully!")
    
    # Test the model
    predictions = model.predict(X)
    anomalies = np.sum(predictions == -1)
    print(f"Detected {anomalies} anomalies in training data")
    
    return model, le

if __name__ == "__main__":
    train_anomaly_detection_model()