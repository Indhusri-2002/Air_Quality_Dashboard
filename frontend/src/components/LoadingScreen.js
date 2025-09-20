import Image from "next/image";

function LoadingScreen() {
  return (
    <div
      className="d-flex justify-content-center align-items-center rounded w-100"
      style={{ 
        backgroundColor: "rgba(255, 255, 255, 0.95)", 
        color: "#333", 
        height: "100%",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
      }}
    >
      <div className="d-flex flex-column align-items-center">
        <Image
          src={`/LoadingWeather.gif`}
          alt="loading.."
          width={60}
          height={60}
          className="mb-3"
        />
        <div style={{ fontSize: "18px", fontWeight: "500" }}>
          Loading weather data...
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
