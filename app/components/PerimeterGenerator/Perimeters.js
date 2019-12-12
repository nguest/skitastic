import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../../modules/physics-module';
import { simplePlaneUnwrapUVs } from '../../utils/materialUtils';


export default class Perimeters extends WHS.MeshComponent {
  constructor(params = {}) {
    super(params);
  }

  build() {
    const perimeterGeometries = createGeometries(this.params.baseGeometries);

    const { geometry, material } = this.applyBridge({
      geometry: perimeterGeometries,
      material: new THREE.MeshPhongMaterial() // red
    });
    const mesh = new THREE.Mesh(
      geometry,
      material
    );
    //assignUVs(geometry);
    simplePlaneUnwrapUVs(geometry)

    material.map = new THREE.TextureLoader().load('../assets/fence.png', map => {
      //map.wrapT = map.wrapS = THREE.ClampToEdgeWrapping;
      map.wrapT = map.wrapS = THREE.RepeatWrapping;
      map.repeat.set(1,2);
      //map.transparent = true;
    });

    material.transparent = true;
    material.side = THREE.DoubleSide;
    material.emissive = new THREE.Color('#444444')
    //material.wireframe = true;

    return mesh;
  }
}

const createGeometries = (baseGeometries) => {
  const vertices = calculateVertices(baseGeometries);
  const faces = calculateFaces(vertices);

  // create the geometry
  const geometry = new THREE.Geometry();
  geometry.vertices = vertices.map(v => new THREE.Vector3(v.pos[0], v.pos[1], v.pos[2]));
  geometry.faces = faces;
  geometry.computeVertexNormals();
  geometry.computeFaceNormals();
  geometry.computeBoundingBox();
  geometry.name = 'perimeters'

  return geometry;
}


const calculateVertices = ({ perimeterL, perimeterR }) => {
  const vertices = [];
  const ph = 30; // perimeter height
  const p = [...perimeterR, ...perimeterL];
    // calculate vertices
    for (let i = 0; i < p.length; i++) {
      vertices.push(
        { pos: [p[i][0],  p[i][1], p[i][2]] },
        { pos: [p[i][0],  p[i][1] + ph, p[i][2]] },
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
