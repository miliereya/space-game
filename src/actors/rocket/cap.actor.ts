import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { createShapeFromModel } from '../../utils'

type TypeSide = 'left' | 'right'

export class RocketCapHalf {
	// Properties
	mass = 300
	private side: TypeSide

	// Booleans
	isConnected = true

	// Animation
	mixer: THREE.AnimationMixer
	animation: THREE.AnimationAction

	constructor(side: TypeSide) {
		this.side = side
	}

	addModel(model: THREE.Mesh, body: CANNON.Body, clip: THREE.AnimationClip) {
		model.castShadow = true

		const { shape } = createShapeFromModel(model)
		const offset = new CANNON.Vec3(
			model.position.x + (this.side === 'left' ? -2 : 2),
			model.position.y,
			model.position.z
		)

		body.addShape(shape, offset)

		this.mixer = new THREE.AnimationMixer(model)
		this.animation = this.mixer.clipAction(clip)
		this.animation.setLoop(THREE.LoopOnce, 1)
		this.animation.clampWhenFinished = true
	}

	disconnect(rocketBody: CANNON.Body) {
		this.isConnected = false
		rocketBody.mass -= this.mass
		this.animation.play()
	}

	animate(delta: number) {
		if (!this.isConnected) {
			this.mixer.update(delta)
		}
	}
}
