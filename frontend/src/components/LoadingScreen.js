import Image from "next/image";

function LoadingScreen() {
  return (
    <div
      className="d-flex justify-content-center align-items-center rounded w-100"
      style={{ backgroundColor: "white", height: "50vh" }}
    >
      <Image
        src={`/LoadingWeather.gif`}
        alt="loading.."
        width={50}
        height={50}
        className="me-2"
      />{" "}
      Loading....
    </div>
  );
}

export default LoadingScreen;
