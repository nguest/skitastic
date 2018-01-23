import * as THREE from 'three';
import * as WHS from 'whs';


const SkyBox = (app, scene) => {
    const path = './assets/skybox/';
    var cubeMap = new THREE.CubeTextureLoader().load([
        path + '3.jpg',
        path + '1.jpg',
        path + 'roof.jpg',
        path + 'roof.jpg',
        path + '2.jpg',
        path + '4.jpg'
    ]);
    cubeMap.format = THREE.RGBFormat;

    var skyShader = THREE.ShaderLib['cube'];
    skyShader.uniforms['tCube'].value = cubeMap;

    var skyBoxMaterial = new THREE.ShaderMaterial({
        fragmentShader: skyShader.fragmentShader,
        vertexShader: skyShader.vertexShader,
        uniforms: skyShader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });

    // const mesh1 = WHS.MeshComponent.create(
    //     new THREE.SphereGeometry(1, 32, 32),
    //     {material}
    //   );
    // skyBoxMaterial = new THREE.MeshPhongMaterial({
    //     color: 0xffffff,
    //     flatShading: false,
    //     side: THREE.DoubleSide,
    //     //wireframe: true,
    //   });

    var skybox = WHS.MeshComponent.create(
        new THREE.BoxGeometry(100, 100, 100),
        skyBoxMaterial
    );
    var skybox = new THREE.Mesh(new THREE.BoxGeometry(10000, 10000, 10000),
    skyBoxMaterial)

    console.log({skybox})
    //skybox.rotation.set(0, Math.PI/2,0);

    skybox.position.set(0,5000,0)

    scene.add(skybox)
    
    //skybox.addTo(app);
   // app.add(skybox)
}

export default SkyBox;