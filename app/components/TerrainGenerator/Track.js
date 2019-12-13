import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../../modules/physics-module';
import centerLine from '../centerLine';
// import { planeUnwrapUVs } from '../../utils/materialUtils';

export default class Track extends WHS.MeshComponent {
  constructor(params = {}) {
    super(params);
  }

  build() {
    //  const geo = this.createBufferGeometry();
    const { trackGeometry, perimeterGeometries } = createGeometries();
    this.perimeterGeometries = perimeterGeometries;

    const { geometry, material } = this.applyBridge({
      geometry: trackGeometry,
      material: new THREE.MeshPhongMaterial() // red
    });
    const mesh = new THREE.Mesh(
      geometry,
      material
    );
    planeUnwrapUVs(geometry);
    //material.normalMap = new THREE.TextureLoader().load('./assets/NormalMap.png', map => {
    material.normalMap = new THREE.TextureLoader().load('./assets/seamless-noise-normal.jpg', map => {
      map.wrapT = map.wrapS = THREE.RepeatWrapping;//RepeatWrapping
      map.repeat.set(10,10)
      //map.offset.set(0.1, 0.1)
    });
    //material.map = new THREE.TextureLoader().load('./assets/UV_Grid_Sm.png', map => {
    // material.map = new THREE.TextureLoader().load('./assets/seamless-ice-snow-specular.png', map => {
    //     map.wrapT = map.wrapS = THREE.RepeatWrapping;//RepeatWrapping
    //     map.repeat.set(10,10)
    //     map.offset.set(0.1, 0.1)
    //   });
    material.normalScale.set(0.2, 0.2)
    material.side = THREE.FrontSide;
    material.specularMap = new THREE.TextureLoader().load('./assets/seamless-ice-snow-specular.png', map => {
      map.wrapT = map.wrapS = THREE.RepeatWrapping;
    });
    material.needsUpdate = true;
    // material.displacementMap = new THREE.TextureLoader().load('./assets/seamless-ice-snow-displacement.png', map => {
    //   map.wrapT = map.wrapS = THREE.RepeatWrapping;
    //   //map.repeat.set(1,1);
    // });
    // material.displacementScale = 5;

    return mesh;
  }
  getPerimeterGeometries() {
    return this.perimeterGeometries;
  }
}

const createGeometries = () => {
  // centerpoint of segment
  // let cp = [
  //   { x: 0, y: 0, z: 0 
  // ]
  const cp = centerLine;
  let o = 5; // segment point count
  
  const vertices = calculateVertices(cp);
  const faces = calculateFaces(cp, o);

  // create the geometry
  const geometry = new THREE.Geometry();
  geometry.vertices = vertices.map(v => new THREE.Vector3(v.pos[0], v.pos[1], v.pos[2]));
  geometry.faces = faces;
  geometry.computeVertexNormals();
  geometry.computeFaceNormals();
  geometry.computeBoundingBox();
  geometry.name = 'track';

  const perimeterGeometries = calculatePerimeters(vertices, o);

  return { trackGeometry: geometry, perimeterGeometries };
}


const calculateVertices = (cp) => {
  const vertices = [];
    // calculate vertices for each centerpoint
  for (let i = 0; i < cp.length; i++) {
    vertices.push(
      { pos: [cp[i].x - 200,  cp[i].y + 20,     cp[i].z + 0] },
      { pos: [cp[i].x - 150,  cp[i].y + 6,   cp[i].z + 0] },
      { pos: [cp[i].x + 0,    cp[i].y + 0,     cp[i].z + 0] },
      { pos: [cp[i].x + 150,  cp[i].y + 6,   cp[i].z + 0] },
      { pos: [cp[i].x + 200,  cp[i].y + 20,    cp[i].z + 0] }
    )
  }
  return vertices;
}

const calculateFaces = (cp, o) => {
  const faceIndices = [];
  for (let i = 0; i < cp.length - 1; i++) {
    for (let j = 0; j < o - 1; j++) {
      faceIndices.push(
        new THREE.Face3(j + (i * o), j + 1 + (i * o), j + o + (i * o)),
        new THREE.Face3(j + 1 + (i * o), j + 1 + o + (i * o), j + o + (i * o)),
      );
    }
  }
  return faceIndices;
}

