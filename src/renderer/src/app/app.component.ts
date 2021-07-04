import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { IpcService } from "./services/ipc.service";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { NotesService } from "./services/notes.service";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
	title = "remind-me";

	constructor(
		private ipcService: IpcService,
		private noteService: NotesService,
		private snackBar: MatSnackBar
	) {}

	ngOnInit() {}

	clickDevTools() {
		this.ipcService.openDevTools();
	}

	quit() {
		this.ipcService.minimize();
	}
}
