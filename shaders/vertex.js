export const vertexShaderSrc = `
    attribute vec3 a_position;
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProjection;
    
    void main() {
        // gl_Position = mProjection * mView * mWorld * vec4(a_position, 1.0);
        gl_Position = vec4(a_position, 1.0);
    }
`