import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// db.json이 없거나 비어 있으면 기본 구조로 초기 생성
if (!fs.existsSync(DB_FILE) || fs.statSync(DB_FILE).size === 0) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    customExtensions: [],
    fixedExtensions: []
  }, null, 2));
}

const adapter = new JSONFile(DB_FILE);
const db = new Low(adapter, {
  customExtensions: [],
  fixedExtensions: []
});

async function startServer() {
  await db.read();

  app.get('/extensions', async (req, res) => {
    await db.read();
    res.json({
      customExtensions: db.data.customExtensions,
      fixedExtensions: db.data.fixedExtensions
    });
  });

  app.post('/extensions', async (req, res) => {
    const { customExtensions, fixedExtensions } = req.body;
    db.data.customExtensions = customExtensions;
    db.data.fixedExtensions = fixedExtensions;
    await db.write();
    res.json({ message: '저장 완료' });
  });

  app.listen(3000, () => {
    console.log('✅ 서버 실행됨: http://localhost:3000');
  });
}

startServer();
