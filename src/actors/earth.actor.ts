import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { ROCKET_PROPS } from '../constants'

const earthRadius = 6371000 // meters
const sphereSegments = 500

const textureLoader = new THREE.TextureLoader()

export class Earth {
	constructor(
		TWorld: THREE.Scene,
		CWorld: CANNON.World,
		earthLoadCallback: () => void
	) {
		// Earth model
		const materialNormalMap = new THREE.MeshPhongMaterial({
			shininess: 15,
			map: textureLoader.load('textures/earth/8081_earthmap10k.jpg', (data) => {
				earthLoadCallback()
				return data
			}),
			specularMap: textureLoader.load('textures/earth/earth_specular_2048.jpg'),
			normalScale: new THREE.Vector2(0.85, -0.85),
		})

		if (materialNormalMap.map) {
			materialNormalMap.map.colorSpace = THREE.SRGBColorSpace
		}

		const earth = new THREE.Mesh(
			new THREE.SphereGeometry(earthRadius, sphereSegments, sphereSegments),
			materialNormalMap
		)
		earth.receiveShadow = true
		// Choose launch position
		earth.rotation.x = Math.PI / 4
		earth.rotation.y = -50

		// Move Earth right under rocket
		earth.position.y = -earthRadius

		TWorld.add(earth)

		// Physical ground
		const groundBody = new CANNON.Body()

		groundBody.addShape(new CANNON.Sphere(earthRadius))
		groundBody.position.y = -earthRadius - 30

		CWorld.addBody(groundBody)

		// this.addClouds(TWorld) // Artifacts creator :(
	}

	private addClouds(TWorld: THREE.Scene) {
		const materialClouds = new THREE.MeshLambertMaterial({
			map: textureLoader.load('textures/earth/earth_clouds_2048.png'),
			transparent: true,
			opacity: 0.2,
			// side: THREE.DoubleSide,
		})
		if (materialClouds.map) materialClouds.map.colorSpace = THREE.SRGBColorSpace

		const meshClouds = new THREE.Mesh(
			new THREE.SphereGeometry(
				earthRadius + 15000,
				sphereSegments,
				sphereSegments
			),
			materialClouds
		)
		meshClouds.rotation.z = 0.41

		// Move clouds to the center of Earth
		meshClouds.position.y = -earthRadius
		TWorld.add(meshClouds)
	}
}
