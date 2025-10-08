# Coding Standards - Infinite v1.0

## General Principles

### Code Quality
- **Clean Code**: Write self-documenting code with clear variable and function names
- **DRY Principle**: Don't Repeat Yourself - extract common functionality
- **SOLID Principles**: Follow Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **KISS Principle**: Keep It Simple, Stupid - prefer simple solutions over complex ones

### TypeScript Standards
- **Strict Mode**: Always use TypeScript strict mode
- **Type Safety**: Avoid `any` type, use proper type definitions
- **Interfaces**: Define clear interfaces for all data structures
- **Enums**: Use enums for constants and status values
- **Generics**: Use generics for reusable components and functions

### React/Next.js Standards
- **Functional Components**: Use functional components with hooks
- **Custom Hooks**: Extract reusable logic into custom hooks
- **Props Interface**: Define TypeScript interfaces for all component props
- **Error Boundaries**: Implement error boundaries for robust error handling
- **Performance**: Use React.memo, useMemo, useCallback for optimization

## File Organization

### Naming Conventions
```
// Files and Directories
components/          // React components
├── ui/             // Reusable UI components
├── forms/          // Form components
└── layout/         // Layout components

lib/                // Utility functions and configurations
├── utils.ts        // General utilities
├── api.ts          // API client functions
└── types.ts        // TypeScript type definitions

hooks/              // Custom React hooks
├── useApi.ts       // API-related hooks
└── useLocalStorage.ts // Local storage hooks

// File Naming
ArticleCard.tsx     // PascalCase for components
useApi.ts          // camelCase for hooks and utilities
article-card.css   // kebab-case for CSS files
```

### Import Organization
```typescript
// 1. React and Next.js imports
import React from 'react';
import { NextPage } from 'next';
import Image from 'next/image';

// 2. Third-party libraries
import { useState, useEffect } from 'react';
import { z } from 'zod';

// 3. Internal imports (absolute paths)
import { Button } from '@/components/ui/button';
import { Article } from '@/lib/types';
import { useApi } from '@/hooks/useApi';

// 4. Relative imports
import './ArticleCard.css';
```

## Code Style

### TypeScript
```typescript
// ✅ Good
interface ArticleProps {
  article: Article;
  onReadMore: (id: string) => void;
  className?: string;
}

const ArticleCard: React.FC<ArticleProps> = ({ 
  article, 
  onReadMore, 
  className = '' 
}) => {
  const handleClick = useCallback(() => {
    onReadMore(article.id);
  }, [article.id, onReadMore]);

  return (
    <div className={`article-card ${className}`}>
      <h3>{article.title}</h3>
      <p>{article.perex}</p>
      <Button onClick={handleClick}>Read More</Button>
    </div>
  );
};

// ❌ Bad
const ArticleCard = (props: any) => {
  return (
    <div>
      <h3>{props.article.title}</h3>
      <button onClick={() => props.onReadMore(props.article.id)}>
        Read More
      </button>
    </div>
  );
};
```

### React Components
```typescript
// ✅ Good - Functional component with proper typing
interface ArticleHeroProps {
  article: Article;
  isLoading?: boolean;
}

export const ArticleHero: React.FC<ArticleHeroProps> = ({ 
  article, 
  isLoading = false 
}) => {
  if (isLoading) {
    return <ArticleHeroSkeleton />;
  }

  return (
    <section className="article-hero">
      <Image
        src={article.imageUrl}
        alt={article.imageAlt}
        width={1200}
        height={630}
        priority
      />
      <div className="article-hero__content">
        <CategoryBadge category={article.category} />
        <h1>{article.title}</h1>
        <p className="article-hero__perex">{article.perex}</p>
        <time dateTime={article.date}>
          {formatDate(article.date)}
        </time>
      </div>
    </section>
  );
};

// ❌ Bad - Class component, no typing, inline styles
export class ArticleHero extends React.Component {
  render() {
    return (
      <div style={{ background: 'red' }}>
        <img src={this.props.article.imageUrl} />
        <h1>{this.props.article.title}</h1>
      </div>
    );
  }
}
```

### API Functions
```typescript
// ✅ Good - Proper error handling and typing
interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

export const fetchArticle = async (id: string): Promise<ApiResponse<Article>> => {
  try {
    const response = await fetch(`/api/articles/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    return {
      data: null as any,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500
    };
  }
};

// ❌ Bad - No error handling, no typing
export const fetchArticle = async (id) => {
  const response = await fetch(`/api/articles/${id}`);
  return response.json();
};
```

## Testing Standards

### Unit Tests
```typescript
// ✅ Good - Comprehensive test coverage
import { render, screen, fireEvent } from '@testing-library/react';
import { ArticleCard } from './ArticleCard';

