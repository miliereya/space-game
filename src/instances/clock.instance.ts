// Simple clock
export class Clock {
	minute = 0
	second = 0

	constructor() {
		this.work()
		setInterval(() => this.work(), 100)
	}

	work() {
		this.output()
		this.tick()
	}

	tick() {
		this.second++
		if (this.second == 60) {
			this.minute++
			this.second = 0
		}
	}

	output() {
		const clock = document.getElementById('time')
		if (clock) {
			let minString = String(this.minute)
			let secString =
				this.second < 10 ? '0' + String(this.second) : String(this.second)

			clock.innerHTML = `${minString}:${secString}`
		}
	}
}
