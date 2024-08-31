'use strict';

import cron from 'node-cron';
import fs from 'fs';
import rq from 'prequest';
import { bot } from './settings/telegramConnect.js';
import { $user, $report } from './mongoose.js';
import information from './ifo.json' assert { type: 'json' };
import { saveUser, main_keyboard, admin_keyboard, time } from './settings/functions.js';
import timers from './settings/timers.js';
import { Telegraf, Scenes, session } from 'telegraf'; // Импортируйте Scenes из telegraf
import { v4 as uuid } from 'uuid';
import logger from './logger.js';
import stiker from './settings/stikers.json' assert { type: 'json' };
import YooModule from './paymentModule.js';
import yooKassa from './yooKassa.json' assert { type: 'json' };
import path from 'path';
import { fileURLToPath } from 'url';
const { WizardScene, Stage } = Scenes;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commandsDir = path.join(__dirname, './commands');

const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

async function loadCommands() {
    for (const file of commandFiles) {
        const commandPath = path.join(commandsDir, file);
        await import(commandPath);
    }
}

await loadCommands();

const url_api = information.url_api;
const ADMINS = information.admins;
const API = information.api;
const BlackList = information.blackList;

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

const yooController = new YooModule(yooKassa.shopId, yooKassa.secretKey)

const editRules = new WizardScene(
    'editRules',
    async (ctx) => {
            await ctx.replyWithMarkdown(`${information.rules}\n\n⭕️ *ИЗМЕНЕНИЯ ПРАВИЛ:*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n📝 Если вы хотите изменить *«правила»*, то пришлите новые правила ниже:`, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{
                            text: '⬅️ Вернуться назад'
                        }]
                    ],
                    one_time_keyboard: false
                }
            })
			
            return ctx.wizard.next()
        },
		
        async (ctx) => {
            if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад')
			{
                admin_keyboard(ctx)
                return ctx.scene.leave()
            }else if (!ctx.message)
			{
                return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n👉 Вы так и не отправили новые правила для внесения изменений!`)
            }
			
            information.rules = ctx.message.text;
            await saveBase()
            await ctx.replyWithMarkdown(`✅ *Изменения в правила проекта успешно внесены!*`)
            admin_keyboard(ctx)
            return ctx.scene.leave()
        }
)

const giveModer = new WizardScene(
    'giveModer',
    async (ctx) => {
            await ctx.replyWithMarkdown(`👨‍✈️ Укажите *«Telegram ID-пользователя»* - кого хотите назначить на должность ?`, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{
                            text: '⬅️ Вернуться назад'
                        }]
                    ],
                    one_time_keyboard: false
                }
            })
			
            return ctx.wizard.next()
        },
		
        async (ctx) => {
            if (!ctx.message)
			{
                return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы так и не указали *«Telegram ID-пользователя»*`)
            }
			
			if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад')
			{
                admin_keyboard(ctx)
                return ctx.scene.leave()
            }
			
			else if (!Number(ctx.message.text))
			{
                return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы вводите *«символы»* вместо *«Telegram ID-пользователя»*`)
            }
            
            if (information.admins.includes(Number(ctx.message.text))) return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n🗯 Данный пользователь и так уже является *«Администратором»*`)
            let user = await $user.findOne({ id: ctx.message.text })
            
			if (!user) return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Пользователь с таким *«ID не найден»*`)
            information.admins.push(Number(ctx.message.text))
            await saveBase();
            await ctx.replyWithMarkdown(`✅ *ГОТОВО!*\n\n💬 Данный пользователь успешно назначен *«Администратором»*`)
            admin_keyboard(ctx)
            return ctx.scene.leave()
        }
)

const delModer = new WizardScene(
    'delModer',
    async (ctx) => {
            await ctx.replyWithMarkdown(`👨‍✈️ Укажите *«Telegram ID-пользователя»* - кого хотите снять с должности ?`, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{
                            text: '⬅️ Вернуться назад'
                        }]
                    ],
                    one_time_keyboard: false
                }
            })
			
            return ctx.wizard.next()
        },
		
        async (ctx) => {
            if (!ctx.message) 
			{
                return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы так и не указали *«Telegram ID-пользователя»*`)
            }
			
            if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад')
			{
                admin_keyboard(ctx)
                return ctx.scene.leave()
            }
			
			else if (!Number(ctx.message.text)) 
			{
				return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы вводите *«символы»* вместо *«Telegram ID-пользователя»*`)
            }
				
            if (!information.admins.includes(Number(ctx.message.text))) return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n🗯 Данный пользователь и так уже является *«Администратором»*`)
            information.admins.pop(Number(ctx.message.text))
            await saveBase();
            await ctx.replyWithMarkdown(`✅ *ГОТОВО!*\n\n💬 Данный пользователь снят из должности *«Администратора»*`)
            admin_keyboard(ctx)
            return ctx.scene.leave()
        }
)


const giveId = new WizardScene(
    'giveId',
    async (ctx) => {
            await ctx.replyWithMarkdown(`➖ Укажите *«Telegram ID-пользователя»* ?`, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{
                            text: '⬅️ Вернуться назад'
                        }]
                    ],
                    one_time_keyboard: false
                }
            })
            return ctx.wizard.next()
        },
        async (ctx) => {
				if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад') {
                    admin_keyboard(ctx)
                    return ctx.scene.leave()
                }else if (!ctx.message) {
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы так и не указали *«Telegram ID-пользователя»*`)
                }else if (!Number(ctx.message.text)) {
					return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы вводите *«символы»* вместо *«Telegram ID-пользователя»*`)
				}
                
				ctx.scene.state.id = ctx.message.text
				
                let user = await $user.findOne({ id: ctx.scene.state.id })
                if (!user) {
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Поиск завершён!\n👉 Пользователь с таким *«Telegram ID»* в базе данных бота не обнаружен!`)
                }
				
                await ctx.replyWithMarkdown(`➕ Укажите *«сумму для пополнения»* ?`)
                return ctx.wizard.next()
            },
            async (ctx) => {
                if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад') {
                    admin_keyboard(ctx)
                    return ctx.scene.leave()
                }else if (!ctx.message) {
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы так и не указали *«сумму для пополнения»*`)
                }else if (!Number(ctx.message.text)) {
					return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Сумма должна быть указана *«цифрой»* и значение должно быть больше *«нуля»*`)
				}
				
				ctx.scene.state.addFunds = ctx.message.text
				
				let user = await $user.findOne({ id: ctx.scene.state.id })								
				await bot.telegram.sendMessage(user.id, `💬 ВХОДЯЩЕЕ СООБЩЕНИЕ:\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n💸 Ваш баланс успешно пополнен!\n💵 Сумма пополнения: ${ctx.scene.state.addFunds} ₽\n\n🔎 Можете приступать к проверке авто!`).catch(err => { console.log(err) })
                await user.inc("balance", Number(ctx.scene.state.addFunds))
                await ctx.replyWithMarkdown(`✅ *ГОТОВО!*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n💬 *СРЕДСТВА НАЧИСЛЕНЫ ПОЛЬЗОВАТЕЛЮ!*\n👤 Клиент-получатель: *@${user.userNick}*\n👉 Сумма: *+${ctx.scene.state.addFunds} ₽*`)
                admin_keyboard(ctx)
                return ctx.scene.leave()
            }
)



const giveLogin = new WizardScene(
    'giveLogin',
    async (ctx) => {
            await ctx.replyWithMarkdown(`➕ Укажите *«Логин пользователя без символа @»* ?`, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{
                            text: '⬅️ Вернуться назад'
                        }]
                    ],
                    one_time_keyboard: false
                }
            })
            return ctx.wizard.next()
        },
        async (ctx) => {	
				if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад') {
                    admin_keyboard(ctx)
                    return ctx.scene.leave()
                }else if (!ctx.message) {
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы так и не указали *«Логин клиента»*`)
                }              
				
				ctx.scene.state.login = ctx.message.text
                
				let user = await $user.findOne({ userNick: ctx.scene.state.login })			
                if (!user) {
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Поиск завершён!\n👉 Пользователь с таким *«логином»* в базе данных бота не обнаружен!`)
                }
				
                await ctx.replyWithMarkdown(`➕ Укажите *«сумму для пополнения»* ?`)
                return ctx.wizard.next()
            },
            async (ctx) => {
				if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад') {
                    admin_keyboard(ctx)
                    return ctx.scene.leave()
                }else if (!ctx.message) {
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы так и не указали *«сумму для пополнения»*`)
                }else if (!Number(ctx.message.text)) {
					return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Сумма должна быть указана *«цифрой»* и значение должно быть больше *«нуля»*`)
				}
				
				ctx.scene.state.addFunds = ctx.message.text
				
				let user = await $user.findOne({ userNick: ctx.scene.state.login })								
				await bot.telegram.sendMessage(user.id, `💬 ВХОДЯЩЕЕ СООБЩЕНИЕ:\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n💸 Ваш баланс успешно пополнен!\n💵 Сумма пополнения: ${ctx.scene.state.addFunds}₽\n\n🔎 Можете приступать к проверке авто!`).catch(err => { console.log(err) })
                await user.inc("balance", Number(ctx.scene.state.addFunds))
                await ctx.replyWithMarkdown(`✅ *ГОТОВО!*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n💬 *СРЕДСТВА НАЧИСЛЕНЫ ПОЛЬЗОВАТЕЛЮ!*\n👤 Клиент-получатель: *@${user.userNick}*\n👉 Сумма: *+${ctx.scene.state.addFunds} ₽*`)
                admin_keyboard(ctx)
                return ctx.scene.leave()
            }
)


const delId = new WizardScene(
    'delId',
    async (ctx) => {
            await ctx.replyWithMarkdown(`➖ Укажите *«Telegram ID-клиента»* ?`, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{
                            text: '⬅️ Вернуться назад'
                        }]
                    ],
                    one_time_keyboard: false
                }
            })
            return ctx.wizard.next()
        },
        async (ctx) => {
                if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад') {
                    admin_keyboard(ctx)
                    return ctx.scene.leave()
                }else if (!ctx.message) {
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы так и не указали *«Telegram ID» пользователя!*`)
                }else if (!Number(ctx.message.text)) {
					return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Telegram ID клиента должна содержать только *«цифры»*`)
				}
				
                let user = await $user.findOne({ id: ctx.message.text })
                if (!user) {
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Поиск завершён!\n👉 Пользователь с таким *«Telegram ID»* в базе данных бота не обнаружен!`)
                }

				ctx.scene.state.id = ctx.message.text				
				
                await ctx.replyWithMarkdown(`➖ Укажите *«сумму списания»* ?`)
                return ctx.wizard.next()
            },
            async (ctx) => {
                if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад') {
                    admin_keyboard(ctx)
                    return ctx.scene.leave()
                }else if (!ctx.message) {
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы так и не указали *«сумму списания»*`)
                }else if (!Number(ctx.message.text)) {
					return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Сумма должна быть указана *«цифрой»* и значение должно быть больше *«нуля»*`)
				}
				
				ctx.scene.state.amount = ctx.message.text

				let user = await $user.findOne({ id: ctx.scene.state.id })
                await user.dec("balance", Number(ctx.scene.state.amount))
                await ctx.replyWithMarkdown(`✅ *ГОТОВО!*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n👤 Из баланса пользователя: *@${user.userNick}*\n👉 Было списано: *-${ctx.scene.state.amount} ₽*`)
                admin_keyboard(ctx)
                return ctx.scene.leave()
            }
)


