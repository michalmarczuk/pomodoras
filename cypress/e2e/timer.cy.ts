import { TimerPage } from "cypress/pages/timerPage";

describe('Timer component', () => {  
  it('Can start and stop timer', () => {
    cy.cleanUpDB();
    cy.login();

    const timerPage = new TimerPage();
    timerPage.waitForPageLoaded();
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
    timerPage.waitForPageLoaded();
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
    timerPage.waitForPageLoaded();
    timerPage.pomodorosDoneShouldEqual(0);
    timerPage.clickStartButton();
    cy.wait(11000);
    timerPage.pomodorosDoneShouldEqual(1);
  })

  it('Can drag pomodoros', () => {
    cy.cleanUpDB();
    cy.login();

    const timerPage = new TimerPage();
    timerPage.waitForPageLoaded();
    timerPage.dragPomodoroToDone();
    timerPage.pomodorosDoneShouldEqual(1);
    timerPage.dragPomodoroToToDo();
    timerPage.pomodorosDoneShouldEqual(0);
  })

  it('Can save and restore state', () => {
    cy.cleanUpDB();
    cy.login();

    const timerPage = new TimerPage();
    timerPage.waitForPageLoaded();
    timerPage.dragPomodoroToDone();
    timerPage.dragPomodoroToDone();

    timerPage.clickStartButton();
    cy.wait(1200);
    timerPage.clickPauseButton();

    const topBarMenu = timerPage.getTopBarMenu();
    topBarMenu.clickSettingsLink();
    topBarMenu.clickTimerLink();
    timerPage.waitForPageLoaded();

    timerPage.pomodorosDoneShouldEqual(2);
    timerPage.timerShouldEqual('00:09');
  })
})
