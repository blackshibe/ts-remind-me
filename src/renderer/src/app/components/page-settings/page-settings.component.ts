import { Component, NgZone, OnInit } from "@angular/core";
import { IpcService } from "src/app/services/ipc.service";

@Component({
	selector: "page-settings",
	templateUrl: "./page-settings.component.html",
	styleUrls: ["./page-settings.component.css"],
})
export class PageSettingsComponent implements OnInit {
	shibeData = [];

	constructor(private ipcService: IpcService, private ngZone: NgZone) {}
	ngOnInit() {}
}
