import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { MaterialModule } from "./material.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { PageMainComponent } from "./components/page-main/page-main.component";
import { PageAboutComponent } from "./components/page-about/page-about.component";
import { PageSettingsComponent } from "./components/page-settings/page-settings.component";
import { NavlistComponent } from "./components/navlist/navlist.component";
import { AddNoteButtonComponent } from "./components/add-note-button/add-note-button.component";
import { AutoSizeInputModule } from "ngx-autosize-input";
import { NoteCardComponent } from "./components/note-card/note-card.component";
import { PageOtherComponent } from "./components/page-other/page-other.component";

@NgModule({
	declarations: [
		AppComponent,
		PageMainComponent,
		PageAboutComponent,
		PageOtherComponent,
		PageSettingsComponent,
		NavlistComponent,
		AddNoteButtonComponent,
		NoteCardComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		MaterialModule,
		AutoSizeInputModule,
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
