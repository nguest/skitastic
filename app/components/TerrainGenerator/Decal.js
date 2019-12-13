import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../../modules/physics-module';
import centerLine from '../centerLine';
import { planeUnwrapUVs } from '../../utils/materialUtils';
import DecalGeometry from '../../modules/DecalGeometry';



export default class Decal extends WHS.MeshComponent {
  constructor(params = {}) {
    super(params);
  }

  build() {
    const decalGeometry = createGeometry(this.params.track);

    const { geometry, material } = this.applyBridge({
      geometry: decalGeometry,
      material: new THREE.MeshPhongMaterial({
        depthTest:  true, 
        depthWrite: true, 
        polygonOffset: true,
        polygonOffsetFactor: -1, 
      }),
    });


    material.map = new THREE.TextureLoader().load('./assets/UV_Grid_Sm.png', map => {
      map.wrapT = map.wrapS = THREE.RepeatWrapping;
    });
  
    //material.needsUpdate = true;
    const mesh = new THREE.Mesh(
      geometry,
      material
    );
    return mesh;
  }
}

const createGeometry = (track) => {
  const decalPosition = new THREE.Vector3(0, -25, 0);
  const geometry = new DecalGeometry(
    track,
    decalPosition,
    //new THREE.Vector3(0,0,0),
    new THREE.Euler(Math.PI/2,0,0, 'XYZ'),
    new THREE.Vector3(100,100,100)
  );
  //geometry.scale(.1,.1,.1)
  return geometry;
}

//THREE.Euler(0,0,0, 'XYZ' )