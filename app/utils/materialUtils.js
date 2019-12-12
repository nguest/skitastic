import { Vector2 } from 'three';

export const planeUnwrapUVs = (geometry) => {
  for (var i = 0; i < geometry.faces.length; i+=2) {
    // calculate the x and z sizes of the first triangle of 2
    const i1 = geometry.faces[i].a;
    const i2 = geometry.faces[i].b;
    const i3 = geometry.faces[i].c;

    const v1 = geometry.vertices[i1];
    const v2 = geometry.vertices[i2]
    const v3 = geometry.vertices[i3]

    const k = 500; // scale factor
    const u = (v2.x - v1.x) / k;
    const v = (v3.z - v1.z) / k;

    // two triangles per face
    geometry.faceVertexUvs[0].push([
      new Vector2( 0, 0 ),
      new Vector2( 0, u ),
      new Vector2( v, 0 ),    
    ]);
    //geometry.faces[ 2 * i ].materialIndex = i;

    geometry.faceVertexUvs[0].push([
      new Vector2( 0, u ),
      new Vector2( v, u ),
      new Vector2( v, 0 ),
    ]);
    //geometry.faces[ 2 * i + 1 ].materialIndex = i;
  }
  geometry.elementsNeedUpdate = geometry.verticesNeedUpdate = true;
}

export const simplePlaneUnwrapUVs = (geometry) => {
  const x = 1;
  const y = 1;
  for (var i = 0; i <= geometry.faces.length * 0.5; i++) {
    // two triangles per face
    geometry.faceVertexUvs[0].push([
      new Vector2( 0, 0 ),
      new Vector2( 0, x ),
      new Vector2( y, 0 ),    
    ]);

    //geometry.faces[ 2 * i ].materialIndex = i;

    geometry.faceVertexUvs[0].push([
      new Vector2( 0, x ),
      new Vector2( y, x ),
      new Vector2( y, 0 ),
    ]);

    //geometry.faces[ 2 * i + 1 ].materialIndex = i;
  }
  geometry.elementsNeedUpdate = geometry.verticesNeedUpdate = true;
}