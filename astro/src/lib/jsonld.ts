export interface PersonSchema {
  name: string;
  url: string;
}

export interface WebSiteSchema {
  name: string;
  url: string;
  description: string;
  author: PersonSchema;
}

export interface ArticleSchema {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  author: PersonSchema;
  url: string;
  inLanguage: string;
  tags?: string[];
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export const SITE_URL = 'https://qnury.es';

const AUTHOR: PersonSchema = {
  name: 'Qnurye',
  url: SITE_URL,
};

export function generateWebSiteJsonLd(schema: Omit<WebSiteSchema, 'author'>): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: schema.name,
    url: schema.url,
    description: schema.description,
    author: {
      '@type': 'Person',
      ...AUTHOR,
    },
  });
}

export function generateArticleJsonLd(schema: Omit<ArticleSchema, 'author'>): string {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: schema.headline,
    description: schema.description,
    datePublished: schema.datePublished,
    dateModified: schema.dateModified,
    author: {
      '@type': 'Person',
      ...AUTHOR,
    },
    url: schema.url,
    inLanguage: schema.inLanguage,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': schema.url,
    },
  };
  if (schema.image) {
    data.image = schema.image;
  }
  if (schema.tags?.length) {
    data.keywords = schema.tags;
  }
  return JSON.stringify(data);
}

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}
