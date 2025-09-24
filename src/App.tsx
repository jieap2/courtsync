import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, CheckCircle, AlertCircle, Plus, RotateCcw, Trophy, DollarSign, Trash2, RefreshCw } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  bookingCount: number;
  lastBooked: string | null;
  active: boolean;
}

interface Slot {
  time: string;
  booker: string;
  status: 'pending' | 'confirmed' | 'upcoming';
  court: string;
}

interface Booking {
  bookers: string[];
  slots: Slot[];
}

interface ScheduleWeek {
  week: string;
  weekDisplay: string;
  weekNumber: number;
  bookers: string[];
}

const App = () => {
  // Load initial data from localStorage or use defaults
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('courtsync-players');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default players (can be removed by users)
    return [
      { id: 1, name: 'Arun', bookingCount: 0, lastBooked: null, active: true },
      { id: 2, name: 'Gowtham', bookingCount: 0, lastBooked: null, active: true },
      { id: 3, name: 'Santhosh', bookingCount: 0, lastBooked: null, active: true },
      { id: 4, name: 'Avinash', bookingCount: 0, lastBooked: null, active: true },
      { id: 5, name: 'Jithin', bookingCount: 0, lastBooked: null, active: true },
      { id: 6, name: 'Sai Manoj', bookingCount: 0, lastBooked: null, active: true },
      { id: 7, name: 'Siddharth', bookingCount: 0, lastBooked: null, active: true },
      { id: 8, name: 'Michael', bookingCount: 0, lastBooked: null, active: true },
      { id: 9, name: 'PK', bookingCount: 0, lastBooked: null, active: true }
    ];
  });
  
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [currentWeekIndex, setCurrentWeekIndex] = useState<number>(0);

  // Generate week date ranges starting from current week
  const getCurrentWeekNumber = (): number => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  };

  const getWeekDateRange = (weekIndex: number): { weekNumber: number; dateRange: string } => {
    const currentWeekNumber = getCurrentWeekNumber();
    const targetWeekNumber = currentWeekNumber + weekIndex;
    
    // Calculate the date for the start of the target week
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay; // Days to get to Monday of current week
    
    const mondayOfCurrentWeek = new Date(now);
    mondayOfCurrentWeek.setDate(now.getDate() + daysToMonday);
    
    const mondayOfTargetWeek = new Date(mondayOfCurrentWeek);
    mondayOfTargetWeek.setDate(mondayOfCurrentWeek.getDate() + (weekIndex * 7));
    
    const sundayOfTargetWeek = new Date(mondayOfTargetWeek);
    sundayOfTargetWeek.setDate(mondayOfTargetWeek.getDate() + 6);
    
    const formatDate = (date: Date): string => {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day}`;
    };
    
    return {
      weekNumber: targetWeekNumber,
      dateRange: `${formatDate(mondayOfTargetWeek)} - ${formatDate(sundayOfTargetWeek)}`
    };
  };

  // Dynamic schedule generation based on current active players
  const generateScheduleTemplate = (activePlayers: Player[]): ScheduleWeek[] => {
    if (activePlayers.length < 2) return [];
    
    const playerNames = activePlayers.map(p => p.name);
    const scheduleTemplate: ScheduleWeek[] = [];
    const totalWeeks = Math.max(12, playerNames.length * 2); // At least 12 weeks or enough for fair rotation
    
    // Create pairs ensuring everyone gets roughly equal bookings
    let playerIndex = 0;
    for (let week = 0; week < totalWeeks; week++) {
      const weekInfo = getWeekDateRange(week);
      const bookers: string[] = [];
      
      // Select 2 players for this week, cycling through the list
      for (let slot = 0; slot < 2; slot++) {
        bookers.push(playerNames[playerIndex % playerNames.length]);
        playerIndex++;
      }
      
      scheduleTemplate.push({
        week: `Week ${weekInfo.weekNumber}`,
        weekDisplay: `Week ${weekInfo.weekNumber} (${weekInfo.dateRange})`,
        weekNumber: weekInfo.weekNumber,
        bookers: bookers
      });
    }
    
    return scheduleTemplate;
  };

  // Generate schedule based on current active players
  const activePlayers = players.filter(p => p.active);
  const scheduleTemplate = generateScheduleTemplate(activePlayers);
  const currentWeekInfo = scheduleTemplate.length > 0 ? scheduleTemplate[currentWeekIndex] : null;

  const [bookings, setBookings] = useState<Record<string, Booking>>(() => {
    const saved = localStorage.getItem('courtsync-bookings');
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Generate initial bookings based on current schedule
    const initialBookings: Record<string, Booking> = {};
    const currentSchedule = generateScheduleTemplate(activePlayers);
    currentSchedule.forEach((schedule, index) => {
      const isCurrentWeek = index === 0;
      initialBookings[schedule.week] = {
        bookers: schedule.bookers,
        slots: [
          { 
            time: '7:00-8:00 PM', 
            booker: schedule.bookers[0] || 'TBD', 
            status: isCurrentWeek ? 'pending' : 'upcoming',
            court: 'Court A' 
          },
          { 
            time: '8:00-9:00 PM', 
            booker: schedule.bookers[1] || 'TBD', 
            status: isCurrentWeek ? 'pending' : 'upcoming',
            court: 'Court A' 
          }
        ]
      };
    });
    return initialBookings;
  });

  // Save to localStorage whenever players or bookings change
  useEffect(() => {
    localStorage.setItem('courtsync-players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('courtsync-bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Regenerate bookings when players change
  useEffect(() => {
    if (activePlayers.length >= 2) {
      const newSchedule = generateScheduleTemplate(activePlayers);
      const updatedBookings: Record<string, Booking> = {};
      
      newSchedule.forEach((schedule, index) => {
        const existingBooking = bookings[schedule.week];
        const isCurrentWeek = index === currentWeekIndex;
        
        updatedBookings[schedule.week] = {
          bookers: schedule.bookers,
          slots: [
            { 
              time: '7:00-8:00 PM', 
              booker: schedule.bookers[0] || 'TBD', 
              status: existingBooking?.slots[0]?.status || (isCurrentWeek ? 'pending' : 'upcoming'),
              court: 'Court A' 
            },
            { 
              time: '8:00-9:00 PM', 
              booker: schedule.bookers[1] || 'TBD', 
              status: existingBooking?.slots[1]?.status || (isCurrentWeek ? 'pending' : 'upcoming'),
              court: 'Court A' 
            }
          ]
        };
      });
      
      setBookings(updatedBookings);
    }
  }, [players, currentWeekIndex, bookings]);

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer: Player = {
        id: Math.max(...players.map(p => p.id), 0) + 1,
        name: newPlayerName.trim(),
        bookingCount: 0,
        lastBooked: null,
        active: true
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (playerId: number) => {
    setPlayers(prev => prev.map(player => 
      player.id === playerId ? { ...player, active: false } : player
    ));
  };

  const removeAllPlayers = () => {
    const confirmed = window.confirm('This will remove all players and reset the schedule. Are you sure?');
    if (confirmed) {
      setPlayers([]);
      localStorage.removeItem('courtsync-players');
      localStorage.removeItem('courtsync-bookings');
      setCurrentWeekIndex(0);
    }
  };

  const startFresh = () => {
    const confirmed = window.confirm('This will clear all data and start completely fresh. Are you sure?');
    if (confirmed) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const resetSchedule = () => {
    const confirmed = window.confirm('This will reset all bookings and generate a new schedule. Are you sure?');
    if (confirmed) {
      // Reset all booking counts
      setPlayers(prev => prev.map(player => ({
        ...player,
        bookingCount: 0,
        lastBooked: null
      })));
      
      // Reset current week to current week index
      setCurrentWeekIndex(0);
      
      // Clear localStorage
      localStorage.removeItem('courtsync-bookings');
    }
  };

  const confirmBooking = (bookerName: string, slotIndex: number) => {
    const currentWeekKey = currentWeekInfo ? currentWeekInfo.week : `Week ${getCurrentWeekNumber()}`;
    setBookings(prev => ({
      ...prev,
      [currentWeekKey]: {
        ...prev[currentWeekKey],
        slots: prev[currentWeekKey].slots.map((slot, idx) => 
          idx === slotIndex ? { ...slot, status: 'confirmed' as const } : slot
        )
      }
    }));
    
    // Update player booking count
    setPlayers(prev => prev.map(player => 
      player.name === bookerName 
        ? { ...player, bookingCount: player.bookingCount + 1, lastBooked: new Date().toISOString().split('T')[0] }
        : player
    ));
  };

  const getNextBookers = (): Player[] => {
    const nextWeekIndex = currentWeekIndex + 1;
    if (nextWeekIndex < scheduleTemplate.length) {
      const nextWeekSchedule = scheduleTemplate[nextWeekIndex];
      return activePlayers.filter(p => nextWeekSchedule.bookers.includes(p.name));
    }
    return [];
  };

  const nextBookers = getNextBookers();
  const currentWeekKey = currentWeekInfo ? currentWeekInfo.week : `Week ${getCurrentWeekNumber()}`;
  const currentBooking = bookings[currentWeekKey];

  // Calculate fairness statistics
  const totalBookings = players.reduce((sum, p) => sum + p.bookingCount, 0);
  const bookingVariance = activePlayers.length > 0 ? 
    Math.max(...activePlayers.map(p => p.bookingCount)) - Math.min(...activePlayers.map(p => p.bookingCount)) : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl font-bold text-gray-800">CourtSync</h1>
        </div>
        <p className="text-gray-600">Dynamic badminton court booking for any group size</p>
        <div className="mt-2 text-sm text-gray-500">
          Active Players: {activePlayers.length} | Schedule: {scheduleTemplate.length} weeks
        </div>
      </div>

      {activePlayers.length < 2 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Need More Players</h3>
          <p className="text-yellow-700">Add at least 2 active players to generate the booking schedule.</p>
        </div>
      ) : (
        <>
          {/* Current Week Booking */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                {currentWeekInfo?.weekDisplay || `Week ${getCurrentWeekNumber()} (${getWeekDateRange(0).dateRange})`}
              </h2>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                This Week's Bookers
              </span>
            </div>
            
            {currentBooking && (
              <div className="grid md:grid-cols-2 gap-4">
                {currentBooking.slots.map((slot, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-gray-800">{slot.time}</div>
                        <div className="text-sm text-gray-600">{slot.court}</div>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        slot.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {slot.status === 'confirmed' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {slot.status}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-600">{slot.booker}</span>
                      {slot.status === 'pending' && (
                        <button 
                          onClick={() => confirmBooking(slot.booker, idx)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          Confirm Booking
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next Week Preview */}
          {nextBookers.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-purple-500" />
                Next Week's Rotation
              </h3>
              <div className="flex gap-4">
                {nextBookers.map((player, idx) => (
                  <div key={player.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex-1">
                    <div className="font-medium text-purple-800">{player.name}</div>
                    <div className="text-sm text-purple-600">
                      Bookings: {player.bookingCount} | 
                      Last: {player.lastBooked ? new Date(player.lastBooked).toLocaleDateString() : 'Never'}
                    </div>
                    <div className="text-xs text-purple-500 mt-1">
                      Slot {idx + 1}: {idx === 0 ? '7:00-8:00 PM' : '8:00-9:00 PM'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fair Schedule Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Dynamic Rotation Schedule ({scheduleTemplate.length} weeks)
              </h3>
              <button
                onClick={resetSchedule}
                className="flex items-center gap-2 bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Schedule
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <strong>🎯 Fair Rotation:</strong> Every {activePlayers.length} weeks = {activePlayers.length * 2} slots → Each player books exactly 2 times
            </div>
            
            <div className="grid gap-2 max-h-80 overflow-y-auto">
              {scheduleTemplate.slice(0, 12).map((schedule, index) => {
                const isCurrentWeek = index === currentWeekIndex;
                
                return (
                  <div key={schedule.week} className={`border rounded-lg p-3 flex justify-between items-center ${
                    isCurrentWeek ? 'border-blue-500 bg-blue-50' : 'bg-white'
                  }`}>
                    <div>
                      <span className="font-medium text-gray-800">{schedule.weekDisplay}</span>
                      {isCurrentWeek && <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Current</span>}
                    </div>
                    
                    <div className="flex gap-2">
                      {schedule.bookers.map((booker, idx) => (
                        <span key={idx} className={`px-3 py-1 rounded text-sm font-medium ${
                          isCurrentWeek ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {booker}
                        </span>
                      ))}
                      <span className="text-gray-500 text-sm ml-2">480 kr</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Fairness Summary */}
            <div className="mt-4 grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {bookingVariance === 0 ? '100%' : `${Math.max(0, 100 - (bookingVariance * 20))}%`}
                </div>
                <div className="text-sm text-green-600">Fair Distribution</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{activePlayers.length}</div>
                <div className="text-sm text-blue-600">Week Cycle</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-purple-600">2 each</div>
                <div className="text-sm text-purple-600">Bookings per Cycle</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Players Management */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-500" />
            Team Management ({activePlayers.length} active)
          </h3>
          <div className="flex gap-2">
            <button
              onClick={removeAllPlayers}
              className="bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Remove All
            </button>
            <button
              onClick={startFresh}
              className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Start Fresh
            </button>
          </div>
        </div>
        
        {/* Add Player */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Add new team member name..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
          />
          <button
            onClick={addPlayer}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Player
          </button>
        </div>

        {/* Players Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activePlayers.map((player) => (
            <div key={player.id} className="border rounded-lg p-3 bg-gray-50 relative">
              <div className="font-medium text-gray-800 pr-8">{player.name}</div>
              <div className="text-sm text-gray-600 mt-1">
                <div>Bookings: {player.bookingCount}</div>
                <div>Last booked: {player.lastBooked ? new Date(player.lastBooked).toLocaleDateString() : 'Never'}</div>
              </div>
              <div className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${
                nextBookers.some(nb => nb.id === player.id) 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {nextBookers.some(nb => nb.id === player.id) ? 'Next up!' : 'In rotation'}
              </div>
              <button
                onClick={() => removePlayer(player.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
                title="Remove player"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        
        {activePlayers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No active players. Add team members to get started!</p>
            <p className="text-sm mt-2">Use "Start Fresh" to clear any cached data and begin with a clean slate.</p>
          </div>
        )}
      </div>

      {/* Fairness Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-500" />
          Group Statistics & Fairness
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {totalBookings}
            </div>
            <div className="text-sm text-blue-600">Total Bookings</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {(totalBookings * 240)} kr
            </div>
            <div className="text-sm text-green-600">Total Court Costs</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {bookingVariance}
            </div>
            <div className="text-sm text-orange-600">Booking Variance</div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>🎯 Every {activePlayers.length} weeks, each player books exactly 2 times</p>
          <p>💰 Cost per person per cycle ({activePlayers.length} weeks): {activePlayers.length > 0 ? (activePlayers.length * 480 / activePlayers.length).toFixed(0) : 0} kr</p>
          <p>🏸 Weekly cost: 480 kr (240 kr/hour × 2 hours)</p>
        </div>
      </div>
    </div>
  );
};

export default App;
