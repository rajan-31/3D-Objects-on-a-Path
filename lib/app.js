import {vec3} from "../vendor/gl-matrix/index.js";

export class App {
    constructor(renderer, shader, transform, scene) {
        this.renderer = renderer;
        this.shader = shader;
        this.transform = transform;
        this.scene = scene;

        this.ViewType = "3D";   // 3D or Top
        
        // Path definition
        this.pathPoints = [];
        this.pathDefining = false;
        this.movingObject = -1;
        this.currentT = 0;
        this.moveSpeed = 0.01; // Default speed
        this.pathCoefficients = { a: null, b: null, c: null };
        
        // Camera rotation with mouse drag
        this.isDragging = false;
        this.lastMouseX = 0;
        this.currentRotationAngle = 0; // Track current rotation angle in degrees
    }

    getViewType() {
        return this.ViewType;
    }

    // ============================================================

    setModeCamera3DView() {
        this.ViewType = "3D";

        // this.transform.setViewMatrix(
        //     [2, 2, 2],   // Camera position
        //     [0, 0, 0],    // Point to look at (center of scene)
        //     [0, 1, 0]    // Up direction (Y-axis becomes "up" in camera space)
        // );

        this.rotateCamera(this.currentRotationAngle);
    }

    setModeCameraTopView() {
        this.ViewType = "Top";

        this.transform.setViewMatrix(
            [0, 0, 4],   // Camera position (high on Z-axis looking down)
            [0, 0, 0],    // Point to look at (center of scene)
            [0, 1, 0]    // Up direction (Y-axis becomes "up" in camera space)
        );
    }

    rotateCamera(angle) {   //degrees
        if(this.ViewType !== "3D") this.ViewType = "3D";
        this.transform.rotateCamera(angle * Math.PI / 180);
    }

    // ============================================================
    
    // Convert screen coordinates to world coordinates
    screenToWorld(x, y) {
        // Get canvas dimensions
        const canvas = this.renderer.domElement;
        const width = canvas.width;
        const height = canvas.height;
        
        // The y needs to be inverted for WebGL coordinate system
        const yInverted = canvas.height - y;
        
        // Normalize to NDC (Normalized Device Coordinates) [-1, 1]
        const ndcX = (x / width) * 2 - 1;
        const ndcY = (yInverted / height) * 2 - 1;  // Already inverted
        
        // For top view (looking down from Z), we map screen to XY plane
        // Scale based on the camera's view frustum
        const worldX = ndcX * 2;  // Scale from [-1,1] to [-2,2]
        const worldY = ndcY * 2;  // Scale from [-1,1] to [-2,2]
        const worldZ = 0.5;       // Arbitrary non-zero value for z-coordinate
        
        // Debug info
        console.log(`Screen: (${x}, ${y}) => World: (${worldX}, ${worldY}, ${worldZ})`);
        
        return vec3.fromValues(worldX, worldY, worldZ);
    }
    
