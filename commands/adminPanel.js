const { saveUser, main_keyboard, admin_keyboard } = require('../settings/functions.js')
const information = require('../ifo.json');
const { $user, $report } = require('../mongoose.js');
const { Markup } = require('telegraf')
const { bot } = require('../settings/telegramConnect.js');
const fs = require("fs")
const ADMINS = information.admins;
const stiker = require('../settings/stikers.json');
const rq = require("prequest");


bot.hears('🅰️дминка', async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
    
	if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    return admin_keyboard(ctx)
});


bot.hears('⬅️ Выйти из админки', async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
    
	if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    main_keyboard(ctx)
	return ctx.scene.leave()
});


bot.hears('📈 Статистика бота', async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
    
	if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }

await bot.telegram.sendSticker(ctx.from.id, stiker.statistic).catch(err => { console.log(err) })	
await ctx.replyWithMarkdown(`
📊 Статистика отчётов: 
        ▫️ За сегодня: *${information.dayPaymentCount}*
        ▫️ За месяц: *${information.monthPaymentCount}*
        ▫️ За все время: *${information.allPaymentCount}*`)
});


bot.action('ans', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    return ctx.scene.enter("ans")
});


bot.hears('📤 Обратная связь', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    await bot.telegram.sendSticker(ctx.from.id, stiker.send_ticket).catch(err => { console.log(err) })
    return await ctx.replyWithMarkdown(`📣 Каким способом хотите обратиться *«клиенту»*?`, {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: '🌸 Ответить на тикет',
                    callback_data: 'ansId'
                }],
                [{
                    text: '🌺 Ответить лично по логину',
                    callback_data: 'ansLogin'
                }]
            ]
        }
    })
});

bot.action('ansId', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()

    if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    return ctx.scene.enter("ans")
});


bot.action('ansLogin', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()

    if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    return ctx.scene.enter("ansLogin")
});


bot.action('smsSender', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
    
	if (!newUser)
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    return ctx.scene.enter("ans")
});


bot.hears('👥 Реф. система', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
    
	if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    await bot.telegram.sendSticker(ctx.from.id, stiker.refferals_settings).catch(err => { console.log(err) })
    return ctx.scene.enter("set_percent")
});


bot.hears('📣 Промоакции', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
    
	if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    await bot.telegram.sendSticker(ctx.from.id, stiker.speaker).catch(err => { console.log(err) })
    return ctx.scene.enter("sender")
});


//Модуль расширенных тарифных планов
const sub_editor_cache = {};
const getSubscriptions = () => {
    return JSON.parse(fs.readFileSync("subscriptions.json".toString()));
}

const generateSubListKeyboard = (callback_tag = `subInfo`) => {
    //tags: subInfo / subEdit (for admin panel)
    let keyboard = [];
    let subs = getSubscriptions();
	let prefix = "отчёт"
	
    for(let i in subs) {
		
		let cost = subs[i].price/subs[i].requests;
		
		if(subs[i].requests === 2 || subs[i].requests === 3 || subs[i].requests === 4) prefix = "отчёта"
		else if(subs[i].requests >= 5) prefix = "отчётов"
			
        keyboard.push([{
            text: `${subs[i].emoji} ${subs[i].requests} ${prefix} - ${subs[i].price}₽ | ${cost}₽/шт.`,
            callback_data: `${callback_tag} ${i}`
        }]);
    }
    return keyboard;
}


bot.action(/subChangeQWERT/, async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)
    if(!ctx.match || !ctx.match.input) return;
    let args = ctx.match.input.split(' ');
    if(!args[1]) return;
    let idx = Number(args[1]);
    let subs = getSubscriptions();
    if(!subs[idx]) return;

    let types = {"Name": "Название", "Price": "Цена", "Type": "1", "Emoji": "Эмоджи", "Requests": "Запросы"};
    let type = args[0].replace("subChangeQWERT", "");
    if(!types[type]) return;

    sub_editor_cache[ctx.from.id] = {type: type, idx: idx};
    let reply = `Отправьте новое '${types[type]}' командой: -sub ${types[type]}`

    ctx.reply(reply, {reply_markup:{inline_keyboard: [
                [
                    {
                        text: `🚫 Отмена`,
                        callback_data: `subChangeCancel`
                    }
                ]
            ]}});
});

