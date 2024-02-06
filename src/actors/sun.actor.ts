import * as THREE from 'three'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const modelLoader = new GLTFLoader()

export class Sun {
	sunLightShadows: THREE.PointLight

	constructor(TWorld: THREE.Scene) {
		// Adding sun model
		modelLoader.load('textures/space/sun/scene.gltf', (gltf) => {
			const sun = gltf.scene.children[0]

			sun.scale.set(300000, 300000, 300000)

			sun.position.y = 60000000
			sun.position.x = -45000000

			TWorld.add(sun)
		})

		// Adding fake light with shadows
		const sunLightShadows = new THREE.PointLight(0xffffff)

		sunLightShadows.castShadow = true
		sunLightShadows.distance = 5000
		sunLightShadows.intensity = 9000000

		sunLightShadows.shadow.camera.far = 5000
		sunLightShadows.shadow.mapSize.width = 1024
		sunLightShadows.shadow.mapSize.height = 1024

		this.sunLightShadows = sunLightShadows

		// Adding sun light without shadows
		const sunLight = new THREE.PointLight(0xffffff, 1000000)
		sunLight.intensity = 4000000000000000

		sunLight.position.y = 20000000
		sunLight.position.x = -15000000

		TWorld.add(sunLightShadows)
		TWorld.add(sunLight)
		// TWorld.add(new THREE.PointLightHelper(sunLightShadows, 100))
		// TWorld.add(new THREE.PointLightHelper(sunLight, 3000000))
	}

	animate(rocketPosition: THREE.Vector3) {
		this.sunLightShadows.position.set(
			rocketPosition.x - 800,
			rocketPosition.y + 1200,
			rocketPosition.z
		)
	}
}
