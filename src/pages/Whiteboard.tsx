import { useState, useEffect } from "react";
import { Pencil, Plus, Trash2, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface WhiteboardItem {
  id: string;
  title: string;
  description: string;
  status: "goal" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
}

const Whiteboard = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<WhiteboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ title: "", description: "", status: "goal" as const });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("whiteboard_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching whiteboard items:", error);
      toast.error("Failed to load whiteboard items");
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItem.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const { error } = await supabase.from("whiteboard_items").insert([
        {
          title: newItem.title,
          description: newItem.description,
          status: newItem.status,
        },
      ]);

      if (error) throw error;

      toast.success("Item added");
      setNewItem({ title: "", description: "", status: "goal" });
      fetchItems();
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
    }
  };

  const updateItem = async (id: string, updates: Partial<WhiteboardItem>) => {
    try {
      const { error } = await supabase
        .from("whiteboard_items")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast.success("Item updated");
      fetchItems();
      setEditingId(null);
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from("whiteboard_items").delete().eq("id", id);

      if (error) throw error;

      toast.success("Item deleted");
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "goal":
        return <Clock className="h-4 w-4 text-blue-400" />;
      case "in_progress":
        return <Pencil className="h-4 w-4 text-amber-400" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      default:
        return null;
    }
  };

  const filterByStatus = (status: string) => items.filter((item) => item.status === status);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white p-8">
        <div className="max-w-7xl mx-auto">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Whiteboard</h1>
        </div>

        {/* Add New Item */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Add New Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Title"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              className="bg-gray-900/50 border-gray-700 text-white"
            />
            <Textarea
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="bg-gray-900/50 border-gray-700 text-white min-h-[100px]"
            />
            <div className="flex gap-4 items-center">
              <select
                value={newItem.status}
                onChange={(e) => setNewItem({ ...newItem, status: e.target.value as any })}
                className="bg-gray-900/50 border border-gray-700 text-white rounded px-3 py-2"
              >
                <option value="goal">Goal</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <Button onClick={addItem} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Goals */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-400" />
              Goals
            </h2>
            {filterByStatus("goal").map((item) => (
              <Card key={item.id} className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6 space-y-3">
                  {editingId === item.id ? (
                    <Input
                      defaultValue={item.title}
                      onBlur={(e) => updateItem(item.id, { title: e.target.value })}
                      className="bg-gray-900/50 border-gray-700 text-white"
                    />
                  ) : (
                    <h3 className="font-semibold text-white">{item.title}</h3>
                  )}
                  {editingId === item.id ? (
                    <Textarea
                      defaultValue={item.description}
                      onBlur={(e) => updateItem(item.id, { description: e.target.value })}
                      className="bg-gray-900/50 border-gray-700 text-white"
                    />
                  ) : (
                    <p className="text-sm text-gray-400">{item.description}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                      className="border-gray-700"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateItem(item.id, { status: "in_progress" })}
                      className="border-gray-700"
                    >
                      Start
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteItem(item.id)}
                      className="border-gray-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* In Progress */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Pencil className="h-6 w-6 text-amber-400" />
              In Progress
            </h2>
            {filterByStatus("in_progress").map((item) => (
              <Card key={item.id} className="bg-gray-800/50 border-amber-700/50">
                <CardContent className="pt-6 space-y-3">
                  {editingId === item.id ? (
                    <Input
                      defaultValue={item.title}
                      onBlur={(e) => updateItem(item.id, { title: e.target.value })}
                      className="bg-gray-900/50 border-gray-700 text-white"
                    />
                  ) : (
                    <h3 className="font-semibold text-white">{item.title}</h3>
                  )}
                  {editingId === item.id ? (
                    <Textarea
                      defaultValue={item.description}
                      onBlur={(e) => updateItem(item.id, { description: e.target.value })}
                      className="bg-gray-900/50 border-gray-700 text-white"
                    />
                  ) : (
                    <p className="text-sm text-gray-400">{item.description}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                      className="border-gray-700"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateItem(item.id, { status: "completed" })}
                      className="border-gray-700"
                    >
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteItem(item.id)}
                      className="border-gray-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Completed */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              Completed
            </h2>
            {filterByStatus("completed").map((item) => (
              <Card key={item.id} className="bg-gray-800/50 border-emerald-700/50 opacity-75">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="font-semibold text-white line-through">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateItem(item.id, { status: "goal" })}
                      className="border-gray-700"
                    >
                      Reopen
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteItem(item.id)}
                      className="border-gray-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
