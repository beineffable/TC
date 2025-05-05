import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { PerspectiveCamera } from '@react-three/drei';
import './index.css'; // Ensure styles are imported
import SunMoon from './components/SunMoon'; // Import the SunMoon component
import GradientBackground from './components/GradientBackground'; // Import the GradientBackground component
import Clouds from './components/Clouds'; // Import the Clouds component

// --- Types --- 
type WeatherType = 'clear' | 'few_clouds' | 'clouds' | 'rain' | 'thunderstorm' | 'snow' | 'fog';
type TimeOfDay = 'day' | 'night';

interface LocationState {
    lat: number | null;
    lon: number | null;
    error: string | null;
}

interface FogPropsState {
    color: THREE.Color;
    near: number;
    far: number;
}

interface WeatherData {
    weather: { id: number; main: string; description: string }[];
    sys: { sunrise: number; sunset: number };
}

// --- Configuration --- 
const DAY_SKY_COLOR = 0x9ed6fe;
const NIGHT_SKY_COLOR = 0x0a0a2a;
const RAIN_SKY_COLOR = 0x6c7a89;
const SNOW_FOG_SKY_COLOR = 0xaaaaaa;

// --- Props Interface (Read from URL Params) ---
interface WeatherWidgetProps {
    apiKey: string | null;
    latitude?: number | null;
    longitude?: number | null;
}

