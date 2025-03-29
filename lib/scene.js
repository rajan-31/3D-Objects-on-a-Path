export class Scene {
    constructor(OBJ) {
        this.OBJ = OBJ;
        
        this.primitives = [{
            type: "lineStrip",
            vertices: [
                 0.2, -0.5, -0.5, 
                -1,    0,   -0.5, 
                -0.2,  1,   -0.5, 
                 0.5,  0.1, -0.5,
                 0.2, -0.5, -0.5
            ],
            color: [1, 0, 0, 1]
        },
        // triangle 1
        {
            type: "triangle",
            vertices: [
                0, 0, 0.3, 
                1, 0, 0.3, 
                0, 1, 0.3
            ],
            color: [0, 1, 0, 1]
        },
        // triangle 2
        {
            type: "triangle",
            vertices: [
                -0.5, -0.5, -0.9, 
                 0.5, -0.2, 0, 
                -0.5,  1,   0.9
            ],
            color: [0, 0, 1, 1]
        },
        {
            type: "triangle",
            vertices: [
                0, -0.3, 0, 
                1, 0, 0, 
                0, 1, 0
            ],
            color: [0, 0.5, 0.7, 1]
        }];
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

    async loadModel(objContentURL, color, scale=1) {
        const response = await fetch(objContentURL);
        const objContent = await response.text();

        // Parse OBJ
        const mesh = new this.OBJ.Mesh(objContent);
        
        // Scale down vertices (optional)
        mesh.vertices = mesh.vertices.map(v => v * scale);

        // Convert to triangles (handles quads automatically)
        this.addMeshAsTriangles(mesh, color);
    }

    addMeshAsTriangles(mesh, color) {
        // Iterate through faces (triangles)
        for (let i = 0; i < mesh.indices.length; i += 3) {
            const v0 = mesh.indices[i];
            const v1 = mesh.indices[i + 1];
            const v2 = mesh.indices[i + 2];

            this.primitives.push({
                type: "triangle",
                vertices: [
                    mesh.vertices[v0 * 3], mesh.vertices[v0 * 3 + 1], mesh.vertices[v0 * 3 + 2],
                    mesh.vertices[v1 * 3], mesh.vertices[v1 * 3 + 1], mesh.vertices[v1 * 3 + 2],
                    mesh.vertices[v2 * 3], mesh.vertices[v2 * 3 + 1], mesh.vertices[v2 * 3 + 2]
                ],
                color: [color[0]/255, color[1]/255, color[2]/255, color[3]/100]
            });
        }
    }
}