import { Component, OnInit, NgZone } from "@angular/core";
import { note, NotesService } from "src/app/services/notes.service";

@Component({
	selector: "page-main",
	templateUrl: "./page-main.component.html",
	styleUrls: ["./page-main.component.scss"],
})
export class PageMainComponent implements OnInit {
	data: note[] = [];

	constructor(private notesService: NotesService, private ngZone: NgZone) {}

	updateNotes() {
		this.notesService.getNoteDataAsync().then((data: note[]) => {
			data.forEach((element) => {
				console.log(element);
			});
			this.data = data;
		});
	}

	ngOnInit() {
		this.updateNotes();
		this.notesService.onNoteDataUpdated(() => {
			this.ngZone.run(() => {
				this.data = this.notesService.note_data;
			});
		});
	}
}
