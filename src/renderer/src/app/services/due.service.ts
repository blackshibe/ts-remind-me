import { Injectable } from "@angular/core";

// test
const day_length = 86400;
const default_day_time = 15;

// questionable practices
let units: { [index: string]: number | undefined } = {};
units.second = 1;
units.minute = 60;
units.hour = units.minute * 60;
units.day = day_length;
units.week = units.day * 7;

// why do these have to exist??
let times_of_day: { [index: string]: number | undefined } = {};
times_of_day.midnight = day_length;
times_of_day.midday = day_length / 2;
times_of_day.morning = units.hour * 8;
times_of_day.noon = day_length / 2;

let days = [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday",
];

interface unix_return_data {
	already_passed?: boolean;
	unix?: number;
	invalid?: boolean;
}

@Injectable({
	providedIn: "root",
})
export class DueDateService {
	constructor() {}

	get_seconds_since_midnight() {
		var now = new Date(),
			then = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
				0,
				0,
				0
			),
			diff = now.getTime() - then.getTime(); // difference in milliseconds

		return diff / 1000;
	}

	// without this, getting the previous day on a monday would yield undefined
	day_from_days(day: number) {
		if (day === -1) {
			day = days.length - 1;
		} else if (day >= days.length - 1) {
			day %= days.length - 1;
		}

		return days[day];
	}

	find_next_day(day_alias: string, time_alias: number) {
		day_alias = day_alias.toLowerCase();

		let current_date = new Date();
		let since_last_midnight = this.get_seconds_since_midnight();
		let current_week_day = days[current_date.getDay() - 1];
		let days_until_due = 0;

		if (day_alias === "tomorrow")
			day_alias = this.day_from_days(current_date.getDay());
		if (day_alias === "today")
			day_alias = this.day_from_days(current_date.getDay() - 1);

		if (current_week_day === day_alias) {
			let time_until_due = units.hour! * time_alias - since_last_midnight;
			if (time_until_due < 0) return "already_passed";
			else return time_until_due;
		}

		let i = current_date.getDay() - 2;
		while (!days_until_due) {
			i += 1;
			if (day_alias == this.day_from_days(i)) {
				days_until_due = i;
				break;
			}
			if (i > 100) return;
		}

		let day_delta = days_until_due - (current_date.getDay() - 1);
		return (
			units.day! * day_delta +
			(units.hour! * time_alias - since_last_midnight)
		);
	}

	// returns how much time is left until the due date
	translate_due_date_to_unix(date: string): unix_return_data {
		let args = date.split(" ");

		// midnight
		if (times_of_day[args[0].toLowerCase()]) {
			let result = this.find_next_day("tomorrow", 0);
			if (typeof result === "string") return { already_passed: true };
			if (!result) return { invalid: true };

			return { unix: result };
		}

		// tomorrow
		if (args[0].toLowerCase() === "tomorrow") {
			let result = this.find_next_day("tomorrow", default_day_time);
			if (typeof result === "string") return { already_passed: true };
			if (!result) return { invalid: true };

			return { unix: result };
		}

		// tonight
		if (args[0].toLowerCase() === "tonight") {
			let result = this.find_next_day("today", 21);
			if (typeof result === "string") return { already_passed: true };
			if (!result) return { invalid: true };

			return { unix: result };
		}

		// in 1 unit
		// in a unit
		// isn't it convenient none of the units have `s` in them?
		let type_1_match =
			date.match(/in (\d+|a) ([^\n ]+)/) ||
			date.match(/(\d+|a) ([^\n ]+)/);
		if (type_1_match) {
			let multiplier = type_1_match[1];
			let unit = type_1_match[2].toLowerCase();

			// shaves off the s at the end
			if (unit.charAt(unit.length - 1) == "s")
				unit = unit.substr(0, unit.length - 1);
			let translated_unit = units[unit];

			if (multiplier === "a") multiplier = "1";
			if (translated_unit)
				return { unix: translated_unit * parseFloat(multiplier) };
		}

		// 1pm friday
		// 1am friday
		// 5pm on friday
		let type_2_match = date.match(/(\d+)(pm|am)( on | )([^\n ]+)/);
		if (type_2_match) {
			let day_alias = type_2_match[4].toLowerCase();
			let time_alias = parseFloat(type_2_match[1]);
			let format_alias = type_2_match[2];

			if (format_alias === "pm") time_alias = 12 + time_alias;
			let result = this.find_next_day(day_alias, time_alias);

			if (typeof result === "string") return { already_passed: true };
			if (!result) return { invalid: true };
			return { unix: result };
		}

		// 16:30 (day)
		let type_3_match = date.match(/(\d+):(\d+)(:\d+|)(, | )([^\n ]+)/);
		if (type_3_match) {
			let hour_alias = parseFloat(type_3_match[1]);
			let minute_alias = parseFloat(type_3_match[2]) / 60;
			let second_alias =
				parseFloat(type_3_match[3] === "" ? type_3_match[3] : "0") || 0;

			let day_alias = type_3_match[5].toLowerCase();
			let time_alias = hour_alias + minute_alias + second_alias / 60 / 60;
			let result = this.find_next_day(day_alias, time_alias);

			if (typeof result === "string") return { already_passed: true };
			if (!result) return { invalid: true };
			return { unix: result };
		}

		// next day
		let type_4_match = date.match(/next ([^\n ]+)/);
		if (type_4_match) {
			let unit_alias = type_4_match[1].toLowerCase();
			switch (unit_alias) {
				case "week": {
					return { unix: units.week };
				}
				case "morning": {
					let result = this.find_next_day("tomorrow", 8);

					if (typeof result === "string")
						return { already_passed: true };
					if (!result) return { invalid: true };
					return { unix: result };
				}
			}
		}

		// in a day
		// in a week
		let type_5_match = date.match(/(in an|an|a|in a) ([^\n 0-9]+)/);
		if (type_5_match) {
			let unit = type_5_match[2];
			let translated_unit = units[unit];

			if (translated_unit) return { unix: translated_unit };
		}

		// on day of week
		// on monday
		let type_6_match = date.match(/(on | )([^\n ]+)/);
		if (type_6_match) {
			let day_alias = type_6_match[2].toLowerCase();
			let result = this.find_next_day(day_alias, default_day_time);

			if (typeof result === "string") return { already_passed: true };
			if (!result) return { invalid: true };
			return { unix: result };
		}

		console.log("no match");

		return { invalid: true };
	}
}
