import {mat4, vec3} from "../vendor/gl-matrix/index.js";

export class Transform {
    constructor(shader, renderer) {
        this.shader = shader;
        this.renderer = renderer;

        // Create transformation matrices
        this.worldMatrix = mat4.create();       // model matrix
        this.viewMatrix = mat4.create();        // camera matrix
        this.projectionMatrix = mat4.create();  // projection matrix
    }

    setWorldMatrix(worldMatrix) {
        this.worldMatrix = worldMatrix;
        this.shader.setUniformMatrix4fv("mWorld", worldMatrix);
    }

    setViewMatrix(cameraPosition, pointToLookAt, upDirection) {
        this.viewMatrix = mat4.create();
        mat4.lookAt(this.viewMatrix, cameraPosition, pointToLookAt, upDirection);
        this.shader.setUniformMatrix4fv("mView", this.viewMatrix);
    }

    // fov: radians, near: near plane, far: far plane
    setProjectionMatrix(fov, aspectRatio, near, far) { 
        this.projectionMatrix = mat4.create();
        mat4.perspective(this.projectionMatrix, fov, aspectRatio, near, far);
        this.shader.setUniformMatrix4fv("mProjection", this.projectionMatrix);
    }

    // ============================================================

    rotateCamera(angle) {   //degrees
        // Create a rotation matrix around Y axis
        const rotationMatrix = mat4.create();
        mat4.rotateY(rotationMatrix, rotationMatrix, angle);

        // Initial camera position as vec3
        const cameraPos = vec3.fromValues(2, 2, 2);
        const rotatedPos = vec3.create();

        // Transform the camera position using the rotation matrix
        vec3.transformMat4(rotatedPos, cameraPos, rotationMatrix);

        // Update view matrix with rotated camera position
        this.setViewMatrix(
            rotatedPos,     // Rotated camera position
            [0, 0, 0],      // Still looking at center
            [0, 1, 0]       // Up direction unchanged
        );
    }
}