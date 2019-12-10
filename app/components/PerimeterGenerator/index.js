import * as THREE from 'three';
import * as PHYSICS from '../../modules/physics-module';
import Perimeters from './Perimeters';

export default class PerimeterGenerator {

  constructor(app, perimeterGeometries) {
    this.createPerimeter(app, perimeterGeometries);
    return this.perimeters;
  }

  createPerimeter = (app, perimeterGeometries) => {

    this.perimeters = new Perimeters({
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
      baseGeometries: perimeterGeometries,
    });

    const normalsHelper = new THREE.FaceNormalsHelper( this.perimeters.native, 20, 0x00ff00, 1 );
    app.modules[1].scene.add(normalsHelper)
    this.perimeters.addTo(app)
    return this.perimeters;
  }
};
