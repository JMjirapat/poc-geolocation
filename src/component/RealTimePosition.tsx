import { useEffect, useState } from "react";

const RealTimePosition = () => {
	const [coordinates, setCoordinates] = useState<{
		latitude: number | null;
		longitude: number | null;
	}>({
		latitude: null,
		longitude: null,
	});

	useEffect(() => {
		// Function to get the real-time position
		const watchPosition = navigator.geolocation.watchPosition(
			(position) => {
				const latitude = position.coords.latitude;
				const longitude = position.coords.longitude;
				setCoordinates({ latitude, longitude });
			},
			(error) => {
				console.error("Error getting geolocation:", error);
			},
			{
				enableHighAccuracy: true, // Use high accuracy if available
				timeout: 5000, // Set a timeout for the geolocation request (in milliseconds)
			}
		);

		// Clean up the watchPosition when the component is unmounted
		return () => {
			navigator.geolocation.clearWatch(watchPosition);
		};
	}, []);

	return (
		<div>
			{coordinates.latitude && coordinates.longitude ? (
				<div>
					<h2>Real-Time Position:</h2>
					<p>Latitude: {coordinates.latitude}</p>
					<p>Longitude: {coordinates.longitude}</p>
				</div>
			) : (
				<p>Loading...</p>
			)}
		</div>
	);
};

export default RealTimePosition;
