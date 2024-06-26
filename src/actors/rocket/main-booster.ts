import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import {
	createShapeFromModel,
	moveBodyToModel,
	moveModelToBody,
	pushBodyToSide,
} from '../../utils'
import { Brake } from './brake'
import { SideStep } from './side-step.actor'
import { Flame } from '../effects'

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
	private isCalibrationStarted = false
	private isReadyForLanding = false
	private isLanding = false
	isActive = false

	// Models
	model: THREE.Mesh
	body: CANNON.Body
	shape: CANNON.Shape

	brake1 = new Brake(1)
	brake2 = new Brake(2)
	brake3 = new Brake(3)
	brake4 = new Brake(4)

	sideStep1 = new SideStep(1)
	sideStep2 = new SideStep(2)
	sideStep3 = new SideStep(3)
	sideStep4 = new SideStep(4)

	// Effects
	flame: Flame

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

			if (this.isConnected) this.flame.on()
		}
	}

	off() {
		this.isActive = false
		this.flame.off()
	}

	addModel(
		model: THREE.Mesh,
		body: CANNON.Body,
		brake: THREE.Mesh,
		brakeOnClip: THREE.AnimationClip,
		brakeOffClip: THREE.AnimationClip,
		sideStep: THREE.Mesh,
		sideStepOn: THREE.AnimationClip
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

		this.sideStep1.addModel(sideStep.clone(), model, sideStepOn)
		this.sideStep2.addModel(sideStep.clone(), model, sideStepOn)
		this.sideStep3.addModel(sideStep.clone(), model, sideStepOn)
		this.sideStep4.addModel(sideStep.clone(), model, sideStepOn)

		this.flame = new Flame(this.model)
	}

	disconnect(
		rocketModel: THREE.Group,
		rocketBody: CANNON.Body,
		CWorld: CANNON.World,
		TWorld: THREE.Scene
	) {
		this.isConnected = false
		this.flame.off()

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
			pushBodyToSide(this.body, 4000, 6, xImpulse)
		}
	}

	calibrateForLanding() {
		this.body.velocity.x = 0
		this.body.velocity.z = 0
		this.isCalibrationStarted = true
	}

	animate(delta: number) {
		this.flame.animate(delta)

		this.brake1.animate(delta)
		this.brake2.animate(delta)
		this.brake3.animate(delta)
		this.brake4.animate(delta)

		this.sideStep1.animate(delta)
		this.sideStep2.animate(delta)
		this.sideStep3.animate(delta)
		this.sideStep4.animate(delta)

		if (this.isReadyForLanding && this.body.position.y < 1000) {
			this.isReadyForLanding = false
			this.isLanding = true

			setTimeout(() => {
				this.flame.on()
			}, 4000)

			this.body.velocity.y = -200
			this.brake1.on()
			this.brake2.on()
			this.brake3.on()
			this.brake4.on()

			this.sideStep1.on()
			this.sideStep2.on()
			this.sideStep3.on()
			this.sideStep4.on()
		}

		if (this.isLanding) {
			if (this.body.velocity.y > 0) {
				this.body.velocity.y -= 0.6
			} else {
				this.body.velocity.y += 0.6
			}

			if (this.body.position.y < 15) {
				this.flame.off()
				setTimeout(() => {
					this.brake1.off()
					this.brake2.off()
					this.brake3.off()
					this.brake4.off()
				}, 1000)
			}
		}

		const prevX = this.model.position.x
		const prevY = this.model.position.y
		const prevZ = this.model.position.z
		// if (this.position === 1) console.log(this.body.velocity)

		if (!this.isConnected) {
			moveModelToBody(this.model, this.body)
			if (this.isCalibrationStarted) {
				this.calibrate()
			}
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

	private calibrate() {
		const mainBoosterBtn = document.getElementById(
			'Booster' + this.position + 'Calibration'
		) as HTMLButtonElement
		if (mainBoosterBtn) mainBoosterBtn.disabled = true

		const destination =
			this.position === 1 ? -200 : this.position === 3 ? 200 : 0
		const roundedX = Math.round(this.body.position.x)
		if (roundedX > destination) {
			this.brake1.on()
			this.brake2.on()
			this.body.position.x -= 0.25
		} else if (roundedX < destination) {
			this.brake3.on()
			this.brake4.on()
			this.body.position.x += 0.25
		} else {
			this.brake1.off()
			this.brake2.off()
			this.brake3.off()
			this.brake4.off()

			this.body.position.x = destination
			this.isCalibrationStarted = false

			this.isReadyForLanding = true
			if (this.position === 2) {
				this.brake1.on()
				this.brake3.on()

				const interval = setInterval(() => {
					const roundedZ = Math.round(this.body.position.z)
					if (roundedZ !== 200) {
						this.body.position.z += 0.75
					} else {
						this.brake1.off()
						this.brake3.off()
						clearInterval(interval)
					}
				}, 30)
			}
		}
	}
}
