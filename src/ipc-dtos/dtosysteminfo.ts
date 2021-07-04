// this is literally just a wrapper for a json table
// why is this part of the boilerplate
export class DtoSystemInfo {
	Arch = "";
	Hostname = "";
	Platform = "";
	Release = "";
	WindowSize = "";

	public static deserialize(jsonString: string): DtoSystemInfo {
		const dto: DtoSystemInfo = JSON.parse(jsonString);
		return dto;
	}

	public serialize(): string {
		return JSON.stringify(this);
	}
}
