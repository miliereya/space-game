import * as CANNON from 'cannon-es'

export class Cannon {
	world: CANNON.World

	constructor() {
		this.world = new CANNON.World()
		this.world.gravity.set(0, -9.82, 0)

		// Collision detection,
		// More iterations > Better collision detection > More memory usage
		;(this.world.solver as CANNON.GSSolver).iterations = 5
	}

	animate(delta: number, rocketY: number) {
		this.world.step(delta)
		if (rocketY > 1000) {
			this.world.gravity.set(0, -5.82, 0)
		} else {
			this.world.gravity.set(0, -9.82, 0)
		}
	}
}