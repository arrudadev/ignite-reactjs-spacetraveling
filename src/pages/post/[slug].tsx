import { useEffect, useState } from 'react';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import Comments from '../../components/Comments';
import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date?: string | null;
  uid: string;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PrevPost {
  existsPrevPost: boolean;
  uid: string;
  title: string;
}

interface NextPost {
  existsNextPost: boolean;
  uid: string;
  title: string;
}

interface PostProps {
  post: Post;
  prevPost?: PrevPost;
  nextPost?: NextPost;
  preview?: boolean;
}

export default function Post({ post, prevPost, nextPost, preview }: PostProps) {
  const [postFormatted, setPostFormatted] = useState(post);
  const [estimatedReadTime, setEstimatedReadTime] = useState('');

  const { isFallback } = useRouter();

  useEffect(() => {
    if (isFallback) {
      return;
    }

    const body = post.data.content.map(content => ({
      text: RichText.asHtml(content.body),
    }));

    const formatPost = {
      ...post,
      first_publication_date: post.first_publication_date
        ? format(parseISO(post.first_publication_date), 'dd MMM yyyy', {
            locale: ptBR,
          })
        : '09 Mai 2021 - Modo Preview',
      last_publication_date: post.last_publication_date
        ? format(
            parseISO(post.last_publication_date),
            `dd MMM yyyy, 'às' kk:mm`,
            { locale: ptBR }
          )
        : '09 Mai 2021 - Modo Preview',
      data: {
        ...post.data,
        content: post.data.content.map(content => ({
          heading: content.heading,
          body,
        })),
      },
    };

    setPostFormatted(formatPost);

    const numberOfWords = post.data.content.reduce((accumulator, content) => {
      const contentAsText = RichText.asText(content.body);

      const words = contentAsText.split(/\s/);

      accumulator += words.length;

      return accumulator;
    }, 0);

    const estimatedTime = Math.ceil(numberOfWords / 200);

    setEstimatedReadTime(`${estimatedTime} min`);
  }, [isFallback, post]);

  function getClassPrevNextPostContainer() {
    if (prevPost?.existsPrevPost && nextPost?.existsNextPost) {
      return styles.hasPrevNextPost;
    }

    if (prevPost?.existsPrevPost) {
      return styles.hasPrevPost;
    }

    if (nextPost?.existsNextPost) {
      return styles.hasNextPost;
    }

    return '';
  }

  return (
    <>
      {isFallback ? (
        <h1>Carregando...</h1>
      ) : (
        <>
          <Header />

          <section className={styles.banner}>
            <img src={postFormatted?.data.banner.url} alt="Banner" />
          </section>

          <main className={`${commonStyles.container} ${styles.main}`}>
            <h1>{postFormatted?.data.title}</h1>

            <div className={styles.info}>
              <div>
                <FiCalendar width={20} height={20} />
                <time>{postFormatted?.first_publication_date}</time>
              </div>

              <div>
                <FiUser width={20} height={20} />
                <span>{postFormatted?.data.author}</span>
              </div>

              <div>
                <FiClock width={20} height={20} />
                <span>{estimatedReadTime}</span>
              </div>
            </div>

            {postFormatted?.last_publication_date && (
              <section className={styles.lastPublicationDate}>
                * editado em <time>{postFormatted?.last_publication_date}</time>
              </section>
            )}

            <article>
              {postFormatted?.data.content.map((content, index) => (
                <section key={index}>
                  <h2>{content.heading}</h2>

                  <div
                    className={styles.postContent}
                    dangerouslySetInnerHTML={{
                      __html: content.body[index].text,
                    }}
                  />
                </section>
              ))}
            </article>

            <section
              className={`${
                styles.prevNextPostContainer
              } ${getClassPrevNextPostContainer()}`}
            >
              {prevPost?.existsPrevPost && (
                <Link href={`/post/${prevPost.uid}`}>
                  <a>
                    <button type="button">
                      <h3>{prevPost.title}</h3>
                      <p>Post anterior</p>
                    </button>
                  </a>
                </Link>
              )}

              {nextPost?.existsNextPost && (
                <Link href={`/post/${nextPost.uid}`}>
                  <a>
                    <button type="button">
                      <h3>{nextPost.title}</h3>
                      <p>Próximo post</p>
                    </button>
                  </a>
                </Link>
              )}
            </section>

            <Comments postUid={post.uid} />

            {preview && (
              <aside className={commonStyles.exitPreviewMode}>
                <Link href="/api/exit-preview">
                  <a>Sair do modo Preview</a>
                </Link>
              </aside>
            )}
          </main>
        </>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title'],
      pageSize: 1,
    }
  );

  const paths = postsResponse.results.map(post => {
    return { params: { slug: post.uid } };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const prevPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const nextPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date]',
    }
  );

  const post: Post = {
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  function getPrevNextPostData(currentPost, type) {
    const existsKey = type === 'prev' ? 'existsPrevPost' : 'existsNextPost';
    return {
      [existsKey]: currentPost.results_size > 0,
      title:
        currentPost.results_size > 0 ? currentPost.results[0].data.title : '',
      uid: currentPost.results_size > 0 ? currentPost.results[0].uid : '',
    };
  }

  return {
    props: {
      post,
      prevPost: getPrevNextPostData(prevPost, 'prev'),
      nextPost: getPrevNextPostData(nextPost, 'next'),
      preview,
    },
    revalidate: 60 * 60 * 24, // 24 hours
  };
};
