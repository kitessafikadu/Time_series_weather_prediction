import React from "react";
import { useLocation } from "react-router-dom";

const ForecastData = () => {
  const location = useLocation();
  console.log("Location:", location); // Log location to inspect passed data
  const { forecast } = location.state || {};

  // Function to round numerical values to 2 decimal places
  const roundToTwoDecimals = (value) => {
    return value ? value.toFixed(2) : value;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="container px-4 py-8 bg-white shadow-md rounded-md w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-4 text-center text-teal-600">
          Weather Forecast Results
        </h1>

        {!forecast ? (
          <p className="text-center text-red-600">
            No forecast data available.
          </p>
        ) : (
          <div className="mt-8 items-center">
            <h2 className="text-2xl font-bold text-teal-600">Forecast Data</h2>
            <div className="bg-gray-100 p-4 rounded-md mt-4">
              {forecast.map((item, index) => (
                <div key={index} className="border-b py-2">
                  <p>
                    <strong>Date:</strong> {item.date}
                  </p>
                  <p>
                    <strong>Temperature:</strong>{" "}
                    {roundToTwoDecimals(item.meantemp)} °C
                  </p>
                  <p>
                    <strong>Humidity:</strong>{" "}
                    {roundToTwoDecimals(item.humidity)} %
                  </p>
                  <p>
                    <strong>Wind Speed:</strong>{" "}
                    {roundToTwoDecimals(item.wind_speed)} m/s
                  </p>
                  <p>
                    <strong>Pressure:</strong>{" "}
                    {roundToTwoDecimals(item.meanpressure)} hPa
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-teal-500 text-white rounded-md"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForecastData;
