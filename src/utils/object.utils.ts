export function areObjectValuesTrue(obj: any) {
	for (let o in obj) if (!obj[o]) return false

	return true
}
