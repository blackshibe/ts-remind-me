import { app, BrowserWindow, dialog, ipcMain, Menu, Tray } from "electron";
import * as path from "path";
import { DtoSystemInfo } from "../ipc-dtos/dtosysteminfo";
import * as os from "os";
import {
	copyFile,
	mkdir,
	readFile,
	readFileSync,
	writeFile,
	writeFileSync,
} from "fs";

let window: BrowserWindow | null = null;
let tray: Tray | null = null;
let icon_path = app.getAppPath() + "/dist/renderer/assets/tray.png";

console.log(app.getAppPath() + "/dist/renderer/assets/tray.png");

const data_dir = app.getPath("userData") + "\\userdata";
const notes_dir = data_dir + "\\notes.json";
const misc_note_dir = data_dir + "\\misc.txt";
const photo_dir = data_dir + "\\images";
const force_kill_data = false;

const default_notes = [
	{
		description: "dogs are cool",
		creation_time: new Date().getTime(),
		due_time: new Date().getTime() + 60 * 60 * 1000,
	},
];

const tray_context_menu = Menu.buildFromTemplate([
	{
		label: "Quit",
		click: function () {
			app.quit();
		},
	},
]);

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid(length: number) {
	var result = "";
	var characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(
			Math.floor(Math.random() * charactersLength)
		);
	}
	return result;
}

// ensure userdata folder exists
readFile(data_dir, (err, data) => {
	if (err && err.errno === -4058) {
		mkdir(data_dir, {}, () => {});
	}
});

// ensure userdata folder exists
readFile(photo_dir, (err, data) => {
	if (err && err.errno === -4058) {
		mkdir(photo_dir, {}, () => {});
	}
});

app.on("ready", createWindow);
app.on("activate", () => {
	if (window === null) createWindow();
});

function createWindow() {
	window = new BrowserWindow({
		width: 480,
		height: 700,
		minHeight: 400,
		minWidth: 400,
		frame: false,
		transparent: true,
		webPreferences: {
			// Disabled Node integration
			nodeIntegration: false,
			// protect against prototype pollution
			contextIsolation: true,
			// turn off remote
			enableRemoteModule: false,
			// Preload script
			preload: path.join(app.getAppPath(), "dist/preload", "preload.js"),
		},
	});

	tray = new Tray(icon_path);
	tray.setToolTip("remind-me");
	tray.setContextMenu(tray_context_menu);
	window?.setSkipTaskbar(false);

	window.loadFile(path.join(app.getAppPath(), "dist/renderer", "index.html"));

	tray.on("click", () => {
		window?.setSkipTaskbar(false);
		window?.show();
	});

	window.on("closed", () => {
		window = null;
	});

	window.on("resize", () => {
		if (window) {
			window.webContents.send("window-size-change", window.getSize());
		}
	});
}

ipcMain.on("dev-tools", () => {
	if (window) {
		window.webContents.toggleDevTools();
	}
});

// callback hell
ipcMain.on("request-attach-image", (_, index) => {
	if (window) {
		dialog
			.showOpenDialog({
				properties: ["openFile"],
				filters: [
					{
						name: "Images",
						extensions: ["jpg", "png", "gif", "jfif"],
					},
				],
			})
			.then((data) => {
				if (!data.canceled) {
					let old_image_extension = data.filePaths[0]
						.split(".")
						.pop();
					let new_path = `${photo_dir}\\${makeid(
						20
					)}.${old_image_extension}`;
					copyFile(data.filePaths[0], new_path, () => {
						console.log(new_path);
						window?.webContents.send("note-image", index, new_path);
					});
				}
			});
	}
});

ipcMain.on("request-systeminfo", () => {
	const systemInfo = new DtoSystemInfo();
	systemInfo.Arch = os.arch();
	systemInfo.Hostname = os.hostname();
	systemInfo.Platform = os.platform();
	systemInfo.Release = os.release();
	const serializedString = systemInfo.serialize();
	if (window) {
		window.webContents.send("systeminfo", serializedString);
	}
});

ipcMain.on("request-version", () => {
	window?.webContents.send("app-version", app.getVersion());
});

ipcMain.on("request-minimize", () => {
	window?.setSkipTaskbar(true);
	window?.minimize();
});

ipcMain.on("request-notes", async () => {
	readFile(notes_dir, (err, data) => {
		if (force_kill_data) {
			window?.webContents.send(
				"get-notes",
				JSON.stringify(default_notes)
			);
		}

		if (err) {
			// likely a read error
			// i'm not sure how to handle these errors, so -4058 (no such file or directory)
			// simply creates a fresh file to read
			if (err.errno === -4058) {
				writeFile(
					notes_dir,
					JSON.stringify(default_notes),
					{},
					() => {}
				);
			}

			window?.webContents.send(
				"get-notes",
				JSON.stringify(default_notes)
			);
		} else {
			window?.webContents.send("get-notes", data.toString());
		}
	});
});

ipcMain.on("request-misc-note", async () => {
	readFile(misc_note_dir, (err, data) => {
		if (force_kill_data)
			window?.webContents.send("get-misc-note", "Hello world!");

		if (err) {
			// likely a read error
			// i'm not sure how to handle these errors, so -4058 (no such file or directory)
			// simply creates a fresh file to read
			if (err.errno === -4058)
				writeFile(misc_note_dir, "Hello world!", {}, () => {});

			window?.webContents.send("get-misc-note", "Hello world!");
		} else {
			window?.webContents.send("get-misc-note", data.toString());
		}
	});
});

ipcMain.on("set-misc-note", async (_, arg) => {
	writeFileSync(misc_note_dir, arg[0]);
});

ipcMain.on("write-notes", async (_, arg) => {
	writeFileSync(notes_dir, arg[0]);
});

if (force_kill_data) {
	console.log("warning: app data force killed");
}
console.log("data is being written to " + notes_dir);
