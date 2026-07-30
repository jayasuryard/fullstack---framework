import { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export const Calendar = ({ events = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };
  
  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };
  
  const getEventsForDay = (day) => {
    const dateStr = `${String(day).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;
    return events.filter(event => event.date === dateStr);
  };
  
  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const dayEvents = getEventsForDay(day);
      const hasEvents = dayEvents.length > 0;
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday(day) ? 'today' : ''} ${hasEvents ? 'has-events' : ''}`}
          title={hasEvents ? dayEvents.map(e => e.title).join(', ') : ''}
        >
          <div className="day-number">{day}</div>
          {hasEvents && (
            <div className="event-indicator">
              {dayEvents.slice(0, 2).map((event, idx) => (
                <div key={idx} className="event-dot" style={{ backgroundColor: event.color || '#3b82f6' }}></div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={previousMonth} className="calendar-nav-btn">
          <FaChevronLeft />
        </button>
        <h3 className="calendar-title">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button onClick={nextMonth} className="calendar-nav-btn">
          <FaChevronRight />
        </button>
      </div>
      
      <div className="calendar-weekdays">
        <div className="weekday">Sun</div>
        <div className="weekday">Mon</div>
        <div className="weekday">Tue</div>
        <div className="weekday">Wed</div>
        <div className="weekday">Thu</div>
        <div className="weekday">Fri</div>
        <div className="weekday">Sat</div>
      </div>
      
      <div className="calendar-grid">
        {renderCalendar()}
      </div>
      
      {events.length > 0 && (
        <div className="calendar-events-list">
          <h4 className="events-title">Upcoming Events</h4>
          <div className="events">
            {events.slice(0, 5).map((event, idx) => (
              <div key={idx} className="event-item">
                <div className="event-date">{event.date}</div>
                <div className="event-details">
                  <div className="event-title">{event.title}</div>
                  {event.description && <div className="event-description">{event.description}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <style jsx="true">{`
        .calendar-container {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .calendar-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }
        
        .calendar-nav-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          color: #6b7280;
          transition: all 0.2s;
        }
        
        .calendar-nav-btn:hover {
          background: #f3f4f6;
          color: #1f2937;
        }
        
        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .weekday {
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          padding: 8px 0;
        }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
        }
        
        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
          background: #f9fafb;
        }
        
        .calendar-day.empty {
          background: transparent;
          cursor: default;
        }
        
        .calendar-day:not(.empty):hover {
          background: #e5e7eb;
        }
        
        .calendar-day.today {
          background: #3b82f6;
          color: white;
          font-weight: 600;
        }
        
        .calendar-day.has-events {
          background: #dbeafe;
        }
        
        .calendar-day.today.has-events {
          background: #3b82f6;
        }
        
        .day-number {
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .event-indicator {
          display: flex;
          gap: 2px;
          position: absolute;
          bottom: 4px;
        }
        
        .event-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
        }
        
        .calendar-events-list {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        
        .events-title {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 12px;
        }
        
        .events {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .event-item {
          display: flex;
          gap: 12px;
          padding: 8px;
          border-radius: 4px;
          background: #f9fafb;
          transition: background 0.2s;
        }
        
        .event-item:hover {
          background: #f3f4f6;
        }
        
        .event-date {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
          white-space: nowrap;
        }
        
        .event-details {
          flex: 1;
        }
        
        .event-title {
          font-size: 13px;
          font-weight: 500;
          color: #1f2937;
        }
        
        .event-description {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
};

export default Calendar;
