import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MainBooster, MiniBooster } from '.'
import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { moveModelToBody } from '../utils'

import { RocketCapHalf } from './rocket-cap.actor'

// Loader
const gltfLoader = new GLTFLoader()

// Props
type FalconStage = 1 | 2 | 3 | 4 | 5

export class FalconHeavy {
	stage: FalconStage = 1
	model: THREE.Group
	body: CANNON.Body

	private mass = 0

	private mainBooster1 = new MainBooster(1)
	private mainBooster2 = new MainBooster(2)
	private mainBooster3 = new MainBooster(3)

	private miniBooster = new MiniBooster()

	private capHalf1 = new RocketCapHalf('left')
	private capHalf2 = new RocketCapHalf('right')

	constructor(
		TWorld: THREE.Scene,
		isRocketLoadedCallback: () => void
	) {
		this.setupModels(TWorld, isRocketLoadedCallback)
	}

	private setupModels(TWorld: THREE.Scene, isRocketLoadedCallback: () => void) {
		gltfLoader.load('models/rocket/rocket.glb', (gltf) => {
			const model = gltf.scene
			const animations = gltf.animations

			const capHalf1 = model.getObjectByName('CapHalf1') as THREE.Mesh
			const capHalf2 = model.getObjectByName('CapHalf2') as THREE.Mesh

			const miniBooster = model.getObjectByName('MiniBooster') as THREE.Mesh

			const mainBooster1 = model.getObjectByName('MainBooster1') as THREE.Mesh
			const mainBooster2 = model.getObjectByName('MainBooster2') as THREE.Mesh
			const mainBooster3 = model.getObjectByName('MainBooster3') as THREE.Mesh

			this.mass +=
				this.mainBooster1.mass +
				this.mainBooster2.mass +
				this.mainBooster3.mass +
				this.capHalf1.mass +
				this.capHalf2.mass +
				this.miniBooster.mass

			const body = new CANNON.Body({ mass: this.mass })
			this.capHalf1.addModel(
				capHalf1,
				body,
				THREE.AnimationClip.findByName(animations, 'CapHalf1Disconnect')
			)
			this.capHalf2.addModel(
				capHalf2,
				body,
				THREE.AnimationClip.findByName(animations, 'CapHalf2Disconnect')
			)

			this.miniBooster.addModel(miniBooster, body)

			this.mainBooster1.addModel(mainBooster1, body)
			this.mainBooster2.addModel(mainBooster2, body)
			this.mainBooster3.addModel(mainBooster3, body)

			this.body = body
			this.model = model

			TWorld.add(this.model)
			isRocketLoadedCallback()
		})
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

		// this.body.quaternion.x += 0.0003
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

		if (this.stage === 3) {
			const power = this.miniBooster.burn()
			y += power
		}

		const impulse = new CANNON.Vec3(0, y, 0)
		this.body.applyLocalImpulse(impulse)

		const prevX = this.model.position.x
		const prevY = this.model.position.y
		const prevZ = this.model.position.z

		moveModelToBody(this.model, this.body, 0, 0, 0)

		const currentX = this.model.position.x
		const currentY = this.model.position.y
		const currentZ = this.model.position.z

		return {
			xDiff: currentX - prevX,
			yDiff: currentY - prevY,
			zDiff: currentZ - prevZ,
		} // Difference for camera position.y
	}

	getY() {
		return this.model.position.y
	}

	animate(
		camera: THREE.PerspectiveCamera,
		controls: OrbitControls,
		delta: number
	) {
		this.mainBooster1.animate()
		this.mainBooster2.animate()
		this.mainBooster3.animate()

		if (this.stage === 4) {
			this.capHalf1.animate(delta)
			this.capHalf2.animate(delta)
		}

		console.log(this.body.velocity.y)
		const { xDiff, yDiff, zDiff } = this.accelerate()
		const cameraDiff = camera.position.y + yDiff

		// Camera follows rocket
		camera.position.y = cameraDiff > 0 ? cameraDiff : 0
		camera.position.x += xDiff
		camera.position.z += zDiff
		camera.lookAt(this.model.getWorldPosition(controls.target))

		controls.update()
	}

	startSecondStage(CWorld: CANNON.World, TWorld: THREE.Scene) {
		if (this.stage !== 1) return
		this.stage = 2

		this.mainBooster1.disconnect(this.model, this.body, CWorld, TWorld)
		this.mainBooster3.disconnect(this.model, this.body, CWorld, TWorld)
	}

	startThirdStage(CWorld: CANNON.World, TWorld: THREE.Scene) {
		if (this.stage !== 2) return
		this.stage = 3

		this.mainBooster2.disconnect(this.model, this.body, CWorld, TWorld)

		this.miniBooster.on()
	}

	startFourthStage() {
		if (this.stage !== 3) return
		this.stage = 4

		this.capHalf1.disconnect(this.body)
		this.capHalf2.disconnect(this.body)
	}
}
