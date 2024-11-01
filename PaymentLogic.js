import { yooController } from "./index.js";
import { $payment, $user } from "./mongoose.js";
import information from './ifo.json' with {type: "json"}

export class Payment {
    constructor() { }

    async updatePaymentStatus(paymentId, status) {
        try {
            const result = await $payment.updateOne(
                { paymentId: paymentId },
                { $set: { status: status } }
            );
            console.log('Update Result:', result);
            return result;
        } catch (error) {
            console.error('Update Error:', error);
            throw error;
        }
    }


    isPaymentRecent(createdAt) {
        const tenMinutes = 10 * 60 * 1000;
        const paymentDate = new Date(createdAt).getTime();
        const now = Date.now();
        return now - paymentDate <= tenMinutes;
    }

    async insertPayment(paymentData) {
        const { paymentId, userId, paymentDate, amount, paymentMethod, status, username } = paymentData;
        return new Promise(async (resolve, reject) => {
            try {
                const result = await $payment.updateOne(
                    { paymentId: paymentId },
                    {
                        $set: {
                            userId: userId,
                            paymentDate: paymentDate, // Здесь мы передаем paymentDate как строку
                            amount: amount,
                            paymentMethod: paymentMethod,
                            status: status,
                            username: username
                        }
                    },
                    { upsert: true }
                );
                console.log('Insert Payment Result:', result);
                resolve(result);
            } catch (error) {
                console.error('Insert Payment Error:', error);
                reject(error);
            }
        });
    }



    async updateUserBalance(chatId, amount) {
        try {
            // Проверка, является ли chatId числом
            if (isNaN(chatId)) {
                throw new Error(`Invalid chatId: ${chatId}`);
            }

            if (isNaN(amount)) {
                throw new Error(`Invalid amount: ${amount}`);
            }

            // Найдите пользователя в базе данных
            const user = await $user.findOne({ id: Number(chatId) });
            if (!user) {
                throw new Error(`User with chatId ${chatId} not found.`);
            }

            // Рассчитайте новый баланс
            const newBalance = (user.balance || 0) + Number(amount);

            // Обновите баланс пользователя
            const result = await $user.updateOne(
                { id: Number(chatId) },  // Приведение chatId к числу
                { $set: { balance: newBalance } }
            );

            console.log('Update Balance Result:', result); // Логирование результата
            return result;
        } catch (error) {
            throw "Ошибка при обновлении баланса пользователя: " + error;
        }
    }



    async topUpBalance(bot, chatId, payload, user) {
        const username = bot.from?.username || "unknown";

        try {
            const { amount, currency, paymentType, returnUrl } = payload;

            const result = await yooController.createPayment({
                amount,
                currency,
                paymentType,
                returnUrl
            });

            const paymentId = result.id;
            const createdAt = new Date(result.created_at);
            console.log(createdAt.toISOString().slice(0, 19).replace('T', ' ').replace('Z', " "));

            await bot.telegram.sendMessage(chatId, `*☑️ Счёт на сумму: ${Number(amount)}₽ - выставлен! Но ещё не оплачен.*`, {
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: '🟢 Оплатить счёт',
                            url: result.confirmation.confirmation_url
                        }]
                    ]
                },
                parse_mode: 'Markdown'
            });

            await this.insertPayment({
                paymentId,
                chatId,
                paymentDate: createdAt.toISOString().slice(0, 19).replace('T', ' ').replace('Z', " "),
                amount,
                paymentMethod: result.payment_method.type,
                status: result.status,
                username
            });


            let isCaptured = false;
            const checkPaymentStatus = async () => {
                try {
                    const paymentDetails = await yooController.getPayment(paymentId);
                    const currentTime = new Date();
                    const paymentTime = new Date(paymentDetails.created_at);
                    const timeDifference = (currentTime - paymentTime) / (1000 * 60);

                    if (timeDifference > 10) {
                        console.log('Payment is older than 10 minutes, skipping capture.');
                        await bot.telegram.sendMessage(chatId, "Вы просрочили платеж, попробуйте еще раз.");
                        clearInterval(statusInterval);
                        return;
                    }

                    if (paymentDetails.status === 'waiting_for_capture' && !isCaptured) {
                        const capturePayload = {
                            amount: {
                                value: amount,
                                currency: 'RUB'
                            }
                        };
                        await yooController.capturePayment(paymentId, capturePayload);
                        console.log(`Payment ${paymentId} successfully captured.`);
                        isCaptured = true;
                    }

                    const updatedPaymentDetails = await yooController.getPayment(paymentId);

                    if (updatedPaymentDetails.status === 'succeeded') {
                        await this.updatePaymentStatus(paymentId, 'succeeded');
                        await this.updateUserBalance(chatId, amount);
                        console.log("все гуд");
                        await bot.telegram.sendMessage(`${user.id}`, `✅ ПОПОЛНЕНИЕ БАЛАНСА:\n➖➖➖➖➖➖➖➖➖➖\n🥳 Поздравляем! Ваш платёж прошёл успешно!\n\n💵 Ваш баланс пополнен на сумму: +${amount} ₽\n🌍 Статус оплаты: «успешно оплачен»\n\n✅ Можете приступать к выбору необходимого тарифа!`).catch(err => console.error('Ошибка отправки сообщения пользователю:', err));
                        await bot.telegram.sendMessage(`${Number(information.channel)}`, `✅ ПЛАТЕЖ УСПЕШНО ПРОВЕДЁН!\n➖➖➖➖➖➖➖➖➖➖\n🤵‍♂️ Клиент: @${user.userNick}\n🆔 ID в боте: #${user.uid} | Telegram ID: ${user.id}\n🌟 Пополнил свой баланс!\n💰 Сумма пополнения: ${amount} ₽\n💳 Способ оплаты: «Юkassa»`).catch(err => console.error('Ошибка отправки сообщения в канал:', err));
                        await bot.telegram.sendMessage(`${Number(information.allConsoleLogs)}`, `✅ ПЛАТЕЖ УСПЕШНО ПРОВЕДЁН!\n➖➖➖➖➖➖➖➖➖➖\n🤵‍♂️ Клиент: @${user.userNick}\n🆔 ID в боте: #${user.uid} | Telegram ID: ${user.id}\n🌟 Пополнил свой баланс!\n💰 Сумма пополнения: ${amount} ₽\n💳 Способ оплаты: «Юkassa»`).catch(err => console.error('Ошибка отправки сообщения в консоль:', err));
                        clearInterval(statusInterval);
                    }
                } catch (error) {
                    console.error('Error checking payment status:', error);
                    await bot.telegram.sendMessage(chatId, "Ошибка при проверке статуса платежа.", {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "На главную", callback_data: "start" }]
                            ]
                        }
                    });
                }
            };

            const statusInterval = setInterval(checkPaymentStatus, 5000);
        } catch (error) {
            await bot.telegram.sendMessage(chatId, "Ошибка при пополнении баланса.", {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "На главную", callback_data: "start" }]
                    ]
                }
            });
            throw 'Error during top-up: ' + error;
        }
    }

}
