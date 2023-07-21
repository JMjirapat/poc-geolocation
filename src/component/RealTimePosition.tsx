import { ChangeEvent, useCallback, useEffect, useState } from "react";
import {
	euclideanDistance,
	haversineDistance,
} from "../untils/calculateDistance";
import { positionData } from "../types";
import toast, { Toaster } from "react-hot-toast";
import { IconPhotoPlus, IconGps } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import exifr from "exifr";

const RealTimePosition = () => {
	const [gpsCoord, setGpsCoord] = useState<{
		latitude: number | null;
		longitude: number | null;
	}>({
		latitude: null,
		longitude: null,
	});
	const [file, setFile] = useState<File | null>(null);
	const [imgCoord, setImgCoord] = useState<{
		latitude: number | "ไม่พบตำแหน่ง";
		longitude: number | "ไม่พบตำแหน่ง";
	}>({
		latitude: "ไม่พบตำแหน่ง",
		longitude: "ไม่พบตำแหน่ง",
	});
	const [listPos, setListPos] = useState<positionData[]>([]);
	const [label, setLabel] = useState<string>("");
	const [comparison, setComparison] = useState({
		left: "",
		right: "",
	});
	const [addType, setAddType] = useState<"gps" | "img">("gps");

	useEffect(() => {
		const watchPosition = navigator.geolocation.watchPosition(
			(position) => {
				const latitude = Number(position.coords.latitude.toFixed(7));
				const longitude = Number(position.coords.longitude.toFixed(7));
				setGpsCoord({ latitude, longitude });
			},
			(error) => {
				console.error("Error getting geolocation:", error);
			},
			{
				enableHighAccuracy: true, // Use high accuracy if available
				timeout: 1000, // Set a timeout for the geolocation request (in milliseconds)
			}
		);
		return () => {
			navigator.geolocation.clearWatch(watchPosition);
		};
	}, []);

	const onDrop = useCallback((acceptedFiles: File[]) => {
		if (acceptedFiles.length === 0) return;
		const file = acceptedFiles[0];
		setFile(file);
		exifr
			.gps(file)
			.then((data) => {
				toast.success(JSON.stringify(data));
				// setImgCoord({
				// 	latitude: Number(latitude.toFixed(7)) ?? 0,
				// 	longitude: Number(longitude.toFixed(7)) ?? 0,
				// });
			})
			.catch((err: string) => {
				toast.error(`${err}`);

				setImgCoord({
					latitude: "ไม่พบตำแหน่ง",
					longitude: "ไม่พบตำแหน่ง",
				});
			});
	}, []);

	const { getRootProps, getInputProps } = useDropzone({
		accept: {
			"image/*": [".jpeg", ".png"],
		},
		onDrop: onDrop,
		maxFiles: 1,
		multiple: false,
		onError(err) {
			console.log(err);
		},
	});

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
		setFile(null);
		setImgCoord({ latitude: "ไม่พบตำแหน่ง", longitude: "ไม่พบตำแหน่ง" });
	};

	function addPosition() {
		if (addType === "gps") {
			if (label.length < 1) {
				toast.error("กรุณาใส่ชื่อตำแหน่ง");
				return;
			}
			if (!(gpsCoord.latitude && gpsCoord.longitude)) {
				toast.error("ตำแหน่งไม่ถูกต้อง");
				return;
			}
			setListPos((prev) => [
				...prev,
				{
					type: addType,
					latitude: gpsCoord.latitude ?? 0,
					longitude: gpsCoord.longitude ?? 0,
					data: label.trim(),
				},
			]);
			setLabel("");
		}
		if (addType === "img") {
			if (!file) {
				toast.error("กรุณาเพิ่มรูปภาพ");
				return;
			}
			if (
				imgCoord.latitude === "ไม่พบตำแหน่ง" ||
				imgCoord.longitude === "ไม่พบตำแหน่ง"
			) {
				toast.error("รูปนี้ไม่พบตำแหน่ง, ไม่สามารถใช้งานได้");
				return;
			}
			setListPos((prev) => [
				...prev,
				{
					type: addType,
					latitude:
						typeof imgCoord.latitude === "number" ? imgCoord.latitude : 0,
					longitude:
						typeof imgCoord.latitude === "number" ? imgCoord.latitude : 0,
					data: file,
				},
			]);
			setFile(null);
			setImgCoord({ latitude: "ไม่พบตำแหน่ง", longitude: "ไม่พบตำแหน่ง" });
		}
	}

	return (
		<div className="max-w-xl mx-auto flex flex-col gap-4 py-12 p-2">
			<Toaster />
			<div className="flex flex-col gap-2">
				<label className="block text-xs font-medium text-gray-700">
					เปรียบเทียบ
				</label>
				{/* <span>{`${
					comparison.left === ""
						? "ยังไม่ได้กำหนด"
						: listPos[Number(comparison.left)].label
				} vs ${
					comparison.right === ""
						? "ยังไม่ได้กำหนด"
						: listPos[Number(comparison.right)].label
				}`}</span> */}
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
					เมตร
				</span>
				<ul className="flex border-b border-gray-100">
					<li className="flex-1">
						<div
							className="relative block p-4"
							onClick={() => setAddType("gps")}
						>
							{addType === "gps" && (
								<span className="absolute inset-x-0 -bottom-px h-px w-full bg-pink-600"></span>
							)}

							<div className="flex items-center justify-center gap-4">
								<IconGps />

								<span className="text-sm font-medium text-gray-900">
									{" "}
									ตำแหน่ง{" "}
								</span>
							</div>
						</div>
					</li>

					<li className="flex-1">
						<div
							className="relative block p-4"
							onClick={() => setAddType("img")}
						>
							{addType === "img" && (
								<span className="absolute inset-x-0 -bottom-px h-px w-full bg-pink-600"></span>
							)}

							<div className="flex items-center justify-center gap-4">
								<IconPhotoPlus />

								<span className="text-sm font-medium text-gray-900">
									{" "}
									รูปภาพ{" "}
								</span>
							</div>
						</div>
					</li>
				</ul>
				{addType === "gps" && (
					<div className="mt-2 w-full flex flex-col gap-2">
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
						<label className="block text-xs font-medium text-gray-700">
							ตำแหน่งปัจจุบัน (อัพเดตทุก 1 วินาที):
						</label>
						{gpsCoord.latitude && gpsCoord.longitude ? (
							<>
								<span>ละติจูด: {gpsCoord.latitude}</span>
								<span>ลองจิจูด: {gpsCoord.longitude}</span>
							</>
						) : (
							<span>Loading...</span>
						)}
					</div>
				)}
				{addType === "img" && (
					<div className="mt-2 w-full flex flex-col gap-2">
						<label className="block text-xs font-medium text-gray-700">
							รูปภาพ
						</label>
						<div className="flex flex-col items-center">
							<div
								{...getRootProps({
									className:
										"w-40 h-40 border flex items-center justify-center overflow-hidden",
								})}
							>
								<input {...getInputProps()} />
								{file ? (
									<img
										src={URL.createObjectURL(file)}
										className="w-full h-full object-contain"
									/>
								) : (
									<p>เพิ่มรูปภาพตรงนี้</p>
								)}
							</div>
						</div>

						<label className="block text-xs font-medium text-gray-700">
							ตำแหน่งรูปภาพ:
						</label>
						{file ? (
							<>
								<span>ละติจูด: {imgCoord.latitude}</span>
								<span>ลองจิจูด: {imgCoord.longitude}</span>
							</>
						) : (
							<span>กรุณาเพิ่มรูปภาพก่อน</span>
						)}
					</div>
				)}
			</div>
			<div className="flex">
				{addType === "gps" && (
					<button
						onClick={addPosition}
						disabled={!(gpsCoord.latitude && gpsCoord.longitude)}
						type="button"
						className="flex-1 inline-block rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px] hover:text-white focus:outline-none focus:ring active:text-opacity-75"
					>
						<span className="block rounded-full bg-white px-8 py-3 text-sm font-medium hover:bg-transparent">
							เพิ่มตำแหน่ง
						</span>
					</button>
				)}
				{addType === "img" && (
					<button
						onClick={addPosition}
						disabled={!file}
						type="button"
						className="flex-1 inline-block rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px] hover:text-white focus:outline-none focus:ring active:text-opacity-75"
					>
						<span className="block rounded-full bg-white px-8 py-3 text-sm font-medium hover:bg-transparent">
							เพิ่มรูปภาพ
						</span>
					</button>
				)}
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

			<div className="flex flex-col gap-1">
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

								<div className="flex-[15]">
									{item.type === "gps" && typeof item.data === "string" && (
										<div className="h-20 flex items-center gap-4 justify-between">
											<p>{item.data}</p>
											<p>{`${item.latitude},${item.longitude}`}</p>
										</div>
									)}
									{item.type === "img" &&
										item.data &&
										typeof item.data === "object" && (
											<div className="h-20 flex items-center gap-4 justify-between">
												<img
													src={URL.createObjectURL(item.data)}
													className="w-full h-full object-contain"
												/>
												<p>{`${item.latitude},${item.longitude}`}</p>
											</div>
										)}
								</div>
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
