import { saveUser } from '../settings/functions.js';
import information from '../ifo.json' assert { type: 'json' };
import { bot } from '../settings/telegramConnect.js';
import { $user, $report } from '../mongoose.js';
import fs from 'fs';
import stiker from '../settings/stikers.json' assert { type: 'json' };
import rq from 'prequest';
import subs from '../subscriptions.json' assert {type: 'json'}

const num_requests = information.num_requests;
const BlackList = information.blackList;


async function logging(id, text) {
    let test = await isFileExists(`./logs/Reports #${id}.txt`)

    if (test) {
        await fs.unlinkSync(`./logs/Reports #${id}.txt`)
        fs.writeFile(`./logs/Reports #${id}.txt`, `${text}`, function(err) {
            if (err) throw err;
        });
    } else {
        await fs.writeFile(`./logs/Reports #${id}.txt`, `${text}`, function(err) {
            if (err) throw err;
        });
    }
}


function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) return reject(err)
            resolve(data)
        })
    })
}


function isFileExists(path) {
    return new Promise((resolve, reject) => {
        fs.access(path, fs.constants.F_OK, err => {
            if (!err) return resolve(true);
            if (err.code === 'ENOENT') return resolve(false);
            reject(err);
        });
    });
}

const getSubscriptions = () => {
    return JSON.parse(fs.readFileSync("subscriptions.json".toString()));
}

const generateSubListKeyboard = (callback_tag = `subPayConfirm`) => {

    let keyboard = [];
	let prefix = "отчёт"
	
    for(let i in subs) {
		let cost = subs[i].price/subs[i].requests;
		
		if(subs[i].requests === 2 || subs[i].requests === 3 || subs[i].requests === 4) prefix = "отчёта"
		else if(subs[i].requests >= 5) prefix = "отчётов"

        keyboard.push([{
            text: `${subs[i].emoji} ${subs[i].requests} ${prefix} - ${cost}₽/шт. (${subs[i].requests} ${prefix} за ${subs[i].price}₽)`,
            callback_data: `subPayConfirm ${i}`
			
        }]);
    }
    return keyboard;
}


bot.hears('🔐 Профиль', async (ctx) => {
	if (BlackList.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🪫 *Закончились запросы на балансе у вашего токена к API, пожалуйста пополните свой баланс!\n\n- Всю подробную информацию вы найдёте на сайте источника информации AV100, ссылка для перехода на сайт: https://data.av100.org*`)
    if (information.onBot === 0) 
    {
        await bot.telegram.sendSticker(ctx.from.id, stiker.bot_off).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`*🤖 Работа бота временно приостановлена!\nНа данный момент мы работаем над внедрением современных технологий, пожалуйста, наберитесь немного терпения и загляните к нам по позже.\n\nМы с радостью будем ждать Вашего повторного визита! 😊*`)
    }

    const userId = ctx.from.id;
	let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
  
    if (!newUser)
    {
        if(ctx.update && ctx.update.message && ctx.update.message.date)
        {
            let timestamp = Math.floor(Date.now() / 1000);
            if(timestamp - ctx.update.message.date > 4) return;
        }	
        await saveUser(userId, count, ctx.from.username)
    }

	let user = await $user.findOne({ id: ctx.from.id })	
    if (user.isBanned === true)
    {
        await bot.telegram.sendSticker(user.id, stiker.stop_ban).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`🚫 *ВАШ ПРОФИЛЬ ЗАБЛОКИРОВАН!*\n➖➖➖➖➖➖➖➖➖➖\n👉 *Раздел больше недоступен для вас!*\n👮‍♂️ Заблокированы до *${user.timeBan}г.*\n💬 Причина: *«${user.reasonBan}»*`)
    }

    if (user.requestCount === undefined || user.requestCount === "NaN") user.requestCount = 0;
    await bot.telegram.sendSticker(ctx.from.id, stiker.my_profile).catch(err => { console.log(err) })
    let info = `🧸 Ваш логин: *${user.userNick}*\n📡 Ваш ID в системе: *#${user.uid}*\n🖥 ID в Telegram: *#${user.id}*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🔎 Доступных проверок: *${user.requestCount}-шт.*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n📙 Регистрация: *${user.dateRegistrator}*`

    return await ctx.replyWithMarkdown(info, {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: '🛍 Купить тариф',
                    callback_data: 'donate'
                }]
            ]
        }
    })
});


