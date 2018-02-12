import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../modules/physics-module';
import APPCONFIG, { isDev } from '../AppConfig';

class Slider {

  constructor(app){
    const slider = new WHS.Sphere({ // Create sphere comonent.
        geometry: {
            radius: 5,
            widthSegments: 8,
            heightSegments: 8
        },

        modules: [
            new PHYSICS.SphereModule({
            mass: 20,
            restitution: 0.9,
            friction: 0.5,
            })
        ],

        material: new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            wireframe: true
        }),

        shadow: {
            cast: true,
            receive: true,
        },        

        position: APPCONFIG.startPosition
    }).addTo(app);
    //if (!isDev) slider.native.visible = false;
    console.log({slider})
    return slider;
  };
}

export default Slider;