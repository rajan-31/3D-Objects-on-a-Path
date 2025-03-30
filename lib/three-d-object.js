import {vec3, mat4, quat} from "../vendor/gl-matrix/index.js";

export class ThreeDObject {
    constructor() {
        this.type = null;
        this.vertices = null;
        this.vertexCount = 0;
        this.color = null;

        this.translate = vec3.create();
		vec3.set(this.translate, 0, 0, 0);
		
		this.scale = vec3.create();
		vec3.set(this.scale, 1, 1, 1);
		
		this.rotationAngle = 0;
		this.rotationAxis = vec3.create();
		vec3.set(this.rotationAxis, 1, 0, 0);

		this.modelTransformMatrix = mat4.create();
		mat4.identity(this.modelTransformMatrix);

		this.updateModelTransformMatrix();
    }


    updateModelTransformMatrix() {
        
    }

    setObject(mesh, color) {
        // Pre-allocate a single Float32Array for better memory efficiency and performance
        const vertexCount = mesh.indices.length;
        const vertices = new Float32Array(vertexCount * 3);
        
        // Build flat vertex array from indexed data
        let vertexIndex = 0;
        for (let i = 0; i < mesh.indices.length; i++) {
            const idx = mesh.indices[i] * 3;
            vertices[vertexIndex++] = mesh.vertices[idx];
            vertices[vertexIndex++] = mesh.vertices[idx + 1];
            vertices[vertexIndex++] = mesh.vertices[idx + 2];
        }

        this.vertices = vertices;
        this.vertexCount = vertexCount;
        this.color = [color[0]/255, color[1]/255, color[2]/255, color[3]/100];
    }
}