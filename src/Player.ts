export class Player {
    public betRequest(
        gameState: any,
        betCallback: (bet: number) => void
    ): void {
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

    // Simplified hand strength calculation
    private hasStrongHand(holeCards: any[], communityCards: any[]): boolean {
        const highRanks = ['10', 'J', 'Q', 'K', 'A'];

        // Look for pairs, high cards, or potential straights/flushes
        const holeRanks = holeCards.map((card) => card.rank);
        const allCards = [...holeCards, ...communityCards];

        // Check for a pair in hole cards or with community cards
        const hasPair =
            holeRanks[0] === holeRanks[1] ||
            allCards.some((card) => holeRanks.includes(card.rank));

        const hasHighCard = holeCards.some((card) =>
            highRanks.includes(card.rank)
        );

        return hasPair || hasHighCard;
    }

    public showdown(gameState: any): void {}
}

export default Player;
