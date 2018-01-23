import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../modules/physics-module';

const scaleX = 10;
const scaleZ = 10;

const Terrain = () => {
  return new WHS.Importer({
    //loader: new THREE.JSONLoader(),
    url: './assets/track.json',
    name: 'terrain',
    modules: [
      new PHYSICS.ConcaveModule({
        friction: 0.9,
        mass: 0,
        restitution: 0.5,
        //path: `${process.assetsPath}/models/teapot/utah-teapot-light.json`,
        //scale: new THREE.Vector3(1,1,1)
        scale: new THREE.Vector3(scaleX,scaleX,scaleZ),
  
      }),
    ],
    material: new THREE.MeshPhongMaterial({
      //color: 0xeeeeee,
      flatShading: false,
      side: THREE.DoubleSide,
      wireframe: false,
      specular: 0x555555,
      map: new THREE.TextureLoader().load('./assets/textures/UV_Grid_Sm.png', texture => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, 1 );
      })
    }),
    position: {
      y: 0
    },
    rotation: [0, 0, Math.PI/100],
    scale: [scaleX,scaleX,scaleZ]
  })
};
  

export default Terrain;