describe('ArticleCard', () => {
  const mockArticle: Article = {
    id: 'test-article',
    title: 'Test Article',
    perex: 'Test description',
    imageUrl: '/test-image.jpg',
    date: '2024-12-01',
    category: 'discovery'
  };

  const mockOnReadMore = jest.fn();

  beforeEach(() => {
    mockOnReadMore.mockClear();
  });

  it('renders article information correctly', () => {
    render(<ArticleCard article={mockArticle} onReadMore={mockOnReadMore} />);
    
    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/test-image.jpg');
  });

  it('calls onReadMore when button is clicked', () => {
    render(<ArticleCard article={mockArticle} onReadMore={mockOnReadMore} />);
    
    fireEvent.click(screen.getByText('Read More'));
    
    expect(mockOnReadMore).toHaveBeenCalledWith('test-article');
  });

  it('applies custom className', () => {
    render(
      <ArticleCard 
        article={mockArticle} 
        onReadMore={mockOnReadMore}
        className="custom-class"
      />
    );
    
    expect(screen.getByRole('article')).toHaveClass('custom-class');
  });
});
```

### Integration Tests
```typescript
// ✅ Good - API integration testing
import { fetchArticle } from '@/lib/api';

describe('API Integration', () => {
  it('fetches article successfully', async () => {
    const result = await fetchArticle('test-article-id');
    
    expect(result.status).toBe(200);
    expect(result.data).toBeDefined();
    expect(result.data.id).toBe('test-article-id');
  });

  it('handles API errors gracefully', async () => {
    const result = await fetchArticle('non-existent-article');
    
    expect(result.status).toBe(404);
    expect(result.error).toBeDefined();
    expect(result.data).toBeNull();
  });
});
```

## Error Handling

### Component Error Handling
```typescript
// ✅ Good - Error boundary implementation
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handling
```typescript
// ✅ Good - Comprehensive error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 500, 'INTERNAL_ERROR');
  }

  return new ApiError('Unknown error occurred', 500, 'UNKNOWN_ERROR');
};
```

## Performance Standards

### React Performance
```typescript
// ✅ Good - Optimized component
const ArticleList = React.memo<ArticleListProps>(({ articles, onArticleClick }) => {
  const handleArticleClick = useCallback((id: string) => {
    onArticleClick(id);
  }, [onArticleClick]);

  const sortedArticles = useMemo(() => {
    return articles.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [articles]);

  return (
    <div className="article-list">
      {sortedArticles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onReadMore={handleArticleClick}
        />
      ))}
    </div>
  );
});

// ❌ Bad - Unoptimized component
const ArticleList = ({ articles, onArticleClick }) => {
  return (
    <div>
      {articles.sort((a, b) => new Date(b.date) - new Date(a.date)).map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onReadMore={(id) => onArticleClick(id)}
        />
      ))}
    </div>
  );
};
```

### Image Optimization
```typescript
// ✅ Good - Optimized images
import Image from 'next/image';

const OptimizedImage = ({ src, alt, ...props }) => (
  <Image
    src={src}
    alt={alt}
    width={800}
    height={600}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
    {...props}
  />
);
```

## Security Standards

### Input Validation
```typescript
// ✅ Good - Input validation with Zod
import { z } from 'zod';

const ArticleSchema = z.object({
  title: z.string().min(1).max(200),
  perex: z.string().min(1).max(500),
  content: z.string().min(1),
  category: z.enum(['discovery', 'explanation', 'community', 'kids']),
  imageUrl: z.string().url(),
  date: z.string().datetime()
});

export const validateArticle = (data: unknown): Article => {
  return ArticleSchema.parse(data);
};
```

### XSS Prevention
```typescript
// ✅ Good - Safe HTML rendering
import DOMPurify from 'dompurify';

const SafeHTML = ({ content }: { content: string }) => {
  const sanitizedContent = DOMPurify.sanitize(content);
  
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};
```

## Documentation Standards

### JSDoc Comments
```typescript
/**
 * Fetches an article by its ID from the API
 * @param id - The unique identifier of the article
 * @returns Promise resolving to API response with article data
 * @throws {ApiError} When the article is not found or API request fails
 * @example
 * ```typescript
 * const article = await fetchArticle('article-123');
 * console.log(article.title);
 * ```
 */
export const fetchArticle = async (id: string): Promise<ApiResponse<Article>> => {
  // Implementation
};
```

### README Standards
```markdown
# Component Name

Brief description of what this component does.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| article | Article | Yes | Article data object |
| onReadMore | (id: string) => void | Yes | Callback when read more is clicked |
| className | string | No | Additional CSS classes |

## Usage

```typescript
import { ArticleCard } from './ArticleCard';

<ArticleCard 
  article={articleData}
  onReadMore={(id) => navigate(`/article/${id}`)}
  className="custom-styling"
/>
```

## Testing

Run tests with:
```bash
npm test ArticleCard
```
```

## Git Standards

### Commit Messages
```
feat: add article search functionality
fix: resolve image loading issue on mobile
docs: update API documentation
style: format code with prettier
refactor: extract article validation logic
test: add unit tests for ArticleCard component
chore: update dependencies
```

### Branch Naming
```
feature/article-search
bugfix/image-loading-mobile
hotfix/security-patch
chore/update-dependencies
```

## Code Review Checklist

- [ ] Code follows TypeScript strict mode
- [ ] All functions and components have proper typing
- [ ] Error handling is implemented
- [ ] Tests are written and passing
- [ ] Performance optimizations are applied where needed
- [ ] Security considerations are addressed
- [ ] Documentation is updated
- [ ] Code is formatted and linted
- [ ] No console.log statements in production code
- [ ] Accessibility standards are met
