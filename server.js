const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json());

const VERIFY_TOKEN = 'BANPARA_VERIFY';

const META_TOKEN = process.env.META_TOKEN;

const PHONE_NUMBER_ID = '1089244394278826';

app.get('/', (req, res) => {

```
const mode = req.query['hub.mode'];
const token = req.query['hub.verify_token'];
const challenge = req.query['hub.challenge'];

if (mode && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
}

res.sendStatus(403);
```

});

app.post('/', async (req, res) => {

```
try {

    const body = req.body;

    if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.messages
    ) {

        const numero =
            body.entry[0].changes[0].value.messages[0].from;

        await axios.post(
            'https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages',
            {
                messaging_product: 'whatsapp',
                to: numero,
                type: 'text',
                text: {
                    body:
                        'Olá! 👋\n\n' +
                        'Recebemos sua mensagem com sucesso.\n\n' +
                        'Para atendimento oficial da Agência Xinguara entre em contato através do número:\n\n' +
                        '📞 +55 94 984028241\n\n' +
                        '🌐 https://www.banpara.b.br\n\n' +
                        'Obrigado pelo contato.'
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${EAALsLm8hYIMBRSWKqHX3ZAVqyk7zaEBIOGJ51MvYAQxZC7vXBMJnufD375jX0eX3ac6NWy8FQNQZB0pHcaQCfQv8JJM2Yw5SunkCm8xufmlmk7dtftOpVsCIOO4tmKOsQYbXFdAlnRtuRdyeU21oVvmyZCqc6JFZAxk5Y9CtKSbT37z7EZCXUBnqpiTttyiR3ZB4IjXgwdicijSWxGL8ZBLfLabc7zGGhIFKcraz}`,
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
```

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log(`Servidor rodando na porta ${PORT}`);
});
