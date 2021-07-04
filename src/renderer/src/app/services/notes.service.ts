import { Injectable, NgZone } from "@angular/core";

export type note = {
	description: string;
	creation_time: number;
	due_time: number;

	image_path?: string;
};

@Injectable({
	providedIn: "root",
})
export class NotesService {
	note_data: note[] = [];
	listeners: Array<() => any> = [];

	constructor(private ngZone: NgZone) {
		const setImage = (_: any, index: number, url: string) => {
			this.ngZone.run(() => {
				this.note_data[index].image_path = url;
				this.fireDataChange();
			});
			this.commitNoteData();
			window.api.electronIpcOnce("note-image", setImage);
		};
		window.api.electronIpcOnce("note-image", setImage);
	}

	private fireDataChange() {
		this.listeners.forEach((element) => {
			element();
		});
	}

	commitNoteData() {
		console.log(JSON.stringify(this.note_data));
		window.api.electronIpcSend(
			"write-notes",
			JSON.stringify(this.note_data)
		);
	}

	getNoteDataAsync(): Promise<note[]> {
		window.api.electronIpcSend("request-notes");
		return new Promise((res, rej) => {
			const set = (_: any, arg: string) => {
				this.fireDataChange();
				this.note_data = JSON.parse(arg);
				res(this.note_data);
			};

			window.api.electronIpcOnce("get-notes", set);
		});
	}

	writeNote(data: note) {
		this.note_data.push(data);
	}

	deleteNote(id: number) {
		// angular FUCKING BREAKS if i use
		// delete note_data[id]
		// and i don't want to create a stackoverflow post
		// in fear of being shamed and hated for existing,
		// so this deep copies the array instead
		// (https://holycoders.com/javscript-copy-array/) doesn't work either

		// so angular doesn't detect the deletion
		// (even if it can probably be done with an if statement)
		// but this works
		// ok

		let clone: note[] = [];

		this.note_data.forEach((element, index) => {
			if (id !== index) {
				clone.push({
					description: element.description,
					creation_time: element.creation_time,
					image_path: element.image_path,
					due_time: element.due_time,
				});
			}
		});

		this.note_data = clone;
		this.fireDataChange();
	}

	// this might be really stupid
	onNoteDataUpdated(listener: () => any) {
		this.listeners.push(listener);
	}
}
