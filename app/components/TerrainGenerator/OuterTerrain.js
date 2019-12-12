import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../../modules/physics-module';
import centerLine from '../centerLine';
import { planeUnwrapUVs } from '../../utils/materialUtils';


export default class OuterTerrain extends WHS.MeshComponent  {
  constructor(params = {}) {
    super(params);
  //  this.createOuterTerrain(app, baseGeometries)
  }

  build() {
    const outerGeometries = createGeometries(this.params.baseGeometries);

    const { geometry, material } = this.applyBridge({
      geometry: outerGeometries,
      material: new THREE.MeshPhongMaterial() // red
    });
    const mesh = new THREE.Mesh(
      geometry,
      material
    );
    //assignUVs(geometry);
    planeUnwrapUVs(geometry);

    

    // material.map = new THREE.TextureLoader().load('../assets/fence.png', map => {
    //   //map.wrapT = map.wrapS = THREE.ClampToEdgeWrapping;
    //   map.wrapT = map.wrapS = THREE.RepeatWrapping;
    //   map.repeat.set(1,2);
    //   //map.transparent = true;
    // });

    // material.transparent = true;
    // material.side = THREE.DoubleSide;
    // material.emissive = new THREE.Color('#444444')
    //material.wireframe = true;

    return mesh;
  }
}

const createGeometries = (baseGeometries) => {
  const vertices = calculateVertices(baseGeometries);
  const faces = calculateFaces(vertices);
  console.log({ faces })
  // create the geometry
  const geometry = new THREE.Geometry();
  geometry.vertices = vertices.map(v => new THREE.Vector3(v.pos[0], v.pos[1], v.pos[2]));
  geometry.faces = faces;
  geometry.computeVertexNormals();
  geometry.computeFaceNormals();
  geometry.computeBoundingBox();
  geometry.name = 'outerTerrain';

  return geometry;
}

const calculateVertices = ({ perimeterL, perimeterR }) => {
  const vertices = [];
  const lHeight = 700; // left outer height
  const rHeight = -100; // right outer height


  let p = [...perimeterL]; //...perimeterR, 
    // calculate vertices
  for (let i = 0; i < p.length; i++) {
    vertices.push(
      { pos: [p[i][0],  p[i][1], p[i][2]] },
      { pos: [p[i][0] - 1500,  p[i][1] + lHeight, p[i][2]] },
    );
  }
  
  p = perimeterR;
  for (let i = 0; i < p.length; i++) {
    vertices.push(
      { pos: [p[i][0],  p[i][1], p[i][2]] },
      { pos: [p[i][0] + 1500,  p[i][1] + rHeight, p[i][2]] },
    );
  }
  
  return vertices;
}

const calculateFaces = (vertices) => {
  const faces = [];
  console.log({ vertices })
  for (let i = 0; i < vertices.length - 3; i+=2) {
    faces.push(
      new THREE.Face3(i, i+2, i+1),
      new THREE.Face3(i+2, i+3, i+1),
    );
  }
  return faces;
}
