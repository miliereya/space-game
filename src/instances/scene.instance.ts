import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FalconHeavy } from './actors'
import { Metrics, MetricsParams } from './metrics.instance'

const textureLoader = new THREE.TextureLoader()

interface SceneProps {
	metrics?: MetricsParams | null
}

export class Scene {
	// Resolution
	w: number
	h: number

	// Worlds
	TWorld: THREE.Scene
	CWorld: CANNON.World

	// Camera
	camera: THREE.PerspectiveCamera
	controls: OrbitControls

	renderer: THREE.WebGLRenderer

	// Actors
	rocket: FalconHeavy

	//Helpers
	clock: THREE.Clock

	// Flags
	isRocketLaunched = false

	// Dev mode
	metrics?: Metrics

	constructor(props: SceneProps = {}) {
		this.updateResolution()

		this.setup()
		this.addSkybox()
		this.addGround()
		this.addActors()
		if (props.metrics) {
			this.metrics = new Metrics(this.TWorld, this.CWorld, props.metrics)
		}

		this.bindEvents()

		this.start()
		this.animate()
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

	addSkybox() {
		const materialArray: THREE.MeshBasicMaterial[] = [
			new THREE.MeshBasicMaterial({
				map: textureLoader.load('models/sky/bluecloud_ft.jpg'),
			}),
			new THREE.MeshBasicMaterial({
				map: textureLoader.load('models/sky/bluecloud_bk.jpg'),
			}),
			new THREE.MeshBasicMaterial({
				map: textureLoader.load('models/sky/bluecloud_up.jpg'),
			}),
			new THREE.MeshBasicMaterial({
				map: textureLoader.load('models/sky/bluecloud_dn.jpg'),
			}),
			new THREE.MeshBasicMaterial({
				map: textureLoader.load('models/sky/bluecloud_rt.jpg'),
			}),
			new THREE.MeshBasicMaterial({
				map: textureLoader.load('models/sky/bluecloud_lf.jpg'),
			}),
		]

		for (let i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide

		let skyboxGeo = new THREE.BoxGeometry(300000, 300000, 300000)
		let skybox = new THREE.Mesh(skyboxGeo, materialArray)

		this.TWorld.add(skybox)
	}

	start() {
		document.body.appendChild(this.renderer.domElement)
	}

	addGround() {
		const geo = new THREE.PlaneGeometry(300000, 300000, 8, 8)

		const plane = new THREE.Mesh(geo)

		textureLoader.load('models/brown_mud_leaves_01_diff_2k.jpg', (texture) => {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping
			texture.offset.set(0, 0)
			texture.repeat.set(1000, 1000)
			plane.material = new THREE.MeshBasicMaterial({
				map: texture,
				side: THREE.DoubleSide,
			})

			plane.position.y = -2

			plane.rotateX(Math.PI / 2)

			this.TWorld.add(plane)
		})

		const planeShape = new CANNON.Plane()
		const planeBody = new CANNON.Body({ mass: 0 })
		planeBody.addShape(planeShape)
		planeBody.quaternion.setFromAxisAngle(
			new CANNON.Vec3(1, 0, 0),
			-Math.PI / 2
		)
		this.CWorld.addBody(planeBody)
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
		this.camera = new THREE.PerspectiveCamera(75, this.w / this.h, 0.1, 300000)
		this.camera.position.z = 55
		this.camera.position.y = 42

		this.TWorld.add(this.camera)
	}

	setupLights() {
		this.TWorld.add(new THREE.AmbientLight('', 3))
	}

	setupControls() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.controls.minDistance = 30
		this.controls.maxDistance = 300
	}

	setupRenderer() {
		this.renderer = new THREE.WebGLRenderer()
		this.renderer.shadowMap.enabled = true
		this.renderer.setSize(this.w, this.h)
	}

	bindControlPanelEvents() {
		document.getElementById('on')?.addEventListener('click', () => {
			this.rocket.turnOnAllFirstStageBoosters()
			if (!this.isRocketLaunched) {
				this.isRocketLaunched = true
				this.CWorld.addBody(this.rocket.body)
			}
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

	animate() {
		if (this.metrics && this.rocket.model) {
			this.metrics.update(this.rocket.model)
		}

		const delta = this.clock.getDelta()
		this.rocket.animate(this.camera, this.controls)
		this.CWorld.step(delta)
		this.controls.update()
		this.render()

		requestAnimationFrame(() => this.animate())
	}

	render() {
		this.renderer.render(this.TWorld, this.camera)
	}
}
