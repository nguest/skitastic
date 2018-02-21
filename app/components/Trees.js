import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../modules/physics-module';
import DecalGeometry from '../modules/DecalGeometry';


export class Tree {
  constructor(posn) {
    this.dim = { x: 120, y: 225 };

    const treeMaps = [
      './assets/pineTree.png',
      './assets/pineTree2.png'
    ]

    var randomTreeMap = treeMaps[Math.floor(Math.random() * treeMaps.length)];

    const tree = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(this.dim.x,this.dim.y,1,1),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        //color: 0xff0000,
        map: new THREE.TextureLoader().load(randomTreeMap),
        transparent: true,
      })
    )
    
    tree.material.needsUpdate = true;
    tree.geometry.translate(0, this.dim.y, 0);
    tree.rotation.set(0, Math.PI/6,0)
    tree.position.set(posn.x,posn.y,posn.z)
    tree.castShadow = true;
    return tree;
  }
};

class Trees {
  constructor(scene, terrainOuter) {
    this.dim = { x: 120, y: 225 };

    this.terrainOuter = terrainOuter;
    this.scene = scene;
    this.terrainOuter.geometry.computeBoundingBox()

    this.createTrees(this.dim)
  }

  createTrees(dim) {
    const xRows = [-650,-400, 400, 600];

    const xzTreePositionsArray = xRows.map(xRow => {
      return new Array(200).fill(null).map((posn, idx) => (
        new THREE.Vector3(xRow + Math.random() * 100, 1000, -(idx * 400) ))
      );
    });
    const xzTreePositions = [].concat(...xzTreePositionsArray)

    xzTreePositions.map(xzPosition => {
      const raycaster = new THREE.Raycaster();
      raycaster.set(xzPosition, new THREE.Vector3(0,-1,0));

      const intersects = raycaster.intersectObject( this.terrainOuter );

      if (intersects.length) {
        const xyzTreeLocation = intersects[0].point;
        xyzTreeLocation.y = xyzTreeLocation.y - dim.y * 0.5;

        const tree = new Tree(xyzTreeLocation)
        this.scene.add(tree);
        this.createShadowDecal(xyzTreeLocation);
      }
    })
  }

  createShadowDecal(xyzTreeLocation) {
    const decalPosition = new THREE.Vector3(xyzTreeLocation.x -100, xyzTreeLocation.y + 50, xyzTreeLocation.z + 150);
    var geometry =  new DecalGeometry( this.terrainOuter, decalPosition, new THREE.Euler(0,0,Math.PI/2, 'XYZ' ), new THREE.Vector3( 200, 200, 500 ));
    var material = new THREE.MeshPhongMaterial( { color: 0x5577aa, side: THREE.DoubleSide, opacity: 1, transparent: true } );
    var decalMesh = new THREE.Mesh( geometry, material );
    this.scene.add( decalMesh );
  }
}

export default Trees;