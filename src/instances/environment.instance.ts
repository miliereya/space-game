import * as THREE from 'three'

const earthRadius = 100000000
const earthSegments = 500

const textureLoader = new THREE.TextureLoader()

export class Environment {
	constructor(TWorld: THREE.Scene) {
		this.addEarth(TWorld)
		this.addClouds(TWorld)
		this.addStars(TWorld)
	}

	addEarth(TWorld: THREE.Scene) {
		const geometry = new THREE.SphereGeometry(
			earthRadius,
			earthSegments,
			earthSegments
		)
		const materialNormalMap = new THREE.MeshPhongMaterial({
			specular: 0x7c7c7c,
			shininess: 15,
			map: textureLoader.load('textures/earth/8081_earthmap10k.jpg'),
			specularMap: textureLoader.load('textures/earth/earth_specular_2048.jpg'),
			normalMap: textureLoader.load('textures/earth/earth_normal_2048.jpg'),
			normalScale: new THREE.Vector2(0.85, -0.85),
		})

		if (materialNormalMap.map) {
			materialNormalMap.map.colorSpace = THREE.SRGBColorSpace
		}

		const earth = new THREE.Mesh(geometry, materialNormalMap)
		earth.rotation.x = Math.PI / 4
		earth.rotation.y = -50
		earth.position.y = -earthRadius
		TWorld.add(earth)
	}

	addClouds(TWorld: THREE.Scene) {
		const materialClouds = new THREE.MeshLambertMaterial({
			map: textureLoader.load('textures/earth/earth_clouds_2048.png'),
			transparent: true,
			// side: THREE.DoubleSide
		})
		if (materialClouds.map) materialClouds.map.colorSpace = THREE.SRGBColorSpace

		const cloudGeometry = new THREE.SphereGeometry(
			earthRadius + 200000,
			earthSegments,
			earthSegments
		)

		const meshClouds = new THREE.Mesh(cloudGeometry, materialClouds)
		meshClouds.rotation.z = 0.41
		meshClouds.position.y = -earthRadius
		TWorld.add(meshClouds)
	}

	addStars(TWorld: THREE.Scene) {
		const r = 300200000,
			starsGeometry = [new THREE.BufferGeometry(), new THREE.BufferGeometry()]

		const vertices1: number[] = []
		const vertices2: number[] = []

		const vertex = new THREE.Vector3()

		for (let i = 0; i < 250; i++) {
			vertex.x = Math.random() * 2 - 1
			vertex.y = Math.random() * 2 - 1
			vertex.z = Math.random() * 2 - 1
			vertex.multiplyScalar(r)

			vertices1.push(vertex.x, vertex.y, vertex.z)
		}

		for (let i = 0; i < 1500; i++) {
			vertex.x = Math.random() * 2 - 1
			vertex.y = Math.random() * 2 - 1
			vertex.z = Math.random() * 2 - 1
			vertex.multiplyScalar(r)

			vertices2.push(vertex.x, vertex.y, vertex.z)
		}

		starsGeometry[0].setAttribute(
			'position',
			new THREE.Float32BufferAttribute(vertices1, 3)
		)
		starsGeometry[1].setAttribute(
			'position',
			new THREE.Float32BufferAttribute(vertices2, 3)
		)

		const starsMaterials = [
			new THREE.PointsMaterial({
				color: 0x9c9c9c,
				size: 2,
				sizeAttenuation: false,
			}),
			new THREE.PointsMaterial({
				color: 0x9c9c9c,
				size: 1,
				sizeAttenuation: false,
			}),
			new THREE.PointsMaterial({
				color: 0x7c7c7c,
				size: 2,
				sizeAttenuation: false,
			}),
			new THREE.PointsMaterial({
				color: 0x838383,
				size: 1,
				sizeAttenuation: false,
			}),
			new THREE.PointsMaterial({
				color: 0x5a5a5a,
				size: 2,
				sizeAttenuation: false,
			}),
			new THREE.PointsMaterial({
				color: 0x5a5a5a,
				size: 1,
				sizeAttenuation: false,
			}),
		]

		for (let i = 10; i < 30; i++) {
			const stars = new THREE.Points(
				starsGeometry[i % 2],
				starsMaterials[i % 6]
			)

			stars.rotation.x = Math.random() * 6
			stars.rotation.y = Math.random() * 6
			stars.rotation.z = Math.random() * 6
			stars.scale.setScalar(i * 10)

			stars.matrixAutoUpdate = false
			stars.updateMatrix()

			TWorld.add(stars)
		}
	}

	addGround() {}
}
