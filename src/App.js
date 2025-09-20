import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, CheckCircle, AlertCircle, Plus, RotateCcw, Trophy, DollarSign } from 'lucide-react';

const App = () => {
  const [players, setPlayers] = useState([
    { id: 1, name: 'Arun', bookingCount: 0, lastBooked: null, active: true },
    { id: 2, name: 'Gowtham', bookingCount: 0, lastBooked: null, active: true },
    { id: 3, name: 'Santhosh', bookingCount: 0, lastBooked: null, active: true },
    { id: 4, name: 'Avinash', bookingCount: 0, lastBooked: null, active: true },
    { id: 5, name: 'Jithin', bookingCount: 0, lastBooked: null, active: true },
    { id: 6, name: 'Sai Manoj', bookingCount: 0, lastBooked: null, active: true },
    { id: 7, name: 'Siddharth', bookingCount: 0, lastBooked: null, active: true },
    { id: 8, name: 'Michael', bookingCount: 0, lastBooked: null, active: true },
    { id: 9, name: 'PK', bookingCount: 0, lastBooked: null, active: true }
  ]);
  
  const [newPlayerName, setNewPlayerName] = useState('');
  const [currentWeek, setCurrentWeek] = useState('Week 1 (Oct 28 - Nov 3)');
  
  // Fair rotation schedule for 9 players - ensures equal distribution
  const scheduleTemplate = [
    // Cycle 1 (Weeks 1-5): Everyone books once, except one person gets 2
    { week: 'Week 1 (Oct 28 - Nov 3)', bookers: ['Arun', 'Gowtham'] },
    { week: 'Week 2 (Nov 4-10)', bookers: ['Santhosh', 'Avinash'] },
    { week: 'Week 3 (Nov 11-17)', bookers: ['Jithin', 'Sai Manoj'] },
    { week: 'Week 4 (Nov 18-24)', bookers: ['Siddharth', 'Michael'] },
    { week: 'Week 5 (Nov 25 - Dec 1)', bookers: ['PK', 'Arun'] },
    
    // Cycle 2 (Weeks 6-9): Focus on those who booked less in Cycle 1
    { week: 'Week 6 (Dec 2-8)', bookers: ['Gowtham', 'Santhosh'] },
    { week: 'Week 7 (Dec 9-15)', bookers: ['Avinash', 'Jithin'] },
    { week: 'Week 8 (Dec 16-22)', bookers: ['Sai Manoj', 'Siddharth'] },
    { week: 'Week 9 (Dec 23-29)', bookers: ['Michael', 'PK'] },
    
    // Cycle 3 continues the pattern...
    { week: 'Week 10 (Dec 30 - Jan 5)', bookers: ['Arun', 'Gowtham'] },
    { week: 'Week 11 (Jan 6-12)', bookers: ['Santhosh', 'Avinash'] },
    { week: 'Week 12 (Jan 13-19)', bookers: ['Jithin', 'Sai Manoj'] }
  ];

  const [bookings, setBookings] = useState(() => {
    const initialBookings = {};
    scheduleTemplate.forEach((schedule, index) => {
      const isCurrentWeek = schedule.week === 'Week 1 (Oct 28 - Nov 3)';
      initialBookings[schedule.week] = {
        bookers: schedule.bookers,
        slots: [
          { 
            time: '7:00-8:00 PM', 
            booker: schedule.bookers[0], 
            status: isCurrentWeek ? 'pending' : 'upcoming',
            court: 'Court A' 
          },
          { 
            time: '8:00-9:00 PM', 
            booker: schedule.bookers[1], 
            status: isCurrentWeek ? 'pending' : 'upcoming',
            court: 'Court A' 
          }
        ]
      };
    });
    return initialBookings;
  });

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer = {
        id: Math.max(...players.map(p => p.id)) + 1,
        name: newPlayerName.trim(),
        bookingCount: 0,
        lastBooked: null,
        active: true
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
    }
  };

  const confirmBooking = (bookerName, slotIndex) => {
    setBookings(prev => ({
      ...prev,
      [currentWeek]: {
        ...prev[currentWeek],
        slots: prev[currentWeek].slots.map((slot, idx) => 
          idx === slotIndex ? { ...slot, status: 'confirmed' } : slot
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

  const getNextBookers = () => {
    const nextWeekSchedule = scheduleTemplate.find(s => s.week === 'Week 2 (Nov 4-10)');
    if (nextWeekSchedule) {
      return players.filter(p => nextWeekSchedule.bookers.includes(p.name));
    }
    return [];
  };

  const nextBookers = getNextBookers();
  const currentBooking = bookings[currentWeek];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl font-bold text-gray-800">CourtSync</h1>
        </div>
        <p className="text-gray-600"> Rotation badminton court booking for groups</p>
      </div>

      {/* Current Week Booking */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Week: {currentWeek}
          </h2>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            This Week's Bookers
          </span>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {currentBooking?.slots.map((slot, idx) => (
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
      </div>

      {/* Next Week Preview */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-purple-500" />
          Next Week's Rotation (Week 2: Nov 4-10)
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

      {/* Fair Schedule Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" />
          Fair Rotation Schedule (12 weeks shown)
        </h3>
        
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <strong>🎯 Perfect Fairness:</strong> Every 9 weeks = 18 slots → Each player books exactly 2 times
        </div>
        
        <div className="grid gap-2 max-h-80 overflow-y-auto">
          {scheduleTemplate.map((schedule, index) => {
            const booking = bookings[schedule.week];
            const isCurrentWeek = schedule.week === currentWeek;
            const weeksPassed = index;
            
            return (
              <div key={schedule.week} className={`border rounded-lg p-3 flex justify-between items-center ${
                isCurrentWeek ? 'border-blue-500 bg-blue-50' : 
                weeksPassed < 1 ? 'bg-gray-50' : 'bg-white'
              }`}>
                <div>
                  <span className="font-medium text-gray-800">{schedule.week}</span>
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
            <div className="text-lg font-bold text-green-600">100%</div>
            <div className="text-sm text-green-600">Fair Distribution</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-blue-600">9 weeks</div>
            <div className="text-sm text-blue-600">Complete Cycle</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-purple-600">2 each</div>
            <div className="text-sm text-purple-600">Bookings per Cycle</div>
          </div>
        </div>
      </div>

      {/* Players Management */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-500" />
          Group Members ({players.filter(p => p.active).length} active)
        </h3>
        
        {/* Add Player */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Add new player name..."
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
          {players.filter(p => p.active).map((player) => (
            <div key={player.id} className="border rounded-lg p-3 bg-gray-50">
              <div className="font-medium text-gray-800">{player.name}</div>
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
            </div>
          ))}
        </div>
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
              {players.reduce((sum, p) => sum + p.bookingCount, 0)}
            </div>
            <div className="text-sm text-blue-600">Total Bookings</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {(players.reduce((sum, p) => sum + p.bookingCount, 0) * 240)} kr
            </div>
            <div className="text-sm text-green-600">Total Court Costs</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {Math.max(...players.map(p => p.bookingCount)) - Math.min(...players.map(p => p.bookingCount))}
            </div>
            <div className="text-sm text-orange-600">Booking Variance</div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>🎯  Every 9 weeks, each player books exactly 2 times</p>
          <p>💰 Cost per person per cycle (9 weeks): {(9 * 480 / 9).toFixed(0)} kr</p>
          <p>🏸 Weekly cost: 480 kr (240 kr/hour × 2 hours)</p>
        </div>
      </div>
    </div>
  );
};

export default App;