import type { GameState, _Player } from "./types";
import { getHandRank } from "./ranking";

export class Player {
  public betRequest(
    gameState: GameState,
    betCallback: (bet: number) => void
  ): void {
    //get our player
    const myPlayer = gameState.players.find((player: any) => player.hole_cards);

    // just in case
    if (!myPlayer) {
      betCallback(0);
    }

    const holeCards = myPlayer!.hole_cards!;
    const communityCards = gameState.community_cards;
    const currentBuyIn = gameState.current_buy_in;
    const minimumRaise = gameState.minimum_raise;
    const pot = gameState.pot;

    if (communityCards.length > 0) {
      // POST-flop

      const enableFetching = true;
      const knownCards = [...communityCards, ...holeCards];
      if (enableFetching) {
        // community cards are available
        if (knownCards.length >= 5) {
          type Hand = Array<{ rank: string; suit: string }>;
          const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => {
              resolve(null);
            }, 2000);
          });
          const checkRanks = async (cards: Hand) => {
            const query = new URLSearchParams();
            query.set("cards", JSON.stringify(cards));

            const response = await fetch(
              `https://rainman.leanpoker.org/?${query.toString()}`
            );
            if (response.ok) {
              const data = await response.json();
              const rank = data.rank;
              console.log(`POSTFLOP-1::MyCards:${JSON.stringify(holeCards)}::TableCards:${JSON.stringify(communityCards)}::POT::${pot}::BETTING::${rank * 100}}`);
              betCallback(rank * 100);
            }
          };
          Promise.race([checkRanks, timeoutPromise]);
        }
        console.log(`POSTFLOP-2::MyCards:${JSON.stringify(holeCards)}::TableCards:${JSON.stringify(communityCards)}::POT::${pot}::BETTING::50}`);
        betCallback(50);
      } else {
        const rank = getHandRank(knownCards as any);
        console.log(`POSTFLOP-3::MyCards:${JSON.stringify(holeCards)}::TableCards:${JSON.stringify(communityCards)}::POT::${pot}::BETTING::${rank * 100}`);
        betCallback(rank * 100);
      }
    } else {
      // pre-flop

      // Calculate hand strength (simplified: high cards or pair)
      const [strongHandValue, isTopHand] = this.getStrongHandValue(holeCards);

      // If the hand is topHand, bet aggressively
      if (isTopHand) {
        const raiseAmount =
          currentBuyIn + minimumRaise * (1 + strongHandValue / 10);
        betCallback(raiseAmount);
        console.log(`PREFLOP-1::MyCards:${JSON.stringify(holeCards)}::POT::${pot}::BETTING::${raiseAmount}`);
      } else if (strongHandValue > 1) {
        betCallback(currentBuyIn);
        console.log(`PREFLOP-2::MyCards:${JSON.stringify(holeCards)}::POT::${pot}::BETTING::${currentBuyIn}`);
      } else {
        // // Bluff occasionally or fold
        // const shouldBluff = Math.random() > 0.8; // 20% bluff
        // if (shouldBluff) {
        //     const bluffRaise = currentBuyIn + minimumRaise * 2;
        //     betCallback(bluffRaise);
        // } else {
        //     // Fold if weak hand
        console.log(`PREFLOP-3::MyCards:${JSON.stringify(holeCards)}::POT::${pot}::BETTING::${0}`);
        betCallback(0);
        // }
      }
    }
  }

  // Simplified hand strength calculation
  private getStrongHandValue(holeCards: any[]): [number, boolean] {
    let strength = 0;

    const highRanks = ["10", "J", "Q", "K", "A"];
    const topRanks = ["Q", "K", "A"];

    // Look for pairs, high cards, or potential straights/flushes
    const holeRanks = holeCards.map((card) => card.rank);
    const holeSuits = holeCards.map((card) => card.suit);

    // Check for a pair in hole cards or with community cards
    const hasPair = holeRanks[0] === holeRanks[1];

    const hasHighCard = holeCards.some((card) => highRanks.includes(card.rank));

    const hasTopCard = holeCards.some((card) => topRanks.includes(card.rank));

    const allTopCards = holeCards.every((card) => topRanks.includes(card.rank));

    const hasSameSuit = holeSuits[0] === holeSuits[1];

    if (hasPair) {
      strength++;
    }
    if (hasHighCard && hasPair) {
      strength++;
    }

    if (hasTopCard) {
      strength++;
    }
    if (hasSameSuit) {
      strength++;
    }

    return [strength, allTopCards && hasPair];
  }

  public showdown(gameState: any): void {
  }
}

export default Player;
