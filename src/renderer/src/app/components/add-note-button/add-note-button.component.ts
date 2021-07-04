import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NotesService } from "src/app/services/notes.service";

@Component({
	selector: "add-note-button",
	templateUrl: "./add-note-button.component.html",
	styleUrls: ["./add-note-button.component.css"],
})
export class AddNoteButtonComponent implements OnInit {
	constructor(
		private notesService: NotesService,
		private _snackBar: MatSnackBar
	) {}

	addNote() {
		this.notesService.writeNote({
			description: "dogs are cool",
			creation_time: new Date().getTime(),
			due_time: new Date().getTime() + 60 * 60 * 1000,
		});

		this._snackBar.open("Note added!", undefined, { duration: 1000 });
		this.notesService.commitNoteData();
	}

	ngOnInit(): void {}
}
