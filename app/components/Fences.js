import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../modules/physics-module';
import { MeshPhongMaterial } from 'three';

class Fences {
  constructor(app) {
    const fencesPhysics = new WHS.Importer({
      loader: new THREE.ObjectLoader(),
      url: './assets/fencesPhysics.json',
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
    }).addTo(app);
  
    const fences = new WHS.Importer({
      loader: new THREE.ObjectLoader(),
      url: './assets/fences.json',
      shadow: {
        cast: true,
        receive: true
      },   
      position: {
        y: 0
      },
    }).addTo(app);
  
 
  return [fencesPhysics, fences];
  }
};
  

export default Fences;