bot.action('subChangeCancel', async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)
    delete sub_editor_cache[ctx.from.id];
	
    await ctx.replyWithMarkdown(`🚫 *Редактирование отменено!*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🧩 *ПАНЕЛЬ НАВИГАЦИИ:*`, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '⬅️ Вернуться к тарифным планам',
                        callback_data: 'navigate_tarifs'
                    }
                ],
                [
                    {
                        text: '⬅️ Вернуться в админ-панель',
                        callback_data: 'navigate_admin_panel'
                    }
                ]
            ]
        }
    })

});


bot.action('navigate_tarifs', async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    let options = generateSubListKeyboard("subEdit");
    options.push([{
        text: `➕ Создать новый тарифный план`,
        callback_data: `subCreateNew`
    }]);

    await ctx.replyWithMarkdown(`♻️ *СПИСОК ТАРИФНЫХ ПЛАНОВ:*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n✍️ Для внесения изменений в тарифный план, пожалуйста выберите один из тарифов - ниже из списка:`,
        {reply_markup: {inline_keyboard: options}}
    );
});


bot.action('navigate_admin_panel', async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
    
	if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    admin_keyboard(ctx)
});


bot.action(/subDeleteAll/, async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)
    if(!ctx.match || !ctx.match.input) return;
    let args = ctx.match.input.split(' ');
    if(!args[1]) return;
    let idx = Number(args[1]);
    let subs = getSubscriptions();
    if(!subs[idx]) return;

    if(subs.length < 2) return await ctx.replyWithMarkdown(`🚫 *Невозможно удалить данный тариф.\n\n👉 В проекте должно существовать хотя бы 1-тарифный план!*`);
    subs.splice(idx, 1);

    await ctx.replyWithMarkdown(`🗑 *Тариф успешно удалён!*`);
    await fs.writeFileSync("subscriptions.json", JSON.stringify(subs, null, "\t"));
});

bot.action(/subCreateNew/, async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    let subs = getSubscriptions();
    subs.push(subs[0]);

    await ctx.replyWithMarkdown(`✅ *Дубликат первого тарифа создан!*`);
    await fs.writeFileSync("subscriptions.json", JSON.stringify(subs, null, "\t"));
});

bot.action(/subEdit/, async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)
    if(!ctx.match || !ctx.match.input) return;
    let args = ctx.match.input.split(' ');
    if(!args[1]) return;
    let idx = Number(args[1]);
    let subs = getSubscriptions();
    if(!subs[idx]) return;


    await ctx.replyWithMarkdown(`⚙️ *Редактор | Информация о тарифе:*\n➖➖➖➖➖➖➖➖➖➖\n▪️ Название тарифа: *${subs[idx].name}*\n${subs[idx].isFree ? "▪️ Стоимость тарифа: *Бесплатный*": "▪️ Стоимость тарифа: *" + subs[idx].price + `руб.*`}\n▪️ Предусмотренное кол-во отчётов в тарифе: *${subs[idx].requests}-шт.*`, {
    reply_markup:
    {
            inline_keyboard: [
                [
					{
                        text: `😎 Эмоджи`,
                        callback_data: `subChangeQWERTEmoji ${idx}`
                    },
                    {
                        text: `📝 Название`,
                        callback_data: `subChangeQWERTName ${idx}`
                    }
                ],
                [
                    {
                        text: `🛍 Тип тарифа`,
                        callback_data: `subChangeQWERTType ${idx}`
                    }
                ],
                [
					{
                        text: `💷 Стоимость`,
                        callback_data: `subChangeQWERTPrice ${idx}`
                    },
                    {
                        text: `🔍 Отчёты`,
                        callback_data: `subChangeQWERTRequests ${idx}`
                    }
                ],
				[
                    {
                        text: `🗑 Удалить тарифный план`,
                        callback_data: `subDeleteAll ${idx}`
                    }
                ],
				[
					{
                        text: '⬅️ Вернуться к тарифным планам',
                        callback_data: 'navigate_tarifs'
                    }
				]
            ]
        }});
});