    // Compute quadratic curve coefficients
    computePathCoefficients(p0, p1, p2) {
        // Assuming p1 is at t=0.5 (middle point)
        const t1 = 0.5;
        
        // Solving for a, b, c in: p(t) = at^2 + bt + c
        // p(0) = c = p0
        // p(1) = a + b + c = p2
        // p(t1) = a*t1^2 + b*t1 + c = p1
        
        // c = p0
        const c = p0;
        
        // From p(t1) = a*t1^2 + b*t1 + c, we get
        // p1 = a*t1^2 + b*t1 + p0
        // => a*t1^2 + b*t1 = p1 - p0
        
        // From p(1) = a + b + c, we get
        // p2 = a + b + p0
        // => a + b = p2 - p0
        
        // Substituting b = (p2 - p0) - a into first equation:
        // a*t1^2 + ((p2 - p0) - a)*t1 = p1 - p0
        // a*t1^2 + (p2 - p0)*t1 - a*t1 = p1 - p0
        // a*(t1^2 - t1) = p1 - p0 - (p2 - p0)*t1
        // a = (p1 - p0 - (p2 - p0)*t1) / (t1^2 - t1)
        
        const p0ToP1 = vec3.create();
        vec3.subtract(p0ToP1, p1, p0);
        
        const p0ToP2 = vec3.create();
        vec3.subtract(p0ToP2, p2, p0);
        
        const scaledP0ToP2 = vec3.create();
        vec3.scale(scaledP0ToP2, p0ToP2, t1);
        
        const numerator = vec3.create();
        vec3.subtract(numerator, p0ToP1, scaledP0ToP2);
        
        const denominator = t1*t1 - t1;
        
        const a = vec3.create();
        vec3.scale(a, numerator, 1/denominator);
        
        // Now solve for b using: b = (p2 - p0) - a
        const b = vec3.create();
        vec3.subtract(b, p0ToP2, a);
        
        return { a, b, c };
    }
    
    // Evaluate the quadratic curve at time t
    evaluatePath(t) {
        if (!this.pathCoefficients.a) return null;
        
        const { a, b, c } = this.pathCoefficients;
        
        // p(t) = a*t^2 + b*t + c
        const result = vec3.create();
        
        const tSquared = t * t;
        const termA = vec3.create();
        vec3.scale(termA, a, tSquared);
        
        const termB = vec3.create();
        vec3.scale(termB, b, t);
        
        vec3.add(result, c, termB);
        vec3.add(result, result, termA);
        
        return result;
    }
    
    // Create a path visualization primitive
    createPathPrimitive() {
        if (!this.pathCoefficients.a) return null;
        
        // Generate points along the curve
        const numPoints = 50;
        const vertices = [];
        
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const point = this.evaluatePath(t);
            vertices.push(point[0], point[1], point[2]);
        }
        
