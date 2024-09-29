import { $user } from '../mongoose.js';
import information from '../ifo.json' with { type: 'json' };
import { bot } from './telegramConnect.js';
import stiker from '../settings/stikers.json' with { type: 'json' };
import rq from 'prequest';

const ADMINS = information.admins;

export async function saveUser(id, count, name) {
    try
    {
        if (name === undefined) {
            let user = new $user({
                dateRegistrator: time(5),
                uid: count,
                id: id,
                userNick: `Без никнейма`,
                balance: 50,
                free: information.free,
                referalCount: 0,
                referalBalance: 0,
                referalName: '-',
                isBanned: false,
                subscriptionIndex: -1,
				requestCount: 0
            })

            await user.save();
            await bot.telegram.sendSticker(`${user.id}`, stiker.panda_eee).catch(err => { console.log(err) })
            await bot.telegram.sendMessage(`${user.id}`,  `️✅ ПОЛУЧЕН БОНУС!\n➖➖➖➖➖➖➖➖➖➖\n🥳 Благодарим вас за регистрацию и за проявленный интерес к нашему боту!\n💝 В качестве «бонуса» мы начислили на ваш баланс +50₽ которых вы можете потратить на услуги нашего бота.`, {
					reply_markup: {
						inline_keyboard: [
							[{
								text: '➕ Пополнить баланс',
								callback_data: 'donate'
							}]
						]
					}
		    }).catch(err => { console.log("saveUser " + err) })
                        await bot.telegram.sendMessage(`${information.channel}`, `➕ ЗАРЕГИСТРИРОВАЛСЯ НОВЫЙ КЛИЕНТ!\n➖➖➖➖➖➖➖➖➖\n👤 Логин клиента: @${user.userNick}\n🆔 Телеграм ID: ${user.id}\n💝 Клиенту был начислен бонус за регистрацию!\n💵 Баланс клиента: ${user.balance} ₽\n📙 Дата и время регистрации: ${user.dateRegistrator}`).catch(err => { console.log(err) })
            return true;
        } else {
            let user = new $user({
                dateRegistrator: time(5),
                uid: count,
                id: id,
                userNick: `${name}`,
                balance: 50,
                free: information.free,
                referalCount: 0,
                referalBalance: 0,
                referalName: '-',
                isBanned: false,
                subscriptionIndex: -1,
				requestCount: 0
            })

            await user.save();
            await bot.telegram.sendSticker(`${user.id}`, stiker.panda_eee).catch(err => { console.log(err) })
                        await bot.telegram.sendMessage(`${user.id}`,  `️✅ ПОЛУЧЕН БОНУС!\n➖➖➖➖➖➖➖➖➖➖\n🥳 Благодарим вас за регистрацию и за проявленный интерес к нашему боту!\n💝 В качестве «бонуса» мы начислили на ваш баланс +50₽ которых вы можете потратить на услуги нашего бота.`, {
					reply_markup: {
						inline_keyboard: [
							[{
								text: '➕ Пополнить баланс',
								callback_data: 'donate'
							}]
						]
					}
		    }).catch(err => { console.log("after save user " + err) })
            await bot.telegram.sendMessage(`${Number(information.channel)}`, `➕ ЗАРЕГИСТРИРОВАЛСЯ НОВЫЙ КЛИЕНТ!\n➖➖➖➖➖➖➖➖➖\n👤 Логин клиента: @${user.userNick}\n🆔 Телеграм ID: ${user.id}\n💝 Клиенту был начислен бонус за регистрацию!\n💵 Баланс клиента: ${user.balance} ₽\n📙 Дата и время регистрации: ${user.dateRegistrator}`).catch(err => { console.log(err) })
            return true;
        }
    }catch(e)
    {
        //дубликат?
        return false;
    }
}


export async function main_keyboard(ctx) {
    if (ADMINS.includes(ctx.from.id)) {   
        return await ctx.replyWithMarkdown(`💬 *Возвращаемся в главное меню...*`, {
            reply_markup: {
                resize_keyboard: true,
                keyboard: [
                    [
						{
                        text: '🚘 Заказать отчёт'
						},
                        {
                            text: '🛍 Купить тариф'
						}
					],	
                    [
						{
                            text: '🔐 Профиль'
                        },
						{
                            text: '📋 Отчёты'
                        },
                        {
                            text: '🎁 Рефералы'
                        }
                    ],				
                    [
						{
                            text: '⭕️ Правила'
                        },						
                        {
                            text: '🆘 Помощь'
                        }
                    ],
					[
                        {
                            text: '🅰️дминка'
                        }
					]
                ],
                one_time_keyboard: false
            }
        })
    }

    await ctx.replyWithMarkdown(`💬 *Возвращаемся в главное меню...*`, {
        reply_markup: {
            resize_keyboard: true,
            keyboard: [
                    [
						{
                            text: '🚘 Заказать отчёт'
						},
                        {
                            text: '🛍 Купить тариф'
						}
					],
                    [
						{
                            text: '🔐 Профиль'
                        },

						{
                            text: '📋 Отчёты'
                        },
                        {
                            text: '🎁 Рефералы'
                        }
                    ],
                    [
						{
                            text: '⭕️ Правила'
                        },						
                        {
                            text: '🆘 Помощь'
                        }
                    ],
            ],
            one_time_keyboard: false
        }
    })
}


