import { Component, OnDestroy, OnInit } from '@angular/core';
import { BackendService, pomodoroTimerResponse, settingsResponse } from 'src/app/services/backend.service';
import { Subscription, timer, interval } from 'rxjs';
import { map, take, finalize } from 'rxjs/operators';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Pomodoros } from './pomodoros';
declare function isPermissionGranted(): any;
declare function requestPermission(): any;
declare function displayNotification(pomodoros: number): any;
declare function playSound(): any;

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
export class TimerComponent implements OnInit, OnDestroy {
  circleMax = 283;
  circleCurrent = 0;
  timerMax!: number;
  timerCurrent: number = 0;
  counting = false;
  state = '';
  pomodoros: Pomodoros = new Pomodoros();
  settings!: settingsResponse;
  current!: pomodoroTimerResponse;
  private user = this.backendService.user;
  private pomodoroTimer!: Subscription;

  constructor(private backendService: BackendService) { }

  async ngOnInit(): Promise<void> {
    await this.initSettingsAndCurrentState();
    this.pomodoros = new Pomodoros(this.settings.pomodorosToDo);
    this.timerMax = this.settings.timerMax;

    if (this.isToday(this.current.date)) {
      if (this.current.state === 'start') {
        const timeDiff = this.getDiffFromNowToGivenDateInSeconds(new Date(JSON.parse(this.current.date)));
        if (timeDiff > this.timerMax) {
          this.addPomodoro();
          this.state = 'stop';
          this.onSendUpdateCurrent();
        } else {
          this.startTimer(this.timerMax - timeDiff);
          this.counting = true;
        }
      }
  
      if (this.current.state === 'pause') {
        this.timerCurrent = this.current.timerCount;
        this.circleCurrent = this.circleMax - ((this.circleMax / this.timerMax) * this.timerCurrent);
      }

      this.pomodoros.putToDone(this.current.pomodorosDone);
    }
  }

  async ngOnDestroy(): Promise<void> {
    if (this.pomodoroTimer) {
      this.pomodoroTimer.unsubscribe();
    }   
  }

  onSendUpdateCurrent() {
    this.backendService.updatePomodoroTimer({
      date: JSON.stringify(new Date()),
      timerCount: this.timerCurrent,
      state: this.state,
      user: this.user.value?.email,
      pomodorosDone: this.pomodoros.getDone(),
    })
  }

  onClickStopPomodoroTimer() {
    if (this.pomodoroTimer) {
      this.pomodoroTimer.unsubscribe();
    }

    this.resetTimer();
    this.state = 'stop'
    this.onSendUpdateCurrent();
  }

  async onClickStartPausePomodoroTimer() {
    const current = await this.backendService.getPomodoroTimer();
    if (current.state === 'start') {
      this.state = 'pause'
      this.pomodoroTimer.unsubscribe();
      this.counting = false;
      this.onSendUpdateCurrent();
    } else {
      if (this.timerCurrent === 0) this.timerCurrent = this.timerMax;
      this.startTimer(this.timerCurrent);
      this.counting = true;
      this.state = 'start'
      this.onSendUpdateCurrent();
    }
  }

  dropPomodoro(event: CdkDragDrop<any>) {
    if (event.container.id !== event.previousContainer.id) {
      if (event.container.id === 'pomodorosDone') {
        this.pomodoros.putToDone(1);
      } else if (event.container.id === 'pomodorosToDo') {
        this.pomodoros.putToToDo(1);
      }
      this.onSendUpdateCurrent();
    }
  }

  private async initSettingsAndCurrentState() {
    this.current = await this.backendService.getPomodoroTimer();
    this.settings = await this.backendService.getSettings();
    if (!!!this.current) {
      this.current = await this.backendService.createPomodoroTimer();
    }
    if (!!!this.settings) {
      this.settings = await this.backendService.createSettings();
    }
  }

  private startTimer(seconds: number) {
    //timer(delay, interval)
    //map - i on iterations => 1, 2, 3, ...
    //take - take number of elements
    this.pomodoroTimer = timer(0, 1000)
      .pipe(map((i) => seconds - i))
      .pipe(take(seconds + 1))
      .pipe(finalize(async () => {
        if (this.timerCurrent === 0) {
          this.resetTimer();
          this.addPomodoro();
          this.state = 'stop'
          this.onSendUpdateCurrent();
        }
      }))
      .subscribe((x) => { 
        this.circleCurrent = this.circleMax - ((this.circleMax / this.timerMax) * x);
        this.timerCurrent = x;
    });
  }

  private resetTimer() {
    this.timerCurrent = this.timerMax;
    this.circleCurrent = 0;
    this.counting = false;
  }

  private isToday(dateString: string) {
    const date = new Date(JSON.parse(dateString));
    const today = new Date();

    return date.getDate() == today.getDate() &&
      date.getMonth() == today.getMonth() &&
      date.getFullYear() == today.getFullYear();
  }

  private getDiffFromNowToGivenDateInSeconds(date: Date) {
    return Math.round((new Date().getTime() - date.getTime()) / 1000);
  }

  private async addPomodoro() {
    this.pomodoros.putToDone(1);
    
    if (!isPermissionGranted()) {
      await requestPermission();
    }
    
    displayNotification(this.pomodoros.getDone());
    playSound();
  }

}
