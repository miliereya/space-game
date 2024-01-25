export class RocketBooster {
	isActive = false
	fuel: number
	fuelMax: number
	power: number

	constructor(fuel: number, power: number) {
		this.fuel = fuel
		this.fuelMax = fuel
		this.power = power
	}

	burn(): number {
		if (this.fuel) {
			this.fuel -= 1
			return this.power
		} else {
			this.isActive = false
			return 0
		}
	}

	on() {
		if (this.fuel) {
			this.isActive = true
		}
	}

	off() {
		this.isActive = false
	}
}
