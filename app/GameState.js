import * as THREE from 'three';
import APPCONFIG from './AppConfig';

class GameState {
  constructor() {
    this.gameState = {}
  }

  getState = () => {
    return this.gameState;
  }

  setState = (update) => {
    const state = this.gameState;

    this.gameState = { ...state, ...update }
  }

}

export default GameState;