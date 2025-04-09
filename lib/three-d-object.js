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
		
		this.rotationQuaternion = quat.create();
        quat.identity(this.rotationQuaternion);

		this.modelTransformMatrix = mat4.create();
		mat4.identity(this.modelTransformMatrix);

		this.updateModelTransformMatrix();
    }

    updateModelTransformMatrix() {
        mat4.identity(this.modelTransformMatrix);
        
        // Apply translation
        mat4.translate(this.modelTransformMatrix, this.modelTransformMatrix, this.translate);
        
        // Apply rotation using quaternion
        const rotMatrix = mat4.create();
        mat4.fromQuat(rotMatrix, this.rotationQuaternion);
        mat4.multiply(this.modelTransformMatrix, this.modelTransformMatrix, rotMatrix);
        
        // Apply scale
        mat4.scale(this.modelTransformMatrix, this.modelTransformMatrix, this.scale);
    }

    // Compute centroid for rotation and scaling
    getCentroid() {
        const centroid = vec3.create();
        if (!this.vertices || this.vertexCount === 0) return centroid;
        
        for (let i = 0; i < this.vertices.length; i += 3) {
            centroid[0] += this.vertices[i];
            centroid[1] += this.vertices[i + 1];
            centroid[2] += this.vertices[i + 2];
        }
        
        const totalVertices = this.vertices.length / 3;
        vec3.scale(centroid, centroid, 1 / totalVertices);
        return centroid;
    }
    
    // Rotation methods using quaternions
    rotateAroundAxis(axis, angle, isClockwise) {
        // If clockwise, negate the angle
        if (isClockwise) angle = -angle;
        
        // Create a quaternion for this rotation
        const rotQuat = quat.create();
        quat.setAxisAngle(rotQuat, axis, angle);
        
        // Apply the rotation to the existing rotation quaternion
        // Order matters: first apply the new rotation, then the existing rotation
        // This makes rotations happen in the object's local coordinate system
        quat.multiply(this.rotationQuaternion, this.rotationQuaternion, rotQuat);
        
        // Normalize to prevent numerical drift
        quat.normalize(this.rotationQuaternion, this.rotationQuaternion);
        
        // Update transformation matrix
        this.updateModelTransformMatrix();
    }
    
    // Translation method
    translateObject(translation) {
        // Transform the translation vector to be relative to the object's current orientation
        const localTranslation = vec3.create();
        vec3.transformQuat(localTranslation, translation, this.rotationQuaternion);
        
        // Add the local translation to the current translation
        vec3.add(this.translate, this.translate, localTranslation);
        
        // Update transformation matrix
        this.updateModelTransformMatrix();
    }
    
    // Scale method around centroid
    scaleObject(scaleFactor) {
        vec3.scale(this.scale, this.scale, scaleFactor);
        this.updateModelTransformMatrix();
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