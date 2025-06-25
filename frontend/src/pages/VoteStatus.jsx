import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import { CheckCircle, Clock } from 'lucide-react';

const VoteStatus = () => {
  const { user, token } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const votedCandidate = user?.hasVoted
    ? candidates.find(candidate => candidate._id === user.votedFor)
    : null;

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/candidates', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCandidates(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch candidates');
      } finally {
        setLoading(false);
      }
    };

    if (user?.hasVoted) {
      fetchCandidates();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-center text-gray-600 mt-10">Loading vote status...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Vote Status</h1>
          <p className="text-gray-600">View your voting status and selection</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4 mb-6">
            {user?.hasVoted ? (
              <>
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Vote Successfully Cast</h2>
                  <p className="text-gray-600">Your vote has been recorded</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-yellow-100 rounded-full p-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Vote Pending</h2>
                  <p className="text-gray-600">You haven't cast your vote yet</p>
                </div>
              </>
            )}
          </div>

          {user?.hasVoted && votedCandidate ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-md font-medium text-gray-900 mb-3">Your Selection</h3>
              <div className="flex items-center space-x-4">
                <img
                  src={votedCandidate.image}
                  alt={votedCandidate.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{votedCandidate.name}</h4>
                  <p className="text-blue-600 font-medium">{votedCandidate.party}</p>
                  <p className="text-sm text-gray-600 mt-1">{votedCandidate.description}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-4">You haven't cast your vote yet.</p>
              <a
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View Candidates
              </a>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{user?.aadharCardNumber}</p>
                <p className="text-sm text-gray-600">Aadhar Number</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{user?.hasVoted ? 'Yes' : 'No'}</p>
                <p className="text-sm text-gray-600">Voted</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">2024</p>
                <p className="text-sm text-gray-600">Election Year</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm text-center mt-4">{error}</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VoteStatus;
