import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import {
	createShapeFromModel,
	moveBodyToModel,
	moveModelToBody,
	pushBodyToSide,
} from '../utils'
import { Brake } from './brake.actor'

type TypePosition = 1 | 2 | 3

export class MainBooster {
	// Properties
	mass = 8000

	private position: TypePosition
	private fuelMax = 100000
	private power = 20000
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

	brake1 = new Brake(1)
	brake2 = new Brake(2)
	brake3 = new Brake(3)
	brake4 = new Brake(4)

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

	addModel(
		model: THREE.Mesh,
		body: CANNON.Body,
		brake: THREE.Mesh,
		brakeOnClip: THREE.AnimationClip,
		brakeOffClip: THREE.AnimationClip
	) {
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

		this.brake1.addModel(brake.clone(), model, brakeOnClip, brakeOffClip)
		this.brake2.addModel(brake.clone(), model, brakeOnClip, brakeOffClip)
		this.brake3.addModel(brake.clone(), model, brakeOnClip, brakeOffClip)
		this.brake4.addModel(brake.clone(), model, brakeOnClip, brakeOffClip)
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

	animate(delta: number) {
		this.brake1.animate(delta)
		this.brake2.animate(delta)
		this.brake3.animate(delta)
		this.brake4.animate(delta)

		const prevX = this.model.position.x
		const prevY = this.model.position.y
		const prevZ = this.model.position.z

		if (!this.isConnected) {
			moveModelToBody(this.model, this.body)
		}

		const currentX = this.model.position.x
		const currentY = this.model.position.y
		const currentZ = this.model.position.z

		return {
			xDiff: currentX - prevX,
			yDiff: currentY - prevY,
			zDiff: currentZ - prevZ,
		} // Difference for camera position.y
	}
}