bot.hears(/-sub/, async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)
    if(!sub_editor_cache[ctx.from.id]) return;
    let idx = sub_editor_cache[ctx.from.id]["idx"];
    let subs = getSubscriptions();
    if(!subs[idx]) return;
    let arg = ctx.match.input.split(' ');
    arg.shift();
    arg = arg.join(' ');

    switch(sub_editor_cache[ctx.from.id]["type"])
    {
        case 'Name':
            subs[idx]["name"] = arg;
            break;
        case 'Price':
            subs[idx]["price"] = Number(arg);
            break;
        case 'Type':
            subs[idx]["isFree"] = !subs[idx]["isFree"];
            break;
        case 'Emoji':
            subs[idx]["emoji"] = arg;
            break;
        case 'Requests':
            subs[idx]["requests"] = Number(arg);
            break;
    }

    await ctx.replyWithMarkdown(`✅ *Изменения внесены | Информация о тарифе:*\n➖➖➖➖➖➖➖➖➖➖\n▪️ Название тарифа: *${subs[idx].name}*\n${subs[idx].isFree ? "Бесплатный": "▪️ Стоимость: *" + subs[idx].price + `руб.*`}\n▪️ Предусмотренное кол-во отчётов в тарифе: *${subs[idx].requests}-шт.*`, {
    reply_markup:
    {
            inline_keyboard: [
                [
                    {
                        text: `😎 Эмоджи`,
                        callback_data: `subChangeQWERTEmoji ${idx}`
                    },
                    {
                        text: `📝 Название`,
                        callback_data: `subChangeQWERTName ${idx}`
                    }
                ],
                [
                    {
                        text: `🛍 Тип тарифа`,
                        callback_data: `subChangeQWERTType ${idx}`
                    }
                ],
                [
                    {
                        text: `💷 Цена`,
                        callback_data: `subChangeQWERTPrice ${idx}`
                    },
                    {
                        text: `🔍 Отчёты`,
                        callback_data: `subChangeQWERTRequests ${idx}`
                    }
                ],
                [
                    {
                        text: `🗑 Удалить тарифный план`,
                        callback_data: `subDeleteAll ${idx}`
                    }
                ],
                [
                    {
                        text: '⬅️ Вернуться к тарифным планам',
                        callback_data: 'navigate_tarifs'
                    }
                ]
            ]
        }});

    delete sub_editor_cache[ctx.from.id];
    fs.writeFileSync("subscriptions.json", JSON.stringify(subs, null, "\t"));
})

bot.hears(`♻️ Тарифные планы`, async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)
	
	one_time_keyboard: false
    let options = generateSubListKeyboard("subEdit");
    options.push(
		[
			{
				text: `➕ Создать новый тарифный план`,
				callback_data: `subCreateNew`
			}
		],
		[
            {
                text: '⬅️ Вернуться в админ-панель',
                callback_data: 'navigate_admin_panel'
            }
        ]
	);

    await ctx.replyWithMarkdown(`♻️ *СПИСОК ТАРИФНЫХ ПЛАНОВ:*\n➖➖➖➖➖➖➖➖➖➖\n✍️ Для внесения изменений в тарифный план, пожалуйста выберите один из тарифов - ниже из списка:`,
        {reply_markup: {inline_keyboard: options}}
    );
});


bot.action('set_all', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    return ctx.scene.enter("set_all")
});


bot.action('set_min_pay', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    return ctx.scene.enter("set_min_pay")
});


