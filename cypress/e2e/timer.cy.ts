import { TimerPage } from "cypress/pages/timerPage";

describe('Timer component', () => {  
  it('Can start and stop timer', () => {
    cy.cleanUpDB();
    cy.login();

    const timerPage = new TimerPage();
    timerPage.timerShouldEqual('00:10');
    timerPage.clickStartButton();
    cy.wait(1200);

    timerPage.clickPauseButton();
    timerPage.timerShouldEqual('00:09');
  })

  it('Can pause and resume timer', () => {
    cy.cleanUpDB();
    cy.login();

    const timerPage = new TimerPage();
    timerPage.timerShouldEqual('00:10');
    timerPage.clickStartButton();
    cy.wait(1200);

    timerPage.clickPauseButton();
    timerPage.timerShouldEqual('00:09');
    timerPage.clickStartButton();
    cy.wait(1200);

    timerPage.clickPauseButton();
    timerPage.timerShouldEqual('00:08');
  })

  it('Can count pomodoros', () => {
    cy.cleanUpDB();
    cy.login();

    const timerPage = new TimerPage();
    timerPage.pomodorosDoneShouldEqual(0);
    timerPage.clickStartButton();
    cy.wait(11000);
    timerPage.pomodorosDoneShouldEqual(1);
  })
})
