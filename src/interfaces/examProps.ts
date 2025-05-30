export interface ExamForResponse {
  examId: string;
  title: string;
  description?: string;
  accessCode?: string;
  questions: Array<{
    id: string;
    text: string;
    questionType: 'OBJ' | 'SUB';
    alternatives?: { id: string; content: string }[];
    modelAnswers?: { type: 'WRONG' | 'MEDIAN' | 'CORRECT'; content: string }[];
  }>;
}
