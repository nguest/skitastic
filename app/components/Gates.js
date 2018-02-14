import * as THREE from 'three';
import * as WHS from 'whs';
import * as PHYSICS from '../modules/physics-module';
import { gateConfig } from '../AppConfig';

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
  const gates = gatePositions.map((gate, idx, array) => new Gate({ app, position: gate, w: gateConfig[idx].w, idx, array}) )
  return gates;
}

class Gate {

  constructor({ app, position, w, idx, array }) {
    this.app = app;
    this.position = position;
    this.width = w;
    this.idx = idx;
    this.array = array;

    //console.log({ app, position, w })

    this.params = {
      gateHeight: 60,
      poleHeight: 50,
      poleWidth: 15,
      poleDepth: 2,
    }
    this.createPortal(app);
    this.createPoles(app);
  }

  createPortal = (app) => {
    const portalMaterial = new THREE.MeshPhongMaterial({
      color: 0xffaabb,
      transparent: true,
      ///opacity: 0.15,
      wireframe: true,
    })

    this.portal = new WHS.Plane({
      geometry: {
        width: this.width,
        height: this.params.gateHeight
      },

      // modules: [
      //   new PHYSICS.BoxModule({
      //     mass: 0,
      //     mask: 1,
      //     group: 1,
      //   })
      // ],
  
      material: portalMaterial,

      position: [this.position.x, this.position.y + 20, this.position.z],

    })
    if (this.idx === this.array.length - 1) {
      this.portal.native.name = 'gate-finish';
    } else {
      this.portal.native.name = 'gate-' + this.idx
    }
    
    this.portal.addTo(app)
  }


  getPortalObject() {
    return this.portal.native;
  }

  createPoles = (app) => {
    const poleMaterial = new THREE.MeshPhongMaterial({
      //color: 0xffaabb,
      map: new THREE.TextureLoader().load('./assets/textures/flag.png'),
      transparent: true,
      shininess: 100,
      //emissive: 0x222222,
      specular: 0x666666,
    })

    const geometry = {
      width: this.params.poleWidth, 
      height: this.params.poleHeight, 
      depth: this. params.poleDepth
    }
    const rotation = [
      0,0,0//Math.PI,
    ]

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


    const poleL = new WHS.Plane({
      geometry,
      position: [
        this.position.x - (this.width + this.params.poleWidth)/2,
        this.position.y + 25,
        this.position.z + 20,
      ],
      rotation,
      modules,
      material: poleMaterial,
      shadow,
    })
    const poleR = new WHS.Plane({
      geometry,
      rotation,
      position: [
        this.position.x + (this.width + this.params.poleWidth)/2,
        this.position.y + 25,
        this.position.z + 20,
      ],
      modules,
      material: poleMaterial,
      shadow,
    });
    poleL.native.name = poleR.native.name = 'pole';
    poleL.addTo(app);
    poleR.addTo(app);
  }
}

export default Gates;