import { useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";

type positionData = {
	label: string;
	pos: string;
	latitude: number;
	longitude: number;
	distance: number;
};

function euclideanDistance(
	x1: number,
	y1: number,
	x2: number,
	y2: number
): number {
	const dx = x2 - x1;
	const dy = y2 - y1;
	return Math.sqrt(dx * dx + dy * dy);
}

function App() {
	const [isGeoLoading, setIsGeoLoading] = useState<boolean>(false);
	const [position, setPosition] = useState<positionData | null>(null);
	const [listPos, setListPos] = useState<positionData[]>([]);
	const [enAddBtn, setEnAddBtn] = useState<boolean>(false);
	const [label, setLabel] = useState<string>("");

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
			setEnAddBtn(true);
			setPosition({
				label: "",
				pos: position,
				latitude: coords.latitude,
				longitude: coords.longitude,
				distance: 0,
			});
		},
	});

	useEffect(() => {
		setIsGeoLoading(false);
	}, [timestamp]);

	function confirmPosition() {
		setIsGeoLoading(true);
		getPosition();
	}

	function addPosition() {
		if (!position) return;
		setEnAddBtn(false);
		if (listPos.length <= 0) {
			setListPos((prev) => [
				...prev,
				{
					...position,
					label: "ตำแหน่งอ้างอิง",
				},
			]);
		} else {
			const srcPos = listPos.filter(
				(item) => item.label === "ตำแหน่งอ้างอิง"
			)[0];
			const distance = euclideanDistance(
				srcPos.latitude,
				srcPos.longitude,
				position.latitude,
				position.longitude
			);
			setListPos((prev) => [
				...prev,
				{
					...position,
					label: label.trim().length > 0 ? label : "ไม่ได้ระบุ",
					distance: distance,
				},
			]);
			setLabel("");
		}
		setPosition(null);
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

	const clearAllPosition = () => {
		setListPos([]);
		setLabel("");
		setEnAddBtn(false);
		setPosition(null);
	};

	return (
		<>
			<Toaster />
			{/* <Position /> */}
			<p>{position ? position.pos : `กรุณากด "ยืนยันตำแหน่ง" ก่อน`}</p>
			{listPos.length > 0 && (
				<div>
					<span>แท็ก:</span>
					<input
						onChange={(e) => setLabel(e.target.value)}
						value={label}
					></input>
				</div>
			)}
			<button onClick={confirmPosition} disabled={isGeoLoading} type="button">
				ยืนยันตำแหน่ง
			</button>
			<button onClick={addPosition} disabled={!enAddBtn} type="button">
				เพิ่มตำแหน่ง
			</button>
			<button
				onClick={clearAllPosition}
				disabled={listPos.length <= 0}
				type="button"
			>
				เคลียร์
			</button>
			<div>
				{listPos.map((item, idx) => {
					return (
						<div key={idx}>
							<span>
								{item.label} | {item.pos} | ระยะห่าง: {item.distance}
							</span>
						</div>
					);
				})}
			</div>
		</>
	);
}

export default App;
