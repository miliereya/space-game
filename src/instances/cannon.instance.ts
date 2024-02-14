import * as CANNON from 'cannon-es'
import { calculateStepByPosition } from '../utils'

type TypeIndexBody = 1 | 2 | 3 | 4

export class Cannon {
	world: CANNON.World // Physical World
	private bodiesForce = {
		1: 0,
		2: 0,
		3: 0,
		4: 0,
	}

	constructor() {
		this.world = new CANNON.World()

		// Collision detection,
		// More iterations > Better collision detection > More memory usage
		;(this.world.solver as CANNON.GSSolver).iterations = 5
	}

	private calculateForces(yPos: number, index: TypeIndexBody) {
		if (yPos < 100000) {
			this.bodiesForce[index] = -90000.8
		} else if (yPos >= 200000 && yPos < 300000) {
			this.bodiesForce[index] = calculateStepByPosition(
				yPos,
				200000,
				300000,
				-50000,
				-90000.8
			)
		} else if (yPos >= 300000 && yPos < 400000) {
			this.bodiesForce[index] = calculateStepByPosition(
				yPos,
				300000,
				400000,
				-0.1,
				-50000
			)
		} else {
			this.bodiesForce[index] = 0
		}
	}

	animate(delta: number, frame: number) {
		this.world.step(delta)
		const bodies = this.world.bodies
		for (let i = 0; i < bodies.length; i++) {
			const body = bodies[i]
			const index = body.index
			if (!(index === 1 || index === 2 || index === 3 || index === 4)) continue

			const yPos = body.position.y

			if (frame % 100 === 0) this.calculateForces(yPos, index)
			console.log()
			body.applyForce(new CANNON.Vec3(0, this.bodiesForce[index], 0))
		}
	}
}
