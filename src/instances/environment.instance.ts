import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { Earth, Sky, Sun } from '../actors'

export class Environment {
	sun: Sun
	sky: Sky
	earth: Earth

	constructor(
		TWorld: THREE.Scene,
		CWorld: CANNON.World,
		sunLoadCallback: () => void,
		earthLoadCallback: () => void,
		skyLoadCallback: () => void
	) {
		this.earth = new Earth(TWorld, CWorld, sunLoadCallback)
		this.sun = new Sun(TWorld, earthLoadCallback)
		this.sky = new Sky(TWorld, skyLoadCallback)
	}

	animate(rocketPosition: THREE.Vector3, cameraY: number, frame: number) {
		this.sun.animate(rocketPosition)
		this.sky.animate(cameraY, frame)
	}
}
