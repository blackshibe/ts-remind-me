import { Component, OnInit, EventEmitter, Output, NgZone } from "@angular/core";
import { IpcService } from "src/app/services/ipc.service";

@Component({
	selector: "app-navlist",
	templateUrl: "./navlist.component.html",
	styleUrls: ["./navlist.component.css"],
})
export class NavlistComponent implements OnInit {
	version: string = "INVALID";

	@Output() sidenavClose = new EventEmitter();
	constructor(private ipcService: IpcService, private ngZone: NgZone) {}

	ngOnInit() {
		const set = (event: any, arg: any) => {
			this.ngZone.run(() => {
				this.version = arg;
			});
		};

		window.api.electronIpcSend("request-version");
		window.api.electronIpcOnce("app-version", set);
	}

	public onSidenavClose = () => {
		this.sidenavClose.emit();
	};
}
