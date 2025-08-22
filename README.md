# Planar Triangulated Graph Visualizer

A web-based tool for drawing and manipulating planar triangulated graphs with dynamic vertex addition.

How to Use
Getting Started
Click "Start Graph" to initialize with a basic triangle

Use "Add Vertex" to manually add vertices by selecting two peripheral vertices

Use "Random Vertex" for automatic vertex addition between random peripheral vertices

Navigation
Pan: Click and drag anywhere on the canvas

Zoom: Use mouse wheel or the Zoom In/Out buttons

Center View: Click the "Center" button to reset the view

Go to Vertex: Enter a vertex index and click "Go to Vertex"

Display Options
Toggle Display: Switch between showing vertex indices and color values

Theme Toggle: Switch between dark and light mode using the sun/moon icon

Controls Layout
Top Bar
Start Graph

Random Vertex

Add Vertex

Theme Toggle

Right Side
Toggle Display

Bottom Center
Zoom In

Zoom Out

Center View

Left Side
Vertex index input

Go to Vertex button

Bottom Right
Tutorial button (question mark icon)

Technical Details
Graph Representation
The application represents graphs using:

Vertex list with properties (position, index, color, colorValue)

Edge list connecting vertices

Periphery tracking for proper vertex addition

Algorithms
Planar graph maintenance with triangulation

Curved edge rendering for visual clarity

Automatic vertex placement with periphery consideration
