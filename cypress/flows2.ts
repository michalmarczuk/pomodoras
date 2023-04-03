import { LoginPage } from "./pages/loginPage";
import { TimerPage } from "./pages/timerPage";

export class Flows2 {
    user: any;

    constructor() {
        cy.fixture('data.json').then((data) => {
            this.user = data.user;
        });
    }

    login(): TimerPage {
        const loginPage: LoginPage = new LoginPage();
        loginPage.open();
        loginPage.login(this.user.email, this.user.password);

        const timerPage = new TimerPage();
        timerPage.isPageLoaded();

        return timerPage;
    }
}