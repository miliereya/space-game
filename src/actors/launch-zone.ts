import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
const modelLoader = new GLTFLoader()

export class LaunchZone {
	constructor(TWorld: THREE.Scene, CWorld: CANNON.World) {
		// modelLoader.load('models/launch-zone.glb', (gltf) => {
		// 	const launchZone = gltf.scene.children[0]
		// 	launchZone.scale.set(2, 2, 2)
		// 	launchZone.position.set(750, 110, 50)
		// 	TWorld.add(launchZone)
		// })

		modelLoader.load('models/pad.glb', (gltf) => {
			const pad = gltf.scene
			const pad2 = pad.clone()
			const pad3 = pad.clone()
			// const landingPlatform1 = new THREE.Mesh(new THREE.CircleGeometry(15))
			pad.scale.set(4, 4, 4)
			pad.position.set(-200, 0.3, 0)

			// pad.rotateX(-Math.PI / 2)
			TWorld.add(pad)

			const landingPlatformBody1 = new CANNON.Body({ mass: 0 })
			landingPlatformBody1.addShape(
				new CANNON.Box(new CANNON.Vec3(10, 0.1, 10))
			)
			landingPlatformBody1.position.set(-200, 1, 0)
			CWorld.addBody(landingPlatformBody1)

			pad2.scale.set(4, 4, 4)
			pad2.position.set(0, 0.3, 200)
			TWorld.add(pad2)

			const landingPlatformBody2 = new CANNON.Body({ mass: 0 })
			landingPlatformBody2.addShape(
				new CANNON.Box(new CANNON.Vec3(10, 0.1, 10))
			)
			landingPlatformBody2.position.set(0, 1, 200)
			CWorld.addBody(landingPlatformBody2)

			pad3.position.set(200, 0.3, 0)
			pad3.scale.set(4, 4, 4)
			TWorld.add(pad3)

			const landingPlatformBody3 = new CANNON.Body({ mass: 0 })
			landingPlatformBody3.addShape(
				new CANNON.Box(new CANNON.Vec3(10, 0.1, 10))
			)
			landingPlatformBody3.position.set(200, 1, 0)
			CWorld.addBody(landingPlatformBody3)
		})
	}
}
