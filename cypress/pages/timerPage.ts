import { Page } from "./page";

export class TimerPage extends Page {
    constructor() {
        super('/timer', '.pomodoras-text');
    }

    clickStartButton() {
        cy.get('#startButton').should('not.be.disabled').click();
    }

    clickPauseButton() {
        cy.get('#pauseButton').should('not.be.disabled').click();
    }

    timerShouldEqual(expectedTimerCount: string) {
        cy.get('#base-timer-label').contains(expectedTimerCount);
    }
}