bot.action('donate', async (ctx) => {
    if (BlackList.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🪫 *Закончились запросы на балансе у вашего токена к API, пожалуйста пополните свой баланс!\n\n- Всю подробную информацию вы найдёте на сайте источника информации AV100, ссылка для перехода на сайт: https://data.av100.org*`)
    if (information.onBot === 0) 
    {
        await bot.telegram.sendSticker(ctx.from.id, stiker.bot_off).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`*🤖 Работа бота временно приостановлена!\nНа данный момент мы работаем над внедрением современных технологий, пожалуйста, наберитесь немного терпения и загляните к нам по позже.\n\nМы с радостью будем ждать Вашего повторного визита! 😊*`)
    }

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser)
    {
        if(ctx.update && ctx.update.message && ctx.update.message.date)
        {
            let timestamp = Math.floor(Date.now() / 1000);
            if(timestamp - ctx.update.message.date > 4) return;
        }	
        await saveUser(userId, count, ctx.from.username)
    }

	let user = await $user.findOne({ id: ctx.from.id })
    if (user.isBanned === true)
    {
        await bot.telegram.sendSticker(user.id, stiker.stop_ban).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`🚫 *ВАШ ПРОФИЛЬ ЗАБЛОКИРОВАН!*\n➖➖➖➖➖➖➖➖➖➖\n👉 *Раздел больше недоступен для вас!*\n👮‍♂️ Заблокированы до *${user.timeBan}г.*\n💬 Причина: *«${user.reasonBan}»*`)
    }

    if (user.requestCount === undefined || user.requestCount === "NaN") user.requestCount = 0;
    return await ctx.replyWithMarkdown(`🛒 *СПИСОК ТАРИФНЫХ ПЛАНОВ:*`,
    {
        reply_markup: {inline_keyboard: generateSubListKeyboard()}
    }
    );
});


bot.hears('📋 Отчёты', async (ctx) => {
    if (BlackList.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🪫 *Закончились запросы на балансе у вашего токена к API, пожалуйста пополните свой баланс!\n\n- Всю подробную информацию вы найдёте на сайте источника информации AV100, ссылка для перехода на сайт: https://data.av100.org*`)
    if (information.onBot === 0) 
    {
        await bot.telegram.sendSticker(ctx.from.id, stiker.bot_off).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`*🤖 Работа бота временно приостановлена!\nНа данный момент мы работаем над внедрением современных технологий, пожалуйста, наберитесь немного терпения и загляните к нам по позже.\n\nМы с радостью будем ждать Вашего повторного визита! 😊*`)
    }

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser)
    {
        if(ctx.update && ctx.update.message && ctx.update.message.date)
        {
            let timestamp = Math.floor(Date.now() / 1000);
            if(timestamp - ctx.update.message.date > 4) return;
        }	
        await saveUser(userId, count, ctx.from.username)
    }

	let user = await $user.findOne({ id: ctx.from.id })	
    if (user.isBanned === true)
    {
        await bot.telegram.sendSticker(user.id, stiker.stop_ban).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`🚫 *ВАШ ПРОФИЛЬ ЗАБЛОКИРОВАН!*\n➖➖➖➖➖➖➖➖➖➖\n👉 *Раздел больше недоступен для вас!*\n👮‍♂️ Заблокированы до *${user.timeBan}г.*\n💬 Причина: *«${user.reasonBan}»*`)
    }
    
    let reports = await $report.find()
    var roadReportsText = [];
    for (let i = 0; i < reports.length; i++) {
        if (reports[i].senderId === ctx.from.id) {
            roadReportsText.push(reports[i])
        }
    }
    const reportText = roadReportsText.map((report, i) => {
        return `${i + 1}. ${report.date} - ${report.requestName}`
    }).join('\n');

    await bot.telegram.sendSticker(ctx.from.id, stiker.my_reports).catch(err => { console.log(err) })
    if (!reportText) return await ctx.replyWithMarkdown(`*📄 СПИСОК ОТЧЁТОВ:*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n📝 *Ваш список отчётов пуст.*\n\n👉 В дальнейшем все ваши оформленные заказы - отчёты будут отображаться в этом разделе.`)
    logging(ctx.from.id, reportText)

    return await ctx.replyWithMarkdown(`*📄 СПИСОК ОТЧЁТОВ:*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🤖 *Я уже собрал всю историю ваших отчётов и проверок в один файл, для получения, кликните по кнопке ниже.*`, {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: '📂 Получить файл',
                    callback_data: 'getMyHistory'
                }]
            ]
        }
    })
});


