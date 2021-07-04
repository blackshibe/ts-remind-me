import { Component, OnInit, NgZone } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { IpcService } from "src/app/services/ipc.service";
import { note, NotesService } from "src/app/services/notes.service";

@Component({
	selector: "page-other",
	templateUrl: "./page-other.component.html",
	styleUrls: ["./page-other.component.scss"],
})
export class PageOtherComponent implements OnInit {
	main_note: string = "...";
	decrypted = false;

	constructor(
		private ipcService: IpcService,
		private notesService: NotesService,
		private ngZone: NgZone
	) {
		window.api.electronIpcSend("request-misc-note");
		const set = (_: any, arg: string) => {
			this.main_note = arg;
		};

		window.api.electronIpcOnce("get-misc-note", set);
	}

	focusLost(event: any) {
		window.api.electronIpcSend("set-misc-note", event.target.value);
	}

	ngOnInit() {}
}
