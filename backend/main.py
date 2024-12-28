from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import requests
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
from datetime import datetime, timedelta
import joblib  # for loading the scaler

from fastapi.middleware.cors import CORSMiddleware
import logging

# Initialize FastAPI and logging
logging.basicConfig(level=logging.INFO)
app = FastAPI()

# Load model and scaler
MODEL_PATH = "timeseries_weather_prediction1.keras"
model = tf.keras.models.load_model(MODEL_PATH)
scaler = joblib.load("multivariate_scaler.pkl")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-react-app.com"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# API Key for OpenWeatherMap
OPENWEATHER_API_KEY = "ae3de1455dbc734099bae5f6c355682c"

# Define request and response models
class ForecastRequest(BaseModel):
    latitude: float
    longitude: float
    days: int

class ForecastResponse(BaseModel):
    date: str
    meantemp: float
    humidity: float
    wind_speed: float
    meanpressure: float

@app.post("/get-forecast/", response_model=List[ForecastResponse])
async def get_forecast(request: ForecastRequest):
    try:
        # Fetch live weather data
        weather_data = fetch_weather_data(request.latitude, request.longitude)
        if not weather_data:
            raise HTTPException(status_code=404, detail="Failed to fetch weather data.")

        # Preprocess data for the model
        processed_data = preprocess_weather_data(weather_data)

        # Generate forecast
        forecast_results = generate_forecast(processed_data, request.days)

        # Prepare response
        response = prepare_forecast_response(forecast_results, request.days)

        return response

    except Exception as e:
        logging.error(f"Error during prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def fetch_weather_data(latitude: float, longitude: float) -> dict:
    """Fetch live weather data from OpenWeatherMap."""
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={OPENWEATHER_API_KEY}&units=metric"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    return None

def preprocess_weather_data(weather_data: dict) -> np.ndarray:
    """Extract and preprocess features for the ML model."""
    features = [
        weather_data["main"]["temp"],         # Mean temperature
        weather_data["main"]["humidity"],    # Humidity
        weather_data["wind"]["speed"],       # Wind speed
        weather_data["main"]["pressure"],    # Pressure
    ]

    # Scale the features
    scaled_features = scaler.transform([features])[0]

    # Create a sequence of 60 timesteps (padding with zeros)
    timesteps = 60
    padded_sequence = np.zeros((timesteps, len(features)))  # Initialize with zeros
    padded_sequence[-1] = scaled_features  # Add the current timestep to the end

    return padded_sequence


def generate_forecast(input_data: np.ndarray, days: int) -> List[np.ndarray]:
    """Generate forecasts for the specified number of days."""
    forecasts = []
    Xin = input_data.reshape(1, 60, 4)  # Reshape for LSTM: batch_size=1, timesteps=60, features=4
    logging.info(f"Initial input shape for prediction: {Xin.shape}")

    for _ in range(days):
        # Predict next time step
        prediction = model.predict(Xin)
        logging.info(f"Prediction shape: {prediction.shape}")

        forecasts.append(prediction[0])

        # Update input data with the prediction (sliding window)
        Xin = insert_end(Xin, prediction[0])
        logging.info(f"Updated input shape after sliding window: {Xin.shape}")

    return forecasts


def insert_end(Xin: np.ndarray, new_input: np.ndarray) -> np.ndarray:
    """Update the input data by shifting the sequence and inserting the new input."""
    Xin[:, :-1, :] = Xin[:, 1:, :]  # Shift sequence
    Xin[:, -1, :] = new_input       # Insert new prediction at the end
    return Xin

def prepare_forecast_response(forecasts: List[np.ndarray], days: int) -> List[ForecastResponse]:
    """Prepare the forecast response with dates and predictions."""
    start_date = datetime.now()
    results = []
    
    # Inverse transform the forecast values to original scale
    for i, forecast in enumerate(forecasts):
        # Inverse scaling
        original_values = scaler.inverse_transform([forecast])

        results.append(ForecastResponse(
            date=(start_date + timedelta(days=i)).strftime("%Y-%m-%d"),
            meantemp=original_values[0][0],       # Adjust based on model output
            humidity=original_values[0][1],       # Adjust based on model output
            wind_speed=original_values[0][2],     # Adjust based on model output
            meanpressure=original_values[0][3],   # Adjust based on model output
        ))
    
    return results

