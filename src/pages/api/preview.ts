import { NextApiRequest, NextApiResponse } from 'next';

import { Document } from '@prismicio/client/types/documents';
import { getPrismicClient } from '../../services/prismic';

function linkResolver(doc: Document): string {
  if (doc.type === 'posts') {
    return `/post/${doc.uid}`;
  }
  return '/';
}

export default async (request: NextApiRequest, response: NextApiResponse) => {
  const { token: ref, documentId } = request.query;

  const prismic = getPrismicClient(ref);

  const redirectUrl = await prismic
    .getPreviewResolver(String(ref), String(documentId))
    .resolve(linkResolver, '/');

  if (!redirectUrl) {
    return response.status(401).json({ message: 'Invalid token' });
  }

  response.setPreviewData({ ref });

  response.write(
    `<!DOCTYPE html><html><head><meta http-equiv="Refresh" content="0; url=${redirectUrl}" />
      <script>window.location.href = '${redirectUrl}'</script>
      </head>`
  );

  response.end();
};
