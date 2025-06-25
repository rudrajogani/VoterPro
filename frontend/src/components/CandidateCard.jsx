import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Vote } from 'lucide-react';

const CandidateCard = ({
  candidate,
  onVote,
  showVoteButton = true,
  votedCandidateId = null
}) => {
  const { user } = useAuth();

  const hasUserVoted = !!votedCandidateId;
  const isVotedForThis = votedCandidateId === candidate._id;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="aspect-w-16 aspect-h-12">
        <img
          src={candidate.image}
          alt={candidate.name}
          className="w-full h-48 object-cover"
        />
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {candidate.name}
            </h3>
            <p className="text-sm text-blue-600 font-medium">
              {candidate.party}
            </p>
          </div>
          {isVotedForThis && (
            <CheckCircle className="h-6 w-6 text-green-500" />
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {candidate.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-900">{candidate.voteCount}</span> votes
          </div>

          {showVoteButton && onVote && (
            <button
              onClick={() => onVote(candidate._id)}
              disabled={hasUserVoted}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                hasUserVoted
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Vote className="h-4 w-4" />
              <span>{isVotedForThis ? 'Voted' : 'Vote'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;