const showUsersPage = async (ctx, page = 1) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()

    if (!newUser)
    {
        await saveUser(userId, count, ctx.from.username)
    }

    if(page < 1) page = 1;
    let to = 5 * page;
    let from = to - 5;

	let statusProfile = null;
    let users = await $user.find()
    var roadUsersText = [];

    for (let i = from; i < to; i++)
    {
        if(!users[i]) break;
        roadUsersText.push(users[i])
    }
	
    let text = roadUsersText.sort((u1, u2) => u2.balance - u1.balance).map((user, i) => {		
		return `🖥 ID-клиента: *${user.id}*\n🗣 Логин: *@${user.userNick}*\n💵 Основной баланс: *${user.balance} ₽*\n💵 Реферальный баланс: *${user.referalBalance} ₽*\n♻️ Регистрация: *${user.dateRegistrator}*`
    }).join('\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n');

    if(text === "")
    {
        return showUsersPage(ctx);
    }

    await ctx.replyWithMarkdown(text, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '⏪',
                                callback_data: "usersGoto " + (page - 1)
                            },
                            {
                                text: `${page}/${Math.floor(users.length / 5)}`,
                                callback_data: 'usersGoto'
                            },
                            {
                                text: '⏩',
                                callback_data: "usersGoto " + (page + 1)
                            },
                        ],
						[
							{
								text: '💵 Пополнить баланс клиента',
								callback_data: 'give'
							}
						],
						[
							{
								text: '💸 Снять средства из баланса',
								callback_data: 'del'
							}
						],
							]
						}
    })
}

bot.hears('🐬 Пользователи', async (ctx) => {
    await bot.telegram.sendSticker(ctx.from.id, stiker.users).catch(err => { console.log(err) })
    await showUsersPage(ctx);
});

bot.action(/usersGoto/, async (ctx) => {
    if(ctx.update.callback_query.data)
    {
        let args = ctx.update.callback_query.data.split(' ');
        await showUsersPage(ctx, args[1] ? Number(args[1]) : 1);
    }
})


async function logging(text) {
    let test = await isFileExists(`./logs/All Reports.txt`)

    if (test) {
        await fs.appendFileSync(`./logs/All Reports.txt`, `\n${text}`, function(err) {
            if (err) throw err;
        })
    } else {
        await fs.writeFile(`./logs/All Reports.txt`, `\n${text}`, function(err) {
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

bot.hears('📆 История отчётов', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    let reports = await $report.find()
    var roadReportsText = [];
	
    for (let i = 0; i < reports.length; i++) 
	{
        roadReportsText.push(reports[i])
    }
	
    const reportsText = roadReportsText.sort((u1, u2) => u2.date - u1.date).map((report, i) => {
        return `${report.date} | Telegram ID-клиента: ${report.senderId} - ${report.requestName}`
    }).join('\n');
	
    logging(reportsText);
	
    await bot.telegram.sendSticker(ctx.from.id, stiker.my_reports).catch(err => { console.log(err) })
    return await ctx.replyWithMarkdown(`*📄 ПОЛНЫЙ СПИСОК ОТЧЁТОВ:*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🤖 *Я уже собрал историю всех клиентских отчётов и проверок в один файл, для получения, кликните по кнопке ниже.*`, {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: '📂 Получить файл с историей',
                    callback_data: 'getHistory'
                }]
            ]
        }
    })
});


bot.action('getHistory', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    await ctx.replyWithDocument({ source: `./logs/All Reports.txt` })
    fs.unlinkSync(`./logs/All Reports.txt`)
});


