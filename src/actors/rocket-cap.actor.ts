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
	model: THREE.Mesh
	body: CANNON.Body
	shape: CANNON.Shape

	constructor(side: TypeSide) {
		this.side = side
		this.body = new CANNON.Body({ mass: this.mass })
	}

	addModel(model: THREE.Mesh, body: CANNON.Body) {
		const { shape, size } = createShapeFromModel(model)
		body.addShape(
			shape,
			new CANNON.Vec3(
				model.position.x +
					(this.side === 'left' ? -(size.x / 2 + 0.1) : size.x / 2 + 0.1),
				model.position.y,
				model.position.z
			)
		)

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

		this.body.addShape(this.shape, new CANNON.Vec3(0, 0, 0))

		moveBodyToModel(
			this.body,
			rocketModel,
			this.model.position.x +
				(this.side === 'left'
					? -(this.size.x / 2 + 0.01)
					: this.size.x / 2 + 0.01),
			this.model.position.y,
			this.model.position.z
		)

		this.body.velocity = rocketBody.velocity.clone()

		rocketBody.removeShape(this.shape)
		rocketModel.remove(this.model)

		TWorld.add(this.model)
		CWorld.addBody(this.body)

		// Push booster from rocket in chosen direction when disconnecting
		const xImpulse = this.side === 'left' ? -10000 : 10000

		if (xImpulse) {
			pushBodyToSide(this.body, 2000, 10, xImpulse)
		}
	}

	animate() {
		if (!this.isConnected) {
			moveModelToBody(this.model, this.body)
			this.model.rotation.y = this.side === 'right' ? Math.PI / 2 : -Math.PI / 2
		}
	}
}
