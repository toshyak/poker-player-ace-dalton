import { values, handWeights } from "./constants";
import { CardType, CardRank } from "./types";

export function getCardValue(cardRank: CardRank): number {
  return values[cardRank];
}

export function getHandRank(hand: CardType[]): number {
  const has5Cards = hand.length >= 5;


  const ranks = hand.map((card) => getCardValue(card.rank));
  const suits = hand.map((card) => card.suit);

  const rankCounts = ranks.reduce<{ [key: number]: number }>((acc, rank) => {
    acc[rank] = (acc[rank] || 0) + 1;
    return acc;
  }, {});

  const rankValues = Object.keys(rankCounts)
    .map(Number)
    .sort((a, b) => rankCounts[b] - rankCounts[a] || b - a);
  const countValues = Object.values(rankCounts).sort((a, b) => b - a);

  const isFlush = has5Cards && new Set(suits).size === 1;
  const isStraight =
    has5Cards && Math.max(...rankValues) - Math.min(...rankValues) === 4;

  if (isStraight && isFlush) {
    return 8; // Straight flush
  } else if (countValues[0] === 4) {
    return 7; // Four of a kind
  } else if (countValues[0] === 3 && countValues[1] === 2) {
    return 6; // Full house
  } else if (isFlush) {
    return 5; // Flush
  } else if (isStraight) {
    return 4; // Straight
  } else if (countValues[0] === 3) {
    return 3; // Three of a kind
  } else if (countValues[0] === 2 && countValues[1] === 2) {
    return 2; // Two pairs
  } else if (countValues[0] === 2) {
    return 1; // One pair
  } else {
    return 0; // High card
  }
}

// Function to get hand weight based on the cards
export function getHandWeight(card1: CardType, card2: CardType): number {
  // Define rank hierarchy for ordering
  const rankOrder: { [rank: string]: number } = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
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
