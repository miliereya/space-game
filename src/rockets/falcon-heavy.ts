import { Vector3 } from 'three'
import { Rocket, RocketBooster } from '../instances'
import { gravityValue } from '../config'

const FalconHeavyProps = {
	weight: 1450,
	stageFirst: {
		booster: { fuel: 10000, power: 3 },
		maxSpeed: 3000,
	},
}

type FalconStage = 1 | 2 | 3 | 4

export class FalconHeavy extends Rocket {
	stage: FalconStage = 1
	acceleration = 0
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
		this.stageFirst.booster_2.on()
		this.stageFirst.booster_3.on()
	}

	turnOffAllFirstStageBoosters() {
		this.stageFirst.booster_1.off()
		this.stageFirst.booster_2.off()
		this.stageFirst.booster_3.off()
	}

	accelerate(position: Vector3) {
		let acceleration = 0

		if (this.stage === 1) {
			const { booster_1, booster_2, booster_3 } = this.stageFirst

			if (booster_1.isActive) {
				acceleration += booster_1.burn()
			}

			if (booster_2.isActive) {
				acceleration += booster_2.burn()
			}

			if (booster_3.isActive) {
				acceleration += booster_3.burn()
			}
		}
		this.acceleration +=
			this.acceleration > 0
				? acceleration *
				  ((FalconHeavyProps.stageFirst.maxSpeed - this.acceleration) /
						FalconHeavyProps.stageFirst.maxSpeed)
				: acceleration
		this.acceleration -= gravityValue
		if (position.y < 40) {
			position.y = 40
			this.acceleration = 0
		} else {
			position.y += this.acceleration / 2000
		}
		console.log(this.acceleration)
	}

	disconnectBoosters() {}
}
