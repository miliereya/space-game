import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FalconHeavy } from '../rockets'
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'

const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5000))
scene.background = new THREE.Color(0xff0fff)

const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)

const planeShape = new CANNON.Plane()
const planeBody = new CANNON.Body({ mass: 0 })
planeBody.addShape(planeShape)
planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
world.addBody(planeBody)

scene.add(new THREE.AmbientLight('', 3))

const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
)
camera.position.z = 55
camera.position.y = 42

let mixer: THREE.AnimationMixer
let rocketModel: THREE.Mesh

const rocket = new FalconHeavy()

const geo = new THREE.PlaneGeometry(500, 500, 8, 8)
const mat = new THREE.MeshBasicMaterial({
	color: 0xfffff0,
	side: THREE.DoubleSide,
})
const plane = new THREE.Mesh(geo, mat)

plane.rotateX(Math.PI / 2)

scene.add(plane)

const rocketShape = new CANNON.Cylinder(2, 2, 40)
const rocketBody = new CANNON.Body({ mass: 1, shape: rocketShape })

const loader = new GLTFLoader()
loader.load(
	'models/spacex_falcon_heavy.glb',
	function (gltf) {
		scene.add(gltf.scene)
		rocketModel = gltf.scene.children[0] as THREE.Mesh
		rocketModel.scale.set(0.18, 0.18, 0.18)
		rocketModel.position.set(0.0, 40, 0)

		rocketModel.quaternion

		rocketModel.updateMatrix()

		rocketBody.position.x = rocketModel.position.x
		rocketBody.position.y = rocketModel.position.y
		rocketBody.position.z = rocketModel.position.z
		world.addBody(rocketBody)

		mixer = new THREE.AnimationMixer(gltf.scene)
		const launch = THREE.AnimationClip.findByName(gltf.animations, 'Launch')
		THREE.AnimationUtils.makeClipAdditive(launch)
		// setTimeout(() => {
		// 	rocket.children[0].children[0].children[0].removeFromParent()
		// }, 500)
		// const action = mixer.clipAction(launch)
		// action.setLoop(THREE.LoopOnce, 1)
		// action.play()
	},
	(xhr) => {
		console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
	},
	(error) => {
		console.log(error)
	}
)

const renderer = new THREE.WebGLRenderer()
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.minDistance = 30
controls.maxDistance = 300

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
	render()
}

const stats = new Stats()
const rocketStats = document.createElement('div')
const buttonsWrapper = document.createElement('div')
rocketStats.id = 'stats'
buttonsWrapper.id = 'buttons_wrapper'

const stageOneBoostersOn = document.createElement('button')
stageOneBoostersOn.id = 'button_1'
stageOneBoostersOn.innerHTML = 'ON'
stageOneBoostersOn.addEventListener('click', () =>
	rocket.turnOnAllFirstStageBoosters()
)

const stageOneBoostersOff = document.createElement('button')
stageOneBoostersOff.id = 'button_2'
stageOneBoostersOff.innerHTML = 'OFF'
stageOneBoostersOff.addEventListener('click', () =>
	rocket.turnOffAllFirstStageBoosters()
)

buttonsWrapper.appendChild(stageOneBoostersOn)
buttonsWrapper.appendChild(stageOneBoostersOff)

document.body.appendChild(buttonsWrapper)
document.body.appendChild(stats.dom)
document.body.appendChild(rocketStats)

const clock = new THREE.Clock()
let delta

const cannonDebugger = CannonDebugger(scene, world, {
	color: 0xff0000,
})

function logic() {
	cannonDebugger.update()
	const rocketStatsDiv = document.getElementById('stats')
	if (rocketStatsDiv && rocketModel)
		rocketStatsDiv.innerHTML = `Rocket X: ${Math.round(
			rocketModel.position.x
		)} Rocket Y: ${Math.round(rocketModel.position.y)} Rocket Z: ${Math.round(
			rocketModel.position.z
		)}`
	delta = Math.min(clock.getDelta(), 0.1)
	world.step(delta)
	if (mixer) {
		mixer.update(clock.getDelta())
	}
	if (rocketModel) {
		rocketModel.position.set(
			rocketBody.position.x,
			rocketBody.position.y,
			rocketBody.position.z
		)
		rocketModel.quaternion.set(
			rocketBody.quaternion.x,
			rocketBody.quaternion.y,
			rocketBody.quaternion.z,
			rocketBody.quaternion.w
		)
		// const rocketAcceleration = rocket.accelerate(rocketModel)
		// camera.lookAt(rocketModel.getWorldPosition(controls.target))
		// if (rocketAcceleration > 1 || rocketAcceleration < 1)
		// 	camera.position.y += rocketAcceleration
		controls.update()
		// direction.subVectors(camera.position, controls.target)
		// // direction.normalize().multiplyScalar(10)
		// camera.position.copy(direction.add(controls.target))
	} else {
		controls.update()
	}
	stats.update()
}

let deltaFps = 20
let interval = 1 / 60

function animate() {
	deltaFps += clock.getDelta()
	if (deltaFps > interval) {
		logic()

		deltaFps = deltaFps % interval
	}
	requestAnimationFrame(animate)
	render()
}

function render() {
	renderer.render(scene, camera)
}

animate()
