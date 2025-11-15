import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return new Response('No file uploaded', { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: file as any,
    } as any);

    return Response.json({ text: (transcription as any).text ?? '' });
  } catch (err) {
    console.error(err);
    return new Response('STT error', { status: 500 });
  }
}
