import type { ReviewResult } from '../types/index';

export const MOCK_REVIEW_RESULT: ReviewResult = {
  summary:
    'O código está funcional, mas pode melhorar em legibilidade e boas práticas.',
  positives: [
    {
      title: 'Código funcional',
      explanation: 'O trecho executa sem erros e cumpre o objetivo básico.',
    },
    {
      title: 'Simplicidade',
      explanation: 'A lógica é direta e fácil de acompanhar.',
    },
  ],
  issues: [
    {
      severity: 'medium',
      category: 'quality',
      title: 'Falta de tipagem explícita',
      explanation:
        'Variáveis sem tipo explícito dificultam manutenção em projetos maiores.',
      recommendation:
        'Adicione tipos explícitos às variáveis e parâmetros de função.',
      diff: '- const count = 0;\n+ const count: number = 0;\n- function process(data) {\n+ function process(data: string): void {',
    },
    {
      severity: 'low',
      category: 'quality',
      title: 'Nome de variável pouco descritivo',
      explanation:
        "Nomes como 'x' ou 'tmp' não comunicam a intenção do código.",
      recommendation:
        'Use nomes descritivos que indiquem o propósito da variável.',
      diff: '- const x = getData();\n- const tmp = transform(x);\n+ const userData = getData();\n+ const formattedUser = transform(userData);',
    },
    {
      severity: 'high',
      category: 'security',
      title: 'Input não sanitizado',
      explanation:
        'Dados de entrada devem ser validados antes de processamento.',
      recommendation:
        'Valide e sanitize inputs usando uma biblioteca apropriada.',
      diff: '- const query = req.body.query;\n- db.execute(query);\n+ const query = sanitize(req.body.query);\n+ db.execute(preparedStatement, [query]);',
    },
  ],
  suggestions: [
    'Considere adicionar tratamento de erros com try/catch.',
    'Extraia lógica repetida para funções auxiliares.',
    'Adicione comentários para trechos não óbvios.',
  ],
  questions: [
    'Este código será usado em produção ou é um protótipo?',
    'Há testes automatizados cobrindo essa funcionalidade?',
  ],
  overallScore: 6,
};
