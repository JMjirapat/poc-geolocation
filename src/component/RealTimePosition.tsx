import { ChangeEvent, useEffect, useState } from "react";
import {
	euclideanDistance,
	haversineDistance,
} from "../untils/calculateDistance";
import { positionData } from "../types";
import toast, { Toaster } from "react-hot-toast";

const RealTimePosition = () => {
	const [coordinates, setCoordinates] = useState<{
		latitude: number | null;
		longitude: number | null;
	}>({
		latitude: null,
		longitude: null,
	});
	const [listPos, setListPos] = useState<positionData[]>([]);
	const [label, setLabel] = useState<string>("");
	const [comparison, setComparison] = useState({
		left: "",
		right: "",
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
				timeout: 1000, // Set a timeout for the geolocation request (in milliseconds)
			}
		);

		// Clean up the watchPosition when the component is unmounted
		return () => {
			navigator.geolocation.clearWatch(watchPosition);
		};
	}, []);

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

	const clearAllPosition = () => {
		setListPos([]);
		setLabel("");
		setComparison({
			left: "",
			right: "",
		});
	};

	function addPosition() {
		if (label.length < 1) {
			toast.error("กรุณาใส่ชื่อตำแหน่ง");
			return;
		}
		if (!(coordinates.latitude && coordinates.longitude)) {
			toast.error("ตำแหน่งไม่ถูกต้อง");
			return;
		}
		setListPos((prev) => [
			...prev,
			{
				latitude: coordinates.latitude ?? 0,
				longitude: coordinates.longitude ?? 0,
				pos: `${coordinates.latitude ?? 0},${coordinates.longitude ?? 0}`,
				label: label.trim(),
			},
		]);
		setLabel("");
	}

	return (
		<div className="max-w-xl mx-auto flex flex-col gap-4 py-12 p-2">
			<Toaster />
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
			<label className="block text-xs font-medium text-gray-700">
				ตำแหน่งปัจจุบัน (อัพเดตทุก 1 วินาที):
			</label>
			{coordinates.latitude && coordinates.longitude ? (
				<>
					<span>Latitude: {coordinates.latitude}</span>
					<span>Longitude: {coordinates.longitude}</span>
				</>
			) : (
				<span>Loading...</span>
			)}
			<div className="flex">
				<button
					onClick={addPosition}
					disabled={!(coordinates.latitude && coordinates.longitude)}
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
					<span className="flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-medium hover:bg-transparent h-full">
						เคลียร์
					</span>
				</button>
			</div>

			<div className="flex flex-col">
				{listPos.map((item, idx) => {
					return (
						<div
							key={idx}
							className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-white px-2 py-4"
						>
							<div className="flex items-center justify-center sm:gap-8">
								<div className="flex-1 min-w-[1rem]">
									<input
										id={`${idx}:left`}
										type="checkbox"
										onChange={handleCheckbox}
										checked={comparison.left === `${idx}`}
									/>
								</div>

								<p className="flex-10">
									{item.label} | {item.pos}
								</p>
								<div className="flex-1 min-w-[1rem]">
									<input
										id={`${idx}:right`}
										type="checkbox"
										onChange={handleCheckbox}
										checked={comparison.right === `${idx}`}
									/>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default RealTimePosition;
