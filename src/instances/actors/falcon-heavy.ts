import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RocketBooster } from '..'
import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
const boosterShape = new CANNON.Box(new CANNON.Vec3(10.5, 80.7, 10.5))
// Loader
const gltfLoader = new GLTFLoader()

// Props
const totalMass = 30000
const stageFirst = {
	booster: { fuel: 10000, power: 2000 },
	maxSpeed: 10000,
}

type FalconStage = 1 | 2 | 3 | 4

export class FalconHeavy {
	stage: FalconStage = 1

	model: THREE.Mesh
	body: CANNON.Body

	booster2: THREE.Mesh
	booster2Body: CANNON.Body

	private mass = totalMass

	private stageFirst = {
		booster_1: new RocketBooster(
			stageFirst.booster.fuel,
			stageFirst.booster.power
		),
		booster_2: new RocketBooster(
			stageFirst.booster.fuel,
			stageFirst.booster.power
		),
		booster_3: new RocketBooster(
			stageFirst.booster.fuel,
			stageFirst.booster.power
		),
	}

	constructor(scene: THREE.Scene) {
		this.setupBody()
		this.setupModel(scene)
	}

	private setupBody() {
		const rocketShape = new CANNON.Box(new CANNON.Vec3(10.5, 150.7, 10.5))

		const body = new CANNON.Body({ mass: this.mass })
		body.addShape(rocketShape, new CANNON.Vec3(0, 50, 0))
		body.addShape(boosterShape, new CANNON.Vec3(25, 0, 0))
		body.addShape(boosterShape, new CANNON.Vec3(-25, 0, 0))

		this.body = body
	}

	private setupModel(scene: THREE.Scene) {
		gltfLoader.load(
			'models/test-rocket.glb',
			(gltf) => {
				scene.add(gltf.scene)
				this.model = gltf.scene.children[0] as THREE.Mesh

				gltfLoader.load(
					'models/booster.glb',
					(gltf) => {
						const booster2 = gltf.scene.children[0] as THREE.Mesh
						booster2.scale.set(1, 0.55, 1)
						booster2.position.x = 0 + 2.2
						booster2.position.y = 0
						booster2.position.z = 0
						this.model.add(booster2)
						this.booster2 = booster2
						// this.model.children.push(gltf.scene.children[1], gltf.scene.children[2])
						// this.model.scale.set(0.18, 0.18, 0.18)
					},
					(xhr) => {
						console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
					},
					(error) => {
						console.log(error)
					}
				)

				// this.model.children.push(gltf.scene.children[1], gltf.scene.children[2])
				// this.model.scale.set(0.18, 0.18, 0.18)
				this.model.position.set(0, 115.669, 0)

				this.model.updateMatrix()
				this.body.position.x = this.model.position.x
				this.body.position.y = this.model.position.y
				this.body.position.z = this.model.position.z

				this.body.quaternion.set(
					this.model.quaternion.x,
					this.model.quaternion.y,
					this.model.quaternion.z,
					this.model.quaternion.w
				)
				console.log(this.model)
			},
			(xhr) => {
				console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
			},
			(error) => {
				console.log(error)
			}
		)
	}

	turnOnAllFirstStageBoosters() {
		this.stageFirst.booster_1.on()
		this.stageFirst.booster_2.on()
		this.stageFirst.booster_3.on()
	}

	turnOffAllFirstStageBoosters() {
		this.stageFirst.booster_1.off()
		this.stageFirst.booster_2.off()
		this.stageFirst.booster_3.off()
	}

	private accelerate() {
		let x = 0
		let z = 0

		if (this.stage === 1) {
			const { booster_1, booster_2, booster_3 } = this.stageFirst

			if (booster_2.isActive) {
				const power = booster_1.burn()
				z += power
			}

			if (booster_1.isActive) {
				const power = booster_1.burn()
				z += power
				x += booster_2.isActive ? 0.00003 : 0.0001
			}

			if (booster_3.isActive) {
				const power = booster_1.burn()
				z += power
				x += booster_2.isActive ? -0.00003 : -0.0001
			}
		}

		const impulse = new CANNON.Vec3(x, z, 0)

		this.body.applyLocalImpulse(impulse)

		const prevY = this.model.position.y

		this.model.position.set(
			this.body.position.x,
			this.body.position.y,
			this.body.position.z
		)
		this.model.quaternion.set(
			this.body.quaternion.x,
			this.body.quaternion.y,
			this.body.quaternion.z,
			this.body.quaternion.w
		)

		if (this.stage === 2) {
			this.booster2.position.set(
				this.booster2Body.position.x,
				this.booster2Body.position.y,
				this.booster2Body.position.z
			)
			this.booster2.quaternion.set(
				this.booster2Body.quaternion.x,
				this.booster2Body.quaternion.y,
				this.booster2Body.quaternion.z,
				this.booster2Body.quaternion.w
			)
		}

		const currentY = this.model.position.y

		return currentY - prevY
	}

	animate(camera: THREE.PerspectiveCamera, controls: OrbitControls) {
		if (this.model) {
			const yDiff = this.accelerate()

			const cameraDiff = camera.position.y + yDiff

			camera.position.y = cameraDiff > 0 ? cameraDiff : 0
			camera.lookAt(this.model.getWorldPosition(controls.target))

			controls.update()
		}
	}

	goToSecondStage(scene: THREE.Scene, world: CANNON.World) {
		if (this.stage !== 1) return

		this.stage = 2

		const booster = new CANNON.Body({ mass: this.mass })
		this.booster2.removeFromParent()
		console.log(this.body.shapes[1].body?.position)
		booster.position.x = (this.body.shapes[1].body?.position.x as any) + 25
		booster.position.y = this.body.shapes[1].body?.position.y as any
		booster.position.z = this.body.shapes[1].body?.position.z as any
		booster.addShape(boosterShape)
		this.booster2Body = booster

		this.body.removeShape(boosterShape)
		this.body.removeShape(boosterShape)
		world.addBody(booster)

		scene.add(this.booster2)
		this.booster2.scale.set(10, 70.55, 10)
	}
}
