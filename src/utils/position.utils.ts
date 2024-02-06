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
	val: number,
	yMin: number,
	yMax: number,
	valMin: number,
	valMax: number
) {
	return valMax - (valMax - valMin) * ((val - yMin) / (yMax - yMin))
}