bot.action('getMyHistory', async (ctx) => {
    if (BlackList.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🪫 *Закончились запросы на балансе у вашего токена к API, пожалуйста пополните свой баланс!\n\n- Всю подробную информацию вы найдёте на сайте источника информации AV100, ссылка для перехода на сайт: https://data.av100.org*`)
    if (information.onBot === 0) 
    {
        await bot.telegram.sendSticker(ctx.from.id, stiker.bot_off).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`*🤖 Работа бота временно приостановлена!\nНа данный момент мы работаем над внедрением современных технологий, пожалуйста, наберитесь немного терпения и загляните к нам по позже.\n\nМы с радостью будем ждать Вашего повторного визита! 😊*`)
    }

	const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser)
    {
        if(ctx.update && ctx.update.message && ctx.update.message.date)
        {
            let timestamp = Math.floor(Date.now() / 1000);
            if(timestamp - ctx.update.message.date > 4) return;
        }	
        await saveUser(userId, count, ctx.from.username)
    }

	let user = await $user.findOne({ id: ctx.from.id })
    if (user.isBanned === true)
    {
        await bot.telegram.sendSticker(user.id, stiker.stop_ban).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`🚫 *ВАШ ПРОФИЛЬ ЗАБЛОКИРОВАН!*\n➖➖➖➖➖➖➖➖➖➖\n👉 *Раздел больше недоступен для вас!*\n👮‍♂️ Заблокированы до *${user.timeBan}г.*\n💬 Причина: *«${user.reasonBan}»*`)
    }

    await ctx.replyWithDocument({ source: `./logs/Reports #${ctx.from.id}.txt` })
});


bot.hears('🎁 Рефералы', async (ctx) => {
    if (BlackList.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🪫 *Закончились запросы на балансе у вашего токена к API, пожалуйста пополните свой баланс!\n\n- Всю подробную информацию вы найдёте на сайте источника информации AV100, ссылка для перехода на сайт: https://data.av100.org*`)
    if (information.onBot === 0) 
    {
        await bot.telegram.sendSticker(ctx.from.id, stiker.bot_off).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`*🤖 Работа бота временно приостановлена!\nНа данный момент мы работаем над внедрением современных технологий, пожалуйста, наберитесь немного терпения и загляните к нам по позже.\n\nМы с радостью будем ждать Вашего повторного визита! 😊*`)
    }

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser)
    {
        if(ctx.update && ctx.update.message && ctx.update.message.date)
        {
            let timestamp = Math.floor(Date.now() / 1000);
            if(timestamp - ctx.update.message.date > 4) return;
        }	
        await saveUser(userId, count, ctx.from.username)
    }

	let user = await $user.findOne({ id: ctx.from.id })	
    if (user.isBanned === true)
    {
        await bot.telegram.sendSticker(user.id, stiker.stop_ban).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`🚫 *ВАШ ПРОФИЛЬ ЗАБЛОКИРОВАН!*\n➖➖➖➖➖➖➖➖➖➖\n👉 *Раздел больше недоступен для вас!*\n👮‍♂️ Заблокированы до *${user.timeBan}г.*\n💬 Причина: *«${user.reasonBan}»*`)
    }

    await bot.telegram.sendSticker(ctx.from.id, stiker.my_refferals).catch(err => { console.log(err) })
    await ctx.replyWithMarkdown(`💎 Ваш реферальный баланс: *${user.referalBalance} ₽*\n👤 Количество ваших рефералов: *${user.referalCount} чел.*\n\n📌 Ваша ссылка для приглашения рефералов:\n*https://t.me/${ctx.botInfo.username}?start=${ctx.from.id}*\n\n🎈 *Скопируйте ее и делитесь с вашими друзьями и знакомыми.\nРегистрация проходит автоматически при первом переходе пользователя по ссылке а за каждого приглашенного вами участника вы получите: «${information.referal}%» от каждой пополнении баланса вашего реферала.*`)
});


