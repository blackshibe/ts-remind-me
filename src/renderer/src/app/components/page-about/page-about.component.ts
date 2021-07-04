import { Component, NgZone, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { IpcService } from "src/app/services/ipc.service";

@Component({
	selector: "page-about",
	templateUrl: "./page-about.component.html",
	styleUrls: ["./page-about.component.css"],
})
export class PageAboutComponent implements OnInit {
	shibeData = [];

	constructor(
		private ipcService: IpcService,
		private ngZone: NgZone,
		private snackBar: MatSnackBar
	) {}

	ngOnInit() {
		fetch(
			"http://shibe.online/api/shibes?count=1&urls=true&httpsUrls=true"
		).then((response) => {
			response.json().then((images) => {
				console.log(images);
				this.ngZone.run(() => {
					this.shibeData = images;
				});
			});
		});
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action);
	}
}
