// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// export function loadGLTF(path: string) {
// 	new GLTFLoader.load(
// 		'models/test.glb',
// 		function (gltf) {
// 			scene.add(gltf.scene)
// 			rocketModel = gltf.scene.children[0] as THREE.Mesh
// 			rocketModel.scale.set(0.18, 0.18, 0.18)
// 			rocketModel.position.set(0, 27.669, 0)

// 			rocketModel.updateMatrix()

// 			rocketBody.position.x = rocketModel.position.x
// 			rocketBody.position.y = rocketModel.position.y
// 			rocketBody.position.z = rocketModel.position.z

// 			rocketBody.quaternion.set(
// 				rocketModel.quaternion.x,
// 				rocketModel.quaternion.y,
// 				rocketModel.quaternion.z,
// 				rocketModel.quaternion.w
// 			)

// 			mixer = new THREE.AnimationMixer(gltf.scene)
// 			const launch = THREE.AnimationClip.findByName(gltf.animations, 'Launch')
// 			THREE.AnimationUtils.makeClipAdditive(launch)
// 			// setTimeout(() => {
// 			// 	rocket.children[0].children[0].children[0].removeFromParent()
// 			// }, 500)
// 			// const action = mixer.clipAction(launch)
// 			// action.setLoop(THREE.LoopOnce, 1)
// 			// action.play()
// 		},
// 		(xhr) => {
// 			console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
// 		},
// 		(error) => {
// 			console.log(error)
// 		}
// 	)
// }
