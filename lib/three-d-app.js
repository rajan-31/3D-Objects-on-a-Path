export class ThreeDApp {
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