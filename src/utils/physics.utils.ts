import * as CANNON from 'cannon-es'

export function pushBodyToSide(
	body: CANNON.Body,
	time: number,
	iterations: number,
	impulse: number
) {
	const timeIteration = time / iterations

	let ms = 0

	for (let i = 0; i < iterations; i++) {
		setTimeout(() => {
			body.applyLocalImpulse(new CANNON.Vec3(impulse / iterations, 0, 0))
		}, ms)
		ms += timeIteration
	}
}
