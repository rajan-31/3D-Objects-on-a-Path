export class Shader {
    constructor(gl, vertexShaderSrc, fragmentShaderSrc) {
        this.gl = gl;
        this.vertexShaderSrc = vertexShaderSrc;
        this.fragmentShaderSrc = fragmentShaderSrc;

        this.program = this.link(
            this.compile(gl.VERTEX_SHADER, this.vertexShaderSrc),
            this.compile(gl.FRAGMENT_SHADER, this.fragmentShaderSrc)
        );

        this.vertexAttributesBuffer = this.createBuffer();
        this.indexBuffer = this.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexAttributesBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        this.gl.enable(this.gl.DEPTH_TEST);
        // this.gl.clearDepth(0.0);
        // this.gl.depthFunc(this.gl.GREATER);
    }

    compile(type, shaderSrc) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, shaderSrc);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw new Error(this.gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    link(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            throw new Error(this.gl.getProgramInfoLog(program));
        }

        return program;
    }

    use() {
        this.gl.useProgram(this.program);
    }

    // ============================================================
    
    createBuffer() {
        const buffer = this.gl.createBuffer();
        if (!buffer) {
            throw new Error("Buffer for vertex attributes could not be allocated");
        }
        return buffer;
    }

    attribute(attributeName) {
        return this.gl.getAttribLocation(this.program, attributeName);
    }

    uniform(uniformName) {
        return this.gl.getUniformLocation(this.program, uniformName);
    }

    setUniform4f(uniformName, vec4) {
        const uniformLocation = this.uniform(uniformName);
        this.gl.uniform4f(uniformLocation, vec4[0], vec4[1], vec4[2], vec4[3]);
    }

    bindArrayBuffer(buffer, data) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.DYNAMIC_DRAW);
    }

    fillAttributeData(attributeName, elementPerAttribute, stride, offset) {
        // Get attribute location and enable it
        const index = this.attribute(attributeName);
        this.gl.enableVertexAttribArray(index);

        // preferred way - we can use the index provided by the graphics card instead of setting the index ourselves;
        // this avoids the re-linking of the shader program.
        this.gl.vertexAttribPointer(index, elementPerAttribute, this.gl.FLOAT, false, stride, offset);

    }

    // ============================================================

    drawArrays(numberOfElements, mode=this.gl.TRIANGLES) {
        this.gl.drawArrays(mode, 0, numberOfElements);
    }
}