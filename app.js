require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('MongoDB connected!');
});

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});

const chatSchema = new mongoose.Schema({
  input: String,
  output: String,
  mode: String,
});

const Chat = mongoose.model('Chat', chatSchema);

app.post('/api/chat', async (req, res) => {
  const { text, mode } = req.body;

  // Call to OpenAI API
  const gpt3Response = await axios.post(
    'https://api.openai.com/v1/engines/text-davinci-002/completions',
    {
      prompt: text,
      max_tokens: 100,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  let response = gpt3Response.data.choices[0].text.trim();
  let chatRecord = {
    input: text,
    output: response,
    mode: mode,
  };

  if (mode === 'catgpt') {
    response = response.replace(/\b\w*ow\b/g, 'meeeeow');
    chatRecord.output = response;
  }

  if (mode === 'piratgpt') {
    response = 'Ahoy mate, ' + response.replace(/,/g, ', yarrrrr') + ', do ye understand..?';
    chatRecord.output = response;
  }

  // Save to MongoDB
  const chat = new Chat(chatRecord);
  await chat.save();

  res.json({ response: response });
});

app.get('/api/chat/history', async (req, res) => {
  const chats = await Chat.find().sort({ _id: -1 }).limit(10);
  res.json(chats);
});
