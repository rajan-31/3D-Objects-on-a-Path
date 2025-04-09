export const vertexShaderSrc = `
    attribute vec3 a_position;
    attribute vec3 a_normal;
    
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProjection;
    uniform vec3 u_lightPosition;
    
    varying vec3 v_normal;
    varying vec3 v_surfaceToLight;
    varying vec3 v_surfaceToView;
    
    void main() {
        vec4 worldPosition = mWorld * vec4(a_position, 1.0);

        // calculate surface normal in world space
        mat4 normalMatrix = mWorld;
        v_normal = (normalMatrix * vec4(a_normal, 0.0)).xyz;

        // calculate surface to light vector
        v_surfaceToLight = u_lightPosition - worldPosition.xyz;

        v_surfaceToView = -worldPosition.xyz;

        gl_Position = mProjection * mView * worldPosition;
    }
`