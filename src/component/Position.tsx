import { useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
import toast from "react-hot-toast";

function Position() {
	const [isGeoLoading, setIsGeoLoading] = useState<boolean>(false);
	const { coords, getPosition } = useGeolocated({
		positionOptions: {
			enableHighAccuracy: true,
		},
		userDecisionTimeout: 5000,
		watchLocationPermissionChange: true,
		onError() {
			toast.error("เกิดข้อผิดพลาดในการระบุตำแหน่ง");
		},
		onSuccess() {
			setIsGeoLoading(false);
		},
	});

	useEffect(() => {
		return;
	}, [isGeoLoading]);

	if (!coords) return;
	return (
		<div>
			<div>
				You are at <span>{coords.latitude}</span>,{" "}
				<span>{coords.longitude}</span>.
			</div>
			<button
				onClick={() => {
					getPosition();
					setIsGeoLoading(true);
				}}
				disabled={isGeoLoading}
				type="button"
			>
				Get location
			</button>
		</div>
	);
}

export default Position;
