import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import {
	createShapeFromModel,
	moveBodyToModel,
	moveModelToBody,
} from '../utils'

export class MiniBooster {
	// Properties
	mass = 4000

	private fuelMax = 10000
	private power = 3000
	private fuel: number

	// Booleans
	isActive = false

	model: THREE.Mesh
	body: CANNON.Body
	shape: CANNON.Shape

	constructor() {
		this.fuel = this.fuelMax
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
		const { shape, size } = createShapeFromModel(model, 0.5)
		const offset = new CANNON.Vec3(
			model.position.x,
			model.position.y + size.y / 2,
			model.position.z
		)

		body.addShape(shape, offset)

		this.shape = shape
		this.model = model
	}
}
