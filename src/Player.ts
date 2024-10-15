// Card type definition
type Card = {
    rank: string; // Possible values: numbers 2-10 and J, Q, K, A
    suit: string; // Possible values: clubs, spades, hearts, diamonds
};

// Player type definition
type _Player = {
    id: number; // Id of the player
    name: string; // Name specified in the tournament config
    status: 'active' | 'folded' | 'out'; // Status of the player
    version: string; // Version identifier returned by the player
    stack: number; // Amount of chips still available for the player
    bet: number; // The amount of chips the player put into the pot
    hole_cards?: Card[]; // The cards of the player (optional for other players)
};

// GameState type definition
type GameState = {
    tournament_id: string; // Id of the current tournament
    game_id: string; // Id of the current sit'n'go game
    round: number; // Index of the current round within a sit'n'go
    bet_index: number; // Index of the betting opportunity within a round
    small_blind: number; // The small blind in the current round
    current_buy_in: number; // The amount of the largest current bet from any one player
    pot: number; // The size of the pot (sum of the player bets)
    minimum_raise: number; // Minimum raise amount
    dealer: number; // The index of the player on the dealer button
    orbits: number; // Number of orbits completed
    in_action: number; // The index of your player in the players array
    players: _Player[]; // An array of the players
    community_cards: Card[]; // The array of community cards
};


export class Player {
    public betRequest(
        gameState: GameState,
        betCallback: (bet: number) => void
    ): void {
        console.log(
            `betRequest::GAME_ID::${gameState.game_id}::round::${gameState.round}`
        );
        //get our player
        const myPlayer = gameState.players.find(
            (player: any) => player.hole_cards
        );

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
            console.log('STRATEGY: post-flop');
            const enableFetching = true;
            if (enableFetching) {
                // community cards are available
                const knownCards = [...communityCards, ...holeCards];
                if (knownCards.length >= 5) {
                    type Hand = Array<{ rank: string; suit: string }>;
                    const timeoutPromise = new Promise((resolve) => {
                        setTimeout(() => {
                            console.log(
                                'STRATEGY: post-flop: timeout on network call'
                            );
                            resolve(null);
                        }, 2000);
                    });
                    const checkRanks = async (cards: Hand) => {
                        const query = new URLSearchParams();
                        query.set('cards', JSON.stringify(cards));

                        const response = await fetch(
                            `https://rainman.leanpoker.org/?${query.toString()}`
                        );
                        if (response.ok) {
                            const data = await response.json();
                            console.log(
                                'STRATEGY: post-flop: received response',
                                JSON.stringify(data, null, 2)
                            );
                            const rank = data.rank;
                            betCallback(rank * 100);
                        }
                    };
                    Promise.race([checkRanks, timeoutPromise]);
                }
                betCallback(50);
            }
        } else {
            // pre-flop
            console.log('STRATEGY: pre-flop');

            // Calculate hand strength (simplified: high cards or pair)
            const [strongHandValue, isTopHand] =
                this.getStrongHandValue(holeCards);

            // If the hand is topHand, bet aggressively
            if (isTopHand) {
                const raiseAmount =
                    currentBuyIn + minimumRaise * strongHandValue;
                betCallback(raiseAmount);
            } else if (strongHandValue > 1) {
                betCallback(currentBuyIn);
            } else {
                // // Bluff occasionally or fold
                // const shouldBluff = Math.random() > 0.8; // 20% bluff
                // if (shouldBluff) {
                //     const bluffRaise = currentBuyIn + minimumRaise * 2;
                //     betCallback(bluffRaise);
                // } else {
                //     // Fold if weak hand
                betCallback(0);
                // }
            }
        }
    }

    // Simplified hand strength calculation
    private getStrongHandValue(holeCards: any[]): [number, boolean] {
        let strength = 0;

        const highRanks = ['10', 'J', 'Q', 'K', 'A'];
        const topRanks = ['Q', 'K', 'A'];

        // Look for pairs, high cards, or potential straights/flushes
        const holeRanks = holeCards.map((card) => card.rank);
        const holeSuits = holeCards.map((card) => card.suit);

        // Check for a pair in hole cards or with community cards
        const hasPair = holeRanks[0] === holeRanks[1]

        const hasHighCard = holeCards.some((card) =>
            highRanks.includes(card.rank)
        );

        const hasTopCard = holeCards.some((card) =>
            topRanks.includes(card.rank)
        );

        const allTopCards = holeCards.every((card) =>
            topRanks.includes(card.rank)
        );

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
        console.log(
            `showdown::GAME_ID::${gameState.game_id}::round::${gameState.round}`
        );
    }
}

