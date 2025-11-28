
import React, { useState, useCallback, useEffect } from 'react';
import type { Player, Team, Round, TournamentState } from './types';
import PlayerRegistration from './components/PlayerRegistration';
import TournamentBracket from './components/TournamentBracket';
import TeamList from './components/TeamList';
import { TrophyIcon } from './components/icons/TrophyIcon';
import { TrashIcon } from './components/icons/TrashIcon';
import { PlusIcon } from './components/icons/PlusIcon';


const LOCAL_STORAGE_KEY = 'kicker-tournaments';

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [tournamentState, setTournamentState] = useState<TournamentState>('REGISTRATION');
  const [winner, setWinner] = useState<Team | null>(null);
  
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [savedTournaments, setSavedTournaments] = useState<Record<string, any>>({});
  const [showHistory, setShowHistory] = useState(false);

  const loadAllTournaments = useCallback(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : {};
    } catch (error) {
      console.error("Failed to load tournaments from localStorage", error);
      return {};
    }
  }, []);

  useEffect(() => {
    const allTournaments = loadAllTournaments();
    setSavedTournaments(allTournaments);
  }, [loadAllTournaments]);
  
  useEffect(() => {
    const allTournaments = loadAllTournaments();

    if (tournamentId && players.length === 0 && allTournaments[tournamentId]) {
        delete allTournaments[tournamentId];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allTournaments));
        setSavedTournaments(allTournaments);
        return;
    }

    if (!tournamentId || players.length === 0) {
        return;
    }

    const currentState = { players, teams, rounds, tournamentState, winner };
    const newTournaments = { ...allTournaments, [tournamentId]: currentState };
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTournaments));
    
    if (JSON.stringify(newTournaments) !== JSON.stringify(savedTournaments)) {
      setSavedTournaments(newTournaments);
    }
  }, [players, teams, rounds, tournamentState, winner, tournamentId, savedTournaments, loadAllTournaments]);


  const addPlayer = (name: string, skill: number) => {
    if (!tournamentId) {
        setTournamentId(new Date().toISOString());
    }
    setPlayers(prev => [...prev, { id: crypto.randomUUID(), name, skill }]);
  };

  const removePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const startNewTournament = (confirm = false) => {
    if (confirm && players.length > 0 && tournamentState !== 'FINISHED' && !window.confirm("Möchten Sie das aktuelle Turnier wirklich abbrechen und ein neues starten?")) {
        return;
    }

    setPlayers([]);
    setTeams([]);
    setRounds([]);
    setWinner(null);
    setTournamentState('REGISTRATION');
    setTournamentId(null);
  };
  
  const deleteTournament = (idToDelete: string) => {
    if (!window.confirm("Möchten Sie dieses Turnier wirklich löschen?")) {
        return;
    }

    const allTournaments = loadAllTournaments();
    delete allTournaments[idToDelete];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allTournaments));
    setSavedTournaments(allTournaments);

    if (tournamentId === idToDelete) {
        startNewTournament();
    }
  };

  const generateTeamsAndBracket = useCallback(() => {
    if (players.length < 4 || players.length % 2 !== 0) {
      alert("Bitte eine gerade Anzahl von mindestens 4 Spielern hinzufügen.");
      return;
    }

    const sortedPlayers = [...players].sort((a, b) => b.skill - a.skill);
    const generatedTeams: Team[] = [];
    
    for (let i = 0; i < sortedPlayers.length / 2; i++) {
      const playerA = sortedPlayers[i];
      const playerB = sortedPlayers[sortedPlayers.length - 1 - i];
      generatedTeams.push({
        id: crypto.randomUUID(),
        name: `Team ${i + 1}`,
        players: [playerA, playerB],
        skill: playerA.skill + playerB.skill,
      });
    }

    const seededTeams = generatedTeams
      .sort((a, b) => b.skill - a.skill)
      .map((team, index) => ({ ...team, seed: index + 1 }));
    setTeams(seededTeams);

    const numTeams = seededTeams.length;
    const bracketSize = 2 ** Math.ceil(Math.log2(numTeams));
    const totalRounds = Math.log2(bracketSize);
    
    const getSeedingOrder = (size: number): number[] => {
        if (size <= 1) return [0];
        if (size === 2) return [0, 1];
        const prevOrder = getSeedingOrder(size / 2);
        const nextOrder: number[] = [];
        for (const seed of prevOrder) {
            nextOrder.push(seed);
            nextOrder.push(size - 1 - seed);
        }
        return nextOrder;
    };
    
    const seedingOrder = getSeedingOrder(bracketSize);

    const initialRound: Round = [];
    for (let i = 0; i < bracketSize; i += 2) {
        const teamAIndex = seedingOrder[i];
        const teamBIndex = seedingOrder[i+1];
        
        const teamA = seededTeams[teamAIndex] || null;
        const teamB = seededTeams[teamBIndex] || null;
        
        const isBye = !teamA || !teamB;
        const byeWinner = teamA || teamB;

        initialRound.push({
            id: crypto.randomUUID(),
            teamA: teamA,
            teamB: teamB,
            scoreA: null,
            scoreB: null,
            winner: isBye ? byeWinner : null,
            isBye: isBye
        });
    }

    const allRounds: Round[] = [initialRound];

    for (let i = 1; i < totalRounds; i++) {
        const numMatches = bracketSize / (2 ** (i + 1));
        const round: Round = [];
        for (let j = 0; j < numMatches; j++) {
            round.push({
                id: crypto.randomUUID(),
                teamA: null,
                teamB: null,
                scoreA: null,
                scoreB: null,
                winner: null,
                isBye: false
            });
        }
        allRounds.push(round);
    }
    
    const populatedRounds = [...allRounds];
    // This logic advances bye winners to the next round immediately
    for (let r = 0; r < totalRounds - 1; r++) {
        const round = populatedRounds[r];
        const nextRound = populatedRounds[r+1];
        for (let m = 0; m < round.length; m++) {
            if (round[m].isBye) {
                const winner = round[m].winner;
                const nextMatchIndex = Math.floor(m / 2);
                if (m % 2 === 0) {
                    nextRound[nextMatchIndex].teamA = winner;
                } else {
                    nextRound[nextMatchIndex].teamB = winner;
                }
            }
        }
    }
    
    setRounds(populatedRounds);
    setTournamentState('TEAMS_VIEW');
  }, [players]);

  const updateMatchResult = (roundIndex: number, matchIndex: number, scoreA: number, scoreB: number) => {
    const newRounds = [...rounds];
    const match = newRounds[roundIndex][matchIndex];
    
    if (!match.teamA || !match.teamB) return;

    match.scoreA = scoreA;
    match.scoreB = scoreB;
    match.winner = scoreA > scoreB ? match.teamA : match.teamB;

    if (roundIndex < newRounds.length - 1) {
        const nextRoundIndex = roundIndex + 1;
        const nextMatchIndex = Math.floor(matchIndex / 2);
        if (matchIndex % 2 === 0) {
            newRounds[nextRoundIndex][nextMatchIndex].teamA = match.winner;
        } else {
            newRounds[nextRoundIndex][nextMatchIndex].teamB = match.winner;
        }
    } else {
        setWinner(match.winner);
        setTournamentState('FINISHED');
    }

    setRounds(newRounds);
  };
  
  const loadTournament = useCallback((id: string) => {
    const tournamentToLoad = savedTournaments[id];
    if (tournamentToLoad) {
        setPlayers(tournamentToLoad.players || []);
        setTeams(tournamentToLoad.teams || []);
        setRounds(tournamentToLoad.rounds || []);
        setTournamentState(tournamentToLoad.tournamentState || 'REGISTRATION');
        setWinner(tournamentToLoad.winner || null);
        setTournamentId(id);
        setShowHistory(false);
    }
  }, [savedTournaments]);

  const renderContent = () => {
    switch (tournamentState) {
      case 'REGISTRATION':
        return <PlayerRegistration players={players} addPlayer={addPlayer} removePlayer={removePlayer} generateTournament={generateTeamsAndBracket} />;
      case 'TEAMS_VIEW':
        return <TeamList teams={teams} startTournament={() => setTournamentState('IN_PROGRESS')} />;
      case 'IN_PROGRESS':
        return <TournamentBracket rounds={rounds} updateMatchResult={updateMatchResult} />;
      case 'FINISHED':
        return (
          <div className="text-center p-8">
            <h2 className="text-4xl font-bold text-yellow-400 mb-4">Turnier beendet!</h2>
            <div className="bg-gray-800 rounded-lg p-6 inline-flex flex-col items-center shadow-lg">
                <TrophyIcon className="w-24 h-24 text-yellow-400 mb-4"/>
                <p className="text-2xl text-gray-300">Der Sieger ist</p>
                <p className="text-5xl font-extrabold text-white mt-2 mb-4">{winner?.name}</p>
                <p className="text-xl text-gray-400">{winner?.players.map(p => p.name).join(' & ')}</p>
            </div>
            <button onClick={() => startNewTournament()} className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md">
                Neues Turnier starten
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-7xl mb-8 text-center sm:flex sm:justify-between sm:items-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-4 sm:mb-0">
          Kicker Turnier Planer
        </h1>
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => startNewTournament(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Neues Turnier
          </button>
          <div className="relative">
            {Object.keys(savedTournaments).length > 0 && (
              <>
                <button 
                  onClick={() => setShowHistory(prev => !prev)} 
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  Verlauf
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${showHistory ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {showHistory && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
                    <ul className="max-h-96 overflow-y-auto">
                      {Object.keys(savedTournaments)
                        .sort((a, b) => b.localeCompare(a))
                        .map(id => {
                          const tournament = savedTournaments[id];
                          if (!tournament.players || tournament.players.length === 0) return null;
                          return (
                              <li key={id} className="border-b border-gray-700 last:border-b-0 group flex items-center">
                                <button
                                  onClick={() => loadTournament(id)}
                                  className="flex-grow text-left px-4 py-3 hover:bg-indigo-500/10 transition-colors"
                                >
                                  <p className="font-semibold text-indigo-300">{new Date(id).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })} Uhr</p>
                                  <p className="text-sm text-gray-400">
                                    {tournament.winner ? `Sieger: ${tournament.winner.name}` : `${tournament.players.length} Spieler`}
                                  </p>
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteTournament(id); }}
                                  className="p-2 mr-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                  aria-label="Turnier löschen"
                                >
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                              </li>
                          )
                        })
                      }
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>
      <main className="w-full max-w-7xl">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;