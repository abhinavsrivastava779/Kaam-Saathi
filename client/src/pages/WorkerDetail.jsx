import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkerById } from '../api/worker';
import WorkerCard from '../components/WorkerCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function WorkerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getWorkerById(id)
      .then((res) => setWorker(res.worker))
      .catch((err) => setError('मज़दूर की जानकारी नहीं मिल पाई।'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading message="मज़दूर का विवरण लोड हो रहा है..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-md mx-auto py-2 space-y-4">
      {worker ? (
        <WorkerCard worker={worker} />
      ) : (
        <p className="text-center text-slate-400">कोई डेटा उपलब्ध नहीं है।</p>
      )}
    </div>
  );
}