export default Player;


// Enum to represent card suits
enum Suit {
  HEARTS = "hearts",
  DIAMONDS = "diamonds",
  CLUBS = "clubs",
  SPADES = "spades"
}

// Object that assigns weights to card combinations
const handWeights: { [hand: string]: number } = {
  // Premium hands
  "AA": 1.00,
  "KK": 0.95,
  "QQ": 0.93,
  "AKs": 0.92,
  "JJ": 0.90,
  // Strong hands
  "AQs": 0.88,
  "TT": 0.86,
  "AJs": 0.84,
  "KQs": 0.83,
  "99": 0.80,
  "AKo": 0.78,
  "KJs": 0.77,
  "QJs": 0.75,
  "ATs": 0.73,
  "88": 0.72,
  // Marginal hands
  "A9s": 0.68,
  "KQo": 0.66,
  "77": 0.64,
  "JQo": 0.63,
  "AJo": 0.62,
  "KJo": 0.60,
  "QJo": 0.58,
  "66": 0.57,
  "A8s": 0.56,
  "KTs": 0.54,
  "55": 0.53,
  "T9s": 0.52,
  "Q9s": 0.50,
  "A7s": 0.49,
  "J9s": 0.48,
  "44": 0.47,
  "98s": 0.45,
  "33": 0.44,
  "A6s": 0.43,
  "QTs": 0.42,
  "22": 0.41,
  // Weak hands
  "K9s": 0.39,
  "JTo": 0.38,
  "A5s": 0.37,
  "A4s": 0.36,
  "J8s": 0.35,
  "T8s": 0.34,
  "A9o": 0.32,
  "K8s": 0.31,
  "97s": 0.30,
  "65s": 0.29,
  "A3s": 0.28,
  "54s": 0.27,
  "A2s": 0.26,
  "Q8s": 0.25,
  "J7s": 0.24,
  "76s": 0.23,
  "53s": 0.22,
  "J6s": 0.21,
  "T7s": 0.20,
  "K7s": 0.19,
  "Q6s": 0.18,
  "86s": 0.17,
  "J5s": 0.16,
  "43s": 0.15,
  "K6s": 0.14,
  "T6s": 0.13,
  "K5s": 0.12,
  "Q5s": 0.11,
  "Q4s": 0.10,
  "Q3s": 0.09,
  "J4s": 0.08,
  "42s": 0.07,
  "32s": 0.06
};

// Function to get hand weight based on the cards
function getHandWeight(card1: Card, card2: Card): number {
  // Define rank hierarchy for ordering
  const rankOrder: { [rank: string]: number } = {
      "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
      "8": 8, "9": 9, "T": 10, "J": 11, "Q": 12, "K": 13, "A": 14
  };

  // Sort the cards by rank in descending order
  let firstCard = card1;
  let secondCard = card2;

  if (rankOrder[card2.rank] > rankOrder[card1.rank]) {
      firstCard = card2;
      secondCard = card1;
  }

  // Determine if the hand is suited or offsuit
  const suited = firstCard.suit === secondCard.suit ? "s" : "o";

  // Construct the hand key
  const handKey = `${firstCard.rank}${secondCard.rank}${suited}`;

  // Attempt to retrieve the weight from handWeights
  if (handWeights.hasOwnProperty(handKey)) {
      return handWeights[handKey];
  }

  // If exact key not found, try without suitedness (for pairs)
  if (firstCard.rank === secondCard.rank) {
      const pairKey = `${firstCard.rank}${secondCard.rank}`;
      return handWeights[pairKey] || 0.0;
  }

  // If still not found, return a default weight for unknown hands
  return 0.0;
}