        // Create line strip primitive for the scene
        return {
            type: "lineStrip",
            vertices: vertices,
            color: [1, 1, 0, 1] // Yellow color
        };
    }
    
    // Create a point marker for visualizing control points
    createPointMarker(position, color) {
        // Create bigger marker around the point
        const size = 0.15;
        
        // Create a cross in XY plane with Z offset
        const vertices = [
            // Horizontal line (X-axis)
            position[0] - size, position[1], position[2],
            position[0] + size, position[1], position[2],
            
            // Draw line to connect points
            position[0] + size, position[1], position[2],
            position[0] + size, position[1], position[2], // Duplicate to break line strip
            
            // Vertical line (Y-axis)
            position[0], position[1] - size, position[2],
            position[0], position[1] + size, position[2],
            
            // Draw line to connect points
            position[0], position[1] + size, position[2],
            position[0], position[1] + size, position[2], // Duplicate to break line strip
            
            // Diagonal line 1
            position[0] - size/1.5, position[1] - size/1.5, position[2],
            position[0] + size/1.5, position[1] + size/1.5, position[2],
            
            // Draw line to connect points
            position[0] + size/1.5, position[1] + size/1.5, position[2],
            position[0] + size/1.5, position[1] + size/1.5, position[2], // Duplicate to break line strip
            
            // Diagonal line 2
            position[0] - size/1.5, position[1] + size/1.5, position[2],
            position[0] + size/1.5, position[1] - size/1.5, position[2]
        ];
        
        return {
            type: "lineStrip",
            vertices: vertices,
            color: color || [1, 0, 0, 1] // Red color by default
        };
    }
    
    // Start moving object along path
    startMovingObject() {
        if (this.pathPoints.length !== 3 || this.scene.pickedObjectIndex < 0) return;
        
        this.movingObject = this.scene.pickedObjectIndex;
        this.currentT = 0;
        
        // Create and add path visualization
        const pathPrimitive = this.createPathPrimitive();
        if (pathPrimitive) {
            this.scene.primitives.push(pathPrimitive);
        }
        
        // Setup animation
        this.animateObject();
    }
    
    // Animate object along path
    animateObject() {
        if (this.movingObject < 0 || this.currentT >= 1) {
            // End of path
            if (this.currentT >= 1) {
                this.scene.pickedObjectIndex = -1;
                this.movingObject = -1;
                this.pathPoints = [];
                this.pathDefining = false;
            }
            return;
        }
        
        // Calculate new position
        const newPosition = this.evaluatePath(this.currentT);
        
        // Update object position
        const obj = this.scene.objects[this.movingObject];
        
        // Get current position
        const currentPos = obj.translate;
        
        // Set absolute position instead of relative translation
        vec3.copy(obj.translate, newPosition);
        obj.updateModelTransformMatrix();
        
        // Increment t for next frame
        this.currentT += this.moveSpeed;
        
        // Request next frame
        requestAnimationFrame(() => this.animateObject());
    }
    
    // Start path definition if an object is selected
    startPathDefinition() {
        if (this.scene.pickedObjectIndex >= 0 && !this.pathDefining && this.movingObject < 0) {
            this.pathDefining = true;
            this.pathPoints = [];
            
            // Add current position as first point
            const selectedObj = this.scene.objects[this.scene.pickedObjectIndex];
            const p0 = vec3.clone(selectedObj.translate);
            this.pathPoints.push(p0);
            
            // Add marker for first point
            const marker = this.createPointMarker(p0, [1, 0, 0, 1]); // Red
            this.scene.primitives.push(marker);
            
            alert("Now click two more points to define the path");
        }
    }
    
    // Handle canvas click for path definition
    handlePathPointSelection(x, y) {
        if (this.pathPoints.length < 3) {
            const worldPos = this.screenToWorld(x, y);
            this.pathPoints.push(worldPos);
            
            // Add marker with different colors for each point
            const color = this.pathPoints.length === 2 ? 
                [0, 1, 0, 1] : // Green for second point
                [0, 0, 1, 1];  // Blue for third point
                
            const marker = this.createPointMarker(worldPos, color);
            this.scene.primitives.push(marker);
            
            // If we've collected all three points
            if (this.pathPoints.length === 3) {
                // Compute path coefficients
                this.pathCoefficients = this.computePathCoefficients(
                    this.pathPoints[0],
                    this.pathPoints[1],
                    this.pathPoints[2]
                );
                
                // Start moving
                this.startMovingObject();
            }
        }
    }
    
    // Reset path definition
    resetPathDefinition() {
        this.pathPoints = [];
        this.pathDefining = false;
        
        // Remove any path visualization
        this.scene.primitives = this.scene.primitives.filter(p => p.type !== "lineStrip");
    }

    // ============================================================

    handleCanvasClick = (event) => {
        if(this.ViewType !== "Top") {
            return; //alert("Please switch to top view to pick objects");
        }

        const canvas = this.renderer.domElement;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // y is inverted in the canvas for picking
        const yInverted = canvas.height - y;
        
        // If we're defining a path
        if (this.pathDefining) {
            // Pass the original (not inverted) coordinates since screenToWorld handles inversion
            this.handlePathPointSelection(x, y);
            return;
        }
        
        // Otherwise, pick an object using inverted y for WebGL picking
        const pickedObjectIndex = this.renderer.pick(x, yInverted, this.scene, this.shader);

        if(pickedObjectIndex >= 0 && pickedObjectIndex < this.scene.objects.length) {
            this.scene.pickedObjectIndex = pickedObjectIndex === this.scene.pickedObjectIndex ? -1 : pickedObjectIndex;
        }
    }
    
    handleMouseDown = (event) => {
        if(this.ViewType !== "3D") {
            return; // Only enable rotation in 3D view
        }
        
        this.isDragging = true;
        this.lastMouseX = event.clientX;
    }
    
    handleMouseMove = (event) => {
        if (!this.isDragging || this.ViewType !== "3D") {
            return;
        }
        
        const deltaX = event.clientX - this.lastMouseX;
        this.lastMouseX = event.clientX;
        
        // Convert mouse movement to rotation angle (adjust sensitivity as needed)
        const rotationFactor = 0.5; // Adjust for desired sensitivity
        const rotationDelta = deltaX * rotationFactor;
        
        // Update current rotation angle
        this.currentRotationAngle -= rotationDelta;
        
        // Keep angle in range [0, 360]
        this.currentRotationAngle = (this.currentRotationAngle + 360) % 360;
        
        // Update slider value to match current rotation
        const slider = document.querySelector("#slider-rotate-camera");
        if (slider) {
            slider.value = this.currentRotationAngle;
        }
        
        // Apply rotation
        this.rotateCamera(this.currentRotationAngle);
    }
    
    handleMouseUp = () => {
        this.isDragging = false;
    }

    handleKeyPress = (event) => {
        const key = event.key;

        switch (key) {
            case 'V':
                this.setModeCamera3DView();
                break;
            case 'v':
                this.setModeCameraTopView();
                break;
            case 'x':
                // rotate selected object with respect to it's centroid, around X axis anticlockwise using quternions
                if (this.scene.pickedObjectIndex >= 0 && !this.pathDefining && this.movingObject < 0) {
                    const obj = this.scene.objects[this.scene.pickedObjectIndex];
                    const xAxis = vec3.fromValues(1, 0, 0);
                    obj.rotateAroundAxis(xAxis, Math.PI/18, false); // 10 degrees
                }
                break;
            case 'X':
                // rotate selected object with respect to it's centroid, around X axis clockwise using quternions
                if (this.scene.pickedObjectIndex >= 0 && !this.pathDefining && this.movingObject < 0) {
                    const obj = this.scene.objects[this.scene.pickedObjectIndex];
                    const xAxis = vec3.fromValues(1, 0, 0);
                    obj.rotateAroundAxis(xAxis, Math.PI/18, true); // 10 degrees
                }
                break;
            case 'y':
                // rotate selected object with respect to it's centroid, around Y axis anticlockwise using quternions
                if (this.scene.pickedObjectIndex >= 0 && !this.pathDefining && this.movingObject < 0) {
                    const obj = this.scene.objects[this.scene.pickedObjectIndex];
                    const yAxis = vec3.fromValues(0, 1, 0);
                    obj.rotateAroundAxis(yAxis, Math.PI/18, false); // 10 degrees
                }
                break;
            case 'Y':
                // rotate selected object with respect to it's centroid, around Y axis clockwise using quternions
                if (this.scene.pickedObjectIndex >= 0 && !this.pathDefining && this.movingObject < 0) {
                    const obj = this.scene.objects[this.scene.pickedObjectIndex];
                    const yAxis = vec3.fromValues(0, 1, 0);
                    obj.rotateAroundAxis(yAxis, Math.PI/18, true); // 10 degrees
                }
                break;
            case 'z':
                // rotate selected object with respect to it's centroid, around Z axis anticlockwise using quternions
                if (this.scene.pickedObjectIndex >= 0 && !this.pathDefining && this.movingObject < 0) {
                    const obj = this.scene.objects[this.scene.pickedObjectIndex];
                    const zAxis = vec3.fromValues(0, 0, 1);
                    obj.rotateAroundAxis(zAxis, Math.PI/18, false); // 10 degrees
                }
                break;
            case 'Z':
                // rotate selected object with respect to it's centroid, around Z axis clockwise using quternions
                if (this.scene.pickedObjectIndex >= 0 && !this.pathDefining && this.movingObject < 0) {
                    const obj = this.scene.objects[this.scene.pickedObjectIndex];
                    const zAxis = vec3.fromValues(0, 0, 1);
                    obj.rotateAroundAxis(zAxis, Math.PI/18, true); // 10 degrees
                }
                break;
            case 't':
                // move selected object centroid by input-translate-x, input-translate-y, input-translate-z
                if (this.scene.pickedObjectIndex >= 0 && !this.pathDefining && this.movingObject < 0) {
                    const obj = this.scene.objects[this.scene.pickedObjectIndex];
                    
                    // Get translation values from UI
                    const tx = parseFloat(document.querySelector("#input-translate-x").value) || 0;
                    const ty = parseFloat(document.querySelector("#input-translate-y").value) || 0;
                    const tz = parseFloat(document.querySelector("#input-translate-z").value) || 0;
                    
                    const translation = vec3.fromValues(tx, ty, tz);
                    obj.translateObject(translation);
                }
                break;
            case 'ArrowLeft':
                // scale down selected object
                if (this.scene.pickedObjectIndex >= 0 && !this.pathDefining && this.movingObject < 0) {
                    const obj = this.scene.objects[this.scene.pickedObjectIndex];
                    obj.scaleObject(0.9); // Scale down by 10%
                }
                break;
            case 'ArrowRight':
                // scale up selected object
                if (this.scene.pickedObjectIndex >= 0 && !this.pathDefining && this.movingObject < 0) {
                    const obj = this.scene.objects[this.scene.pickedObjectIndex];
                    obj.scaleObject(1.1); // Scale up by 10%
                }
                break;
            case 'ArrowUp':
                // increase speed of moving of selected object
                if (this.movingObject >= 0) {
                    this.moveSpeed = Math.min(this.moveSpeed * 1.2, 0.05);
                }
                break;
            case 'ArrowDown':
                // decrease speed of moving of selected object
                if (this.movingObject >= 0) {
                    this.moveSpeed = Math.max(this.moveSpeed * 0.8, 0.001);
                }
                break;
            case 'p':
                // Start path definition if an object is selected
                if (this.scene.pickedObjectIndex >= 0 && !this.pathDefining && this.movingObject < 0) {
                    this.startPathDefinition();
                }
                break;
            case 'Escape':
                // Cancel path definition
                if (this.pathDefining) {
                    this.resetPathDefinition();
                }
                break;
        }
    }
    
    addEventListeners() {
        document.addEventListener("keydown", this.handleKeyPress);

        document.querySelector("#btn-mode-camera-3d-view").onclick = () => { this.setModeCamera3DView(); };
        document.querySelector("#btn-mode-camera-top-view").onclick = () => { this.setModeCameraTopView(); };
        
        document.querySelector("#slider-rotate-camera").oninput = (e) => { 
            this.currentRotationAngle = -e.target.value; 
            this.rotateCamera(this.currentRotationAngle); 
        };

        // Add translate button handler
        document.querySelector("#btn-translate").onclick = () => {
            if (this.scene.pickedObjectIndex >= 0 && !this.pathDefining && this.movingObject < 0) {
                const obj = this.scene.objects[this.scene.pickedObjectIndex];
                
                // Get translation values from UI
                const tx = parseFloat(document.querySelector("#input-translate-x").value) || 0;
                const ty = parseFloat(document.querySelector("#input-translate-y").value) || 0;
                const tz = parseFloat(document.querySelector("#input-translate-z").value) || 0;
                
                const translation = vec3.fromValues(tx, ty, tz);
                obj.translateObject(translation);
            }
        };
        
        // Canvas event listeners
        const canvas = this.renderer.domElement;
        canvas.addEventListener("click", this.handleCanvasClick);
        
        // Add mouse drag event listeners for camera rotation
        canvas.addEventListener("mousedown", this.handleMouseDown);
        document.addEventListener("mousemove", this.handleMouseMove);
        document.addEventListener("mouseup", this.handleMouseUp);
        canvas.addEventListener("mouseleave", this.handleMouseUp); // Stop dragging if mouse leaves canvas
    }
}