const delLogin = new WizardScene(
    'delLogin',
    async (ctx) => {
            await ctx.replyWithMarkdown(`➖ Укажите *«Логин клиента без символа @»* ?`, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{
                            text: '⬅️ Вернуться назад'
                        }]
                    ],
                    one_time_keyboard: false
                }
            })
            return ctx.wizard.next()
        },
        async (ctx) => {
                if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад') {
                    admin_keyboard(ctx)
                    return ctx.scene.leave()
                }else if (!ctx.message) {
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы так и не указали *«Логин»* пользователя!`)
                }
				
                let user = await $user.findOne({ userNick: ctx.message.text })
                if (!user) {
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Поиск завершён!\n👉 Пользователь с таким *«Логином»* в базе данных бота не обнаружен!`)
                }
				
                ctx.scene.state.login = ctx.message.text
				
                await ctx.replyWithMarkdown(`➖ Укажите *«сумму списания»* ?`)
                return ctx.wizard.next()
            },
            async (ctx) => {
				if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад') {
                    admin_keyboard(ctx)
                    return ctx.scene.leave()
                }else if (!ctx.message) {
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы так и не указали *«сумму списания»*`)
                }else if (!Number(ctx.message.text)) {
					return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Сумма должна быть указана *«цифрой»* и значение должно быть больше *«нуля»*`)
				}
				
				ctx.scene.state.amount = ctx.message.text
				
				let user = await $user.findOne({ userNick: ctx.scene.state.login })
                await user.dec("balance", Number(ctx.scene.state.amount))
                await ctx.replyWithMarkdown(`✅ *ГОТОВО!*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n👤 Из баланса пользователя: *@${user.userNick}*\n👉 Было списано: *-${ctx.scene.state.amount} ₽*`)
                admin_keyboard(ctx)
                return ctx.scene.leave()
            }
)


const giveBanId = new WizardScene(
    'giveBanId',
    async (ctx) => {
            await ctx.replyWithMarkdown(`🆔 Укажите *Telegram ID-пользователя* ?`, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{
                            text: '⬅️ Вернуться назад'
                        }]
                    ],
                    one_time_keyboard: false
                }
            })
            return ctx.wizard.next()
        },
        async (ctx) => {
				if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад') {
                    admin_keyboard(ctx)
                    return ctx.scene.leave()
                }else if (!ctx.message) {
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы так и не указали *«Telegram ID»* пользователя!`)
                }else if (!Number(ctx.message.text)) {
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Telegram ID пользователя указывается только в *«цифрах»* и без посторонних символов!`)
                }
				
                ctx.scene.state.id = ctx.message.text
				
				await ctx.replyWithMarkdown(`⏱ Укажите *«срок блокировки»* ?\n✍️ Правильный формат: *01.01.2030*\n👉 *ОБЯЗАТЕЛЬНО! Указывайте срок как напримере.*`)				
                return ctx.wizard.next()
            },
        async (ctx) => {
				if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад') {
                    admin_keyboard(ctx)
                    return ctx.scene.leave()
                }else if (!ctx.message) {
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 *Вы так и не указали срок блокировки!*\n✍️ Правильный формат: *01.01.2030*\n👉 *ОБЯЗАТЕЛЬНО! Указывайте срок как напримере.*`)
                }
				
                ctx.scene.state.timeBan = ctx.message.text
							
				await ctx.replyWithMarkdown(`🤔 Укажите *причину блокировки* ?`)				
                return ctx.wizard.next()
            },
            async (ctx) => {
				if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад') {
                    admin_keyboard(ctx)
                    return ctx.scene.leave()
                }else if (!ctx.message) {
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы так и не указали причину блокировки!`)
                }
				
				ctx.scene.state.reasonBan = ctx.message.text
														
				let user = await $user.findOne({ id: ctx.scene.state.id })
				if (!user) {
                    await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Поиск завершён!\n👉 Пользователь с таким *«Telegram ID»* в базе данных бота не обнаружен!`)
                    admin_keyboard(ctx)
                    return ctx.scene.leave()
                }else if (user.isBanned === true && information.blockID.includes(Number(user.id))) {
					await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n🚫 Данный клиент и так *«заблокирован»*`)
					admin_keyboard(ctx)
                    return ctx.scene.leave()
				}
				
				await user.set("isBanned", true)
				await user.set("timeBan", ctx.scene.state.timeBan)
				await user.set("reasonBan", ctx.scene.state.reasonBan)
				information.blockID.push(Number(user.id))
				await saveBase();
				await ctx.replyWithMarkdown(`✅ *ГОТОВО!*\n\n👊 Клиент успешно *«заблокирован»*`)
				await bot.telegram.sendSticker(`${user.id}`, stiker.stop_ban).catch(err => { console.log(err) })
                await bot.telegram.sendMessage(`${user.id}`, `🚫 ВАШ ПРОФИЛЬ ЗАБЛОКИРОВАН!\n➖➖➖➖➖➖➖➖➖➖\n👉 Все разделы для вас ограничены!\n👮‍♂️ Вы заблокированы до ${ctx.scene.state.timeBan}г.\n💬 Причина блокировки: «${ctx.scene.state.reasonBan}»`)
                admin_keyboard(ctx)
                return ctx.scene.leave()
            }
)


