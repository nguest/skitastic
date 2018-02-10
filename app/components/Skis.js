import * as THREE from 'three';
import DecalGeometry from '../modules/DecalGeometry';

const Skis = (track) => {
  const skiGeo = new THREE.BoxBufferGeometry(2,0.2,40);
  const skiMaterial = new THREE.MeshPhongMaterial({color: 0xffff00, side: THREE.DoubleSide})

  const skis = new THREE.Object3D();
  skis.lookAt(new THREE.Vector3(0,-0.4,-1))

  const ski =  new THREE.JSONLoader().load('./assets/ski.json', ski => {
    ski.rotateX(Math.PI).rotateY(Math.PI/2);
    const material = new THREE.MeshPhongMaterial({color:0xaaff00})
    const skiMeshL = new THREE.Mesh(ski,material)
    const skiMeshR = new THREE.Mesh(ski,material)
    skiMeshL.position.set(-1.5, -4.5, -20);
    skiMeshR.position.set(1.5, -4.5, -20);
    skiMeshL.castShadow = skiMeshR.castShadow = true;

    skis.add(skiMeshL)
    skis.add(skiMeshR)
  });

  console.warn({track})

//   var geometry =  new DecalGeometry( track.native, new THREE.Vector3(0,0,0), new THREE.Euler(0, 1, 0, 'XYZ' ), new THREE.Vector3( 100, 100, 100 ));
//   var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
//   var mesh = new THREE.Mesh( geometry, material );
//  // scene.add( mesh );

  return skis;

}
export default Skis;
