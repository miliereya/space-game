import { Rocket, RocketBooster } from '../instances'
import { gravityValue } from '../config'

const FalconHeavyProps = {
	weight: 1450,
	stageFirst: {
		booster: { fuel: 10000, power: 3 },
		maxSpeed: 10000,
	},
}

type FalconStage = 1 | 2 | 3 | 4

export class FalconHeavy extends Rocket {
	stage: FalconStage = 1
	acceleration = 0
	rotation = 0
	stageFirst = {
		booster_1: new RocketBooster(
			FalconHeavyProps.stageFirst.booster.fuel,
			FalconHeavyProps.stageFirst.booster.power
		),
		booster_2: new RocketBooster(
			FalconHeavyProps.stageFirst.booster.fuel,
			FalconHeavyProps.stageFirst.booster.power
		),
		booster_3: new RocketBooster(
			FalconHeavyProps.stageFirst.booster.fuel,
			FalconHeavyProps.stageFirst.booster.power
		),
	}

	constructor() {
		super(1450)
	}

	turnOnAllFirstStageBoosters() {
		this.stageFirst.booster_1.on()
		// this.stageFirst.booster_2.on()
		this.stageFirst.booster_3.on()
	}

	turnOffAllFirstStageBoosters() {
		this.stageFirst.booster_1.off()
		this.stageFirst.booster_2.off()
		this.stageFirst.booster_3.off()
	}

	accelerate(
		model: THREE.Mesh<
			THREE.BufferGeometry<THREE.NormalBufferAttributes>,
			THREE.Material | THREE.Material[],
			THREE.Object3DEventMap
		>
	) {
		const { position } = model

		let acceleration = 0
		let rotation = 0

		if (this.stage === 1) {
			const { booster_1, booster_2, booster_3 } = this.stageFirst

			if (booster_2.isActive) {
				const power = booster_1.burn()
				acceleration += power
			}

			if (booster_1.isActive) {
				const power = booster_1.burn()
				acceleration += power
				rotation += booster_2.isActive ? 0.00003 : 0.0001
			}

			if (booster_3.isActive) {
				const power = booster_1.burn()
				acceleration += power
				// rotation -= booster_2.isActive ? 0.00003 : 0.0001
			}
		}
		this.acceleration +=
			this.acceleration > 0
				? acceleration *
				  ((FalconHeavyProps.stageFirst.maxSpeed - this.acceleration) /
						FalconHeavyProps.stageFirst.maxSpeed)
				: acceleration
		this.acceleration -= gravityValue

		if (position.y > 40 && rotation) {
			this.rotation +=
				this.rotation > 0 ? (rotation * this.rotation) / 0.01 : rotation
			model.rotateY(this.rotation)
		}

		if (position.y < 40) {
			position.y = 40
			this.acceleration = 0
		} else {
			position.y += this.acceleration / 2000
		}

		return this.acceleration / 2000
	}

	disconnectBoosters() {}
}
