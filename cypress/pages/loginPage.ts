import { Page } from "./page";

export class LoginPage extends Page {
    constructor() {
        super('/', '#email');
    }
    
    login(user: string, password: string) {
        cy.get('#email').type(user);
        cy.get('#password').type(password);
        
        return cy.get('.btn').click();
    }
}