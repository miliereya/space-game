import * as THREE from 'three'
import { SIDESTEP_POSITION } from '../constants'

type TypeSide = 1 | 2 | 3 | 4

export class SideStep {
	// Properties
	private side: TypeSide

	// Animation
	mixer: THREE.AnimationMixer
	animationOn: THREE.AnimationAction

	constructor(side: TypeSide) {
		this.side = side
	}

	addModel(model: THREE.Mesh, parent: THREE.Mesh, onClip: THREE.AnimationClip) {
		model.castShadow = true
		const transferWorld = new THREE.Mesh()
		transferWorld.add(model)
		parent.add(transferWorld)

		switch (this.side) {
			case 1:
				transferWorld.position.x = SIDESTEP_POSITION.x
				transferWorld.position.y = SIDESTEP_POSITION.y
				transferWorld.position.z = SIDESTEP_POSITION.z
				break
			case 2:
				transferWorld.position.x = SIDESTEP_POSITION.x
				transferWorld.position.y = SIDESTEP_POSITION.y
				transferWorld.position.z = -SIDESTEP_POSITION.z
				transferWorld.rotation.y = -Math.PI / 2

				break
			case 3:
				transferWorld.position.x = -SIDESTEP_POSITION.x
				transferWorld.position.y = SIDESTEP_POSITION.y
				transferWorld.position.z = SIDESTEP_POSITION.z
				transferWorld.rotation.y = Math.PI / 2
				break
			case 4:
				transferWorld.position.x = -SIDESTEP_POSITION.x
				transferWorld.position.y = SIDESTEP_POSITION.y
				transferWorld.position.z = -SIDESTEP_POSITION.z
				transferWorld.rotation.y = Math.PI
				break
		}
		this.mixer = new THREE.AnimationMixer(model)

		this.animationOn = this.mixer.clipAction(onClip)
		this.animationOn.setLoop(THREE.LoopOnce, 1)
		this.animationOn.clampWhenFinished = true

        // this.on()
	}

	on() {
		this.animationOn.play()
	}

	animate(delta: number) {
		if (this.mixer) this.mixer.update(delta)
	}
}
