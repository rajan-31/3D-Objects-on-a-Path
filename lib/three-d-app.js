export class ThreeDApp {
    constructor(transform) {
        this.transform = transform;
    }

    // ============================================================

    setModeCamera3DView() {
        this.transform.setViewMatrix(
            [2, 2, 2],   // Camera position
            [0, 0, 0],    // Point to look at (center of scene)
            [0, 1, 0]    // Up direction (Y-axis becomes "up" in camera space)
        );
    }

    setModeCameraTopView() {
        this.transform.setViewMatrix(
            [0, 0, 3],   // Camera position (high on Z-axis)
            [0, 0, 0],    // Point to look at (center of scene)
            [0, 1, 0]    // Up direction (Y-axis becomes "up" in camera space)
        );
    }

    // ============================================================

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
        
    }
}