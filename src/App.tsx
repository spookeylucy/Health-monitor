import React, { useState, useEffect } from 'react';
import { Heart, Activity, Droplets, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface HealthData {
  heart_rate: number;
  blood_oxygen: number;
  activity_level: string;
}

interface PredictionResult {
  result: string;
  status: string;
  risk_score: number;
  input_data: HealthData;
}

interface HistoryItem extends PredictionResult {
  timestamp: string;
  id: string;
}

function App() {
  const [formData, setFormData] = useState<HealthData>({
    heart_rate: 75,
    blood_oxygen: 98,
    activity_level: 'moderate'
  });
  
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('healthHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('healthHistory', JSON.stringify(history));
  }, [history]);

  const handleInputChange = (field: keyof HealthData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Replace with your deployed backend URL
      const response = await fetch('https://health-monitor-4.onrender.com/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PredictionResult = await response.json();
      setPrediction(result);

      // Add to history
      const historyItem: HistoryItem = {
        ...result,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep only last 10 items

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 70) return 'text-red-600';
    if (riskScore >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusColor = (status: string) => {
    return status === 'warning' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  };

  const getStatusIcon = (status: string) => {
    return status === 'warning' ? (
      <AlertTriangle className="w-6 h-6 text-red-600" />
    ) : (
      <CheckCircle className="w-6 h-6 text-green-600" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">AI Health Monitor</h1>
          </div>
          <p className="text-gray-600">Monitor your health vitals with AI-powered anomaly detection</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Health Data Input
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Heart Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-red-500" />
                  Heart Rate (BPM)
                </label>
                <input
                  type="number"
                  min="40"
                  max="200"
                  value={formData.heart_rate}
                  onChange={(e) => handleInputChange('heart_rate', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter heart rate"
                />
                <p className="text-xs text-gray-500 mt-1">Normal range: 60-100 BPM</p>
              </div>

              {/* Blood Oxygen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Droplets className="w-4 h-4 mr-2 text-blue-500" />
                  Blood Oxygen Level (%)
                </label>
                <input
                  type="number"
                  min="70"
                  max="100"
                  value={formData.blood_oxygen}
                  onChange={(e) => handleInputChange('blood_oxygen', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter oxygen level"
                />
                <p className="text-xs text-gray-500 mt-1">Normal range: 95-100%</p>
              </div>

              {/* Activity Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-green-500" />
                  Activity Level
                </label>
                <select
                  value={formData.activity_level}
                  onChange={(e) => handleInputChange('activity_level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyzing...' : 'Analyze Health Data'}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">⚠️ {error}</p>
                <p className="text-red-500 text-xs mt-1">
                  Make sure the Flask backend is running on localhost:5000
                </p>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Current Prediction */}
            {prediction && (
              <div className={`bg-white rounded-xl shadow-lg p-6 border-2 ${getStatusColor(prediction.status)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Analysis Result</h3>
                  {getStatusIcon(prediction.status)}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold ${prediction.status === 'warning' ? 'text-red-600' : 'text-green-600'}`}>
                      {prediction.result}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Risk Score:</span>
                    <span className={`font-semibold ${getRiskColor(prediction.risk_score)}`}>
                      {prediction.risk_score}/100
                    </span>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Input Data:</strong> HR: {prediction.input_data.heart_rate} BPM, 
                      O2: {prediction.input_data.blood_oxygen}%, 
                      Activity: {prediction.input_data.activity_level}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-gray-600" />
                  Recent History
                </h3>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {history.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {getStatusIcon(item.status)}
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">{item.result}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getRiskColor(item.risk_score)}`}>
                          {item.risk_score}/100
                        </p>
                        <p className="text-xs text-gray-500">Risk Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>This is a demo application. Always consult healthcare professionals for medical advice.</p>
        </div>
      </div>
    </div>
  );
}

export default App;