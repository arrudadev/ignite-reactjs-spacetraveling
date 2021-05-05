import { GetStaticPaths, GetStaticProps } from 'next';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: string;
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Header />

      <section className={styles.banner}>
        <img src={post.data.banner.url} alt="Banner" />
      </section>

      <main className={`${commonStyles.container} ${styles.main}`}>
        <h1>{post.data.title}</h1>

        <div className={styles.info}>
          <div>
            <FiCalendar width={20} height={20} />
            <time>{post.first_publication_date}</time>
          </div>

          <div>
            <FiUser width={20} height={20} />
            <span>{post.data.author}</span>
          </div>

          <div>
            <FiClock width={20} height={20} />
            <span>4 min</span>
          </div>
        </div>

        <article>
          {post.data.content.map((content, index) => (
            <section key={index}>
              <h2>{content.heading}</h2>

              <div
                className={styles.postContent}
                dangerouslySetInnerHTML={{ __html: content.body }}
              />
            </section>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
    }
  );

  const paths = postsResponse.results.map(post => {
    return { params: { slug: post.uid } };
  });

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: format(
      parseISO(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      banner: response.data.banner,
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: RichText.asHtml(content.body),
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 24, // 24 hours
  };
};