bot.hears('🚘 Заказать отчёт', async (ctx) => {
    if (BlackList.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🪫 *Закончились запросы на балансе у вашего токена к API, пожалуйста пополните свой баланс!\n\n- Всю подробную информацию вы найдёте на сайте источника информации AV100, ссылка для перехода на сайт: https://data.av100.org*`)
    if (information.onBot === 0) 
    {
        await bot.telegram.sendSticker(ctx.from.id, stiker.bot_off).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`*🤖 Работа бота временно приостановлена!\nНа данный момент мы работаем над внедрением современных технологий, пожалуйста, наберитесь немного терпения и загляните к нам по позже.\n\nМы с радостью будем ждать Вашего повторного визита! 😊*`)
    }

    const { result } = await rq(`https://data.tronk.info/profile.ashx?key=${information.api}`)
    if (!result) return ctx.replyWithMarkdown(`😔 Ошибка с *получением данных*, обратитесь к разработчику.`)
    if (result.accountBalance <= num_requests) {
		ctx.replyWithMarkdown(`*🤖 На данный момент введутся технические работы на стороне сервера ГИБДД, пожалуйста, наберитесь немного терпения и повторите попытку позже.\n\nМы с радостью будем ждать вашего повторного визита! 😊*`)
        return bot.telegram.sendMessage(ctx.chat.id, `🛑 ВНИМАНИЕ!!!\n👉 Остаток запросов к API на счету: ${result.accountBalance}-шт.`)
    }

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser)
    {
        if(ctx.update && ctx.update.message && ctx.update.message.date)
        {
            let timestamp = Math.floor(Date.now() / 1000);
            if(timestamp - ctx.update.message.date > 4) return;
        }	
        await saveUser(userId, count, ctx.from.username)
    }

	let user = await $user.findOne({ id: ctx.from.id })
    if (user.isBanned === true)
    {
        await bot.telegram.sendSticker(user.id, stiker.stop_ban).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`🚫 *ВАШ ПРОФИЛЬ ЗАБЛОКИРОВАН!*\n➖➖➖➖➖➖➖➖➖➖\n👉 *Раздел больше недоступен для вас!*\n👮‍♂️ Заблокированы до *${user.timeBan}г.*\n💬 Причина: *«${user.reasonBan}»*`)
    }

    await bot.telegram.sendSticker(ctx.from.id, stiker.search_report).catch(err => { console.log(err) })
    return await ctx.replyWithMarkdown(`↪️ Вы находитесь на странице оформления: *«Полного отчёта»*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n💳 *Стоимость 1-отчёта = ${information.all} руб.*\n\n🧐 *ЧТО ВХОДИТ В «ПОЛНЫЙ ОТЧЁТ» ?*\n⭐️ *Базовая информация об авто\n⭐️ Информация о владельцах и периоды владения\n⭐️ Пробег автомобиля\n⭐️ Данные об участии в ДТП\n⭐️ Пройденные техосмотры\n⭐️ Информация о полисе ОСАГО\n⭐️ Нахождение в розыске\n⭐️ Наличие ограничений\n⭐️ Реестр залогов\n⭐️ Использование в каршеринге\n⭐️ Использование в качестве такси\n⭐️ Информация о штрафах\n⭐️ Фотографии автомобиля*\n\n❓ *Пожалуйста, выберите метод для формирования отчёта?*`, {
        reply_markup: {
			resize_keyboard: true,
            inline_keyboard: [
                [
					{
						text: '🔎 Заказать отчёт по Госномеру',
						callback_data: 'report_Gosnumber'
					}
				],
                [
					{
						text: '🔎 Заказать отчёт по VIN-коду',
						callback_data: 'report_VINcode'
					}
				],
                [
                    {
                        text: "🛍 Купить тариф",
                        callback_data: "donate"
                    }
                ]
            ],
            one_time_keyboard: false
        }
    }
    )
});


