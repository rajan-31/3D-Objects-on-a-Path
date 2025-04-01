import { ThreeDObject } from "./three-d-object.js";

export class Scene {
    constructor(OBJ) {
        this.OBJ = OBJ;
        
        this.primitives = [
        // {
        //     type: "lineStrip",
        //     vertices: [
        //          0.2, -0.5, -0.5, 
        //         -1,    0,   -0.5, 
        //         -0.2,  1,   -0.5, 
        //          0.5,  0.1, -0.5,
        //          0.2, -0.5, -0.5
        //     ],
        //     color: [1, 0, 0, 1]
        // },
        // // triangle 1
        // {
        //     type: "triangle",
        //     vertices: [
        //         0, 0, 0.3, 
        //         1, 0, 0.3, 
        //         0, 1, 0.3
        //     ],
        //     color: [0, 1, 0, 1]
        // },
        // // triangle 2
        // {
        //     type: "triangle",
        //     vertices: [
        //         -0.5, -0.5, -0.9, 
        //          0.5, -0.2, 0, 
        //         -0.5,  1,   0.9
        //     ],
        //     color: [0, 0, 1, 1]
        // },
        // {
        //     type: "triangle",
        //     vertices: [
        //         0, -0.3, 0, 
        //         1, 0, 0, 
        //         0, 1, 0
        //     ],
        //     color: [0, 0.5, 0.7, 1]
        // },
        // {
        //     type: "triangle",
        //     vertices: [
        //         0, 0.3, 0, 
        //         1, 0.3, 0, 
        //         0, 0.3, 1
        //     ],
        //     color: [0.6, 1, 0, 1]
        // },
        ];

        this.fixedObjects = []

        this.objects = []
        this.pickedObjectIndex = -1;
        this.highlightColor = [1, 1, 0, 1];
    }

    add(primitive) {
        this.primitives.push(primitive);
    }

    getPrimitives() {
        return this.primitives;
    }

    getPrimitive(index) {
        return this.primitives[index];
    }

    // ============================================================

    async loadModel(objContentURL, color, scale=1, fixed=false) {
        const response = await fetch(objContentURL);
        const objContent = await response.text();

        // Parse OBJ
        const mesh = new this.OBJ.Mesh(objContent);
        
        // Scale down vertices (optional)
        mesh.vertices = mesh.vertices.map(v => v * scale);

        // Convert to triangles (handles quads automatically)
        this.addObject(mesh, color, fixed);
    }

    addObject(mesh, color, fixed) {
        const threeDObject = new ThreeDObject();
        threeDObject.setObject(mesh, color);

        if (fixed) {
            threeDObject.type = "fixed-object";
            this.fixedObjects.push(threeDObject);
        } else {
            threeDObject.type = "object";
            this.objects.push(threeDObject);
        }
    }
}