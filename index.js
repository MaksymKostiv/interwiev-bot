require('dotenv').config();
const { Bot, Keyboard, InlineKeyboard, GrammyError, HttpError } = require('grammy');
const { getRandomQuestion, getCorrectAnswer } = require('./untils');

const bot = new Bot(process.env.BOT_API_KEY);

bot.command('start', async (ctx) => {
    const startKeyBoard = new Keyboard()
        .text('HTML')
        .text('CSS')
        .row()
        .text('JavaScript')
        .text('TS')
        .row()
        .text('Angular')
        .text('Architecture')
        .resized();

    await ctx.reply(
        'Привет! Я Frontend Bot Interview 🤖\n' +
        'Я помогу тебе подготовиться к собеседованию по Frontend'
    );

    await ctx.reply('Давайте выберем тему для опроса 👇', {
        reply_markup: startKeyBoard
    });
});

bot.hears(
    ['HTML', 'CSS', 'JavaScript', 'TS', 'Angular', 'Software Architecture'],
    async (ctx) => {
        const topic = ctx.message.text;
        const question = getRandomQuestion(topic);

        let inlineKeyboard;

        if (question.hasOptions) {
            const buttonRows = question.options.map((option) => {
                return [
                    InlineKeyboard.text(
                        option.text,
                        JSON.stringify({
                            type: `${topic}-option`,
                            isCorrect: option.isCorrect,
                            questionId: question.id
                        })
                    )
                ];
            });

            inlineKeyboard = InlineKeyboard.from(buttonRows);
        } else {
            inlineKeyboard = new InlineKeyboard().text(
                'Узнать ответ',
                JSON.stringify({
                    type: topic,
                    questionId: question.id
                })
            );
        }

        await ctx.reply(question.text, { reply_markup: inlineKeyboard });
    }
);

bot.on('callback_query:data', async (ctx) => {
    const callBackData = JSON.parse(ctx.callbackQuery.data);

    // 👉 кнопка "узнать ответ"
    if (!callBackData.type.includes('option')) {
        const answer = getCorrectAnswer(callBackData.type, callBackData.questionId);

        await ctx.reply(answer, {
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });

        await ctx.answerCallbackQuery();
        return;
    }

    // 👉 ответы с вариантами
    if (callBackData.isCorrect) {
        await ctx.reply('Верно 👍');
        await ctx.answerCallbackQuery();
        return;
    }

    const answer = getCorrectAnswer(
        callBackData.type.split('-')[0],
        callBackData.questionId
    );

    await ctx.reply(`Не верно ❌ Правильный ответ: ${answer}`);
    await ctx.answerCallbackQuery();
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;

    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }
});

bot.start();