import { getHandWeight } from './ranking';
import { GameState } from './types';

export function preflopbet(holeCards: any[], gameState: GameState): number {
    const currentBuyIn = gameState.current_buy_in;
    const minimumRaise = gameState.minimum_raise;
    const smallBlind = gameState.small_blind;
    const handValue = getHandWeight(holeCards[0], holeCards[1]);

    if (handValue >= 0.9) {
        // our hand is strong, we don't care about other cards and ready to go all in
        if (currentBuyIn < 10 * smallBlind) {
          const raiseAmount = currentBuyIn + minimumRaise * 2;
          return raiseAmount;
        } else {
          return currentBuyIn;
        }
    } else if (handValue >= 0.72) {
        // Hand is good, but going all in is risky, especially in the early rounds
        if (currentBuyIn <= 5 * smallBlind) {
          const raiseAmount = currentBuyIn + minimumRaise;
          return raiseAmount;
        } else {
          return currentBuyIn;
        }
    } else if (handValue >= 0.41) {
        // Hand is weak, but we can call the current bet
        if (currentBuyIn <= 2 * smallBlind) {
          return currentBuyIn;
        }
    }
    // don't fold when we are on the small blind and just need to add to the current bet
    if (currentBuyIn === smallBlind) {
      return currentBuyIn;
    }


    return 0;
}
