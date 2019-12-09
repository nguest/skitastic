import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../modules/physics-module';
//import centerLine from '../components/centerLine';

class TerrainGenerator {

  constructor(app) {
    // const track = new WHS.Importer({
    //   loader: new THREE.JSONLoader(),
    //   url: './assets/track2.json',

    //   modules: [
    //     new PHYSICS.ConcaveModule({
    //       friction: 0.3,
    //       mass: 0,
    //       restitution: 0.1,
    //       //loader: new THREE.JSONLoader(),
    //       //path: './assets/track3.json',

    //     }),
    //   ],
    //   shadow: {
    //     receive: true
    //   },
    //   position: {
    //     y: 0
    //   },
    //   buffer: true,
    //   // parser(geometry, materials) {
    //   //   //console.log({input})
    //   //   return new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(geometry), materials);
    //   // },
    // }).addTo(app)
    this.createTerrain(app);
    // const centerLine = new WHS.Importer({
    //   loader: new THREE.JSONLoader(),
    //   url: './assets/centerLine.json',
    //   position: {
    //     y: 0
    //   },
    // }).addTo(app)

  
    return [this.track];
  }

  createTerrain = (app) => {
    const terrainMaterial = new THREE.MeshPhongMaterial({
      color: 0xffaabb,
      //transparent: true,
      ///opacity: 0.15,
      wireframe: true,
    });

    
    this.track = new Track({
      build: true,
      modules: [
        new PHYSICS.ConcaveModule({
          friction: 0.3,
          mass: 50,
          restitution: 0.1,
          scale: new THREE.Vector3(10, 10, 10),
          position: [0,-10,-10]
        }),
      ],
      shadow: {
        receive: true
      },
      // scale: 200,
      //material: terrainMaterial,

      position: [0,-10,-10]
    });
    console.log({ thistrack: this.track })
    
    this.track.addTo(app)
    return this.track;
  }

  getTerrain() {
    return this.track;
  }
};
  
export default TerrainGenerator;

class Track  extends WHS.MeshComponent {
  constructor(params = {}) {
    super(params);
    console.log({params})

  }
  createGeometry() {
    const vertices = [];
    // centerpoint of segment
    let cp = [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: -5, z: -10 },
      { x: 2, y: -5, z: -100 },

    ]
    let sp = 5; // segment point count

    for (let i = 0; i < cp.length; i++) {
      vertices.push(
        { pos: [cp[i].x - 10,  cp[i].y + 1,     cp[i].z + 0] },
        { pos: [cp[i].x - 5,   cp[i].y + 0.3,   cp[i].z + 0] },
        { pos: [cp[i].x + 0,   cp[i].y + 0,     cp[i].z + 0] },
        { pos: [cp[i].x + 5,   cp[i].y + 0.3,   cp[i].z + 0] },
        { pos: [cp[i].x + 10,  cp[i].y + 1,     cp[i].z + 0] }
      )
    }



    const geometry = new THREE.Geometry();

    const o = 5;

    const faces = [];

    for (let i = 0; i < cp.length - 1; i++) {
      for (let j = 0; j < o - 1; j++) {
        faces.push(
          new THREE.Face3(j + (i * o), j + 1 + (i * o), j + o + (i * o)),
          new THREE.Face3(j + 1 + (i * o), j + 1 + o + (i * o), j + o + (i * o))
        );
      }
    }

    geometry.vertices = vertices.map(v => new THREE.Vector3(v.pos[0], v.pos[1], v.pos[2]));
    geometry.faces = faces;
    geometry.computeVertexNormals();
    geometry.computeFaceNormals();
    //geometry.computeBoundingBox();

    return geometry;
  }

  createBufferGeometry() {
 
    const vertices = [];
    const normals = [];
    const uvs = [];
    const faceIndices =  [];

    // centerpoint of segment
    const cp = [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: -5, z: -10 },
      { x: 2, y: -20, z: -100 },
      { x: 20, y: -30, z: -200 },
    ];
    const o = 5; // segment point count
    const geometry = new THREE.BufferGeometry();
    const positionNumComponents = 3;
    const normalNumComponents = 3;
    const uvNumComponents = 2;


    // calculate vertices for each centerpoint
    for (let i = 0; i < cp.length; i++) {
      vertices.push(
        { pos: [cp[i].x - 10,  cp[i].y + 1,     cp[i].z + 0] },
        { pos: [cp[i].x - 5,   cp[i].y + 0.3,   cp[i].z + 0] },
        { pos: [cp[i].x + 0,   cp[i].y + 0,     cp[i].z + 0] },
        { pos: [cp[i].x + 5,   cp[i].y + 0.3,   cp[i].z + 0] },
        { pos: [cp[i].x + 10,  cp[i].y + 1,     cp[i].z + 0] }
      )
    }

    // calculate faces between vertices;
    for (let i = 0; i < cp.length - 1; i++) {
      for (let j = 0; j < o - 1; j++) {
        faceIndices.push(
          j + (i * o), j + 1 + (i * o), j + o + (i * o),
          j + 1 + (i * o), j + 1 + o + (i * o), j + o + (i * o),
        );
      }
    }
    console.log({ vertices, faceIndices })

    // apply to geometry
    geometry.setIndex(faceIndices);
    const positions = vertices.map(v => v.pos).flat();
    console.log({ positions })
    geometry.attributes.position = new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents);
    //geometry.attributes.normal = new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents);
    //geometry.attributes.uv = new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents);
    geometry.computeVertexNormals();
    console.log({ geometry })
    return geometry;
  }

  build() {
    const geo = this.createBufferGeometry();
    //const geo = this.createGeometry();

    const {geometry, material} = this.applyBridge({
      geometry: geo,
      //new THREE.SphereGeometry(100, 16, 16),
      material: new THREE.MeshPhongMaterial({ wireframe: false, color: '#ff0000'}) // red
    });
    const mesh = new THREE.Mesh(
      geometry,
      material
    );
    // mesh.material.normalMap = new THREE.TextureLoader().load('./assets/NormalMap.png', map => {
    //   map.wrapT = map.wrapS = THREE.RepeatWrapping;//RepeatWrapping
    // });
    // mesh.material.normalScale.set(0.3,0.3)
    // mesh.material.side = THREE.FrontSide;
    // mesh.material.specularMap = new THREE.TextureLoader().load('./assets/seamless-ice-snow-specular.png', map => {
    //   map.wrapT = map.wrapS = THREE.RepeatWrapping;
    // });
    // mesh.material.displacementMap = new THREE.TextureLoader().load('./assets/seamless-ice-snow-displacement.png', map => {
    //   map.wrapT = map.wrapS = THREE.RepeatWrapping;
    //   map.repeat.set(3,1);
    // });
    // mesh.material.displacementScale = 8
    //mesh.setScale(200);
    mesh.geometry.scale(10,10,10);
    //const normalsHelper = new THREE.VertexNormalsHelper( mesh, 2, 0x00ff00, 1 );

    console.log({ mesh })
    return mesh;
  }
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