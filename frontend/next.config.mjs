import dotenv from 'dotenv';
import path from 'path';

const env = process.env.APP_ENV || 'dev';
const envFilePath = path.resolve(process.cwd(), `./config/${env}.env`);

dotenv.config({ path : envFilePath});

/*
NEXT_PUBLIC_ Prefix: Environment variables prefixed with NEXT_PUBLIC_ are available 
on both the server side and the client side. 

By default variables are exposed only to server side. For NEXT_PUBLIC_ prefix, variables
are loaded into the browser as well without explicit loading.
*/

/** @type {import('next').NextConfig} */
const nextConfig = {
    // load environment variables
    env: {
        BACKEND_API_URL: process.env.BACKEND_API_URL,
        CITIES: process.env.CITIES,
        WEATHER_CONDITIONS: process.env.WEATHER_CONDITIONS,
    }
};

console.log(`Environment Variable - BACKEND_API_URL: ${process.env.BACKEND_API_URL}`);
console.log(`Environment Variable - CITIES: ${process.env.CITIES}`);
console.log(`Environment Variable - WEATHER_CONDITIONS: ${process.env.WEATHER_CONDITIONS}`);



export default nextConfig;
