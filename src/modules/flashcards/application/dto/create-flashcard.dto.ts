export class CreateFlashcardDto {
  id: string; // Or omit and generate inside service
  front: string;
  back: string;
  // Optional: tags?: string[]
}
