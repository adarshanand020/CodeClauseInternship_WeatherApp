import axios from "axios";

export const fetchWeatherData = async (latitude: number, longitude: number) => {
  try {
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,rain&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`
    );
    return response;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const fetchLocationData = async (location: string) => {
  try {
    const response = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=10&language=en&format=json`
    );
    return response;
  } catch (error: any) {
    throw new Error(error);
  }
};
