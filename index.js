import {vec2, mat3, mat4} from "./vendor/gl-matrix/index.js";

import {vertexShaderSrc} from "./shaders/vertex.js";
import {fragmentShaderSrc} from "./shaders/fragment.js";
import {WebGLRenderer} from "./lib/renderer.js";
import {Shader} from "./lib/shader.js";
import {Scene} from "./lib/scene.js";
import {Transform} from "./lib/transform.js";

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
    [0, 0, 2], // Camera position
    [0, 0, 0], // Point to look at
    [0, 1, 0]  // Up direction
);
transform.setProjectionMatrix(
    Math.PI / 3,                                            // FOV
    renderer.domElement.width / renderer.domElement.height, // Aspect ratio
    0.1,                                                    // Near clipping plane
    100.0                                                   // Far clipping plane
);


const scene = new Scene();

// =====================================
//          Animation Loop
// =====================================

// For rotation animation
let angle = 0;

function animation() {   
    renderer.clear(200, 200, 200, 100);
    renderer.render(scene, shader);
}

renderer.setAnimationLoop(animation);