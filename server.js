const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json());

const VERIFY_TOKEN = 'BANPARA_VERIFY';

const META_TOKEN = process.env.META_TOKEN;

console.log('TOKEN:', META_TOKEN);

const PHONE_NUMBER_ID = '1089244394278826';

// VERIFICAÇÃO DO WEBHOOK
app.get('/webhook', (req, res) => {

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }

    res.sendStatus(403);
});

// RECEBER MENSAGENS
app.post('/webhook', async (req, res) => {

    try {

        const body = req.body;

        if (
            body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0].value.messages
        ) {

            const from =
                body.entry[0].changes[0].value.messages[0].from;

            console.log('Mensagem recebida de:', from);

            await axios.post(
                'https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages',
                {
                    messaging_product: 'whatsapp',
                    to: from,
                    type: 'text',
                    text: {
                        body:
                            'Obrigado pelo contato com o Banpará. Para atendimento oficial, fale conosco pelo número (91) 4000-0000.'
                    }
                },
                {
                    headers: {
                        Authorization: 'Bearer ${META_TOKEN}',
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        res.sendStatus(200);

    } catch (error) {

        console.log(error.response?.data || error.message);

        res.sendStatus(500);
    }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log('Servidor rodando na porta ${PORT}');
});
