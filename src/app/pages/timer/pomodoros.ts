export class Pomodoros {
    toDo: number;
    done: number = 0;

    constructor(pomodorosToDo: number = 0) {
        this.toDo = pomodorosToDo;
    }
    
    putToToDo(numberOfPomodoro: number) {
        this.toDo += numberOfPomodoro;
        this.done -= numberOfPomodoro;
    }

    putToDone(numberOfPomodoro: number) {
        this.done += numberOfPomodoro;
        this.toDo -= numberOfPomodoro;
    }

    getToDo() {
        return this.toDo;
    }

    getDone() {
        return this.done;
    }

    getToDoForUI() {
        return new Array(this.getToDo());
    }

    getDoneForUI() {
        return new Array(this.getDone());
    }
}