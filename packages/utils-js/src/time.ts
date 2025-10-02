/**
 * returns a new date with a number of days added to it
 */
export function dateAddDays(date: Date, days: number): Date {
    const newDate = new Date();
    newDate.setTime(date.getTime() + (days * (24 * 60 * 60 * 1000)));
    return newDate;
}

/**
 * returns a new date with a number of days subtracted from it
 */
export function dateSubDays(date: Date, days: number): Date {
    return dateAddDays(date, -days);
}

/**
 * returns a new date with a number of minutes added to it
 */
export function dateAddMinutes(date: Date, minutes: number): Date {
    const newDate = new Date();
    newDate.setTime(date.getTime() + (minutes * (60 * 1000)));
    return newDate;
}

/**
 * returns a new date with a number of minutes subtracted from it
 */
export function dateSubMinutes(date: Date, minutes: number): Date {
    return dateAddMinutes(date, -minutes);
}

const LOCALE = 'en-GB';

export function dateToString(date: Date): string {
    return date.toLocaleString(LOCALE, { dateStyle: 'short', timeStyle: 'short' });
}

export function dateToTimeString(date: Date): string {
    return date.toLocaleTimeString(LOCALE, { timeStyle: 'short' });
}

export function dateToDateString(date: Date): string {
    return date.toLocaleString(LOCALE, { dateStyle: 'short' });
}

export function dateToWeekDay(date: Date): string {
    return date.toLocaleString(LOCALE, { weekday: 'long' });
}

/**
 * returns the timezone offset at the provided date accounting for daylight savings
 * @example
 * console.info(getTimezoneOffset("Africa/Cairo", new Date()));
 * // prints +0200 (No DST) or +0300 (DST)
 */
export function getTimezoneOffset(timeZone: string, date: Date): string {
    function padded(num: number) {
        const sign = num < 0 ? '-' : '+';
        return sign + Math.abs(num).toString().padStart(4, '0');
    }

    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
    return padded(Math.round((tzDate.getTime() - utcDate.getTime()) / 6e4 / 60 * 100));
}

export function getToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
