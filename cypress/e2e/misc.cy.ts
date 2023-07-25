import { LoginPage } from "cypress/pages/loginPage";
import packageInfo from '../../package.json';

describe('Misc tests not connected to particular page', () => {
  it('Version is visible in HTML', () => {
    const expectedVersion = packageInfo.version;

    const loginPage: LoginPage = new LoginPage();
    loginPage.open();

    cy.get('head meta[name="version"]').should(
      'have.attr',
      'content',
      expectedVersion
    )
  })
})
