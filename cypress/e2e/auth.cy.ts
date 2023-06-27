import { LoginPage } from "cypress/pages/loginPage";
import { TimerPage } from "cypress/pages/timerPage";

describe('Auth component', () => {
  let user: any;
  
  before(() => {
    cy.fixture('data.json').then((data) => {
      user = data.user;
    })
  })
  
  it('Can log in', () => {
    const loginPage: LoginPage = new LoginPage();
    loginPage.open();
    loginPage.login(user.email, user.password);

    const timerPage = new TimerPage();
    timerPage.waitForPageLoaded();
  })
})
