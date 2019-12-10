import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../../modules/physics-module';
//import centerLine from '../components/centerLine';
import Track from './Track';

class TerrainGenerator {

  constructor(app) {
    this.createTerrain(app);

    return this.track;
  }

  createTerrain = (app) => {
    this.track = new Track({
      build: true,
      modules: [
        new PHYSICS.ConcaveModule({
          friction: 0.3,
          mass: 0,
          restitution: 0.1,
        }),
      ],
      shadow: {
        receive: true
      },
      buffer: true,
    });
    this.track.addTo(app);
    const normalsHelper = new THREE.FaceNormalsHelper( this.track.native, 20, 0xff0000, 1 );
    app.modules[1].scene.add(normalsHelper)
    return this.track;
  }

  getTerrain() {
    return this.track;
  }
};
  
export default TerrainGenerator;

