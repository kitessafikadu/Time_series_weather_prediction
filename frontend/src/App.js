import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WeatherForecast from "./WeatherForecast";
import ForecastData from "./ForecastData";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Route for the WeatherForecast form */}
        <Route path="/" element={<WeatherForecast />} />

        {/* Route for displaying forecast data */}
        <Route path="/forecast" element={<ForecastData />} />
      </Routes>
    </Router>
  );
};

export default App;
