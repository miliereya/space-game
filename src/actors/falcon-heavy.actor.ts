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

type FalconStage = 1 | 2 | 3 | 4 | 5

export class FalconHeavy {
	stage: FalconStage = 1
	model: THREE.Mesh
	body: CANNON.Body

	private mass = totalMass

	private mainBooster1 = new MainBooster(25)
	private mainBooster2 = new MainBooster(0)
	private mainBooster3 = new MainBooster(-25)

	constructor(TWorld: THREE.Scene) {
		this.setupBody()
		this.setupModel(TWorld)
	}

	private setupBody() {
		const rocketShape = new CANNON.Box(new CANNON.Vec3(10.5, 27, 10.5))
		const body = new CANNON.Body({ mass: this.mass })

		body.addShape(rocketShape, new CANNON.Vec3(0, 110.6, 0))

		body.addShape(this.mainBooster1.shape, new CANNON.Vec3(25, -49.4, 0))
		body.addShape(this.mainBooster2.shape, new CANNON.Vec3(0, -49.4, 0))
		body.addShape(this.mainBooster3.shape, new CANNON.Vec3(-25, -49.4, 0))

		this.body = body
	}

	private setupModel(TWorld: THREE.Scene) {
		gltfLoader.load(
			'models/test-rocket.glb',
			(gltf) => {
				this.model = gltf.scene.children[0] as THREE.Mesh
				this.model.castShadow = true

				this.model.material = new THREE.MeshBasicMaterial({
					color: new THREE.Color(0xfff000),
				})
				TWorld.add(this.model)

				this.mainBooster1.setupModel(TWorld, -20, 0, 0)
				this.mainBooster2.setupModel(TWorld, 0, 0, 0)
				this.mainBooster3.setupModel(TWorld, 20, 0, 0)

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
		this.mainBooster1.on()
		this.mainBooster2.on()
		this.mainBooster3.on()
	}

	turnOffAllFirstStageBoosters() {
		this.mainBooster1.off()
		this.mainBooster2.off()
		this.mainBooster3.off()
	}

	// Rocket movement calculations
	private accelerate() {
		// Values for impulse
		let x = 0
		let y = 0

		if (this.stage === 1 || this.stage === 2) {
			if (this.mainBooster2.isActive) {
				const power = this.mainBooster1.burn()
				y += power
			}
		}

		if (this.stage === 1) {
			if (this.mainBooster1.isActive) {
				const power = this.mainBooster1.burn()
				y += power
				x += this.mainBooster2.isActive ? 0.00003 : 0.0001
			}

			if (this.mainBooster3.isActive) {
				const power = this.mainBooster1.burn()
				y += power
				x += this.mainBooster2.isActive ? -0.00003 : -0.0001
			}
		}
		const impulse = new CANNON.Vec3(0, y, 0)

		this.body.applyLocalImpulse(impulse)

		if (this.stage === 3) {
			// Rotation on 3rd stage???
			// this.body.quaternion.x += 0.0001
		}

		const prevY = this.model.position.y

		moveModelToBody(this.model, this.body, 0, 60)

		const currentY = this.model.position.y

		return currentY - prevY // Difference for camera position.y
	}

	getY() {
		return this.model.position.y
	}

	animate(camera: THREE.PerspectiveCamera, controls: OrbitControls) {
		this.mainBooster1.animate(this.body)
		this.mainBooster2.animate(this.body)
		this.mainBooster3.animate(this.body)

		const yDiff = this.accelerate()
		const cameraDiff = camera.position.y + yDiff
		// Camera follows rocket
		camera.position.y = cameraDiff > 0 ? cameraDiff : 0
		camera.lookAt(this.model.getWorldPosition(controls.target))

		controls.update()
	}

	startSecondStage(CWorld: CANNON.World) {
		if (this.stage !== 1) return
		this.stage = 2

		this.mainBooster1.disconnect(CWorld, 900000, 0, 0)
		this.mainBooster3.disconnect(CWorld, -900000, 0, 0)

		this.mass -= this.mainBooster1.mass + this.mainBooster3.mass

		this.body.removeShape(this.mainBooster1.shape)
		this.body.removeShape(this.mainBooster3.shape)
	}

	startThirdStage(CWorld: CANNON.World) {
		if (this.stage !== 2) return
		this.stage = 3

		const mainBooster2 = this.mainBooster2

		mainBooster2.disconnect(CWorld)

		this.mass -= mainBooster2.mass

		this.body.removeShape(mainBooster2.shape)
	}
}
