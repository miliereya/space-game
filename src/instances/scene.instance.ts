import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FalconHeavy } from '../actors'
import { Metrics, MetricsParams } from './metrics.instance'
import { Clock } from './clock.instance'
import { Environment } from './environment.instance'

interface SceneProps {
	metrics?: MetricsParams | null
}

export class Scene {
	// Resolution
	private w: number
	private h: number

	// Worlds
	private TWorld: THREE.Scene
	private CWorld: CANNON.World

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
	private frame = 0

	// Flags
	private isRocketLaunched = false
	private isClockStarted = false

	// Dev mode
	private metrics?: Metrics

	constructor(props: SceneProps = {}) {
		this.updateResolution()

		this.setup()

		this.addEnvironment()

		this.addActors()

		if (props.metrics) {
			this.metrics = new Metrics(this.TWorld, this.CWorld, props.metrics)
		}

		this.bindEvents()

		this.start()
	}

	setup() {
		this.setupTWorld()
		this.setupСWorld()
		this.setupRenderer()
		this.setupCameras()
		this.setupControls()
		this.setupLights()
	}

	addActors() {
		this.rocket = new FalconHeavy(this.TWorld)
	}

	addEnvironment() {
		this.environment = new Environment(this.TWorld, this.CWorld)
	}

	start() {
		document.body.appendChild(this.renderer.domElement)
		this.animate()
	}

	bindEvents() {
		this.bindResizeEvent()
		this.bindControlPanelEvents()
	}

	updateResolution() {
		this.w = window.innerWidth
		this.h = window.innerHeight
	}

	setupTWorld() {
		this.TWorld = new THREE.Scene()
		this.clock = new THREE.Clock()
	}

	setupСWorld() {
		this.CWorld = new CANNON.World()
		this.CWorld.gravity.set(0, -9.82, 0)
		;(this.CWorld.solver as CANNON.GSSolver).iterations = 5
	}

	setupCameras() {
		this.camera = new THREE.PerspectiveCamera(
			75,
			this.w / this.h,
			0.1,
			180000000
		)
		this.camera.position.z = 600
		this.camera.position.y = 300

		this.TWorld.add(this.camera)
	}

	setupLights() {
		// this.TWorld.add(new THREE.AmbientLight('', 3))
	}

	setupControls() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.controls.minDistance = 30
		this.controls.maxDistance = 300
	}

	setupRenderer() {
		this.renderer = new THREE.WebGLRenderer()
		this.renderer.shadowMap.enabled = true

		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
		this.renderer.setSize(this.w, this.h)
	}

	bindControlPanelEvents() {
		document.getElementById('on')?.addEventListener('click', () => {
			this.rocket.turnOnAllFirstStageBoosters()

			if (!this.isClockStarted) {
				this.isClockStarted = true
				new Clock()
			}
			if (!this.isRocketLaunched) {
				this.isRocketLaunched = true
				this.CWorld.addBody(this.rocket.body)
			}
		})

		document.getElementById('stage2')?.addEventListener('click', () => {
			this.rocket.startSecondStage(this.CWorld)
		})

		document.getElementById('stage3')?.addEventListener('click', () => {
			this.rocket.startThirdStage(this.CWorld)
		})

		document
			.getElementById('off')
			?.addEventListener('click', () =>
				this.rocket.turnOffAllFirstStageBoosters()
			)
	}

	bindResizeEvent() {
		window.addEventListener('resize', () => {
			this.updateResolution()

			this.camera.aspect = this.w / this.h
			this.camera.updateProjectionMatrix()

			this.renderer.setSize(this.w, this.h)
			this.render()
		})
	}

	animateCWorld(delta: number) {
		this.CWorld.step(delta)
		if (this.rocket.body.position.y > 1000) {
			this.CWorld.gravity.set(0, -5.82, 0)
		} else {
			this.CWorld.gravity.set(0, -9.82, 0)
		}
	}

	animate() {
		if (this.metrics && this.rocket.model) {
			this.metrics.update(this.rocket.model)
		}
		this.frame++
		const delta = this.clock.getDelta()

		if (this.rocket.model) {
			this.rocket.animate(this.camera, this.controls)

			this.environment.animate(
				this.rocket.model.position,
				this.camera.position.y,
				this.frame
			)
		}

		this.animateCWorld(delta)
		this.controls.update()
		this.render()

		requestAnimationFrame(() => this.animate())
	}

	render() {
		this.renderer.render(this.TWorld, this.camera)
	}
}
