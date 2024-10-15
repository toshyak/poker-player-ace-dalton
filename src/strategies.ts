export type Strategy = (
  gameState: any,
  player: any,
  betCallback: (bet: number) => void,
) => void;


export const strategies: Record<string, Strategy> = {
  defaultStrategy: (gameState, player, betCallback) => {
    betCallback(5)
  },
};
