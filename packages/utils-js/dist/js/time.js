/**
 * returns a new date with a number of days added to it
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
export function dateAddDays(date, days) {
    const newDate = new Date();
    newDate.setTime(date.getTime() + (days * (24 * 60 * 60 * 1000)));
    return newDate;
}
/**
 * returns a new date with a number of days subtracted from it
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
export function dateSubDays(date, days) {
    return dateAddDays(date, -days);
}
/**
 * returns a new date with a number of minutes added to it
 * @param {Date} date
 * @param {number} minutes
 * @returns {Date}
 */
export function dateAddMinutes(date, minutes) {
    const newDate = new Date();
    newDate.setTime(date.getTime() + (minutes * (60 * 1000)));
    return newDate;
}
/**
 * returns a new date with a number of minutes subtracted from it
 * @param {Date} date
 * @param {number} minutes
 * @returns {Date}
 */
export function dateSubMinutes(date, minutes) {
    return dateAddMinutes(date, -minutes);
}
const LOCALE = 'en-GB';
/**
 * @param {Date} date
 * @returns {string}
 */
export function dateToString(date) {
    return date.toLocaleString(LOCALE, { dateStyle: 'short', timeStyle: 'short' });
}
/**
 * @param {Date} date
 * @returns {string}
 */
export function dateToTimeString(date) {
    return date.toLocaleTimeString(LOCALE, { timeStyle: 'short' });
}
/**
 * @param {Date} date
 * @returns {string}
 */
export function dateToDateString(date) {
    return date.toLocaleString(LOCALE, { dateStyle: 'short' });
}
/**
 * @param {Date} date
 * @returns {string}
 */
export function dateToWeekDay(date) {
    return date.toLocaleString(LOCALE, { weekday: 'long' });
}
/**
 * returns the timezone offset at the provided date accounting for daylight savings
 * @example
 * console.info(getTimezoneOffset("Africa/Cairo", new Date()));
 * // prints +0200 (No DST) or +0300 (DST)
 * @param {string} timeZone
 * @param {Date} date
 * @returns {string}
 */
export function getTimezoneOffset(timeZone, date) {
    const timeZoneName = new Intl.DateTimeFormat(LOCALE, { timeZone, timeZoneName: 'longOffset' })
        .formatToParts(date)
        .find(part => part.type === 'timeZoneName')
        .value;
    return timeZoneName.replace('GMT', '').replace(':', '');
}
/**
 * @returns {Date}
 */
export function getToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
