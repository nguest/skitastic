import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../modules/physics-module';


// array of gate objects with x and z posns
const gateConfig = [
  {x:50, z: -500, w: 100},
  {x:20, z: -1000, w: 100},
  {x:40, z: -3000, w: 100}
]

// reduces to a 3d object with x,y,z
const makeGatePosition = (goal, vertices) => {
  return vertices.reduce((acc, curr) => ( 
    new THREE.Vector2(curr.x, curr.z).distanceTo(new THREE.Vector2(goal.x, goal.z)) < 
        new THREE.Vector2(acc.x, acc.z).distanceTo(new THREE.Vector2(goal.x, goal.z))
    ? curr 
    : acc
  ));
}

const Gates = (app, vertices) => {
  // make array of actual gate positions on terrain surface
  const gatePositions = gateConfig.map(gate => makeGatePosition(gate, vertices)) 
  // create gates
  return gatePositions.map((gate, idx) => new Gate({ app, position: gate, w: gateConfig[idx].w}) )
}

class Gate {

  constructor({ app, position, w }) {
    this.app = app;
    this.position = position;
    this.width = w;

    console.log({ app, position, w })

    this.params = {
      gateHeight: 40,
      poleHeight: 20,
      poleWidth: 10,
      poleDepth: 2,
    }
    this.createPortal(app);
    this.createPoles(app);
  }

  createPortal = (app) => {
    const portalMaterial = new THREE.MeshPhongMaterial({
      color: 0xffaabb,
      transparent: true,
      opacity: 0.3,
    })

    return new WHS.Plane({
      geometry: {
        width: this.width,
        height: this.params.gateHeight
      },
  
      material: portalMaterial,

      position: this.position,
  
      // rotation: {
      //   x: -Math.PI / 2
      // }
    }).addTo(app)
  }

  createPoles = (app) => {
    const poleMaterial = new THREE.MeshPhongMaterial({
      color: 0xffaabb,
    })

    const geometry = {
      width: this.params.poleWidth, 
      height: this.params.poleHeight, 
      depth: this. params.poleDepth
    }

    const modules = [
      new PHYSICS.BoxModule({
        mass: 0,
        restitution: 0.3,
        friction: 1,
      })
    ];

    const shadow = {
      cast: true,
      receive: true
    };


    const poleL = new WHS.Box({
      geometry,
      position: [
        this.position.x - (this.width + this.params.poleWidth)/2,
        this.position.y,
        this.position.z
      ],
      modules,
      material: poleMaterial,
      shadow,
    })
    const poleR = new WHS.Box({
      geometry,
      position: [
        this.position.x + (this.width + this.params.poleWidth)/2,
        this.position.y,
        this.position.z
      ],
      modules,
      material: poleMaterial,
      shadow,
    });
    poleL.addTo(app);
    poleR.addTo(app);
  }
}

export default Gates;