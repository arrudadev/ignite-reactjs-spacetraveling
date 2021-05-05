import { GetStaticProps } from 'next';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  return (
    <main className={commonStyles.container}>
      <header className={styles.header}>
        <img src="/logo.svg" alt="logo" />
      </header>

      <section className={styles['post-list']}>
        {postsPagination.results.map(post => (
          <Link href="/post/1">
            <a>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>

              <div className={styles.info}>
                <div>
                  <FiCalendar width={20} height={20} />
                  <time>{post.first_publication_date}</time>
                </div>

                <div>
                  <FiUser width={20} height={20} />
                  <span>{post.data.author}</span>
                </div>
              </div>
            </a>
          </Link>
        ))}
      </section>

      <button type="button" className={styles['load-more-posts']}>
        Carregar mais posts
      </button>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        parseISO(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: '',
      },
    },
  };
};
