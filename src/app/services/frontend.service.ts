import { Injectable } from "@angular/core";
import { ReplaySubject } from "rxjs";

@Injectable()
export class FrontendService {
    waitForProcessing = new ReplaySubject<boolean>(1);
}
