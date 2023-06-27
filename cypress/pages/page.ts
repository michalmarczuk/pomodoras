import { TopBarMenu } from "cypress/common/topBarMenu";

export class Page {
    path: string;
    css: string;

    constructor(path: string, css: string) {
        this.path = path;
        this.css = css;
    }

    open() {
        cy.visit(this.path);
        this.waitForPageLoaded();
    }

    waitForPageLoaded(): void {
        cy.get(this.css).should('be.visible')
    }

    getTopBarMenu() {
        return new TopBarMenu();
    }
}