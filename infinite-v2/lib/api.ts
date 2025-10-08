// API service for fetching articles from Lambda backend

export interface Article {
  id: string;
  title: string;
  slug: string;
  perex: string;
  category: string;
  publishedAt: string;
  originalDate: string;
  author: string;
  readingTime: string;
  imageUrl?: string;
  metaTitle: string;
  metaDescription: string;
  type: string;
}

export interface ArticleDetail extends Article {
  content: { title: string; content: string }[]; // Sections from AI generator
  sections?: { title: string; content: string }[]; // Alias for content
  faq: { question: string; answer: string }[];
  images?: {
    og?: string;
    hero?: string;
    card?: string;
    thumb?: string;
  };
  keywords?: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jqg44jstd1.execute-api.eu-central-1.amazonaws.com/dev';

export class ArticlesAPI {
  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  static async getLatestArticles(limit: number = 10): Promise<Article[]> {
    try {
      const response = await this.makeRequest(`/articles/latest?limit=${limit}`);
      return response.articles || [];
    } catch (error) {
      console.error('Error fetching latest articles:', error);
      return [];
    }
  }

  static async getAllArticles(limit: number = 20, lastKey?: string): Promise<{
    articles: Article[];
    lastKey?: string;
    count: number;
  }> {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (lastKey) {
        params.append('lastKey', lastKey);
      }
      
      const response = await this.makeRequest(`/articles?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching all articles:', error);
      return { articles: [], count: 0 };
    }
  }

  static async getArticleById(id: string): Promise<ArticleDetail | null> {
    try {
      const response = await this.makeRequest(`/articles/${id}`);
      return response.article || null;
    } catch (error) {
      console.error('Error fetching article:', error);
      return null;
    }
  }

  static async getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
    // For now, we'll need to implement this by fetching all articles and finding by slug
    // In a real implementation, you'd want a dedicated endpoint for this
    try {
      const { articles } = await this.getAllArticles(100); // Get more articles to search through
      const article = articles.find(a => a.slug === slug);
      
      if (article) {
        return await this.getArticleById(article.id);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching article by slug:', error);
      return null;
    }
  }
}

// For development/testing, we can use mock data when API is not available
export const getMockArticles = (): Article[] => {
  return [
    {
      id: 'mock-1',
      title: 'Krabia hmlovina: Výbuch hviezdy z pohľadu Hubblea',
      slug: 'krabia-hmlovina-vybuch-hviezdy-z-pohladu-hubblea',
      perex: 'Krabia hmlovina je jedným z najfascinujúcejších objektov na oblohe. Pozostatok supernovy z roku 1054, ktorého komplexná štruktúra a energetický pulsar fascinujú vedcov po celom svete.',
      category: 'objav-dna',
      publishedAt: '2025-10-07T20:13:46.334Z',
      author: 'Infinite AI',
      readingTime: '6 minút',
      metaTitle: 'Krabia hmlovina: Tajomstvá supernovy odhalené',
      metaDescription: 'Preskúmajte fascinujúci svet Krabej hmloviny, pozostatok supernovy z roku 1054.',
      type: 'discovery'
    },
    {
      id: 'mock-2',
      title: 'Veil Nebula: Mystický Pozostatok Explodujúcej Hviezdy',
      slug: 'veil-nebula-mysticky-pozostatok-explodujucej-hviezdy',
      perex: 'Pred desiatimi tisícročiami sa na nočnej oblohe objavilo nové svetlo, ktoré zmizlo po niekoľkých týždňoch. Dnes vieme, že to bolo svetlo supernovy.',
      category: 'objav-dna',
      publishedAt: '2025-10-07T20:13:59.368Z',
      author: 'Infinite AI',
      readingTime: '5 minút',
      metaTitle: 'Záhadná Veil Nebula: Poklady nočnej oblohy',
      metaDescription: 'Objavte tajomstvá Veil Nebula, pozostatku supernovy, ktorá fascinuje astronómov už tisíce rokov.',
      type: 'discovery'
    }
  ];
};
