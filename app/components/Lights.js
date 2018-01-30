import * as THREE from 'three';
import * as WHS from 'whs';

const Lights = (app, scene) => {

  const pow = 12;
  const l = 500;
  const dlight = new WHS.DirectionalLight( {

    color: 0xffffff,
    intensity: 0.7,
    distance: 300,
    decay: 0.1,

    castShadow: true,

    position: [1,1,0],

    shadow: Object.assign({
      fov: 90,
      camera: {
        near: 0,
        far: 500,
        left: -l,
        right: l,
        top: l,
        bottom: -l,


      },
      //radius: 10,
      mapSize: {
        width: Math.pow(2,pow),
        height: Math.pow(2,pow),
      }
    }, {shadowMap: THREE.PCFSoftShadowMap}),
    
    // target: {
    //   x: 0, y: -20, z: 300
    // }
  })
  dlight.addTo(app);
  //scene.add(dlight)

  const light = new THREE.DirectionalLight(  0xffffff, 1, 100)
  light.position.set( 100, 100, 0 ); 			//default; light shining from top
  light.castShadow = true;            // default false
  //scene.add( light );
  
  const x = 2000;
  //Set up shadow properties for the light
  light.shadow.mapSize.width = 4096;  // default
  light.shadow.mapSize.height = 4096; // default
  light.shadow.camera.near = 0.5;    // default
  light.shadow.camera.far = 1000;    // default
  light.shadow.camera.left = -x;  
  light.shadow.camera.right = x;  
  light.shadow.camera.bottom = -x;  
  light.shadow.camera.top = x;  
  
  const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(200,200),
    new THREE.MeshPhongMaterial({color: 0x44ffff})
  )
  plane.receiveShadow = true;
  plane.castShadow = true;

  plane.rotation.set(-Math.PI/2, 0,0 )

  //scene.add(plane)

  var helper2 = new THREE.CameraHelper( light.shadow.camera );
  scene.add( helper2 );

  console.log({dlight})

  const helper = new THREE.DirectionalLightHelper(light)
  scene.add(helper)

  const ambient = new WHS.AmbientLight({
    intensity: 0.2
  })
  ambient.addTo(app);

}

export default Lights;
