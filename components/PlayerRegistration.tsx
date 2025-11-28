
import React, { useState } from 'react';
import type { Player } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';


interface PlayerRegistrationProps {
  players: Player[];
  addPlayer: (name: string, skill: number) => void;
  removePlayer: (id: string) => void;
  generateTournament: () => void;
}

const skillLevels = [
    { value: 1, label: "Anfänger" },
    { value: 2, label: "Gelegentlich" },
    { value: 3, label: "Fortgeschritten" },
    { value: 4, label: "Experte" },
    { value: 5, label: "Profi" },
];

const PlayerRegistration: React.FC<PlayerRegistrationProps> = ({ players, addPlayer, removePlayer, generateTournament }) => {
  const [name, setName] = useState('');
  const [skill, setSkill] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addPlayer(name.trim(), skill);
      setName('');
      setSkill(3);
    }
  };

  const canGenerate = players.length >= 4 && players.length % 2 === 0;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-gray-800 rounded-xl shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-indigo-400">Teilnehmer hinzufügen</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name des Spielers</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Alex"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fähigkeit</label>
              <div className="flex flex-wrap gap-2">
                  {skillLevels.map(level => (
                      <button type="button" key={level.value} onClick={() => setSkill(level.value)} className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 ${skill === level.value ? 'bg-indigo-600 text-white font-semibold shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}>
                          {level.label}
                      </button>
                  ))}
              </div>
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">
              <PlusIcon className="w-5 h-5" />
              Spieler hinzufügen
            </button>
          </form>
        </div>
        
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">Gemeldete Spieler ({players.length})</h2>
          <div className="flex-grow bg-gray-900/50 rounded-lg p-3 space-y-2 overflow-y-auto max-h-80">
            {players.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Noch keine Spieler hinzugefügt.</p>
            ) : (
              players.map(player => (
                <div key={player.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-md animate-fade-in">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-white">{player.name}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < player.skill ? 'text-yellow-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => removePlayer(player.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-full transition duration-200">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-700">
        <button
          onClick={generateTournament}
          disabled={!canGenerate}
          className="w-full flex items-center justify-center gap-3 bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Teams & Spielplan generieren
          <ArrowRightIcon className="w-5 h-5" />
        </button>
        {!canGenerate && <p className="text-center text-sm text-yellow-500 mt-2">Benötigt eine gerade Anzahl von mindestens 4 Spielern.</p>}
      </div>
    </div>
  );
};

export default PlayerRegistration;
