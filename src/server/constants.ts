const documentPrefix = '/api/application/document';

export function getDocumentKey(id: string, key: 'status' | 'comment') {
  return `${documentPrefix}::${id}::${key}`;
}
