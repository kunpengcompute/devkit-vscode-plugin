
function sum(a, b) {
    return a + b;
}

test('1 + 1', () => {
    expect(sum(1, 1)).toBe(2);
})

test('2 + 2', () => {
    expect(sum(2, 2)).toBe(4);
})

test('4 + 3', () => {
    expect(sum(4, 3)).toBe(7);
})