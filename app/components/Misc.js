import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../modules/physics-module';

const Misc = (app) => {
  const sph = new WHS.Sphere({ // Create sphere comonent.
    geometry: {
      radius: 10,
      widthSegments: 16,
      heightSegments: 16
    },
    
    modules: [
      new PHYSICS.SphereModule({
      mass: 20,
      restitution: 0.9,
      friction: 1,
      })
    ],
    shadow: {
      cast: true,
      receive: true
    },
    
    material: new THREE.MeshPhongMaterial({
      //color: UTILS.$colors.mesh
    }),
    
    
    position: [20, -40, -300]
  })
  sph.addTo(app);
}

export default Misc;