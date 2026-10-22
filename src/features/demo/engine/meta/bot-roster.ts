import type { BotPersona } from '../poker/bot-brain';

/** Look of a bot avatar at the 3D table. */
export type AvatarStyle = {
  body: string;
  skin: string;
  accent: string;
  accessory: 'tophat' | 'shades' | 'crown' | 'headphones' | 'beanie' | 'visor';
};

export type BotProfile = {
  id: string;
  name: string;
  /** Rank points shown on the local leaderboard; evolves as you play them. */
  rp: number;
  persona: BotPersona;
  avatar: AvatarStyle;
  /** Lines the bot says in match chat, keyed by moment. */
  lines: Record<'win' | 'bigWin' | 'allin' | 'fold' | 'greet' | 'reply', string[]>;
};

/** Every opponent is a local bot; the UI always tags them "Bot". */
export const BOT_ROSTER: BotProfile[] = [
  {
    id: 'bot-ba-khia',
    name: 'Ba Khía',
    rp: 1240,
    persona: { tightness: 0.35, aggression: 0.8, bluff: 0.7 },
    avatar: { body: '#b0129b', skin: '#f2c6a8', accent: '#e5c457', accessory: 'tophat' },
    lines: {
      win: ['Ăn rồi nha!', 'Dễ như ăn bánh.'],
      bigWin: ['Pot to quá trời, cảm ơn cả bàn!', 'Hôm nay vận đỏ ghê.'],
      allin: ['Tất tay luôn, ai dám theo?', 'Chơi lớn mới vui.'],
      fold: ['Thôi, nhường đó.', 'Bài xấu quá.'],
      greet: ['Chào cả bàn, chơi đẹp nha.'],
      reply: ['Bình tĩnh, ván sau tính tiếp.', 'Nói ít thôi, đánh đi!'],
    },
  },
  {
    id: 'bot-co-tu',
    name: 'Cô Tư',
    rp: 1385,
    persona: { tightness: 0.75, aggression: 0.45, bluff: 0.15 },
    avatar: { body: '#6c2399', skin: '#f6d2bd', accent: '#fface7', accessory: 'shades' },
    lines: {
      win: ['Kiên nhẫn là có quả.', 'Đúng như tính toán.'],
      bigWin: ['Chờ cả buổi mới được ván này.'],
      allin: ['Tôi chắc bài rồi.'],
      fold: ['Không đáng để theo.'],
      greet: ['Xin chào, chúc mọi người may mắn.'],
      reply: ['Ừ, cứ từ từ.', 'Tập trung vào bài nào.'],
    },
  },
  {
    id: 'bot-bay-cha',
    name: 'Bảy Chà',
    rp: 1105,
    persona: { tightness: 0.2, aggression: 0.6, bluff: 0.5 },
    avatar: { body: '#433255', skin: '#d9a98a', accent: '#34d399', accessory: 'headphones' },
    lines: {
      win: ['Hên thôi mà.', 'Úi, trúng rồi!'],
      bigWin: ['Tấm vé số trúng độc đắc!'],
      allin: ['Liều ăn nhiều!'],
      fold: ['Lần này bỏ.'],
      greet: ['Yo cả nhà!'],
      reply: ['Haha chuẩn luôn.', 'Ok ok.'],
    },
  },
  {
    id: 'bot-ut-li',
    name: 'Út Lì',
    rp: 1310,
    persona: { tightness: 0.55, aggression: 0.75, bluff: 0.4 },
    avatar: { body: '#741968', skin: '#efc2a2', accent: '#e5b5ff', accessory: 'beanie' },
    lines: {
      win: ['Lì là thắng.', 'Đã bảo rồi mà.'],
      bigWin: ['Lì tới cùng mới ngon!'],
      allin: ['Không lùi bước!'],
      fold: ['Tạm lùi một bước.'],
      greet: ['Út Lì tới đây.'],
      reply: ['Cứ đánh rồi biết.', 'Nói gì cũng được, bài mới quan trọng.'],
    },
  },
  {
    id: 'bot-sau-song',
    name: 'Sáu Sòng',
    rp: 1460,
    persona: { tightness: 0.6, aggression: 0.6, bluff: 0.3 },
    avatar: { body: '#28183a', skin: '#e8b897', accent: '#e5c457', accessory: 'crown' },
    lines: {
      win: ['Kinh nghiệm cả đấy.', 'Vững tay.'],
      bigWin: ['Vua của bàn này là ai nhỉ?'],
      allin: ['Đến lúc rồi.'],
      fold: ['Bỏ bài, chờ cơ hội.'],
      greet: ['Ngồi xuống đi, bàn đang nóng.'],
      reply: ['Ván này để xem ai giỏi hơn.', 'Hừm.'],
    },
  },
  {
    id: 'bot-nam-lua',
    name: 'Năm Lửa',
    rp: 1020,
    persona: { tightness: 0.3, aggression: 0.9, bluff: 0.8 },
    avatar: { body: '#93000a', skin: '#f0c0a0', accent: '#ffb4ab', accessory: 'visor' },
    lines: {
      win: ['Nóng tay quá!', 'Cháy bàn!'],
      bigWin: ['Lửa bùng lên rồi!'],
      allin: ['ALL-IN! Cháy hết mình!'],
      fold: ['Hạ nhiệt chút.'],
      greet: ['Ai sẵn sàng cháy nào?'],
      reply: ['Đánh mạnh lên!', 'Chậm quá đó.'],
    },
  },
  {
    id: 'bot-hai-meo',
    name: 'Hai Mèo',
    rp: 1190,
    persona: { tightness: 0.65, aggression: 0.3, bluff: 0.2 },
    avatar: { body: '#3e2d51', skin: '#f3cdb3', accent: '#dabfcf', accessory: 'beanie' },
    lines: {
      win: ['Meo, ăn nhẹ thôi.', 'Nhẹ nhàng mà chắc.'],
      bigWin: ['Mèo nhỏ mà ăn lớn!'],
      allin: ['Lần này chắc ăn.'],
      fold: ['Meo, bỏ.'],
      greet: ['Meo meo, chào cả bàn.'],
      reply: ['Meo?', 'Hihi.'],
    },
  },
];

export function findBot(id: string): BotProfile | undefined {
  return BOT_ROSTER.find((b) => b.id === id);
}
