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


const scene = new Scene(shader);

// =====================================
//          Animation Loop
// =====================================

function animation() {
    renderer.clear(200, 200, 200, 100);
    renderer.render(scene, shader);
}

renderer.setAnimationLoop(animation);