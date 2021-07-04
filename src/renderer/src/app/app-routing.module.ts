import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PageAboutComponent } from "./components/page-about/page-about.component";
import { PageOtherComponent } from "./components/page-other/page-other.component";
import { PageMainComponent } from "./components/page-main/page-main.component";
import { PageSettingsComponent } from "./components/page-settings/page-settings.component";

const routes: Routes = [
	{ path: "", component: PageMainComponent },
	{ path: "main", component: PageMainComponent },
	{ path: "other", component: PageOtherComponent },
	{ path: "about", component: PageAboutComponent },
	{ path: "settings", component: PageSettingsComponent },
	//  { path: '404', component: NotfoundComponent },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
