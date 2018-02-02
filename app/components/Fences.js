import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../modules/physics-module';
import { MeshPhongMaterial } from 'three';

const Fences = () => {


  const material = new THREE.MeshPhongMaterial({
    color: 0xddaa00,
    //flatShading: false,
    side: THREE.DoubleSide,
    //wireframe: false,
    shininess: 80,
    //specular: 0x999999,
    //map: textureMap,
  });

  const fenceL = new WHS.Importer({
    loader: new THREE.JSONLoader(),
    url: './assets/fenceL.json',
    modules: [
      new PHYSICS.ConcaveModule({
        friction: 0.9,
        mass: 0,
        restitution: 0.5,
      }),
    ],
    //material,
    shadow: {
      cast: true,
      receive: true
    },    //material: materialWHS,
    position: {
      y: 0
    },
    rotation: [0, 0, Math.PI/100],
  })

  const fenceR = new WHS.Importer({
    loader: new THREE.JSONLoader(),
    url: './assets/fenceR.json',
    modules: [
      new PHYSICS.ConcaveModule({
        friction: 0.9,
        mass: 0,
        restitution: 0.5,
      }),
    ],
    //material,
    shadow: {
      cast: true,
      receive: true
    },    //material: materialWHS,
    position: {
      y: 0
    },
    rotation: [0, 0, Math.PI/100],
  })

  
  return [fenceL , fenceR];
};
  

export default Fences;