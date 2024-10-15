export class Player {
    public betRequest(
        gameState: any,
        betCallback: (bet: number) => void
    ): void {
        //iterate over players
        //check if we have a pair
        for (let player of gameState.players) {
            if (player.hole_cards) {
                if (player.hole_cards[0].rank === player.hole_cards[1].rank) {
                    betCallback(50);
                    return;
                }
            }

            betCallback(5);
        }
    }

    public showdown(gameState: any): void {}
}

export default Player;
