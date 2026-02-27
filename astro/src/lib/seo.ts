/**
 * Strip markdown formatting from text for use in meta tags.
 */
export function stripMarkdown(text: string): string {
  if (!text) {
    return '';
  }
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '') // images
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // links -> text
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // italic
    .replace(/~~(.*?)~~/g, '$1') // strikethrough
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // code
    .replace(/^#{1,6}\s+/gm, '') // headers
    .replace(/^>\s+/gm, '') // blockquotes
    .replace(/^[-*+]\s+/gm, '') // unordered lists
    .replace(/^\d+\.\s+/gm, '') // ordered lists
    .replace(/^---+$/gm, '') // horizontal rules
    .replace(/<[^>]+>/g, '') // HTML tags
    .replace(/\n{2,}/g, ' ') // collapse newlines
    .replace(/\s{2,}/g, ' ') // collapse spaces
    .trim();
}
