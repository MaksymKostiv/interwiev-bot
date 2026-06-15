const questions = require('./questions.json');

const normalizeTopic = (topic) =>
    topic.toLowerCase().replace(/\s/g, '');

const getRandomQuestion = (topic) => {
    const questionTopic = normalizeTopic(topic);

    const list = questions[questionTopic];
    if (!list || list.length === 0) {
        return null;
    }

    const randomQuestionIndex = Math.floor(Math.random() * list.length);

    return list[randomQuestionIndex];
};

const getCorrectAnswer = (topic, id) => {
    const questionTopic = normalizeTopic(topic);

    const list = questions[questionTopic];
    if (!list) return 'Тема не найдена';

    const question = list.find((q) => q.id === id);
    if (!question) return 'Вопрос не найден';

    if (!question.hasOptions) {
        return question.answer;
    }

    return question.options.find((option) => option.isCorrect)?.text;
};

module.exports = { getRandomQuestion, getCorrectAnswer };