class GraphVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.vertices = [];
        this.edges = [];
        this.periphery = [];
        this.scale = 1;
        this.offset = { x: 0, y: 0 };
        this.dragging = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.showIndices = true;
        this.currentMaxIndex = 0;
        
        this.setupEventListeners();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.draw();
    }
    
    setupEventListeners() {
        // Mouse events for panning and zooming
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Button event listeners
        document.getElementById('start-btn').addEventListener('click', () => this.startGraph());
        document.getElementById('add-random-btn').addEventListener('click', () => this.addRandomVertex());
        document.getElementById('add-vertex-btn').addEventListener('click', () => this.prepareAddVertex());
        document.getElementById('toggle-display-btn').addEventListener('click', () => this.toggleDisplay());
        document.getElementById('center-btn').addEventListener('click', () => this.centerGraph());
        document.getElementById('goto-btn').addEventListener('click', () => this.goToVertex());
        document.getElementById('zoom-in-btn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out-btn').addEventListener('click', () => this.zoomOut());
    }
    
    handleMouseDown(e) {
        if (e.button === 0) { // Left click
            this.dragging = true;
            this.lastMousePos = { x: e.clientX, y: e.clientY };
            this.canvas.style.cursor = 'grabbing';
        }
    }
    
    handleMouseMove(e) {
        if (this.dragging) {
            const dx = e.clientX - this.lastMousePos.x;
            const dy = e.clientY - this.lastMousePos.y;
            this.offset.x += dx;
            this.offset.y += dy;
            this.lastMousePos = { x: e.clientX, y: e.clientY };
            this.draw();
        }
    }
    
    handleMouseUp() {
        this.dragging = false;
        this.canvas.style.cursor = 'default';
    }
    
    handleWheel(e) {
        e.preventDefault();
        const zoomIntensity = 0.1;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const wheel = e.deltaY < 0 ? 1 : -1;
        const zoom = Math.exp(wheel * zoomIntensity);
        
        this.scale *= zoom;
        this.draw();
    }
    
    draw() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save the context
        this.ctx.save();
        
        // Apply transformations
        this.ctx.translate(this.offset.x, this.offset.y);
        this.ctx.scale(this.scale, this.scale);
        
        // Draw edges
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        for (const edge of this.edges) {
            this.drawEdge(edge);
        }
        
        // Draw vertices
        for (const vertex of this.vertices) {
            this.drawVertex(vertex);
        }
        
        // Restore the context
        this.ctx.restore();
    }
    
    drawVertex(vertex) {
        const radius = 15 + (vertex.index.toString().length * 2);
        
        // Draw vertex as a circle
        this.ctx.beginPath();
        this.ctx.arc(vertex.x, vertex.y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = vertex.color || '#3498db';
        this.ctx.fill();
        this.ctx.strokeStyle = '#2980b9';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw vertex index or value
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        if (this.showIndices) {
            this.ctx.fillText(vertex.index.toString(), vertex.x, vertex.y);
        } else {
            this.ctx.fillText(vertex.colorValue || '1', vertex.x, vertex.y);
        }
    }
    
    drawEdge(edge) {
        this.ctx.beginPath();
        
        // Draw curved edges for better visualization
        const midX = (edge.v1.x + edge.v2.x) / 2;
        const midY = (edge.v1.y + edge.v2.y) / 2;
        
        // Calculate control points for curve
        const dx = edge.v2.x - edge.v1.x;
        const dy = edge.v2.y - edge.v1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize and perpendicular
        const nx = -dy / distance;
        const ny = dx / distance;
        
        // Curve intensity (higher = more curved)
        const curveIntensity = 10;
        
        const ctrlX = midX + nx * curveIntensity;
        const ctrlY = midY + ny * curveIntensity;
        
        this.ctx.moveTo(edge.v1.x, edge.v1.y);
        this.ctx.quadraticCurveTo(ctrlX, ctrlY, edge.v2.x, edge.v2.y);
        this.ctx.stroke();
    }
    
    // Graph manipulation methods
    startGraph() {
        this.vertices = [];
        this.edges = [];
        this.periphery = [];
        
        // Create initial triangle
        const centerX = this.canvas.width / (2 * this.scale) - this.offset.x;
        const centerY = this.canvas.height / (2 * this.scale) - this.offset.y;
        const size = 100;
        
        const v1 = { x: centerX, y: centerY - size, index: 1, color: '#e74c3c', colorValue: '1' };
        const v2 = { x: centerX - size, y: centerY + size, index: 2, color: '#2ecc71', colorValue: '2' };
        const v3 = { x: centerX + size, y: centerY + size, index: 3, color: '#3498db', colorValue: '3' };
        
        this.vertices.push(v1, v2, v3);
        this.edges.push({ v1: v1, v2: v2 }, { v1: v2, v2: v3 }, { v1: v3, v2: v1 });
        this.periphery = [v1, v2, v3];
        this.currentMaxIndex = 3;
        
        this.draw();
    }
    
    addRandomVertex() {
        if (this.vertices.length < 3) {
            alert("Please start with a basic graph first!");
            return;
        }
        
        if (this.periphery.length < 2) return;
        
        // Select two random peripheral vertices
        const randomIndex1 = Math.floor(Math.random() * this.periphery.length);
        let randomIndex2;
        do {
            randomIndex2 = Math.floor(Math.random() * this.periphery.length);
        } while (randomIndex2 === randomIndex1);
        
        const vp = this.periphery[Math.min(randomIndex1, randomIndex2)];
        const vq = this.periphery[Math.max(randomIndex1, randomIndex2)];
        
        this.addVertexBetween(vp, vq);
    }
    
    prepareAddVertex() {
        if (this.vertices.length < 3) {
            alert("Please start with a basic graph first!");
            return;
        }
        
        this.canvas.style.cursor = 'crosshair';
        this.selectingFirstVertex = true;
        this.selectedVertices = [];
        
        const clickHandler = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.offset.x) / this.scale;
            const y = (e.clientY - rect.top - this.offset.y) / this.scale;
            
            // Find clicked vertex
            const clickedVertex = this.vertices.find(v => {
                const dx = v.x - x;
                const dy = v.y - y;
                return Math.sqrt(dx * dx + dy * dy) <= 20;
            });
            
            if (clickedVertex && this.periphery.includes(clickedVertex)) {
                this.selectedVertices.push(clickedVertex);
                
                if (this.selectedVertices.length === 2) {
                    this.canvas.removeEventListener('click', clickHandler);
                    this.canvas.style.cursor = 'default';
                    this.addVertexBetween(this.selectedVertices[0], this.selectedVertices[1]);
                }
            }
        };
        
        this.canvas.addEventListener('click', clickHandler);
    }
    
    addVertexBetween(vp, vq) {
        const vpIndex = this.periphery.indexOf(vp);
        const vqIndex = this.periphery.indexOf(vq);
        
        if (vpIndex === -1 || vqIndex === -1) {
            alert("Selected vertices must be on the periphery!");
            return;
        }
        
        // Get vertices between vp and vq in clockwise order
        let verticesToConnect = [];
        if (vpIndex < vqIndex) {
            verticesToConnect = this.periphery.slice(vpIndex, vqIndex + 1);
        } else {
            verticesToConnect = this.periphery.slice(vpIndex).concat(this.periphery.slice(0, vqIndex + 1));
        }
        
        // Create new vertex
        this.currentMaxIndex++;
        const newVertex = {
            x: 0,
            y: 0,
            index: this.currentMaxIndex,
            color: this.getRandomColor(),
            colorValue: (Math.floor(Math.random() * 4) + 1).toString()
        };
        
        // Calculate position (average of connected vertices)
        let sumX = 0, sumY = 0;
        verticesToConnect.forEach(v => {
            sumX += v.x;
            sumY += v.y;
        });
        newVertex.x = sumX / verticesToConnect.length;
        newVertex.y = sumY / verticesToConnect.length;
        
        // Move outward from center for better visibility
        const centerX = this.canvas.width / (2 * this.scale) - this.offset.x;
        const centerY = this.canvas.height / (2 * this.scale) - this.offset.y;
        
        const dx = newVertex.x - centerX;
        const dy = newVertex.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        newVertex.x = centerX + dx * (distance + 50) / distance;
        newVertex.y = centerY + dy * (distance + 50) / distance;
        
        // Add new vertex
        this.vertices.push(newVertex);
        
        // Add edges to all connected vertices
        verticesToConnect.forEach(v => {
            this.edges.push({ v1: newVertex, v2: v });
        });
        
        // Update periphery
        this.updatePeriphery(newVertex, vp, vq, verticesToConnect);
        
        this.draw();
    }
    
    updatePeriphery(newVertex, vp, vq, verticesToConnect) {
        const vpIndex = this.periphery.indexOf(vp);
        const vqIndex = this.periphery.indexOf(vq);
        
        if (vpIndex < vqIndex) {
            // Replace the segment between vp and vq with the new vertex
            this.periphery.splice(vpIndex + 1, vqIndex - vpIndex - 1, newVertex);
        } else {
            // Handle wrap-around case
            this.periphery.splice(vpIndex + 1, this.periphery.length - vpIndex - 1, newVertex);
            this.periphery.splice(0, vqIndex);
        }
    }
    
    toggleDisplay() {
        this.showIndices = !this.showIndices;
        this.draw();
    }
    
    centerGraph() {
        this.offset = { x: 0, y: 0 };
        this.scale = 1;
        this.draw();
    }
    
    goToVertex() {
        const index = parseInt(document.getElementById('goto-input').value);
        if (isNaN(index) || index < 1 || index > this.vertices.length) {
            alert("Please enter a valid vertex index!");
            return;
        }
        
        const vertex = this.vertices.find(v => v.index === index);
        if (vertex) {
            this.offset.x = -vertex.x * this.scale + this.canvas.width / 2;
            this.offset.y = -vertex.y * this.scale + this.canvas.height / 2;
            this.draw();
        }
    }
    
    zoomIn() {
        this.scale *= 1.2;
        this.draw();
    }
    
    zoomOut() {
        this.scale /= 1.2;
        this.draw();
    }
    
    getRandomColor() {
        const colors = ['#e74c3c', '#2ecc71', '#3498db', '#f39c12', '#9b59b6', '#1abc9c', '#d35400'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

// Initialize the visualizer when the page loads
window.addEventListener('load', () => {
    const canvas = document.getElementById('graph-canvas');
    window.graphVisualizer = new GraphVisualizer(canvas);
});
