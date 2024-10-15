export class Player {
  public async betRequest(
    gameState: any,
    betCallback: (bet: number) => void
  ): Promise<void> {
    //get our player
    const myPlayer = gameState.players.find((player: any) => player.hole_cards);

    // just in case
    if (!myPlayer) {
      betCallback(0);
    }

    const holeCards = myPlayer.hole_cards;
    const communityCards = gameState.community_cards;
    const currentBuyIn = gameState.current_buy_in;
    const minimumRaise = gameState.minimum_raise;
    const pot = gameState.pot;

    const enableFetching = false;
    if (communityCards.length > 0 && enableFetching) {
      // community cards are available
      const knownCards = [...communityCards, ...holeCards];
      if (knownCards.length >= 5) {
        type Hand = Array<{ rank: string; suit: string }>;
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(resolve, 2000);
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
            betCallback(rank * 100);
          }
        };
        Promise.race([checkRanks, timeoutPromise]);
        betCallback(50);
      }
    } else {
      // pre-flop

      // Calculate hand strength (simplified: high cards or pair)
      const isStrongHand = this.hasStrongHand(holeCards, communityCards);

      // If the hand is strong, bet aggressively
      if (isStrongHand) {
        const raiseAmount = currentBuyIn + minimumRaise;
        betCallback(raiseAmount);
      } else {
        // Bluff occasionally or fold
        const shouldBluff = Math.random() > 0.8; // 20% bluff
        if (shouldBluff) {
          const bluffRaise = currentBuyIn + minimumRaise * 2;
          betCallback(bluffRaise);
        } else {
          // Fold if weak hand
          betCallback(0);
        }
      }
    }
  }

  // Simplified hand strength calculation
  private hasStrongHand(holeCards: any[], communityCards: any[]): boolean {
    const highRanks = ["10", "J", "Q", "K", "A"];

    // Look for pairs, high cards, or potential straights/flushes
    const holeRanks = holeCards.map((card) => card.rank);
    const allCards = [...holeCards, ...communityCards];

    // Check for a pair in hole cards or with community cards
    const hasPair =
      holeRanks[0] === holeRanks[1] ||
      allCards.every((card) => holeRanks.includes(card.rank));

    const hasHighCard = holeCards.some((card) => highRanks.includes(card.rank));

    return hasPair || hasHighCard;
  }

  public showdown(gameState: any): void {}
}

export default Player;
