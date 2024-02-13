import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import {
	createShapeFromModel,
	moveBodyToModel,
	moveModelToBody,
	pushBodyToSide,
} from '../utils'

type TypeSide = 'left' | 'right'

export class RocketCapHalf {
	// Properties
	mass = 300
	private side: TypeSide
	private size: {
		x: number
		y: number
		z: number
	}

	// Booleans
	isConnected = true

	// Modeling
	model: THREE.Mesh
	body: CANNON.Body
	shape: CANNON.Shape

	// Animation
	mixer: THREE.AnimationMixer
	animation: THREE.AnimationAction

	constructor(side: TypeSide) {
		this.side = side
		this.body = new CANNON.Body({ mass: this.mass })
	}

	addModel(model: THREE.Mesh, body: CANNON.Body, clip: THREE.AnimationClip) {
		const { shape, size } = createShapeFromModel(model)
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

		this.size = size
		this.shape = shape
		this.model = model
	}

	disconnect(
		rocketModel: THREE.Group,
		rocketBody: CANNON.Body,
		CWorld: CANNON.World,
		TWorld: THREE.Scene
	) {
		this.isConnected = false
		this.animation.play()
	}

	animate(delta: number) {
		if (!this.isConnected) {
			this.mixer.update(delta)
		}
	}
}
