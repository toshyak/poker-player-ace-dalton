export class Player {
    public betRequest(
        gameState: any,
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

        const holeCards = myPlayer.hole_cards;
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

    // Improved hand strength calculation
    private getStrongHandValue(holeCards: any[]): [number, boolean] {
        const handStrengthChart: Record<string, number> = {
            'AA': 10, 'KK': 9, 'QQ': 8, 'JJ': 7, 'AKs': 6, 'AQs': 5, 'AJs': 4, 'KQs': 3, 'AK': 2, 'TT': 1,
            '99': 9, '88': 8, '77': 7, '66': 6, '55': 5, '44': 4, '33': 3, '22': 2,
            'KJs': 5, 'QJs': 4, 'JTs': 3, 'T9s': 2, '98s': 1,
            'KTs': 4, 'QTs': 3, 'J9s': 2, 'T8s': 1,
            'K9s': 3, 'Q9s': 2, 'J8s': 1,
            'K8s': 2, 'Q8s': 1,
            'K7s': 1,
            'AQ': 5, 'AJ': 4, 'KQ': 3, 'KJ': 2, 'QJ': 1,
            'AT': 3, 'KT': 2, 'QT': 1,
            'A9': 2, 'K9': 1,
            'A8': 1,
        };

        const [card1, card2] = holeCards;
        const rank1 = card1.rank;
        const rank2 = card2.rank;
        const suited = card1.suit === card2.suit ? 's' : '';

        const handKey = rank1 + rank2 + suited;
        const reverseHandKey = rank2 + rank1 + suited;

        const strength = handStrengthChart[handKey] || handStrengthChart[reverseHandKey] || 0;

        const highRanks = ['10', 'J', 'Q', 'K', 'A'];
        const topRanks = ['Q', 'K', 'A'];

        const holeRanks = holeCards.map((card) => card.rank);
        const holeSuits = holeCards.map((card) => card.suit);

        const hasPair = holeRanks[0] === holeRanks[1];
        const hasHighCard = holeCards.some((card) => highRanks.includes(card.rank));
        const hasTopCard = holeCards.some((card) => topRanks.includes(card.rank));
        const allTopCards = holeCards.every((card) => topRanks.includes(card.rank));
        const hasSameSuit = holeSuits[0] === holeSuits[1];

        let additionalStrength = 0;
        if (hasPair) additionalStrength += 2;
        if (hasTopCard) additionalStrength++;
        if (hasSameSuit) additionalStrength++;

        return [strength + additionalStrength, allTopCards && hasPair];
    }

    public showdown(gameState: any): void {
        console.log(
            `showdown::GAME_ID::${gameState.game_id}::round::${gameState.round}`
        );
    }
}

export default Player;
