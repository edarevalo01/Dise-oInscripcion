import { StringResourceHelper } from "./string-resource-helper";

describe("StringResourceHelper", () => {
	it("should create an instance", () => {
		expect(new StringResourceHelper("")).toBeTruthy();
	});
});