// --- Main App Component --- 
function App(): JSX.Element {
    // Read props from URL query parameters
    const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
    const props: WeatherWidgetProps = useMemo(() => ({
        apiKey: urlParams.get('apiKey'),
        latitude: urlParams.has('lat') ? parseFloat(urlParams.get('lat')!) : null,
        longitude: urlParams.has('lon') ? parseFloat(urlParams.get('lon')!) : null,
    }), [urlParams]);

    const { apiKey, latitude, longitude } = props;

    const [_weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [_location, setLocation] = useState<LocationState>({ lat: latitude ?? null, lon: longitude ?? null, error: null });
    const [weatherType, setWeatherType] = useState<WeatherType>('clear');
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
    const [skyColor, setSkyColor] = useState<THREE.Color>(new THREE.Color(DAY_SKY_COLOR));
    const [fogProps, setFogProps] = useState<FogPropsState>({ color: skyColor, near: 50, far: 150 });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // --- Weather & Location Fetching --- 
    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setFetchError(null);

        const fetchWeatherAndLocation = async () => {
            let currentLat: number | null = latitude ?? null;
            let currentLon: number | null = longitude ?? null;
            let locationError: string | null = null;

            if (currentLat === null || currentLon === null) {
                try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        if (!navigator.geolocation) {
                            reject(new Error("Geolocation not supported by browser"));
                            return;
                        }
                        // Request permission and get position
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: false,
                            timeout: 10000,
                            maximumAge: 600000,
                        });
                    });
                    currentLat = position.coords.latitude;
                    currentLon = position.coords.longitude;
                } catch (error: any) {
                    console.error(`Geolocation error: ${error.message}`);
                    locationError = `Geolocation error: ${error.message}. Using default weather.`;
                }
            }
            
            if (isMounted) {
                 setLocation({ lat: currentLat, lon: currentLon, error: locationError });
            }

            if (currentLat !== null && currentLon !== null) {
                try {
                    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${currentLat}&lon=${currentLon}&appid=${apiKey}&units=metric`;
                    console.log("Fetching weather from:", apiUrl);
                    const response = await fetch(apiUrl);
                    if (!response.ok) {
                        const errorData = await response.text();
                        throw new Error(`HTTP error! Status: ${response.status} - ${errorData}`);
                    }
                    const data: WeatherData = await response.json();
                    console.log("Weather data received:", data);
                    if (isMounted) {
                        setWeatherData(data);
                        determineWeatherAndTime(data);
                        setFetchError(null);
                    }
                } catch (error: any) {
                    console.error(`Weather fetch error: ${error.message}`);
                    if (isMounted) {
                        setFetchError(`Weather fetch error: ${error.message}. Using default weather.`);
                        setDefaultWeatherState();
                    }
                }
            } else {
                 if (isMounted) {
                    setFetchError(locationError);
                    setDefaultWeatherState();
                 }
            }
            
            if (isMounted) {
                setIsLoading(false);
            }
        };

        const setDefaultWeatherState = () => {
            console.log("Setting default weather state (Clear, Day)");
            setWeatherType('clear');
            setTimeOfDay('day');
            const defaultSky = new THREE.Color(DAY_SKY_COLOR);
            setSkyColor(defaultSky);
            setFogProps({ color: defaultSky, near: 50, far: 150 });
        }

        if (apiKey) {
            fetchWeatherAndLocation();
        } else {
            console.error("OpenWeatherMap API Key not provided in URL parameters.");
            setDefaultWeatherState();
            setIsLoading(false);
            setFetchError("API Key missing in URL.")
        }

        return () => {
            isMounted = false;
        };

    }, [apiKey, latitude, longitude]);

    // --- Weather Logic --- 
    const determineWeatherAndTime = (data: WeatherData) => {
        const weatherId = data.weather[0].id;
        const currentTime = Date.now() / 1000;
        const sunrise = data.sys.sunrise;
        const sunset = data.sys.sunset;

        const calculatedTimeOfDay: TimeOfDay = (currentTime > sunrise && currentTime < sunset) ? 'day' : 'night';
        
        let calculatedWeatherType: WeatherType = 'clear';
        if (weatherId >= 200 && weatherId < 300) calculatedWeatherType = 'thunderstorm';
        else if (weatherId >= 300 && weatherId < 600) calculatedWeatherType = 'rain';
        else if (weatherId >= 600 && weatherId < 700) calculatedWeatherType = 'snow';
        else if (weatherId >= 700 && weatherId < 800) calculatedWeatherType = 'fog';
        else if (weatherId === 800) calculatedWeatherType = 'clear';
        else if (weatherId === 801) calculatedWeatherType = 'few_clouds';
        else if (weatherId > 801) calculatedWeatherType = 'clouds';

        console.log(`Determined Weather: ${calculatedWeatherType} (ID: ${weatherId}), Time: ${calculatedTimeOfDay}`);

        let newSkyHex = DAY_SKY_COLOR;
        if (calculatedTimeOfDay === 'night') newSkyHex = NIGHT_SKY_COLOR;
        else if (calculatedWeatherType === 'rain' || calculatedWeatherType === 'thunderstorm') newSkyHex = RAIN_SKY_COLOR;
        else if (calculatedWeatherType === 'snow' || calculatedWeatherType === 'fog') newSkyHex = SNOW_FOG_SKY_COLOR;
        
        const newSkyColor = new THREE.Color(newSkyHex);
        setSkyColor(newSkyColor);

        let fogNear = 50;
        let fogFar = 150;
        if (calculatedWeatherType === 'fog') { fogNear = 1; fogFar = 40; }
        else if (calculatedWeatherType === 'rain' || calculatedWeatherType === 'thunderstorm') { fogNear = 20; fogFar = 100; }
        else if (calculatedWeatherType === 'snow') { fogNear = 10; fogFar = 80; }
        setFogProps({ color: newSkyColor, near: fogNear, far: fogFar });

        if (calculatedWeatherType !== weatherType) setWeatherType(calculatedWeatherType);
        if (calculatedTimeOfDay !== timeOfDay) setTimeOfDay(calculatedTimeOfDay);
    };

    // --- Render --- 
    const containerStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111122', // Default background
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        fontFamily: 'sans-serif',
    };

    if (isLoading) {
        return <div style={containerStyle}>Loading weather...</div>;
    }
    
    if (fetchError) {
         return <div style={{...containerStyle, color: fetchError === "API Key missing in URL." ? 'white' : 'orange'}}>{fetchError}</div>;
    }

    return (
        <Canvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            {/* Set the background color */}
            <color attach="background" args={[skyColor.getHex()]} />
            
            {/* Setup camera */}
            <PerspectiveCamera makeDefault fov={60} near={0.1} far={1000} position={[0, 5, 1]} />
            
            {/* Add fog effect */}
            <fog attach="fog" args={[fogProps.color.getHex(), fogProps.near, fogProps.far]} />

            {/* Add lighting */}
            <ambientLight intensity={timeOfDay === 'day' ? 0.6 : 0.2} />
            <directionalLight 
                position={timeOfDay === 'day' ? [50, 50, 50] : [-50, 50, 20]}
                intensity={timeOfDay === 'day' ? 1.0 : 0.3}
                color={timeOfDay === 'day' ? 0xffffff : 0xc9dee7}
            />
            
            {/* Add the gradient background for seamless scrolling */}
            <GradientBackground topColor={skyColor} />
            
            {/* Add the SunMoon component */}
            <SunMoon timeOfDay={timeOfDay} weatherType={weatherType} />
            
            {/* Add the Clouds component - present in all weather conditions */}
            <Clouds timeOfDay={timeOfDay} weatherType={weatherType} />
            
            {/* Placeholder for future components */}
        </Canvas>
    );
}

export default App;
