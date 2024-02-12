import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export function createShapeFromModel(model: THREE.Mesh, yScale = 1) {
	const boundingBox = new THREE.Box3().setFromObject(model)

	const xSize = boundingBox.max.x - boundingBox.min.x
	const ySize = boundingBox.max.y - boundingBox.min.y
	const zSize = boundingBox.max.z - boundingBox.min.z

	const shape = new CANNON.Box(
		new CANNON.Vec3(xSize / 2, (ySize / 2) * yScale, zSize / 2)
	)

	return { shape, size: { x: xSize, y: ySize, z: zSize } }
}
