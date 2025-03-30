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

        // for picking
        this.pickingFrameBuffer = null;
        this.pickingTexture = null;
        this.pickingDepthBuffer = null;

        this.setupPickingFrameBuffer();
    }

    setSize(width, height) {
        this.domElement.width = width;
        this.domElement.height = height;
        // defines the area of the canvas where WebGL will draw
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        // to handle the case where the canvas is resized
        if(this.pickingFrameBuffer) {
            this.setupPickingFrameBuffer();
        }
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

    setupPickingFrameBuffer() {
        const gl = this.gl;

        // create framebuffer
        this.pickingFrameBuffer = gl.createFramebuffer();
        // All subsequent operations will affect this framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingFrameBuffer);

        // create texture
        this.pickingTexture = gl.createTexture();   // new texture to store color data during picking
        gl.bindTexture(gl.TEXTURE_2D, this.pickingTexture);     // Binds the texture to the TEXTURE_2D target for configuration.
        // Set texture filtering to LINEAR for smooth interpolation when scaling
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        // CLAMP_TO_EDGE wrapping to prevent edge artifacts
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        /**
         * creates an empty RGBA texture matching the canvas dimensions.
         * gl.UNSIGNED_BYTE: Each color channel is stored as an 8-bit value (0-255).
         * null: Allocates memory without initializing pixel data.
         */
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 
            this.domElement.width, this.domElement.height, 
            0, gl.RGBA, gl.UNSIGNED_BYTE, null
        );
       
        // create depth buffer
        this.pickingDepthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.pickingDepthBuffer);
        // Allocates 16-bit depth storage matching the canvas size
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 
            this.domElement.width, this.domElement.height
        );

        // attach texture and depth buffer to framebuffer
        // Attaches the texture to the framebuffer's COLOR_ATTACHMENT0 slot
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.pickingTexture, 0);
        // Attaches the depth buffer to the framebuffer
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.pickingDepthBuffer);

        // check if framebuffer is complete
        if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            throw new Error("Framebuffer is not complete");
        }

        // restore default framebuffer
        // Unbinds the picking framebuffer, reverting rendering to the default screen buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    renderForPicking(scene, shader) {
        // render object with unique color based on index
        for(let i = 0; i < scene.objects.length; i++) {
            const object = scene.objects[i];

            shader.fillAttributeData("a_position", 3, 0, 0);
            shader.bindArrayBuffer(shader.vertexAttributesBuffer, object.vertices);

            // set index as R channel
            const pickingColor = [i/255, 0, 0, 1];
            shader.setUniform4f("u_color", pickingColor);
            shader.drawArrays(object.vertexCount);
        }
    }

    pick(x, y, scene, shader) {
        const gl = this.gl;

        // bind picking framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingFrameBuffer);

        // clear color and depth buffer
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // render object with unique color based on index
        this.renderForPicking(scene, shader);

        // read pixel from picking texture
        const pixelData = new Uint8Array(4);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);

        // convert to index // pixelData[0] is R channel
        const objectIndex = pixelData[0];
        
        // if we get black pixel (0, 0, 0, 0) then we didn't hit any object
        const noObjectPicked = pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0 && pixelData[3] === 0;

        // unbind framebuffer to restore normal rendering
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return noObjectPicked ? -1 : objectIndex;
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

    drawObject(object, shader, picked=false, highlightColor=null) {
        shader.fillAttributeData("a_position", 3, 0, 0);
        
        // Bind vertex buffer with the vertices from the object
        shader.bindArrayBuffer(shader.vertexAttributesBuffer, object.vertices);
        
        // Set the color uniform
        shader.setUniform4f("u_color", picked ? highlightColor : object.color);
        
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
            let isPicked = scene.pickedObjectIndex === i;

            switch (item.type) {
                case "object":
                    this.drawObject(item, shader, 
                        isPicked, isPicked ? scene.highlightColor : null
                    );
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
