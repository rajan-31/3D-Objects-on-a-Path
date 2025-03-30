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
        this.highlightedObjectIndex = -1;
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
        // Pre-allocate a single Float32Array for better memory efficiency and performance
        const vertexCount = mesh.indices.length;
        const vertices = new Float32Array(vertexCount * 3);
        
        // Build flat vertex array from indexed data
        let vertexIndex = 0;
        for (let i = 0; i < mesh.indices.length; i++) {
            const idx = mesh.indices[i] * 3;
            vertices[vertexIndex++] = mesh.vertices[idx];
            vertices[vertexIndex++] = mesh.vertices[idx + 1];
            vertices[vertexIndex++] = mesh.vertices[idx + 2];
        }

        if (fixed) {
            this.fixedObjects.push({
                type: "fixed-object",
                vertices: vertices,
                vertexCount: vertexCount,
                color: [color[0]/255, color[1]/255, color[2]/255, color[3]/100]
            });
        } else {
            this.objects.push({
                type: "object",
                vertices: vertices,
                vertexCount: vertexCount,
                color: [color[0]/255, color[1]/255, color[2]/255, color[3]/100]
            });
        }
    }
}