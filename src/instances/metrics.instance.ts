import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import CannonDebugger from 'cannon-es-debugger'
import * as CANNON from 'cannon-es'

export interface MetricsParams {
	collisions?: boolean
	stats?: boolean
	axisHelper?: boolean
	rocketPosition?: boolean
}

export class Metrics {
	private stats?: Stats
	private cDebbuger?: ReturnType<typeof CannonDebugger>
	private isRocketPositionEnabled?: boolean = false

	constructor(
		TWorld: THREE.Scene,
		CWorld: CANNON.World,
		params: MetricsParams = {
			axisHelper: true,
			collisions: true,
			stats: true,
		}
	) {
		const { collisions, stats, axisHelper, rocketPosition } = params

		if (axisHelper) {
			TWorld.add(new THREE.AxesHelper(5000))
		}

		if (stats) {
			this.stats = new Stats()
			document.body.appendChild(this.stats.dom)
		}

		if (collisions) {
			this.cDebbuger = CannonDebugger(TWorld, CWorld, {
				color: 0xff0000,
			})
		}

		if (rocketPosition) {
			const rocketStats = document.createElement('div')
			rocketStats.id = 'stats'

			document.body.appendChild(rocketStats)
			this.isRocketPositionEnabled = true
		}
	}

	update(rocketModel: THREE.Group) {
		if (this.stats) {
			this.stats.update()
		}

		if (this.cDebbuger) {
			this.cDebbuger.update()
		}

		if (this.isRocketPositionEnabled && rocketModel) {
			const rocketStatsDiv = document.getElementById('stats')
			if (rocketStatsDiv && rocketModel)
				rocketStatsDiv.innerHTML = `Rocket X: ${Math.round(
					rocketModel.position.x
				)} Rocket Y: ${Math.round(
					rocketModel.position.y
				)} Rocket Z: ${Math.round(rocketModel.position.z)}`
		}
	}
}
