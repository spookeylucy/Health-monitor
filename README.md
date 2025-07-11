# AI Health Monitoring Web App

A full-stack web application that uses machine learning to detect health anomalies based on heart rate, blood oxygen levels, and activity data.

## Features

- **AI-Powered Anomaly Detection**: Uses Isolation Forest algorithm to detect unusual health patterns
- **Real-time Analysis**: Instant health data analysis with risk scoring
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **History Tracking**: Keeps track of previous health checks
- **REST API**: Flask backend with CORS support for easy integration

## Project Structure

```
├── backend/
│   ├── app.py              # Flask API server
│   ├── train_model.py      # Model training script
│   ├── requirements.txt    # Python dependencies
│   ├── model.pkl          # Trained ML model (generated)
│   └── label_encoder.pkl  # Label encoder (generated)
├── src/
│   ├── App.tsx            # Main React component
│   ├── main.tsx           # React entry point
│   └── index.css          # Tailwind CSS styles
├── package.json           # Node.js dependencies
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Train the model (optional - model will be created automatically):
```bash
python train_model.py
```

5. Start the Flask server:
```bash
python app.py
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### POST /predict
Analyzes health data and returns anomaly prediction.

**Request Body:**
```json
{
  "heart_rate": 75,
  "blood_oxygen": 98,
  "activity_level": "moderate"
}
```

**Response:**
```json
{
  "result": "Normal",
  "status": "normal",
  "risk_score": 25,
  "input_data": {
    "heart_rate": 75,
    "blood_oxygen": 98,
    "activity_level": "moderate"
  }
}
```

### GET /health
Health check endpoint to verify API status.

## Health Data Ranges

- **Heart Rate**: 40-200 BPM (Normal: 60-100 BPM)
- **Blood Oxygen**: 70-100% (Normal: 95-100%)
- **Activity Level**: Low, Moderate, High

## Machine Learning Model

The app uses an **Isolation Forest** algorithm to detect anomalies in health data:

- **Training Data**: 100 synthetic health records with realistic distributions
- **Features**: Heart rate, blood oxygen level, activity level (encoded)
- **Contamination Rate**: 10% (expects 10% of data to be anomalous)
- **Output**: Binary classification (Normal/Anomaly) with risk score

## Deployment

### Backend Deployment (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set the build command: `pip install -r backend/requirements.txt`
4. Set the start command: `cd backend && python app.py`
5. Set environment variables if needed

### Frontend Deployment (Netlify)

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to [Netlify](https://netlify.com)
3. Update the API URL in `src/App.tsx` to point to your deployed backend

### Local Development

For local development, make sure both frontend and backend are running:

```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory for production:

```env
VITE_API_URL=https://your-backend-url.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Disclaimer

This application is for demonstration purposes only. Always consult qualified healthcare professionals for medical advice and diagnosis.