bot.action('report_Gosnumber', async (ctx) => {
    if (BlackList.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🪫 *Закончились запросы на балансе у вашего токена к API, пожалуйста пополните свой баланс!\n\n- Всю подробную информацию вы найдёте на сайте источника информации AV100, ссылка для перехода на сайт: https://data.av100.org*`)
    if (information.onBot === 0) 
    {
        await bot.telegram.sendSticker(ctx.from.id, stiker.bot_off).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`*🤖 Работа бота временно приостановлена!\nНа данный момент мы работаем над внедрением современных технологий, пожалуйста, наберитесь немного терпения и загляните к нам по позже.\n\nМы с радостью будем ждать Вашего повторного визита! 😊*`)
    }

    const { result } = await rq(`https://data.tronk.info/profile.ashx?key=${information.api}`)
    if (!result) return ctx.replyWithMarkdown(`😔 Ошибка с *получением данных*, обратитесь к разработчику.`)
    if (result.accountBalance <= num_requests) {
		ctx.replyWithMarkdown(`*🤖 На данный момент введутся технические работы на стороне сервера ГИБДД, пожалуйста, наберитесь немного терпения и повторите попытку позже.\n\nМы с радостью будем ждать вашего повторного визита! 😊*`)
        return bot.telegram.sendMessage(ctx.chat.id, `🛑 ВНИМАНИЕ!!!\n👉 Остаток запросов к API на счету: ${result.accountBalance}-шт.`)
    }

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser)
    {
        if(ctx.update && ctx.update.message && ctx.update.message.date)
        {
            let timestamp = Math.floor(Date.now() / 1000);
            if(timestamp - ctx.update.message.date > 4) return;
        }	
        await saveUser(userId, count, ctx.from.username)
    }

	let user = await $user.findOne({ id: ctx.from.id })
    if (user.isBanned === true)
    {
        await bot.telegram.sendSticker(user.id, stiker.stop_ban).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`🚫 *ВАШ ПРОФИЛЬ ЗАБЛОКИРОВАН!*\n➖➖➖➖➖➖➖➖➖➖\n👉 *Раздел больше недоступен для вас!*\n👮‍♂️ Заблокированы до *${user.timeBan}г.*\n💬 Причина: *«${user.reasonBan}»*`)
    }

    if (user.requestCount === undefined) user.requestCount = 0;
	if (user.requestCount < 1) {   
        return await ctx.replyWithMarkdown(`↪️ Вы в разделе | *«Оформление отчёта»*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n❗️ *У ВАС НЕТ КУПЛЕННОГО ПАКЕТА С ОТЧЁТАМИ!*\n- для дальнейшей работы, пожалуйста выберите один из доступных тарифных планов и оплатите его.\n\n💵 Ваш баланс: *${user.balance} ₽*\n🔎 Доступных проверок: *${user.requestCount}-шт.*`, {
            reply_markup: {inline_keyboard: generateSubListKeyboard()}
        })
    }

    await $user.updateOne({
            id: ctx.from.id
        },
        {
            cachedAutoCode: ""
        });

    return ctx.scene.enter("all_gos")
});


