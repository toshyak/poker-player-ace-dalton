const { getHandWeight } = require('../ranking.js');

describe('getHandWeight', () => {
    it('should return the correct weight for a suited hand', () => {
        const card1 = { rank: 'A', suit: 'hearts' };
        const card2 = { rank: 'K', suit: 'hearts' };
        const weight = getHandWeight(card1, card2);
        expect(weight).toBeGreaterThan(0); // Replace with the expected weight
    });

    it('should return the correct weight for an offsuit hand', () => {
        const card1 = { rank: 'A', suit: 'hearts' };
        const card2 = { rank: 'K', suit: 'clubs' };
        const weight = getHandWeight(card1, card2);
        expect(weight).toBeGreaterThan(0); // Replace with the expected weight
    });

    it('should return the correct weight for a pair', () => {
        const card1 = { rank: 'A', suit: 'hearts' };
        const card2 = { rank: 'A', suit: 'clubs' };
        const weight = getHandWeight(card1, card2);
        expect(weight).toBeGreaterThan(0); // Replace with the expected weight
    });

    it('should return 0 for an unknown hand', () => {
        const card1 = { rank: '2', suit: 'hearts' };
        const card2 = { rank: '7', suit: 'clubs' };
        const weight = getHandWeight(card1, card2);
        expect(weight).toBe(0);
    });

    it('should return the correct weight for a hand with rank "10"', () => {
        const card1 = { rank: '10', suit: 'hearts' };
        const card2 = { rank: 'A', suit: 'hearts' };
        const weight = getHandWeight(card1, card2);
        console.log(`Weight for hand with rank "10" (10 hearts, J hearts): ${weight}`);
        expect(weight).toEqual(0.73); // Replace with the expected weight
    });

    it('should return the correct weight for a hand with one card rank "10"', () => {
        const card1 = { rank: '10', suit: 'hearts' };
        const card2 = { rank: 'Q', suit: 'hearts' };
        const weight = getHandWeight(card1, card2);
        console.log(`Weight for hand with one card rank "10" (10 hearts, Q clubs): ${weight}`);
        expect(weight).toEqual(0.42); // Replace with the expected weight
    });
});