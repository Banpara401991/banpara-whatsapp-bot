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

  const body = req.body;

  try {

    const value = body.entry[0].changes[0].value;

    // Ignora eventos de status
    if (value.statuses) {
      return res.sendStatus(200);
    }

    const message = value.messages?.[0];

    // Se não existir mensagem, encerra
    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from;
      
    //Captura o nome do cliente 
    const nomeCompleto =
    body.entry[0].changes[0].value.contacts?.[0]?.profile?.name || 'Cliente';

    const primeiroNome = nomeCompleto.split(' ')[0];

    // Ignora mensagens enviadas pelo próprio bot
    if (from === PHONE_NUMBER_ID) {
      return res.sendStatus(200);
    }

    console.log('Mensagem recebida de:', from);
    
      
    //O ATENDENTE RECEBE A MENSAGEM DO CLIENTE
   const textoCliente = message.text?.body || 'Mensagem não textual';
    console.log('Cliente:', nomeCompleto);
    console.log('Número cliente:', from);
    console.log('Texto:', textoCliente);

    console.log('Tentando encaminhar para atendente...');

const respostaAtendente = await axios.post(
    `https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`,
    {
        messaging_product: 'whatsapp',
        to: '5594991591220',
        type: 'text',
        text: {
               body:
               '📢 Novo atendimento solicitado\n\n' +
                '👤 Cliente: ' + nomeCompleto + '\n' +
                '📞 Número: +' + from + '\n\n' +
               '💬 Mensagem:\n' +
                textoCliente
        }
    },
    {
        headers: {
            Authorization: `Bearer ${META_TOKEN}`,
            'Content-Type': 'application/json'
        }
    }
);

console.log('ATENDENTE OK:');
console.log('Número configurado:', '5594991591220');
console.log('Número reconhecido pela Meta:', respostaAtendente.data.contacts?.[0]?.wa_id);
console.log(JSON.stringify(respostaAtendente.data, null, 2));
          await axios.post(
    `https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`,
    {
        messaging_product: 'whatsapp',
        to: from,
        type: 'text',
        text: {
            body:
              //  'Olá! 👋\n\n' +
                `Olá, ${primeiroNome}! 👋\n\n` +
                'Recebemos sua mensagem com sucesso.\n\n' +
                '🕘 Horário de atendimento:\n' +
                'Segunda a Sexta-feira, exceto feriados\n' +
                '10:00h às 15:00h\n\n' +
                '📞 Agência Banpará Xinguara:\n' +
                '+55 94 98402-8241\n\n' +
                '🌐 https://www.banpara.b.br\n\n' +
                'Em breve nossa equipe entrará em contato para dar continuidade ao seu atendimento.\n\n' +
                'Obrigado pelo contato. 💙'
        }
    },
    {
        headers: {
            Authorization: `Bearer ${META_TOKEN}`,
            'Content-Type': 'application/json'
        }
    }
);

res.sendStatus(200);

    } catch (error) {

    console.log('ERRO COMPLETO');

    if (error.response) {
        console.log(JSON.stringify(error.response.data, null, 2));
    } else {
        console.log(error.message);
    }

    res.sendStatus(500);
}
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
   console.log(`Servidor rodando na porta ${PORT}`);
});
