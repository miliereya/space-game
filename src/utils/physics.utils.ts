import { Vector3 } from 'three'
import { gravityValue } from '../config'

export const applyGravity = (
	position: Vector3,
	currentAcceleration: number,
) => {
    currentAcceleration - gravityValue
	position.y += currentAcceleration / 200
}