// Снятие блокировки клиента по ID
const delBanId = new WizardScene(
    'delBanId',
    async (ctx) => {
            await ctx.replyWithMarkdown(`🆔 Укажите *Telegram ID-пользователя* ?`, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{
                            text: '⬅️ Вернуться назад'
                        }]
                    ],
                    one_time_keyboard: false
                }
            })
            return ctx.wizard.next()
        },
        async (ctx) => {
			ctx.scene.state.id = ctx.message.text
			if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад') {
                admin_keyboard(ctx)
                return ctx.scene.leave()
            }else if (!ctx.message) {
                return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы так и не указали *«Telegram ID»* пользователя!`)
            }else if (!Number(ctx.message.text)) {
                return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Telegram ID пользователя указывается только в *«цифрах»* и без посторонних символов!`)
            }
			
			let user = await $user.findOne({ id: ctx.scene.state.id })
			if (!user) {
                await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Поиск завершён!\n👉 Пользователь с таким *«Telegram ID»* в базе данных бота не обнаружен!`)
                admin_keyboard(ctx)
                return ctx.scene.leave()
            }else if (user.isBanned === false || !information.blockID.includes(Number(user.id))) {
				await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n🤠 Пользователь с таким *«Telegram ID»* так и так не имеет блокировок!`)
				admin_keyboard(ctx)
                return ctx.scene.leave()
			}
				
			await user.set("isBanned", false)
			await user.set("timeBan", '')
			await user.set("reasonBan", '-')
			timers.removeTimer(`ban${user.id}`)
			information.blockID.pop(Number(user.id))
			await saveBase();
			await ctx.replyWithMarkdown(`✅ *ГОТОВО!*\n\n✊ Клиент успешно *«разблокирован»*`)
            await bot.telegram.sendSticker(`${user.id}`, stiker.speaker).catch(err => { console.log(err) })
			await bot.telegram.sendMessage(user.id, `💬 СИСТЕМНОЕ УВЕДОМЛЕНИЕ:\n➖➖➖➖➖➖➖➖➖➖\n🥳 Ваш профиль разблокирован!\n\n🤠 Мы рады видеть Вас снова в наших рядах, рекомендуем больше не нарушать наши правила во избежании подобного положения!\n\n🤝 Удачи!`)
            admin_keyboard(ctx)
            return ctx.scene.leave()
        }
)


// Рассылка всем клиентам
const sender = new WizardScene(
    'sender',
    async (ctx) => {
            await ctx.replyWithMarkdown(`📣 *Промоакции | РАССЫЛКА:*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n☝️ *Ваше сообщение будет разослано всем клиентам.*\n\nℹ️ *О ПОДДЕРЖИВАЕМЫХ ФОРМАТАХ:*\n - Вы можете прикреплять *«изображения»*, *«видео»*, *«аудиозаписи»*, *«gif»*, *«стикеры»* а также *«текст»* к ним.\n\n✍️ *Отправьте сообщение для рассылки пользователям:*`, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [
							{
								text: '⬅️ Вернуться назад'
							}
						]
                    ],
                    one_time_keyboard: false
                }
            })
            return ctx.wizard.next()
        },
        async (ctx) => {
            if (ctx.message.text === '⬅️ Вернуться назад') {
                admin_keyboard(ctx)
                return ctx.scene.leave()
            }else if (!ctx.message) {
                return await ctx.replyWithMarkdown(`🔴 *Ошибка!*\n\n💬 Вы так и не указали «содержимое» для рассылки!`)
            }
			
			
				let users = await $user.find();
				let typeSMS = 'text'
            	if (ctx.message.text) {
					typeSMS = 'text'	
				}else if (ctx.message.photo) {
					typeSMS = 'photo'	
				}else if (ctx.message.document) {
					typeSMS = 'document'	
				}else if (ctx.message.voice) {
					typeSMS = 'voice'	
				}else if (ctx.message.video_note) {
					typeSMS = 'video_note'	
				}else if (ctx.message.video) {
					typeSMS = 'video'	
				}else if (ctx.message.audio) {
					typeSMS = 'audio'	
				}else if (ctx.message.sticker) {
					typeSMS = 'sticker'	
				}

    let totalUsers = 0;
    const badUsers = 0;
				
	for (var i = users.length - 1; i >= 0; i--) {
        switch (typeSMS) {
            case 'text':
                    bot.telegram.sendMessage(
                        users[i].id,
                        `${ctx.message.text}`, {
                        parse_mode: "HTML"
                    }).catch(err => {});
                    break;               
				
            case 'photo':
                let file = ctx.message.photo.length - 1;
                bot.telegram.sendPhoto(
                    users[i].id,
                    ctx.message.photo[file].file_id,
                    {
                        'caption': `${ctx.message.caption}`,
                        parse_mode: "HTML"
                    }).catch(err => { badUsers += 1; });
                break;
				
            case 'document':
                bot.telegram.sendDocument(
                    users[i].id,
                    ctx.message.document.file_id,
                    {
                        'caption': `${ctx.message.caption}`,
						parse_mode: "HTML"
				    }).catch(err => { badUsers += 1; });
                break;
				
            case 'voice':
                bot.telegram.sendVoice(
                    users[i].id,
                    ctx.message.voice.file_id,
                    {
                        'caption': `${ctx.message.caption}`,
						parse_mode: "HTML"
				    }).catch(err => { badUsers += 1; });
                break;
				
            case 'video_note':
                bot.telegram.sendVideoNote(
                    users[i].id,
                    ctx.message.video_note.file_id, {
					parse_mode: "HTML"
				}).catch(err => { badUsers += 1; });
                break;
				
            case 'video':
                bot.telegram.sendVideo(
                    users[i].id,
                    ctx.message.video.file_id,
                    {
                        'caption': `${ctx.message.caption}`,
						parse_mode: "HTML"
				    }).catch(err => { badUsers += 1; });
                break;
				
            case 'audio':
                bot.telegram.sendAudio(
                    users[i].id,
                    ctx.message.audio.file_id,
                    {
                        'caption': `${ctx.message.caption}`,
						parse_mode: "HTML"
				    }).catch(err => { badUsers += 1; });
                break;
				
			case 'sticker':
                bot.telegram.sendSticker(
                    users[i].id,
                    ctx.message.sticker.file_id, {
					parse_mode: "HTML"
				}).catch(err => { badUsers += 1; });
                break;
			}

            totalUsers = users.length;
    }

            let okSendler = totalUsers - badUsers;			
            await ctx.replyWithMarkdown(`✅ *Рассылка успешно завершена!*\n👉 Ваше сообщение успешно доставлено всем клиентам бота.\n\n📨 Всего отправлено сообщений: *${totalUsers}-шт.*\n\n✅ Получили рассылку: *${okSendler}-чел.*\n❌ Не получили рассылку: *${Math.ceil(Math.random()*10)}-чел.*`)
            admin_keyboard(ctx)
            return ctx.scene.leave()
        }
)


const set_percent = new WizardScene(
    'set_percent',
    async (ctx) => {
            await ctx.replyWithMarkdown(`⚙️ *НАСТРОЙКИ - РЕФ. СИСТЕМЫ:*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n\n🙅‍♂️ Установленное текущее значение: *«${information.referal}%»*\n\n❗️ *Помните, исходя из этого значения - бот будет начислять награду новым рефералам.*\n\n✍️ Для изменения текущего значения, отправьте мне в ответ новое значение:`, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{
                            text: '⬅️ Вернуться назад'
                        }]
                    ],
                    one_time_keyboard: false
                }
            })
            return ctx.wizard.next()
        },
		
        async (ctx) => {
            if (!ctx.message) 
			{
                return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы так и не указали *«процент»* начисляемый новым рефералам!`)
            }
			
            if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад') 
			{
                admin_keyboard(ctx)
                return ctx.scene.leave()
            }
			
            if (!Number(ctx.message.text)) return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Процент для реферальной программы задаётся только в *«цифрах»* и без посторонних символов!`)
            
			information.referal = Number(ctx.message.text);
            await saveBase()
            await ctx.replyWithMarkdown(`✅ *Изменения успешно приняты и сохранены!*`)
            admin_keyboard(ctx)
            return ctx.scene.leave()
        }
)


const set_all = new WizardScene(
    'set_all',
    async (ctx) => {
            await ctx.replyWithMarkdown(`✍️ *Для внесения изменений в стоимость отчёта, пожалуйста пришлите новую цену?*`, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{
                            text: '⬅️ Вернуться назад'
                        }]
                    ],
                    one_time_keyboard: false
                }
            })
            return ctx.wizard.next()
        },
		
        async (ctx) => {
            if (!ctx.message) 
			{
                return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы так и не задали *«цену»* для формируемых отчётов!`)
            }
			
            if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад') 
			{
                admin_keyboard(ctx)
                return ctx.scene.leave()
            }
			
            if (!Number(ctx.message.text)) return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Стоимость отчёта указывается только в *«цифрах»* и без посторонних символов!`)
            
			information.all = Number(ctx.message.text);
            await saveBase()
            await ctx.replyWithMarkdown(`✅ *Стоимость отчёта успешно изменена!*`)
            admin_keyboard(ctx)
            return ctx.scene.leave()
        }
)


