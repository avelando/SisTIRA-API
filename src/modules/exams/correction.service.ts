import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class CorrectionService {
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor(private readonly prisma: PrismaService) {
    this.client = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY!,
    });
    this.model = process.env.GEMINI_MODEL || 'text-bison-001';
  }

  async testConnection() {
    const prompt = `
  Questão: Explique o propósito e uso das tags semânticas introduzidas no HTML5 — como <header>, <nav>, <section>, <article> e <footer> — e discorra sobre por que elas são importantes para acessibilidade e SEO.

  Respostas-modelo:
  - ERRADA: As tags semânticas são apenas estilos diferentes de <div> e <span>. Elas não têm impacto nenhum na acessibilidade ou SEO; servem só para deixar o código “mais bonitinho”. Por exemplo, usar <header> ou <footer> não altera em nada como os buscadores ou leitores de tela vão interpretar a página.
  - MEDIAN: As tags semânticas (por exemplo, <header>, <nav>, <section>, <article>, <footer>) ajudam a organizar o conteúdo de forma mais clara do que <div>. Elas podem melhorar um pouco o SEO porque os motores de busca encontram mais fácil as seções principais. Também ajudam na acessibilidade, pois leitores de tela podem saltar entre seções. Porém, algumas vezes você poderia usar <div> e ainda assim funcionar quase do mesmo jeito.
  - CORRECT: As tags semânticas do HTML5 têm o objetivo de descrever o papel de cada bloco de conteúdo, em vez de serem meros contêineres genéricos.

<header>: define a seção de cabeçalho, normalmente contendo título, logo e barra de navegação principal.

<nav>: agrupa links de navegação que direcionam para seções internas ou outras páginas.

<section>: delimita um agrupamento temático de conteúdo; cada seção deve ter um título próprio.

<article>: representa conteúdo independente ou auto-contido, como posts de blog, notícias ou comentários.

<footer>: separa o rodapé da página ou de uma seção, abrigando informações de copyright, links de contato e informações legais.

Importância para acessibilidade: Leitores de tela utilizam o significado semântico para permitir que usuários com deficiência naveguem rapidamente por cabeçalhos, áreas de navegação e artigos. Por exemplo, podem pular diretamente para a <nav> ou para o <main>.

Importância para SEO: Motores de busca como Google analisam a estrutura semântica para identificar o conteúdo principal, hierarquia de títulos e relevância de seções. Isso resulta em indexação mais precisa e pode influenciar no ranking de busca.

Exemplo de uso:

html
Copiar
Editar
<body>
  <header>
    <h1>Meu Blog</h1>
    <nav>
      <ul>
        <li><a href="#sobre">Sobre</a></li>
        <li><a href="#artigos">Artigos</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section id="artigos">
      <article>
        <h2>Título do Artigo</h2>
        <p>Conteúdo do artigo...</p>
      </article>
    </section>
  </main>

  <footer>
    <p>© 2025 Meu Blog. Todos os direitos reservados.</p>
  </footer>
</body>

  Resposta do aluno:
  As tags semânticas do HTML5 ajudam a dar significado a cada parte da página, em vez de usar apenas <div>. Por exemplo:

<header> delimita o cabeçalho, onde ficam título e menu principal;

<nav> envolve links de navegação;

<main> marca o conteúdo principal da página;

<section> organiza blocos temáticos dentro do <main>;

<article> representa um conteúdo independente (post, notícia, etc.);

<footer> define o rodapé, com informações de contato, copyright ou links legais.

Ao usar essas tags, leitores de tela conseguem identificar “landmarks” e pular direto para as seções desejadas, o que melhora a acessibilidade. Além disso, motores de busca entendem melhor a hierarquia do conteúdo e acabam indexando títulos e seções de forma mais precisa, beneficiando o SEO.

  Por favor:
  1. Use as respostas-modelo para avaliar a resposta do aluno.
  2. Atribua nota entre 0.0 e 1.0 (incrementos de 0.1).
  3. Dê um feedback curto (até 2 sentenças).

  Retorne um JSON com "score" e "feedback", onde feedback é um retorno comentando sobre a questão (estando certa ou não).
  `.trim();

    try {
      const res = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          temperature: 0.0,
          maxOutputTokens: 2000,
        },
      });

      // certifica que chegou algum texto
      if (!res.text) {
        return { ok: false, error: 'nenhum texto retornado' };
      }

      // remove ```json e ``` caso existam e aparas espaços em branco
      const full = res.text.replace(/```json|```/g, '').trim();

      return {
        ok: true,
        response: full,    // aqui está o JSON completo que veio do modelo
      };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  }

  async gradeAnswer(answerId: string) {
    const ans = await this.prisma.examAnswer.findUnique({
      where: { id: answerId },
      include: { question: { include: { modelAnswers: true } } },
    });
    if (!ans) throw new NotFoundException('Resposta não encontrada');

    const q = ans.question;
    const models = q.modelAnswers.reduce((acc, ma) => {
      acc[ma.type] = ma.content;
      return acc;
    }, {} as Record<string, string>);

    const prompt = `
Questão: ${q.text}

Respostas-modelo:
- ERRADA: ${models.WRONG}
- MEDIAN: ${models.MEDIAN}
- CORRECT: ${models.CORRECT}

Resposta do aluno:
${ans.subjectiveText}

Por favor:
1. Atribua nota entre 0.0 e 1.0 (incrementos de 0.1).
2. Dê um feedback curto (até 2 frases).

Retorne um JSON com "score" e "feedback".
`.trim();

    try {
      const res = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          temperature: 0.0,
          maxOutputTokens: 200,
        },
      });

      if (!res.text) {
        throw new Error('nenhum texto retornado pelo modelo');
      }

      let parsed: { score: number; feedback: string };
      try {
        parsed = JSON.parse(res.text);
      } catch (e: any) {
        throw new Error(`Resposta não é JSON válido: ${e.message}`);
      }

      return this.prisma.examAnswer.update({
        where: { id: answerId },
        data: {
          score: parsed.score,
          feedback: parsed.feedback,
        },
      });
    } catch (e: any) {
      throw new InternalServerErrorException('Erro ao corrigir: ' + e.message);
    }
  }
}
