import * as CANNON from 'cannon-es'

export class Cannon {
	world: CANNON.World // Physical World

	constructor() {
		this.world = new CANNON.World()

		// Collision detection,
		// More iterations > Better collision detection > More memory usage
		;(this.world.solver as CANNON.GSSolver).iterations = 5
	}

	animate(delta: number, rocketY: number, frame: number) {
		this.world.step(delta)
		// Gravitation
		// if (rocketY > 100000) {
		// 	this.world.gravity.set(0, -7.82, 0)
		// } else if (rocketY > 200000) {
		// 	this.world.gravity.set(0, -5.82, 0)
		// } else if (rocketY > 300000) {
		// 	this.world.gravity.set(0, -3.82, 0)
		// } else if (rocketY > 400000) {
		// 	this.world.gravity.set(0, 0, 0)
		// } else {
			// this.world.gravity.set(0, 0, 0)
		// }
	}
}
