import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { applyGravity } from '../utils'
import { FalconHeavy } from '../rockets'

const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))
scene.background = new THREE.Color(0xff0fff)

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

const geo = new THREE.PlaneGeometry(5000, 5000, 8, 8)
const mat = new THREE.MeshBasicMaterial({
	color: 0xfffff0,
	side: THREE.DoubleSide,
})
const plane = new THREE.Mesh(geo, mat)

plane.rotateX(Math.PI / 2)

scene.add(plane)

const loader = new GLTFLoader()
loader.load(
	'models/spacex_falcon_heavy.glb',
	function (gltf) {
		gltf.scene.children[0].scale.set(0.18, 0.18, 0.18)
		gltf.scene.children[0].position.set(0.0, 40, 0)
		scene.add(gltf.scene)
		rocketModel = gltf.scene.children[0] as THREE.Mesh
		mixer = new THREE.AnimationMixer(gltf.scene)
		console.log(mixer)
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
stageOneBoostersOn.addEventListener(
	'click',
	() => rocket.turnOnAllFirstStageBoosters()
)

const stageOneBoostersOff = document.createElement('button')
stageOneBoostersOff.id = 'button_2'
stageOneBoostersOff.innerHTML = 'OFF'
stageOneBoostersOff.addEventListener(
	'click',
	() => rocket.turnOffAllFirstStageBoosters()
)

buttonsWrapper.appendChild(stageOneBoostersOn)
buttonsWrapper.appendChild(stageOneBoostersOff)

document.body.appendChild(buttonsWrapper)
document.body.appendChild(stats.dom)
document.body.appendChild(rocketStats)

const clock = new THREE.Clock()

function animate() {
	const rocketStatsDiv = document.getElementById('stats')
	if (rocketStatsDiv && rocketModel)
		rocketStatsDiv.innerHTML = `Rocket X: ${Math.round(
			rocketModel.position.x
		)} Rocket Y: ${Math.round(rocketModel.position.y)} Rocket Z: ${Math.round(
			rocketModel.position.z
		)}`
	if (mixer) {
		mixer.update(clock.getDelta())
	}
	if (rocketModel) {
		rocket.accelerate(rocketModel.position)
		camera.position.y = rocketModel.position.y
		camera.lookAt(rocketModel.getWorldPosition(controls.target))

		controls.update()
		// direction.subVectors(camera.position, controls.target)
		// // direction.normalize().multiplyScalar(10)
		// camera.position.copy(direction.add(controls.target))
	} else {
		controls.update()
	}
	requestAnimationFrame(animate)
	render()

	stats.update()
}

function render() {
	renderer.render(scene, camera)
}

animate()