const calculatePerimeters = (vertices, o) => {
  const perimeterL = [];
  const perimeterR = [];

  // get last point of each segment, clockwise
  for (let i = 0; i < vertices.length; i += o) {
    perimeterL.push(vertices[i].pos);
  }
  for (let i = vertices.length - 1; i >= 0; i -= o) {
    perimeterR.push(vertices[i].pos);
  }
  return { perimeterL, perimeterR };
}

const planeUnwrapUVs = (geometry) => {
  for (var i = 0; i < geometry.faces.length; i+=2) {
    // calculate the x and z sizes of the first triangle of 2
    const i1 = geometry.faces[i].a;
    const i2 = geometry.faces[i].b;
    const i3 = geometry.faces[i].c;

    const v1 = geometry.vertices[i1];
    const v2 = geometry.vertices[i2]
    const v3 = geometry.vertices[i3]

    const k = 100; // scale factor
    const u = (v2.x - v1.x) / k;
    const v = (v3.z - v1.z) / k;

    // two triangles per face
    geometry.faceVertexUvs[0].push([
      new THREE.Vector2( 0, 0 ),
      new THREE.Vector2( 0, u ),
      new THREE.Vector2( v, 0 ),    
    ]);
    //geometry.faces[ 2 * i ].materialIndex = i;

    geometry.faceVertexUvs[0].push([
      new THREE.Vector2( 0, u ),
      new THREE.Vector2( v, u ),
      new THREE.Vector2( v, 0 ),
    ]);
    //geometry.faces[ 2 * i + 1 ].materialIndex = i;
  }
  geometry.elementsNeedUpdate = geometry.verticesNeedUpdate = true;
}



   /*
    const vertices = [
      // front
      { pos: [-1, -1,  1], norm: [ 0,  0,  1], uv: [0, 1], },
      { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 1], },
      { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 0], },
     
      { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 0], },
      { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 1], },
      { pos: [ 1,  1,  1], norm: [ 0,  0,  1], uv: [1, 0], },
      // right
      { pos: [ 1, -1,  1], norm: [ 1,  0,  0], uv: [0, 1], },
      { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 1], },
      { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 0], },
     
      { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 0], },
      { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 1], },
      { pos: [ 1,  1, -1], norm: [ 1,  0,  0], uv: [1, 0], },
      // back
      { pos: [ 1, -1, -1], norm: [ 0,  0, -1], uv: [0, 1], },
      { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 1], },
      { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 0], },
     
      { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 0], },
      { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 1], },
      { pos: [-1,  1, -1], norm: [ 0,  0, -1], uv: [1, 0], },
      // left
      { pos: [-1, -1, -1], norm: [-1,  0,  0], uv: [0, 1], },
      { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 1], },
      { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 0], },
     
      { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 0], },
      { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 1], },
      { pos: [-1,  1,  1], norm: [-1,  0,  0], uv: [1, 0], },
      // top
      { pos: [ 1,  1, -1], norm: [ 0,  1,  0], uv: [0, 1], },
      { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 1], },
      { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 0], },
     
      { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 0], },
      { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 1], },
      { pos: [-1,  1,  1], norm: [ 0,  1,  0], uv: [1, 0], },
      // bottom
      { pos: [ 1, -1,  1], norm: [ 0, -1,  0], uv: [0, 1], },
      { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 1], },
      { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 0], },
     
      { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 0], },
      { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 1], },
      { pos: [-1, -1, -1], norm: [ 0, -1,  0], uv: [1, 0], },
    ];
*/
    // const vertices = [
    //   {pos:  [-10, 1, 0]},
    //   {pos:  [-5, 0.3, 0]},
    //   {pos:  [0, 0, 0]},
    //   {pos:  [5, 0.3, 0]},
    //   {pos:  [10, 1, 0]},


    //   {pos:  [-10, 1, -10]},
    //   {pos:  [-5, 0.3, -10]},
    //   {pos:  [0, 0, -10]},
    //   {pos:  [5, 0, -10]},
    //   {pos:  [10, 1, -10]},
    // ]

  
