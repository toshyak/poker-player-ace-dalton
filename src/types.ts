import { values } from "./constants";

// Player type definition
export type _Player = {
  id: number; // Id of the player
  name: string; // Name specified in the tournament config
  status: "active" | "folded" | "out"; // Status of the player
  version: string; // Version identifier returned by the player
  stack: number; // Amount of chips still available for the player
  bet: number; // The amount of chips the player put into the pot
  hole_cards?: CardType[]; // The cards of the player (optional for other players)
};

// GameState type definition
export type GameState = {
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
  community_cards: CardType[]; // The array of community cards
};

// Enum to represent card suits
export enum Suit {
  HEARTS = "hearts",
  DIAMONDS = "diamonds",
  CLUBS = "clubs",
  SPADES = "spades",
}
export type CardRank = keyof typeof values;

export type CardType = {
  rank: CardRank;
  suit: "clubs" | "spades" | "hearts" | "diamonds";
};