bot.action('report_VINcode', async (ctx) => {
    if (BlackList.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🪫 *Закончились запросы на балансе у вашего токена к API, пожалуйста пополните свой баланс!\n\n- Всю подробную информацию вы найдёте на сайте источника информации AV100, ссылка для перехода на сайт: https://data.av100.org*`)
    if (information.onBot === 0) 
    {
        await bot.telegram.sendSticker(ctx.from.id, stiker.bot_off).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`*🤖 Работа бота временно приостановлена!\nНа данный момент мы работаем над внедрением современных технологий, пожалуйста, наберитесь немного терпения и загляните к нам по позже.\n\nМы с радостью будем ждать Вашего повторного визита! 😊*`)
    }

    const { result } = await rq(`https://data.tronk.info/profile.ashx?key=${information.api}`)
    if (!result) return ctx.replyWithMarkdown(`😔 Ошибка с *получением данных*, обратитесь к разработчику.`)
    if (result.accountBalance <= num_requests) {
		ctx.replyWithMarkdown(`*🤖 На данный момент введутся технические работы на стороне сервера ГИБДД, пожалуйста, наберитесь немного терпения и повторите попытку позже.\n\nМы с радостью будем ждать вашего повторного визита! 😊*`)
        return bot.telegram.sendMessage(ctx.chat.id, `🛑 ВНИМАНИЕ!!!\n👉 Остаток запросов к API на счету: ${result.accountBalance}-шт.`)
    }
	
    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser)
    {
        if(ctx.update && ctx.update.message && ctx.update.message.date)
        {
            let timestamp = Math.floor(Date.now() / 1000);
            if(timestamp - ctx.update.message.date > 4) return;
        }	
        await saveUser(userId, count, ctx.from.username)
    }

	let user = await $user.findOne({ id: ctx.from.id })
    if (user.isBanned === true)
    {
        await bot.telegram.sendSticker(user.id, stiker.stop_ban).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`🚫 *ВАШ ПРОФИЛЬ ЗАБЛОКИРОВАН!*\n➖➖➖➖➖➖➖➖➖➖\n👉 *Раздел больше недоступен для вас!*\n👮‍♂️ Заблокированы до *${user.timeBan}г.*\n💬 Причина: *«${user.reasonBan}»*`)
    }

    if (user.requestCount === undefined) user.requestCount = 0;
	if (user.requestCount < 1) {   
        return await ctx.replyWithMarkdown(`↪️ Вы в разделе | *«Оформление отчёта»*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n❗️ *У ВАС НЕТ КУПЛЕННОГО ПАКЕТА С ОТЧЁТАМИ!*\n- для дальнейшей работы, пожалуйста выберите один из доступных тарифных планов и оплатите его.\n\n💵 Ваш баланс: *${user.balance} ₽*\n🔎 Доступных проверок: *${user.requestCount}-шт.*`, {
            reply_markup: {inline_keyboard: generateSubListKeyboard()}
        })
    }

    await $user.updateOne({
            id: ctx.from.id
        },
        {
            cachedAutoCode: ""
        });

    return ctx.scene.enter("all_vin")
});


bot.action('all_gos', async (ctx) => {
    if (BlackList.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🪫 *Закончились запросы на балансе у вашего токена к API, пожалуйста пополните свой баланс!\n\n- Всю подробную информацию вы найдёте на сайте источника информации AV100, ссылка для перехода на сайт: https://data.av100.org*`)
    if (information.onBot === 0) 
    {
        await bot.telegram.sendSticker(ctx.from.id, stiker.bot_off).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`*🤖 Работа бота временно приостановлена!\nНа данный момент мы работаем над внедрением современных технологий, пожалуйста, наберитесь немного терпения и загляните к нам по позже.\n\nМы с радостью будем ждать Вашего повторного визита! 😊*`)
    }

    const { result } = await rq(`https://data.tronk.info/profile.ashx?key=${information.api}`)
    if (!result) return ctx.replyWithMarkdown(`😔 Ошибка с *получением данных*, обратитесь к разработчику.`)
    if (result.accountBalance <= num_requests) {
		ctx.replyWithMarkdown(`*🤖 На данный момент введутся технические работы на стороне сервера ГИБДД, пожалуйста, наберитесь немного терпения и повторите попытку позже.\n\nМы с радостью будем ждать вашего повторного визита! 😊*`)
        return bot.telegram.sendMessage(`${information.channel}`, `👉 Остаток запросов к API на счету: ${result.accountBalance}-шт.`)
    }
    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser)
    {
        if(ctx.update && ctx.update.message && ctx.update.message.date)
        {
            let timestamp = Math.floor(Date.now() / 1000);
            if(timestamp - ctx.update.message.date > 4) return;
        }	
        await saveUser(userId, count, ctx.from.username)
    }

	let user = await $user.findOne({ id: ctx.from.id })
    if (user.isBanned === true)
    {
        await bot.telegram.sendSticker(user.id, stiker.stop_ban).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`🚫 *ВАШ ПРОФИЛЬ ЗАБЛОКИРОВАН!*\n➖➖➖➖➖➖➖➖➖➖\n👉 *Раздел больше недоступен для вас!*\n👮‍♂️ Заблокированы до *${user.timeBan}г.*\n💬 Причина: *«${user.reasonBan}»*`)
    }

	if (user.requestCount < 1) {
    return ctx.replyWithMarkdown(`↪️ Вы находитесь на странице оформления: *«Полного отчёта»*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n❗️ *НЕДОСТАТОЧНО СРЕДСТВ НА БАЛАНСЕ!*\n- для дальнейшей работы, пожалуйста выберите один из доступных тарифных планов и оплатите его.\n\n💵 Ваш баланс: *${user.balance} ₽*\n🔎 Доступных проверок: *${user.requestCount}-шт.*`, {
        reply_markup: {inline_keyboard: generateSubListKeyboard()}
    }
    )
    }

    return ctx.scene.enter("all_gos")
});


