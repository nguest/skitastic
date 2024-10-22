import * as THREE from 'three';
import DecalGeometry from '../modules/DecalGeometry';
import APPCONFIG from '../AppConfig';

const Skis = (track, scene) => {
  const skiGeo = new THREE.BoxBufferGeometry(2,0.2,40);

  const skis = new THREE.Object3D();
  skis.lookAt(new THREE.Vector3(0,-0.4,-100))
  //skis.position.set(APPCONFIG.startPosition.x,APPCONFIG.startPosition.y,APPCONFIG.startPosition.z)

  const ski =  new THREE.JSONLoader().load('./assets/ski.json', (ski, materials) => {
    materials[0].depthWrite = false;
    materials[0].depthTest = false;
    const skiMeshL = new THREE.Mesh(ski,materials[0])
    const skiMeshR = new THREE.Mesh(ski,materials[0])
    skiMeshL.position.set(-1.5, -4.9, -15);
    skiMeshR.position.set(1.5, -4.9, -15);
    skiMeshL.castShadow = skiMeshR.castShadow = true;

    skis.add(skiMeshL)
    skis.add(skiMeshR)
    console.log({skiMeshL})
  });


  return skis;

}
export default Skis;
