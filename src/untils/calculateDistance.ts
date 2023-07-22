export function euclideanDistance(
	x1: number,
	y1: number,
	x2: number,
	y2: number
): number {
	const dx = x2 - x1;
	const dy = y2 - y1;
	return Math.sqrt(dx * dx + dy * dy);
}

export function haversineDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
) {
	lon1 = (lon1 * Math.PI) / 180;
	lon2 = (lon2 * Math.PI) / 180;
	lat1 = (lat1 * Math.PI) / 180;
	lat2 = (lat2 * Math.PI) / 180;

	const dlon = lon2 - lon1;
	const dlat = lat2 - lat1;
	const a =
		Math.pow(Math.sin(dlat / 2), 2) +
		Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

	const c = 2 * Math.asin(Math.sqrt(a));

	// Radius of earth in kilometers. Use 3956
	// for miles
	const r = 6371;
	return c * r * 1000;
}
