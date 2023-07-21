export type positionData = {
	type: "gps" | "img";
	data: string | File | null;
	latitude: number;
	longitude: number;
};
