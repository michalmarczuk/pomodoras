import { Page } from "./page";

export class TimerPage extends Page {
    constructor() {
        super('/timer', '.cdk-drag');
    }

    clickStartButton() {
        cy.get('#startButton').should('not.be.disabled').click();
    }

    clickStopButton() {
        cy.get('#stopButton').should('not.be.disabled').click();
    }

    clickPauseButton() {
        cy.get('#pauseButton').should('not.be.disabled').click();
    }

    dragPomodoroToDone() {
        this.dragPomodoro('#pomodorosToDo img', '#pomodorosDone');
    }

    dragPomodoroToToDo() {
        this.dragPomodoro('#pomodorosDone img', '#pomodorosToDo');
    }
    
    timerShouldEqual(expectedTimerCount: string) {
        cy.get('#base-timer-label').contains(expectedTimerCount);
    }
    
    pomodorosDoneShouldEqual(expectedPomodorosDone: number) {
        cy.get('#pomodorosDone').find('img').should('have.length', expectedPomodorosDone);
    }

    private dragPomodoro(source: string, target: string) {
        cy.get(source).first().click();
        cy.get(source).first().trigger('mousedown', { button: 0, force: true });
        cy.get(target).first().trigger('mousemove').click({ force: true });
    }
}