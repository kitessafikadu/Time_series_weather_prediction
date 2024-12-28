import React, { useState } from "react";
import { FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const WeatherForecast = () => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [days, setDays] = useState("");
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const requestData = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      days: parseInt(days),
    };

    try {
      const response = await fetch("http://localhost:8000/get-forecast/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch forecast data");
      }

      const data = await response.json();
      setForecast(data.forecast);

      // Navigate to the forecast page when the data is ready
      console.log(data.forecast); // Log to see the forecast data

      navigate("/forecast", { state: { forecast: data } });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-center text-teal-600">
        Weather Forecast
      </h1>
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md"
      >
        <div className="relative z-0 mb-6 w-full group">
          <input
            type="number"
            id="latitude"
            className="peer block w-full appearance-none bg-transparent border-b-2 border-gray-300 px-0 pt-6 pb-2 focus:outline-none focus:border-teal-600 focus:ring-0 text-sm text-gray-900"
            placeholder=" "
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
          />
          <label
            htmlFor="latitude"
            className="absolute text-gray-500 text-sm transition-all duration-200 transform -translate-y-6 scale-75 top-2 left-0 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:translate-y-[-24px] peer-focus:scale-75 peer-focus:text-teal-600"
          >
            Latitude <FaMapMarkerAlt className="inline ml-1" />
          </label>
        </div>

        <div className="relative z-0 mb-6 w-full group">
          <input
            type="number"
            id="longitude"
            className="peer block w-full appearance-none bg-transparent border-b-2 border-gray-300 px-0 pt-6 pb-2 focus:outline-none focus:border-teal-600 focus:ring-0 text-sm text-gray-900"
            placeholder=" "
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
          />
          <label
            htmlFor="longitude"
            className="absolute text-gray-500 text-sm transition-all duration-200 transform -translate-y-6 scale-75 top-2 left-0 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:translate-y-[-24px] peer-focus:scale-75 peer-focus:text-teal-600"
          >
            Longitude <FaMapMarkerAlt className="inline ml-1" />
          </label>
        </div>

        <div className="relative z-0 mb-6 w-full group">
          <input
            type="number"
            id="days"
            className="peer block w-full appearance-none bg-transparent border-b-2 border-gray-300 px-0 pt-6 pb-2 focus:outline-none focus:border-teal-600 focus:ring-0 text-sm text-gray-900"
            placeholder=" "
            value={days}
            onChange={(e) => setDays(e.target.value)}
            required
          />
          <label
            htmlFor="days"
            className="absolute text-gray-500 text-sm transition-all duration-200 transform -translate-y-6 scale-75 top-2 left-0 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:translate-y-[-24px] peer-focus:scale-75 peer-focus:text-teal-600"
          >
            Forecast Days <FaCalendarAlt className="inline ml-1" />
          </label>
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="bg-teal-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-teal-700 transition duration-200"
          >
            Get Forecast
          </button>
        </div>
      </form>

      {loading && <p className="text-center text-teal-600">Loading...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}
      {forecast && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-teal-600">Forecast Data:</h2>
          <pre className="bg-gray-100 p-4 rounded-md mt-4">
            {JSON.stringify(forecast, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default WeatherForecast;
