import { UniqueSelectionDispatcher } from "@angular/cdk/collections";
import { Component, Input, NgZone, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { DueDateService } from "src/app/services/due.service";
import { note, NotesService } from "src/app/services/notes.service";

@Component({
	selector: "note-card",
	templateUrl: "./note-card.component.html",
	styleUrls: ["./note-card.component.scss"],
})
export class NoteCardComponent implements OnInit {
	@Input()
	note: note = {
		description: "invalid",
		creation_time: 0,
		due_time: 0,
	};
	inputted_time = 0;

	@Input()
	index: number = 0;

	note_url: SafeUrl = "";

	constructor(
		private snackBar: MatSnackBar,
		private notesService: NotesService,
		private sanitizer: DomSanitizer,
		private dueDateParser: DueDateService
	) {}

	ngOnInit(): void {
		const check = () => {
			if (this.note.image_path) {
				this.note_url = this.sanitizer.bypassSecurityTrustResourceUrl(
					this.note.image_path
				);
			}

			if (!this.note_url) setTimeout(check, 200);
		};

		this.inputted_time = this.note.due_time;
		setTimeout(check, 10);
	}

	formattedTimeFromUnixTimestamp(unix_timestamp: number) {
		var date = new Date(unix_timestamp);
		let minutes = date.getMinutes().toString();
		let seconds = date.getSeconds().toString();
		let day = this.dueDateParser.day_from_days(date.getDay() - 1);

		if (minutes.length < 2) minutes = "0" + minutes.toString();
		if (seconds.length < 2) seconds = "0" + seconds.toString();

		day = day.charAt(0).toUpperCase() + day.substr(1);
		return `${date.getHours()}:${minutes}, ${day}`;
	}

	focusLost() {
		this.notesService.commitNoteData();
	}

	removeCard() {
		this.notesService.deleteNote(this.index);
	}

	removeImage() {
		this.notesService.note_data[this.index].image_path = undefined;
		this.notesService.commitNoteData();
	}

	openSnackBar(message: string, action: string) {
		this.snackBar.open(message, action);
	}

	pickImage() {
		window.api.electronIpcSend("request-attach-image", this.index);
	}

	descriptionChanged(event: any) {
		this.notesService.note_data[this.index].description =
			event.target.value;
	}

	dueTimeChanged(event: any) {
		console.log("due time changed, new = ", event.target.value);
		let result = this.dueDateParser.translate_due_date_to_unix(
			event.target.value
		);

		if (result.unix) {
			let proper_result = new Date().getTime() + result.unix * 1000;
			console.log(result, proper_result);

			this.note.due_time = proper_result;
			this.notesService.note_data[this.index].due_time = proper_result;
		} else {
			this.note.due_time = 0;
			this.notesService.note_data[this.index].due_time = 0;
		}
	}

	dueTimeLostFocus(event: any) {
		this.notesService.commitNoteData();
	}
}
