// Test extension đơn giản
console.log('Extension test loaded!');

// Test function
function testFunction() {
    console.log('Test function called!');
    return 'Hello from extension!';
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testFunction };
}
