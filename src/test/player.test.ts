const { Player, GameState } = require('../Player.js');

describe('Player', () => {
    let player;

    beforeEach(() => {
        player = new Player();
    });

    it('should return a bet based on hand strength pre-flop', async () => {
        const gameState = {
            tournament_id: '1',
            game_id: '1',
            round: 1,
            bet_index: 0,
            small_blind: 10,
            current_buy_in: 50,
            pot: 100,
            minimum_raise: 20,
            dealer: 0,
            orbits: 0,
            in_action: 0,
            players: [
                {
                    id: 0,
                    name: 'Player 1',
                    status: 'active',
                    version: '1.0',
                    stack: 1000,
                    bet: 0,
                    hole_cards: [
                        { rank: 'A', suit: 'hearts' },
                        { rank: 'K', suit: 'hearts' },
                    ],
                },
            ],
            community_cards: [],
        };

        await new Promise((resolve) => {
            player.betRequest(gameState, (bet) => {
                expect(bet).toBeGreaterThan(0);
                resolve();
            });
        });
    });

    it('should return a bet based on hand strength post-flop', async () => {
        const gameState = {
            tournament_id: '1',
            game_id: '1',
            round: 1,
            bet_index: 0,
            small_blind: 10,
            current_buy_in: 50,
            pot: 100,
            minimum_raise: 20,
            dealer: 0,
            orbits: 0,
            in_action: 0,
            players: [
                {
                    id: 0,
                    name: 'Player 1',
                    status: 'active',
                    version: '1.0',
                    stack: 1000,
                    bet: 0,
                    hole_cards: [
                        { rank: 'A', suit: 'hearts' },
                        { rank: 'K', suit: 'hearts' },
                    ],
                },
            ],
            community_cards: [
                { rank: 'A', suit: 'diamonds' },
                { rank: 'K', suit: 'clubs' },
                { rank: 'Q', suit: 'spades' },
            ],
        };

        await new Promise((resolve) => {
            player.betRequest(gameState, (bet) => {
                expect(bet).toBeGreaterThan(0);
                resolve();
            });
        });
    });
});