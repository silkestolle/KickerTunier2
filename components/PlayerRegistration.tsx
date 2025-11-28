
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
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-gray-800 rounded-xl shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <div className="order-2 md:order-1">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-indigo-400 flex items-center gap-2">
            <span>Teilnehmer</span>
            <span className="text-sm bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full font-mono">NEU</span>
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">Name des Spielers</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Alex"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-500 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fähigkeit</label>
              <div className="flex flex-wrap gap-2">
                  {skillLevels.map(level => (
                      <button 
                        type="button" 
                        key={level.value} 
                        onClick={() => setSkill(level.value)} 
                        className={`flex-grow sm:flex-grow-0 px-3 py-2 text-sm rounded-lg transition-all duration-200 border border-transparent ${skill === level.value ? 'bg-indigo-600 text-white font-semibold shadow-lg scale-105' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:border-gray-500'}`}
                      >
                          {level.label}
                      </button>
                  ))}
              </div>
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg active:scale-95">
              <PlusIcon className="w-5 h-5" />
              Spieler hinzufügen
            </button>
          </form>
        </div>
        
        <div className="flex flex-col order-1 md:order-2 h-full">
          <div className="flex justify-between items-baseline mb-4">
             <h2 className="text-xl sm:text-2xl font-bold text-purple-400">Gemeldete Spieler</h2>
             <span className="text-purple-300 bg-purple-900/30 px-2 py-0.5 rounded-md font-mono text-sm">{players.length}</span>
          </div>
          
          <div className="flex-grow bg-gray-900/50 rounded-xl p-3 space-y-2 overflow-y-auto max-h-[300px] md:max-h-[400px] custom-scrollbar border border-gray-700/50 shadow-inner">
            {players.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 py-8 opacity-60">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <p>Noch keine Spieler</p>
              </div>
            ) : (
              players.slice().reverse().map(player => (
                <div key={player.id} className="flex items-center justify-between bg-gray-700/80 p-3 rounded-lg border border-gray-600/30 hover:bg-gray-700 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                        {player.name.substring(0,2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-white truncate text-sm sm:text-base">{player.name}</p>
                        <div className="flex opacity-75 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`w-3 h-1 mx-px rounded-full ${i < player.skill ? 'bg-yellow-400' : 'bg-gray-600'}`}></div>
                          ))}
                        </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removePlayer(player.id)} 
                    className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition duration-200"
                    aria-label="Entfernen"
                  >
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
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/20 hover:scale-[1.01] hover:from-green-500 hover:to-emerald-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none disabled:text-gray-400 disabled:hover:scale-100"
        >
          <span>Teams & Spielplan generieren</span>
          <ArrowRightIcon className="w-5 h-5" />
        </button>
        {!canGenerate && (
            <div className="mt-3 text-center bg-yellow-900/20 border border-yellow-900/50 rounded-lg p-2">
                <p className="text-sm text-yellow-500 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Benötigt eine gerade Anzahl von mindestens 4 Spielern.
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default PlayerRegistration;