bot.action('all_vin', async (ctx) => {
    if (BlackList.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🪫 *Закончились запросы на балансе у вашего токена к API, пожалуйста пополните свой баланс!\n\n- Всю подробную информацию вы найдёте на сайте источника информации AV100, ссылка для перехода на сайт: https://data.av100.org*`)
    if (information.onBot === 0) 
    {
        await bot.telegram.sendSticker(ctx.from.id, stiker.bot_off).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`*🤖 Работа бота временно приостановлена!\nНа данный момент мы работаем над внедрением современных технологий, пожалуйста, наберитесь немного терпения и загляните к нам по позже.\n\nМы с радостью будем ждать Вашего повторного визита! 😊*`)
    }

    const { result } = await rq(`https://data.tronk.info/profile.ashx?key=${information.api}`)
    if (!result) return ctx.replyWithMarkdown(`😔 Ошибка с *получением данных*, обратитесь к разработчику.`)
    if (result.accountBalance <= num_requests) {
		ctx.replyWithMarkdown(`*🤖 На данный момент введутся технические работы на стороне сервера ГИБДД, пожалуйста, наберитесь немного терпения и повторите попытку позже.\n\nМы с радостью будем ждать вашего повторного визита! 😊*`)
        return bot.telegram.sendMessage(`${information.channel}`, `👉 Остаток запросов к API на счету: ${result.accountBalance}-шт.`)
    }
    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser)
    {
        if(ctx.update && ctx.update.message && ctx.update.message.date)
        {
            let timestamp = Math.floor(Date.now() / 1000);
            if(timestamp - ctx.update.message.date > 4) return;
        }	
        await saveUser(userId, count, ctx.from.username)
    }

	let user = await $user.findOne({ id: ctx.from.id })
    if (user.isBanned === true)
    {
        await bot.telegram.sendSticker(user.id, stiker.stop_ban).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`🚫 *ВАШ ПРОФИЛЬ ЗАБЛОКИРОВАН!*\n➖➖➖➖➖➖➖➖➖➖\n👉 *Раздел больше недоступен для вас!*\n👮‍♂️ Заблокированы до *${user.timeBan}г.*\n💬 Причина: *«${user.reasonBan}»*`)
    }

	if (user.requestCount < 1) {
    return ctx.replyWithMarkdown(`↪️ Вы находитесь на странице оформления: *«Полного отчёта»*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n❗️ *НЕДОСТАТОЧНО СРЕДСТВ НА БАЛАНСЕ!*\n- для дальнейшей работы, пожалуйста выберите один из доступных тарифных планов и оплатите его.\n\n💵 Ваш баланс: *${user.balance} ₽*\n🔎 Доступных проверок: *${user.requestCount}-шт.*`, {
        reply_markup: {inline_keyboard: generateSubListKeyboard()}
    }
    )
    }

    return ctx.scene.enter("all_vin")
});


bot.hears('⭕️ Правила', async (ctx) => {
    if (BlackList.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🪫 *Закончились запросы на балансе у вашего токена к API, пожалуйста пополните свой баланс!\n\n- Всю подробную информацию вы найдёте на сайте источника информации AV100, ссылка для перехода на сайт: https://data.av100.org*`)
    if (information.onBot === 0) 
    {
        await bot.telegram.sendSticker(ctx.from.id, stiker.bot_off).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`*🤖 Работа бота временно приостановлена!\nНа данный момент мы работаем над внедрением современных технологий, пожалуйста, наберитесь немного терпения и загляните к нам по позже.\n\nМы с радостью будем ждать Вашего повторного визита! 😊*`)
    }

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser)
    {
        if(ctx.update && ctx.update.message && ctx.update.message.date)
        {
            let timestamp = Math.floor(Date.now() / 1000);
            if(timestamp - ctx.update.message.date > 4) return;
        }	
        await saveUser(userId, count, ctx.from.username)
    }

	let user = await $user.findOne({ id: ctx.from.id })
    if (user.isBanned === true)
    {
        await bot.telegram.sendSticker(user.id, stiker.stop_ban).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`🚫 *ВАШ ПРОФИЛЬ ЗАБЛОКИРОВАН!*\n➖➖➖➖➖➖➖➖➖➖\n👉 *Раздел больше недоступен для вас!*\n👮‍♂️ Заблокированы до *${user.timeBan}г.*\n💬 Причина: *«${user.reasonBan}»*`)
    }

    await bot.telegram.sendSticker(ctx.from.id, stiker.offender).catch(err => { console.log(err) })
	await ctx.replyWithMarkdown(information.rules)
});


