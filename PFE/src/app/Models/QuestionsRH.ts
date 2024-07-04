export interface QuestionsRH {
    id?: number; // Optional ID, as it might not be available until created
    categories: string;
    sousCategories: string;
    titre: string;
    descriptions: string;
    piecesJoint?: string; // Optional, depending on your backend requirements
    userId: number; // Assuming it's a number (user ID associated with the question)
  }
  