export async function admin_keyboard(ctx) {
    const { result } = await rq(`https://data.tronk.info/profile.ashx?key=${information.api}`)
    if (!result) return ctx.replyWithMarkdown(`⛔️ Ошибка с *получением данных*.`)
    
    ctx.replyWithMarkdown(`*⭐️ Добро пожаловать в Админ-панель!*\n⚡️ Срок действия API до: *${result.accessToStr}г.*\n🔋 Остаток запросов: *${result.accountBalance}-шт.*`, {
        reply_markup: {
            keyboard: [
                [
					{
                        text: '🐬 Пользователи'
                    },
                    {
                        text: '🐳 Администрация'
                    }
				],
				[
					{
                        text: '👨‍👨‍👧 Список рефералов'
					},
                    {
                        text: '👥 Реф. система'
                    }
				],				
                [
                    {
                        text: '📆 История отчётов'
                    },
					{
                        text: '📈 Статистика бота'
                    }
                ],
				[
                    {
                        text: '♻️ Тарифные планы'
                    },
                    {
                        text: '🎭 Нарушители'
                    }
                ],
				
				[
					{
                        text: '📣 Промоакции'
                    },
                    {
                        text: '📤 Обратная связь'
					}					
				],
                [
                    {
                        text: '📝 Отдел правил'
                    },
                    {
                        text: '🛠 Конфигурации'
                    }
                ],
                [
					{
                        text: '⬅️ Выйти из админки'
					}
				]
            ]
        }
    })
}



export const utils = {
    sp: (int) => {
        int = int.toString();
        return int.split('').reverse().join('').match(/[0-9]{1,3}/g).join('.').split('').reverse().join('');
    },
    rn: (count) => {
        count = Math.floor(count);
        let i = 0 === count ? count : Math.floor(Math.log(count) / Math.log(1000));
        let result = parseFloat((count / Math.pow(1000, i)).toFixed(2));
        if (i >= 17)
            return "Очень много...";
        result += " " + ["", "тыс", "млн", "млрд", "трлн", "кврлн", "квинтл", "скстлн", "сптлн", "октлн", "нонлн", "дцлн", "ундцлн", "додцлн", "трдцлн", "квтуордцлн", "квндцлн"][i];
        return result;
    },
    rn2: (int, fixed) => {
        if (int === null)
            return null;
        if (int === 0)
            return '0';
        fixed = (!fixed || fixed < 0) ? 0 : fixed;
        let b = (int).toPrecision(2).split('e'),
            k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3),
            c = k < 1 ? int.toFixed(0 + fixed) : (int / Math.pow(10, k * 3)).toFixed(1 + fixed),
            d = c < 0 ? c : Math.abs(c),
            e = d + ['', 'тыс', 'млн', 'млрд', 'трлн'][k];
        e = e.replace(/e/g, '');
        e = e.replace(/\+/g, '');
        e = e.replace(/Infinity/g, 'Бесконечно...');
        return e;
    },
    match: (str, balance) => Math.floor(Number(str.replace(/(вс(е|ё)|в(о|а)банк)$/ig, balance).replace(/(к|k)$/ig, "000").replace(/(м|m)$/ig, "000000"))) < 0 ? 0 : Math.floor(Number(str.replace(/(вс(е|ё)|в(о|а)банк)$/ig, balance).replace(/(к|k)$/ig, "000").replace(/(м|m)$/ig, "000000"))),
    random: (x, y) => y ? Math.round(Math.random() * (y - x)) + x : Math.round(Math.random() * x),
    filter: (text) => /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*|vto pe|вто.пе|вто пе|vto.pe)$/ig.test(text) ? true : false,
    gi: (int) => {
        int = int.toString();
        let text = ``;
        for (var i = 0; i < int.length; i++) {
            text += `${int[i]}&#8419;`;
        }
        return text;
    },
    decl: (n, titles) => {
        return titles[(n % 10 === 1 && n % 100 !== 11) ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
    },
    pick: (array) => {
        return array[utils.random(0, array.length - 1)];
    },
    getSadEmoji: () => utils.pick(["😞", "😔", "😟", "😩", "😣", "☹️", "🙁", "😕", "😦", "😧"]),
    getEmoji: () => utils.pick(["😁", "☺", "🙂", "😉", "😄", "😃", "😺"])
}