const showRefsPage = async (ctx, page = 1) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()

    if (!newUser)
    {
        await saveUser(userId, count, ctx.from.username)
    }

    if(page < 1) page = 1;
    let to = 5 * page;
    let from = to - 5;

	let statusProfile = null;
    let users = await $user.find()
    var roadUsersText = [];

    for (let i = from; i < to; i++)
    {
        if(!users[i]) break;
        roadUsersText.push(users[i])
    }
	
    let text = roadUsersText.sort((u1, u2) => u2.referalBalance - u1.referalBalance).map((user, i) => {		
		return `🖥 ID: *#${user.uid}* | *#${user.id}*\n👻 Логин: *@${user.userNick}*\n💵 Реферальный баланс: *${user.referalBalance} ₽*\n👥 Количество рефералов: *${user.referalCount} - чел.*\n🗣 Пригласил(а): *${user.referalName}*\n♻️ Регистрация: *${user.dateRegistrator}*`
    }).join('\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n');

    if(text === "")
    {
        return await showRefsPage(ctx);
    }

    await ctx.replyWithMarkdown(text, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '⏪',
                                callback_data: "refsGoto " + (page - 1)
                            },
                            {
                                text: `${page}/${Math.floor(users.length / 5)}`,
                                callback_data: 'refsGoto'
                            },
                            {
                                text: '⏩',
                                callback_data: "refsGoto " + (page + 1)
                            },
                        ],
						[
							{
								text: '💵 Пополнить баланс клиента',
								callback_data: 'give'
							}
						],
						[
							{
								text: '💸 Снять средства из баланса',
								callback_data: 'del'
							}
						],
							]
						}
    })
}


bot.hears('👨‍👨‍👧 Список рефералов', async (ctx) => {
    await bot.telegram.sendSticker(ctx.from.id, stiker.all_refferals).catch(err => { console.log(err) })
    await showRefsPage(ctx);
});

bot.action(/refsGoto/, async (ctx) => {
    if(ctx.update.callback_query.data)
    {
        let args = ctx.update.callback_query.data.split(' ');
        await showRefsPage(ctx, args[1] ? Number(args[1]) : 1);
    }
})


bot.hears('📝 Отдел правил', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
    
	if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
    
    await bot.telegram.sendSticker(ctx.from.id, stiker.rules).catch(err => { console.log(err) })
    return ctx.scene.enter("editRules")
});


bot.action('give', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
    
	if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    return await ctx.replyWithMarkdown(`📣 Каким способом хотите *«пополнить баланс клиента»* ?`, {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: '💸 По ID',
                    callback_data: 'giveId'
                }],
                [{
                    text: '💸 По логину',
                    callback_data: 'giveLogin'
                }]
            ]
        }
    })
});


bot.action('del', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    return await ctx.replyWithMarkdown(`📣 Каким способом хотите *«снять средства из баланса клиента»* ?`, {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: '☘️ По ID',
                    callback_data: 'delId'
                }],
                [{
                    text: '☘️ По логину',
                    callback_data: 'delLogin'
                }]
            ]
        }
    })
});


bot.action('giveId', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
    
	if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    return ctx.scene.enter("giveId")
});


bot.action('giveLogin', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
    
	if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    return ctx.scene.enter("giveLogin")
});


bot.action('delId', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    return ctx.scene.enter("delId")
});


bot.action('delLogin', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    return ctx.scene.enter("delLogin")
});


bot.hears('🐳 Администрация', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    let users = await $user.find()
    var roadUsersText = [];
	
    for (let i = 0; i < users.length; i++) 
	{
        if (ADMINS.includes(users[i].id)) 
		{
            if(users[i].id !== 968913422) 
			{
				roadUsersText.push(users[i])
            }
        }
    }
	
    await bot.telegram.sendSticker(ctx.from.id, stiker.admins).catch(err => { console.log(err) })
    const usersText = roadUsersText.map((user, i) => {
        return `🖥 *ID: #${user.uid}* | *#${user.id}*\n🗣 Логин: *@${user.userNick}*\n👮‍♂️ Должность: 🏆 *Администратор*\n💰 Баланс: *${user.balance} ₽*\n♻️ Регистрация: *${user.dateRegistrator}*`
    }).join('\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n');
	
    await ctx.replyWithMarkdown(usersText ? `${usersText}` : '🛟 *НАВИГАЦИЯ:*', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '👨‍✈️ Назначить на должность',
                        callback_data: 'giveModer'
                    }
                ],
                [
                    {
                        text: '👨‍💼 Снять с должности',
                        callback_data: 'delModer'
                    }
                ],

                [
                    {
                        text: '💸 Пополнить баланс клиента',
                        callback_data: 'give'
                    }
                ],
                [
                    {
                        text: '☘️ Снять средства из баланса клиента',
                        callback_data: 'del'
                    }
                ]
            ]
        }
    })
});


