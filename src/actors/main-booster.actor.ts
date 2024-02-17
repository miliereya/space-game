import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import {
	createShapeFromModel,
	moveBodyToModel,
	moveModelToBody,
	pushBodyToSide,
} from '../utils'

type TypePosition = 1 | 2 | 3

export class MainBooster {
	// Properties
	mass = 8000

	private position: TypePosition
	private fuelMax = 100000
	private power = 2000
	private fuel: number
	private size: {
		x: number
		y: number
		z: number
	}

	// Booleans
	private isConnected = true
	isActive = false

	model: THREE.Mesh
	body: CANNON.Body
	shape: CANNON.Shape

	constructor(position: TypePosition) {
		this.fuel = this.fuelMax
		this.position = position
		this.body = new CANNON.Body({ mass: this.mass })
	}

	// Burn by frame
	burn(): number {
		if (this.fuel) {
			this.fuel -= 1
			return this.power
		} else {
			this.isActive = false
			return 0
		}
	}

	on() {
		if (this.fuel) {
			this.isActive = true
		}
	}

	off() {
		this.isActive = false
	}

	addModel(model: THREE.Mesh, body: CANNON.Body) {
		model.castShadow = true

		const { shape, size } = createShapeFromModel(model)
		const offset = new CANNON.Vec3(
			model.position.x,
			model.position.y + size.y / 2,
			model.position.z
		)
		body.addShape(shape, offset)

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

		this.body.addShape(this.shape, new CANNON.Vec3(0, this.size.y / 2, 0))

		moveBodyToModel(this.body, rocketModel, ...this.model.position)
		this.body.velocity = rocketBody.velocity.clone()

		rocketBody.mass -= this.mass
		rocketBody.removeShape(this.shape)
		rocketModel.remove(this.model)

		TWorld.add(this.model)
		CWorld.addBody(this.body)

		// Push booster from rocket in chosen direction when disconnecting
		const xImpulse =
			this.position === 1 ? -150000 : this.position === 3 ? 150000 : null

		if (xImpulse) {
			pushBodyToSide(this.body, 4000, 10, xImpulse)
		}
	}

	animate() {
		if (!this.isConnected) {
			moveModelToBody(this.model, this.body)
		}
	}
}
