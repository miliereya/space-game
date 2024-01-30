import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MainBooster } from '.'
import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { moveBodyToModel, moveModelToBody } from '../utils'

// Loader
const gltfLoader = new GLTFLoader()

// Props
const totalMass = 30000
const stageFirst = {
	booster: { fuel: 10000, power: 1000000 },
	maxSpeed: 10000,
}

type FalconStage = 1 | 2 | 3 | 4

export class FalconHeavy {
	stage: FalconStage = 1
	model: THREE.Mesh
	body: CANNON.Body

	private mass = totalMass

	private booster_1 = new MainBooster(
		stageFirst.booster.fuel,
		stageFirst.booster.power,
		25
	)

	private booster_2 = new MainBooster(
		stageFirst.booster.fuel,
		stageFirst.booster.power,
		0
	)

	private booster_3 = new MainBooster(
		stageFirst.booster.fuel,
		stageFirst.booster.power,
		-25
	)

	constructor(TWorld: THREE.Scene) {
		this.setupBody()
		this.setupModel(TWorld)
	}

	private setupBody() {
		const rocketShape = new CANNON.Box(new CANNON.Vec3(10.5, 80.7, 10.5))

		const body = new CANNON.Body({ mass: this.mass })
		body.addShape(rocketShape, new CANNON.Vec3(0, 110.6, 0))

		body.addShape(this.booster_1.shape, new CANNON.Vec3(25, -49.4, 0))
		body.addShape(this.booster_2.shape, new CANNON.Vec3(0, -49.4, 0))
		body.addShape(this.booster_3.shape, new CANNON.Vec3(-25, -49.4, 0))

		this.body = body
	}

	private setupModel(TWorld: THREE.Scene) {
		gltfLoader.load(
			'models/test-rocket.glb',
			(gltf) => {
				TWorld.add(gltf.scene)																									
				this.model = gltf.scene.children[0] as THREE.Mesh

				this.booster_1.setupModel(TWorld, -20, 0, 0)
				this.booster_2.setupModel(TWorld, 0, 0, 0)
				this.booster_3.setupModel(TWorld, 20, 0, 0)

				this.model.position.set(0, 115.669, 0)

				moveBodyToModel(this.body, this.model)
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
		this.booster_1.on()
		this.booster_2.on()
		this.booster_3.on()
	}

	turnOffAllFirstStageBoosters() {
		this.booster_1.off() 
		this.booster_2.off()
		this.booster_3.off()
	}

	private accelerate() {
		let x = 0
		let y = 0

		if (this.stage === 1 || this.stage === 2) {
			if (this.booster_2.isActive) {
				const power = this.booster_1.burn()
				y += power
			}
		}

		if (this.stage === 1) {
			if (this.booster_1.isActive) {
				const power = this.booster_1.burn()
				y += power
				x += this.booster_2.isActive ? 0.00003 : 0.0001   
			}

			if (this.booster_3.isActive) {
				const power = this.booster_1.burn()
				y += power
				x += this.booster_2.isActive ? -0.00003 : -0.0001
			}
		}
		const impulse = new CANNON.Vec3(0, y, 0)

		this.body.applyLocalImpulse(impulse) 

		if (this.stage === 3) {
			// this.body.quaternion.x += 0.0001
		}

		const prevY = this.model.position.y

		moveModelToBody(this.model, this.body, 0, 60)

		const currentY = this.model.position.y

		return currentY - prevY
	}

	animate(camera: THREE.PerspectiveCamera, controls: OrbitControls) {
		if (this.model) {
			this.booster_1.animate(this.body)
			this.booster_2.animate(this.body)
			this.booster_3.animate(this.body)

			const yDiff = this.accelerate()

			const cameraDiff = camera.position.y + yDiff

			camera.position.y = cameraDiff > 0 ? cameraDiff : 0
			camera.lookAt(this.model.getWorldPosition(controls.target))

			controls.update()
		}
	}

	startSecondStage(CWorld: CANNON.World) {
		if (this.stage !== 1) return
		this.stage = 2

		this.booster_1.disconnect(CWorld, 900000, 0, 0)
		this.booster_3.disconnect(CWorld, -900000, 0, 0)

		this.mass -= this.booster_1.mass + this.booster_3.mass

		this.body.removeShape(this.booster_1.shape)
		this.body.removeShape(this.booster_3.shape)
	}																																	

	startThirdStage(CWorld: CANNON.World) {
		if (this.stage !== 2) return
		this.stage = 3

		const booster_2 = this.booster_2

		booster_2.disconnect(CWorld)

		this.mass -= booster_2.mass

		this.body.removeShape(booster_2.shape)				
	}
}
