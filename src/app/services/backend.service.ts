import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError, exhaustMap, take, tap } from "rxjs/operators";
import { BehaviorSubject, Subject, throwError } from "rxjs";
import { User } from "../pages/auth/user.model";
import { Router } from "@angular/router";

interface loginResponse {
    email: string,
    localId: string,
    idToken: string,
    expiresIn: string,
}

interface currentResponse {
    id: string,
    date: string,
    timerCount: number,
    state: string,
    user: string,
}

@Injectable()
export class BackendService {
    user = new BehaviorSubject<User|null>(null);
    private tokenExpirationTimer: any;
    private apiURL = 'https://pomodoras-4403d-default-rtdb.europe-west1.firebasedatabase.app';

    constructor(private httpClient: HttpClient, private router: Router) { }

    async createPomodoroTimer(): Promise<currentResponse>  {
        await this.httpClient.post(`${this.apiURL}/pomodoroTimer.json`,
        {
            user: this.user.value?.email,
            date: JSON.stringify(new Date()),
            timerCount: 0,
            state: '',
        }).toPromise();

        return await this.getPomodoroTimer();
    }

    async getPomodoroTimer(): Promise<currentResponse>  {
        const response = await this.httpClient.get(`${this.apiURL}/pomodoroTimer.json`).toPromise();

        const usersPomodoroTimers = this.fireBaseResponseToArrayOfCurrentResponse(response);
        const currentUserPomodoroTimer = usersPomodoroTimers.find(o => o.user === this.user.value?.email);

        return currentUserPomodoroTimer as currentResponse;
    }

    async updatePomodoroTimer(data: any) {
        const CurrentId = (await this.getPomodoroTimer()).id;
        this.httpClient.put(`${this.apiURL}/pomodoroTimer/${CurrentId}.json`, data)
            .subscribe(response => console.log(response));
    }

    // async getCurrent(): Promise<currentResponse>  {
    //     const response = await this.httpClient.get('https://pomodoras-4403d-default-rtdb.europe-west1.firebasedatabase.app/current.json')
    //         .toPromise();
    //     // const id = Object.keys(response)[0];

    //     // return {
    //     //     id,
    //     //     ...response[id as keyof Object]
    //     // } as currentResponse;
    //     return this.fireBaseResponseToPomodoroTimer(response);
    // }

    // async updateCurrent(data: any) {
    //     const CurrentId = (await this.getCurrent()).id;
    //     this.httpClient.put(`https://pomodoras-4403d-default-rtdb.europe-west1.firebasedatabase.app/current/${CurrentId}.json`, data)
    //         .subscribe(response => console.log(response));
    // }

    async removeCurrent(id: any) {
        this.httpClient.delete(`https://pomodoras-4403d-default-rtdb.europe-west1.firebasedatabase.app/current/current/${id}`)
            .subscribe(response => console.log(response));
    }

    login(data: any) {
        return this.httpClient.post<loginResponse>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAY-o2Y6IHk258A-kHAY1dUJRWMh4B5dOY',
        {...data, returnSecureToken: true}).pipe(catchError(errorRes => {
            return throwError(errorRes.error.error.message);
        }), tap(resData => {
            const expirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);
            const user = new User(
                resData.email,
                resData.localId,
                resData.idToken,
                expirationDate
            );
            console.log(user);

            localStorage.setItem('userData', JSON.stringify(user));
            this.user.next(user);
            this.autoLogout(+resData.expiresIn * 1000);
        }));
    }

    autoLogout(expirationDuration: number) {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration);
    }

    logout() {
        console.log('Bye bye');
        localStorage.removeItem('userData');
        this.user.next(null);
        this.router.navigate(['/']);

        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
            this.tokenExpirationTimer = null;
        }
    }

    private fireBaseResponseToPomodoroTimer(response: any) {
        const id = Object.keys(response)[0];

        return {
            id,
            ...response[id as keyof Object]
        } as currentResponse;
    }

    private fireBaseResponseToArrayOfCurrentResponse(response: any) {
        return Object.keys(response).map(id => {
            return {
                id,
                ...response[id as keyof Object]
            } as currentResponse;
        });
    }
}