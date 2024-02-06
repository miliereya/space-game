import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { moveBodyToModel, moveModelToBody } from '../utils'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const gltfLoader = new GLTFLoader()

export class MainBooster {
	private power: number
	private marginModel: number

	isConnected = true
	isActive = false

	mass = 8000
	fuel: number
	fuelMax: number

	model: THREE.Mesh
	body: CANNON.Body
	shape = new CANNON.Box(new CANNON.Vec3(10.5, 45, 10.5))

	constructor(fuel: number, power: number, marginModel: number) {
		this.marginModel = marginModel
		this.fuel = fuel
		this.fuelMax = fuel
		this.power = power
	}

	setupModel(TWorld: THREE.Scene, x: number, y: number, z: number) {
		gltfLoader.load(
			'models/booster.glb',
			(gltf) => {
				this.model = gltf.scene.children[0] as THREE.Mesh
				this.model.castShadow = true
				this.model.receiveShadow = true
				this.model.scale.x = 11
				this.model.scale.y = 60
				this.model.scale.z = 11

				this.model.position.x = x
				this.model.position.y = y
				this.model.position.z = z

				TWorld.add(this.model)
			},
			(xhr) => {
				console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
			},
			(error) => {
				console.log(error)
			}
		)
	}

	animate(body: CANNON.Body) {
		if (this.model) {
			if (this.isConnected) {
				this.animateConnected(body)
			} else {
				this.animateDisconnected()
			}
		}
	}

	animateConnected(body: CANNON.Body) {
		moveModelToBody(this.model, body, this.marginModel, -50)
	}

	animateDisconnected() {
		moveModelToBody(this.model, this.body)
	}

	disconnect(CWorld: CANNON.World, xImpulse = 0, yImpulse = 0, zImpulse = 0) {
		this.isConnected = false
		this.body = new CANNON.Body({ mass: this.mass })

		moveBodyToModel(this.body, this.model)

		this.body.addShape(this.shape)
		CWorld.addBody(this.body)

		if (xImpulse || yImpulse || zImpulse) {
			this.body.applyLocalImpulse(new CANNON.Vec3(xImpulse, yImpulse, zImpulse))
			setTimeout(() => {
				this.body.applyLocalImpulse(
					new CANNON.Vec3(-(xImpulse / 4), yImpulse, zImpulse)
				)
			}, 500)
			setTimeout(() => {
				this.body.applyLocalImpulse(
					new CANNON.Vec3(-(xImpulse / 4), yImpulse, zImpulse)
				)
			}, 1000)
			setTimeout(() => {
				this.body.applyLocalImpulse(
					new CANNON.Vec3(-(xImpulse / 4), yImpulse, zImpulse)
				)
			}, 1500)
			setTimeout(() => {
				this.body.applyLocalImpulse(
					new CANNON.Vec3(-(xImpulse / 4), yImpulse, zImpulse)
				)
			}, 2000)
		}
	}

	burn(): number {
		if (this.fuel) {
			this.fuel -= 1
			return this.power
		} else {
			this.isActive = false
			return 0
		}
	}

	on() {
		if (this.fuel) {
			this.isActive = true
		}
	}

	off() {
		this.isActive = false
	}
}
