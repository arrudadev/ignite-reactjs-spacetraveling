import { useEffect, useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { GetStaticProps } from 'next';
import Link from 'next/link';

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

function formatPosts(postsResponse: PostPagination) {
  return postsResponse.results.map(post => {
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
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<PostPagination>(postsPagination);

  useEffect(() => {
    const formattedPosts = formatPosts(postsPagination);

    setPosts({
      next_page: postsPagination.next_page,
      results: formattedPosts,
    });
  }, []);

  async function handleLoadMorePost() {
    const postsResponse: PostPagination = await fetch(`${posts.next_page}`)
      .then(response => response.json())
      .then(data => data);

    const formattedPosts = {
      next_page: postsResponse.next_page,
      results: formatPosts(postsResponse),
    };

    setPosts({
      next_page: formattedPosts.next_page,
      results: [...posts.results, ...formattedPosts.results],
    });
  }

  return (
    <main className={commonStyles.container}>
      <header className={styles.header}>
        <img src="/logo.svg" alt="logo" />
      </header>

      <section className={styles['post-list']}>
        {posts.results.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
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

      {posts.next_page && (
        <button
          type="button"
          className={styles['load-more-posts']}
          onClick={handleLoadMorePost}
        >
          Carregar mais posts
        </button>
      )}
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
      first_publication_date: post.first_publication_date,
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
        next_page: postsResponse.next_page,
      },
    },
    revalidate: 60 * 30, // 30 minutes
  };
};
