import { useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
	const [isGeoLoading, setIsGeoLoading] = useState(false);
	const [position, setPosition] = useState(`กรุณากด "ยืนยันตำแหน่ง" ก่อน`);

	const {
		timestamp,
		isGeolocationAvailable,
		isGeolocationEnabled,
		getPosition,
	} = useGeolocated({
		positionOptions: {
			enableHighAccuracy: false,
		},
		userDecisionTimeout: 5000,
		suppressLocationOnMount: true,
		onError() {
			toast.error("เกิดข้อผิดพลาดในการระบุตำแหน่ง");
		},
		onSuccess({ coords }) {
			const position = `${coords.latitude},${coords.longitude}`;
			setPosition(position);
		},
	});

	useEffect(() => {
		setIsGeoLoading(false);
	}, [timestamp]);

	function confirmPosition() {
		setIsGeoLoading(true);
		getPosition();
	}

	if (!isGeolocationAvailable || !isGeolocationEnabled) {
		return (
			<div>
				<p>
					ไม่สามารถใช้การระบุตำแหน่งได้ กรุณาตรวจสอบว่าเบราว์เซอร์ของท่านรองรับ
					และให้สิทธิ์การเข้าถึงการระบุตำแหน่งแล้ว
				</p>
			</div>
		);
	}

	return (
		<>
			<Toaster />
			<p>{position}</p>
			<button onClick={confirmPosition} disabled={isGeoLoading}>
				ยืนยันตำแหน่ง
			</button>
		</>
	);
}

export default App;