export function time(type) {
    var time = new Date()
    if (time.getSeconds().toString().length == 1) {
        var sec = "0" + time.getSeconds()
    } else {
        var sec = time.getSeconds()
    }
    if (time.getMinutes().toString().length == 1) {
        var min = "0" + time.getMinutes()
    } else {
        var min = time.getMinutes()
    }
    if (time.getDate().toString().length == 1) {
        var date = "0" + time.getDate()
    } else {
        var date = time.getDate()
    }
    if (time.getHours().toString().length == 1) {
        var hour = "0" + time.getHours()
    } else {
        var hour = time.getHours()
    }
    if (time.getMonth().toString().length == 1) {
        var mon = "0" + time.getMonth()
    } else {
        var mon = time.getMonth()
    }
    if (type == 1) {
        var wdays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        var mes = ["января", "февравля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
        var gone = "📅 Дата: " + date + " " + mes[time.getMonth()] + " " + time.getFullYear() + " г. (" + wdays[time.getDay()] + ")\n⏰ Время: " + hour + ":" + min + ":" + sec
        return gone
    }
    if (type == 2) {
        var wdays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        var mes = ["января", "февравля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
        var gone = +date + " " + mes[time.getMonth()] + " " + time.getFullYear() + " || " + hour + ":" + min + ":" + sec
        return gone
    }
    if (type == 3) {
        let moment = require('moment-timezone')
        let a = moment.tz(new Date(), 'Europe/Moscow')

        return a.format();
    }
    if (type == 4) {
        var mes = ["января", "февравля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
        var wdays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        return {
            data: {
                date: date,
                mes: mes[time.getMonth()],
                year: time.getFullYear(),
                wdays: wdays[time.getDay()]
            },
            time: {
                hour: hour,
                min: min,
                sec: sec
            }
        }
    }
    if (type == 5) {
        var wdays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        var mes = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
        var gone = +date + "." + mes[time.getMonth()] + "." + time.getFullYear() + " | " + hour + ":" + min + ":" + sec
        return gone
    }
    if (type == 6) {
        var wdays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        var mes = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
        var gone = +date + "." + mes[time.getMonth()] + "." + time.getFullYear()
        return gone
    }
}


export function setTime(sec) 
{
    return `${unixStampLeft(sec * 1000)}`
};


export function getUnix() 
{
    return Date.now();
}


export function unixStamp(stamp) 
{
    let date = new Date(stamp),
        year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours(),
        mins = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes(),
        secs = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

    return `${day}.${month}.${year}, ${hour}:${mins}:${secs}`;
}


export function unixTime(stamp) 
{
    let date = new Date(stamp),
        hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours(),
        mins = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes(),
        secs = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

    return `${hour}:${mins}`;
}

export function unixStampLeft(stamp) 
{
    stamp = stamp / 1000;

    let s = stamp % 60;
    stamp = (stamp - s) / 60;

    let m = stamp % 60;
    stamp = (stamp - m) / 60;

    let h = (stamp) % 24;
    let d = (stamp - h) / 24;

    let text = ``;

    if (d > 0) text += Math.floor(d) + " д.";
    if (h > 0) text += Math.floor(h) + " ч.";
    if (m > 0) text += Math.floor(m) + " мин.";
    if (s > 0) text += Math.floor(s) + " с.";

    return text;
}


export async function onUserUnban(ctx, user) 
{
    bot.telegram.sendMessage(user.id, `💬 *Ваш аккаунт разблокирован!*\n\n🤠 Рады видеть Вас снова в наших рядах, рекомендуем больше не нарушать наши правила во избежании подобного положения!`).catch(err => {})

    await user.set("isBanned", false);
    await user.set("reasonBan", '-');
    await user.set("timeBan", 0);
}


export function formatDate(date, mask) 
{
    const addZero = (num) => (num < 10 ? '0' + num : '' + num);
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];

    const tokens = {
        // год (nnnn)
        yyyy: () => date.getFullYear(),

        // месяц (полное название; короткое название; 01-12; 1-12)
        MMMM: () => months[date.getMonth()],
        MMM: () => tokens.MMMM().slice(0, 3),
        MM: () => addZero(tokens.M()),
        M: () => date.getMonth() + 1,

        // день (01-31; 1-31)
        dd: () => addZero(tokens.d()),
        d: () => date.getDate(),

        // час (01-23; 1-23)
        hh: () => addZero(tokens.h()),
        h: () => date.getHours(),

        // минута (01-59; 1-59)
        mm: () => addZero(tokens.m()),
        m: () => date.getMinutes(),

        // секунда (01-59; 1-59)
        ss: () => addZero(tokens.s()),
        s: () => date.getSeconds()
    };

    Object.entries(tokens).forEach(([token, replacer]) => {
        mask = mask.replace(token, replacer);
    });

    return mask;
}


export function differenceInMilliseconds(d1, d2) 
{
    return d1.getTime() - d2.getTime();
}


export function differenceInSeconds(d1, d2) 
{
    return Math.round(differenceInMilliseconds(d1, d2) / 1000);
}


export function differenceInHours(d1, d2) 
{
    return Math.round(differenceInSeconds(d1, d2) / 60 * 60);
}


export function differenceInDays(d1, d2) 
{
    return Math.round(differenceInHours(d1, d2) / 24);
}

