
import React from 'react';
import type { Team } from '../types';
import { UsersIcon } from './icons/UsersIcon';

interface TeamListProps {
    teams: Team[];
    startTournament: () => void;
}

const TeamList: React.FC<TeamListProps> = ({ teams, startTournament }) => {
    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-gray-800 rounded-xl shadow-2xl animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-center text-indigo-400">Generierte Teams</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team) => (
                    <div key={team.id} className="bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center mb-2">
                           <UsersIcon className="w-6 h-6 text-indigo-400 mr-3" />
                           <h3 className="text-xl font-bold text-white">{team.name}</h3>
                           {team.seed && <span className="ml-auto text-sm font-mono bg-gray-800 px-2 py-0.5 rounded text-indigo-300">Seed #{team.seed}</span>}
                        </div>
                        <div className="pl-9 space-y-1">
                          {team.players.map(player => (
                              <div key={player.id} className="flex items-center text-gray-300">
                                  <span>{player.name}</span>
                                  <div className="flex ml-auto">
                                    {[...Array(5)].map((_, i) => (
                                      <svg key={i} className={`w-4 h-4 ${i < player.skill ? 'text-yellow-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                              </div>
                          ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-center">
                <button
                    onClick={startTournament}
                    className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:bg-green-700 text-lg">
                    Turnier starten!
                </button>
            </div>
        </div>
    );
};

export default TeamList;