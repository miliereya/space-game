import * as THREE from 'three'
import { BRAKE_POSITION } from '../constants'

type TypeSide = 1 | 2 | 3 | 4

export class Brake {
	// Properties
	private side: TypeSide
	isAnimating = false
	isActive = false

	// Animation
	mixer: THREE.AnimationMixer
	animationOn: THREE.AnimationAction
	animationOff: THREE.AnimationAction

	constructor(side: TypeSide) {
		this.side = side
	}

	addModel(
		model: THREE.Mesh,
		parent: THREE.Mesh,
		onClip: THREE.AnimationClip,
		offClip: THREE.AnimationClip
	) {
		model.castShadow = true
		const transferWorld = new THREE.Object3D()
		transferWorld.add(model)
		parent.add(transferWorld)

		switch (this.side) {
			case 1:
				transferWorld.position.x = BRAKE_POSITION.x
				transferWorld.position.y = BRAKE_POSITION.y
				transferWorld.position.z = BRAKE_POSITION.z
				break
			case 2:
				transferWorld.position.x = BRAKE_POSITION.x
				transferWorld.position.y = BRAKE_POSITION.y
				transferWorld.position.z = -BRAKE_POSITION.z
				transferWorld.rotation.y = -Math.PI / 2

				break
			case 3:
				transferWorld.position.x = -BRAKE_POSITION.x
				transferWorld.position.y = BRAKE_POSITION.y
				transferWorld.position.z = BRAKE_POSITION.z
				transferWorld.rotation.y = Math.PI / 2
				break
			case 4:
				transferWorld.position.x = -BRAKE_POSITION.x
				transferWorld.position.y = BRAKE_POSITION.y
				transferWorld.position.z = -BRAKE_POSITION.z
				transferWorld.rotation.y = Math.PI
				break
		}
		this.mixer = new THREE.AnimationMixer(model)

		this.animationOn = this.mixer.clipAction(onClip)
		this.animationOn.setLoop(THREE.LoopOnce, 1)
		this.animationOn.clampWhenFinished = true

		this.animationOff = this.mixer.clipAction(offClip)
		this.animationOff.setLoop(THREE.LoopOnce, 1)
		this.animationOff.clampWhenFinished = true

		this.off()
	}

	on() {
		if (this.isAnimating && this.isActive) return
		this.isAnimating = true
		this.isActive = true
		setTimeout(() => {
			this.isAnimating = false
		}, 0.5)
		this.animationOff.stop()
		this.animationOn.play()
	}

	off() {
		if (this.isAnimating) {
			setTimeout(() => {
				this.isAnimating = true
				setTimeout(() => {
					this.isActive = false
					this.isAnimating = false
				}, 0.5)
				this.animationOn.stop()
				this.animationOff.play()
			}, 0.5)
		} else {
			this.isAnimating = true
			setTimeout(() => {
				this.isActive = false
				this.isAnimating = false
			}, 0.5)
			this.animationOn.stop()
			this.animationOff.play()
		}
	}

	animate(delta: number) {
		if (this.mixer) this.mixer.update(delta)
	}
}
