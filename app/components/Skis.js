import * as THREE from 'three';
import DecalGeometry from '../modules/DecalGeometry';
import APPCONFIG from '../AppConfig';

const Skis = (track, scene) => {
  const skiGeo = new THREE.BoxBufferGeometry(2,0.2,40);
  const skiMaterial = new THREE.MeshPhongMaterial({color: 0xffff00, side: THREE.DoubleSide})

  const skis = new THREE.Object3D();
  skis.lookAt(new THREE.Vector3(0,-0.4,-100))
  //skis.position.set(APPCONFIG.startPosition.x,APPCONFIG.startPosition.y,APPCONFIG.startPosition.z)

  const ski =  new THREE.JSONLoader().load('./assets/ski.json', (ski, materials) => {
    const material = new THREE.MeshPhongMaterial({color:0xaaff00})
    const skiMeshL = new THREE.Mesh(ski,materials[0])
    const skiMeshR = new THREE.Mesh(ski,materials[0])
    skiMeshL.position.set(-1.5, -4.9, -15);
    skiMeshR.position.set(1.5, -4.9, -15);
    skiMeshL.castShadow = skiMeshR.castShadow = true;

    skis.add(skiMeshL)
    skis.add(skiMeshR)
  });


  return skis;

}
export default Skis;
