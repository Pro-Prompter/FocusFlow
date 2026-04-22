import { useState, useEffect, useMemo } from "react";
import {
  Cloud,
  CloudRain,
  Sun,
  Thermometer,
  Wind,
  CloudSnow,
  CloudFog,
  CloudLightning,
  Loader,
  RefreshCw,
} from "lucide-react";

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [unit, setUnit] = useState("C"); // "C" for Celsius, "F" for Fahrenheit

  // Get user location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  }, []);

  // Fetch weather data when location or reloadTrigger changes
  useEffect(() => {
    if (!location) return;

    const controller = new AbortController();

    const fetchWeather = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`,
          { signal: controller.signal }
        );

        if (!response.ok) throw new Error("Weather API request failed");

        const data = await response.json();
        setWeatherData(data);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError("Could not load weather data.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    return () => controller.abort();
  }, [location, reloadTrigger]);

  const refreshWeather = () => {
    if (location && !loading) {
      setReloadTrigger((prev) => prev + 1);
    }
  };

  const toggleUnit = () => {
    setUnit((prev) => (prev === "C" ? "F" : "C"));
  };

  const convertTemp = (celsius) => {
    return unit === "F" ? (celsius * 9) / 5 + 32 : celsius;
  };

  const unitSymbol = unit === "C" ? "°C" : "°F";

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun size={24} />;
    if (code >= 1 && code <= 3) return <Cloud size={24} />;
    if (code >= 45 && code <= 48) return <CloudFog size={24} />;
    if (code >= 51 && code <= 67) return <CloudRain size={24} />;
    if (code >= 71 && code <= 77) return <CloudSnow size={24} />;
    if (code >= 80 && code <= 82) return <CloudRain size={24} />;
    if (code >= 85 && code <= 86) return <CloudSnow size={24} />;
    if (code >= 95 && code <= 99) return <CloudLightning size={24} />;
    return <Cloud size={24} />;
  };

  const getWeatherDescription = (code) => {
    if (code === 0) return "Clear sky";
    if (code >= 1 && code <= 3) return "Partly cloudy";
    if (code >= 45 && code <= 48) return "Foggy";
    if (code >= 51 && code <= 67) return "Rainy";
    if (code >= 71 && code <= 77) return "Snowy";
    if (code >= 80 && code <= 82) return "Rain showers";
    if (code >= 85 && code <= 86) return "Snow showers";
    if (code >= 95 && code <= 99) return "Thunderstorm";
    return "Unknown";
  };

  const forecastDays = useMemo(() => {
    return (weatherData?.daily?.time?.slice(0, 3) ?? []).map((date, i) => ({
      date,
      max: weatherData.daily.temperature_2m_max[i],
      min: weatherData.daily.temperature_2m_min[i],
      code: weatherData.daily.weather_code[i],
    }));
  }, [weatherData]);

  if (error) {
    return (
      <div className="weather-container error">
        <p role="alert" className="weather-error">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="weather-container">
      <header className="weather-header">
        <h2>Weather</h2>
        <div className="weather-header-controls">
          <button
            onClick={toggleUnit}
            className="weather-unit-toggle"
            title="Switch units"
            aria-label="Toggle temperature units"
          >
            {unit === "C" ? "°F" : "°C"}
          </button>
          <button
            onClick={refreshWeather}
            disabled={loading}
            className="weather-refresh-btn"
            title="Refresh weather"
            aria-label="Refresh weather"
          >
            {loading ? (
              <Loader size={18} className="loader spin" />
            ) : (
              <RefreshCw size={18} />
            )}
          </button>
        </div>
      </header>

      {loading ? (
        <div className="weather-loading">
          <Loader size={24} className="loader spin" />
          <p>Fetching latest weather...</p>
        </div>
      ) : weatherData ? (
        <main className="weather-content">
          <section className="weather-current">
            <div className="weather-icon-temp">
              {getWeatherIcon(weatherData.current.weather_code)}
              <div className="weather-temp">
                {Math.round(convertTemp(weatherData.current.temperature_2m))}
                {unitSymbol}
              </div>
            </div>
            <p className="weather-description">
              {getWeatherDescription(weatherData.current.weather_code)}
            </p>
          </section>

          <section className="weather-details">
            <div className="weather-detail-item">
              <Thermometer size={16} />
              <span>
                Feels like:{" "}
                {Math.round(convertTemp(weatherData.current.apparent_temperature))}
                {unitSymbol}
              </span>
            </div>
            <div className="weather-detail-item">
              <Wind size={16} />
              <span>
                Wind: {Math.round(weatherData.current.wind_speed_10m)}{" "}
                {weatherData.current_units.wind_speed_10m}
              </span>
            </div>
            <div className="weather-detail-item">
              <CloudRain size={16} />
              <span>
                Precip: {weatherData.current.precipitation}{" "}
                {weatherData.current_units.precipitation}
              </span>
            </div>
          </section>

          <section className="weather-forecast">
            <h3>3-Day Forecast</h3>
            <div className="forecast-items">
              {forecastDays.map(({ date, max, min, code }) => (
                <div key={date} className="forecast-item">
                  <div className="forecast-day">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </div>
                  <div className="forecast-icon">{getWeatherIcon(code)}</div>
                  <div className="forecast-temp">
                    <span className="forecast-temp-max">
                      {Math.round(convertTemp(max))}°
                    </span>
                    <span className="forecast-temp-min">
                      {Math.round(convertTemp(min))}°
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      ) : null}
    </div>
  );
};

export default Weather;
