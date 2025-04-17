import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core';
import { 
  Calendar, 
  CalendarClock, 
  Plus, 
  Clock, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  AlertTriangle,
  PlusCircle,
  Calendar as CalendarIcon
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  start: string;
  description?: string;
  location?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  allDay?: boolean;
}

const Timeline = () => {
  // Dark blue color palette variables
  const colors = {
    darkBlue1: '#0A1929', // Darkest blue
    darkBlue2: '#11294D', // Dark blue
    darkBlue3: '#1A3A6E', // Medium blue
    darkBlue4: '#2E4E8F', // Lighter accent blue
    lightAccent: '#4C9FE6', // Light blue accent
  };

  const [newEvent, setNewEvent] = useState<Event>({ 
    id: '', 
    title: '', 
    start: '',
    description: '',
    location: '',
    backgroundColor: `${colors.darkBlue4}D9`, // 85% opacity
    borderColor: colors.lightAccent,
    textColor: '#FFFFFF',
    allDay: false
  });
  
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const calendarRef = useRef(null);
  const queryClient = useQueryClient();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const mockEvents: Event[] = [
    { 
      id: '1', 
      title: 'Wedding Ceremony', 
      start: '2025-04-16T14:00:00',
      description: 'Main wedding ceremony at the chapel',
      location: 'St. Mary\'s Chapel',
      backgroundColor: `${colors.darkBlue4}D9`,
      borderColor: colors.lightAccent,
      textColor: '#FFFFFF'
    },
    { 
      id: '2', 
      title: 'Vendor Setup', 
      start: '2025-04-16T10:00:00',
      description: 'Vendors arrival and setup time',
      location: 'Reception Hall',
      backgroundColor: `${colors.darkBlue3}D9`,
      borderColor: colors.lightAccent,
      textColor: '#FFFFFF'
    },
    { 
      id: '3', 
      title: 'Wedding Reception', 
      start: '2025-04-16T17:30:00',
      description: 'Reception and dinner with all guests',
      location: 'Grand Ballroom',
      backgroundColor: `${colors.lightAccent}D9`,
      borderColor: colors.darkBlue4,
      textColor: '#FFFFFF'
    }
  ];
  const {
    data: events = mockEvents,
    isLoading,
    error,
  } = useQuery<Event[]>({
    queryKey: ['timeline'],
    queryFn: async () => {
      const response = await api.get('/timeline');
      return response.data;
    },
    enabled: false, // For demo purposes
  });

  const addEventMutation = useMutation({
    mutationFn: (event: Omit<Event, 'id'>) =>
      api.post('/timeline', event),
    onSuccess: (_, event) => {
      const newId = Date.now().toString();
      queryClient.setQueryData(['timeline'], (old: Event[] | undefined) => [
        ...(old || []),
        { 
          id: newId,
          ...event,
        },
      ]);
      toast.success('Event added successfully!', {
        description: `"${event.title}" has been added to your timeline.`,
        icon: <Check className="h-5 w-5 text-green-500" />,
      });
      setNewEvent({ 
        id: '', 
        title: '', 
        start: '',
        description: '',
        location: '',
        backgroundColor: `${colors.darkBlue4}D9`,
        borderColor: colors.lightAccent,
        textColor: '#FFFFFF',
        allDay: false
      });
      setIsAddEventOpen(false);
    },
    onError: () => toast.error('Failed to add event.', {
      description: 'Please check the information and try again.',
      icon: <X className="h-5 w-5 text-red-500" />,
    }),
  });

  const updateEventMutation = useMutation({
    mutationFn: (event: Event) =>
      api.put(`/timeline/${event.id}`, event),
    onSuccess: (_, event) => {
      queryClient.setQueryData(['timeline'], (old: Event[] | undefined) =>
        (old || []).map(e => e.id === event.id ? event : e)
      );
      toast.success('Event updated successfully!', {
        description: `Changes to "${event.title}" have been saved.`,
        icon: <Check className="h-5 w-5 text-green-500" />,
      });
      setEditingEvent(null);
    },
    onError: () => toast.error('Failed to update event.', {
      description: 'Please try again or check your connection.',
      icon: <X className="h-5 w-5 text-red-500" />,
    }),
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/timeline/${id}`),
    onSuccess: (_, id) => {
      queryClient.setQueryData(['timeline'], (old: Event[] | undefined) =>
        (old || []).filter((e) => e.id !== id)
      );
      toast.success('Event removed successfully!', {
        description: 'The event has been deleted from your timeline.',
        icon: <Check className="h-5 w-5 text-green-500" />,
      });
    },
    onError: () => toast.error('Failed to remove event.', {
      description: 'Please try again or check your connection.',
      icon: <X className="h-5 w-5 text-red-500" />,
    }),
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.title && newEvent.start) {
      const eventToAdd = { ...newEvent };
      delete eventToAdd.id; // Remove id for creation
      addEventMutation.mutate(eventToAdd);
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
      setEditingEvent(event);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.startStr);
    setNewEvent(prev => ({
      ...prev,
      start: selectInfo.startStr
    }));
    setIsAddEventOpen(true);
  };

  // Format events for FullCalendar
  const formattedEvents = events.map(event => ({
    ...event,
    backgroundColor: event.backgroundColor || `${colors.darkBlue4}D9`,
    borderColor: event.borderColor || colors.lightAccent,
    textColor: event.textColor || '#FFFFFF',
  }));
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.darkBlue1} 0%, ${colors.darkBlue2} 100%)` }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="relative w-16 h-16 mb-4">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
            }}
            className="w-full h-full rounded-full border-t-2 border-r-2 border-blue-400"
          ></motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-blue-400 text-2xl">T</span>
          </div>
        </div>
        <p className="text-blue-100/80">Loading your timeline...</p>
      </motion.div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.darkBlue1} 0%, ${colors.darkBlue2} 100%)` }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl max-w-md text-center"
        style={{ background: `linear-gradient(135deg, rgba(42, 67, 101, 0.4) 0%, rgba(26, 41, 64, 0.4) 100%)` }}
      >
        <div className="mb-4 text-red-400 flex justify-center">
          <AlertTriangle className="h-12 w-12" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Timeline</h3>
        <p className="text-blue-100/70 mb-6">We couldn't load your timeline data. Please try again later.</p>
        <Button 
          className="w-full rounded-xl py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </motion.div>
    </div>
  );

  // Custom styles for FullCalendar
  const calendarStyles = `
    .fc {
      --fc-border-color: rgba(255, 255, 255, 0.1);
      --fc-button-text-color: #fff;
      --fc-button-bg-color: ${colors.darkBlue3};
      --fc-button-border-color: ${colors.darkBlue3};
      --fc-button-hover-bg-color: ${colors.darkBlue4};
      --fc-button-hover-border-color: ${colors.lightAccent};
      --fc-button-active-bg-color: ${colors.darkBlue4};
      --fc-button-active-border-color: ${colors.lightAccent};
      --fc-event-bg-color: ${colors.darkBlue4};
      --fc-event-border-color: ${colors.lightAccent};
      --fc-event-text-color: #fff;
      --fc-page-bg-color: transparent;
      --fc-neutral-bg-color: rgba(255, 255, 255, 0.05);
      --fc-neutral-text-color: rgba(255, 255, 255, 0.7);
      --fc-today-bg-color: rgba(76, 159, 230, 0.1);
    }
    
    .fc .fc-toolbar-title {
      color: white;
      font-size: 1.5rem;
    }
    
    .fc .fc-col-header-cell-cushion,
    .fc .fc-daygrid-day-number {
      color: rgba(255, 255, 255, 0.9);
    }
    
    .fc .fc-timegrid-slot-label {
      color: rgba(255, 255, 255, 0.7);
    }
    
    .fc-theme-standard td, .fc-theme-standard th {
      border-color: rgba(255, 255, 255, 0.1);
    }
    
    .fc .fc-button {
      border-radius: 9999px;
      padding: 0.375rem 0.75rem;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .fc .fc-button:focus {
      box-shadow: 0 0 0 2px rgba(76, 159, 230, 0.5);
    }
    
    .fc .fc-event {
      border-radius: 0.5rem;
      padding: 0.125rem 0.25rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .fc .fc-event:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .fc .fc-view-harness {
      background: rgba(10, 25, 41, 0.3);
      backdrop-filter: blur(8px);
      border-radius: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  `;

  return (
    <div className="min-h-screen pt-20 p-6 relative overflow-hidden" style={{
      background: `linear-gradient(135deg, ${colors.darkBlue1} 0%, ${colors.darkBlue2} 100%)`
    }}>
      <style>{calendarStyles}</style>
      <Toaster richColors position="top-right" />
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-8"
          initial={{ opacity: 0.04 }}
          animate={{
            opacity: [0.04, 0.06, 0.04],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: `radial-gradient(circle, ${colors.darkBlue4} 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        ></motion.div>
        <motion.div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-8"
          initial={{ opacity: 0.04 }}
          animate={{
            opacity: [0.04, 0.07, 0.04],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          style={{
            background: `radial-gradient(circle, ${colors.lightAccent} 0%, transparent 70%)`,
            filter: 'blur(70px)',
          }}
        ></motion.div>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto relative z-10 space-y-8"
      >
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <motion.h2 
              className="text-xl font-medium text-blue-100/80"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Wedding Planning
            </motion.h2>
            <motion.h1 
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Event Timeline
            </motion.h1>
          </div>
          
          <motion.div 
            variants={itemVariants}
            className="flex gap-3 items-center"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10 text-blue-100/90 text-sm flex items-center gap-2">
              <Calendar size={16} className="text-blue-300" />
              <span>April 16, 2025</span>
            </div>
            
            <Button 
              variant="blue" 
              size="sm" 
              className="rounded-full gap-2"
              onClick={() => setIsAddEventOpen(true)}
            >
              <PlusCircle size={16} className='text-white' />
              <span className='text-white'>Add Event</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Main Timeline Card */}
        <motion.div variants={itemVariants}>
          <Card className="backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
            }}
          >
            <CardHeader className="px-6 py-6">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <CalendarClock size={20} className="text-blue-300" />
                <span>Wedding Day Schedule</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridDay"
                  events={formattedEvents}
                  eventClick={handleEventClick}
                  dateClick={handleDateSelect}
                  select={handleDateSelect}
                  selectable={true}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                  }}
                  height="auto"
                  themeSystem="standard"
                  initialDate="2025-04-16" // Set to wedding date for demonstration
                  nowIndicator={true}
                  dayMaxEvents={true}
                  allDaySlot={true}
                  slotMinTime="08:00:00"
                  slotMaxTime="24:00:00"
                />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Add Event Dialog */}
        <AnimatePresence>
          {isAddEventOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md rounded-3xl border border-white/10 p-6 shadow-2xl backdrop-blur-xl"
                style={{
                  background: `linear-gradient(135deg, rgba(42, 67, 101, 0.9) 0%, rgba(26, 41, 64, 0.95) 100%)`,
                }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <CalendarIcon size={20} className="text-blue-300" />
                    Add New Event
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setIsAddEventOpen(false)}
                    className="rounded-full text-blue-100/60 hover:text-white hover:bg-white/10"
                  >
                    <X size={18} />
                  </Button>
                </div>
                
                <form onSubmit={handleAddEvent} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-blue-100 mb-1.5 block">
                      Event Title
                    </label>
                    <Input
                      placeholder="e.g. Wedding Ceremony"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-11 focus:border-blue-400/60 transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-blue-100 mb-1.5 block">
                      Date & Time
                    </label>
                    <Input
                      type="datetime-local"
                      value={newEvent.start}
                      onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-11 focus:border-blue-400/60 transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-blue-100 mb-1.5 block">
                      Location (Optional)
                    </label>
                    <Input
                      placeholder="e.g. St. Mary's Chapel"
                      value={newEvent.location || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-11 focus:border-blue-400/60 transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-blue-100 mb-1.5 block">
                      Description (Optional)
                    </label>
                    <Input
                      placeholder="Add any details about this event"
                      value={newEvent.description || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-11 focus:border-blue-400/60 transition-all duration-300"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="allDay"
                      checked={newEvent.allDay || false}
                      onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/40"
                    />
                    <label htmlFor="allDay" className="text-sm text-blue-100/80">
                      All-day event
                    </label>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white"
                      onClick={() => setIsAddEventOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={addEventMutation.isPending || !newEvent.title || !newEvent.start}
                      className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                      {addEventMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          </motion.div>
                          <span>Adding...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Plus size={18} />
                          <span>Add Event</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Edit Event Dialog */}
        <AnimatePresence>
          {editingEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md rounded-3xl border border-white/10 p-6 shadow-2xl backdrop-blur-xl"
                style={{
                  background: `linear-gradient(135deg, rgba(42, 67, 101, 0.9) 0%, rgba(26, 41, 64, 0.95) 100%)`,
                }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Edit size={20} className="text-blue-300" />
                    Edit Event
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setEditingEvent(null)}
                    className="rounded-full text-blue-100/60 hover:text-white hover:bg-white/10"
                  >
                    <X size={18} />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-blue-100 mb-1.5 block">
                      Event Title
                    </label>
                    <Input
                      value={editingEvent.title}
                      onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-11 focus:border-blue-400/60 transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-blue-100 mb-1.5 block">
                      Date & Time
                    </label>
                    <Input
                      type="datetime-local"
                      value={editingEvent.start}
                      onChange={(e) => setEditingEvent({ ...editingEvent, start: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-11 focus:border-blue-400/60 transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-blue-100 mb-1.5 block">
                      Location
                    </label>
                    <Input
                      value={editingEvent.location || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-11 focus:border-blue-400/60 transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-blue-100 mb-1.5 block">
                      Description
                    </label>
                    <Input
                      value={editingEvent.description || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-11 focus:border-blue-400/60 transition-all duration-300"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="editAllDay"
                      checked={editingEvent.allDay || false}
                      onChange={(e) => setEditingEvent({ ...editingEvent, allDay: e.target.checked })}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/40"
                    />
                    <label htmlFor="editAllDay" className="text-sm text-blue-100/80">
                      All-day event
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white"
                      onClick={() => setEditingEvent(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        updateEventMutation.mutate(editingEvent);
                      }}
                      disabled={updateEventMutation.isPending}
                      className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                      {updateEventMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                  
                  <Button
                    onClick={() => {
                      deleteEventMutation.mutate(editingEvent.id);
                      setEditingEvent(null);
                    }}
                    disabled={deleteEventMutation.isPending}
                    variant="destructive"
                    className="w-full mt-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  >
                    {deleteEventMutation.isPending ? 'Deleting...' : 'Delete Event'}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Timeline;
