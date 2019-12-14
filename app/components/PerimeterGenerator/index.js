import { FaceNormalsHelper } from 'three';
import { ConcaveModule } from '../../modules/physics-module';
import Perimeters from './Perimeters';

export default class PerimeterGenerator {

  constructor(app, perimeterGeometries) {
    this.createPerimeter(app, perimeterGeometries);
    return this.physicsPerimeters;
  }

  createPerimeter = (app, perimeterGeometries) => {
    this.physicsPerimeters = new Perimeters({
      build: true,
      height: 160,
      modules: [
        new ConcaveModule({
          friction: 0.3,
          mass: 0,
          restitution: 0.1,
        }),
      ],
      buffer: true,
      baseGeometries: perimeterGeometries,
      visible: false,
    });

    //this.visiblePerimeters.addTo(app);

    this.visiblePerimeters = new Perimeters({
      build: true,
      height: 20,
      shadow: {
        receive: true,
        cast: true,
      },
      buffer: true,
      baseGeometries: perimeterGeometries,
      visible: true,
    });
    
    //.addTo(app)

    console.log({ p: this.physicsPerimeters })

    const normalsHelper = new FaceNormalsHelper( this.physicsPerimeters.native, 20, 0x00ff00, 1 );
    app.modules[1].scene.add(normalsHelper)
    this.physicsPerimeters.addTo(app);
    this.visiblePerimeters.addTo(app)

    return this.physicsPerimeters;
  }
};