const set_min_pay = new WizardScene(
    'set_min_pay',
    async (ctx) => {
            await ctx.replyWithMarkdown(`✍️ *Для внесения изменений порога минимальной оплаты, пожалуйста пришлите новое значение?*`, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{
                            text: '⬅️ Вернуться назад'
                        }]
                    ],
                    one_time_keyboard: false
                }
            })
            return ctx.wizard.next()
        },
		
        async (ctx) => {
            if (!ctx.message) 
			{
                return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы так и не задали *«минимальный порог»* для пополнения!`)
            }
			
            if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад') 
			{
                admin_keyboard(ctx)
                return ctx.scene.leave()
            }
			
            if (!Number(ctx.message.text)) return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Порог минимальной оплаты указывается только в *«цифрах»* и без посторонних символов!`)
            
			information.min_pay = Number(ctx.message.text);
            await saveBase()
            await ctx.replyWithMarkdown(`✅ *Новый порог для минимальной оплаты успешно установлен!*`)
            admin_keyboard(ctx)
            return ctx.scene.leave()
        }
)


const ans = new WizardScene(
    'ans',
    async (ctx) => {
            await ctx.replyWithMarkdown(`📤 Введите *«идентификатор тикета»*, на которую хотите ответить?:`, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{
                            text: '⬅️ Вернуться назад'
                        }]
                    ],
                    one_time_keyboard: false
                }
            })
			
            return ctx.wizard.next()
        },
        async (ctx) => {
                if (ctx.message.text === '⬅️ Вернуться назад' || ctx.message.text === '/start')
				{
                    admin_keyboard(ctx)
                    return ctx.scene.leave()
                }
				
                if (!Number(ctx.message.text)) 
				{
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Тикет с таким *«идентификатором»* не найден!`)
                }
				
                ctx.scene.state.id = ctx.message.text
                await ctx.replyWithMarkdown(`🗣 Введите *«текст ответа»* на тикет:`)
                return ctx.wizard.next()
            },
			
            async (ctx) => {
                if (!ctx.message) 
				{
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы не указали «текст ответа» на тикет!`)
                }
				
                if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад') 
				{
                    admin_keyboard(ctx)
                    return ctx.scene.leave()
                }
				
                let user = await $user.findOne({ id: ctx.scene.state.id })
                
				if (!user) 
				{
                    await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Тикет с таким «идентификатором» не найден!`)
                    admin_keyboard(ctx)
                    return ctx.scene.leave()
                }
				
                await bot.telegram.sendMessage(user.id, `🍀 Вы получили ответ на своё обращение в тикетной системе от «Тех. поддержки»:\n\n📩 Содержимое: ${ctx.message.text}`).catch(err => { console.log(err) })
                await ctx.replyWithMarkdown(`👍 *ГОТОВО!\n\n✅ Ваш ответ на тикет успешно отправлен!*`)
                admin_keyboard(ctx)
                return ctx.scene.leave()
            }
)

const ansLogin = new WizardScene(
    'ansLogin',
    async (ctx) => {
            await ctx.replyWithMarkdown(`🧸 Введите *«логин»* клиента?:`, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{
                            text: '⬅️ Вернуться назад'
                        }]
                    ],
                    one_time_keyboard: false
                }
            })
            return ctx.wizard.next()
        },
		
        async (ctx) => {
                if (!ctx.message) 
				{
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы так и не указали *«Логин»* пользователя!`)
                }
				
                if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад') 
				{
                    admin_keyboard(ctx)
                    return ctx.scene.leave()
                }
				
                ctx.scene.state.id = ctx.message.text
                await ctx.replyWithMarkdown(`🖍 Введите *«текст обращения»* клиенту?:`)
                return ctx.wizard.next()
            },
			
            async (ctx) => {
                
				if (!ctx.message) 
				{
                    return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы не указали «текст ответа» на тикет!`)
                }
                
				if (ctx.message.text === '/start' || ctx.message.text === '⬅️ Вернуться назад')
				{
                    admin_keyboard(ctx)
                    return ctx.scene.leave()
                }
                
				let user = await $user.findOne({ userNick: ctx.scene.state.id })
                
				if (!user) 
				{
                    await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Поиск завершён!\n👉 Пользователь с таким *«Логином»* в базе данных бота не обнаружен!`)
                    admin_keyboard(ctx)
                    return ctx.scene.leave()
                }
				
                await bot.telegram.sendMessage(user.id, `🍀 Вы получили новое сообщение от «Тех. поддержки»:\n\n📩 Содержимое: ${ctx.message.text}`).catch(err => { console.log(err) })
                await ctx.replyWithMarkdown(`👍 *ГОТОВО!\n\n✅ Ваше обращение успешно отправлено!*`)
                admin_keyboard(ctx)
                return ctx.scene.leave()
            }
)

const help = new WizardScene(
    'help',
    async (ctx) => {
            await bot.telegram.sendSticker(ctx.from.id, stiker.help_support).catch(err => { console.log(err) })
            await ctx.replyWithMarkdown(`🤖 Вы перешли в режим чата с *«Технической поддержкой»*.\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🌼 Задавайте все свои вопросы, мы будем рады Вам помочь!\n⏰ Среднее время ответа: *${Math.ceil(Math.random()*30)}-мин.*`, {
                reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [{
                            text: '⬅️ Вернуться назад'
                        }]
                    ],
                    one_time_keyboard: false
                }
            })
            
			return ctx.wizard.next()
        },
		
        async (ctx) => {
            if (!ctx.message)
			{
                return await ctx.replyWithMarkdown(`❌ *ПРОИЗОШЛА ОШИБКА!*\n\n💬 Вы так и не указали текст своего обращения!`)
            }
            
			if (ctx.message.text === '⬅️ Вернуться назад' || ctx.message.text === '/start')
			{
                main_keyboard(ctx)
                return ctx.scene.leave()
            }
			
            let user = await $user.findOne({ id: ctx.from.id })
            if (!user) return;

            await ctx.replyWithMarkdown(`*✉️ Ваше обращение отправлено.*\n\n✴️ Благодарим Вас за обращение!\n⏱ Ожидайте, в ближайшее время вы обязательно получите ответ на своё обращение.`)
			
			await bot.telegram.sendMessage(`${information.admins}`,  `📩 Новый тикет от @${user.userNick} | ID в боте: #${user.uid}\n🔗 Идентификатор тикета: ${user.id}\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🗒 Обращение: ${ctx.message.text}`, {
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: '🌸 Ответить на тикет',
                            callback_data: 'ans'
                        }]
                    ]
                }
            }).catch(err => { console.log(err) })
			
            main_keyboard(ctx)
            return ctx.scene.leave()
        }
)


// ПРОЦЕСС ПРОВЕРКИ ПО ГОСНОМЕРУ
const all_gos_process = async (ctx) => {
    try {
        ctx.scene.leave()
    }catch (e) {

    }
	
    let code = "";
    let user = await $user.findOne({ id: ctx.from.id })

    if(user.cachedAutoCode !== "")
    {
        code = user.cachedAutoCode;
    }else
    {
        if (!ctx.message)
        {
            return ctx.replyWithMarkdown(`🔔 *УВЕДОМЛЕНИЕ*:\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n\n🚫 Дальнейшая работа невозможна!\n👉 Вы не указали *«Гос. номер транспорта»*`)
        }
        code = ctx.message.text;
    }

    if (code === '⬅️ Вернуться назад' || code === '/start')
    {
        main_keyboard(ctx)
        return ctx.scene.leave()
    }

    let gosnomer = code;
    await bot.telegram.sendSticker(user.id, `CAACAgUAAxkBAAEDyk9l3xCmnxJnd0qkt48l03Efe0yffQACHwcAArTSUFafUinw6WM2MDQE`).catch(err => { console.log(err) })
    await ctx.replyWithMarkdown(`📝 Ваша заявка на генерацию полного файла отчёта по *госномеру: «${gosnomer}»* — успешно принята.\n\n⏰ *Время генерации отчёта 5-15 минут, пожалуйста ожидайте...*`)
    await user.dec("requestCount", 1)

    const resp = await rq(`${url_api}/reportrequest.ashx?key=${API}&mode=setqueue&gosnumber=${encodeURI(code)}`)

    if (resp.error === true)
    {
        await ctx.replyWithMarkdown(`💬 *«РЕЗУЛЬТАТЫ ПОЛНОГО ОТЧЁТА»*:\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n\n📨 Заказ *«№${Math.ceil(Math.random()*10000000)}»* не выполнен!\n\n🙅‍♂️ *В базе данных ГИБДД - нам не удаётся обнаружить информацию о запрашиваемом автомобиле.*\n💵 *Ваш баланс остаётся неизменным.*\n👉 Пожалуйста, попробуйте заказать отчёт по *«VIN-коду»* данного транспортного средства.`)
        await bot.telegram.sendMessage(`${information.channel}`,  `🙍🏻‍♂️ Клиент: @${user.userNick} | ID: #${user.uid}\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🎲 Номер заказа: #${user.id}\n📑 Клиент заказал отчёт по госномеру - ${gosnomer}.\n ✋ Отчёт не сформирован!\n✔️ Баланс клиента остаётся неизменным.\n☝️ Боту неудалось найти информацию в базе данных ГИБДД по данному госномеру, клиенту было предложено «заказать отчёт» по «VIN-коду»`).catch(err => { console.log(err) });
        await user.inc("requestCount", 1)
        await saveBase()
        await sleep(1000)
        main_keyboard(ctx)
        return ctx.scene.leave()
    }

    let report_id = resp.id;

    const { message_id } = await ctx.replyWithMarkdown(`🔍 Пожалуйста подождите, обрабатываем ваш запрос...\n\n🌐 Прогресс:\n ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 0%`)
    var message = [
        "🔍 Ищем информацию в базе данных ГИБДД...\n\n🌐 Прогресс:\n █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 4%",
        "🔍 Получаем и расшифровываем VIN-код...\n\n🌐 Прогресс:\n ██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 11%",
        "🔍 Получаем данные из ПТС и СТС...\n\n🌐 Прогресс:\n ███▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 16%",
        "🔍 Получаем информацию о ДТП...\n\n🌐 Прогресс:\n █████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 21%",
        "🔍 Получаем информацию о пробегах...\n\n🌐 Прогресс:\n ██████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 25%",
        "🔍 Получаем информацию об ограничениях...\n\n🌐 Прогресс:\n █████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 30%",
        "🔍 Получаем информацию из реестра залогов...\n\n🌐 Прогресс:\n ██████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 34%",
        "🔍 Получаем информацию о розыске...\n\n🌐 Прогресс:\n ███████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 39%",
        "🔍 Получаем информацию о штрафах...\n\n🌐 Прогресс:\n ████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 43%",
        "🔍 Проверяем информацию о утилизации ТС...\n\n🌐 Прогресс:\n ██████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 48%",
        "🔍 Получаем информацию о полисах ОСАГО...\n\n🌐 Прогресс:\n ███████████████▒▒▒▒▒▒▒▒▒▒▒▒▒ 51%",
        "🔍 Получаем историю о техосмотрах...\n\n🌐 Прогресс:\n █████████████████▒▒▒▒▒▒▒▒▒▒▒ 57%",
        "🔍 Проверяем информацию об использовании в такси...\n\n🌐 Прогресс:\n ███████████████████▒▒▒▒▒▒▒▒▒ 63%",
        "🔍 Проверяем информацию об использовании в каршеринге...\n\n🌐 Прогресс:\n ████████████████████▒▒▒▒▒▒▒▒ 69%",
        "🔍 Получаем доп. фотографии автомобиля...\n\n🌐 Прогресс:\n █████████████████████▒▒▒▒▒▒▒ 75%",
        "🔍 Получаем информацию о растаможивании...\n\n🌐 Прогресс:\n ███████████████████████▒▒▒▒▒ 82%",
        "🔍 Получаем информацию из нотариальной палаты...\n\n🌐 Прогресс:\n █████████████████████████▒▒▒ 88%",
        "🔍 Ищем возможные судебные постановления...\n\n🌐 Прогресс:\n ██████████████████████████▒▒ 91%",
        "🔍 Проверяем отзывные кампании...\n\n🌐 Прогресс:\n ███████████████████████████▒ 96%",
        "🔍 Формируем файл отчёта...\n\n🌐 Прогресс:\n ████████████████████████████ 100%"
    ];

    new Promise(async () => {
        let getresult_report = "";
        for (let i = 0; i < message.length; i++) {

            if(getresult_report === "")
            {
                const checkqueue = await rq(`${url_api}/reportrequest.ashx?key=${API}&mode=checkqueue&id=${report_id}`)

                if (checkqueue.status === 1) {
                    getresult_report = await rq(`${url_api}/reportrequest.ashx?key=${API}&mode=getresult&id=${report_id}`)
                }

                await sleep(30000)
            }else
            {
                await sleep(1500)
            }

            await bot.telegram.editMessageText(ctx.from.id, message_id, 0, message[i])
        }
        if (code === '⬅️ Вернуться назад' || code === '/start')
        {
            main_keyboard(ctx)
            return ctx.scene.leave()
        }
        if(getresult_report === "")
        {
            await ctx.replyWithMarkdown(`💬 *«РЕЗУЛЬТАТЫ ПОЛНОГО ОТЧЁТА»*:\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n\n📨 Заказ *«№${Math.ceil(Math.random()*10000000)}»* не выполнен!\n\n🙅‍♂️ *В базе данных ГИБДД - нам не удаётся обнаружить информацию о запрашиваемом автомобиле.*\n💵 *Ваш баланс остаётся неизменным.*\n👉 Пожалуйста, попробуйте заказать отчёт по *«VIN-коду»* данного транспортного средства.`)
            await bot.telegram.sendMessage(`${information.channel}`,  `🙍🏻‍♂️ Клиент: @${user.userNick} | ID: #${user.uid}\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🎲 Номер заказа: #${user.id}\n📑 Клиент заказал отчёт по госномеру - ${gosnomer}.\n ✋ Отчёт не сформирован!\n✔️ Баланс клиента остаётся неизменным.\n☝️ Боту неудалось найти информацию в базе данных ГИБДД по данному госномеру, клиенту было предложено «заказать отчёт» по «VIN-коду»`).catch(err => { console.log(err) });
            await user.inc("requestCount", 1)
            information.dayPaymentCount += 1;
            information.monthPaymentCount += 1;
            information.allPaymentCount += 1;
            await saveBase()
        }else
        {
            try
            {
                await ctx.replyWithMarkdown(`📑 Ваш отчёт *№${Math.ceil(Math.random()*100000)}* по госномеру *«${gosnomer}»* — был успешно сгенерирован.\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🚘 *Ознакомиться с отчетом можно по cсылке ниже:*\n${getresult_report.url}`, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '👁 ПЕРЕЙТИ К ОТЧЁТУ',
                                    url: getresult_report.url
                                },
                                {
                                    text: '🛍 Купить тариф',
                                    callback_data: 'donate'
                                }
                            ]
                        ]
                    }
                })

                let newReport = new $report({
                    senderId: ctx.from.id,
                    date: time(5),
                    requestName: `Оформление отчёта по госномеру: «${gosnomer}»\n└ Ссылка на отчёт: ${getresult_report.url}\n`
                })
                await newReport.save();

                await bot.telegram.sendMessage(`${information.channel}`,  `🙍🏻‍♂️ Клиент: @${user.userNick} | ID: #${user.uid}\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🗒 Заказал платный отчёт.\n🎲 Номер заказа: #${user.id}\n🔍 Осуществлена проверка по «Госномеру»\n👉 Госномер: ${gosnomer}`)

                information.dayPaymentCount += 1;
                information.monthPaymentCount += 1;
                information.allPaymentCount += 1;
                await saveBase()

                main_keyboard(ctx)
                ctx.scene.leave()
            }catch (e) {
                console.log(e)
            }
        }
    });
}

// ПОЛНАЯ ПРОВЕРКА ПО ГОС. НОМЕРУ
const all_gos = new WizardScene(
    'all_gos',
    async (ctx) => {

        let user = await $user.findOne({ id: ctx.from.id })

        if(user.cachedAutoCode !== "")
        {
            all_gos_process(ctx);
            return;
        }

        await ctx.replyWithMarkdown('↪️ Вы находитесь в разделе:\n*«Проверка по Гос. номеру»*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🚗  *Укажите госномер автомобиля:*\n👉  пример: *Т123КМ777*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n❗️ *Пожалуйста, придерживайтесь вышеуказанного примера и укажите госномер в таком формате - без пробелов и прочих символов.*', {
            reply_markup: {
                resize_keyboard: true,
                keyboard: [
                    [{
                        text: '⬅️ Вернуться назад'
                    }]
                ],
                one_time_keyboard: false
            }
        })
        return ctx.wizard.next()
    },
    async (ctx) => {
        all_gos_process(ctx);
    }
)

// ПРОЦЕСС ПРОВЕРКИ ПО VIN-КОДУ
const all_vin_process = async (ctx) => {
    try {
        ctx.scene.leave()
    }catch (e) {

    }
	
    let code = "";
    let user = await $user.findOne({ id: ctx.from.id })

    if(user.cachedAutoCode !== "")
    {
        code = user.cachedAutoCode;
    }else
    {
        if (!ctx.message)
        {
            return await ctx.replyWithMarkdown(`🔔 *УВЕДОМЛЕНИЕ*:\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n\n🚫 Дальнейшая работа невозможна!\n👉 Вы не указали *«VIN-код транспорта»*`)
        }
        code = ctx.message.text;
    }

    if (code === '⬅️ Вернуться назад' || code === '/start')
    {
        main_keyboard(ctx)
        return ctx.scene.leave()
    }

    let vinkod = code;
    await bot.telegram.sendSticker(user.id, `CAACAgUAAxkBAAEDyk9l3xCmnxJnd0qkt48l03Efe0yffQACHwcAArTSUFafUinw6WM2MDQE`).catch(err => { console.log(err) })
    await ctx.replyWithMarkdown(`📝 Ваша заявка на генерацию полного файла отчёта по *VIN-коду: «${vinkod}»* — успешно принята.\n\n⏰ *Время генерации отчёта 5-15 минут, пожалуйста ожидайте...*`)
    await user.dec("requestCount", 1)

    const resp = await rq(`${url_api}/reportrequest.ashx?key=${API}&mode=setqueue&vin=${encodeURI(code)}`)

    if (resp.error === true)
    {
        await ctx.replyWithMarkdown(`💬 *«РЕЗУЛЬТАТЫ ПОЛНОГО ОТЧЁТА»*:\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n\n📨 Заказ *«№${Math.ceil(Math.random()*10000000)}»* не выполнен!\n\n🙅‍♂️ *В базе данных ГИБДД - нам не удаётся обнаружить информацию о запрашиваемом автомобиле.*\n💵 *Ваш баланс остаётся неизменным.*\n👉 Пожалуйста, попробуйте заказать отчёт по *«ГОСНОМЕРУ»* данного транспортного средства.`)
        await bot.telegram.sendMessage(`${information.channel}`,  `🙍🏻‍♂️ Клиент: @${user.userNick} | ID: #${user.uid}\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🎲 Номер заказа: #${user.id}\n📑 Клиент заказал отчёт по VIN коду - ${vinkod}.\n ✋ Отчёт не сформирован!\n✔️ Баланс клиента остаётся неизменным.\n☝️ Боту неудалось найти информацию в базе данных ГИБДД по данному VIN-коду, клиенту было предложено «заказать отчёт» по «ГОСНОМЕРУ»`).catch(err => { console.log(err) });
        await user.inc("requestCount", 1)
        await saveBase()
        await sleep(1000)
        main_keyboard(ctx)
        return ctx.scene.leave()
    }

    let report_id = resp.id;

    const { message_id } = await ctx.replyWithMarkdown(`🔍 Пожалуйста подождите, обрабатываем ваш запрос...\n\n🌐 Прогресс:\n ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 0%`)
    var message = [
        "🔍 Ищем информацию в базе данных ГИБДД...\n\n🌐 Прогресс:\n █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 4%",
        "🔍 Получаем и расшифровываем Госномер...\n\n🌐 Прогресс:\n ██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 11%",
        "🔍 Получаем данные из ПТС и СТС...\n\n🌐 Прогресс:\n ███▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 16%",
        "🔍 Получаем информацию о ДТП...\n\n🌐 Прогресс:\n █████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 21%",
        "🔍 Получаем информацию о пробегах...\n\n🌐 Прогресс:\n ██████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 25%",
        "🔍 Получаем информацию об ограничениях...\n\n🌐 Прогресс:\n █████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 30%",
        "🔍 Получаем информацию из реестра залогов...\n\n🌐 Прогресс:\n ██████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 34%",
        "🔍 Получаем информацию о розыске...\n\n🌐 Прогресс:\n ███████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 39%",
        "🔍 Получаем информацию о штрафах...\n\n🌐 Прогресс:\n ████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 43%",
        "🔍 Проверяем информацию о утилизации ТС...\n\n🌐 Прогресс:\n ██████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 48%",
        "🔍 Получаем информацию о полисах ОСАГО...\n\n🌐 Прогресс:\n ███████████████▒▒▒▒▒▒▒▒▒▒▒▒▒ 51%",
        "🔍 Получаем историю о техосмотрах...\n\n🌐 Прогресс:\n █████████████████▒▒▒▒▒▒▒▒▒▒▒ 57%",
        "🔍 Проверяем информацию об использовании в такси...\n\n🌐 Прогресс:\n ███████████████████▒▒▒▒▒▒▒▒▒ 63%",
        "🔍 Проверяем информацию об использовании в каршеринге...\n\n🌐 Прогресс:\n ████████████████████▒▒▒▒▒▒▒▒ 69%",
        "🔍 Получаем доп. фотографии автомобиля...\n\n🌐 Прогресс:\n █████████████████████▒▒▒▒▒▒▒ 75%",
        "🔍 Получаем информацию о растаможивании...\n\n🌐 Прогресс:\n ███████████████████████▒▒▒▒▒ 82%",
        "🔍 Получаем информацию из нотариальной палаты...\n\n🌐 Прогресс:\n █████████████████████████▒▒▒ 88%",
        "🔍 Ищем возможные судебные постановления...\n\n🌐 Прогресс:\n ██████████████████████████▒▒ 91%",
        "🔍 Проверяем отзывные кампании...\n\n🌐 Прогресс:\n ███████████████████████████▒ 96%",
        "🔍 Формируем файл отчёта...\n\n🌐 Прогресс:\n ████████████████████████████ 100%"
    ];

    new Promise(async () => {
        let getresult_report = "";
        for (let i = 0; i < message.length; i++) {

            if(getresult_report === "")
            {
                const checkqueue = await rq(`${url_api}/reportrequest.ashx?key=${API}&mode=checkqueue&id=${report_id}`)

                if (checkqueue.status === 1) {
                    getresult_report = await rq(`${url_api}/reportrequest.ashx?key=${API}&mode=getresult&id=${report_id}`)
                }

                await sleep(30000)
            }else
            {
                await sleep(1500)
            }

            await bot.telegram.editMessageText(ctx.from.id, message_id, 0, message[i])
        }
        if (code === '⬅️ Вернуться назад' || code === '/start')
        {
            main_keyboard(ctx)
            return ctx.scene.leave()
        }
        if(getresult_report === "")
        {
            await ctx.replyWithMarkdown(`💬 *«РЕЗУЛЬТАТЫ ПОЛНОГО ОТЧЁТА»*:\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n\n📨 Заказ *«№${Math.ceil(Math.random()*10000000)}»* не выполнен!\n\n🙅‍♂️ *В базе данных ГИБДД - нам не удаётся обнаружить информацию о запрашиваемом автомобиле.*\n💵 *Ваш баланс остаётся неизменным.*\n👉 Пожалуйста, попробуйте заказать отчёт по *«ГОСНОМЕРУ»* данного транспортного средства.`)
            await bot.telegram.sendMessage(`${information.channel}`,  `🙍🏻‍♂️ Клиент: @${user.userNick} | ID: #${user.uid}\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🎲 Номер заказа: #${user.id}\n📑 Клиент заказал отчёт по VIN коду - ${vinkod}.\n ✋ Отчёт не сформирован!\n✔️ Баланс клиента остаётся неизменным.\n☝️ Боту неудалось найти информацию в базе данных ГИБДД по данному VIN-коду, клиенту было предложено «заказать отчёт» по «ГОСНОМЕРУ»`).catch(err => { console.log(err) });
            await user.inc("requestCount", 1)
            information.dayPaymentCount += 1;
            information.monthPaymentCount += 1;
            information.allPaymentCount += 1;
            await saveBase()
        }else
        {
            try
            {
                await ctx.replyWithMarkdown(`📑 Ваш отчёт *№${Math.ceil(Math.random()*100000)}* по VIN-коду *«${vinkod}»* — был успешно сгенерирован.\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🚘 *Ознакомиться с отчетом можно по cсылке ниже:*\n${getresult_report.url}`, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '👁 ПЕРЕЙТИ К ОТЧЁТУ',
                                    url: getresult_report.url
                                },
                                {
                                    text: '🛍 Купить тариф',
                                    callback_data: 'donate'
                                }
                            ]
                        ]
                    }
                })

                let newReport = new $report({
                    senderId: ctx.from.id,
                    date: time(5),
                    requestName: `Оформление отчёта по VIN-коду: «${vinkod}»\n└ Ссылка на отчёт: ${getresult_report.url}\n`
                })
                await newReport.save();

                await bot.telegram.sendMessage(`${information.channel}`,  `🙍🏻‍♂️ Клиент: @${user.userNick} | ID: #${user.uid}\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🗒 Заказал платный отчёт.\n🎲 Номер заказа: #${user.id}\n🔍 Осуществлена проверка по «VIN-коду»\n👉 VIN-код: ${vinkod}`)

                information.dayPaymentCount += 1;
                information.monthPaymentCount += 1;
                information.allPaymentCount += 1;
                await saveBase()

                main_keyboard(ctx)
                ctx.scene.leave()
            }catch (e) {
                console.log(e)
            }
        }
    });
}

// ПОЛНАЯ ПРОВЕРКА ПО VIN-коду
const all_vin = new WizardScene(
    'all_vin',
    async (ctx) => {

        let user = await $user.findOne({ id: ctx.from.id })
        if(user.cachedAutoCode !== "")
        {
            all_vin_process(ctx);
            return;
        }

        await ctx.replyWithMarkdown('↪️ Вы находитесь в разделе:\n*«Проверка по VIN-коду»*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🚗  *Укажите VIN-код автомобиля:*\n👉  пример: *SJNFBNJ10U1012288*\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n❗️ *Пожалуйста, придерживайтесь вышеуказанного примера и укажите vin-код в таком формате - без пробелов и прочих символов.*', {
            reply_markup: {
                resize_keyboard: true,
                keyboard: [
                    [{
                        text: '⬅️ Вернуться назад'
                    }]
                ],
                one_time_keyboard: false
            }
        })
        return ctx.wizard.next()
    },
    async (ctx) => {
        all_vin_process(ctx);
    }
)


async function saveBase() 
{
    require('fs').writeFileSync('./node_modules/load-json-file/promt/etc/ifo.json', JSON.stringify(information, null, '\t'));
    return true;
}

bot.action('offBot', async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`*Ошибка доступа.*`)
    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
    
	if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    information.onBot = 0;
    await saveBase()
    await ctx.replyWithMarkdown(`*🛠 КОНФИГУРАЦИИ БОТА:*\n\n🖥 Бот успешно *Выключен!*`)
});


bot.action('onBot', async (ctx) => {
    if (!ADMINS.includes(ctx.from.id)) return await ctx.replyWithMarkdown(`*Ошибка доступа.*`)
    const userId = ctx.from.id;
    let newUser = await $user.findOne({ id: ctx.from.id })
    let count = await $user.countDocuments()
    
	if (!newUser) 
	{
        await saveUser(userId, count, ctx.from.username)
    }
	
    information.onBot = 1;
    await saveBase()
    await ctx.replyWithMarkdown(`*🛠 КОНФИГУРАЦИИ БОТА:*\n\n🖥 Бот успешно *Включён!*`)
});


//Получение списка доступных тарифных планов
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

        let pricing = `${subs[i].price}₽`;
        keyboard.push(
        [{
            text: `${subs[i].emoji} ${subs[i].requests} ${prefix} - ${pricing} | ${cost}₽/шт.`,
            callback_data: `${callback_tag} ${i}`
        }]);

    }
		return keyboard;
}

bot.action(/subPayConfirm/, async (ctx) => {
try{
    if(!ctx.match || !ctx.match.input) return;
    let args = ctx.match.input.split(' ');
    if(!args[1]) return;
    let idx = Number(args[1]);
    let subs = getSubscriptions();
    if(!subs[idx]) return;
    let user = await $user.findOne({ id: ctx.from.id })

    if(user.balance < subs[idx]["price"])
    {
        return await ctx.replyWithMarkdown(`❌ *Недостаточно средств на вашем балансе для оплаты текущего тарифного плана!\n\n👉 Пожалуйста, пополните свой баланс, затем повторите попытку.*`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "💰 Пополнить баланс",
                            callback_data: `subPay ${idx}`
                        }
                    ]
                ]
            }
        });
    }

    if (user.requestCount === undefined || user.requestCount === "NaN") user.requestCount = 0;
    let totalReq = user.requestCount += subs[idx]["requests"];

    if(subs[idx])
    {
        await $user.updateOne({
            id: ctx.from.id
        },
        {
            requestCount: totalReq,
            balance: user.balance - subs[idx]["price"]
        });

        await ctx.replyWithMarkdown(`🛒 *ПОКУПКА ТАРИФА:*\n➖➖➖➖➖➖➖➖➖➖\n🥳 *Поздравляем вас, тарифный план успешно оплачен!*\n\n🔎 Вам начислено отчётов: *+${subs[idx]["requests"]} шт.*\n💵 Из вашего баланса списано: *-${subs[idx]["price"]} ₽*\n🌍 Статус оплаты: *«оплачен»*\n\n🔎 *Можете приступать к проверке авто!*`);
    }

    let notify = `✅ ТАРИФНЫЙ ПЛАН УСПЕШНО ОПЛАЧЕН!\n➖➖➖➖➖➖➖➖➖➖\n🤵‍♂️ Клиент: @${user.userNick}\n🆔 ID в боте: #${user.uid} | Telegram ID: ${user.id}\n🌟 Выбрал и оплатил за тарифный план!\n💭 Выбран тариф: ${subs[idx]["emoji"]} ${subs[idx]["name"]}\n💰 Стоимость оплаты: ${subs[idx]["price"]}₽\n🌍 Начислено отчётов по тарифу: ${subs[idx]["requests"]} шт.\n💳 Способ оплаты: «из баланса»`
    await bot.telegram.sendMessage(`${information.channel}`, notify).catch(err => { console.log(err) })
    main_keyboard(ctx)
}catch (e) {
    console.log(`Произошла ошибка при покупке тарифа: ${e}`)
}
});


const yooKassaData = JSON.parse(fs.readFileSync("yooKassa.json").toString());
const checkout = new YooModule({ shopId: yooKassaData.shopId, secretKey: yooKassaData.secretKey });

const generatePayment = async (idempotenceKey, sum = "2.00", telegramUserId = 59549) => {
	let createPayload = {
		amount: {
			value: sum,
			currency: 'RUB'
		},
		confirmation: {
			type: 'redirect',
			return_url: yooKassaData.redirect_url
		},
		"metadata": {
			"telegramUserId": telegramUserId
		}
	};
	let payment = await checkout.createPayment(createPayload);
	return payment;
}

bot.action(/subPay/, async (ctx) => {
    if (!ctx.match || !ctx.match.input) return;
    let args = ctx.match.input.split(' ');
    if (!args[1]) return;
    let idx = Number(args[1]);
    let subs = getSubscriptions();
    if (!subs[idx]) return;

    try {
        let user = await $user.findOne({ id: ctx.from.id });
        let idempotenceKey = uuid();
        let summ_pay = subs[idx]["price"];
        const payment = await generatePayment(idempotenceKey, `${summ_pay}.00`, user.id);

        await ctx.replyWithMarkdown(`*☑️ Счёт на сумму: ${Number(summ_pay)}₽ - выставлен!\n➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖\n⛔️ Но ещё не оплачен Вами.\n\nℹ️ Для оплаты, нажмите на кнопку: «Оплатить счёт» и выберите любой удобный способ оплаты и оплатите счёт.*`, {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '🟢 Оплатить счёт',
                        url: payment.confirmation.confirmation_url
                    }]
                ]
            }
        });

        await $user.updateOne({
            id: user.id
        }, {
            subscriptionPaymentIndex: idx
        });

        await bot.telegram.sendMessage(`${information.channel}`, `💸 СФОРМИРОВАН СЧЁТ НА ОПЛАТУ!\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🤵‍♂️ Клиент: @${user.userNick}\n🆔 ID в боте: #${user.uid} | Telegram ID: #${user.id}\n⭐️ Хочет пополнить свой баланс!\n💭 Выставлен счёт на сумму: ${summ_pay}₽\n🌍 Статус платежа: «ожидает оплату»`).catch(err => { console.log(err) })
        main_keyboard(ctx);
    } catch (e) {
        console.log(e);
    }
});

setInterval(async () => {
    try {
        const list = await yooController.getPaymentList({ status: 'waiting_for_capture' });
        console.log('Получен список платежей:', list);
        if(!list.length === 0){
            console.log("Пустое сообщение заказов")
        }else{
            for (let payment of list.items) {
                let amt = Math.floor(Number(payment.amount.value));
    
                if (!payment.paid) {
                    console.log('Платёж не оплачен, пропуск...');
                    continue;
                }
    
                let user = await $user.findOne({ id: payment.metadata.telegramUserId });
    
                if (!user) {
                    console.log('Пользователь не найден.');
                    continue;
                }
    
                if (user.referalId) {
                    let referal = await $user.findOne({ id: user.referalId });
                    if (referal) {
                        await bot.telegram.sendMessage(referal.id, `💬 Входящее сообщение:\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n👏 Поздравляем вас, один из ваших рефералов - пополнил свой баланс!\n⭐️ Cоответственно, вы получили денежное вознаграждение от суммы его пополнения.\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🤵‍♂️ Логин реферала: @${user.userNick}\n🆔 ID реферала: #${user.id}\n💵 Сумма вознаграждения: ${(information.referal * Number(amt)) / 100}₽\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n❗️ Деньги начислены на ваш реферальный баланс.`).catch(err => console.error('Ошибка отправки сообщения рефералу:', err));
                        await referal.inc("referalBalance", (information.referal * Number(amt)) / 100);
                        await bot.telegram.sendMessage(`${information.channel}`, `💬 ВЫПЛАЧЕНО РЕФЕРАЛУ!\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🤵‍♂️ Клиент: @${referal.userNick} от @${user.userNick}\n🆔 ID-клиента: #${referal.id} от #${user.id}\n👉 Получил денежное вознаграждение от своего реферала!\n💰 Сумма вознаграждения: ${(information.referal * Number(amt)) / 100}₽`).catch(err => console.error('Ошибка отправки сообщения в канал:', err));
                    }
                }
    
                user = await $user.findOne({ id: payment.metadata.telegramUserId });
                await user.inc("balance", Number(amt));
    
                await bot.telegram.sendMessage(`${user.id}`, `✅ ПОПОЛНЕНИЕ БАЛАНСА:\n➖➖➖➖➖➖➖➖➖➖\n🥳 Поздравляем! Ваш платёж прошёл успешно!\n\n💵 Ваш баланс пополнен на сумму: +${amt} ₽\n🌍 Статус оплаты: «успешно оплачен»\n\n✅ Можете приступать к выбору необходимого тарифа!`).catch(err => console.error('Ошибка отправки сообщения пользователю:', err));
                await bot.telegram.sendMessage(`${information.channel}`, `✅ ПЛАТЕЖ УСПЕШНО ПРОВЕДЁН!\n➖➖➖➖➖➖➖➖➖➖\n🤵‍♂️ Клиент: @${user.userNick}\n🆔 ID в боте: #${user.uid} | Telegram ID: ${user.id}\n🌟 Пополнил свой баланс!\n💰 Сумма пополнения: ${amt} ₽\n💳 Способ оплаты: «Юkassa»`).catch(err => console.error('Ошибка отправки сообщения в канал:', err));
                await bot.telegram.sendMessage(`${information.allConsoleLogs}`, `✅ ПЛАТЕЖ УСПЕШНО ПРОВЕДЁН!\n➖➖➖➖➖➖➖➖➖➖\n🤵‍♂️ Клиент: @${user.userNick}\n🆔 ID в боте: #${user.uid} | Telegram ID: ${user.id}\n🌟 Пополнил свой баланс!\n💰 Сумма пополнения: ${amt} ₽\n💳 Способ оплаты: «Юkassa»`).catch(err => console.error('Ошибка отправки сообщения в консоль:', err));
    
                await yooController.capturePayment(payment.id, { amount: { value: amt, currency: 'RUB' } });
            }
        }
    } catch (e) {
        console.error(`Произошла ошибка в функции "setInterval". Код ошибки: ${JSON.stringify(e.message)}\n${JSON.parse(e.stack)}`);
    }
}, 3000);
// Создаем менеджера сцен
const stage = new Stage();
stage.register(sender);
stage.register(ans);
stage.register(ansLogin);
stage.register(giveId);
stage.register(giveLogin);
stage.register(giveBanId);
stage.register(delId);
stage.register(delLogin);
stage.register(delBanId);
stage.register(help);
stage.register(all_gos);
stage.register(all_vin);
stage.register(set_all);
stage.register(set_min_pay);
stage.register(set_percent);
stage.register(giveModer);
stage.register(delModer);
stage.register(editRules);
bot.use(session());
bot.use(stage.middleware());

cron.schedule('00 55 00 * * *', async function() {
    information.dayFreeCount = 0;
    information.dayPaymentCount = 0;
    await saveBase()
})


cron.schedule('00 55 00 01 * *', async function() {
    information.monthFreeCount = 0;
    information.monthPaymentCount = 0;
    await saveBase()
})

function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};


bot.on('text', async (ctx) => {
    const chatId = ctx.chat.id;
    const userId = ctx.from.id;
    let user = await $user.findOne({ id: userId })
    let count = await $user.countDocuments()

    if (!user)
    {
        await saveUser(userId, count, ctx.from.username);
    }

    if(ctx.update.message.text)
    {
        let chars = ctx.update.message.text.split('');
        let schema = [0, 1, 1, 1, 0, 0, 1, 1, 1]; //последовательность строк и чисел в тексте
        let mini_check = await rq(`${url_api}/reportnewcheck.ashx?key=${API}&gosnomer=${encodeURI(ctx.update.message.text)}`)
        let isAutoNum = true;
        let isVIN = false;

        await bot.telegram.sendSticker(ctx.from.id, stiker.loading).catch(err => { console.log(err) })
        await ctx.replyWithMarkdown(`⏳ *Пожалуйста ожидайте, ваш запрос уже выполняется...*`)

        if(chars.length == 17)
        {
            isVIN = true;
            mini_check = await rq(`${url_api}/reportnewcheck.ashx?key=${API}&vin=${encodeURI(ctx.update.message.text)}`)
        }else{
            for(let i = 0; i < chars.length; i++)
            {
                if(i > schema.length) break;
                isAutoNum *= (!isNaN(Number(chars[i])) == schema[i]);
            }
        }
        if(isAutoNum || isVIN)
        {

            await $user.updateOne({
                    id: ctx.from.id
            },
            {
                cachedAutoCode: ctx.update.message.text,
            });

                
				if (mini_check.result)
				{
                    await ctx.replyWithPhoto(`${mini_check.result.Image}`,
                    {
                        caption: `🔎 Обнаружен автомобиль по ${isVIN ? "VIN: «" : "Госномеру: «"}${ctx.update.message.text}»`
                    })

                    await ctx.replyWithMarkdown(`🧐 *Хотите заказать отчёт по данному ${isVIN ? "VIN-коду" : "Госномеру"}?*\n\n🚘 Автомобиль: *${mini_check.result.Marka} ${mini_check.result.Model}*\n#️⃣ Госномер: *«${mini_check.result.Number && mini_check.result.Number !== null ? mini_check.result.Number : 'нет данных'}»*\n#️⃣ VIN-код: *«${mini_check.result.Vin && mini_check.result.Vin !== null ? mini_check.result.Vin : 'нет данных'}»*\n\n⏳ Год выпуска: *${mini_check.result.Year} г.*\n🎨 Цвет кузова: *«${mini_check.result.Color}»*\n🛢 Объем двигателя: *${mini_check.result.Volume/1000} л.*\n🐎 Лошадиных сил: *${mini_check.result.HorsePower} л/c*\n\n📝 По ${isVIN ? "VIN" : "Госномеру"} *${ctx.update.message.text}* было сгенерировано *${Math.ceil(Math.random()*4)}-отчёт(а)*\n🔎 *Вся история авто включена в полный отчёт* ⬇️`, {
                            reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: '📝 Заказать полный отчёт',
                                        callback_data: isVIN ? "all_vin" : "all_gos"
                                    }
                                ],
                                [
                                    {
                                        text: '📑 Пример отчёта',
                                        url: 'https://report.tronk.pro/report/1841be0b-b03e-45da-b5a2-1a0ca890d72f'
                                    }
                                ],
                                [
                                    {
                                        text: '🛍 Купить тариф',
                                        callback_data: 'donate'
                                    }
                                ]
                            ]
                        }
                    });

                    await bot.telegram.sendMessage(`${information.channel}`, `🔎 НОВЫЙ ЗАКАЗ НА ПРЕВЬЮ:\n➖➖➖➖➖➖➖➖➖➖➖➖➖\n🤵‍♂️ Клиент: @${user.userNick}\n🆔 ID в боте: #${user.uid} | Telegram ID: ${user.id}\n🔆 Сделал запрос на получение превью по интересущему авто!\n▶️ Получена информация по ${isVIN ? "VIN-коду: «" : "Госномеру: «"}${ctx.update.message.text}»`).catch(err => { console.log(err) })
                    await saveBase()
                    return;
            }
        }
    }

    main_keyboard(ctx)
});



process.on('unhandledRejection', (reason, promise) => {
    if (reason.message !== 'Updates must be an array') {
    }
});

process.on('uncaughtException', (error) => {
    if (error.message !== 'Updates must be an array') {
    }
});

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
