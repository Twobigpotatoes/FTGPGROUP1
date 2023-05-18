/**
 * @description Time formatting
 * @param dateTime { number } 
 * @param fmt { string } Time format
 * @return { string }
 */

export const timeFormat = (dateTime, fmt = 'yyyy-mm-dd') => {
    // if null , time formatting
    if (!dateTime) {
        return ''
    }
    // If dateTime is 10 or 13 bits long, it is a timestamp in seconds and milliseconds, or if it is longer than 13 bits, it is in some other time format
    if (dateTime.toString().length == 10) {
        dateTime *= 1000
    }
    const date = new Date(dateTime)
    let ret
    const opt = {
        'y+': date.getFullYear().toString(), // year
        'm+': (date.getMonth() + 1).toString(), // month
        'd+': date.getDate().toString(), // day
        'h+': date.getHours().toString(), // hour
        'M+': date.getMinutes().toString(), // min
        's+': date.getSeconds().toString() // sec
    }
    for (const k in opt) {
        ret = new RegExp('(' + k + ')').exec(fmt)
        if (ret) {
            fmt = fmt.replace(
                ret[1],
                ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0')
            )
        }
    }
    return fmt
}