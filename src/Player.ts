import type { GameState, _Player } from "./types";
import { getHandRank } from "./ranking";
import { preflopbet } from "./pre-flop";

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
    const smallBlind = gameState.small_blind;
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
            console.log("REQUEST::", `https://rainman.leanpoker.org/?${query.toString()}`);

            const response = await fetch(
              `https://rainman.leanpoker.org/?${query.toString()}`
            );
            if (response.ok) {
              console.log("REQUEST::Response OK");
              const data = await response.json();
              const rank = data.rank;
              return rank
            }
            console.log("REQUEST::failed::", `https://rainman.leanpoker.org/?${query.toString()}`);
            return null
          };
          Promise.race([checkRanks(knownCards), timeoutPromise]).then((rank) => {
            if (typeof rank === "number") {
              const toBet = rank / 10 * myPlayer!.stack
              if (typeof rank === "number") {
                console.log(`POSTFLOP-1::MyCards:${JSON.stringify(holeCards)}::TableCards:${JSON.stringify(communityCards)}::POT::${pot}::BETTING::${toBet}}`);
                betCallback(toBet);
              } else {
                console.log(`POSTFLOP-5::MyCards:${JSON.stringify(holeCards)}::TableCards:${JSON.stringify(communityCards)}::POT::${pot}::BETTING::${rank * 10}}`);
                betCallback(rank * 10);
              }
            } else {
              console.log(`POSTFLOP-2::MyCards:${JSON.stringify(holeCards)}::TableCards:${JSON.stringify(communityCards)}::POT::${pot}::BETTING::50}`);
              betCallback(50);
            }
          });
        } else {
          console.log(`POSTFLOP-3::MyCards:${JSON.stringify(holeCards)}::TableCards:${JSON.stringify(communityCards)}::POT::${pot}::BETTING::50`);
          betCallback(50);
        }
      } else {
        const rank = getHandRank(knownCards as any);
        console.log(`POSTFLOP-4::MyCards:${JSON.stringify(holeCards)}::TableCards:${JSON.stringify(communityCards)}::POT::${pot}::BETTING::${rank * 100}`);
        betCallback(rank * 100);
      }
    } else {
      // pre-flop
      const bet = preflopbet(holeCards, gameState);
      console.log(
        `PREFLOP-1::MyCards:${JSON.stringify(holeCards)}::POT::${pot}::BETTING::${bet}`);
      betCallback(bet);
    }
  }

  public showdown(gameState: any): void {
  }
}

export default Player;
