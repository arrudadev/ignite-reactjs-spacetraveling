import { GetStaticProps } from 'next';

import { FiCalendar, FiUser } from 'react-icons/fi';

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

export default function Home() {
  return (
    <main className={commonStyles.container}>
      <header className={styles.header}>
        <img src="/logo.svg" alt="logo" />
      </header>

      <section className={styles['post-list']}>
        <a>
          <h1>Como utilizar Hooks</h1>
          <p>Pensando em sincronização em vez de ciclos de vida.</p>

          <div className={styles.info}>
            <div>
              <FiCalendar width={20} height={20} />
              <time>15 Mar 2021</time>
            </div>

            <div>
              <FiUser width={20} height={20} />
              <span>Alexandre Monteiro</span>
            </div>
          </div>
        </a>

        <a>
          <h1>Criando um app CRA do zero</h1>
          <p>
            Tudo sobre como criar a sua primeira aplicação utilizando Create
            React App.
          </p>

          <div className={styles.info}>
            <div>
              <FiCalendar width={20} height={20} />
              <time>15 Mar 2021</time>
            </div>

            <div>
              <FiUser width={20} height={20} />
              <span>Alexandre Monteiro</span>
            </div>
          </div>
        </a>
      </section>

      <button type="button" className={styles['load-more-posts']}>
        Carregar mais posts
      </button>
    </main>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
