import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FalconHeavy } from '../actors'
import { Metrics, MetricsParams } from './metrics.instance'
import { Clock } from './clock.instance'
import { Environment } from './environment.instance'
import { Cannon } from './cannon.instance'

interface SceneProps {
	metrics?: MetricsParams | null
}

export class Scene {
	// Resolution
	private w: number
	private h: number

	// Worlds
	private TWorld: THREE.Scene // THREE World (visual)
	private Cannon: Cannon // CANNON (physics)

	// Camera
	private camera: THREE.PerspectiveCamera
	private controls: OrbitControls

	// Renderer
	private renderer: THREE.WebGLRenderer

	// Actors
	private rocket: FalconHeavy

	// Environment
	private environment: Environment

	//Helpers
	private clock: THREE.Clock
	private frame = 0 // Frame counter

	// Flags
	private isRocketLaunched = false
	private isClockStarted = false

	// Dev mode
	private metrics?: Metrics

	constructor(props: SceneProps = {}) {
		this.updateResolution()

		this.setup()

		// Earth, Stars, Sun, etc.
		this.addEnvironment()

		this.addActors()

		if (props.metrics) {
			this.metrics = new Metrics(this.TWorld, this.Cannon.world, props.metrics)
		}
		// Event listeners
		this.bindEvents()

		this.start()
	}

	private setup() {
		this.setupTWorld()

		this.Cannon = new Cannon()
		this.setupRenderer()
		this.setupCameras()
		this.setupControls()
		this.setupLights()
	}

	private addActors() {
		this.rocket = new FalconHeavy(this.TWorld, this.Cannon.world)
	}

	private addEnvironment() {
		this.environment = new Environment(this.TWorld, this.Cannon.world)
	}

	private start() {
		document.body.appendChild(this.renderer.domElement)
		this.animate()
	}

	private bindEvents() {
		this.bindResizeEvent()
		this.bindControlPanelEvents()
	}

	private updateResolution() {
		this.w = window.innerWidth
		this.h = window.innerHeight
	}

	private setupTWorld() {
		this.TWorld = new THREE.Scene()
		this.clock = new THREE.Clock()
	}

	private setupCameras() {
		this.camera = new THREE.PerspectiveCamera(
			75,
			this.w / this.h,
			0.1,
			180000000 // Far
		)

		// Default position
		this.camera.position.z = 600
		this.camera.position.y = 300

		this.TWorld.add(this.camera)
	}

	private setupLights() {
		// No need in Ambient??
		// this.TWorld.add(new THREE.AmbientLight('', 3))
	}

	// Player controls
	private setupControls() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.controls.minDistance = 30
		this.controls.maxDistance = 300
	}

	private setupRenderer() {
		this.renderer = new THREE.WebGLRenderer()
		this.renderer.shadowMap.enabled = true

		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
		this.renderer.setSize(this.w, this.h)
	}

	private bindControlPanelEvents() {
		document.getElementById('on')?.addEventListener('click', () => {
			this.rocket.turnOnAllFirstStageBoosters()

			if (!this.isClockStarted) {
				this.isClockStarted = true
				new Clock()
			}
			if (!this.isRocketLaunched) {
				this.isRocketLaunched = true
				this.Cannon.world.addBody(this.rocket.body)
			}
		})

		document.getElementById('stage2')?.addEventListener('click', () => {
			this.rocket.startSecondStage(this.Cannon.world, this.TWorld)
		})

		document.getElementById('stage3')?.addEventListener('click', () => {
			this.rocket.startThirdStage(this.Cannon.world, this.TWorld)
		})

		document.getElementById('stage4')?.addEventListener('click', () => {
			this.rocket.startFourthStage()
		})

		document
			.getElementById('off')
			?.addEventListener('click', () =>
				this.rocket.turnOffAllFirstStageBoosters()
			)
	}

	private bindResizeEvent() {
		window.addEventListener('resize', () => {
			this.updateResolution()

			this.camera.aspect = this.w / this.h
			this.camera.updateProjectionMatrix()

			this.renderer.setSize(this.w, this.h)
			this.render()
		})
	}

	private animate() {
		if (this.metrics && this.rocket.model) {
			this.metrics.update(this.rocket.model)
		}
		// for (let i = 0; i < 10; i++) {
			this.frame++

			const delta = this.clock.getDelta()

			// Change to flag "isGameLoaded"
			if (this.rocket.model) {
				this.rocket.animate(this.camera, this.controls, delta)

				this.environment.animate(
					this.rocket.model.position,
					this.camera.position.y,
					this.frame
				)
				this.Cannon.animate(delta, this.frame)
			}
		// }

		this.controls.update()
		this.render()

		requestAnimationFrame(() => this.animate())
	}

	private render() {
		this.renderer.render(this.TWorld, this.camera)
	}
}
