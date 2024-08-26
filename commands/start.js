import { bot } from '../settings/telegramConnect.js';
import { $user } from '../mongoose.js';
import information from '../ifo.json' assert { type: 'json' };
import { saveUser, main_keyboard } from '../settings/functions.js';


bot.hears(/\/start (.+)|\/start/i, async (ctx) => {
    if(ctx.chat.id < 0) return;
	const userId = ctx.from.id
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
	
    if (!newUser)
    {
        if(ctx.update && ctx.update.message && ctx.update.message.date)
        {
            let timestamp = Math.floor(Date.now() / 1000);
            if(timestamp - ctx.update.message.date > 150) return;
        }
		
        if(!await saveUser(ctx.chat.id, count, ctx.from.username)) return;
    }
	
    let user = await $user.findOne({ id: ctx.from.id })
    if(ctx.from.username)
	{
		if(user.userNick === `Без никнейма`)
		{
			await user.set("userNick", ctx.from.username)
		}
    }

    let referral_code = ctx.match[1];
    if (referral_code !== undefined) {
    	let ref = await $user.findOne({ id: ctx.match[1] })
    	if(!ref) return;
    	let activeUser = await $user.findOne({ id: ctx.from.id })
    	if(activeUser.referalId) return;
    	if(activeUser.id === Number(ctx.match[1])) return;
		await activeUser.set("referalId", Number(ctx.match[1]) )
		await activeUser.set("referalName", ref.userNick)
		await ref.inc("referalCount", 1);
    	await bot.telegram.sendMessage(ref.id, `💬 ПОДКЛЮЧИЛСЯ НОВЫЙ РЕФЕРАЛ!\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n👏 Поздравляем вас, по вашей реферальной ссылке - подлючился новый реферал!\n\n🆔 ID-вашего реферала: #${activeUser.id}\n👤 Логин вашего реферала: @${activeUser.userNick}\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n💰 Теперь Вы будете получать свои проценты в автоматическом режиме, от суммы каждого пополнения баланса этим клиентом.`).catch(err => { console.log(err) })
    	await ctx.replyWithMarkdown(`✅ *РЕГИСТРАЦИЯ ПРОШЛА УСПЕШНО!*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n😉 Благодарим Вас за регистрацию и за интерес к нашему боту!\n👥 *Вас пригласил(а): @${ref.userNick}*`)
    	await bot.telegram.sendMessage(`${information.channel}`, `💬 В БОТЕ НОВЫЙ РЕФЕРАЛ!\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🖥 Данные о клиенте, кто пригласил(а):\n🆔 Telegram ID-клиента: #${ref.id}\n👤 Логин клиента: @${ref.userNick}\n\n🖥 Данные о клиенте, кого пригласили:\n🆔 Telegram ID-клиента: #${activeUser.id}\n👤 Логин клиента: @${activeUser.userNick}\n💰 Установленная ставка: «${information.referal}%»`).catch(err => { console.log(err) })
		main_keyboard(ctx)
	}else {
    	await ctx.replyWithMarkdown(`🙋🏻‍♂️ *ДОБРО ПОЖАЛОВАТЬ!*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🚘 *${user.userNick}*, рад Вас видеть! 😉\n${information.news}`)
		main_keyboard(ctx)
	}
});