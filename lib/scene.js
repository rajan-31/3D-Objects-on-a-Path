export class Scene {
    constructor() {
        this.primitives = [{
            type: "lineStrip",
            vertices: [
                 0.2, -0.5, 0, 
                -1,    0,   0, 
                -0.2,  1,   0, 
                 0.5,  0.1, 0,
                 0.2, -0.5, 0
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
                -0.5, -0.5, 0.9, 
                 0.5, -0.2, 0.9, 
                -0.5,  1,   0.9
            ],
            color: [0, 0, 1, 1]
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
}