export class Page {
    path: string;
    css: string;

    constructor(path: string, css: string) {
        this.path = path;
        this.css = css;
    }

    open() {
        cy.visit(this.path);
        this.isPageLoaded();
    }

    isPageLoaded(): boolean {
        console.log(cy.get(this.css).should('be.visible'));
        return true;
    }
}