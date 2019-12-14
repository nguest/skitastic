import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../../modules/physics-module';

export default class Perimeters extends WHS.MeshComponent {
  constructor(params = {}) {
    super(params);
  }

  build() {
    const { baseGeometries, height, visible } = this.params
    const createdGeometry = createGeometries(baseGeometries, height);

    const { geometry, material } = this.applyBridge({
      geometry: createdGeometry,
      material: new THREE.MeshPhongMaterial(),
    });


    material.visible = false;
    if (visible) {
      simplePlaneUnwrapUVs(geometry);
      material.visible = true;
      material.map = new THREE.TextureLoader().load('../assets/fence.png', map => {
        map.wrapT = map.wrapS = THREE.ClampToEdgeWrapping;
        map.wrapT = map.wrapS = THREE.RepeatWrapping;
        map.repeat.set(5,1);
        //map.transparent = true;
      });
  
      material.transparent = true;
      material.side = THREE.DoubleSide;
      material.emissive = new THREE.Color('#444444');
    }

    const mesh = new THREE.Mesh(
      geometry,
      material
    );
    
    //material.wireframe = true;
    return mesh;
  }
}

const createGeometries = (baseGeometries, height, visible) => {
  const vertices = calculateVertices(baseGeometries, height);
  const faces = calculateFaces(vertices);

  // create the geometries
  const geometry = new THREE.Geometry();
  geometry.vertices = vertices.map(v => new THREE.Vector3(v.pos[0], v.pos[1], v.pos[2]));
  geometry.faces = faces;
  geometry.name = 'physicsPerimeters';

  if (visible) {
    geometry.computeVertexNormals();
    geometry.computeFaceNormals();
    geometry.computeBoundingBox();
    geometry.name = 'visiblePerimeters';
  }


  return geometry;
}

const r = (x) => {
  return (Math.random() - 0.5) * x;
}


const calculateVertices = ({ perimeterL, perimeterR }, height) => {
  const vertices = [];

  const p = [...perimeterR, ...perimeterL];
    // calculate vertices
    for (let i = 0; i < p.length; i++) {
      vertices.push(
        { pos: [p[i][0],  p[i][1], p[i][2]] },
        { pos: [p[i][0] + r(10),  p[i][1] + height, p[i][2]] },
      );
    }
  
  return vertices;
}

const calculateFaces = (vertices) => {
  const faces = [];
  for (let i = 0; i < vertices.length - 3; i+=2) {
    faces.push(
      new THREE.Face3(i, i+2, i+1),
      new THREE.Face3(i+2, i+3, i+1),
    );
  }
  return faces;
}

const simplePlaneUnwrapUVs = (geometry) => {
  const x = 1;
  const y = 1;
  for (var i = 0; i <= geometry.faces.length * 0.5; i++) {
    // two triangles per face
    // geometry.faceVertexUvs[0].push([
    //   new THREE.Vector2( 0, 0 ),
    //   new THREE.Vector2( 0, x ),
    //   new THREE.Vector2( y, 0 ),    
    // ]);
    geometry.faceVertexUvs[0].push([
      new THREE.Vector2( 0, x ),
      new THREE.Vector2( -y, x ),
      new THREE.Vector2( 0, 0 ),    
    ]);
    //geometry.faces[ 2 * i ].materialIndex = i;

    // geometry.faceVertexUvs[0].push([
    //   new THREE.Vector2( 0, x ),
    //   new THREE.Vector2( y, x ),
    //   new THREE.Vector2( y, 0 ),
    // ]);
    geometry.faceVertexUvs[0].push([
      new THREE.Vector2( -y, x ),
      new THREE.Vector2( -x, 0 ),
      new THREE.Vector2( 0, 0 ),
    ]);

    //geometry.faces[ 2 * i + 1 ].materialIndex = i;
  }
  geometry.elementsNeedUpdate = true;
  geometry.verticesNeedUpdate = true;
}
