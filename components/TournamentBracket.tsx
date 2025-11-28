
import React, { useState } from 'react';
import type { Round, Team } from '../types';

interface MatchCardProps {
  team: Team | null;
  score: number | null;
  isWinner: boolean;
}

const MatchCardTeam: React.FC<MatchCardProps> = ({ team, score, isWinner }) => {
    const bgColor = isWinner ? 'bg-green-600/30' : 'bg-gray-700/50';
    const teamNameColor = isWinner ? 'text-white' : 'text-gray-200';

    return (
        <div className={`flex justify-between items-center p-3 rounded ${bgColor}`}>
            <div className="flex-grow truncate mr-2">
                 <div className="flex items-baseline gap-2">
                    {team?.seed && <span className="text-xs font-mono text-indigo-400 select-none">(S{team.seed})</span>}
                    <p className={`font-bold ${teamNameColor} truncate`}>{team?.name || '---'}</p>
                 </div>
                 <p className="text-xs text-gray-400 truncate pl-2">{team ? team.players.map(p => p.name).join(' & ') : ' '}</p>
            </div>
            <span className={`flex-shrink-0 px-2 py-0.5 rounded text-sm font-semibold ${isWinner ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-200'}`}>{score ?? '-'}</span>
        </div>
    );
};


interface ResultFormProps {
    onSubmit: (scoreA: number, scoreB: number) => void;
}

const ResultForm: React.FC<ResultFormProps> = ({ onSubmit }) => {
    const [scoreA, setScoreA] = useState('');
    const [scoreB, setScoreB] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numA = parseInt(scoreA, 10);
        const numB = parseInt(scoreB, 10);
        if (!isNaN(numA) && !isNaN(numB)) {
            onSubmit(numA, numB);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="mt-2 flex gap-2 items-center">
            <input type="number" value={scoreA} onChange={e => setScoreA(e.target.value)} min="0" className="w-12 text-center bg-gray-900 border border-gray-600 rounded" />
            <span>:</span>
            <input type="number" value={scoreB} onChange={e => setScoreB(e.target.value)} min="0" className="w-12 text-center bg-gray-900 border border-gray-600 rounded" />
            <button type="submit" className="px-2 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 rounded">OK</button>
        </form>
    );
};

interface TournamentBracketProps {
  rounds: Round[];
  updateMatchResult: (roundIndex: number, matchIndex: number, scoreA: number, scoreB: number) => void;
}

const getRoundName = (roundIndex: number, totalRounds: number): string => {
    const finalRoundIndex = totalRounds - 1;
    const roundsFromFinal = finalRoundIndex - roundIndex;
    
    if (roundsFromFinal === 0) return "Finale";
    if (roundsFromFinal === 1) return "Halbfinale";
    if (roundsFromFinal === 2) return "Viertelfinale";
    if (roundsFromFinal === 3) return "Achtelfinale";
    
    const teamsCount = 2 ** (roundsFromFinal + 1);
    return `Runde der letzten ${teamsCount}`;
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({ rounds, updateMatchResult }) => {
  return (
    <div className="w-full pb-8">
      <div className="flex gap-4 sm:gap-8 overflow-x-auto p-4">
        {rounds.map((round, roundIndex) => (
          <div key={roundIndex} className="flex flex-col justify-around min-w-[280px] gap-4">
            <h3 className="text-xl font-bold text-center text-purple-400">{getRoundName(roundIndex, rounds.length)}</h3>
            {round.map((match, matchIndex) => (
              <div key={match.id} className="bg-gray-800 p-3 rounded-lg shadow-lg">
                {match.isBye ? (
                    <div>
                        <MatchCardTeam team={match.winner} score={null} isWinner={true} />
                        <div className="text-center text-sm text-gray-400 mt-2">Freilos</div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <MatchCardTeam team={match.teamA} score={match.scoreA} isWinner={!!match.winner && match.winner.id === match.teamA?.id} />
                            <MatchCardTeam team={match.teamB} score={match.scoreB} isWinner={!!match.winner && match.winner.id === match.teamB?.id} />
                        </div>
                        {!match.winner && match.teamA && match.teamB && (
                            <ResultForm onSubmit={(scoreA, scoreB) => updateMatchResult(roundIndex, matchIndex, scoreA, scoreB)} />
                        )}
                    </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentBracket;