# 3D Object Manipulation and Path Movement

## Implementation

The application allows for importing custom 3D models, selecting and transforming them, and animating their movement along a quadratic curve path.

### **Core Features Implemented**

1. Multiple View Modes:

   * Top View mode for object selection and path definition

   * 3D View mode with rotatable camera for visualizing the scene

2. 3D Model Handling:

   * Successfully imported custom 3D models in common formats

   * Created a dedicated object-oriented architecture for managing model data

3. Object Transformations:

   * Scale, rotate, and translate operations on individual objects

   * Quaternion-based rotation to avoid gimbal lock

   * All transformations implemented relative to local coordinate systems

4. Path Definition and Movement:

   * Quadratic curve path definition through three points

   * Smooth object animation along the defined path

   * Variable speed control during movement

5. User Interaction:

   * Object picking in Top View mode

   * Camera rotation with both slider controls and mouse drag

   * Keyboard shortcuts for all transformations and view modes

### **Technical Implementation Details**

#### 3D Rendering Pipeline

The application uses WebGL with world, view, and projection matrices to create a complete 3D rendering pipeline. This extended the 2D implementation from Assignment 1 by adding proper 3D transformations and depth testing.

#### Transformation Matrix Arrangement

Transformation matrices follow the order: 

`modelTransformMatrix = translationMatrix * rotationMatrix * scaleMatrix`. 

This ensures that objects are first scaled, then rotated around their local origin, and finally translated to their world position.

#### Quadratic Curve Path

For the quadratic curve implementation, a parametric equation p(t) \= at² \+ bt \+ c was used where:

* t=0 corresponds to the starting position (p0)

* t=1 corresponds to the ending position (p2)

* t=0.5 was chosen for the middle control point (p1)

The coefficients were computed by solving a system of equations to ensure the curve passes through all three points.

### **Challenges Faced**

1. Object Transformation Reference Frame:

   * Initially, transformations were happening relative to global axes instead of local object axes

   * Resolved by implementing proper quaternion-based rotations and maintaining local object coordinate systems

2. Object Picking:

   * I had to render a separate picking framebuffer that used unique color IDs and a depth buffer to determine which object was clicked.

   * Updated picking logic to account for object transformations

   * In current implementation of object picking using R channel, max 255 objects can be picked.

     1. This limitation can be easily removed by utilizing all 4 channels (RGBA)

3. Path Animation Smoothness:

   * Ensuring smooth movement along curved paths required precise coefficient calculation

### **Conclusion**

The assignment successfully demonstrated key 3D graphics concepts including model transformation, view transformation, object picking, and animation along parametric curves. The implementation provides a solid foundation for more complex 3D graphics applications and effectively builds upon the concepts from Assignment 1\.

By leveraging modern WebGL features and maintaining a clean architecture, the application achieves good performance even with multiple 3D models and complex transformations. The quaternion-based rotation system and local coordinate transformations ensure accurate and intuitive object manipulation.

## References

[https://webglfundamentals.org/](https://webglfundamentals.org/)

For extracting vertex, normals, etc. from `.obj` file

[https://github.com/frenchtoast747/webgl-obj-loader](https://github.com/frenchtoast747/webgl-obj-loader)

[https://webglfundamentals.org/webgl/lessons/webgl-picking.html](https://webglfundamentals.org/webgl/lessons/webgl-picking.html)

[https://learnwebgl.brown37.net/11\_advanced\_rendering/selecting\_objects.html](https://learnwebgl.brown37.net/11_advanced_rendering/selecting_objects.html)

[https://webglfundamentals.org/webgl/lessons/webgl-3d-lighting-point.html](https://webglfundamentals.org/webgl/lessons/webgl-3d-lighting-point.html)

# Screenshots and Video

[https://youtu.be/Eem88xRh6R8](https://youtu.be/Eem88xRh6R8)