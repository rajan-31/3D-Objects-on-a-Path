export const fragmentShaderSrc = `
    precision mediump float;
    uniform vec4 u_color;
    uniform vec3 u_ambientLight;
    uniform vec3 u_lightColor;
    uniform float u_shininess;

    varying vec3 v_normal;
    varying vec3 v_surfaceToLight;
    varying vec3 v_surfaceToView;
    
    void main() {
        // Normalize vectors for lighting calculation
        vec3 normal = normalize(v_normal);
        vec3 surfaceToLight = normalize(v_surfaceToLight);
        vec3 surfaceToView = normalize(v_surfaceToView);
        vec3 halfVector = normalize(surfaceToLight + surfaceToView);

        // Calculate lighting components
        float diffuse = max(dot(normal, surfaceToLight), 0.0);
        float specular = 0.0;
        if (diffuse > 0.0) {
            specular = pow(max(dot(normal, halfVector), 0.0), u_shininess);
        }

        // Calculate final color with lighting
        vec3 objectColor = u_color.rgb;
        vec3 ambientColor = u_ambientLight * objectColor;
        vec3 diffuseColor = u_lightColor * objectColor * diffuse;
        vec3 specularColor = u_lightColor * specular;

        vec3 finalColor = ambientColor + diffuseColor + specularColor;
        gl_FragColor = vec4(finalColor, u_color.a);
    }
`