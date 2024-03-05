import vertexShader from '../../shaders/vertex.glsl'
import fragmentShader from '../../shaders/fragment.glsl'
import * as THREE from 'three'
const textureLoader = new THREE.TextureLoader()

export class Flame {
	private material: THREE.ShaderMaterial
	private geometry: THREE.BufferGeometry
	private points: THREE.Points
	private particles: any[] = []
	private alphaSpline: LinearSpline
	private colourSpline: LinearSpline
	private sizeSpline: LinearSpline
	private timeElapsed = 0
	private gdfsghk: number

	isActive = false

	constructor(parent: THREE.Mesh) {
		const uniforms = {
			diffuseTexture: { value: textureLoader.load('textures/flame.png') },
			pointMultiplier: {
				value:
					window.innerHeight / (2.0 * Math.tan((0.5 * 60.0 * Math.PI) / 180.0)),
			},
		}
		this.material = new THREE.ShaderMaterial({
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			uniforms: uniforms,
			blending: THREE.AdditiveBlending,
			transparent: true,
			depthTest: true,
			depthWrite: false,
			vertexColors: true,
		})

		this.geometry = new THREE.BufferGeometry()
		this.geometry.setAttribute(
			'position',
			new THREE.Float32BufferAttribute([], 3)
		)
		this.geometry.setAttribute('size', new THREE.Float32BufferAttribute([], 1))
		this.geometry.setAttribute(
			'colour',
			new THREE.Float32BufferAttribute([], 4)
		)
		this.geometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1))

		this.points = new THREE.Points(this.geometry, this.material)

		parent.add(this.points)

		this.alphaSpline = new LinearSpline((t: any, a: any, b: any) => {
			return a + t * (b - a)
		})
		this.alphaSpline.AddPoint(0.0, 0.0)
		this.alphaSpline.AddPoint(0.1, 1.0)
		this.alphaSpline.AddPoint(0.6, 1.0)
		this.alphaSpline.AddPoint(1.0, 0.0)

		this.colourSpline = new LinearSpline((t: any, a: any, b: any) => {
			const c = a.clone()
			return c.lerp(b, t)
		})
		this.colourSpline.AddPoint(0.0, new THREE.Color(0xffff80))
		this.colourSpline.AddPoint(1.0, new THREE.Color(0xff8080))

		this.sizeSpline = new LinearSpline((t: any, a: any, b: any) => {
			return a + t * (b - a)
		})
		this.sizeSpline.AddPoint(0.0, 1.0)
		this.sizeSpline.AddPoint(0.5, 5.0)
		this.sizeSpline.AddPoint(1.0, 1.0)

		// this.addParticles()
		this.updateGeometry()
	}

	private addParticles(timeElapsed: number) {
		if (!this.gdfsghk) {
			this.gdfsghk = 0.0
		}
		this.gdfsghk += timeElapsed
		const n = Math.floor(this.gdfsghk * 75.0)
		this.gdfsghk -= n / 75.0

		for (let i = 0; i < n; i++) {
			const life = (Math.random() * 0.75 + 0.25) * 10.0
			this.particles.push({
				position: new THREE.Vector3(
					(Math.random() * 2 - 1) * 1.0,
					(Math.random() * 2 - 1) * 1.0,
					(Math.random() * 2 - 1) * 1.0
				),
				size: (Math.random() * 0.5 + 0.5) * 4.0,
				colour: new THREE.Color(),
				alpha: 1.0,
				life: life,
				maxLife: life,
				rotation: Math.random() * 2.0 * Math.PI,
				velocity: new THREE.Vector3(0, -15, 0),
			})
		}
	}

	private updateGeometry() {
		const positions: any[] = []
		const sizes: any[] = []
		const colours: any[] = []
		const angles: any[] = []

		for (let p of this.particles) {
			positions.push(p.position.x, p.position.y, p.position.z)
			colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha)
			sizes.push(p.currentSize)
			angles.push(p.rotation)
		}

		this.geometry.setAttribute(
			'position',
			new THREE.Float32BufferAttribute(positions, 3)
		)
		this.geometry.setAttribute(
			'size',
			new THREE.Float32BufferAttribute(sizes, 1)
		)
		this.geometry.setAttribute(
			'colour',
			new THREE.Float32BufferAttribute(colours, 4)
		)
		this.geometry.setAttribute(
			'angle',
			new THREE.Float32BufferAttribute(angles, 1)
		)

		this.geometry.attributes.position.needsUpdate = true
		this.geometry.attributes.size.needsUpdate = true
		this.geometry.attributes.colour.needsUpdate = true
		this.geometry.attributes.angle.needsUpdate = true
	}

	private updateParticles(timeElapsed: number) {
		for (let p of this.particles) {
			p.life -= timeElapsed
		}

		this.particles = this.particles.filter((p) => {
			return p.life > 0.0
		})

		for (let p of this.particles) {
			const t = 1.0 - p.life / p.maxLife

			p.rotation += timeElapsed * 0.5
			p.alpha = this.alphaSpline.Get(t)
			p.currentSize = p.size * this.sizeSpline.Get(t)
			p.colour.copy(this.colourSpline.Get(t))

			p.position.add(p.velocity.clone().multiplyScalar(timeElapsed))

			const drag = p.velocity.clone()
			drag.multiplyScalar(timeElapsed * 0.1)
			drag.x =
				Math.sign(p.velocity.x) *
				Math.min(Math.abs(drag.x), Math.abs(p.velocity.x))
			drag.y =
				Math.sign(p.velocity.y) *
				Math.min(Math.abs(drag.y), Math.abs(p.velocity.y))
			drag.z =
				Math.sign(p.velocity.z) *
				Math.min(Math.abs(drag.z), Math.abs(p.velocity.z))
			p.velocity.sub(drag)
		}

		// this.particles.sort((a, b) => {
		// 	const d1 = camera.position.distanceTo(a.position)
		// 	const d2 = camera.position.distanceTo(b.position)

		// 	if (d1 > d2) {
		// 		return -1
		// 	}

		// 	if (d1 < d2) {
		// 		return 1
		// 	}

		// 	return 0
		// })
	}

	on() {
		if (this.isActive) return

		this.isActive = true
	}

	off() {
		if (!this.isActive) return

		this.isActive = false
	}

	animate(delta: number) {
		this.timeElapsed += delta * 0.01
		if (this.isActive) this.addParticles(this.timeElapsed)
		this.updateParticles(this.timeElapsed)
		this.updateGeometry()
	}
}

class LinearSpline {
	points: any
	lerp: any

	constructor(lerp: any) {
		this.points = []
		this.lerp = lerp
	}

	AddPoint(t: any, d: any) {
		this.points.push([t, d])
	}

	Get(t: any) {
		let p1 = 0

		for (let i = 0; i < this.points.length; i++) {
			if (this.points[i][0] >= t) {
				break
			}
			p1 = i
		}

		const p2 = Math.min(this.points.length - 1, p1 + 1)

		if (p1 == p2) {
			return this.points[p1][1]
		}

		return this.lerp(
			(t - this.points[p1][0]) / (this.points[p2][0] - this.points[p1][0]),
			this.points[p1][1],
			this.points[p2][1]
		)
	}
}
