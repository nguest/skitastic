import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../modules/physics-module';
import APPCONFIG, { isDev } from '../AppConfig';

class Finish {

  constructor(app) {
    const finish = new WHS.Importer({
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
      
      rotation: [0, 0, 0],
    }).addTo(app)

    const start = new WHS.Box({

    })

    const shape = new THREE.Shape([
      new THREE.Vector2(-10,0),
      new THREE.Vector2(-10,20),
      new THREE.Vector2(10,20),
      new THREE.Vector2(10,0),
      new THREE.Vector2(7,0),
      new THREE.Vector2(7,17),
      new THREE.Vector2(-7,17),
      new THREE.Vector2(-8,0)
    ]);
    
    const startGate = new WHS.Extrude({
      geometry: {
        shapes: shape,
        options: {
          bevelEnabled: true,
          bevelSize: 1,
          amount: 30
        }
      },
    
      material: new THREE.MeshPhongMaterial({
        color: 0xff7700
      }),
    
      position: [APPCONFIG.startPosition.x, APPCONFIG.startPosition.y - 5, APPCONFIG.startPosition.z + 10 ]
    });
    
    //startGate.addTo(app);
  
    //return this.finish;
  }

};
  

export default Finish;