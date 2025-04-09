# 3D Object Manipulation and Path Movement

This application demonstrates various 3D object manipulations and automated movement along a defined path.

## Features

### Object Selection and Manipulation

- **Object Selection**: Click on objects in Top View mode to select them
- **Rotation**:
  - `x`/`X`: Rotate around X-axis (anticlockwise/clockwise)
  - `y`/`Y`: Rotate around Y-axis (anticlockwise/clockwise) 
  - `z`/`Z`: Rotate around Z-axis (anticlockwise/clockwise)
- **Translation**: Enter values in X, Y, Z fields and press the Translate button or `t` key
- **Scaling**: 
  - `ArrowRight`: Scale up selected object
  - `ArrowLeft`: Scale down selected object

### Path Movement

The application allows objects to move along a quadratic curve defined by three control points:

1. **Path Definition**:
   - Select an object in Top View mode
   - Press `p` key to start path definition
   - The first point (p0) is the current position of the object
   - Click on the canvas to define two more points (p1 and p2)
   - The system generates a quadratic curve passing through all three points

2. **Movement Control**:
   - The object automatically moves along the defined path
   - Press `↑` to increase movement speed
   - Press `↓` to decrease movement speed
   - Press `Esc` to cancel path definition (before movement starts)

3. **Path Completion**:
   - The object stops when it reaches the final point (p2)
   - After reaching p2, the object is no longer selected

### Camera Controls

- **View Modes**:
  - `V`: Switch to 3D View
  - `v`: Switch to Top View (required for object selection and path definition)
- **Camera Rotation**: Use the slider to rotate around the scene in 3D View

## Implementation Details

- Path movement is implemented using a quadratic curve: `p(t) = at² + bt + c`
- The coefficients are calculated by solving for the three control points
- The object's position is updated at each frame based on the parametric equation
- The path is visualized as a yellow curve with colored control points

- In current implementation of object picking using R channel, max 255 objects can be picked.
    - This limitation can be easily removed by utilizing all 4 channels (RGBA)

Defining the movement path: 
    1. When in Top View mode. Assume the current position of the selected object is p0. Choose a path for the selected object to move, by selecting 2 more points, p1 and p2, by clicking in the canvas. The selected points need to be mapped from screen coordinates back to world coordinates. Since this view only provides a 2D view, use the x,y values as selected here, and assign an arbitrary non-zero value for the z-coordinate of the picked point. 
    2. Generate a quadratic curve through these points that serves as the path of the moving object. Evaluating  the points along this curve produces the points that the (center or origin of the) object moves through. 

Automated Movement: 
    1. The selected object should move along a smooth curve that interpolates p0, p1, p2. 
    2. The object stops when it reaches p2, and is no longer the selected object 
    3. The speed of the moving object can be controlled 
        - increased or decreased 
        - using key bindings 

When the object is stationary (i.e. at point p0 or p2), it can be rotated about the x, y or z-axis using key bindings I. J. The size of the moving object can be scaled up or down when it is stationary, again using key bindings.

Movement Path: Given the points p0, p1, p2, you can fit a quadratic curve through p0, p1, p2 by solving for a, b, c in the following. Note that a, b, c are vectors, so, you will solve for coefficients in each of the 3 dimensions.  
p(t) = at^2 + bt + c 
p(0) = p0 
p(1) = p2 
p(t1) = p1 for some 0 < t1 < 1
We can assume that p0, p1, p2 are not collinear and not too close to each other.

up and down arrows can increase/decrease the speed of the object

---

- I have used external library to import 3d models (webgl-obj-loader, https://github.com/frenchtoast747/webgl-obj-loader)
- Does object rotations need to be around x axis of object or world