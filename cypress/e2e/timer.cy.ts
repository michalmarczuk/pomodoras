import { TimerPage } from "cypress/pages/timerPage";

describe('Timer component', () => {  
  it('Can start and stop timer', () => {
    cy.cleanUpDB();
    cy.login();

    const timerPage = new TimerPage();
    timerPage.timerShouldEqual('00:20');
    timerPage.clickStartButton();
    cy.wait(1200);

    timerPage.clickPauseButton();
    timerPage.timerShouldEqual('00:19');
  })

  it('Can pause and resume timer', () => {
    cy.cleanUpDB();
    cy.login();

    const timerPage = new TimerPage();
    timerPage.timerShouldEqual('00:20');
    timerPage.clickStartButton();
    cy.wait(1200);

    timerPage.clickPauseButton();
    timerPage.timerShouldEqual('00:19');
    timerPage.clickStartButton();
    cy.wait(1200);

    timerPage.clickPauseButton();
    timerPage.timerShouldEqual('00:18');
  })

  it('Dummy fails test', () => {
    expect(20).to.be.greaterThan(30);
  })
})
