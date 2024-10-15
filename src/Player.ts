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
            const strongHandValue = this.getStrongHandValue(
                holeCards,
                communityCards
            );

            // If the hand is strong, bet aggressively
            if (strongHandValue > 0) {
                const raiseAmount =
                    currentBuyIn + minimumRaise * strongHandValue;
                betCallback(raiseAmount);
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
    private getStrongHandValue(
        holeCards: any[],
        communityCards: any[]
    ): number {
        let strength = 0;

        const highRanks = ['10', 'J', 'Q', 'K', 'A'];

        // Look for pairs, high cards, or potential straights/flushes
        const holeRanks = holeCards.map((card) => card.rank);
        const allCards = [...holeCards, ...communityCards];
        const holeSuits = holeCards.map((card) => card.suit);

        // Check for a pair in hole cards or with community cards
        const hasPair =
            holeRanks[0] === holeRanks[1] ||
            allCards.every((card) => holeRanks.includes(card.rank));

        const hasHighCard = holeCards.some((card) =>
            highRanks.includes(card.rank)
        );
        const hasSameSuit = holeSuits[0] === holeSuits[1];

        if (hasPair) {
            strength = strength + 2;
        }
        if (hasHighCard) {
            strength++;
        }
        if (hasSameSuit) {
            strength++;
        }

        return strength;
    }

    public showdown(gameState: any): void {
        console.log(
            `showdown::GAME_ID::${gameState.game_id}::round::${gameState.round}`
        );
    }
}

export default Player;
