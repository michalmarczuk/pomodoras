export class TopBarMenu {
    clickTimerLink() {
        this.goTo('timer');
    }

    clickReportsLink() {
        this.goTo('reports');
    }

    clickSettingsLink() {
        this.goTo('settings');
    }

    private goTo(location: string) {
        cy.get(`img[routerLink="${location}"]`).click();
    }
}