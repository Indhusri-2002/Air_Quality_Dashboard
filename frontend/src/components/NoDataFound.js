import Image from "next/image";

function NoDataFound({message}) {
  return (
    <div
      className="d-flex justify-content-center align-items-center rounded w-100"
      style={{ backgroundColor: "white", height: "50vh" }}
    >
      <Image
        src={`/WeatherAlert.png`}
        alt="no data found"
        width={50}
        height={50}
        className="me-4"
      />{" "}
      {message}
    </div>
  );
}

export default NoDataFound;
