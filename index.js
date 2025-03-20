import {vec2, mat3, mat4} from "./vendor/gl-matrix/index.js";
import "./vendor/webgl-obj-loader.min.js"

import {vertexShaderSrc} from "./shaders/vertex.js";
import {fragmentShaderSrc} from "./shaders/fragment.js";
import {WebGLRenderer} from "./lib/renderer.js";
import {Shader} from "./lib/shader.js";
import {Scene} from "./lib/scene.js";
import {Transform} from "./lib/transform.js";

import {ThreeDApp} from "./lib/three-d-app.js";

// =====================================
//                  SETUP
// =====================================

const renderer = new WebGLRenderer();
document.body.prepend(renderer.domElement);

const shader = new Shader(renderer.glContext(), vertexShaderSrc, fragmentShaderSrc);
shader.use();

renderer.setSize(500, 500, shader);


const transform = new Transform(shader, renderer);
transform.setWorldMatrix(mat4.identity(transform.worldMatrix));
transform.setViewMatrix(
    [2, 2, 2],   // Camera position
    [0, 0, 0],    // Point to look at (center of scene)
    [0, 1, 0]    // Up direction (Y-axis becomes "up" in camera space)
);
transform.setProjectionMatrix(
    Math.PI / 3,                                            // FOV
    renderer.domElement.width / renderer.domElement.height, // Aspect ratio
    0.1,                                                    // Near clipping plane
    100.0                                                   // Far clipping plane
);


const scene = new Scene(OBJ);
scene.loadModel("./assets/models/Cube-Cylinder.obj", [125, 50, 50, 100]);
scene.loadModel("./assets/models/Sphere_Sculpted.obj", [0, 200, 110, 100]);
// scene.loadModel("./assets/models/Axes.obj", [0, 0, 0, 100]);
scene.loadModel("./assets/models/Axis_X.obj", [255, 0, 0, 100]);
scene.loadModel("./assets/models/Axis_Y.obj", [0, 0, 255, 100]);
scene.loadModel("./assets/models/Axis_Z.obj", [0, 255, 0, 100]);


const threeDApp = new ThreeDApp(transform);
threeDApp.addEventListeners();

// =====================================
//          Animation Loop
// =====================================

function animation() {   
    renderer.clear(200, 200, 200, 100);
    renderer.render(scene, shader);
}

renderer.setAnimationLoop(animation);