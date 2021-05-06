import { useEffect, useRef } from 'react';

export default function Comments() {
  const commentBoxRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('src', 'https://utteranc.es/client.js');
    scriptElement.setAttribute('crossorigin', 'anonymous');
    scriptElement.setAttribute('async', 'true');
    scriptElement.setAttribute(
      'repo',
      'monteiro-alexandre/ignite-reactjs-spacetraveling'
    );
    scriptElement.setAttribute('issue-term', 'pathname');
    scriptElement.setAttribute('theme', 'github-dark');

    const styleElement = document.createElement('style');

    styleElement.appendChild(
      document.createTextNode(`
      .utterances {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
      }
    `)
    );

    commentBoxRef.current.appendChild(styleElement);
    commentBoxRef.current.appendChild(scriptElement);
  }, []);

  return <section ref={commentBoxRef} />;
}
