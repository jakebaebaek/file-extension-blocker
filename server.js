// server.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();
const { MONGO_URI, PORT = 3000 } = process.env;

// __dirname 세팅
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// MongoDB 연결
await mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 스키마 / 모델 정의
const configSchema = new mongoose.Schema({
  fixedExtensions:  { type: [String], default: [] },
  customExtensions: { type: [String], default: [] },
});
const Config = mongoose.models.Config || mongoose.model('Config', configSchema);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 초기 문서가 없으면 하나 만들어 둡니다
let configDoc = await Config.findOne();
if (!configDoc) {
  configDoc = await Config.create({});
}

// GET: 현재 확장자 리스트
app.get('/extensions', async (req, res) => {
  // 항상 최신값 읽기
  configDoc = await Config.findOne();
  res.json({
    fixedExtensions:  configDoc.fixedExtensions,
    customExtensions: configDoc.customExtensions
  });
});

// POST: 확장자 업데이트
app.post('/extensions', async (req, res) => {
  const { fixedExtensions, customExtensions } = req.body;
  configDoc.fixedExtensions  = fixedExtensions;
  configDoc.customExtensions = customExtensions;
  await configDoc.save();
  res.json({ message: '저장 완료' });
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행: http://localhost:${PORT}`);
});
