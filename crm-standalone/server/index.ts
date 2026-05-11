import express from 'express';
import cors from 'cors';
import { router } from './routes';
import { connectWhatsApp } from './whatsapp';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:4173', // vite preview
  ],
}));
app.use(express.json());
app.use('/api', router);

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor Solar Energy rodando na porta ${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api\n`);
});

// Inicia conexão com WhatsApp
connectWhatsApp().catch(console.error);
