import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import * as signalR from '@microsoft/signalr';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface Wedding {
  id: string;
  coupleName: string;
  date: string;
  budget: number;
  tasks: { id: string; description: string; completed: boolean }[];
  vendors: { id: string; name: string; category: string }[];
}

interface Message {
  weddingId: string;
  sender: string;
  content: string;
  timestamp: string;
}

const PlannerInterface = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );
  const { role } = useSelector((state: RootState) => state.auth);

  // Fetch planner's weddings
  const {
    data: weddings = [],
    isLoading,
    error,
  } = useQuery<Wedding[]>({
    queryKey: ['planner-weddings'],
    queryFn: async () => {
      const response = await api.get('/planner/weddings');
      return response.data;
    },
    enabled: role === 'planner',
  });

  // Initialize SignalR connection
  useEffect(() => {
    if (role !== 'planner') return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/chatHub') // Replace with your ASP.NET SignalR hub URL
      .withAutomaticReconnect()
      .build();

    newConnection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch((err) => console.error('SignalR Connection Error:', err));

    newConnection.on(
      'ReceiveMessage',
      (
        weddingId: string,
        sender: string,
        content: string,
        timestamp: string
      ) => {
        setMessages((prev) => [
          ...prev,
          { weddingId, sender, content, timestamp },
        ]);
      }
    );

    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, [role]);

  const sendMessage = async (weddingId: string) => {
    if (!connection || !message.trim()) return;

    try {
      await connection.invoke('SendMessage', weddingId, 'Planner', message);
      setMessage('');
    } catch (err) {
      toast.error('Failed to send message.');
      console.error('SignalR Send Error:', err);
    }
  };

  if (role !== 'planner')
    return (
      <div className="p-6 text-center">Access restricted to planners only.</div>
    );
  if (isLoading)
    return <div className="p-6 text-center">Loading weddings...</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">Error loading weddings</div>
    );

  return (
    <div className="p-6 space-y-6">
      <Toaster richColors position="top-right" />
      <h2 className="text-2xl font-semibold">Planner Interface</h2>

      <Tabs defaultValue={weddings[0]?.id} className="space-y-4">
        <TabsList className="bg-gray-800">
          {weddings.map((wedding) => (
            <TabsTrigger
              key={wedding.id}
              value={wedding.id}
              className="text-white"
            >
              {wedding.coupleName}
            </TabsTrigger>
          ))}
        </TabsList>

        {weddings.map((wedding) => (
          <TabsContent key={wedding.id} value={wedding.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-[var(--card-bg)] border-none">
                <CardHeader>
                  <CardTitle>
                    {wedding.coupleName} -{' '}
                    {new Date(wedding.date).toLocaleDateString()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Budget</h3>
                    <p>Total: ${wedding.budget.toLocaleString()}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">Tasks</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {wedding.tasks.map((task) => (
                        <li
                          key={task.id}
                          className={
                            task.completed ? 'line-through text-gray-500' : ''
                          }
                        >
                          {task.description}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">Vendors</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {wedding.vendors.map((vendor) => (
                        <li key={vendor.id}>
                          {vendor.name} ({vendor.category})
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">Chat with Couple</h3>
                    <div className="h-64 overflow-y-auto bg-gray-800 p-4 rounded-md space-y-2">
                      {messages
                        .filter((msg) => msg.weddingId === wedding.id)
                        .map((msg, index) => (
                          <p
                            key={index}
                            className={
                              msg.sender === 'Planner'
                                ? 'text-right'
                                : 'text-left'
                            }
                          >
                            <span className="font-semibold">{msg.sender}:</span>{' '}
                            {msg.content}{' '}
                            <span className="text-xs text-gray-400">
                              ({new Date(msg.timestamp).toLocaleTimeString()})
                            </span>
                          </p>
                        ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="bg-gray-700 text-white"
                      />
                      <Button
                        onClick={() => sendMessage(wedding.id)}
                        disabled={!connection || !message.trim()}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PlannerInterface;
