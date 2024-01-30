import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FalconHeavy } from '../actors'
import { Metrics, MetricsParams } from './metrics.instance'
import { Clock } from './clock.instance'

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
	isClockStarted = false

	// Dev mode
	metrics?: Metrics

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

	addEnvironment() {
		this.addSkybox()
		// this.addGround()
		this.addEarth()
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

		let skyboxGeo = new THREE.BoxGeometry(30000000, 30000000, 30000000)
		let skybox = new THREE.Mesh(skyboxGeo, materialArray)

		this.TWorld.add(skybox)
	}

	addEarth() {
		var geometry = new THREE.SphereGeometry(100000000, 500, 500)
		// var material = new THREE.MeshPhongMaterial()
		const materialNormalMap = new THREE.MeshPhongMaterial({
			specular: 0x7c7c7c,
			shininess: 15,
			map: textureLoader.load('textures/earth/earthmap1k.jpg'),
			specularMap: textureLoader.load('textures/earth/earth_specular_2048.jpg'),
			normalMap: textureLoader.load('textures/earth/earth_normal_2048.jpg'),

			// y scale is negated to compensate for normal map handedness.
			normalScale: new THREE.Vector2(0.85, -0.85),
		})

		if (materialNormalMap.map) {
			materialNormalMap.map.colorSpace = THREE.SRGBColorSpace
		}

		var earthmesh = new THREE.Mesh(geometry, materialNormalMap)
		earthmesh.rotation.x = Math.PI / 4
		earthmesh.rotation.y = -50
		earthmesh.position.y = -100000000
		this.TWorld.add(earthmesh)

		const materialClouds = new THREE.MeshLambertMaterial({
			map: textureLoader.load('textures/earth/earth_clouds_2048.png'),
			transparent: true,
		})
		if (materialClouds.map) materialClouds.map.colorSpace = THREE.SRGBColorSpace

		const meshClouds = new THREE.Mesh(geometry, materialClouds)
		meshClouds.scale.set(1.0035, 1.0035, 1.0035)
		meshClouds.rotation.z = 0.41
		meshClouds.position.y = -100000000
		this.TWorld.add(meshClouds)
	}

	start() {
		document.body.appendChild(this.renderer.domElement)
		this.animate()
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
		this.camera = new THREE.PerspectiveCamera(
			75,
			this.w / this.h,
			0.1,
			30000000
		)
		this.camera.position.z = 600
		this.camera.position.y = 300

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

		const delta = this.clock.getDelta()
		this.rocket.animate(this.camera, this.controls)
		this.animateCWorld(delta)
		this.controls.update()
		this.render()

		requestAnimationFrame(() => this.animate())
	}

	render() {
		this.renderer.render(this.TWorld, this.camera)
	}
}
