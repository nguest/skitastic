import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../modules/physics-module';

class Finish {

  constructor(app) {
    this.finish = new WHS.Importer({
      loader: new THREE.JSONLoader(),
      url: './assets/finish.json',
      modules: [
        new PHYSICS.ConcaveModule({
          friction: 0.9,
          mass: 0,
          restitution: 0.5,
        }),
      ],
      shadow: {
        receive: true,
        cast: true,
      },
      
    
      rotation: [0, 0, Math.PI/100],
    })

  //terrain.receiveShadow = true;

    console.log({terrain:this.terrain})
  
    return this.finish;
  }

  getTerrain() {
    return this.finish;
  }

};
  

export default Finish;