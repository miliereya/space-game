import * as CANNON from 'cannon-es'
import * as THREE from 'three'

export function moveModelToBody(
	model: THREE.Mesh,
	body: CANNON.Body,
	xDiff = 0,
	yDiff = 0,
	zDiff = 0
) {
	model.position.set(
		body.position.x + xDiff,
		body.position.y + yDiff,
		body.position.z + zDiff
	)

	model.quaternion.set(
		body.quaternion.x,
		body.quaternion.y,
		body.quaternion.z,
		body.quaternion.w
	)
}

export function moveBodyToModel(
	body: CANNON.Body,
	model: THREE.Mesh,
	xDiff = 0,
	yDiff = 0,
	zDiff = 0
) {
	body.position.set(
		model.position.x + xDiff,
		model.position.y + yDiff,
		model.position.z + zDiff
	)

	body.quaternion.set(
		model.quaternion.x,
		model.quaternion.y,
		model.quaternion.z,
		model.quaternion.w
	)
}

export function calculateStepByPosition(
	val: number, // 3420
	yMin: number, // 3000
	yMax: number, // 4000
	valMin: number, // 0.20
	valMax: number // 0.30
) {
	const yRange = yMax - yMin // 1000
	const valRange = valMax - valMin // 0.10

	const valDiff = val - yMin // 420
	const percentage = valDiff / yRange // 0.42

	return valMax - valRange * percentage
}
