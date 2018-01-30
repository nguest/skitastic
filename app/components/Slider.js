import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../modules/physics-module';

const scaleX = 10;
const scaleZ = 10;

const Slider = () => {
    return new WHS.Sphere({ // Create sphere comonent.
        geometry: {
            radius: 5,
            widthSegments: 2,
            heightSegments: 2
        },
        
        modules: [
            new PHYSICS.SphereModule({
            mass: 20,
            restitution: 0.9,
            friction: 1,
            })
        ],
        
        material: new THREE.MeshPhongMaterial({
          //color: UTILS.$colors.mesh
        }),

        shadow: {
            cast: true,
            receive: true,
        },
        
        
        position: new THREE.Vector3(0, 5, 0)
    })
};
  

export default Slider;