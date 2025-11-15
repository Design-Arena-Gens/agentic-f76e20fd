import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'alloy', format = 'mp3' } = await req.json();
    if (!text || typeof text !== 'string') {
      return new Response('Invalid text', { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      input: text,
      voice,
      format: format === 'wav' ? 'wav' : 'mp3',
    } as any);

    const arrayBuffer = await response.arrayBuffer();
    return new Response(arrayBuffer, {
      status: 200,
      headers: { 'Content-Type': format === 'wav' ? 'audio/wav' : 'audio/mpeg' },
    });
  } catch (err: any) {
    console.error(err);
    return new Response('TTS error', { status: 500 });
  }
}
