import {vec3} from "../vendor/gl-matrix/index.js";

export class App {
    constructor(renderer, shader, transform, scene) {
        this.renderer = renderer;
        this.shader = shader;
        this.transform = transform;
        this.scene = scene;

        this.ViewType = "3D";   // 3D or Top
    }

    getViewType() {
        return this.ViewType;
    }

    // ============================================================

    setModeCamera3DView() {
        this.ViewType = "3D";

        this.transform.setViewMatrix(
            [2, 2, 2],   // Camera position
            [0, 0, 0],    // Point to look at (center of scene)
            [0, 1, 0]    // Up direction (Y-axis becomes "up" in camera space)
        );
    }

    setModeCameraTopView() {
        this.ViewType = "Top";

        this.transform.setViewMatrix(
            [0, 0, 3],   // Camera position (high on Z-axis)
            [0, 0, 0],    // Point to look at (center of scene)
            [0, 1, 0]    // Up direction (Y-axis becomes "up" in camera space)
        );
    }

    rotateCamera(angle) {   //degrees
        if(this.ViewType !== "3D") this.ViewType = "3D";
        this.transform.rotateCamera(angle * Math.PI / 180);
    }

    // ============================================================

    handleCanvasClick = (event) => {
        if(this.ViewType !== "Top") {
            return alert("Please switch to top view to pick objects");
        }

        const canvas = this.renderer.domElement;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // y is inverted in the canvas
        const yInverted = canvas.height - y;
        
        const pickedObjectIndex = this.renderer.pick(x, yInverted, this.scene, this.shader);

        if(pickedObjectIndex >= 0 && pickedObjectIndex < this.scene.objects.length) {
            this.scene.pickedObjectIndex = pickedObjectIndex === this.scene.pickedObjectIndex ? -1 : pickedObjectIndex;
        }
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
                if (this.scene.pickedObjectIndex >= 0) {
                    const obj = this.scene.objects[this.scene.pickedObjectIndex];
                    const xAxis = vec3.fromValues(1, 0, 0);
                    obj.rotateAroundAxis(xAxis, Math.PI/18, false); // 10 degrees
                }
                break;
            case 'X':
                // rotate selected object with respect to it's centroid, around X axis clockwise using quternions
                if (this.scene.pickedObjectIndex >= 0) {
                    const obj = this.scene.objects[this.scene.pickedObjectIndex];
                    const xAxis = vec3.fromValues(1, 0, 0);
                    obj.rotateAroundAxis(xAxis, Math.PI/18, true); // 10 degrees
                }
                break;
            case 'y':
                // rotate selected object with respect to it's centroid, around Y axis anticlockwise using quternions
                if (this.scene.pickedObjectIndex >= 0) {
                    const obj = this.scene.objects[this.scene.pickedObjectIndex];
                    const yAxis = vec3.fromValues(0, 1, 0);
                    obj.rotateAroundAxis(yAxis, Math.PI/18, false); // 10 degrees
                }
                break;
            case 'Y':
                // rotate selected object with respect to it's centroid, around Y axis clockwise using quternions
                if (this.scene.pickedObjectIndex >= 0) {
                    const obj = this.scene.objects[this.scene.pickedObjectIndex];
                    const yAxis = vec3.fromValues(0, 1, 0);
                    obj.rotateAroundAxis(yAxis, Math.PI/18, true); // 10 degrees
                }
                break;
            case 'z':
                // rotate selected object with respect to it's centroid, around Z axis anticlockwise using quternions
                if (this.scene.pickedObjectIndex >= 0) {
                    const obj = this.scene.objects[this.scene.pickedObjectIndex];
                    const zAxis = vec3.fromValues(0, 0, 1);
                    obj.rotateAroundAxis(zAxis, Math.PI/18, false); // 10 degrees
                }
                break;
            case 'Z':
                // rotate selected object with respect to it's centroid, around Z axis clockwise using quternions
                if (this.scene.pickedObjectIndex >= 0) {
                    const obj = this.scene.objects[this.scene.pickedObjectIndex];
                    const zAxis = vec3.fromValues(0, 0, 1);
                    obj.rotateAroundAxis(zAxis, Math.PI/18, true); // 10 degrees
                }
                break;
            case 't':
                // move selected object centroid by input-translate-x, input-translate-y, input-translate-z
                if (this.scene.pickedObjectIndex >= 0) {
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
                if (this.scene.pickedObjectIndex >= 0) {
                    const obj = this.scene.objects[this.scene.pickedObjectIndex];
                    obj.scaleObject(0.9); // Scale down by 10%
                }
                break;
            case 'ArrowRight':
                // scale up selected object
                if (this.scene.pickedObjectIndex >= 0) {
                    const obj = this.scene.objects[this.scene.pickedObjectIndex];
                    obj.scaleObject(1.1); // Scale up by 10%
                }
                break;
        }
    }
    
    addEventListeners() {
        document.addEventListener("keydown", this.handleKeyPress);


        document.querySelector("#btn-mode-camera-3d-view").onclick = () => { this.setModeCamera3DView(); };
        document.querySelector("#btn-mode-camera-top-view").onclick = () => { this.setModeCameraTopView(); };
        
        document.querySelector("#slider-rotate-camera").oninput = (e) => { this.rotateCamera(-e.target.value); };

        
        this.renderer.domElement.addEventListener("click", this.handleCanvasClick);
    }
}