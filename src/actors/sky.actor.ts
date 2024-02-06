import * as THREE from 'three'
import { calculateStepByPosition } from '../utils'

const textureLoader = new THREE.TextureLoader()

export class Sky {
	private blueSky: THREE.MeshBasicMaterial
	private stars: THREE.PointsMaterial[]

	constructor(TWorld: THREE.Scene) {
		// Adding stars
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

		// Getting ref for stars materials to change opacity in future
		this.stars = starsMaterials

		for (let i = 10; i < 30; i++) {
			const stars = new THREE.Points(
				starsGeometry[i % 2],
				starsMaterials[i % 6]
			)

			stars.rotation.x = Math.random() * 6
			stars.rotation.y = Math.random() * 6
			stars.rotation.z = Math.random() * 6
			stars.scale.setScalar(i * 10)

			stars.material.transparent = true
			stars.material.opacity = 0

			stars.matrixAutoUpdate = false
			stars.updateMatrix()

			TWorld.add(stars)
		}

		// Adding BlueSky
		const skyTexture = new THREE.MeshBasicMaterial({
			map: textureLoader.load('textures/back.png'),
			side: THREE.BackSide,
			transparent: true,
		})

		this.blueSky = skyTexture

		const sky = new THREE.Mesh(
			new THREE.SphereGeometry(20000000000000, 100, 100),
			skyTexture
		)

		TWorld.add(sky)
	}

	private animateStars(cameraY: number) {
		// Changing stars opacity by camera position
		if (cameraY > 30000 && cameraY < 1000000) {
			const val = calculateStepByPosition(cameraY, 30000, 100000, 0, 1)
			for (let i = 0; i < this.stars.length; i++) {
				this.stars[i].opacity = 1 - val
			}
		}
	}

	private animateBlueSky(cameraY: number) {
		// Changing color of the sky by camera position
		if (cameraY < 10000) {
			this.blueSky.opacity = 1
		} else if (cameraY > 10000 && cameraY < 12000) {
			this.blueSky.opacity = calculateStepByPosition(
				cameraY,
				10000,
				12000,
				0.7,
				0.99
			)
		} else if (cameraY > 12000 && cameraY < 50000) {
			this.blueSky.opacity = calculateStepByPosition(
				cameraY,
				12000,
				50000,
				0.5,
				0.7
			)
		} else if (cameraY > 50000 && cameraY < 87000) {
			this.blueSky.opacity = calculateStepByPosition(
				cameraY,
				50000,
				87000,
				0.35,
				0.5
			)
		} else if (cameraY > 87000 && cameraY < 100000) {
			this.blueSky.opacity = calculateStepByPosition(
				cameraY,
				87000,
				100000,
				0,
				0.35
			)
		} else {
			this.blueSky.opacity = 0
		}
	}

	animate(cameraY: number, frame: number) {
		if (frame % 3 === 0) { // Optimization
			this.animateStars(cameraY)
			this.animateBlueSky(cameraY)
		}
	}
}
