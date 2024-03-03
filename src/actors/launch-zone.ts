import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export class LaunchZone {
	constructor(TWorld: THREE.Scene, CWorld: CANNON.World) {
		const landingPlatform1 = new THREE.Mesh(new THREE.CircleGeometry(15))

		landingPlatform1.position.set(-200, 1, 0)
		landingPlatform1.rotateX(-Math.PI / 2)
		TWorld.add(landingPlatform1)

		const landingPlatformBody1 = new CANNON.Body({ mass: 0 })
		landingPlatformBody1.addShape(new CANNON.Box(new CANNON.Vec3(10, 0.1, 10)))
		landingPlatformBody1.position.set(-200, 1, 0)
		CWorld.addBody(landingPlatformBody1)

		const landingPlatform2 = new THREE.Mesh(new THREE.CircleGeometry(15))

		landingPlatform2.position.set(0, 1, 200)
		landingPlatform2.rotateX(-Math.PI / 2)
		TWorld.add(landingPlatform2)

		const landingPlatformBody2 = new CANNON.Body({ mass: 0 })
		landingPlatformBody2.addShape(new CANNON.Box(new CANNON.Vec3(10, 0.1, 10)))
		landingPlatformBody2.position.set(0, 1, 200)
		CWorld.addBody(landingPlatformBody2)

		const landingPlatform3 = new THREE.Mesh(new THREE.CircleGeometry(15))

		landingPlatform3.position.set(200, 1, 0)
		landingPlatform3.rotateX(-Math.PI / 2)
		TWorld.add(landingPlatform3)

		const landingPlatformBody3 = new CANNON.Body({ mass: 0 })
		landingPlatformBody3.addShape(new CANNON.Box(new CANNON.Vec3(10, 0.1, 10)))
		landingPlatformBody3.position.set(200, 1, 0)
		CWorld.addBody(landingPlatformBody3)
	}
}