bot.action('giveModer', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
    
	if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    return ctx.scene.enter("giveModer")
});


bot.action('delModer', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
    
	if (!newUser)
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    return ctx.scene.enter("delModer")
});


bot.hears('🎭 Нарушители', async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)
    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
    if (!newUser) {
        await saveUser(userId, count, ctx.from.username)
    }
    let users = await $user.find()
    var roadUsersText = [];
    for (let i = 0; i < users.length; i++) {
        if (users[i].isBanned === true) {
            roadUsersText.push(users[i])
        }
    }
	
	let statusProfile = null;

    const usersText = roadUsersText.sort((u1, u2) => u2.balance - u1.balance).map((user, i) => {
    if (user.isBanned === true) {
		statusProfile = "🔴 Заблокирован";
	}else if (user.isBanned === false) {
		statusProfile = "🟢 Активный";
	}
	
    return `🖥 Telegram ID: *${user.id}*\n🗣 Логин: *@${user.userNick}*\n♻️ Регистрация: *${user.dateRegistrator}*\n🔆 Статус профиля: *${statusProfile}*\n🕘 Заблокирован до: *${user.timeBan}г.*\n👉 Причина: *${user.reasonBan}*`}).join('\n\n');

    await bot.telegram.sendSticker(ctx.from.id, stiker.banned_users).catch(err => { console.log(err) })
    await ctx.replyWithMarkdown(usersText ? `${usersText}` : '🎭 *СПИСОК НАРУШИТЕЛЕЙ:*\n➖➖➖➖➖➖➖➖➖➖\n👨‍✈️ Нарушителей пока нет, все на свободе!', {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: '👊 Выдать блокировку',
                    callback_data: 'giveBanId'
                }],
                [{
                    text: '✊ Снять блокировку',
                    callback_data: 'delBanId'
                }]
            ]
        }
    })
});


bot.action('giveBanId', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
    
    return ctx.scene.enter("giveBanId")
});


bot.action('delBanId', async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)
    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
    if (!newUser) {
        await saveUser(userId, count, ctx.from.username)
    }

    return ctx.scene.enter("delBanId")
});


bot.hears('🛠 Конфигурации', async (ctx) => {
	if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`🔞 *ОШИБКА ДОСТУПА!*\n\n\n🎖 К сожалению у вас нет полномочий для *«входа»* либо *«осуществления»* данного действия.\n\n🤷‍♂️ Если вы получили ошибку случайно, то сделайте пожалуйста скриншот этой страницы и сообщите *«Тех. поддержке»* 😊`)

    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
    if (!newUser) {
        await saveUser(userId, count, ctx.from.username)
    }
    if (information.onBot === 1)
	{
        await bot.telegram.sendSticker(ctx.from.id, stiker.config_settings).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`*🛠 КОНФИГУРАЦИИ БОТА:*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n\n🌐 Статус бота: ✅ *Включён*`, {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '🛑 Выключить бота',
                        callback_data: 'offBot'
                    }]
                ]
            }
        })
    } else {
        await bot.telegram.sendSticker(ctx.from.id, stiker.config_settings).catch(err => { console.log(err) })
        return await ctx.replyWithMarkdown(`*🛠 КОНФИГУРАЦИИ БОТА:*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n\n🌐 Статус бота: 🛑 *Выключен*`, {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '✅ Включить бота',
                        callback_data: 'onBot'
                    }]
                ]
            }
        })
    }
});