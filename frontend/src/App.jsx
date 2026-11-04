import { useEffect, useState } from 'react';

export default function App() {
  const [total, setTotal] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/visits')
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setTotal(d.total)))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <main style={{ fontFamily: 'sans-serif', margin: '4rem auto', maxWidth: 480 }}>
      <h1>React + Node + PostgreSQL</h1>
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {!error && total === null && <p>Loading...</p>}
      {total !== null && <p>This page has been visited {total} time(s).</p>}
    </main>
  );
}
