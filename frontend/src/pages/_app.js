"use client" 

import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import "@fortawesome/free-solid-svg-icons";
import "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    import("bootstrap");
  }, []);
  return (
    <Layout>
      <title>Weather</title>
      <Component {...pageProps} />
    </Layout>
  );
}
export default MyApp;