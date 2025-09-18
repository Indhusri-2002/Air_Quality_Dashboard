// AQI Quality levels and their corresponding colors, descriptions, and recommendations
export const getAQILevel = (aqi) => {
  if (aqi <= 1) {
    return {
      level: "Good",
      color: "#00E400",
      bgColor: "#E8F5E8",
      description: "Air quality is considered satisfactory",
      recommendation: "Great day for outdoor activities! 🌟",
      icon: "😊"
    };
  } else if (aqi <= 2) {
    return {
      level: "Fair",
      color: "#F59E0B",
      bgColor: "#FEF3C7",
      description: "Air quality is acceptable for most people",
      recommendation: "Perfect for outdoor activities with minimal concern 🌤️",
      icon: "🙂"
    };
  } else if (aqi <= 3) {
    return {
      level: "Moderate",
      color: "#FF7E00",
      bgColor: "#FFF4E6",
      description: "Members of sensitive groups may experience minor issues",
      recommendation: "Generally safe, but sensitive individuals should limit prolonged outdoor exposure ⚠️",
      icon: "😐"
    };
  } else if (aqi <= 4) {
    return {
      level: "Poor",
      color: "#FF0000",
      bgColor: "#FFE6E6",
      description: "Everyone may begin to experience health effects",
      recommendation: "Consider reducing outdoor activities, especially for sensitive groups 🚨",
      icon: "😷"
    };
  } else {
    return {
      level: "Very Poor",
      color: "#8F3F97",
      bgColor: "#F3E6F7",
      description: "Health warnings of emergency conditions",
      recommendation: "Avoid outdoor activities and stay indoors with air purification 🏠",
      icon: "😨"
    };
  }
};

// Pollutant information with icons and units
export const pollutantInfo = {
  pm2_5: {
    name: "PM2.5",
    fullName: "Fine Particulate Matter",
    unit: "μg/m³",
    icon: "🔴",
    description: "Fine particles that can penetrate deep into lungs"
  },
  pm10: {
    name: "PM10",
    fullName: "Coarse Particulate Matter", 
    unit: "μg/m³",
    icon: "🟠",
    description: "Larger particles that can irritate airways"
  },
  co: {
    name: "CO",
    fullName: "Carbon Monoxide",
    unit: "μg/m³",
    icon: "⚫",
    description: "Colorless, odorless gas that reduces oxygen delivery"
  },
  no2: {
    name: "NO₂",
    fullName: "Nitrogen Dioxide",
    unit: "μg/m³", 
    icon: "🟤",
    description: "Reddish-brown gas that can irritate airways"
  },
  o3: {
    name: "O₃",
    fullName: "Ozone",
    unit: "μg/m³",
    icon: "🔵",
    description: "Ground-level ozone that can cause respiratory issues"
  },
  so2: {
    name: "SO₂",
    fullName: "Sulfur Dioxide",
    unit: "μg/m³",
    icon: "🟡",
    description: "Gas that can cause breathing difficulties"
  },
  nh3: {
    name: "NH₃",
    fullName: "Ammonia",
    unit: "μg/m³",
    icon: "🟢",
    description: "Pungent gas that can irritate eyes and respiratory system"
  },
  no: {
    name: "NO",
    fullName: "Nitric Oxide",
    unit: "μg/m³",
    icon: "🟣",
    description: "Colorless gas that contributes to smog formation"
  }
};

// Format timestamp to readable format
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
