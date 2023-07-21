import { ChangeEvent, useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
import toast, { Toaster } from "react-hot-toast";

type positionData = {
	label: string;
	pos: string;
	latitude: number;
	longitude: number;
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

function haversineDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
) {
	const earthRadius = 6371000; // Radius of the Earth in meters

	// Convert latitude and longitude from degrees to radians
	const dLat = (lat2 - lat1) * (Math.PI / 180);
	const dLon = (lon2 - lon1) * (Math.PI / 180);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * (Math.PI / 180)) *
			Math.cos(lat2 * (Math.PI / 180)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	const distance = earthRadius * c;
	return distance;
}

function App() {
	const [isGeoLoading, setIsGeoLoading] = useState<boolean>(false);
	const [position, setPosition] = useState<positionData | null>(null);
	const [listPos, setListPos] = useState<positionData[]>([]);
	const [enAddBtn, setEnAddBtn] = useState<boolean>(false);
	const [label, setLabel] = useState<string>("");
	const [comparison, setComparison] = useState({
		left: "",
		right: "",
	});

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
		if (label.length < 1) {
			toast.error("กรุณาใส่ชื่อตำแหน่ง");
			return;
		}
		setEnAddBtn(false);
		setListPos((prev) => [
			...prev,
			{
				...position,
				label: label.trim(),
			},
		]);
		setLabel("");
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

	const handleCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
		const [id, side] = e.target.id.split(":");
		if (side === "left") {
			if (comparison.left === id) {
				setComparison((prev) => ({ ...prev, left: "" }));
			} else {
				setComparison((prev) => ({ ...prev, left: id }));
			}
		} else {
			if (comparison.right === id) {
				setComparison((prev) => ({ ...prev, right: "" }));
			} else {
				setComparison((prev) => ({ ...prev, right: id }));
			}
		}
	};

	const distComparison = (leftPos: positionData, right: positionData) => {
		const euclidean = euclideanDistance(
			leftPos.latitude,
			leftPos.longitude,
			right.latitude,
			right.longitude
		);
		const haversine = haversineDistance(
			leftPos.latitude,
			leftPos.longitude,
			right.latitude,
			right.longitude
		);
		return { euclidean, haversine };
	};

	return (
		<div className="max-w-xl mx-auto flex flex-col gap-4 py-12 p-2">
			<Toaster />
			{/* <span>
				<RealTimePosition />
			</span> */}
			<div className="flex flex-col gap-2">
				<label className="block text-xs font-medium text-gray-700">
					เปรียบเทียบ
				</label>
				<span>{`${
					comparison.left === ""
						? "ยังไม่ได้กำหนด"
						: listPos[Number(comparison.left)].label
				} vs ${
					comparison.right === ""
						? "ยังไม่ได้กำหนด"
						: listPos[Number(comparison.right)].label
				}`}</span>
				<label className="block text-xs font-medium text-gray-700">
					ระยะห่าง (Euclidean distance)
				</label>
				<span>
					{comparison.left !== "" && comparison.right !== ""
						? distComparison(
								listPos[Number(comparison.left)],
								listPos[Number(comparison.right)]
						  ).euclidean
						: 0}
				</span>
				<label className="block text-xs font-medium text-gray-700">
					ระยะห่าง (Haversine Distance)
				</label>
				<span>
					{comparison.left !== "" && comparison.right !== ""
						? distComparison(
								listPos[Number(comparison.left)],
								listPos[Number(comparison.right)]
						  ).haversine
						: 0}{" "}
					m.
				</span>

				<div className="mt-2 w-full">
					<label className="block text-xs font-medium text-gray-700">
						ชื่อตำแหน่ง
					</label>

					<input
						value={label}
						onChange={(e) => setLabel(e.target.value)}
						type="text"
						placeholder="สถานที่"
						className="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-3"
					/>
				</div>
			</div>
			<span>
				{position ? `ตำแหน่ง: ${position.pos}` : `กรุณากด "ยืนยันตำแหน่ง" ก่อน`}
			</span>
			<div className="flex">
				<button
					onClick={confirmPosition}
					disabled={isGeoLoading}
					type="button"
					className="flex-1 inline-block rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px] hover:text-white focus:outline-none focus:ring active:text-opacity-75"
				>
					<span className="block rounded-full bg-white px-8 py-3 text-sm font-medium hover:bg-transparent">
						ยืนยันตำแหน่ง
					</span>
				</button>
				<button
					onClick={addPosition}
					disabled={!enAddBtn}
					type="button"
					className="flex-1 inline-block rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px] hover:text-white focus:outline-none focus:ring active:text-opacity-75"
				>
					<span className="block rounded-full bg-white px-8 py-3 text-sm font-medium hover:bg-transparent">
						เพิ่มตำแหน่ง
					</span>
				</button>
				<button
					onClick={clearAllPosition}
					disabled={listPos.length <= 0}
					type="button"
					className="flex-1 inline-block rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px] hover:text-white focus:outline-none focus:ring active:text-opacity-75"
				>
					<span className="block rounded-full bg-white px-8 py-3 text-sm font-medium hover:bg-transparent">
						เคลียร์
					</span>
				</button>
			</div>

			<div className="flex flex-col">
				{listPos.map((item, idx) => {
					return (
						<div
							key={idx}
							className="flex-1 flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6"
						>
							<div className="flex items-center justify-center sm:gap-8">
								<label>
									<input
										id={`${idx}:left`}
										type="checkbox"
										onChange={handleCheckbox}
										checked={comparison.left === `${idx}`}
									/>
								</label>
								{item.label} | {item.pos}
								<label>
									<input
										id={`${idx}:right`}
										type="checkbox"
										onChange={handleCheckbox}
										checked={comparison.right === `${idx}`}
									/>
								</label>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default App;
