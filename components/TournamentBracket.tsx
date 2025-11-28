
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
        <div className={`flex justify-between items-center p-3 rounded-md ${bgColor} transition-colors duration-200`}>
            <div className="flex-grow min-w-0 mr-3">
                 <div className="flex items-center gap-2">
                    {team?.seed && <span className="text-xs font-mono text-indigo-400 shrink-0 opacity-80">S{team.seed}</span>}
                    <p className={`font-bold text-sm sm:text-base ${teamNameColor} truncate`}>{team?.name || '---'}</p>
                 </div>
                 <p className="text-xs text-gray-400 truncate pl-0 sm:pl-0.5 mt-0.5">{team ? team.players.map(p => p.name).join(' & ') : ' '}</p>
            </div>
            <span className={`flex-shrink-0 px-2.5 py-1 rounded text-sm font-mono font-bold ${isWinner ? 'bg-green-500 text-white shadow-sm' : 'bg-gray-600 text-gray-200'}`}>{score ?? '-'}</span>
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
        <form onSubmit={handleSubmit} className="mt-3 flex justify-center gap-3 items-center animate-fade-in">
            <div className="flex items-center gap-1.5 bg-gray-900/50 p-1 rounded-lg border border-gray-700">
                <input 
                    type="number" 
                    value={scoreA} 
                    onChange={e => setScoreA(e.target.value)} 
                    min="0" 
                    className="w-10 sm:w-12 py-1 text-center bg-gray-800 text-white border border-gray-600 rounded focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm sm:text-base" 
                    placeholder="0"
                />
                <span className="text-gray-400 font-bold">:</span>
                <input 
                    type="number" 
                    value={scoreB} 
                    onChange={e => setScoreB(e.target.value)} 
                    min="0" 
                    className="w-10 sm:w-12 py-1 text-center bg-gray-800 text-white border border-gray-600 rounded focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm sm:text-base" 
                    placeholder="0"
                />
            </div>
            <button type="submit" className="px-3 py-1.5 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md">OK</button>
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
      {/* 
         Fluid Layout Strategy:
         - Mobile/Tablet (default): Flex-col. Rounds stack vertically. No horizontal scroll.
         - Desktop (lg): Flex-row. Rounds side-by-side. 
      */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-4 lg:items-stretch">
        {rounds.map((round, roundIndex) => (
          <div key={roundIndex} className="flex-1 flex flex-col min-w-0">
            {/* Round Title */}
            <h3 className="text-lg sm:text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4 sticky top-0 bg-gray-900/95 py-3 z-10 lg:static lg:bg-transparent lg:py-0 border-b lg:border-none border-gray-800 backdrop-blur-sm">
                {getRoundName(roundIndex, rounds.length)}
            </h3>
            
            {/* Matches Container */}
            {/* On Desktop, distribute matches evenly (justify-around) to create tree look. On mobile, just stack. */}
            <div className={`flex flex-col gap-4 px-1 sm:px-2 ${rounds.length > 0 ? 'lg:justify-around lg:h-full lg:px-0' : ''}`}>
                {round.map((match, matchIndex) => (
                  <div key={match.id} className="w-full relative group">
                    <div className="bg-gray-800 p-3 sm:p-4 rounded-xl shadow-lg border border-gray-700/50 hover:border-indigo-500/30 transition-all duration-300">
                        {match.isBye ? (
                            <div className="opacity-60 grayscale hover:grayscale-0 transition-all">
                                <MatchCardTeam team={match.winner} score={null} isWinner={true} />
                                <div className="text-center text-xs text-indigo-300/60 mt-2 font-mono uppercase tracking-widest border-t border-gray-700/50 pt-2">Freilos</div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <MatchCardTeam team={match.teamA} score={match.scoreA} isWinner={!!match.winner && match.winner.id === match.teamA?.id} />
                                    <div className="h-px bg-gray-700/50 w-full"></div>
                                    <MatchCardTeam team={match.teamB} score={match.scoreB} isWinner={!!match.winner && match.winner.id === match.teamB?.id} />
                                </div>
                                {!match.winner && match.teamA && match.teamB && (
                                    <ResultForm onSubmit={(scoreA, scoreB) => updateMatchResult(roundIndex, matchIndex, scoreA, scoreB)} />
                                )}
                            </>
                        )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentBracket;
