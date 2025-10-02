/**
 * returns a new date with a number of days added to it
 */
export declare function dateAddDays(date: Date, days: number): Date;
/**
 * returns a new date with a number of days subtracted from it
 */
export declare function dateSubDays(date: Date, days: number): Date;
/**
 * returns a new date with a number of minutes added to it
 */
export declare function dateAddMinutes(date: Date, minutes: number): Date;
/**
 * returns a new date with a number of minutes subtracted from it
 */
export declare function dateSubMinutes(date: Date, minutes: number): Date;
export declare function dateToString(date: Date): string;
export declare function dateToTimeString(date: Date): string;
export declare function dateToDateString(date: Date): string;
export declare function dateToWeekDay(date: Date): string;
/**
 * returns the timezone offset at the provided date accounting for daylight savings
 * @example
 * console.info(getTimezoneOffset("Africa/Cairo", new Date()));
 * // prints +0200 (No DST) or +0300 (DST)
 */
export declare function getTimezoneOffset(timeZone: string, date: Date): string;
export declare function getToday(): Date;
