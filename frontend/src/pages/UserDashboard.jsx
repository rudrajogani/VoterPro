import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import CandidateCard from '../components/CandidateCard';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { getToken } from '../utils/auth';

const UserDashboard = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [votedId, setVotedId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [candidatesRes, userRes] = await Promise.all([
          axios.get('http://localhost:5000/api/candidates', {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
          axios.get('http://localhost:5000/api/users/me', {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
        ]);

        setCandidates(candidatesRes.data);
        if (userRes.data.votedCandidateId) {
          setVotedId(userRes.data.votedCandidateId);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleVote = async (candidateId) => {
    if (votedId) {
      setNotification('You have already cast your vote!');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/users/vote',
        { candidateId },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setNotification(`Vote cast successfully for ${candidates.find(c => c._id === candidateId)?.name}!`);
      setVotedId(candidateId);
    } catch (err) {
      setNotification('Error casting vote. You may have already voted.');
    }

    const timeout = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timeout);
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-700">Loading dashboard...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Election Candidates</h1>
            <p className="text-gray-600">Choose your candidate for the upcoming election</p>
          </div>

          {votedId && (
            <div className="flex items-center space-x-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Vote Cast</span>
            </div>
          )}
        </div>

        {notification && (
          <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-md flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{notification}</span>
          </div>
        )}

        {candidates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate._id}
                candidate={candidate}
                onVote={handleVote}
                showVoteButton={!votedId}
                votedCandidateId={votedId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates available</h3>
            <p className="text-gray-600">Candidates will be displayed here once added by administrators.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
