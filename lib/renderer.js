export class WebGLRenderer {
    constructor() {
        this.domElement = document.createElement("canvas");
        this.domElement.id = "canvas";
        this.gl =
            this.domElement.getContext("webgl",{preserveDrawingBuffer: true}) ||
            this.domElement.getContext("experimental-webgl");

        if (!this.gl) throw new Error("WebGL is not supported");

        this.setSize(500, 500);
        this.clear(200, 200, 200, 100);
    }

    setSize(width, height) {
        this.domElement.width = width;
        this.domElement.height = height;
        // defines the area of the canvas where WebGL will draw
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }

    clear(r, g, b, a) {
        this.gl.clearColor(r/255, g/255, b/255, a/100);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    setAnimationLoop(animation) {
        function renderLoop() {
            animation();
            window.requestAnimationFrame(renderLoop);
        }

        renderLoop();
    }

    glContext() {
        return this.gl;
    }

    // ============================================================

    drawTriangle(vertices, color, shader) {
        shader.fillAttributeData("a_position", 3, 0, 0);

        shader.bindArrayBuffer(shader.vertexAttributesBuffer, new Float32Array(vertices));

        shader.setUniform4f("u_color", color);
        shader.drawArrays(3);
    }

    drawLineStrip(vertices, color, shader) {       
        shader.fillAttributeData("a_position", 3, 0, 0);

        shader.bindArrayBuffer(shader.vertexAttributesBuffer, new Float32Array(vertices));

        shader.setUniform4f("u_color", color);
        shader.drawArrays(vertices.length/3, this.gl.LINE_STRIP)
    }

    drawObject(object, shader, highlighted=false) {
        shader.fillAttributeData("a_position", 3, 0, 0);
        
        // Bind vertex buffer with the vertices from the object
        shader.bindArrayBuffer(shader.vertexAttributesBuffer, object.vertices);
        
        // Set the color uniform
        shader.setUniform4f("u_color", highlighted ? [1, 1, 0, 1] : object.color);
        
        // Draw the entire object
        shader.drawArrays(object.vertexCount);
    }

    // ============================================================

    render(scene, shader) {
        for(let i = 0; i < scene.primitives.length; i++) {
            let item = scene.primitives[i];

            switch (item.type) {
                case "triangle":
                    this.drawTriangle(item.vertices, item.color, shader);
                    break;
                case "lineStrip":
                    this.drawLineStrip(item.vertices, item.color, shader);
                    break;
            }
        }

        for(let i = 0; i < scene.objects.length; i++) {
            let item = scene.objects[i];

            switch (item.type) {
                case "object":
                    this.drawObject(item, shader, scene.highlightedObjectIndex === i);
                    break;
            }
        }

        for(let i = 0; i < scene.fixedObjects.length; i++) {
            let item = scene.fixedObjects[i];

            switch (item.type) {
                case "fixed-object":
                    this.drawObject(item, shader);
                    break;
            }
        }
    }
    
}
