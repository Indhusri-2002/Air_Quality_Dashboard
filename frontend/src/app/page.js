"use client"
import LoadingScreen from "@/components/LoadingScreen";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <main>
      <div className="d-flex justify-content-center align-items-center w-100" style={{height:'100vh'}}>
          <LoadingScreen/>
      </div>
      {router.replace("/home")}
    </main>
  );
}
