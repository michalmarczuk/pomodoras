import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { BackendService, pomodoroTimerResponse, settingsResponse } from 'src/app/services/backend.service';
import { Subscription, timer } from 'rxjs';
import { map, take, finalize } from 'rxjs/operators';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Pomodoros } from './pomodoros';
import { FrontendService } from 'src/app/services/frontend.service';
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
  timerStartedAt: number = 0;
  counting = false;
  startStopButtonisDisabled!: boolean;
  state = '';
  pomodoros: Pomodoros = new Pomodoros();
  settings!: settingsResponse;
  current!: pomodoroTimerResponse;
  private user = this.backendService.user;
  private pomodoroTimer!: Subscription;

  constructor(private backendService: BackendService, public frontendService: FrontendService, private titleService: Title) { }

  async ngOnInit(): Promise<void> {    
    this.frontendService.waitForProcessing.subscribe((v) => this.startStopButtonisDisabled = v);

    await this.waitForLoading(); //Enable start/stop button when everything is loaded
    await this.initSettingsAndCurrentState();
    this.pomodoros = new Pomodoros(this.settings.pomodorosToDo);
    this.timerMax = this.settings.timerMax;
    this.timerCurrent = this.timerMax;

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

    this.frontendService.waitForProcessing.next(false);
  }

  async ngOnDestroy(): Promise<void> {
    if (this.pomodoroTimer) {
      this.pomodoroTimer.unsubscribe();
    }
  }

  async onSendUpdateCurrent() {
    await this.backendService.updatePomodoroTimer({
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
    this.frontendService.waitForProcessing.next(true);
    const current = await this.backendService.getPomodoroTimer();

    if (current.state === 'start') {
      this.state = 'pause'
      this.pomodoroTimer.unsubscribe();
      this.counting = false;
      await this.onSendUpdateCurrent();
    } else {
      if (this.timerCurrent === 0) this.timerCurrent = this.timerMax;
      this.startTimer(this.timerCurrent);
      this.counting = true;
      this.state = 'start'
      await this.onSendUpdateCurrent();
    }

    this.frontendService.waitForProcessing.next(false);
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

  private async waitForLoading() {
    let tries = 30;
    while (this.startStopButtonisDisabled && tries > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
      tries--;
    }
  }

  private startTimer(seconds: number) {
    //timer(delay, interval)
    //map - i on iterations => 1, 2, 3, ...
    //take - take number of elements
    this.timerStartedAt = Math.floor(Date.now() / 1000);

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
        this.timerCurrent = seconds - Math.floor(Date.now() / 1000 - this.timerStartedAt);
        this.circleCurrent = this.circleMax - ((this.circleMax / this.timerMax) * this.timerCurrent);

        this.titleService.setTitle(`${String(Math.floor(this.timerCurrent / 60)).padStart(2, '0')}:${String(this.timerCurrent % 60).padStart(2, '0')}`);
    });
  }

  private resetTimer() {
    this.timerCurrent = this.timerMax;
    this.circleCurrent = 0;
    this.titleService.setTitle(`${String(Math.floor(this.timerCurrent / 60)).padStart(2, '0')}:${String(this.timerCurrent % 60).padStart(2, '0')}`);
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
