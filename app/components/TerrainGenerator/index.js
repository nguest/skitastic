import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../../modules/physics-module';
//import centerLine from '../components/centerLine';
import Track from './Track';

class TerrainGenerator {

  constructor(app) {
    this.createTerrain(app);

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
          mass: 0,
          restitution: 0.1,
          //scale: new THREE.Vector3(1,1,1),
          //position: [0,0,0]
        }),
      ],
      shadow: {
        receive: true
      },
      buffer: true,
      // scale: 200,
      //material: terrainMaterial,

      //position: [0,0,0]
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

