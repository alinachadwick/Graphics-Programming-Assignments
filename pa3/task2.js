function catmullClarkSubdivision(vertices, faces) {
    var newVertices = [];
    var newFaces = [];
    
    var edgeMap = {};
    // This function tries to insert the centroid of the edge between
    // vertices a and b into the newVertices array.
    // If the edge has already been inserted previously, the index of
    // the previously inserted centroid is returned.
    // Otherwise, the centroid is inserted and its index returned.
    function getOrInsertEdge(a, b, centroid) {
        var edgeKey = a < b ? a + ":" + b : b + ":" + a;
        if (edgeKey in edgeMap) {
            return edgeMap[edgeKey];
        } else {
            var idx = newVertices.length;
            newVertices.push(centroid);
            edgeMap[edgeKey] = idx;
            return idx;
        }
    }
    
    // TODO: Implement a function that computes one step of the Catmull-Clark subdivision algorithm.
    //
    // Input:
    // `vertices`: An array of Vectors, describing the positions of every vertex in the mesh
    // `faces`: An array of arrays, specifying a list of faces. Every face is a list of vertex
    //          indices, specifying its corners. Faces may contain an arbitrary number
    //          of vertices (expect triangles, quadrilaterals, etc.)
    //
    // Output: Fill in newVertices and newFaces with the vertex positions and
    //         and faces after one step of Catmull-Clark subdivision.
    // It should hold:
    //         newFaces[i].length == 4, for all i
    //         (even though the input may consist of any of triangles, quadrilaterals, etc.,
    //          Catmull-Clark will always output quadrilaterals)
    //
    // Pseudo code follows:
 
    // helper function to find the centroid of a face given an array of faces
    function getCentroid(face, arr, faces, size) {
        var all = new Vector(0, 0, 0);

        for (i = 0; i < size; i++){
             Vector.add(all, arr[faces[face][i]], all);
        }

        Vector.divide(all, size, all); //normalize to find center point
        
        return all;
    }

    for (var v = 0; v < vertices.length; v++){
        newVertices.push(vertices[v]);
    }
    
    for (var face = 0; face < faces.length; face++){
        newVertices.push(getCentroid(face, vertices, faces, faces[face].length)); //add centroid to new vertices
        facePointIndex = newVertices.length - 1;   //update the face point index

        //for loop to push new faces
        for (var i = 0; i < faces[face].length; i++){
            var index0 = i % faces[face].length;
            var index1 = (i + 1) % faces[face].length;
            var index2 = (i + 2) % faces[face].length;

            var v0 = faces[face][index0];
            var v1 = faces[face][index1];
            var v2 = faces[face][index2];

            var centroid1 = (vertices[v0].add(vertices[v1])).divide(2);
            var centroid2 = (vertices[v1].add(vertices[v2])).divide(2);
            var edgePointA = getOrInsertEdge(v0, v1,centroid1);
            var edgePointB = getOrInsertEdge(v1, v2, centroid2);

            newFaces.push([facePointIndex, edgePointA, v1, edgePointB]);
        }
    }

    //step 2
    var avgV = []
    var avgN = []
    for (var i = 0; i < newVertices.length; i ++){
        avgV.push(new Vector(0, 0, 0));
        avgN.push(0);
    }

    for (var face = 0; face < newFaces.length; face++){
        var c = getCentroid(face, newVertices, newFaces, newFaces[face].length);
        for (var i = 0; i < newFaces[face].length; i++){
            var v = newFaces[face][i]; 
            Vector.add(avgV[v], c, avgV[v]);
            avgN[v] = avgN[v] + 1;
            
        }
    }

    for (var i = 0; i < avgV.length; i++){
        Vector.divide(avgV[i], avgN[i], avgV[i]);
        
    }

    //step 3
    for (var i = 0; i < avgV.length; i++){
        var t = 4/avgN[i];
        Vector.multiply(newVertices[i], 1 - t, newVertices[i]);
        Vector.multiply(avgV[i], t, avgV[i]);
        Vector.add(newVertices[i], avgV[i], newVertices[i]);
    }
    // Do not remove this line
    return new Mesh(newVertices, newFaces);
};

function extraCreditMesh() {
    // TODO: Insert your own creative mesh here
    // Mesh that is supposed to look like the star wars space ship (via https://dwgyu36up6iuz.cloudfront.net/heru80fdn/image/upload/c_fill,d_placeholder_wired.png,fl_progressive,g_face,h_450,q_80,w_800/v1576594418/wired_each-and-every-starfighter-in-star-wars-explained.jpg)
    var vertices = [
        new Vector(1.5, -1, 0),
        new Vector(0.5, 1, 0),
        new Vector(0, 0, 1),
        new Vector(-1, 1, 0),
        new Vector(-1, -0.5, 0),
        new Vector(-0.5, -1, 0)


    ];
    
    var faces = [
        [0, 2, 1],
        [1, 2, 3],
        [3, 2, 4],
        [4, 2, 5],
        [5, 2, 0],
        [0, 1, 3, 4, 5]
    ];
    
    return new Mesh(vertices, faces);
}

var Task2 = function(gl) {
    this.pitch = 0;
    this.yaw = 0;
    this.subdivisionLevel = 0;
    this.selectedModel = 0;
    this.gl = gl;
    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    
    this.baseMeshes = [];
    for (var i = 0; i < 6; ++i)
        this.baseMeshes.push(this.baseMesh(i).toTriangleMesh(gl));
    
    this.computeMesh();
}

Task2.prototype.setSubdivisionLevel = function(subdivisionLevel) {
    this.subdivisionLevel = subdivisionLevel;
    this.computeMesh();
}

Task2.prototype.selectModel = function(idx) {
    this.selectedModel = idx;
    this.computeMesh();
}

Task2.prototype.baseMesh = function(modelIndex) {
    switch(modelIndex) {
    case 0: return createCubeMesh(); break;
    case 1: return createTorus(8, 4, 0.5); break;
    case 2: return createSphere(4, 3); break;
    case 3: return createIcosahedron(); break;
    case 4: return createOctahedron(); break;
    case 5: return extraCreditMesh(); break;
    }
    return null;
}

Task2.prototype.computeMesh = function() {
    var mesh = this.baseMesh(this.selectedModel);
    
    for (var i = 0; i < this.subdivisionLevel; ++i)
        mesh = catmullClarkSubdivision(mesh.vertices, mesh.faces);
    
    this.mesh = mesh.toTriangleMesh(this.gl);
}

Task2.prototype.render = function(gl, w, h) {
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var projection = Matrix.perspective(35, w/h, 0.1, 100);
    var view =
        Matrix.translate(0, 0, -5).multiply(
        Matrix.rotate(this.pitch, 1, 0, 0)).multiply(
        Matrix.rotate(this.yaw, 0, 1, 0));
    var model = new Matrix();
    
    if (this.subdivisionLevel > 0)
        this.baseMeshes[this.selectedModel].render(gl, model, view, projection, false, true, new Vector(0.7, 0.7, 0.7));

    this.mesh.render(gl, model, view, projection);
}

Task2.prototype.dragCamera = function(dx, dy) {
    this.pitch = Math.min(Math.max(this.pitch + dy*0.5, -90), 90);
    this.yaw = this.yaw + dx*0.5;
}
