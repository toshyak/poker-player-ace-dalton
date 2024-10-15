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
                            return rank;
                        }
                    };
                    Promise.race([checkRanks, timeoutPromise]).then(
                        //@ts-expect-error:
                        (rank: number | null) => {
                            if (rank === null) {
                            betCallback(50);
                            return
                            }
                            betCallback(rank * 100);
                        }
                    );
                }
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
