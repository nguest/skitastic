import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../modules/physics-module';
import { MeshPhongMaterial } from 'three';

const Fences = () => {
  
  const fenceL = new WHS.Importer({
    loader: new THREE.JSONLoader(),
    url: './assets/fences.json',
    modules: [
      new PHYSICS.ConcaveModule({
        friction: 0.9,
        mass: 0,
        restitution: 0.5,
      }),
    ],
    shadow: {
      cast: true,
      receive: true
    },   
    position: {
      y: 0
    },
  })

  
  return fenceL;
};
  

export default Fences;