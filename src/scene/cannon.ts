import * as CANNON from 'cannon-es'
import { calculateStepByPosition } from '../utils'

type TypeIndexBody = 4 | 5 | 6 | 7 

export class Cannon extends CANNON.World {
	private bodiesForce = {
		4: 0,
		5: 0,
		6: 0,
		7: 0,
	}

	constructor() {
		super()

		// Collision detection,
		// More iterations > Better collision detection > More memory usage
		;(this.solver as CANNON.GSSolver).iterations = 5
	}

	private calculateForces(yPos: number, index: TypeIndexBody) {
		if (yPos < 20000) {
			this.bodiesForce[index] = -90000.8
		} else if (yPos >= 20000 && yPos < 100000) {
			this.bodiesForce[index] = calculateStepByPosition(
				yPos,
				20000,
				100000,
				-50000,
				-90000.8
			)
		} else if (yPos >= 100000 && yPos < 200000) {
			this.bodiesForce[index] = calculateStepByPosition(
				yPos,
				100000,
				200000,
				-0.1,
				-50000
			)
		} else {
			this.bodiesForce[index] = 0
		}
	}

	animate(delta: number, frame: number) {
		this.step(delta)
		const bodies = this.bodies
		for (let i = 0; i < bodies.length; i++) {
			const body = bodies[i]
			const index = body.index

			if (!(index === 4 || index === 5 || index === 6 || index === 7)) continue

			const yPos = body.position.y

			if (frame % 600 === 0) this.calculateForces(yPos, index)

			body.applyForce(new CANNON.Vec3(0, this.bodiesForce[index], 0))
		}
	}
}