bot.hears('🆘 Помощь', async (ctx) => {
    if (BlackList.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🪫 *Закончились запросы на балансе у вашего токена к API, пожалуйста пополните свой баланс!\n\n- Всю подробную информацию вы найдёте на сайте источника информации AV100, ссылка для перехода на сайт: https://data.av100.org*`)
    if (information.onBot === 0) 
    {
        await bot.telegram.sendSticker(ctx.from.id, stiker.bot_off).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`*🤖 Работа бота временно приостановлена!\nНа данный момент мы работаем над внедрением современных технологий, пожалуйста, наберитесь немного терпения и загляните к нам по позже.\n\nМы с радостью будем ждать Вашего повторного визита! 😊*`)
    }
    
    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser)
    {
        if(ctx.update && ctx.update.message && ctx.update.message.date)
        {
            let timestamp = Math.floor(Date.now() / 1000);
            if(timestamp - ctx.update.message.date > 4) return;
        }	
        await saveUser(userId, count, ctx.from.username)
    }

	let user = await $user.findOne({ id: ctx.from.id })
    if (user.isBanned === true)
    {
        await bot.telegram.sendSticker(user.id, stiker.stop_ban).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`🚫 *ВАШ ПРОФИЛЬ ЗАБЛОКИРОВАН!*\n➖➖➖➖➖➖➖➖➖➖\n👉 *Раздел больше недоступен для вас!*\n👮‍♂️ Заблокированы до *${user.timeBan}г.*\n💬 Причина: *«${user.reasonBan}»*`)
    }
	
    return ctx.scene.enter("help")
});


bot.hears('🛍 Купить тариф', async (ctx) => {
    if (BlackList.includes(ctx.chat.id)) return await ctx.replyWithMarkdown(`🪫 *Закончились запросы на балансе у вашего токена к API, пожалуйста пополните свой баланс!\n\n- Всю подробную информацию вы найдёте на сайте источника информации AV100, ссылка для перехода на сайт: https://data.av100.org*`)
    if (information.onBot === 0) 
    {
        await bot.telegram.sendSticker(ctx.chat.id, stiker.bot_off).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`*🤖 Работа бота временно приостановлена!\nНа данный момент мы работаем над внедрением современных технологий, пожалуйста, наберитесь немного терпения и загляните к нам по позже.\n\nМы с радостью будем ждать Вашего повторного визита! 😊*`)
    }

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser)
    {
        if(ctx.update && ctx.update.message && ctx.update.message.date)
        {
            let timestamp = Math.floor(Date.now() / 1000);
            if(timestamp - ctx.update.message.date > 4) return;
        }	
        await saveUser(userId, count, ctx.from.username)
    }

	let user = await $user.findOne({ id: ctx.from.id })
    if (user.isBanned === true)
    {
        await bot.telegram.sendSticker(user.id, stiker.stop_ban).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`🚫 *ВАШ ПРОФИЛЬ ЗАБЛОКИРОВАН!*\n➖➖➖➖➖➖➖➖➖➖\n👉 *Раздел больше недоступен для вас!*\n👮‍♂️ Заблокированы до *${user.timeBan}г.*\n💬 Причина: *«${user.reasonBan}»*`)
    }

    if (user.requestCount === undefined || user.requestCount === "NaN") user.requestCount = 0;
    return await ctx.replyWithMarkdown(`🛒 *СПИСОК ТАРИФНЫХ ПЛАНОВ:*`,
    {
        reply_markup: {inline_keyboard: generateSubListKeyboard()}
    }
    );
});
