import {vec2, mat3, mat4} from "./vendor/gl-matrix/index.js";

import {vertexShaderSrc} from "./shaders/vertex.js";
import {fragmentShaderSrc} from "./shaders/fragment.js";
import {WebGLRenderer} from "./lib/renderer.js";
import {Shader} from "./lib/shader.js";
import {Scene} from "./lib/scene.js";

// =====================================
//                  SETUP
// =====================================

const renderer = new WebGLRenderer();
document.body.prepend(renderer.domElement);

const shader = new Shader(renderer.glContext(), vertexShaderSrc, fragmentShaderSrc);
shader.use();

renderer.setSize(500, 500, shader);

// Create transformation matrices
const worldMatrix = mat4.create();
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();

// Initialize world matrix (model matrix)
mat4.identity(worldMatrix);

// Initialize view matrix (camera)
mat4.lookAt(viewMatrix, 
    [0, 0, 2],    // Camera position
    [0, 0, 0],    // Point to look at
    [0, 1, 0]     // Up direction
);

// Initialize projection matrix (perspective)
mat4.perspective(projectionMatrix,
    Math.PI / 4,  // Field of view (45 degrees)
    renderer.domElement.width / renderer.domElement.height, // Aspect ratio
    0.1,          // Near clipping plane
    100.0         // Far clipping plane
);

// Pass matrices to shader
shader.setUniformMatrix4fv("mWorld", worldMatrix);
shader.setUniformMatrix4fv("mView", viewMatrix);
shader.setUniformMatrix4fv("mProjection", projectionMatrix);

const scene = new Scene(shader);

// =====================================
//          Animation Loop
// =====================================

// For rotation animation
let angle = 0;

function animation() {
    // Update world matrix for rotation
    mat4.identity(worldMatrix);
    mat4.rotateY(worldMatrix, worldMatrix, angle);
    angle += 0.01;
    
    // Update shader uniforms
    shader.setUniformMatrix4fv("mWorld", worldMatrix);
    
    renderer.clear(200, 200, 200, 100);
    renderer.render(scene, shader);
}

renderer.setAnimationLoop(animation);