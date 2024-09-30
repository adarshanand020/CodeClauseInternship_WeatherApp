import { useState, useEffect } from "react";
import { Cloud, Droplets, Wind, Sun, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ModeToggle } from "./mode-toggle";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_API = "https://api.open-meteo.com/v1/forecast";

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1: string;
}

interface WeatherData {
  current: {
    temperature: number;
    windSpeed: number;
    rain: number;
  };
  hourly: {
    time: string[];
    temperature: number[];
    humidity: number[];
    windSpeed: number[];
  };
}

export default function WeatherApp() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      fetchLocations(searchQuery.trim());
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const fetchLocations = async (query: string) => {
    try {
      const response = await fetch(
        `${GEOCODING_API}?name=${query}&count=10&language=en&format=json`
      );
      const data = await response.json();
      setSuggestions(data.results || []);
    } catch (err) {
      setError("Failed to fetch location suggestions");
    }
  };

  const fetchWeatherData = async (location: Location) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${FORECAST_API}?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,wind_speed_10m,rain&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`
      );
      const data = await response.json();
      setWeatherData({
        current: {
          temperature: data.current.temperature_2m,
          windSpeed: data.current.wind_speed_10m,
          rain: data.current.rain,
        },
        hourly: {
          time: data.hourly.time,
          temperature: data.hourly.temperature_2m,
          humidity: data.hourly.relative_humidity_2m,
          windSpeed: data.hourly.wind_speed_10m,
        },
      });
    } catch (err) {
      setError("Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    localStorage.setItem("selectedLocation", JSON.stringify(location));
    setSuggestions([]);
    fetchWeatherData(location);
  };

  const getWeatherIcon = (temp: number) => {
    if (temp > 25) return <Sun className="h-6 w-6" />;
    return <Cloud className="h-6 w-6" />;
  };

  const getDayForecast = () => {
    if (!weatherData) return [];
    const dayForecast = [];
    for (let i = 0; i < 7; i++) {
      const index = i * 24;
      dayForecast.push({
        day: new Date(weatherData.hourly.time[index]).toLocaleDateString(
          "en-US",
          { weekday: "short" }
        ),
        temp: weatherData.hourly.temperature[index],
        humidity: weatherData.hourly.humidity[index],
        windSpeed: weatherData.hourly.windSpeed[index],
      });
    }
    return dayForecast;
  };

  useEffect(() => {
    const location = localStorage.getItem("selectedLocation");
    if (location) {
      const parsedLocation = JSON.parse(location);
      setSelectedLocation(parsedLocation);
      fetchWeatherData(parsedLocation);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="relative">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search for a city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <ModeToggle />
        </div>
        {suggestions.length > 0 && (
          <Card className="absolute z-10 w-full mt-1">
            <ScrollArea className="w-full h-60">
              <ul>
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    className="px-4 py-2 cursor-pointer"
                    onClick={() => handleLocationSelect(suggestion)}
                  >
                    {suggestion.name}, {suggestion.admin1}, {suggestion.country}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </Card>
        )}
      </div>

      {error && <div className="text-red-500">{error}</div>}

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      )}

      {weatherData && selectedLocation && !loading && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <RefreshCw
              className="h-6 w-6 cursor-pointer"
              onClick={() => fetchWeatherData(selectedLocation)}
            />
            <h2 className="text-2xl font-bold">
              {selectedLocation.name}, {selectedLocation.admin1},{" "}
              {selectedLocation.country}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Temperature</CardTitle>
              </CardHeader>
              <CardContent className="text-4xl font-bold">
                {weatherData.current.temperature}°C
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Wind Speed</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl">
                {weatherData.current.windSpeed} km/h
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Rain</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl">
                {weatherData.current.rain} mm
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Humidity</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl">
                {weatherData.hourly.humidity[0]}%
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hourly Forecast (Next 24 hours)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea>
                <div className="flex overflow-x-auto gap-4 py-4">
                  {weatherData.hourly.time.slice(0, 24).map((time, index) => (
                    <div key={time} className="flex-shrink-0 w-20 text-center">
                      <div className="flex gap-2 flex-col">
                        <div className="font-bold">
                          {new Date(time).getHours()}:00
                        </div>
                        <div className="flex items-center justify-center">
                          {getWeatherIcon(
                            weatherData.hourly.temperature[index]
                          )}
                        </div>
                        <div>{weatherData.hourly.temperature[index]}°C</div>
                      </div>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7-Day Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
                {getDayForecast().map((day, index) => (
                  <div
                    key={index}
                    className="text-center md:space-y-2 flex items-center justify-around md:flex-col md:items-start md:justify-center"
                  >
                    <div className="font-bold">{day.day}</div>
                    <div className="flex justify-center items-center">
                      {getWeatherIcon(day.temp)}
                    </div>
                    <div>{day.temp}°C</div>
                    <div className="flex items-center justify-center text-sm">
                      <Droplets className="h-3 w-3 mr-1" />
                      {day.humidity}%
                    </div>
                    <div className="flex items-center justify-center text-sm">
                      <Wind className="h-3 w-3 mr-1" />
                      {day.windSpeed} km/h
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
