import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface MassMessage {
  id: string;
  account_id: string;
  message_type: "mass" | "ppv" | "prompt";
  message_text: string;
  scheduled_date: string;
  scheduled_time: string;
  status: "pending" | "sent" | "cancelled";
  created_at: string;
}

const accountNames = {
  ashley: "Ashley",
  willow: "Willow", 
  izzie: "Izzie"
};

export default function MassMessageSchedule() {
  const [messages, setMessages] = useState<MassMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string>("ashley");
  const [newMessage, setNewMessage] = useState({
    message_type: "mass" as const,
    message_text: "",
    scheduled_date: "",
    scheduled_time: ""
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from("mass_messages")
        .select("*")
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Failed to fetch mass messages:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addMessage() {
    if (!newMessage.message_text || !newMessage.scheduled_date || !newMessage.scheduled_time) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const { error } = await supabase
        .from("mass_messages")
        .insert({
          account_id: selectedAccount,
          message_type: newMessage.message_type,
          message_text: newMessage.message_text,
          scheduled_date: newMessage.scheduled_date,
          scheduled_time: newMessage.scheduled_time,
          status: "pending"
        });

      if (error) throw error;

      setNewMessage({
        message_type: "mass",
        message_text: "",
        scheduled_date: "",
        scheduled_time: ""
      });

      fetchMessages();
    } catch (error) {
      console.error("Failed to add message:", error);
      alert("Failed to add message");
    }
  }

  async function deleteMessage(id: string) {
    try {
      const { error } = await supabase
        .from("mass_messages")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  }

  const messagesByAccount = messages.reduce((acc, msg) => {
    if (!acc[msg.account_id]) acc[msg.account_id] = [];
    acc[msg.account_id].push(msg);
    return acc;
  }, {} as Record<string, MassMessage[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule New Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Account</label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="ashley">Ashley</option>
                <option value="willow">Willow</option>
                <option value="izzie">Izzie</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select
                value={newMessage.message_type}
                onChange={(e) => setNewMessage({ ...newMessage, message_type: e.target.value as any })}
                className="w-full p-2 border rounded"
              >
                <option value="mass">Mass Message</option>
                <option value="ppv">PPV</option>
                <option value="prompt">Prompt</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={newMessage.message_text}
              onChange={(e) => setNewMessage({ ...newMessage, message_text: e.target.value })}
              placeholder="Enter message text..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={newMessage.scheduled_date}
                onChange={(e) => setNewMessage({ ...newMessage, scheduled_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Time</label>
              <Input
                type="time"
                value={newMessage.scheduled_time}
                onChange={(e) => setNewMessage({ ...newMessage, scheduled_time: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={addMessage} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Message
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {Object.entries(accountNames).map(([accountId, accountName]) => (
          <Card key={accountId}>
            <CardHeader>
              <CardTitle>{accountName} - Scheduled Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {!messagesByAccount[accountId] || messagesByAccount[accountId].length === 0 ? (
                <p className="text-muted-foreground text-sm">No messages scheduled</p>
              ) : (
                <div className="space-y-3">
                  {messagesByAccount[accountId].map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3 border rounded flex justify-between items-start gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {msg.message_type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(msg.scheduled_date), "MMM d, yyyy")} at {msg.scheduled_time}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            msg.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            msg.status === "sent" ? "bg-green-100 text-green-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {msg.status}
                          </span>
                        </div>
                        <p className="text-sm">{msg.message_text}</p>
                      </div>
                      {msg.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMessage(msg.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
