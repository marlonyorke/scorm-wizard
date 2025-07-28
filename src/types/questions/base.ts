export interface BaseQuestionData {
  id: string;
  type: string;
  name: string;
  text: string;
  feedback?: string;
  mediaUrl?: string;
  imageSize?: {
    width: number;
    height: number;
  };
  question?: string;
}