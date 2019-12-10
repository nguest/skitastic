import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../../modules/physics-module';
import centerLine from '../centerLine';

export default class Perimeters extends WHS.MeshComponent {
  constructor(params = {}) {
    super(params);
    console.log({Perimeters: params})
  }

  build() {
    //  const geo = this.createBufferGeometry();
    console.log({ ppp: this.params })
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
    planeUnwrapUVs(geometry)

    material.map = new THREE.TextureLoader().load('../assets/fence.png', map => {
      //map.wrapT = map.wrapS = THREE.ClampToEdgeWrapping;
      map.wrapT = map.wrapS = THREE.RepeatWrapping;
      map.repeat.set(1,2);
      //map.transparent = true;
    });

    material.transparent = true;
    material.doubleSide = true;
    material.emissive = new THREE.Color('#444444')
    console.log({ material })

    console.log({ mesh })
    return mesh;
  }
}

const createGeometries = (baseGeometries) => {
  const vertices = calculateVertices(baseGeometries);
  console.log({ vertices })
  const faces = calculateFaces(vertices);

  // create the geometry
  const geometry = new THREE.Geometry();
  geometry.vertices = vertices.map(v => new THREE.Vector3(v.pos[0], v.pos[1], v.pos[2]));
  geometry.faces = faces;
  console.log({ perimegeo: geometry })
  geometry.computeVertexNormals();
  geometry.computeFaceNormals();
  geometry.computeBoundingBox();

  return geometry;
}


const calculateVertices = ({perimeterL, perimeterR}) => {
  console.log({ perimeterR })
  const vertices = [];
  const ph = 30 // perimeter height
  const p = [...perimeterR, ...perimeterL];
    // calculate vertices for each centerpoint
    for (let i = 0; i < p.length; i++) {
      if (p[i][1] > 100) {

        console.error(p[i], i)
      }
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
  for (let i = 0; i < vertices.length - 3; i++) {
    faces.push(
      new THREE.Face3(i, i+2, i+1),
      new THREE.Face3(i+2, i+3, i+1),
    );
  }
  return faces;
}

function planeUnwrapUVs(geometry) {
  for(var i = 0; i < geometry.faces.length / 2; i++) {
    // two triangles per face
    geometry.faceVertexUvs[ 0 ].push([
      new THREE.Vector2( 0, 0 ),
      new THREE.Vector2( 0, 1 ),
      new THREE.Vector2( 1, 0 ),    
    ]);

    geometry.faces[ 2 * i ].materialIndex = i;

    geometry.faceVertexUvs[ 0 ].push([
      new THREE.Vector2( 0, 1 ),
      new THREE.Vector2( 1, 1 ),
      new THREE.Vector2( 1, 0 ),    
    ]);

    geometry.faces[ 2 * i + 1 ].materialIndex = i;
  }    
  geometry.elementsNeedUpdate = geometry.verticesNeedUpdate = true;
}