import * as THREE from 'three';
import * as WHS from 'whs';
import DecalGeometry from '../modules/DecalGeometry';
import APPCONFIG from '../AppConfig';

const Skis = (track, scene) => {
  const skiGeo = new THREE.BoxBufferGeometry(2,0.2,40);

  const skis = new THREE.Object3D();
  skis.lookAt(new THREE.Vector3(0,-0.4,-100))

  const material = new THREE.MeshPhongMaterial({color: 0xff0000})
  //skis.position.set(APPCONFIG.startPosition.x,APPCONFIG.startPosition.y,APPCONFIG.startPosition.z)

  const ski =  new THREE.JSONLoader().load('./assets/ski.json', (ski, materials) => {
    //materials[0].depthWrite = false;
    //materials[0].depthTest = false;

    const skiMeshR = new THREE.Mesh(ski,materials[0])
    const skiMeshL = new THREE.Mesh(ski,material)
    skiMeshL.castShadow = skiMeshR.castShadow = true;

    const sprayR = Spray();
    sprayR.rotation.set(-1.5, 0.1, 0.06);
    sprayR.position.set(0,0, 21)

    const skiObjectR = new THREE.Group();
    skiObjectR.add(skiMeshR)
    skiObjectR.position.set(-1.5, -4.9, -15);
    skiObjectR.name = 'skiObjectR';
    skiObjectR.add(sprayR);

    const sprayL = Spray();
    sprayL.rotation.set(-1.5, 0.1, -0.06);
    sprayL.position.set(0,0, 21)

    const skiObjectL = new THREE.Group();
    skiObjectL.add(skiMeshL)
    skiObjectL.position.set(1.5, -4.9, -15);
    skiObjectL.add(sprayL)

    //skiMeshR.position.set(1.5, -4.9, -15);
   
    ///skiMeshL.renderOrder = 200000;
    //skiMeshL.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
    //skiMeshR.onBeforeRender = function( renderer ) { renderer.clearDepth(); };

    skis.add(skiObjectL)
    skis.add(skiObjectR)
  });


  return skis;
}

export default Skis;

const Spray = () => {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(30000);

  for ( var i = 0; i < 30; i += 3 ) {
    var x = 0;
    var y = 0;
    var z = 0;
    vertices[i] = x;
    vertices[i+1] = y;
    vertices[i+2] = z;
  }
  geometry.attributes.position = new THREE.BufferAttribute( vertices, 3 ).setDynamic(true);
  //geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 1 )).setDynamic(true);//.setUsage( THREE.DynamicDrawUsage ) );

  const size = 0.05;
  const material = new THREE.PointsMaterial({ 
    size: size,
    color: 0xffeedd,
    //map: sprite,
    //blending: THREE.AdditiveBlending,
    //depthTest: false,
    //transparent: true 
  });
  //geometry.translate(-4,0,20)
	//material.color.setHSL( color[ 0 ], color[ 1 ], color[ 2 ] );
  
  const particles = new THREE.Points( geometry, material );

  return particles;
}
