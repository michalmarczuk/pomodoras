declare namespace Cypress {
    interface Chainable {
        cleanUpDB(): Chainable<any>,
        login(): Chainable<any>
    }
}
