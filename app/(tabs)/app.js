import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Weather code → Emoji/Text Map
const weatherCodeMap = {
  0: "☀️ Clear sky",
  1: "🌤️ Mainly clear",
  2: "⛅ Partly cloudy",
  3: "☁️ Overcast",
  45: "🌫️ Fog",
  48: "🌫️ Rime fog",
  51: "🌦️ Drizzle",
  61: "🌧️ Rain",
  71: "🌨️ Snow",
  80: "🌧️ Showers",
  95: "⛈️ Thunderstorm",
};

// Helper → Format date like "Mon, 22 Sep"
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function App() {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      // Location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("❌ Location permission denied");
        setLoading(false);
        return;
      }

      try {
        // Current location
        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // API call
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&forecast_days=15&timezone=auto`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        // Arrange forecast data
        const dailyForecast = data.daily.time.map((date, index) => ({
          date: formatDate(date),
          max: data.daily.temperature_2m_max[index],
          min: data.daily.temperature_2m_min[index],
          rain: data.daily.precipitation_sum[index],
          code: data.daily.weathercode[index],
        }));

        setForecast(dailyForecast);
      } catch (error) {
        setErrorMsg("⚠️ Failed to fetch weather data");
      }
      setLoading(false);
    })();
  }, []);

  // Loading screen
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Fetching weather data...</Text>
      </View>
    );
  }

  // Error screen
  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  // Forecast list
  return (
    <View style={styles.container}>
      <Text style={styles.header}>📅 15-Day Weather Forecast</Text>
      <FlatList
        data={forecast}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.info}>
              🌡️ Max: <Text style={styles.bold}>{item.max}°C</Text>
            </Text>
            <Text style={styles.info}>
              🌡️ Min: <Text style={styles.bold}>{item.min}°C</Text>
            </Text>
            <Text style={styles.info}>
              🌧️ Rain: <Text style={styles.bold}>{item.rain} mm</Text>
            </Text>
            <Text style={styles.weather}>
              {weatherCodeMap[item.code] || `Code: ${item.code}`}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#5352a4",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 14,
    textAlign: "center",
    color: "#333",
  },
  card: {
    backgroundColor: "white",
    padding: 18,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  date: {
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 6,
    color: "#1a1a1a",
  },
  info: {
    fontSize: 15,
    color: "#444",
    marginBottom: 2,
  },
  weather: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  bold: {
    fontWeight: "bold",
    color: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    fontWeight: "bold",
  },
});
