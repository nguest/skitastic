import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../../modules/physics-module';
import Track from './Track';
import OuterTerrain from './OuterTerrain';

class TerrainGenerator {

  constructor(app) {
    this.createTrack(app);
    this.createOuterTerrain(app);

    return [this.track, this.outerTerrain];
  }

  createTrack = (app) => {
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
    const normalsHelper = new THREE.FaceNormalsHelper(this.track.native, 20, 0xff0000, 1);
    app.modules[1].scene.add(normalsHelper)
    return this.track;
  }

  createOuterTerrain = (app) => {
    this.outerTerrain = new OuterTerrain({
      build: true,
      shadow: {
        receive: true
      },
      buffer: true,
      baseGeometries: this.track.perimeterGeometries,
    });
    this.outerTerrain.addTo(app);
    const normalsHelper = new THREE.FaceNormalsHelper(this.outerTerrain.native, 20, 0xff0000, 1);
    app.modules[1].scene.add(normalsHelper);
  }

  getTerrain() {
    return this.track;
  }
};
  
export default TerrainGenerator;

