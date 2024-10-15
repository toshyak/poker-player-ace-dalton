export class Player {
  public betRequest(gameState: any, betCallback: (bet: number) => void): void {
    //get our player
    const myPlayer = gameState.players.find((player: any) => player.hole_cards);

    // just in case
    if (!myPlayer) {
      betCallback(0);
    }

    //check if we have a pair
    const [firstCard, secondCard] = myPlayer.hole_cards;
    if (firstCard.rank === secondCard.rank) {
      const topCards = ["A", "K", "Q", "J", "10"];

      if (topCards.includes(firstCard.rank)) {
        betCallback(200);
      }

      betCallback(50);

      return;
    }

    betCallback(5);
  }

  public showdown(gameState: any): void {}
}

export default Player;
