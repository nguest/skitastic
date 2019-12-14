import * as THREE from 'three';
import * as WHS from 'whs';
import DecalGeometry from '../modules/DecalGeometry';
import APPCONFIG from '../AppConfig';

const Skis = (track, scene) => {
  const skiGeo = new THREE.BoxBufferGeometry(2,0.2,40);

  const skis = new THREE.Object3D();
  skis.lookAt(new THREE.Vector3(0,-0.4,-100))
  //skis.position.set(APPCONFIG.startPosition.x,APPCONFIG.startPosition.y,APPCONFIG.startPosition.z)

  const ski =  new THREE.JSONLoader().load('./assets/ski.json', (ski, materials) => {
    //materials[0].depthWrite = false;
    //materials[0].depthTest = false;

    const skiMeshL = new THREE.Mesh(ski,materials[0])
    const skiMeshR = new THREE.Mesh(ski,materials[0])
    skiMeshL.position.set(-1.5, -4.9, -15);
    skiMeshR.position.set(1.5, -4.9, -15);
    skiMeshL.castShadow = skiMeshR.castShadow = true;
   
    skiMeshL.renderOrder = 200000;
    //skiMeshL.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
    //skiMeshR.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
    const particles = Spray();

    skis.add(skiMeshL)
    skis.add(skiMeshR)
    skis.add(particles)
    console.log({skiMeshL})
  });


  return skis;
}

export default Skis;

const Spray = () => {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(30000);

  for ( var i = 0; i < 10000; i += 3 ) {
    var x = 0 + Math.random();
    var y = 0 + Math.random();
    var z = 0 + Math.random();
    vertices[i] = x;( x, y, z );
    vertices[i+1] = y;
    vertices[i+2] = z
  }
  //geometry.attributes.position = new THREE.BufferAttribute( vertices, 3 ).setUsage( THREE.DynamicDrawUsage );// ).setDynamic(true);
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 1 ).setUsage( THREE.DynamicDrawUsage ) );

  //geometry.attributes.position
  const size = 1;
  const material = new THREE.PointsMaterial({ 
    size: size,
    color: 0xff0000,
    //map: sprite,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    //transparent: true 
  });
	//material.color.setHSL( color[ 0 ], color[ 1 ], color[ 2 ] );
  
  const particles = new THREE.Points( geometry, material );
  
  console.log({ particles })
  // const loop = new WHS.Loop((clock) => {
  //   for (var i = 0; i < particles.length; i ++ ) {
  //     var object = particles[ i ];
  //     if ( object instanceof THREE.Points ) {
  //       object.position.y = clock * 0.01;
  //     }
  //   }
  //   this.controls.skis.children
  //   //box.rotation.y += 0.02;
  // });//.start(app);
  //particles.loop = loop;
  return particles
}
