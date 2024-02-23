import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FalconHeavy } from '../actors'
import { Metrics, MetricsParams } from './metrics.instance'
import { Clock } from './clock.instance'
import { Environment } from './environment.instance'
import { Cannon } from './cannon.instance'
import { areObjectValuesTrue } from '../utils'
import { FPS_LIMIT } from '../constants'
import { Camera } from './camera.instance'
import { Base } from '../actors/base.actor'

interface SceneProps {
	metrics?: MetricsParams | null
}

type TypeLoadInstance =
	| 'isRocketLoaded'
	| 'isSunLoaded'
	| 'isEarthLoaded'
	| 'isSkyLoaded'
	| 'isScriptLoaded'

export class Scene {
	// Resolution
	private w: number
	private h: number

	// Worlds
	private TWorld: THREE.Scene // THREE World (visual)
	private cannon: Cannon // CANNON (physics)

	// Camera
	private camera: Camera
	private controls: OrbitControls

	// Renderer
	private renderer: THREE.WebGLRenderer

	// Actors
	private rocket: FalconHeavy

	// Environment
	private environment: Environment

	//Helpers
	private delta = 0
	private clock: THREE.Clock
	private frame = 0 // Frame counter
	private speed = 1

	// Flags
	private isRocketLaunched = false
	private isClockStarted = false

	// Loadings
	private loadingStatus = {
		isRocketLoaded: false,
		isSunLoaded: false,
		isEarthLoaded: false,
		isSkyLoaded: false,
		isScriptLoaded: false,
	}

	// Dev mode
	private metrics?: Metrics

	constructor(props: SceneProps = {}) {
		this.loadingLoop()

		this.updateResolution()

		this.setup()

		// Earth, Stars, Sun, etc.
		this.addEnvironment()

		this.addActors()

		if (props.metrics) {
			this.metrics = new Metrics(this.TWorld, this.cannon.world, props.metrics)
		}
		// Event listeners
		this.bindEvents()

		this.loadingStatus.isScriptLoaded = true
	}

	private loadingLoop() {
		const loop = setInterval(() => {
			if (areObjectValuesTrue(this.loadingStatus)) {
				this.start()
				clearInterval(loop)
			}
		}, 10)
	}

	private setLoadingStatus(model: TypeLoadInstance) {
		this.loadingStatus[model] = true
	}

	private setup() {
		this.setupTWorld()

		this.cannon = new Cannon()
		this.setupRenderer()
		this.setupCameras()
		this.setupControls()
	}

	private addActors() {
		this.rocket = new FalconHeavy(this.TWorld, () =>
			this.setLoadingStatus('isRocketLoaded')
		)

		new Base(this.TWorld, this.cannon.world)
	}

	private addEnvironment() {
		this.environment = new Environment(
			this.TWorld,
			this.cannon.world,
			() => this.setLoadingStatus('isSunLoaded'),
			() => this.setLoadingStatus('isEarthLoaded'),
			() => this.setLoadingStatus('isSkyLoaded')
		)
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
		this.camera = new Camera(
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

	// Player controls
	private setupControls() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.controls.minDistance = 30
		this.controls.maxDistance = 300
	}

	private setupRenderer() {
		this.renderer = new THREE.WebGLRenderer({ antialias: true })
		this.renderer.shadowMap.enabled = true
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

		this.renderer.autoClear = false
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
				this.cannon.world.addBody(this.rocket.body)
			}
		})

		document
			.getElementById('Booster1Calibration')
			?.addEventListener('click', () => {
				this.rocket.mainBooster1.calibrateForLanding()
			})

		document
			.getElementById('Booster2Calibration')
			?.addEventListener('click', () => {
				this.rocket.mainBooster2.calibrateForLanding()
			})

		document
			.getElementById('Booster3Calibration')
			?.addEventListener('click', () => {
				this.rocket.mainBooster3.calibrateForLanding()
			})

		document.getElementById('Rocket')?.addEventListener('click', () => {
			this.camera.follow('Rocket', this.rocket.model.position.clone())
		})

		document.getElementById('MainBooster1')?.addEventListener('click', () => {
			this.camera.follow(
				'MainBooster1',
				this.rocket.mainBooster1.model.position.clone()
			)
		})

		document.getElementById('MainBooster2')?.addEventListener('click', () => {
			this.camera.follow(
				'MainBooster2',
				this.rocket.mainBooster2.model.position.clone()
			)
		})

		document.getElementById('MainBooster3')?.addEventListener('click', () => {
			this.camera.follow(
				'MainBooster3',
				this.rocket.mainBooster3.model.position.clone()
			)
		})

		document.getElementById('stage2')?.addEventListener('click', () => {
			this.rocket.startSecondStage(this.cannon.world, this.TWorld)
		})

		document.getElementById('stage3')?.addEventListener('click', () => {
			this.rocket.startThirdStage(this.cannon.world, this.TWorld)
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

	private frameLogic(delta: number) {
		this.frame++

		const { xDiff, yDiff, zDiff, target } = this.rocket.animate(
			this.controls,
			this.camera.target,
			delta
		)

		this.camera.animate(xDiff, yDiff, zDiff, target)

		this.environment.animate(
			this.rocket.model.position,
			this.camera.position.y,
			this.frame
		)
		this.cannon.animate(delta, this.frame)
	}

	private animate() {
		this.delta += this.clock.getDelta()

		if (this.delta > FPS_LIMIT) {
			if (this.metrics && this.rocket.model) {
				this.metrics.update(this.rocket.model)
			}
			// The draw or time dependent code are here
			this.controls.update()

			for (let i = 0; i < this.speed; i++) {
				this.frameLogic(this.delta)
			}

			this.delta = this.delta % FPS_LIMIT
			this.render()
		}

		requestAnimationFrame(() => this.animate())
	}

	private render() {
		this.renderer.render(this.TWorld, this.camera)
	}
}
