import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FalconHeavy } from '../rockets'
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'

const loader = new GLTFLoader()

const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5000))

// new THREE.TextureLoader().load('models/Sky-058.jpg', (texture) => {
// 	console.log(texture)
// 	// scene.background = texture
// })

let materialArray = []
let texture_ft = new THREE.TextureLoader().load('models/bluecloud_ft.jpg')
let texture_bk = new THREE.TextureLoader().load('models/bluecloud_bk.jpg')
let texture_up = new THREE.TextureLoader().load('models/bluecloud_up.jpg')
let texture_dn = new THREE.TextureLoader().load('models/bluecloud_dn.jpg')
let texture_rt = new THREE.TextureLoader().load('models/bluecloud_rt.jpg')
let texture_lf = new THREE.TextureLoader().load('models/bluecloud_lf.jpg')

materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }))
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }))
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }))
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }))
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }))
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }))

for (let i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide
let skyboxGeo = new THREE.BoxGeometry(20000, 20000, 20000)
let skybox = new THREE.Mesh(skyboxGeo, materialArray)
scene.add(skybox)

const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)
;(world.solver as CANNON.GSSolver).iterations = 5

const geo = new THREE.PlaneGeometry(11000, 11000, 8, 8)

const plane = new THREE.Mesh(geo)
new THREE.TextureLoader().load(
	'models/brown_mud_leaves_01_diff_2k.jpg',
	(texture) => {
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping
		texture.offset.set(0, 0)
		texture.repeat.set(1000, 1000)
		plane.material = new THREE.MeshBasicMaterial({
			map: texture,
			side: THREE.DoubleSide,
		})
	}
)

plane.position.y = -2

plane.rotateX(Math.PI / 2)

scene.add(plane)

const planeShape = new CANNON.Plane()
const planeBody = new CANNON.Body({ mass: 0 })
planeBody.addShape(planeShape)
planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
world.addBody(planeBody)

// assuming you want the texture to repeat in both directions:

// how many times to repeat in each direction; the default is (1,1),
//   which is probably why your example wasn't working

scene.add(new THREE.AmbientLight('', 3))

loader.load(
	'models/launch-zone.glb',
	function (gltf) {
		scene.add(gltf.scene)
	},
	(xhr) => {
		console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
	},
	(error) => {
		console.log(error)
	}
)

const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	20000
)
camera.position.z = 55
camera.position.y = 42

let mixer: THREE.AnimationMixer
let rocketModel: THREE.Mesh

const rocket = new FalconHeavy()

const rocketShape = new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 26.7))
const boosterShape = new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 16.7))

const rocketBody = new CANNON.Body({ mass: 1 })
rocketBody.addShape(rocketShape, new CANNON.Vec3(0, 0, 0))
rocketBody.addShape(boosterShape, new CANNON.Vec3(3, 0, -10))
rocketBody.addShape(boosterShape, new CANNON.Vec3(-3, 0, -10))

loader.load(
	'models/test.glb',
	function (gltf) {
		scene.add(gltf.scene)
		rocketModel = gltf.scene.children[0] as THREE.Mesh
		rocketModel.scale.set(0.18, 0.18, 0.18)
		rocketModel.position.set(0, 27.669, 0)

		rocketModel.updateMatrix()

		rocketBody.position.x = rocketModel.position.x
		rocketBody.position.y = rocketModel.position.y
		rocketBody.position.z = rocketModel.position.z

		rocketBody.quaternion.set(
			rocketModel.quaternion.x,
			rocketModel.quaternion.y,
			rocketModel.quaternion.z,
			rocketModel.quaternion.w
		)

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
stageOneBoostersOn.addEventListener('click', () => {
	rocket.turnOnAllFirstStageBoosters()
	world.addBody(rocketBody)
})

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

// let deltaFps = 0
// let interval = 1 / 30

const cannonDebugger = CannonDebugger(scene, world, {
	color: 0xff0000,
})

function animate() {
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
		const impulse = rocket.accelerate()
		rocketBody.applyLocalImpulse(impulse)
		rocketModel.position.set(
			rocketBody.position.x,
			rocketBody.position.y,
			rocketBody.position.z
		)
		camera.position.y = rocketBody.position.y
		rocketModel.quaternion.set(
			rocketBody.quaternion.x,
			rocketBody.quaternion.y,
			rocketBody.quaternion.z,
			rocketBody.quaternion.w
		)
		// const rocketAcceleration = rocket.accelerate(rocketModel)
		camera.lookAt(rocketModel.getWorldPosition(controls.target))
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

	requestAnimationFrame(animate)
	render()
}

function render() {
	renderer.render(scene, camera)
}

animate()
