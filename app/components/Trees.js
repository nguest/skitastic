import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../modules/physics-module';
import DecalGeometry from '../modules/DecalGeometry';



export class Tree {
  constructor(posn) {
    const dim = { x: 80, y: 150 };

    const tree = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(80,150,1,1),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: new THREE.TextureLoader().load('./assets/pineTree.png'),
        transparent: true,
      })
    )
    
    tree.material.needsUpdate = true;
    tree.geometry.translate(dim.x * 0.5,dim.y * 0.5, 0);
    //tree.rotation.set(0, Math.PI/6,0)
    tree.position.set(posn.x,posn.y,posn.z)
    tree.castShadow = true;
    return tree;
  }
};

class Trees {
  constructor(scene, terrainOuter) {
    this.terrainOuter = terrainOuter;
    this.scene = scene;
    this.terrainOuter.geometry.computeBoundingBox()
    console.log({g:this.terrainOuter.geometry.boundingBox})

    this.createTrees()

  }

  createTrees() {
    const xzTreePositions = new Array(200).fill(null).map((posn, idx) => new THREE.Vector3(-600 + Math.random() * 100, 1000, -(idx * 400) ))
    console.log({xzTreePositions})

    xzTreePositions.map(xzPosition => {
      const raycaster = new THREE.Raycaster();
      raycaster.set(xzPosition, new THREE.Vector3(0,-1,0));

      const intersects = raycaster.intersectObject( this.terrainOuter );

      if (intersects.length) {
        const xyzTreeLocation = intersects[0].point;
        xyzTreeLocation.y = xyzTreeLocation.y -20;

        const tree = new Tree(xyzTreeLocation)
        this.scene.add(tree);
        this.createShadowDecal(xyzTreeLocation);
      }
    })
  }

  createShadowDecal(xyzTreeLocation) {
    const decalPosition = new THREE.Vector3(xyzTreeLocation.x - 50, xyzTreeLocation.y, xyzTreeLocation.z);
    var geometry =  new DecalGeometry( this.terrainOuter, decalPosition, new THREE.Euler(0,0, 0, 'XYZ' ), new THREE.Vector3( 200, 100, 50 ));
    var material = new THREE.MeshPhongMaterial( { color: 0x5577aa, side: THREE.DoubleSide, opacity: 0.3, transparent: true } );
    var decalMesh = new THREE.Mesh( geometry, material );
    this.scene.add( decalMesh );
  }
}

export default Trees;