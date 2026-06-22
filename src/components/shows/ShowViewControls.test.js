import { describe, expect, test } from "bun:test";
import { getControlButtonLabel } from "./ShowViewControls";

describe("getControlButtonLabel", () => {
	test("matches the floating control state", () => {
		expect(getControlButtonLabel(false)).toBe("Open view controls");
		expect(getControlButtonLabel(true)).toBe("Close view controls");
	});
});
