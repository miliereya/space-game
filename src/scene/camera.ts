import * as THREE from 'three'
import { TypeCameraTarget } from '../types'

export class Camera extends THREE.PerspectiveCamera {
	target: TypeCameraTarget

	constructor(fov?: number, aspect?: number, near?: number, far?: number) {
		super(fov, aspect, near, far)

		// Default
		this.target = 'Rocket'
		this.position.z = 600
		this.position.y = 300
	}

	animate(
		xDiff: number,
		yDiff: number,
		zDiff: number,
		targetPosition: THREE.Vector3
	) {
		// const cameraYDiff = this.position.y + yDiff
		this.position.y += yDiff
		this.position.x += xDiff
		this.position.z += zDiff

		if (this.position.y < 10) this.position.y = 10
		this.lookAt(targetPosition)
	}

	follow(target: TypeCameraTarget, position: THREE.Vector3) {
		this.target = target
		this.position.set(position.x, position.y, position.z + 150)
		setTimeout(() => {
			this.target = target
			this.position.set(position.x, position.y, position.z + 150)
		}, 10)
	}
}
